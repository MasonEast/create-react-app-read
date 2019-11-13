process.env.BABEL_ENV = 'development';      //先确定当前文件执行的是dev环境
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {       //如果在事件循环的一次轮询中，一个 Promise 被拒绝，并且此 Promise 没有绑定错误处理器， 该事件会被触发。
    throw err;
});

require('../config/env');                   //确保读取到环境变量

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');         //一个颜色插件
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');               //清除console
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');   //检查所需文件
const {
    choosePort,
    createCompiler,
    prepareProxy,
    prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {       //如果所需文件： public/index.html或src/index文件不存在， 则退出进程
    process.exit(1);
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4200;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {                                             //如果进程环境中有host， 控制台会输出以下提示信息
    console.log(
        chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
                chalk.bold(process.env.HOST)
            )}`
        )
    );
    console.log(
        `If this was unintentional, check that you haven't mistakenly set it in your shell.`
    );
    console.log(
        `Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`
    );
    console.log();
}


checkBrowsers(paths.appPath, isInteractive)
    .then(() => {
        return choosePort(HOST, DEFAULT_PORT);      //该方法会帮我们默认选择端口号， 如果被占用它或帮我们寻找空闲的端口号
    })
    .then(port => {
        if (port == null) {
            return;
        }
        const config = configFactory('development');                        //获取webpack基本配置， entry， output， modules等
        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
        const appName = require(paths.appPackageJson).name;                 //获取package.json的name值
        const useTypeScript = fs.existsSync(paths.appTsConfig);             //判断tsconfig文件是否存在， 决定是否使用ts
        const urls = prepareUrls(protocol, HOST, port);
        const devSocket = {
            warnings: warnings =>
                devServer.sockWrite(devServer.sockets, 'warnings', warnings),
            errors: errors =>
                devServer.sockWrite(devServer.sockets, 'errors', errors),
        };
        const compiler = createCompiler({                                   //创建一个webpack编译器
            appName,
            config,
            devSocket,
            urls,
            useYarn,
            useTypeScript,
            webpack,
        });
        const proxySetting = require(paths.appPackageJson).proxy;           //获取package.json的proxy相关信息
        const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
        // Serve webpack assets generated by the compiler over a web server.
        const serverConfig = createDevServerConfig(
            proxyConfig,
            urls.lanUrlForConfig
        );
        const devServer = new WebpackDevServer(compiler, serverConfig);
        // Launch WebpackDevServer.
        devServer.listen(port, HOST, err => {
            if (err) {
                return console.log(err);
            }
            if (isInteractive) {
                clearConsole();
            }


            if (process.env.NODE_PATH) {
                console.log(
                    chalk.yellow(
                        'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
                    )
                );
                console.log();
            }

            console.log(chalk.cyan('Starting the development server...\n'));
            openBrowser(urls.localUrlForBrowser);
        });

        ['SIGINT', 'SIGTERM'].forEach(function (sig) {      //SIGINT: 在终端运行时，可以被所有平台支持，通常可以通过 <Ctrl>+C 触发; SIGTERM: 在 Windows 中不支持，可以给其绑定监听器。
            process.on(sig, function () {
                devServer.close();
                process.exit();
            });
        });
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });