# AbstractQueuedSynchronizer

## 1. AQS基本介绍

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

​		