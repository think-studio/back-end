# ReentrantLock

## 1. Lock的介绍

```java

    /**
     * 加锁：如果锁资源空闲可用，则获取锁资源
     *      如果不可用，则阻塞等待，不断竞争锁资源，直到获取到锁
     */
    void lock();

    /**
     * 释放锁：当前线程执行完业务后将锁资源的状态由占用改为可用并通知阻塞线程。
     */
    void unlock();

    /**
     * 获取锁：与lock方法不同的在于可响应中断操作，即在获取锁过程中可中断
     		  如果当前锁资源可用，则获取锁返回，
     		  如果当前锁资源不可用，则阻塞直至出现如下两种情况
     		  	  1. 当前线程获取到锁资源。
     		  	  2. 接收到中断命令，当前线程中断获取锁操作
     */
    void lockInterruptibly() throws InterruptedException;

    /**
     * 非阻塞式获取锁：尝试非阻塞式获取锁，调用该方法获取锁立即返回获取结果
     				如果获取到了锁，则返回true,反之返回false
     */
    boolean tryLock();

    /**
     * 非阻塞式获取锁： 根据传入的时间获取锁，如果线程在该时间段内未获取到锁返回flase。
     *               如果当前线程在该时间段内获取到了锁并未被中断则返回true。
     */
    boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
```

ReentrantLock实现了Lock接口，故也拥有相关的特性。

## 2. ReentrantLock

```java
public class ReentrantLock implements Lock, java.io.Serializable {
	 /** Synchronizer providing all implementation mechanics */
    private final Sync sync;


    /**
     * 创建一个非公平锁实例
     */
    public ReentrantLock() {
        sync = new NonfairSync();
    }

    /**
     *  根据参数来创建实例，传入的true，则创建公平锁实例，传入的false，则创建非公平锁实例
     */
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
    
     /**
     * 释放锁
     */
    public void unlock() {
        sync.release(1);
    }
    
     /**
     * 返回一个条件队列
     *
     * @return the Condition object
     */
    public Condition newCondition() {
        return sync.newCondition();
    }
}

```

NonfairSync和FairSync都继承了Sync，Sync实现了AQS（抽象队列同步器），来实现的非公平锁与公平锁。

### 2.1 AQS基本介绍

AQS的关键属性：

```
public abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer{
// 指向同步队列的头部
private transient volatile Node head;
// 指向同步队列的尾部
private transient volatile Node tail;
// 同步状态标识
private volatile int state;
}
```

state:同步状态标识，当状态标识为0时，代表着当前没有线程占用锁资源；当状态标志=0，则代表已有线程占用了锁资源，如果状态标志大于0，则代表着占用锁资源的线程重入过多次，解锁时也需要同样的解锁多次。

head为同步队列（CLH）的头部，但需要注意点head节点为空，不存储信息，而tail指向同步队列的尾部。AQS中同步队列（CLH）采用这种方式构建双向链表结构，方便队列 进行增删操作。

Node节点：是对每个 等待获取锁的线程的封装体。其中包含了当前执行的线程及线程的状态，如是否阻塞、是否处于等待唤醒、是否中断等。每个Node都有一个前驱节点prev以及后继节点next,这样可以更方便持有锁的线程释放后能快速执行下一个正在等待的线程。

Node节点的示意图：

![AQS_Node](D:\GitHub\think-studio\back-end\docs\.vuepress\public\assets\img\threads\AQS_Node.png)

Node源码：

```java
static final class Node {
    // 共享模式
    static final Node SHARED = new Node();
    // 独占模式
    static final Node EXCLUSIVE = null;
    // 标识线程已处于结束状态
    static final int CANCELLED =  1;
    // 等待被唤醒状态
    static final int SIGNAL    = -1;
    // Condition条件状态
    static final int CONDITION = -2;
    // 在共享模式中使用表示获得的同步状态会被传播
    static final int PROPAGATE = -3;

    // 等待状态,存在CANCELLED、SIGNAL、CONDITION、PROPAGATE四种
    volatile int waitStatus;

    // 同步队列中前驱结点
    volatile Node prev;

    // 同步队列中后继结点
    volatile Node next;

    // 获取锁资源的线程
    volatile Thread thread;

    // 等待队列中的后继结点（与Condition有关，稍后会分析）
    Node nextWaiter;

    // 判断是否为共享模式
    final boolean isShared() {
        return nextWaiter == SHARED;
    }
    // 获取前驱结点
    final Node predecessor() throws NullPointerException {
        Node p = prev;
        if (p == null)
            throw new NullPointerException();
        else
            return p;
    }
}
```

SHARED：共享模式，即允许多个线程同时对一个锁资源进行操作，例如：信号量Semaphore、读锁ReadLock等采用的就是基于AQS的共享模式实现的。

EXCLUSIVE：独占模式，即同一时刻只运行一个线程对锁资源进行操作，如ReentrantLock等组件就是基于AQS的独占锁实现。

全局变量waitStatus则代表着当前被封装成Node节点的线程的状态，分别是：

​		0 ：初始值状态，代表着节点初始化

​		CANCELLED:取消状态，waitstatus=1,在同步队列中等待的线程等待超时或被中断，需要从同步队列中取消该Node的节点，进入该状态后的节点代表着结束状态，当前节点不会再发生变化。

​		SIGNAL:信号状态，waitStatus=-1,被标识为该状态的节点，当其前驱节点的线程释放了锁资源或被取消，将会通知该节点的线程执行。通俗的讲就是被标记为该状态的节点处于等于唤醒状态，只要前驱节点释放锁，就会通知标识为SIGNAL状态的后续节点的线程执行。

​		CONDITION:条件状态，waitStatus=-2,与Condition相关，被表示为该状态的节点处于等待队列中，节点的线程等待在Condition条件，当其他线程调用了Condition的signal()方法后，CONDITION状态的节点将从等待队列转移到同步队列中，等待获取竞争锁资源。

​		PROPAGATE:传播状态，waitStatus= -3,该状态与共享模式有关，在共享模式中，被标识为该状态的节点的线程处于可运行的状态。

### 2.2 非公平锁源码分析

#### 2.2.1 加锁过程：线程1占用锁，线程2加锁

```java
 static final class NonfairSync extends Sync {
        /**
         * 非公平锁加锁
         */
        final void lock() {
            //使用cas尝试获取锁资源，获取到则将state状态改为1
            if (compareAndSetState(0, 1))
                // 设置独占锁线程持有者为本线程
                setExclusiveOwnerThread(Thread.currentThread());
            else
                // 获取不到则调用AQS获取锁方法
                acquire(1);
        }
 }
```

lock方法：1. 使用cas尝试获取锁资源，获取到则将state状态改为1，并设置独占锁线程持有者为本线程。

​					2. 获取不到则调用AQS获取锁方法。

公平锁与非公平锁的区别就体现在这儿：非公平锁加锁的第一步就是先尝试获取锁，获取不到，才会去调用AQS的获取锁逻辑。

```java

    /**
     * 使用独占模式获取锁，
     */
    public final void acquire(int arg) {
        //再次尝试获取锁，
        if (!tryAcquire(arg) &&
            // 将当前线程加入到队列中
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
```

acquire是AQS中提供的加锁方法，首先会调用tryAcquire()方法，尝试获取锁，

```java
 static final class NonfairSync extends Sync {
   protected final boolean tryAcquire(int acquires) {
            return nonfairTryAcquire(acquires);
        }
 }
 
  abstract static class Sync extends AbstractQueuedSynchronizer {
        private static final long serialVersionUID = -5179523762034025860L;


        /**
         * 非公平锁获取锁
         */
        final boolean nonfairTryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            // 判断锁资源的状态是否为0，
            if (c == 0) {
                // 是则使用cas，设置status状态为1，设置成功则获取锁
                if (compareAndSetState(0, acquires)) {
                    // 设置独占线程持有者为当前线程
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                // 如果锁资源的状态不为0，则判断独占锁线程持有者是否为当前线程
                int nextc = c + acquires;
                // 是则state加1
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }
  }
```

分析：先调用子类的tryAcquire方法，再调用子类的父类的nonfairTryAcquire()方法。

1. 尝试重新修改同步标识获取锁资源，成功则将独占锁线程设置为当前线程，并返回true.
2. 判断当前线程current是否为独占锁线程，如果是则代表着当前线程还未释放锁，属于锁重入，那么state进行加1，返回true
3. 如果都不满足，则返回false.

```java
 public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
```

如果tryAcquire()返回true，则获取锁成功，方法执行结束。如果返回false，则先addWaiter()方法。

Node是一个同步队列（CLH）:先进先出的双向链表

```java

    /**
     * 根据mode来创建对应的队列节点
     */
    private Node addWaiter(Node mode) {
        // 新建当前线程的队列节点
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        // 如果是第一个节点，则pred为null,
        // 如果不是第一个节点则直接执行cas入队操作，尝试在尾部快速添加
        if (pred != null) {
            node.prev = pred;
            // 使用cas执行尾部节点替换，尝试在尾部快速添加
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        // 如果是第一次加入或者cas操作失败，则执行enq入队操作。
        enq(node);
        return node;
    }

```

在addWaiter方法中，首先将当前线程和传入的节点类型Node.EXCLUSIVE封装成一个Node节点，然后将AQS中的全局变量tail（指向AQS内部维护的同步队列队尾的节点）赋值给了pred用于判断，如果队尾节点不为空，则代表同步队列中已经存在节点，直接尝试执行cas操作将当前封装的Node快速追加到队列尾部，如果CAS失败则执行enq(node)方法。如果tail节点为空，则代表着同步队列中还没有任何节点，那么也会执行enq(node)方法。

```java

    /**
     * Inserts node into queue, initializing if necessary. See picture above.
     * 插入节点到队列中
     * @param node the node to insert
     * @return node's predecessor
     */
    private Node enq(final Node node) {
        // 死循环
        for (;;) {
            Node t = tail;
            // 如果尾节点为空，
            if (t == null) { // Must initialize
                // 则初始化一个空对象节点，作为头节点
                if (compareAndSetHead(new Node()))
                    // 将尾节点也设置为指向头节点的节点
                    tail = head;
            } else {
                // 如果尾节点不为空，则将当前节点的前驱节点指向此时在尾节点上的节点1
                node.prev = t;
                // 使用cas操作，将尾节点替换为当前节点
                if (compareAndSetTail(t, node)) {
                    // 替换成功，则将节点1的后继节点指向当前节点
                    t.next = node;
                    return t;
                }
            }
        }
    }

```

该方法使用for(;;)进行死循环操作，第一次循环，因此时队列中还没有节点，tail为空，则初始化一个新节点，并设置为头节点。第二次循环，tail不为空，将当前节点的前驱节点设置为新节点，使用cas操作，将当前节点指向尾节点，操作成功，则将新节点的后继节点指向当前节点。

注意：存在同一时刻有多条线程一同操作，如果cas操作失败，则需要再次循环，直到修改成功。head节点本身是不存在任何数据，是个new的Node节点，它只是一个牵头节点，而tail永远指向尾部节点。

示意图：

![AQS_Node_0](D:\GitHub\think-studio\back-end\docs\.vuepress\public\assets\img\threads\AQS_Node_0.png)

当t=tail,tail为空时的执行示意图，新建的Node节点，存放再CLH队列的第一位,waitStatus为0，此时head,t，tail都是指向node节点

![AQS_Node_1](D:\GitHub\think-studio\back-end\docs\.vuepress\public\assets\img\threads\AQS_Node_1.png)

当第二次循环，tail不为空，将当前线程(线程2)的节点的前驱节点指向t(新建的node)，再将尾部节点tail指向当前线程的节点，t的后继节点指向当前线程的节点.

```java

    /**
     * Acquires in exclusive uninterruptible mode for thread already in
     * queue. Used by condition wait methods as well as acquire.
     *
     * @param node the node
     * @param arg the acquire argument
     * @return {@code true} if interrupted while waiting
     */
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                // 获取当前节点的前驱节点
                final Node p = node.predecessor();
                // 如果前驱节点是头节点，则尝试获取锁
                if (p == head && tryAcquire(arg)) {
                    // 获取锁成功，将当前线程设置为头节点，
                    setHead(node);
                    // 将原有的head节点设置为null,便于GC
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                // 如果前驱节点不是head，则判断是否阻塞挂起当前线程
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }


    /**
     * Checks and updates status for a node that failed to acquire.
     * Returns true if thread should block. This is the main signal
     * control in all acquire loops.  Requires that pred == node.prev.
     *
     * @param pred node's predecessor holding status
     * @param node the node
     * @return {@code true} if thread should block
     */
    private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        // 前驱节点的等待状态
        int ws = pred.waitStatus;
        // 如果等待状态为-1（等待唤醒），等待执行
        if (ws == Node.SIGNAL)
            /*
             * This node has already set status asking a release
             * to signal it, so it can safely park.
             */
            return true;
        if (ws > 0) {
            // 如果大于0，则该节点处于CANCELLED状态
            /*
             * Predecessor was cancelled. Skip over predecessors and
             * indicate retry.
             * 遍历前驱节点直到找到没有结束状态的节点
             */
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            // 将该前驱节点的后继节点指向当前线程
            pred.next = node;
        } else {
            /*
             * waitStatus must be 0 or PROPAGATE.  Indicate that we
             * need a signal, but don't park yet.  Caller will need to
             * retry to make sure it cannot acquire before parking.
             */
            // 设置前驱节点的状态为-1，等待唤醒
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        return false;
    }


    /**
     * Convenience method to park and then check if interrupted
     * 将当前线程挂起
     *
     * @return {@code true} if interrupted
     */
    private final boolean parkAndCheckInterrupt() {
        // 将当前线程挂起
        LockSupport.park(this);
        // 获取线程的中断状态interrupted()是判断当前中断状态，而不是中断线程，因此可能返回true,也可能返         // 回false
        return Thread.interrupted();
    }

```

当前线程的节点创建完成并放入队列中，此时执行acquireQueued()方法，传入的node就是当前线程的节点信息。

acquireQueued:当前节点的线程在死循环（自旋）执行过程中，当前节点的前驱节点为头节点时，开始尝试获取锁资源。head节点是当前占有同步状态标识的线程节点，只有当head节点释放同步状态唤醒后继节点时，后继节点才可能获取同步状态。

shouldParkAfterFailedAcquire:当前线程节点的前驱节点不是头节点或者获取锁失败，则之前该方法，将head节点或前驱节点设置为signal(-1,等待唤醒状态)，

parkAndCheckInterrupt：将当前线程挂起，即让出CPU资源

![AQS_Node_2](D:\GitHub\think-studio\back-end\docs\.vuepress\public\assets\img\threads\AQS_Node_2.png)

此时head节点的状态为-1（Signal等待 唤醒）。





#### 2.2.2 线程1释放锁

```java
ReentrantLock:
/**
 * 释放锁
 */
public void unlock() {
        sync.release(1);
    }

   /**
     *  释放独占锁
     */
    public final boolean release(int arg) {
        // 尝试释放锁
        if (tryRelease(arg)) {
            // 获取头节点
            Node h = head;
            // 头节点不为空且头节点的状态不为0，
            if (h != null && h.waitStatus != 0)
                // 则唤醒头节点的后继节点
                unparkSuccessor(h);
            return true;
        }
        return false;
    }
/**
  * 尝试释放锁
  */
 protected final boolean tryRelease(int releases) {
            // 锁状态值减一
            int c = getState() - releases;
            if (Thread.currentThread() != getExclusiveOwnerThread())
                throw new IllegalMonitorStateException();
            boolean free = false;
            // 判断锁状态是否等于0
            if (c == 0) {
                // 是则返回true
                free = true;
                // 将独占锁持有者设置为null
                setExclusiveOwnerThread(null);
            }
            // 设置锁状态
            setState(c);
            return free;
        }

       
    /**
     * Wakes up node's successor, if one exists.
     * 唤醒节点的后继者，即每次唤醒的都是头节点的后继节点
     *
     * @param node the node
     */
    private void unparkSuccessor(Node node) {
        /*
         * If status is negative (i.e., possibly needing signal) try
         * to clear in anticipation of signalling.  It is OK if this
         * fails or if status is changed by waiting thread.
         */
        int ws = node.waitStatus;
        // 头节点的等待状态
        if (ws < 0)
            // 如果等待状态小于0，则设置头节点的等待状态 为0
            compareAndSetWaitStatus(node, ws, 0);

        /*
         * Thread to unpark is held in successor, which is normally
         * just the next node.  But if cancelled or apparently null,
         * traverse backwards from tail to find the actual
         * non-cancelled successor.
         */
        // 获取头节点的后继节点
        Node s = node.next;
        // 后继节点==null 或者后继节点的等待状态大于0（即结束状态）
        if (s == null || s.waitStatus > 0) {
            
            s = null;
            for (Node t = tail; t != null && t != node; t = t.prev)
                // 获取尾节点，从尾节点开始往前查找等待状态为0或者小于0的节点，
                if (t.waitStatus <= 0)
                    s = t;
        }
        if (s != null)
            // 后继节点不为null，则调用unpack方法，唤醒线程
            LockSupport.unpark(s.thread);
    }
```

unlock:释放锁，

release：释放锁，调用tryRelease（）方法，尝试释放锁，如果锁状态为0，则返回true,如果锁状态不为0，则说明存在重入锁，此时锁状态-1

当锁状态为0，当前线程释放锁成功，则获取头节点，如果头节点不为null且头节点的等待状态不等于0，则调用unparkSuccessor()方法,

unparkSuccessor：获取头节点的等待状态，如果小于0，则设置为0；获取头节点的后继节点，如果后继节点为null或者等待状态大于0（即CANCELLED结束状态）,s设置为null，从尾节点开始往前遍历，直到节点的等待状态小于等于0，将该节点赋值给s；如果s节点不为null,则唤醒s节点的线程。

注意：为什么要从尾节点往前遍历：因为新节点永远都是指向tail尾节点，避免出现一直往后找的场景，使复杂度变高。



#### 2.2.3 线程2再次加锁

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

线程2被唤醒后，继续执行for循环，判断线程2的前置节点是否为head，如果是则继续使用tryAcquire()方法来获取锁，如果获取锁成功，则将线程二设置为head节点，然后空置之前的head节点数据，等待被GC回收。



### 2.3 公平锁

```java
static final class FairSync extends Sync {
    private static final long serialVersionUID = -3000897897090466540L;

    final void lock() {
        acquire(1);
    }

    /**
     * Fair version of tryAcquire.  Don't grant access unless
     * recursive call or no waiters or is first.
     */
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        // 判断当前锁状态是否为0，
        if (c == 0) {
            // 是，则判断队列中是否存在待处理的节点，不存在则使用cas尝试加锁
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                // 获取锁资源成功，设置独占锁线程持有者为当前线程
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            // 如果当前线程为独占锁持有者，则锁状态加1
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
AQS:
 public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
```

分析：lock方法中直接调用acquire()去获取锁，此处就与非公平锁实现不同。

tryAcquire()：判断判断锁状态是否为0，是则判断队列中是否存在待处理的节点，不存在则使用cas尝试加锁，存在则返回false，如果锁状态不为0，也是直接返回false

acquire:将当前线程封装为一个节点，加入队列中