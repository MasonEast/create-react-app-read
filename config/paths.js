/**
 * 主要是处理文件路径问题
 */


const path = require('path');
const fs = require('fs');
const url = require('url');

/**
 * process.cwd()返回 Node.js 进程的当前工作目录。 fs.realpathSync() 返回已解析的路径名。
 * 这里的appDirectory就是/config路径
 *  */
const appDirectory = fs.realpathSync(process.cwd());

//定义resolveApp方法拼接获取真实路径，这里是/config/xxx
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;        //该变量在这里声明是undefined

function ensureSlash (inputPath, needsSlash) {      //判断路径是否需要 '/'结尾
    const hasSlash = inputPath.endsWith('/');       //判断传入的路径结尾是否有 '/' ， 有为true， 没有为false
    if (hasSlash && !needsSlash) {
        return inputPath.substr(0, inputPath.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${inputPath}/`;
    } else {
        return inputPath;
    }
}

const getPublicUrl = appPackageJson =>
    envPublicUrl || require(appPackageJson).homepage;


function getServedPath (appPackageJson) {       //这里一般传入的都是package.json
    const publicUrl = getPublicUrl(appPackageJson);         //如果有PUBLIC_URL就是它， 没有就是package.json里的homepage
    const servedUrl =
        envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');      //如果都没有就使用 '/'
    return ensureSlash(servedUrl, true);
}

const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {        //判断文件是否是上面定义的那些文件后缀， 是的话就按对应的处理，不是的话默认为js文件。
    const extension = moduleFileExtensions.find(extension =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveApp('build'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveModule(resolveApp, 'src/index'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveApp('tsconfig.json'),
    appJsConfig: resolveApp('jsconfig.json'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveModule(resolveApp, 'src/setupTests'),
    proxySetup: resolveApp('src/setupProxy.js'),
    appNodeModules: resolveApp('node_modules'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
};



module.exports.moduleFileExtensions = moduleFileExtensions;