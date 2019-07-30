'use strict';
const gulp = require('gulp'),
  pug = require('gulp-pug'),
  prefixer = require('gulp-autoprefixer'),
  cssmin = require('gulp-cssmin'),
  sass = require('gulp-sass'),
  sassLint = require('gulp-sass-lint'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  spritesmith = require("gulp.spritesmith"),
  /*svgstore = require('gulp-svgstore'),
  svgmin = require('gulp-svgmin'),
  inject = require('gulp-inject'),
  rename = require('gulp-rename'),*/
  plumber = require('gulp-plumber'),
  notify = require("gulp-notify"),
  browserSync = require('browser-sync').create();

let path = {
  build: {
    html: 'build/',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/'
  },
  src: {
    pug: 'src/*.pug',
    style: 'src/sass/main.sass',
    img: 'src/images/**/*.*',
    pngSprite: 'src/sprite/png/',
    svgSprite: 'src/sprite/svg/**/*.svg',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    pug: 'src/**/*.pug',
    style: 'src/sass/**/*.*',
    img: 'src/images/**/*.*',
    pngSprite: 'src/sprite/png/*.png',
    svgSprite: 'src/sprite/svg/**/*.svg',
    fonts: 'src/fonts/**/*.*'
  }
};

gulp.task('browser-sync', (done) => {
  browserSync.init({
    server: {
      baseDir: "./build"
    }
  });
  done();
});

gulp.task('html:build', (done) => {
  gulp.src(path.src.pug)
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
  done();
});

gulp.task('style:build', (done) => {
  gulp.src(path.src.style)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true}))
    .pipe(prefixer())
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
  done();
});

gulp.task('sassLint', (done) => {
  gulp.src('src/sass/**/*.s+(a|c)ss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
  done();
});

gulp.task('image:build', (done) => {
  gulp.src(path.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
  done();
});

gulp.task('fonts:build', (done) => {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
  done();
});

// PNG Sprites
gulp.task('png-sprite', (done) => {
  let spriteData =
    gulp.src(path.src.pngSprite + '*.png')
      .pipe(spritesmith({
        retinaSrcFilter: path.src.pngSprite + '*@2x.png',
        imgName: 'sprite.png',
        retinaImgName: 'sprite@2x.png',
        cssName: '_png-sprite.sass',
        cssTemplate: 'sass.template.mustache',
        cssVarMap: (sprite) => {
          sprite.name = sprite.name;
          sprite.image2x = 'sprite@2x.png';
        }
      }));

  spriteData.img.pipe(gulp.dest('src/images/'));
  spriteData.css.pipe(gulp.dest('src/sass/'));
  done();
});

// SVG Sprites
/*gulp.task('svg-sprite', () => {
  let svgs = gulp.src(path.src.svgSprite)
    .pipe(rename({prefix: 'svg-icon-'}))
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents (filePath, file) {
    return file.contents.toString();
  }

  return gulp.src('src/pug/svg.pug')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('src/pug'));
});*/

gulp.task('build', gulp.series(
  'html:build',
  'style:build',
  'fonts:build',
  'image:build',
  'png-sprite'
  /*'svg-sprite'*/
));

gulp.task('watch', (done) => {
  gulp.watch(path.watch.pug, gulp.series('html:build'));
  gulp.watch(path.watch.style, gulp.series('style:build'));
  gulp.watch(path.watch.img, gulp.series('image:build'));
  gulp.watch(path.watch.pngSprite, gulp.series('png-sprite'));
  //gulp.watch(path.watch.svgSprite, gulp.series('svg-sprite'));
  gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
  done();
});

gulp.task('default', gulp.series('build', 'browser-sync', 'watch'));