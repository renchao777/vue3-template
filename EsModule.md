# Es Module 和 CommonJs的区别

### 语法

ES Module：使用了import 和 export语句

CommonJS: 使用 require() 和 module.exports

### 加载方式

ES Module：支持静态和动态导入，静态导入时实在文件顶部声明的，允许编译器优化 如树摇（tree-shaking）。

CommonJS:模块加载是动态的，发生在代码运行时，这种方式使得静态分析和优化更加困难

### 模块解析

ES Module：输出的是值得引用，当导出得值变化时，导入的值也会变化。

CommonJS:输出的是值得拷贝，一旦导入，后续导出值的变化不会反映在已导入模块

### 执行顺序

ES Module：采用异步加载模块，会在所有模块加载完成后执行代，因此，导入语句不会阻塞代码的执行。

CommonJS：采用同步加载模块，在导入时会立即执行整个模块代码，且会阻塞后续代码的执行。