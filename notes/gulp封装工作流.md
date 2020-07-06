###封装工作流

在多个项目中重复使用共同的构建化任务，提取一个可复用的自动化构建工作流。原理是将gulpfile和gulp结合在一起生成一个模块来供外部使用。

- 创建一个github仓库存放项目代码

- 初始化一个本地node_modules结构项目hz-pages（此处使用zae-cli生成初始结构）

- 修改hz-pages项目中的package.json文件中依赖的第三方模块，放在**dependencies**字段下，因为当hz-pages作为第三方模块安装的时候，dependencies下的依赖模块会自行安装

- 拷贝需要封装的已经准备好的gulpfile文件内容拷贝到hz-pages项目**作为模块时候的入口文件index.js**中

- 修改作为模块时候index.js文件中不能直接使用的数据，例如data数据，解决方案可以将需要配置的data放入项目中以page.config.js的方式配置然后导出。例如模块引入不能直接使用字符串地址引入，可以使用**babel({ presets: [require('@babel/preset-env')] })**的方式替换掉**babel({ presets: ['@babel/preset-env'] })**的形式。

- 抽象出index.js中的路径配置，使我们外部调用配置文件的时候可以通过外部文件修改路径

- 包装Gulp CLI，将gulp cli命令放入我们自己的模块hz-pages里面bin字段运行的脚本里面，使外部项目调用我们的命令，来执行gulp操作。














