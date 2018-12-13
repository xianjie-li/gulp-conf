const gulp = require('gulp')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const fileSystem = require('fs')

const watch = require('gulp-watch')

const changed = require('gulp-changed')

// 浏览器前缀
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

// 压缩CSS
const minifyCSS = require('gulp-minify-css')
const rename = require('gulp-rename')

// 雪碧图
const spriter = require('gulp-spriter')

// 编译失败处理
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')

const sourcemaps = require('gulp-sourcemaps')

// 浏览器重载
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

// 代理
const proxy = require('http-proxy-middleware')

// 路径替换
const replace = require('gulp-replace')

// 打包工具
const runSequence = require('gulp-sequence').use(gulp)

// 清空dist
const clean = require('gulp-clean')

// const assetRev     = require('gulp-asset-rev');

// 项目目录
const dirs = {
  dist: './dist',
  src: './src',
  lib: './src/lib',
  css: './src/style/css',
  js: './src/script/js',
  images: './src/images',
  slice: './src/images/slice',
  sass: './src/style/sass',
  sassCom: './src/style/sass/components',
  es6: './src/script/es6'
}

// 图片压缩
gulp.task('minify-img', () => {
  const imagemin = require('gulp-imagemin')
  const pngquant = require('imagemin-pngquant')
  const smushit = require('gulp-smushit')
  return gulp
    .src(dirs.images + '/*.*')
    .pipe(
      imagemin({
        progressive: true,
        use: [pngquant()]
      })
    )
    .pipe(
      smushit()
    )
    .pipe(gulp.dest(dirs.images))
})

// 生成目录
gulp.task('create', () => {
  const mkdirp = require('mkdirp')
  for (let i in dirs) {
    mkdirp(dirs[i], err => {
      err ? console.log(err) : console.log('mkdir-->' + dirs[i])
    })
  }
})

// 开发服务器
gulp.task('server', ['sass', 'babel'], () => {
  // 配置代理
  let middleware = proxy('/api', {
    target: 'http://tfw.tooge.cn/',
    changeOrigin: true
  })

  browserSync.init({
    server: {
      baseDir: [dirs.src, dirs.dist],
      middleware: [middleware]
    }
  })

  gulp.watch(dirs.src + '/*.html', reload)
  gulp.watch(dirs.css + '/*.css', reload)
  gulp.watch(dirs.js + '/*.js', reload)

  gulp.watch(dirs.sass + '/*.scss', ['sass'])
  gulp.watch(dirs.es6 + '/*.js', ['babel'])

  watch(dirs.src + '/*.html').on('add', function() {
    gulp.watch(dirs.src + '/*.html', reload)
  })

  watch(dirs.css + '/*.css').on('add', function() {
    gulp.watch(dirs.css + '/*.css', reload)
  })

  watch(dirs.js + '/*.js').on('add', function() {
    gulp.watch(dirs.js + '/*.js', reload)
  })

  watch(dirs.es6 + '/*.js')
    .on('add', function() {
      gulp.watch(dirs.es6 + '/*.js', ['babel'])
    })
    .on('unlink', function(file) {
      // 移除该文件相关的编译文件
      let fileName = file.split('\\')
      let _file = fileName[fileName.length - 1]
      fileSystem.existsSync(dirs.js + '/' + _file) &&
        fileSystem.unlink(dirs.js + '/' + _file)
      fileSystem.existsSync(dirs.js + '/' + _file + '.map') &&
        fileSystem.unlink(dirs.js + '/' + _file + '.map')
      console.log('删除文件:' + dirs.js + '/' + _file)
    })

  watch(dirs.sass + '/*.scss')
    .on('add', function() {
      gulp.watch(dirs.sass + '/*.scss', ['sass'])
    })
    .on('unlink', function(file) {
      let fileName = file.split('\\')
      let _file = fileName[fileName.length - 1].replace('scss', 'css')
      fileSystem.existsSync(dirs.css + '/' + _file) &&
        fileSystem.unlink(dirs.css + '/' + _file)
      fileSystem.existsSync(dirs.css + '/' + _file + '.map') &&
        fileSystem.unlink(dirs.css + '/' + _file + '.map')
      console.log('删除文件:' + dirs.css + '/' + _file)
    })

  watch(dirs.sassCom + '/*.scss').on('add', function() {
    gulp.watch(dirs.sassCom + '/*.scss', ['sass'])
  })
})

// sass
gulp.task('sass', () => {
  return (
    gulp
      .src(dirs.sass + '/*.scss')
      // .pipe(changed(dirs.sass + '/*.scss'))
      // .pipe(changed(dirs.css, {extension: '.css'}))
      .pipe(
        plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
      )
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(
        postcss([
          autoprefixer({
            browsers: ['last 30 versions', 'Android >= 3.0', 'not ie <= 7']
          })
        ])
      )
      .pipe(
        spriter({
          sprite: 'sprites.png',
          slice: './src/images/slice',
          outpath: './src/images'
        })
      )
      .pipe(minifyCSS({ keepBreaks: true }))
      .pipe(replace('/images/', '../../images/'))
      .pipe(replace('images/', '../../images/'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dirs.css))
  )
})

// babel
gulp.task('babel', () => {
  return gulp
    .src(dirs.es6 + '/*.js')
    .pipe(changed(dirs.es6 + '/*.js'))
    .pipe(changed(dirs.js, { extension: '.js' }))
    .pipe(
      plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['env']
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.js))
})

// 打包1 clear
gulp.task('clear', () => {
  const clean = require('gulp-clean')
  return gulp.src('./dist', { read: false }).pipe(clean())
})

// 打包2 css
gulp.task('movecss', () => {
  return gulp
    .src(dirs.css + '/*.*')
    .pipe(replace('../../images/', '../images/'))
    .pipe(gulp.dest(dirs.dist + '/css'))
})

// 打包3 js
gulp.task('movejs', () => {
  return gulp
    .src(dirs.js + '/*.*')
    .pipe(replace('../../images/', '../images/'))
    .pipe(gulp.dest(dirs.dist + '/js'))
})

// 打包4 图片
gulp.task('moveimg', () => {
  return gulp.src(dirs.images + '/*.*').pipe(gulp.dest(dirs.dist + '/images'))
})

// 打包5 html
gulp.task('movehtml', () => {
  return (
    gulp
      .src('./src/*.html')
      // .pipe(assetRev())
      .pipe(replace('./style/css', './css'))
      .pipe(replace('style/css', './css'))
      .pipe(replace('./script/js', './js'))
      .pipe(replace('script/js', './js'))
      .pipe(gulp.dest(dirs.dist))
  )
})

/**
 * gulp-asset-rev => 版本号调整
 * var verStr = (options.verConnecter || "-") + md5;
 * src = src + "?v=qfl"+verStr;
 */

// 打包6 lib
gulp.task('movelib', () => {
  return gulp.src('./src/lib/**/*').pipe(gulp.dest(dirs.dist + '/lib'))
})

// zip
gulp.task('zip', () => {
  const zip = require('gulp-zip')
  return gulp
    .src(['**/dist/**/*', '!**/node_modules/**/*.*'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'))
})

// 打包
gulp.task(
  'build',
  runSequence(
    'clear',
    'movecss',
    'movejs',
    'minify-img',
    'moveimg',
    'movehtml',
    'movelib'
    // ,'zip'
  )
)
