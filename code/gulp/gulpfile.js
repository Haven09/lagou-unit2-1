// 实现这个项目的构建任务

const process = require('process')
const path = require('path')
const { src, dest, series, parallel, watch } = require('gulp')
const plugins = require('gulp-load-plugins')()
const del = require('del')
const bs = require('browser-sync')

const cwd = process.cwd()

const distPath = 'dist'
const srcPath = 'src'
const publicPath = 'public'
const tempPath = 'temp'
const pagesPath = '*.html'
const cssPath = 'assets/styles/*.scss'
const jsPath = 'assets/scripts/*.js'
const imagesPath = 'assets/images/**'
const fontsPath = 'assets/fonts/**'

const data = {
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'Features',
            link: 'features.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [
                {
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

//css模板解析
const css = () => {
    return src(path.join(srcPath, cssPath), { base: srcPath })
        .pipe(plugins.sass())
        .pipe(dest(tempPath))
}
//html模板解析
const html = () => {
    return src(path.join(srcPath, pagesPath), { base: srcPath })
        .pipe(plugins.swig({ data, defaults: { cache: false } }))
        .pipe(dest(tempPath))
}
//js模板解析
const js = () => {
    return src(path.join(srcPath, jsPath), { base: srcPath })
        .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
        .pipe(dest(tempPath))
}
//图片转换
const image = () => {
    return src(path.join(srcPath, imagesPath), { base: srcPath })
        .pipe(plugins.imagemin())
        .pipe(dest(distPath))
}
//文字转换
const font = () => {
    return src(path.join(srcPath, fontsPath), { base: srcPath })
        .pipe(plugins.imagemin())
        .pipe(dest(distPath))
}
//文件引用处理
const useref = () => {
    return src(path.join(tempPath, pagesPath), { base: tempPath })
        .pipe(plugins.useref({ searchPath: [tempPath, ''] }))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest(distPath))
}

//运行服务器
const server = () => {
    //为什么这个地方不能用path.join(srcPath, pagesPath)的方式
    // watch(path.join(srcPath, pagesPath), html)
    watch(pagesPath, { cwd: srcPath }, html)
    watch(jsPath, { cwd: srcPath }, js)
    watch(cssPath, { cwd: srcPath }, css)

    watch(
        [
            imagesPath,
            fontsPath
        ], { cwd: srcPath }, bs.reload
    )

    watch(
        '**', { cwd: publicPath }, bs.reload
    )

    bs.init({
        notify: false,
        watch: true,
        server: {
            open: true,
            baseDir: [tempPath, srcPath, publicPath],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

//其他文件处理
const extra = () => {
    return src(publicPath, { base: publicPath })
        .pipe(dest(distPath))
}
//清除文件
const clean = () => {
    return del(['dist', 'temp'])
}
// 项目lint
function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}
const lint = () => {
    return src('src/**/*.js')
        .pipe(plugins.eslint(
            {
                globals: [
                    'jQuery',
                    '$'
                ],
                fix: true
            }
        ))
        .pipe(plugins.eslint.format())
        .pipe(plugins.if(isFixed, dest(srcPath)))
        .pipe(plugins.eslint.failAfterError())
}

const complie = parallel(html, js, css)

const build = series(
    clean,
    lint,
    parallel(
        series(
            complie,
            useref
        ),
        font,
        image,
        extra
    )
)

const serve = series(complie, server)

module.exports = {
    complie,
    lint,
    clean,
    build,
    serve
}