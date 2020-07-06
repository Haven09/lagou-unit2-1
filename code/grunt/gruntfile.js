// 实现这个项目的构建任务

const process = require('process')
const path = require('path')

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

module.exports = grunt => {
  // 加载包含 "babel" 任务的插件，编译js文件
  require('load-grunt-tasks')(grunt);
  const Fontmin = require('fontmin');

  grunt.initConfig({
    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          //本意是不生成sourcemap文件，但是没找到生效的配置项
          sourceMap: false,
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: srcPath,
          src: cssPath,
          dest: tempPath,
          ext: '.css'
        }]
      }
    },
    babel: {
      dist: {
        options: {
          sourceMap: false,
          presets: ['@babel/preset-env']
        },
        files: [{
          expand: true,
          cwd: srcPath,
          src: jsPath,
          dest: tempPath,
          ext: '.js'
        }]
      }
    },
    swig: {
      development: {
        init: {
          autoescape: true
        },
        dest: tempPath,
        src: [path.join(srcPath, pagesPath)],
        generateSitemap: false,
        generateRobotstxt: false,
        generatedExtension: false,
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
    },
    copy: {
      html: {
        files: [{
          expand: true,
          src: path.join(tempPath, pagesPath),
          rename: function (dest, src, options) {
            return src.replace('.html.html', '.html');
          }
        }]
      },
      ref: {
        files: [
          { expand: true, cwd: tempPath, src: ['**'], dest: distPath }
        ]
      }
    },
    clean: {
      html: {
        src: ['temp/**.html.html']
      },
      tmp: {
        src: [tempPath]
      },
      all: {
        src: [distPath, tempPath]
      }
    },
    imagemin: {
      dist: {
        // files: [{
        //   expand: true,
        //   cwd: srcPath,
        //   src: [imagesPath],
        //   dest: distPath
        // }],
        files: [{
          expand: true,
          cwd: srcPath,
          src: '{,*assets/images/}*.{png,jpg,jpeg,gif,svg}',
          dest: distPath
        }]
      }
    },
    useref: {
      // specify which files contain the build blocks
      html: path.join(distPath, pagesPath),
      // explicitly specify the temp directory you are working in
      // this is the the base of your links ( "/" )
      temp: distPath
    },
    browserSync: {
      bsFiles: {
        src: ['temp/**', 'src/assets/fonts/**', 'src/assets/images/**', 'public/**']
      },
      options: {
        notify: false,
        watchTask: true,
        server: {
          baseDir: [tempPath, srcPath, publicPath],
          routes: {
            '/node_modules': 'node_modules'
          }
        }
      }
    },
    watch: {
      css: {
        files: path.join(srcPath, cssPath),
        tasks: ['css']
      },
      js: {
        files: path.join(srcPath, jsPath),
        tasks: ['js']
      },
      pages: {
        files: path.join(srcPath, pagesPath),
        tasks: ['html']
      }
    }
  })

  // 加载包含 "sass" 任务的插件，编译css文件
  grunt.loadNpmTasks('grunt-contrib-sass');
  // 加载包含 "swig" 任务的插件，编译html文件
  grunt.loadNpmTasks('grunt-swig');

  //图片压缩
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  //文字压缩
  grunt.registerTask('font', function () {
    const done = this.async()

    var fontmin = new Fontmin()
      .src(fontsPath, { base: srcPath, cwd: srcPath })
      .dest(distPath);

    fontmin.run(function (err, files) {
      if (err) throw err;
      done()
    });
  })
  //usererf插件
  grunt.loadNpmTasks('grunt-useref');

  grunt.registerTask('css', ['sass'])
  grunt.registerTask('js', ['babel'])
  grunt.registerTask('html', ['swig', 'copy:html', 'clean:html'])
  grunt.registerTask('image', ['imagemin'])

  grunt.loadNpmTasks('grunt-useref/node_modules/grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-useref/node_modules/grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-useref/node_modules/grunt-css');
  grunt.registerTask('ref', ['copy:ref', 'useref', 'concat', 'uglify', 'cssmin']);

  //js css html编译
  grunt.registerTask('complie', ['clean:all', 'css', 'js', 'html'])
  // js css html编译和打包
  grunt.registerTask('build', ['clean:all', 'css', 'js', 'html', 'image', 'font', 'ref'])

  //运行服务器
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.registerTask('serve', ['clean:all', 'complie', 'browserSync', 'watch'])

}