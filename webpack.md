# webpack相关

### webpack构建流程

1.初始化配置参数：从配置文件和shell语句中读取与合并参数，得出最终的参数

2.开始编译：用上一步得到得参数初始化一个Compilter对象，加载所有的插件和模块规则，并将这些插件注册到 Compiler 对象的生命周期钩子中，执行对象的run方法开始执行编译

3.确定入口：从配置中的entry找出所有的入口文件

4.模块解析：从入口文件开始，递归解析文件中所依赖的所有模块。

5.模块加载：对于每个依赖模块，使用相应的loader处理它们

6.依赖图构建：将所有的模块和它们之间的依赖关系表示为一个依赖图

7.输出资源生成：根据依赖图和配置，生成一系列输出资源，例如：bundle.js

8.输出完成：根据配置确定输出的路径和文件名，把生成的输出资源内容写入到文件系统，通常是dist文件夹


### webpack热更新原理

热更新通过WebSocket连接服务器与客户端，Webpack Dev Server （WDS）在服务端运行，负责触发整个热更新流程

1.文件监听

当源代码发生变化时，WDS会监听这些变化

2.构建更新

一旦检测到文件变化，WDS会重新构建发生变化的模块，会创建一个所谓的 "hot update chunk"（包含更新的模块）

3.通知客户端

WDS通过websocket发送消息到客户端，告知有更新模块

4.下载更新

客户端接收到最新消息后，使用更简洁的 Fetch API）从服务器下载更新的模块。这些模块通常被打包成一个包含变更的更新块

5.模块替换

一旦更新的模块被下载，webpack的模块热替换（HMR）功能会处理模块的替换操作

### 使用过哪些plugin

**是插件，可以用来扩展webpack功能**
1.html-webpack-plugin:用于自动生成HTML文件并自动引入打包之后的资源文件，简化了webpck项目中的HTML处理流程

2.eslint-webpack-plugin:在webpack的构建过程中运行eslint，检查你的代码是否符合规范

3.mini-css-extract-plugin:将css提取到单独的文件中，为每个包含css的js文件创建一个css，并且支持css按需引入

### 关于Loader

**loader本质上是一个函数，因为有些资源webpack不认识，需要loader进行翻译处理，对其他类型的资源做转译工作，返回转换后的结果，然后loader是在module.rules中配置，类型是一个数组，然后每一项是一个对象，可以配置对应的loader和规则**

使用过哪些laoder

1.babel-loader；将es6转换成es5

2.css-loader: 处理css会对@import和url()进行处理

3.style-loader：将css插入到html中

4.postcc-loader: 将css添加到浏览器前缀，确保你的css兼容各种浏览器

5.less-loader: 将less转成css

6.url-loader: 将图片转成base61

7.file-loader: 将图片转成文件


### Babel原理

**Babel是一个广泛使用的js编译器，主要用于将es6+代码转换为后兼容的js版本**

- babel核心处理流程，1源代码解析成AST 2转换AST为需要的样子 3生成AST为源码

工作原理

1.解析

词法分析：这一阶段将源代码字符串分解为一个个令牌（Tokens）。令牌是代码的最小单位，；例如数字，字符串，标识符，关键字，符号等

语法分析：词法分析之后，Babel会进行语法分析，将令牌转换成抽象语法树(AST)。AST是代码的深层结构表示，它将以树的形式展示代码的语法结构。

2.转换

在这一阶段，Babel接收到AST并对其进行遍历，应用各种插件和预设对树进行修改，这些变化可能包括新语言特性的转换，API的替换等。

3.生成

最后一阶段是代码生成。Babel将经过转换的AST转换回普通的Javascipt代码。这个过程包括将AST转换程字符串形式的代码，并创建源码映射




### 业务场景

**优化开发编译速度、生产环境打包速度**

(1)多进程构建

webpack是运行在node环境中，而node是单线程的。

采用thread-loader进行多进程构建
```
 rules: [
    {
    test: /\.js$/,
    exclude: /node_modules/,
    use: ["thread-loader", "babel-loader"],
    }
]

```
worker 

(2)多进程并行压缩代码

上面我们提到了多进程打包，接下来应用一下可以并行压缩JavaScript代码的插件

webpack默认提供了UglifyJS插件来压缩js代码，但是它使用的是单线程压缩代码，也就是说多个js文件需要被压缩，它需要一个个文件进行压缩，所以说正式环境打包压缩代码速度非常慢（因为压缩js代码需要先把代码解析成用Object抽象表示的AST语法树，再应用各种规则分析处理AST，导致这个过程耗时非常大）

我们可以使用并行压缩代码的插件：terser-webpack-plugin

optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                output: {
                    comments: false, // remove comments
                },
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log'], // remove console.log
                },
            },
            extractComments: false,
        }),
    ],
},

需要注意的是，V8 在系统上有内存的限制，默认情况下，32 位系统限制为 512M，64 位系统限制为 1024M。因为如果不加以限制，大型项目构建的时候可能会出现内存溢出的情况。也就是说，可能无法开启并行压缩的功能。但是压缩代码的功能还是可以正常使用的。


(3)利用缓存提升二次构建速度(建议配置在开发环境，生产环境可能没有效果)
babel-loader开启缓存
使用hard-source-webpack-plugin: 为模块提供了中间缓存，缓存默认存放路径是 node_modules/.cache/hard-source

配置 hard-source-webpack-plugin后，首次构建时间并不会有太大的变化，但是从第二次开始，构建时间大约可以减少 80%左右。

然后在vue.config.js 中添加配置，。
module.exports = {
  plugins: [new HardSourceWebpackPlugin()],
};

(4)预编译资源模块 (在开发环境中不使用dllPlugin是因为chrome的vue devtool是不能检测压缩后的vue源码，不方便代码调试)

在使用webpack进行打包时候，对于依赖的第三方库，比如vue，vuex等这些不会修改的依赖，我们可以让它和我们自己编写的代码分开打包，这样多的好处是每次更改本地代码文件的时候，webpack是需要打包项目本身的文件代码，而不会再去编译第三方库。

那么第三方库在第一次打包的时候只打包一次，以后只要我们不升级第三方包的时候，那么webpack就不会对这些库去打包，这样的可以快速的提高打包的速度，其实也就是预编译资源的模块。

webpack中，我们可以结合DllPlugin和DllReferencePlugin插件来实现

- DllPlugin是什么

DllPlugin插件是一个额外独立的webpack设置中创建一个只有dll的bundle，也就是我们在项目目录下除了有vue.config.js,还会新建一个webpack.dll.config.js文件。

webpack.dll.config.js的作用是把所有的第三方库依赖打包到一个bundle的dll文件里面，还会生成一个名为manifest.json文件，该文件的作用是用来让 DllReferencePlugin 映射到相关的依赖上去的。

- DllReferencePlugin 又是什么

这个插件是在vue.config.js中使用的，该插件的作用是把刚刚在webpack.dll.config.js中打包生成的dll文件引用到需要预编译的依赖上来。

weback.dll.config.js中打包后比如回生成vendor.dll.js文件和vendor-manifeat.json文件会包含所有库代码的一个索引，当在使用vue.config.js文件打包DllReferencePlugin插件的时候，会使用该DllReferencePlugin插件读取vendor-manifest.json文件，看看是否有该第三方库。

vendor-manifest.json文件就是一个第三方库的映射而已。

webpack.dll.config.js 

const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    vendor: [
      "vue/dist/vue.runtime.esm.js",
      "vuex",
      "vue-router",
      "vue-resource",
      "iview",
    ], // 这里是vue项目依赖的库
    util: ["lodash", "jquery", "moment"], // 这里是与框架无关的第三方库
  },
  output: {
    filename: "[name].dll.js",
    path: path.resolve(__dirname, "dll"),
    library: "dll_[name]",
  },
  plugins: [
    new CleanWebpackPlugin(), // clean-webpack-plugin目前已经更新到2.0.0，不需要传参数path
    new webpack.DllPlugin({
      name: "dll_[name]",
      path: path.join(__dirname, "dll", "[name].manifest.json"),
      context: __dirname,
    }),
  ],
};

package.json里面添加 
"scripts": {
    "build:dll": "webpack --config ./webpack.dll.config.js",
},

这样子每次第三库更新或者添加的时候运行
npm run build:dll

vue.config.js


const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin'); // 如果未安装请先安装


const dllReference = (config) => {
    config.plugin('vendorDll')
        .use(webpack.DllReferencePlugin, [{
            context: __dirname,
            manifest: require('./dll/vendor.manifest.json'),
        }]);


    config.plugin('utilDll')
        .use(webpack.DllReferencePlugin, [{
            context: __dirname,
            manifest: require('./dll/util.manifest.json'),
        }]);


    config.plugin('addAssetHtml')
        .use(AddAssetHtmlPlugin, [ // add-asset-html-webpack-plugin插件必须在html-webpack-plugin之后使用，因此这里要用webpack-chain来进行配置
            [
                {
                    filepath: require.resolve(path.resolve(__dirname, 'dll/vendor.dll.js')),
                    outputPath: 'dll',
                    publicPath: '/dll', // 这里的公共路径与项目配置有关，如果顶层publicPath下有值，请添加到dll前缀
                },
                {
                    filepath: require.resolve(path.resolve(__dirname, 'dll/util.dll.js')),
                    outputPath: 'dll',
                    publicPath: '/dll', // 这里的公共路径与项目配置有关，如果顶层publicPath下有值，请添加到dll前缀
                },
            ],
        ])
        .after('html'); // 'html'代表html-webpack-plugin，是因为@vue/cli-servide/lib/config/app.js里是用plugin('html')来映射的
};


module.exports = {
    publicPath: '/', // 顶层publiePath在这里
    chainWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') { // 在开发环境中不使用dllPlugin是因为chrome的vue devtool是不能检测压缩后的vue源码，不方便代码调试
            dllReference(config);
        }
    }

2.优化首屏速度




