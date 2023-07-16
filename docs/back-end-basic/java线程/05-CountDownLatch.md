# CountDownLatch

## 1. 简介

​		CountDownLatch是一个同步协助类，允许一个或多个线程等待，直到其他线程完成操作集。CountDownLatch使用给定的计数值（count）初始化。await方法会阻塞直到当前的计数值（count）由于countDown方法的调用达到0，count为0之后所有的等待线程都会被释放，并且随后对await方法的调用都会立即返回。

## 2. 使用

​	CountDownLatch有两种用法：

   			1. 多等一：初始化count=1,多条线程await()阻塞，一条线程调用countDown()唤醒所有阻塞线程。
   			2. 一等多：初始化count=n,多线程countDown()对count进行减一，一条线程await()阻塞，当count=0时阻塞的线程开始执行。

多等一示例：

```java
public class CountDownLatchTest{
    public static viod mian(String[] args){
        final CountDownLatch countDownLatch = new CountDownLatch(1);
        for (int i = 1; i <= 3; i++) {
            new Thread(() -> {
                try {
                    System.out.println("线程：" + Thread.currentThread().getName()
                    + "....阻塞等待！");
                    countDownLatch.await();
                    // 可以在此处调用需要并发测试的方法或接口
                    System.out.println("线程：" + Thread.currentThread().getName()
                    + "....开始执行！");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }, "T" + i).start();
        }
        Thread.sleep(1000);
        countDownLatch.countDown();
    }
}
```

一等多示例：

```java
public class CountDownLatchTest{
    public static viod mian(String[] args){
        final CountDownLatch countDownLatch = new CountDownLatch(3);
        Map data = new HashMap();
        for (int i = 1; i <= 3; i++) {
            final int page = i;
            new Thread(() -> {
                System.out.println("线程：" + Thread.currentThread().getName() +
                        "....读取分段数据："+(page-1)*200+"-"+page*200+"行");
                // 数据加入结果集：data.put();
                countDownLatch.countDown();
            }, "T" + i).start();
        }
        countDownLatch.await();
        System.out.println("线程：" + Thread.currentThread().getName() 
                + "....对数据集：data进行处理");
    }
}
```

多等一使用场景：当我们要模拟并发时， 可以使用多等一，同时开始调用某个接口，

一等多使用场景：多个任务存在前后依赖关系，如对多个接口数据的聚合，多段读取数据后合并等。