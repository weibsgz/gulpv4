//如果没有返回 stream, promise, event emitters, child processes, observables 需要手动调用 cb 标识任务完成
const path = require('path');
const { src, dest, task, series, parallel, watch } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const postCSS = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const gulpSass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const named = require('vinyl-named');
const webpack = require('webpack-stream');
// const fileInclude = require('gulp-file-include'); // html文件导入
const includer = require('gulp-htmlincluder'); // html文件导入
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const del = require('del'); // delete files and folders
const plumber = require('gulp-plumber');
let { serverConf, resolvePath } = require('./build/gulp.config');
const buildConf = require('./build.config');

const config = resolvePath(buildConf.gulpConf);
serverConf = Object.assign({}, serverConf, buildConf.serverConf);

const NODE_ENV = process.env.NODE_ENV || 'production';

// 处理 css
async function css(cb) {
  if (NODE_ENV === 'production') {
    await del([config.css.dest]);
  }
  let cssStream = src(config.css.src)
    .pipe(plumber())
    .pipe(sourceMaps.init({ loadMaps: false }))
    .pipe(gulpSass())
    .pipe(postCSS([autoprefixer({ cascade: true, grid: 'autoplace' })]))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }));
  cssStream = config.css.isConcat ? cssStream.pipe(concat('index.min.css')) : cssStream;
  cssStream = cssStream.pipe(sourceMaps.write('./')).pipe(dest(config.css.dest));
  cssStream = NODE_ENV === 'development' ? cssStream.pipe(browserSync.stream()) : cssStream;
  return cssStream;
}

// 处理图片
async function image(cb) {
  if (NODE_ENV === 'production') {
    await del([config.image.dest]);
  }
  let imgStream = src(config.image.src).pipe(plumber()).pipe(dest(config.image.dest));
  imgStream = NODE_ENV === 'development' ? imgStream.pipe(browserSync.stream()) : imgStream;
  return imgStream;
}

// 处理js
async function js(cb) {
  if (NODE_ENV === 'production') {
    await del([config.js.dest]);
  }
  let webpackConf = require('./build/webpack.config');
  webpackConf = Object.assign({}, { mode: NODE_ENV }, webpackConf, buildConf.webpackConf);
  let jsStream = src(config.js.src)
    .pipe(plumber())
    // .pipe(babel()) // babel 编译 ES6
    // .pipe(uglify()) // 压缩 js
    .pipe(named()) // 配合 webpack 禁用 chunkHash 命名文件
    .pipe(webpack(webpackConf))
    .pipe(sourceMaps.init())
    .pipe(rename({ suffix: '.min' }));
  jsStream = config.js.isConcat ? jsStream.pipe(concat('bundle.min.js')) : jsStream; // 是否合并文件
  jsStream = jsStream.pipe(sourceMaps.write('./')).pipe(dest(config.js.dest));
  jsStream = NODE_ENV === 'development' ? jsStream.pipe(browserSync.stream()) : jsStream;
  return jsStream;
}

// 处理 html
async function html(cb) {
  if (NODE_ENV === 'production') {
    await del([config.html.dest]);
  }
  let options = require('./build/htmlincluder.config'); // gulp-htmlincluder
  options = Object.assign({}, options, buildConf.htmlIncluderConf);
  let htmlStream = src(config.html.src).pipe(plumber()).pipe(includer(options));
  htmlStream = htmlStream.pipe(dest(config.html.dest));
  htmlStream = NODE_ENV === 'development' ? htmlStream.pipe(browserSync.stream()) : htmlStream;
  return htmlStream;
}

// 处理依赖库资源
async function libs(cb) {
  if (NODE_ENV === 'production') {
    await del([config.libs.dest]);
  }
  let libsStream = src(config.libs.src).pipe(plumber()).pipe(dest(config.libs.dest));
  libsStream = NODE_ENV === 'development' ? libsStream.pipe(browserSync.stream()) : libsStream;
  return libsStream;
}

// 启动服务, 监听文件变化
function server(cb) {
  // let startPath = path.join(html.dest, serverConf.index);
  // options.startPath = os.type().toLowerCase().includes('windows') && startPath.replace(/\\/gi, '/');
  let options = {
    watch: true,
    open: serverConf.openBrowser,
    server: {
      baseDir: serverConf.baseDir,
      index: serverConf.index,
    },
    port: serverConf.port,
    host: serverConf.host,
    startPath: path.join(config.html.dest, serverConf.index).replace(/\\/gi, '/'),
  };

  browserSync.init(options);
  watch(config.html.src).on('change', series(html, browserSync.reload));
  watch(config.css.src, parallel(css));
  watch(config.js.src, parallel(js));
  watch(config.image.src, parallel(image));
  watch(config.libs.src, parallel(libs));
}

exports.dev = parallel(server, css, js, image, libs, html);
exports.build = parallel(css, js, image, libs, html);
