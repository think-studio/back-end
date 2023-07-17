(window.webpackJsonp=window.webpackJsonp||[]).push([[61],{334:function(e,r,t){"use strict";t.r(r);var o=t(14),a=Object(o.a)({},(function(){var e=this,r=e._self._c;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("h1",{attrs:{id:"buffer-pool"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool"}},[e._v("#")]),e._v(" buffer_pool")]),e._v(" "),r("p",[e._v("buffer pool是主内存中的一个区域,InnoDB 引擎会将访问过的表和索引数据缓存在这个区域中。buffer pool 允许经常使用的数据可以直接从内存中访问,这可以加快处理速度。对于 Dedicated servers （专用服务器）, 通常会将高达物理内存的80%分配给 buffer pool。")]),e._v(" "),r("p",[e._v("为了高效率的大量读取操作,缓冲池被分成可容纳多个行的数据页。")]),e._v(" "),r("p",[e._v("为了高效率的缓存管理,缓冲池被实现为一个链接列表的页面;很少使用的数据会通过变种的最近最少使用(LRU)算法从缓存中淘汰。\n了解如何利用缓冲池来保持频繁访问的数据在内存中,是 MySQL 调优的一个重要方面。")]),e._v(" "),r("p",[e._v("这是 BufferPool 在 InnoDB 中的位置\n"),r("img",{attrs:{src:"https://dev.mysql.com/doc/refman/8.0/en/images/innodb-architecture-8-0.png",alt:""}})]),e._v(" "),r("h2",{attrs:{id:"buffer-pool-lru-algorithm"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool-lru-algorithm"}},[e._v("#")]),e._v(" Buffer Pool LRU Algorithm")]),e._v(" "),r("p",[e._v("buffer pool 是使用 LRU 算法变体管理一个链表。当需要为 buffer pool 添加新页面( page )时,最近最少使用的页面会被淘汰,新的页面会添加到链表的中间。这种中间插入策略把链表视为两个子链表:")]),e._v(" "),r("ul",[r("li",[e._v('在头部,包含新添加("年轻")但最近访问的页的 sublist （子列表）')]),e._v(" "),r("li",[e._v("在尾部,包含较旧但访问较少的页面的子链表")])]),e._v(" "),r("h3",{attrs:{id:"figure-15-2-buffer-pool-list"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#figure-15-2-buffer-pool-list"}},[e._v("#")]),e._v(" Figure 15.2 Buffer Pool List")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://dev.mysql.com/doc/refman/8.0/en/images/innodb-buffer-pool-list.png",alt:""}})]),e._v(" "),r("p",[e._v("该算法将频繁使用的页保存在 New Sublist （新子列表）中。Old Sublist （旧子列表） 包含使用频率较低的页面; 这些页可能会被"),r("a",{attrs:{href:"https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_eviction",target:"_blank",rel:"noopener noreferrer"}},[e._v("淘汰"),r("OutboundLink")],1),e._v(")。")]),e._v(" "),r("p",[e._v("默认情况下，算法运行如下:")]),e._v(" "),r("ul",[r("li",[e._v("缓存池的 3/8 用于旧子列表。")]),e._v(" "),r("li",[e._v("列表的 midpoint （中点）是新子列表的尾部与旧子列表的头部相接的边界。")]),e._v(" "),r("li",[e._v("当 InnoDB 将页读入缓冲池时，它最初将其插入到中点(旧子列表的头部)，一个页可以被读取，因为它是用户发起的操作(如 SQL 查询)所必需的，或者是作为 InnoDB 自动执行的 "),r("a",{attrs:{href:"https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_read_ahead",target:"_blank",rel:"noopener noreferrer"}},[e._v("read-ahead"),r("OutboundLink")],1),e._v("（预读）操作的一部分。")]),e._v(" "),r("li",[e._v('访问旧子列表中的一个页面会使这个页面"变年轻",将它移动到新子列表的头部。如果这个页面是因为用户发起的操作需要而读取的,那么首次访问将立即发生,这个页面就会年轻化。 如果这个页面是由于预读操作读取的,那么首次访问可能不会立即发生,也可能在这个页面被淘汰之前都不会发生。')]),e._v(" "),r("li",[e._v('当数据库运行的时候,未被访问的 buffer pool 中的页会随时间"变老",通过移动到链表的尾部实现。页既在新子列表,也在旧子列表中"变老",这取决于其他页面"变得年轻"。旧子列表中的页面还会随着新页面插入到中点位置而"变老"。最终,如果一个页面长时间未被使用,它最终会移动到旧子列表的末尾,并被淘汰。')])]),e._v(" "),r("p",[e._v("查看 midpoint")]),e._v(" "),r("div",{staticClass:"language- extra-class"},[r("pre",{pre:!0,attrs:{class:"language-text"}},[r("code",[e._v("mysql> show variables like 'innodb_old_blocks_pct';\n+-----------------------+-------+\n| Variable_name         | Value |\n+-----------------------+-------+\n| innodb_old_blocks_pct | 37    |\n+-----------------------+-------+\n1 row in set (0.01 sec)\n")])])]),r("p",[e._v("37: 末尾处的 37% 的位置，即末尾 3/8 的位置")]),e._v(" "),r("h3",{attrs:{id:"局部性原理与预读机制"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#局部性原理与预读机制"}},[e._v("#")]),e._v(" 局部性原理与预读机制")]),e._v(" "),r("p",[e._v("局部性原理")]),e._v(" "),r("ul",[r("li",[e._v("时间局部性：如果一个数据现在被访问了，在近期可能还会被多次访问。")]),e._v(" "),r("li",[e._v("空间局部性：如果一个数据被访问了，那么存储在它附近的数据，很有可能立马被访问。")])]),e._v(" "),r("p",[e._v("预读机制")]),e._v(" "),r("p",[e._v("MySQL 为了提高性能，提供了预读机制。")]),e._v(" "),r("p",[e._v("当你从磁盘上加载一个数据页的时候，他可能会连带着把这个数据页相邻的其他数据页，也加载到缓存里去。这个机制会带来这么一个问题：连带的数据页可能在后面的查询或者修改中，并不会用到，但是它们却在 lru 链表的头部。")]),e._v(" "),r("p",[r("em",[e._v("为什么要使用 LRU")])]),e._v(" "),r("p",[e._v("因为内存的大小是有限的，不可能无限的存放数据；")]),e._v(" "),r("p",[e._v("当请求的数据不存在的时候，我们只能去硬盘拿，这样速度会变慢，所以我们要尽可能的避免这种情况的发生。当内存的数据满了的时候，把用户经常访问的数据留着，淘汰一些不经常被访问的数据，腾出位置存放新访问的数据，这样就能提高效率，所以这里选择 LRU （最近最少使用）来对不经常访问的数据进行淘汰。")]),e._v(" "),r("p",[r("em",[e._v("为什么MySQL 不使用传统的 LRU")])]),e._v(" "),r("p",[e._v("使用传统 LRU 的缺点：索引扫描/数据扫描/全表扫描，会使 buffer pool 中大量的页被刷新出去。然而被扫描到的数据页只是本次操作所需要的，并非热点数据。而真正的热点数据还是从磁盘读取，影响了 buffer pool 效率。")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://camo.githubusercontent.com/4e17ae3810ddcc6ccec7c6374702e8bdff4b24e1d6a86ecdbb73345d8e75a835/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f79757175652f302f323032312f706e672f313436313639342f313633383435323838363632302d35323564636636362d366464652d343832322d616561332d3162396535653135346338362e706e6723636c69656e7449643d7532636564383133302d653939332d342663726f703d302663726f703d302663726f703d312663726f703d312666726f6d3d7061737465266865696768743d3638352669643d753565666336666463266d617267696e3d2535426f626a6563742532304f626a656374253544266e616d653d696d6167652e706e67266f726967696e4865696768743d31333730266f726967696e57696474683d31353830266f726967696e616c547970653d62696e61727926726174696f3d3126726f746174696f6e3d302673686f775469746c653d66616c73652673697a653d31303835373130267374617475733d646f6e65267374796c653d6e6f6e65267461736b49643d7566323264356366632d373631342d343166302d383261652d6333303837646339303662267469746c653d2677696474683d373930",alt:""}})]),e._v(" "),r("p",[r("em",[e._v("为什么不把最新查到的数据放到首部?")]),e._v("\n放在首部就和传统 LRU 一样了")]),e._v(" "),r("h2",{attrs:{id:"buffer-pool-配置"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#buffer-pool-配置"}},[e._v("#")]),e._v(" Buffer Pool 配置")]),e._v(" "),r("p",[e._v("待完成")]),e._v(" "),r("p",[e._v("参考链接")]),e._v(" "),r("ul",[r("li",[r("a",{attrs:{href:"https://dev.mysql.com/blog-archive/mysql-8-0-new-lock-free-scalable-wal-design/",target:"_blank",rel:"noopener noreferrer"}},[e._v("MySQL 8.0: New Lock free, scalable WAL design"),r("OutboundLink")],1)]),e._v(" "),r("li",[r("a",{attrs:{href:"https://juejin.cn/post/7007623642699792415",target:"_blank",rel:"noopener noreferrer"}},[e._v("老面试官问我：LRU 和 Innodb Buffer Pool 有什么关系？"),r("OutboundLink")],1)])])])}),[],!1,null,null,null);r.default=a.exports}}]);