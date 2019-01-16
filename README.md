# indices_view

> An awesome kibana plugin for view indies!

---

## Language   
- [EN](./README.md)
- [中文](./README_ZH.md)
## Introduction
> An awesome kibana plugin for view indies!

---

## Screenshots

![](./screenshots/indices_view.gif)
## Reg pattern

```
1. [^a-z]+$
2. [\d]{4}[-|\.|/][\d]{1,2}[-|\.|/][\d]{1,2}
```

## Config
kibana.yml

1. mergePattern

   merge pattern,default value is '[^a-z]+$'. you can edit it. like: 
```
indices_view.mergePattern: '[\d]{4}[-|\.|/][\d]{1,2}[-|\.|/][\d]{1,2}'
```
## Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following yarn scripts.

  - `yarn kbn bootstrap`

    Install dependencies and crosslink Kibana and all projects/plugins.

    > ***IMPORTANT:*** Use this script instead of `yarn` to install dependencies when switching branches, and re-run it whenever your dependencies change.

  - `yarn start`

    Start kibana and have it include this plugin. You can pass any arguments that you would normally send to `bin/kibana`

      ```
      yarn start --elasticsearch.url http://localhost:9220
      ```

  - `yarn build`

    Build a distributable archive of your plugin.

  - `yarn test:browser`

    Run the browser tests in a real web browser.

  - `yarn test:server`

    Run the server tests using mocha.

For more information about any of these commands run `yarn ${task} --help`. For a full list of tasks checkout the `package.json` file, or run `yarn run`.
## Deploy

**important** : edit this plugin version and kibana.version to you kibana version in package.json

- `yarn kbn bootstrap`
- `yarn build`

Build a distributable archive

## Install

1. cp to docker container

    ```$ sudo docker cp ****.zip id:/****.zip```

2. install to kibana 

    ```$bin/kibana-plugin install file:///****.zip```