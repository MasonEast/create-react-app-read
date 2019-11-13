const fs = require('fs');
const path = require('path');
const paths = require('./paths');

/**
 * require.cache 被引入的模块将被缓存在这个对象中。 从此对象中删除键值对将会导致下一次 require 重新加载被删除的模块
 * require.resolve 使用内部的 require() 机制查询模块的位置，此操作只返回解析后的文件名，不会加载该模块。
 * 这里使用主要是为了删除缓存中的paths文件， 是为了确保能读取到可变化的.env的路径
 */
delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV || 'development';      //读取环境，在start.js和build.js开头就有定义
if (!NODE_ENV) {
    throw new Error(
        'The NODE_ENV environment variable is required but was not specified.'
    );
}

/**
 * dotenvFiles: 为了使用dotenv这个库， 项目不同需求，需要配置不同环境变量，按需加载不同的环境变量文件。
 * 将环境变量从.env加载到项目中
 * [ '.../config/.env.development.local',
  '.../config/.env.development',
  '.../config/.env.local',
  '.../config/.env' ]
 */
var dotenvFiles = [
    `${paths.dotenv}.${NODE_ENV}.local`,
    `${paths.dotenv}.${NODE_ENV}`,
    NODE_ENV !== 'test' && `${paths.dotenv}.local`,
    paths.dotenv,
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
        require('dotenv-expand')(
            require('dotenv').config({
                path: dotenvFile,
            })
        );
    }
});

/**
 * process.cwd()返回 Node.js 进程的当前工作目录。 fs.realpathSync() 返回已解析的路径名。
 * 这里的appDirectory就是/config路径
 * 
 * path.delimiter: 提供平台特定的路径定界符： ; 用于 Windows  : 用于 POSIX
 * 
 * path.isAbsolute: 判断是否是绝对路径
 * 
 *  */
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(folder => folder && !path.isAbsolute(folder))           //要求路径不是绝对路径,即前面不能有 '/'
    .map(folder => path.resolve(appDirectory, folder))              //给路径拼接出所在的真实路径
    .join(path.delimiter);                                          //再将拼接后的路径还原成字符串

const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment (publicUrl) {
    const raw = Object.keys(process.env)                            //解析process.env， 组装出我们定义的对象raw, 类似于： { NODE_ENV: 'development', PUBLIC_URL: '/xxx', .... }
        .filter(key => REACT_APP.test(key))
        .reduce(
            (env, key) => {
                env[key] = process.env[key];
                return env;
            },
            {
                NODE_ENV: process.env.NODE_ENV || 'development',        //用于确定我们是否在生产模式下运行。
                PUBLIC_URL: publicUrl,                                  //用于解析到“public”中的静态资产的正确路径。
            }
        );
    const stringified = {                                              //将raw Stringify化，类似于： { 'process.env': { NODE_ENV: '"development"', PUBLIC_URL: '"/"', .... } }，便于后面的Webpack DefinePlugin
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {}),
    };
    console.log(raw)
    return { raw, stringified };
}

module.exports = getClientEnvironment;
