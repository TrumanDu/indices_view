# indies_view

## Language   
- [EN](./README.md)
- [中文](./README_ZH.md)
## 简介
> indies_view 是新蛋网开源的一个 kibana APP 插件项目，可以安装在 kibana 中，快速、高效、便捷的查看elasticsearch 中 indices 相关信息。目前该项目已被 [elastic](https://www.elastic.co/guide/en/kibana/current/known-plugins.html) 官网收录。

该插件可以统计聚合相同前缀 index 的大小，数量，被查询等指标信息。聚合规则灵活，为运维人员提供一个直观可视化界面。高效监控分析集群 index 存储、检索状态，为删除无用 index 提供直接依据。

---

## 截图

![](./screenshots/indices_view.gif)
## 正则规则
插件提供根据指定正则规则聚合统计不同前缀index 相关指标信息。
```
1. /[^a-z]+$/
2. /[\d]{4}[-|\.|/][\d]{1,2}[-|\.|/][\d]{1,2}/
```
## 开发流程

查看[kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) 官方文档，构建开发环境，搭建好环境后，按以下步骤进行。

  - `npm start`

    启动kibana

  - `npm start -- --config kibana.yml`

    可以通过这个命令指定kibana 配置文件

  - `npm run build`

    生成编译包

  - `npm run test:browser`

    在web 浏览器中测试

  - `npm run test:server`

    用mocha 测试服务端

更多信息执行`npm run ${task} -- --help`.

## 部署

**重要** : 修改这个插件的版本kibana.version 和你在kibana package.json 中的版本保持一致！

- `npm install`
- `npm run build`

按以上步骤生成安装包。

## 安装

如果不是安装到docker容器中，可忽略第一步。
1. 复制到docker 容器中

    ```$ sudo docker cp ****.zip id:/****.zip```

2. 安装到kibana中

    ```$bin/kibana-plugin install file:///****.zip```