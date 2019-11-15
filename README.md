# 解析create-react-app脚手架源码

## 配置ts环境

1. 安装 `@types/react @types/react-dom`, `typescript awesome-typescript-loader`等插件

2. 在webpack.config.js中配置解析.tsx文件的loader：

    `{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },`

    **注： 现在已经不需要awesome-typescript-loader了， babel7.x以上已经支持编译ts了**


3. 项目根目录下新建`tsconfig.json`文件，并配置基础项：

    ```json
    {
        "compilerOptions": {
            "outDir": "./dist/",
            "sourceMap": true,
            "noImplicitAny": false,
            "module": "commonjs",
            "target": "es5",
            "jsx": "react",
        },
        "include": [
            "./src/**/*"
        ],
    }
    ```