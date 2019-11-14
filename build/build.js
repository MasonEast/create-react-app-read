process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
    throw err;
});

require('../config/env');

const path = require('path');
const chalk = require('react-dev-utils/chalk');
const fs = require('fs-extra');                     //fs-extra模块是系统fs模块的扩展，提供了更多便利的 API，并继承了fs模块的 API
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;           //检查文件体积
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;                 //打包后输出文件体积
const useYarn = fs.existsSync(paths.yarnLockFile);                                          //yarn相关

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;             //检查一个流是否连接到了一个 TTY 上下文， 检查 isTTY 属性。(TTY就是终端)

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

function copyPublicFolder () {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}

function build (previousFileSizes) {
    // 我们曾经支持根据“NODE_PATH”解析模块。
    //现在它已经被弃用，取而代之的是jsconfig/tsconfig.json
    //这让你在导入中使用绝对路径
    if (process.env.NODE_PATH) {
        console.log(
            chalk.yellow(
                'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
            )
        );
        console.log();
    }

    console.log('Creating an optimized production build...');

    const compiler = webpack(config);                               //线上使用的还是webpack进行的打包， 开发环境使用的是脚手架自己的打包编译器
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }
                messages = formatWebpackMessages({
                    errors: [err.message],
                    warnings: [],
                });
            } else {
                messages = formatWebpackMessages(
                    stats.toJson({ all: false, warnings: true, errors: true })
                );
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                        'Most CI servers set it automatically.\n'
                    )
                );
                return reject(new Error(messages.warnings.join('\n\n')));
            }

            return resolve({
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            });
        });
    });
}

const config = configFactory('production');

const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)             //paths.appPath:  当前项目所在目录路径
    .then(() => {
        return measureFileSizesBeforeBuild(paths.appBuild);                     //获取打包前文件大小, 返回值看下面的previousFileSizes
    })
    .then(previousFileSizes => {
        /**
         * previousFileSizes: 
         * { 
            root: '.../191113/dist',
            sizes:
                { 'static/js/runtime~main.js': 730, 'static/js/main.js': 126 } 
            }
         */

        fs.emptyDirSync(paths.appBuild);        //确保目录为空。如果目录不是空的，则删除目录内容。如果目录不存在，就创建它。目录本身没有被删除。

        copyPublicFolder();                     //与public文件夹合并

        return build(previousFileSizes);        //开始打包
    })
    .then(
        ({ stats, previousFileSizes, warnings }) => {
            if (warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'));
                console.log(warnings.join('\n\n'));
                console.log(
                    '\nSearch for the ' +
                    chalk.underline(chalk.yellow('keywords')) +
                    ' to learn more about each warning.'
                );
                console.log(
                    'To ignore, add ' +
                    chalk.cyan('// eslint-disable-next-line') +
                    ' to the line before.\n'
                );
            } else {
                console.log(chalk.green('Compiled successfully.\n'));
            }

            console.log('File sizes after gzip:\n');
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            );
            console.log();

            const appPackage = require(paths.appPackageJson);
            const publicUrl = paths.publicUrl;
            const publicPath = config.output.publicPath;
            const buildFolder = path.relative(process.cwd(), paths.appBuild);
            printHostingInstructions(
                appPackage,
                publicUrl,
                publicPath,
                buildFolder,
                useYarn
            );
        },
        err => {
            console.log(chalk.red('Failed to compile.\n'));
            printBuildError(err);
            process.exit(1);
        }
    )
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });