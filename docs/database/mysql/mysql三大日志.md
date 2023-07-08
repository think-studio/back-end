# mysql三大日志


## The Binary Log
The Binary Log 是我们常说的 binlog

binlog 简单的来说就是*归档日志*，是 MySQL Server 服务层面的日志，不属于存储引擎特有，记录了某个数据做了什么修改;

### 如何开启 binlog
在 MySQL8 中默认是启用 binlog 的

### binlog 有几种格式？
binlog 有三种格式
- statement
- row
- mixed

在 `MySQL5.7.7` 之前，默认的格式是 statement，在 `MySQL5.7.7` 之后，默认的格式是 row。

日志格式由参数 binlog_format 指定，查看一下的 binlog 格式：

```sql
show global variables like '%binlog_format%';
```

TODO: 这里的优缺点需要去验证是否正确

详细介绍这三种模式

statement：每一条会修改数据的 sql 语句会记录到 BinLog 中

优点：不需要记录每一行的变化，减少了 binlog 日志量，节约了 IO，从而提高了性能；

缺点：在某些情况下会导致主从数据不一致，比如执行 `sysdate()`、`sleep()` 等。

row：基于行的复制，不记录每条 sql 语句的上下文信息，仅需记录哪条数据被修改了。

优点：不会出现某些特定情况下的存储过程、function、trigger 的调用和触发无法被正确复制的问题；

缺点：会产生大量的日志，尤其是 alter table 的时候会让日志暴涨（因为这相比于 statement 的只记录一条 sql，row 格式的 binlog 会写入大量的行记录日志）

AI 给出的例子
```
+-------------+------+ 
| id | name   |
+-------------+------+
| 1  | John   |
| 2  | Mary   |
+-------------+------+

# 执行语句:UPDATE test SET name='Susan' WHERE id=2

# 二进制日志 
UPDATE test SET name='Susan' WHERE id=2 ### UPDATE test SET name='Mary' WHERE id=2
```

mixed：基于 statement 和 row 两种模式的混合复制，一般的复制使用 statement 模式保存 binlog ，对于 statement 模式无法复制的操作使用 row 模式保存 binlog。

> 新版的 MySQL 中对 row 级别也做了一些优化，当表结构发生变化的时候，会记录语句而不是逐行记录。

## binlog 与 canal
canal [kə'næl]，译意为水道/管道/沟渠，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费

canal 就要求 binlog-format 使用 row 模式

```
[mysqld]
log-bin=mysql-bin # 开启 binlog
binlog-format=ROW # 选择 ROW 模式
server_id=1 # 配置 MySQL replaction 需要定义，不要和 canal 的 slaveId 重复
```


[binlog 有几种格式？](http://duiying.vip/article/detail?id=11)