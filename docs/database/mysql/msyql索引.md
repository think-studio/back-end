# mysql索引

## 概念
索引用于快速查找具有特定列值的行。如果没有索引，MySQL 必须从第一行开始，然后通读整个表以找到相关的行。表越大，成本越高。如果表中有相关列的索引，MySQL 可以快速确定数据文件中要查找的位置，而无需查看所有数据。这比顺序读取每一行要快得多。

## MySQL 对这些操作使用索引

- 查找与 WHERE 条件匹配的行，如 `WHERE col1 = 1`

- 如果需要在多个索引之间进行选择 MySQL 通常使用找到最少行数的索引
这个算是 优化器的内容？
```sql
-- 这会优先使用 sim 索引
INSERT INTO gps_track  (sim,create_time) VALUES 
("10001","2022-01-01 00:00:00"),
("10001","2022-01-01 00:00:01"),
("10002","2022-01-01 00:00:00"),
("10003","2022-01-01 00:00:00"),
("10004","2022-01-01 00:00:00");

-- 这会优先使用 create_time 索引
INSERT INTO gps_track  (sim,create_time) VALUES 
("10001","2022-01-01 00:00:00"),
("10001","2022-01-01 00:00:01"),
("10002","2022-01-01 00:00:00"),
("10002","2022-01-01 00:00:02"),
("10003","2022-01-01 00:00:03");

EXPLAIN SELECT * FROM gps_track WHERE sim = '10001' AND create_time = "2022-01-01 00:00:00";
```

分别输出执行计划
```
id|select_type|table    |partitions|type       |possible_keys                            |key                                      |key_len|ref|rows|filtered|Extra                                                                               |
--+-----------+---------+----------+-----------+-----------------------------------------+-----------------------------------------+-------+---+----+--------+------------------------------------------------------------------------------------+
 1|SIMPLE     |gps_track|          |index_merge|student_create_time_IDX,gps_track_sim_IDX|gps_track_sim_IDX,student_create_time_IDX|402,5  |   |   1|    62.5|Using intersect(gps_track_sim_IDX,student_create_time_IDX); Using where; Using index|


 id|select_type|table    |partitions|type       |possible_keys                            |key                                      |key_len|ref|rows|filtered|Extra                                                                               |
--+-----------+---------+----------+-----------+-----------------------------------------+-----------------------------------------+-------+---+----+--------+------------------------------------------------------------------------------------+
 1|SIMPLE     |gps_track|          |index_merge|student_create_time_IDX,gps_track_sim_IDX|student_create_time_IDX,gps_track_sim_IDX|5,402  |   |   1|   100.0|Using intersect(student_create_time_IDX,gps_track_sim_IDX); Using where; Using index|
```

- 如果表具有多列索引，优化器可以使用索引的任何最左前缀来查找行,例如 (col1,col2,col3) 那么我们可以使用 (col1),(col1,col2),(col1,col2,col3)

- 连表查询的时候，从其他的表中检索行

- 使用 MIN() MAX() 的时候
```sql
SELECT MIN(key_part2),MAX(key_part2)
  FROM tbl_name WHERE key_part1=10;
```

- 当对表进行排序或者分组的时候，如果 排序或者分组 满足索引的最左前缀匹配原则
例如 有索引 (col1,col2) 组合索引 用 ORDER by col1,col2

- 在某些情况下，可以对查询进行优化，以便在不查询数据行的情况下检索值

```sql
CREATE TABLE t(
	col1 INT,
	col2 INT,
	col3 INT
)
```
索引为 (col1,col2)
```sql
SELECT col2 FROM student WHERE col1 = 1
```
这样就不会去查询数据行

## 索引前缀
对字符串列创建索引时，我们可以使用 col_name(N) 语法，创建仅使用该列的前 N 个字符的索引。以这种方式创建的索引文件会小得多。对于 BLOB 或 TEXT 列建立索引时，必须为索引指定前缀长度。

### 最左前缀原则（leftmost prefix）
MYSQL 的联合索引可以用于包含索引中所有列的查询语句的查询，或者是仅包含第一列，前两列，前三列，等等。如果你在索引定义中以正确的顺序指定列，那么联合索引就可以加快对同一张表的多种不同类型的查询。

### EXPLAIN 命令

### 索引合并
使用执行计划的时候看到 type = index_merge


### 索引类型
- FULLTEXT
- NORMAL
- SPATIAL
- UNIQUE

一般用的多的就是 NORMAL 和 UNIQUE

### 索引方法
- BTREE
- HASH


B 树索引特性

B 树索引可用于使用 = 、 > 、 >= 、 < 、 <= 或 BEWEEN 运算符的表达式中的列比较。如果 LIKE 的参数是一个不以通配符开头的常量字符串，那么也可以使用索引进行 LIKE 比较

使用 col_name IS NULL 的查询在 col_name 上有索引的时候也可以使用索引

> Any index that does not span all AND levels in the WHERE clause is not used to optimize the query. In other words, to be able to use an index, a prefix of the index must be used in every AND group.

> The following WHERE clauses use indexes:

```sql
... WHERE index_part1=1 AND index_part2=2 AND other_column=3

    /* index = 1 OR index = 2 */
... WHERE index=1 OR A=10 AND index=2

    /* optimized like "index_part1='hello'" */
... WHERE index_part1='hello' AND index_part3=5

    /* Can use index on index1 but not on index2 or index3 */
... WHERE index1=1 AND index2=2 OR index1=3 AND index3=3;
```

> These WHERE clauses do not use indexes:

```sql
    /* index_part1 is not used */
... WHERE index_part2=1 AND index_part3=2

    /*  Index is not used in both parts of the WHERE clause  */
... WHERE index=1 OR A=10

    /* No index spans all rows  */
... WHERE index_part1=1 OR index_part2=10
```

### EXPLAIN 执行计划
对于执行计划，参数有：

- possible_keys 字段表示可能用到的索引；
- key 字段表示实际用的索引，如果这一项为 NULL，说明没有使用索引；
- key_len 表示查询用到的索引长度（字节数），原则上长度越短越好；
	- 单列索引，那么需要将整个索引长度算进去；
	- 多列索引，不是所有列都能用到，需要计算查询中实际用到的列。
- rows 表示扫描的数据行数。
- type 表示数据扫描类型。

#### tpye: 数据扫描类型
常见扫描类型的执行效率从低到高的顺序为：
- All（全表扫描）；
- index（全索引扫描）；
- range（索引范围扫描）；
- ref（非唯一索引扫描）；
- eq_ref（唯一索引扫描）；
- const（结果只有一条的主键或唯一索引扫描）。

在这些情况里，all 是最坏的情况，因为采用了全表扫描的方式。index 和 all 差不多，只不过 index 对索引表进行全扫描，这样做的好处是不再需要对数据进行排序，但是开销依然很大。所以，要尽量避免全表扫描和全索引扫描。
range 表示采用了索引范围扫描，一般在 where 子句中使用 < 、>、in、between 等关键词，只检索给定范围的行，属于范围查找。从这一级别开始，索引的作用会越来越明显，因此我们需要尽量让 SQL 查询可以使用到 range 这一级别及以上的 type 访问方式。

ref 类型表示采用了非唯一索引，或者是唯一索引的非唯一性前缀，返回数据返回可能是多条。因为虽然使用了索引，但该索引列的值并不唯一，有重复。这样即使使用索引快速查找到了第一条数据，仍然不能停止，要进行目标值附近的小范围扫描。但它的好处是它并不需要扫全表，因为索引是有序的，即便有重复值，也是在一个非常小的范围内扫描。

eq_ref 类型是使用主键或唯一索引时产生的访问方式，通常使用在多表联查中。比如，对两张表进行联查，关联条件是两张表的 user_id 相等，且 user_id 是唯一索引，那么使用 EXPLAIN 进行执行计划查看的时候，type 就会显示 eq_ref。

const 类型表示使用了主键或者唯一索引与常量值进行比较，比如 `select name from product where id = 1`

需要说明的是 const 类型和 eq_ref 都使用了主键或唯一索引，不过这两个类型有所区别，const 是与常量进行比较，查询效率会更快，而 eq_ref 通常用于多表联查中。

#### extra: 额外信息
- Using filesort ：当查询语句中包含 group by 操作，而且无法利用索引完成排序操作的时候， 这时不得不选择相应的排序算法进行，甚至可能会通过文件排序，效率是很低的，所以要避免这种问题的出现。
- Using temporary：使了用临时表保存中间结果，MySQL 在对查询结果排序时使用临时表，常见于排序 order by 和分组查询 group by。效率低，要避免这种问题的出现。
- Using index：所需数据只需在索引即可全部获得，不须要再到表中取数据，也就是使用了覆盖索引，避免了回表操作，效率不错。

### B 树索引的结构

## InnoDB 是如何储存数据的

InnoDB 的数据是按数据页为单位来读写的,也就是说，当需要读一条记录的时候，并不是将这个记录本身从磁盘读出来，而是以页为单位，将其整体读入缓存池。

数据库的 I/O 操作的最小单位是页，InnoDB 数据页的默认大小是 16KB，意味着数据库每次读写都是以 16KB 为单位的，一次最少从磁盘中读取 16K 的内容到内存中，一次最少把内存中的 16K 内容刷新到磁盘中。

数据页的结构

![](https://cdn.xiaolincoding.com//mysql/other/243b1466779a9e107ae3ef0155604a17.png)

各部分的作用
参考链接
- [8.3.1 How MySQL Uses Indexes](https://dev.mysql.com/doc/refman/8.0/en/mysql-indexes.html)
- [8.3.9 Comparison of B-Tree and Hash Indexes](https://dev.mysql.com/doc/refman/8.0/en/index-btree-hash.html)
- [最左前缀原则（依据官方文档）](https://juejin.cn/post/6876046792056635405)
- [索引常见面试题](https://www.xiaolincoding.com/mysql/index/index_interview.html)