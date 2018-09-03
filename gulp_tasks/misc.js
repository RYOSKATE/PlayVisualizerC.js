const path = require('path');

const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');

const conf = require('../conf/gulp.conf');

gulp.task('clean', clean);
gulp.task('other', other);
gulp.task('tmp', tmp);

function clean() {
  return del([conf.paths.dist, conf.paths.tmp, conf.paths.out]);
}

function other() {
  const fileFilter = filter(file => file.stat.isFile());

  return gulp.src(
    ['/css/**', '/fonts/**', '/images/**', '/js/**'].map(dir => path.join(conf.paths.page, dir)),
    { base: `${conf.paths.page}` })
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.dist));
}

function tmp() {
  const fileFilter = filter(file => file.stat.isFile());

  return gulp.src(
    ['/css/**', '/fonts/**', '/images/**', '/js/**'].map(dir => path.join(conf.paths.page, dir)),
    { base: `${conf.paths.page}` })
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.tmp));
}