(window.webpackJsonp=window.webpackJsonp||[]).push([[60],{333:function(e,r,o){"use strict";o.r(r);var t=o(14),l=Object(t.a)({},(function(){var e=this,r=e._self._c;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("h1",{attrs:{id:"buffer-pool"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool"}},[e._v("#")]),e._v(" buffer_pool")]),e._v(" "),r("p",[e._v("缓冲池 (buffer pool) 是主内存中的一个区域,InnoDB 引擎会将访问过的表和索引数据缓存在这个区域中。缓冲池(buffer pool)允许经常使用的数据可以直接从内存中访问,这可以加快处理速度。对于专用服务器 (Dedicated servers), 通常会将高达物理内存的80%分配给缓冲池 (buffer pool)。")]),e._v(" "),r("p",[e._v("为了高效率的大量读取操作,缓冲池被分成可容纳多个行的数据页。")]),e._v(" "),r("p",[e._v("为了高效率的缓存管理,缓冲池被实现为一个链接列表的页面;很少使用的数据会通过变种的最近最少使用(LRU)算法从缓存中淘汰。\n了解如何利用缓冲池来保持频繁访问的数据在内存中,是 MySQL 调优的一个重要方面。")]),e._v(" "),r("p",[e._v("这是 BufferPool 在 InnoDB 中的位置\n"),r("img",{attrs:{src:"https://dev.mysql.com/doc/refman/8.0/en/images/innodb-architecture-8-0.png",alt:""}})]),e._v(" "),r("h2",{attrs:{id:"buffer-pool-lru-algorithm"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool-lru-algorithm"}},[e._v("#")]),e._v(" Buffer Pool LRU Algorithm")]),e._v(" "),r("p",[e._v("buffer pool 是使用 LRU 算法变体管理一个链表。当需要为 buffer pool 添加新页面( page )时,最近最少使用的页面会被淘汰,新的页面会添加到链表的中间。这种中间插入策略把链表视为两个子链表:")]),e._v(" "),r("ul",[r("li",[e._v('在头部,包含新添加("年轻")但最近访问的页面的子链表 (sublist)')]),e._v(" "),r("li",[e._v("在尾部,包含较旧但访问较少的页面的子链表")])]),e._v(" "),r("h3",{attrs:{id:"bufferpool-lru-链表的中间是怎么得出的"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#bufferpool-lru-链表的中间是怎么得出的"}},[e._v("#")]),e._v(" BufferPool LRU 链表的中间是怎么得出的？")]),e._v(" "),r("p",[e._v("BufferPool LRU 链表的中间，主要通过监控访问频率来判断。")]),e._v(" "),r("p",[e._v("BufferPool 会记录每一个页的访问频率(通常是访问次数)。新的页面被插入时,访问频率默认为 0。")]),e._v(" "),r("p",[e._v("随着页面被访问和修改,访问频率会不断增加。")]),e._v(" "),r("p",[e._v("BufferPool 会定期扫描整个链表,找出访问频率处于中间水平的页面(既不是最高也不是最低),然后将新的页面插入到这个位置。")]),e._v(" "),r("h3",{attrs:{id:"figure-15-2-buffer-pool-list"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#figure-15-2-buffer-pool-list"}},[e._v("#")]),e._v(" Figure 15.2 Buffer Pool List")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://dev.mysql.com/doc/refman/8.0/en/images/innodb-buffer-pool-list.png",alt:""}})]),e._v(" "),r("p",[e._v("该算法将频繁使用的页保存在 New Sublist （新子列表）中。Old Sublist （旧子列表） 包含使用频率较低的页面; 这些页可能会被"),r("a",{attrs:{href:"https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_eviction",target:"_blank",rel:"noopener noreferrer"}},[e._v("淘汰"),r("OutboundLink")],1),e._v(")。")]),e._v(" "),r("p",[e._v("默认情况下，算法运行如下:")]),e._v(" "),r("ul",[r("li",[e._v("缓存池的 3/8 用于旧子列表。")]),e._v(" "),r("li",[e._v("列表的 midpoint （中点）是新子列表的尾部与旧子列表的头部相接的边界。")]),e._v(" "),r("li",[e._v("当 InnoDB 将页读入缓冲池时，它最初将其插入到中点(旧子列表的头部)，一个页可以被读取，因为它是用户发起的操作(如 SQL 查询)所必需的，或者是作为 InnoDB 自动执行的 "),r("a",{attrs:{href:"https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_read_ahead",target:"_blank",rel:"noopener noreferrer"}},[e._v("read-ahead"),r("OutboundLink")],1),e._v("（预读）操作的一部分。")]),e._v(" "),r("li",[e._v('访问旧子列表中的一个页面会使这个页面"变年轻",将它移动到新子列表的头部。如果这个页面是因为用户发起的操作需要而读取的,那么首次访问将立即发生,这个页面就会年轻化。 如果这个页面是由于预读操作读取的,那么 first access（首次访问）可能不会立即发生,也可能在这个页面被淘汰之前都不会发生。')]),e._v(" "),r("li",[e._v('当数据库运行的时候,未被访问的 buffer pool 中的页会随时间"变老",通过移动到链表的尾部实现。页既在新子列表,也在旧子列表中"变老",这取决于其他页面"变得年轻"。旧子列表中的页面还会随着新页面插入到中点位置而"变老"。最终,如果一个页面长时间未被使用,它最终会移动到旧子列表的末尾,并被淘汰。')])]),e._v(" "),r("h2",{attrs:{id:"buffer-pool-配置"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool-配置"}},[e._v("#")]),e._v(" Buffer Pool 配置")]),e._v(" "),r("p",[e._v("待完成")]),e._v(" "),r("p",[e._v("参考链接")]),e._v(" "),r("ul",[r("li",[r("a",{attrs:{href:"https://dev.mysql.com/blog-archive/mysql-8-0-new-lock-free-scalable-wal-design/",target:"_blank",rel:"noopener noreferrer"}},[e._v("MySQL 8.0: New Lock free, scalable WAL design"),r("OutboundLink")],1)])])])}),[],!1,null,null,null);r.default=l.exports}}]);