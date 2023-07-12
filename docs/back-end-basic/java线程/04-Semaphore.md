# Semaphore

## 1. 概念

​		Semaphore 信号量可以用来控制同一时刻访问临界资源（共享资源）的线程数，以确保访问临界资源的线程能够正确、合理的使用公共资源。

​		在初始化Semaphore时，需要为这个许可传入一个数值，该数值表示同一时刻可以访问临界资源的最大线程数，也被称为许可集。

## 2. 功能实现

​		Semaphore是通过acquire方法获取许可证，如果获取到了，那么直接返回，否则进入阻塞状态；通过release方法释放许可证，释放的时候如果有现成因为调用acquire处于阻塞状态，将会唤醒一个线程。

## 3. 实现源码分析

### 3.1 Semaphore创建

```java

    /**
     * 创建一个非公平的许可集
     */
    public Semaphore(int permits) {
        sync = new NonfairSync(permits);
    }

    /**
     * 根据传入的fair值来创建公平的许可集或非公平的许可集
     *
     * @param permits the initial number of permits available.
     *        This value may be negative, in which case releases
     *        must occur before any acquires will be granted.
     * @param fair {@code true} if this semaphore will guarantee
     *        first-in first-out granting of permits under contention,
     *        else {@code false}
     */
    public Semaphore(int permits, boolean fair) {
        sync = fair ? new FairSync(permits) : new NonfairSync(permits);
    }
```

Semaphore跟ReentrantLock一样，提供了公平与非公平许可证的实现，Semaphone多了一个参数permits，表示创建多少个许可证，同一个时间允许多少个线程访问。

### 3.2 Semaphore 非公平许可证的实现

```java

    /**
     * NonFair version
     */
    static final class NonfairSync extends Sync {
        private static final long serialVersionUID = -2694183684443567898L;

        NonfairSync(int permits) {
            super(permits);
        }

        protected int tryAcquireShared(int acquires) {
            return nonfairTryAcquireShared(acquires);
        }
    }

 abstract static class Sync extends AbstractQueuedSynchronizer {
        Sync(int permits) {
            setState(permits);
        }
 }
```

非公平实现类NonfairSync，初始化许可证（state）的值，初始化完成后，state代表着当前信号量对象的可用许可数。

```java
 /**
   * 请求一个许可证，
   */
 public void acquire() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }
```

分析：请求一个许可证，如果当前Semaphore中存在足够的许可证，那么该方法会立即返回，否则进入阻塞，等待其他线程释放。

```java

    /**
     * 使用共享模式获取锁，该方法可以被中断
     */
    public final void acquireSharedInterruptibly(int arg)
            throws InterruptedException {
            // 判断线程是否中断，是则抛异常
        if (Thread.interrupted())
            throw new InterruptedException();
        // 尝试获取共享许可证，
        if (tryAcquireShared(arg) < 0)
        	//将当前线程加入同步队列阻塞
            doAcquireSharedInterruptibly(arg);
    }
```

该方法是AQS的内部方法，在获取同步标识时是可以响应中断操作，如果操作被中断，则抛出中断异常，否则调用tryAcquireShared方法，尝试获取一个许可数，获取成功则返回执行业务，方法结束，如果获取失败，则doAcquireSharedInterruptibly该方法，将当前线程加入同步队列阻塞。

```java

    /**
     * NonFair version
     */
    static final class NonfairSync extends Sync {
        private static final long serialVersionUID = -2694183684443567898L;

        NonfairSync(int permits) {
            super(permits);
        }

        protected int tryAcquireShared(int acquires) {
            return nonfairTryAcquireShared(acquires);
        }
    }
     abstract static class Sync extends AbstractQueuedSynchronizer {
        private static final long serialVersionUID = 1192457210091910933L;

       /**
        * 非公平的获取许可资源
        */
        final int nonfairTryAcquireShared(int acquires) {
            // 自旋死循环
            for (;;) {
               // 同步状态值（许可证数）
                int available = getState();
                // 许可证数减1
                int remaining = available - acquires;
                // 判断信号量中的可用许可数是否已小于0或者cas执行是否成功，如果设置成功，则返回当前的许可数值
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
          }
       }
```

nonfairTryAcquireShared方法中首先获取到state的值，在减去1，获得remaining，如果remaining小于0，则直接返回remaining,如果大于或等于0，则执行compareAndSetState，设置状态值，cas成功则表示获取锁成功，返回remaining的值，如果获取失败，则再次循环。

```java

    /**
     * Acquires in shared interruptible mode.
     * @param arg the acquire argument
     */
    private void doAcquireSharedInterruptibly(int arg)
        throws InterruptedException {
        // 创建一个共享节点
        final Node node = addWaiter(Node.SHARED);
        boolean failed = true;
        try {
            for (;;) {
                // 获取当前节点的前置节点
                final Node p = node.predecessor();
                if (p == head) {
                    // 如果当前节点的前驱节点为头节点，则尝试获取锁资源的许可证数
                    int r = tryAcquireShared(arg);
                    if (r >= 0) {
                        //如果许可证数大于等于0，则设置当前节点为头节点，并唤醒后继节点
                        setHeadAndPropagate(node, r);
                        p.next = null; // help GC
                        failed = false;
                        return;
                    }
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    throw new InterruptedException();
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }


    /**
     * Creates and enqueues node for current thread and given mode.
     *
     * @param mode Node.EXCLUSIVE for exclusive, Node.SHARED for shared
     * @return the new node
     */
    private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        // 将AQS的尾节点赋值给pred值，
        Node pred = tail;
        // 如果pred不为null,则表示该同步队列中存在节点
        if (pred != null) {
            // 将当前节点的前驱节点赋值为目前的尾节点上的节点
            node.prev = pred;
            // 使用cas，将当前节点替换尾节点上的节点
            if (compareAndSetTail(pred, node)) {
                // 原先尾节点上的节点的后驱节点指向当前节点。
                pred.next = node;
                return node;
            }
        }
        // 将当前节点插入队列
        enq(node);
        return node;
    }

    /**
     * Inserts node into queue, initializing if necessary. See picture above.
     * @param node the node to insert
     * @return node's predecessor
     */
    private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            // 如果当前队列为空，
            if (t == null) { // Must initialize
                // 则初始化,创建一个新的节点使用cas赋值在头节点上
                if (compareAndSetHead(new Node()))
                    // 如果成功，则将尾节点也设置为初始化节点
                    tail = head;
            } else {
                // 将当前节点的前驱节点设置为尾节点上的节点
                node.prev = t;
                // 使用cas将当前节点和尾节点上的节点进行替换
                if (compareAndSetTail(t, node)) {
                    // 成功则将尾节点上的节点的后驱节点设置为当前节点
                    t.next = node;
                    return t;
                }
            }
        }
    }


    /**
     * Sets head of queue, and checks if successor may be waiting
     * in shared mode, if so propagating if either propagate > 0 or
     * PROPAGATE status was set.
     *
     * @param node the node
     * @param propagate the return value from a tryAcquireShared
     */
    private void setHeadAndPropagate(Node node, int propagate) {
        Node h = head; // Record old head for check below
        // 设置节点为头节点
        setHead(node);
        /*
         * Try to signal next queued node if:
         *   Propagation was indicated by caller,
         *     or was recorded (as h.waitStatus either before
         *     or after setHead) by a previous operation
         *     (note: this uses sign-check of waitStatus because
         *      PROPAGATE status may transition to SIGNAL.)
         * and
         *   The next node is waiting in shared mode,
         *     or we don't know, because it appears null
         *
         * The conservatism in both of these checks may cause
         * unnecessary wake-ups, but only when there are multiple
         * racing acquires/releases, so most need signals now or soon
         * anyway.
         */
        // 如果propagate许可证数大于0或者头节点等于null或者头节点的状态小于0（signal可唤醒,PROPAGATE)
        if (propagate > 0 || h == null || h.waitStatus < 0 ||
            (h = head) == null || h.waitStatus < 0) {
            Node s = node.next;
            // 判断后继节点为null或者后继节点是共享模式
            if (s == null || s.isShared())
                // 释放共享锁，唤醒后继节点
                doReleaseShared();
        }
    }

```

tryAcquireShared方法获取锁资源成功或remaining小于0，则返回，如果大于或等于0，则获取锁资源成功，直接返回，如果小于0，则执行doAcquireSharedInterruptibly方法，将当前线程加入到队列中。

addWaiter：将当前节点封装为一个Node节点，并加入队列，如果队列中为null，则先创建一个节点，并赋值给头节点及尾节点，再将当前节点连接在新建的节点之后，并将当前节点指向尾节点；如果队列不为null,则将当前节点插入到队列的末尾，并将当前节点指向尾节点。

### 3.3 释放共享锁

```java

/**
     * 释放一次许可证
     */
public void release() {
    sync.releaseShared(1);
}

/**
     * Releases in shared mode.  Implemented by unblocking one or more
     * threads if {@link #tryReleaseShared} returns true.
     *
     * @param arg the release argument.  This value is conveyed to
     *        {@link #tryReleaseShared} but is otherwise uninterpreted
     *        and can represent anything you like.
     * @return the value returned from {@link #tryReleaseShared}
     */
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

 
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        // 当前的许可证数+1
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        // 使用cas将修改后的许可证数赋值给state
        if (compareAndSetState(current, next))
            return true;
    }
}

```

```
/**
 * 共享锁的释放动作
 */
private void doReleaseShared() {
    /*
     * 唤醒后继
     */
    for (;;) {
        Node h = head;
        // 判断头节点
        if (h != null && h != tail) {
            // 如果头节点不等于null，且头节点不等于尾节点（当只有一个节点时，头节点等于尾节点）
            int ws = h.waitStatus;
            // 如果该节点的状态为待唤醒
            if (ws == Node.SIGNAL) {
            	// 将该节点的等待状态设置为0
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                   // 不成功则继续
                    continue;            // loop to recheck cases
                 // 成功则唤醒头节点的后继节点
                unparkSuccessor(h);
            }
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                     // 如果等待状态等于0，且设置为共享状态不成功，则继续循环
                continue;                // loop on failed CAS
        }
        if (h == head)                   // loop if head changed
            break;
    }
}
```

