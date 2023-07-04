module.exports = {
	title: '思考学习仓库',
	base: '/back-end/',
	shouldPrefetch: () => false,
	description: '思考学习仓库沉淀',
	themeConfig: {
		 repo: 'think-studio/back-end',	
		 repoLabel: 'Github',
		 docsDir: 'docs',
		 docsBranch: 'learn-warehouse',	
		 editLinks: true,
		 editLinkText: '欢迎来到思考学习仓库,一起沉淀知识',
		 nav: [
				{ text: '思考学习仓库', link: '/' },
				{ text: 'java基础', link: '/back-end-basic/' },
				{ text: '中间件', link: '/middleware/' },
				{ text: 'Spring框架', link: '/spring/' },
				{ text: '微服务框架', link: '/microservices/' },
				{ text: '数据库篇章', link: '/database/' }
			],
		sidebar: {
			'/back-end-basic/': [
		                {
		                    title: 'java集合',
		                    collapsable: true,
		                    children: [
						'/back-end-basic/java集合/01-ArrayList源码阅读',
						'/back-end-basic/java集合/02-LinkedList源码分析.md',
						'/back-end-basic/java集合/Vector.md',
						'/back-end-basic/java集合/ArrayDeque.md',
						'/back-end-basic/java集合/HashMap.md',
						'/back-end-basic/java集合/Hashtable.md',
						'/back-end-basic/java集合/LinkedHashMap.md',
						'/back-end-basic/java集合/WeakHashMap.md',
						'/back-end-basic/java集合/ArrayBlockingQueue.md',
						'/back-end-basic/java集合/ConcurrentHashMap.md',
						'/back-end-basic/java集合/ConcurrentLinkedDeque.md',
						'/back-end-basic/java集合/ConcurrentSkipListMap.md',
						'/back-end-basic/java集合/ConcurrentSkipListSet.md',
						'/back-end-basic/java集合/CopyOnWriteArrayList.md',
						'/back-end-basic/java集合/CopyOnWriteArraySetDelayQueue.md',
						'/back-end-basic/java集合/LinkedBlockingDeque.md',
						'/back-end-basic/java集合/LinkedBlockingQueue.md',
						'/back-end-basic/java集合/PriorityBlockingQueue.md',
		                    ]
		                }, 
						{
		                    title: 'java流',
		                    collapsable: true,
		                    children: [
						'/back-end-basic/java流/零拷贝.md',
						'/back-end-basic/java流/输入流.md',
						'/back-end-basic/java流/输出流.md',
		                    ]
		                }, 
						{
		                    title: 'java线程',
		                    collapsable: true,
		                    children: [
						'/back-end-basic/java线程/01-JMM&Volatile.md',
						'/back-end-basic/java线程/02-synchronized.md',
						'/back-end-basic/java线程/thread.md',
						'/back-end-basic/java线程/threadLocal.md',
						'/back-end-basic/java线程/Atomic系列.md',
						'/back-end-basic/java线程/AbstractQueuedSynchronizer.md',
						'/back-end-basic/java线程/ReentrantLock.md',
						'/back-end-basic/java线程/ReentrantReadWriteLock.md',
						'/back-end-basic/java线程/StampedLock.md',
						'/back-end-basic/java线程/CountDownLatch.md',
						'/back-end-basic/java线程/CyclicBarrier.md',
						'/back-end-basic/java线程/ForkJoinPool.md',
						'/back-end-basic/java线程/ThreadPoolExecutor.md',
						'/back-end-basic/java线程/cas.md',
						'/back-end-basic/java线程/CHL队列.md',
						'/back-end-basic/java线程/Disruptor.md',
						'/back-end-basic/java线程/java内存模型.md',
		                    ]
		                }, 
						{
		                    title: 'java网络',
		                    collapsable: true,
		                    children: [
						'/back-end-basic/java网络/socket.md',
						'/back-end-basic/java网络/tcp-udp.md',
						'/back-end-basic/java网络/rpc.md',
		                    ]
		                }, 
						{
		                    title: 'jvm',
		                    collapsable: true,
		                    children: [
						'/back-end-basic/jvm/jvm基础.md',
						'/back-end-basic/jvm/jvm内存结构.md',
						'/back-end-basic/jvm/jvm对象创建的过程.md',
						'/back-end-basic/jvm/类加载器.md',
						'/back-end-basic/jvm/垃圾回收.md',
						'/back-end-basic/jvm/逃逸分析、栈上分配、标量替换、同步消除 、内联.md',
						'/back-end-basic/jvm/直接内存.md',
						'/back-end-basic/jvm/jvm监控及排查.md',
		                    ]
		                }, 
			],
			'/middleware/': [
				{
					title: 'redis',
					collapsable: true,
					children: [
						'/middleware/redis/redis为什么快.md',
						'/middleware/redis/redis内存淘汰策略.md',
						'/middleware/redis/redis数据结构.md',
						'/middleware/redis/redis持久化机制和存储原理.md',
						'/middleware/redis/redis主从,集群架构.md',
						'/middleware/redis/大key问题.md',
					]
				}, 
				{
					title: 'kafka',
					collapsable: true,
					children: [
						'/middleware/kafka/kafka为什么快.md',
						'/middleware/kafka/kafka整体架构.md',
						'/middleware/kafka/kafka零拷贝策略.md',
						'/middleware/kafka/kafka生产者机制.md',
						'/middleware/kafka/kafka消费者机制.md',
						'/middleware/kafka/kafka事务.md',
						'/middleware/kafka/kafka集群同步数据机制.md',
					]
				}, 
				{
					title: 'rocketmq',
					collapsable: true,
					children: [
						'/middleware/rocketmq/rocketmq为什么快.md',
						'/middleware/rocketmq/rocketmq架构.md',
						'/middleware/rocketmq/rocketmq一致性事务.md',
					]
				}, 
				{
					title: 'ShardingJDBC',
					collapsable: true,
					children: [
						'/middleware/ShardingJDBC/ShardingJDBC原理.md',
						'/middleware/ShardingJDBC/ShardingJDBC实操.md',
						'/middleware/ShardingJDBC/ShardingJDBC带来的问题.md',
					]
				}, 
				{
					title: '分布式调度',
					collapsable: true,
					children: [
						'/middleware/分布式调度/xxl-job.md',
						'/middleware/分布式调度/elastic-job.md',
						'/middleware/分布式调度/quartz.md',
					]
				}, 
			],
			'/spring/': [
				{
					title: 'spring源码',
					collapsable: true,
					children: [
						'/spring/spring源码/spring源码阅读.md',
						'/spring/SpringBoot源码/SpringBoot源码阅读.md',
						'/spring/Spring整合第三方框架/Spring-MyBatis整合源码阅读.md',
					]
				}, 
			],
			'/microservices/': [
				{
					title: 'Eurake',
					collapsable: true,
					children: [
						'/microservices/SpringCloud走读/SpringCloud组件.md',
						'/microservices/SpringCloud走读/Eureka阅读.md',
						'/microservices/SpringCloud走读/Feign阅读.md',
						'/microservices/SpringCloudAlibaba走读/Nacos阅读.md',
						'/microservices/分布式理论/cpa理论.md',
						'/microservices/微服务理论/微服务理论.md',
					]
				}, 
			],
			'/database/':[
				{
					title: 'mysql',
					collapsable: true,
					children: [
						'/database/mysql/mysql基础.md',
						'/database/mysql/mysql锁.md',
						'/database/mysql/msyql索引.md',
						'/database/mysql/mvcc和read_view.md',
						'/database/mysql/buffer_pool.md',
						'/database/mysql/mysql三大日志.md',
						'/database/mysql/mysql主从.md',
						'/database/mysql/mysql执行一条sql过程.md',
						'/database/oltp/oltp型数据库.md',
						'/database/olap/olap分析型数据库.md',
						'/database/mpp/mpp型数据库.md',
					]
				}, 
			]
		}

	}

}