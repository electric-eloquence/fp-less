'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const runSequence = require('run-sequence');

const conf = global.conf;

const cssBldDir = conf.ui.paths.source.cssBld;
const cssSrcDir = conf.ui.paths.source.cssSrc;

gulp.task('less', function () {
  return gulp.src(cssSrcDir + '/less/*.less')
    .pipe(less({
      paths: [cssSrcDir + '/less']
    }))
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('less:once', ['less']);

gulp.task('less:frontend-copy', function (cb) {
  runSequence(
    'less',
    'ui:copy-styles',
    cb
  );
});

gulp.task('less:watch', function () {
  gulp.watch('less/**/*', {cwd: cssSrcDir}, ['less']);
});
