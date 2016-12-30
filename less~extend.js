'use strict';

const conf = global.conf;
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const appDir = global.appDir;
const utils = require(`${appDir}/core/lib/utils`);

const cssBldDir = utils.pathResolve(conf.ui.paths.source.cssBld);
const cssSrcDir = utils.pathResolve(conf.ui.paths.source.cssSrc);

gulp.task('less', function () {
  return gulp.src(cssSrcDir + '/less/*.less')
    .pipe(plugins.less({
      paths: [cssSrcDir + '/less']
    }))
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('less:once', ['less']);

gulp.task('less:frontend-copy', function (cb) {
  runSequence(
    'less',
    'patternlab:copy-styles',
    cb
  );
});

gulp.task('less:watch', function () {
  gulp.watch('less/**', {cwd: cssSrcDir}, ['less']);
});
