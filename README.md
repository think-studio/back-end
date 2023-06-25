# 后端知识沉淀

## 介绍说明

分支使用:  learn-warehouse

通过 .github/workflows下的deploy.yml借助github帮我们部署

然后采用github pages来进行部署

建议在使用魔法的情况下进行访问

[vuepress](https://vuepress.vuejs.org/zh/guide/) 我们使用的vuepress进行管理



## 本地开发

node:  v14.12.0

node 建议使用 nvm来进行统一的依赖管理



依赖安装 :  npm install

然后执行： npm run dev



## 配置说明

在 docs 下有一个隐藏的文件夹 .vuepress ; 其中有一个 config.js 来进行管理



nav : 配置顶部的导航

sidebar： 根据顶部的导航 url 来配置点击顶部的展示侧边的导航

children:  没在对应的路径添加一个文件,就在此处进行配置



添加完后,可在本地看执行的效果





