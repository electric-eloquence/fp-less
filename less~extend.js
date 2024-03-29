'use strict';

const {Transform} = require('stream');

const gulp = global.gulp || require('gulp');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const utils = require('fepper-utils');

const conf = global.conf;
const pref = global.pref;

// Set up pref.less.
pref.less = pref.less || {};

// Opt for line comments by default.
if (typeof pref.less.dumpLineNumbers === 'undefined') {
  pref.less.dumpLineNumbers = 'comments';
}

const cssBldDir = conf.ui.paths.source.cssBld;
const cssSrcDir = conf.ui.paths.source.cssSrc;

if (typeof pref.less.paths === 'undefined') {
  pref.less.paths = [cssSrcDir + '/less'];
}

const streamUntouched = () => new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(file, enc, cb) {
    this.push(file);
    cb();
  }
});

function getSourcemapDest() {
  if (
    pref.less.dumpLineNumbers === false &&
    pref.less.sourceMap &&
    !pref.less.sourceMap.sourceMapFileInline
  ) {
    return '.';
  }

  return;
}

function getSourceRoot() {
  if (
    pref.less.dumpLineNumbers === false &&
    pref.less.sourceMap
  ) {
    let sourceRoot;

    if (pref.less.sourceMap.sourceMapRootpath) {
      sourceRoot = pref.less.sourceMap.sourceMapRootpath;
    }
    else {
      const uiSourceDirRel = conf.ui.pathsRelative.source.root;
      const cssSrcDirRel = conf.ui.pathsRelative.source.cssSrc;

      if (cssSrcDirRel.indexOf(uiSourceDirRel) === 0) {
        const nestedDirs = cssSrcDirRel.slice(uiSourceDirRel.length);
        let i = nestedDirs.split('/').length;
        sourceRoot = '';

        while (i--) {
          sourceRoot += '../';
        }

        sourceRoot += `${cssSrcDirRel}/less`;
      }
    }

    return {sourceRoot};
  }

  return;
}

// Declare gulp tasks.

gulp.task('less', function () {
  let sourcemapsInit = sourcemaps.init;
  let sourcemapsWrite = sourcemaps.write;

  // Do not write sourcemaps if pref.less.sourceMap is falsy.
  // Do not write sourcemaps if dumpLineNumbers is truthy, as the sourcemaps may be inaccurate and the line comments
  // redundant.
  if (!pref.less.sourceMap || pref.less.dumpLineNumbers) {
    sourcemapsInit = () => {
      return streamUntouched();
    };
    sourcemapsWrite = () => {
      return streamUntouched();
    };
  }

  return gulp.src(cssSrcDir + '/less/*.less')
    .pipe(sourcemapsInit())
    .pipe(less(pref.less))
    .pipe(sourcemapsWrite(getSourcemapDest(), getSourceRoot()))
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('less:frontend-copy', ['less:no-comment']);

// This runs the CSS processor without outputting line comments.
// You probably want this to preprocess CSS destined for production.
gulp.task('less:no-comment', function () {
  const prefLessClone = Object.assign({}, pref.less, {dumpLineNumbers: false});

  return gulp.src(cssSrcDir + '/less/*.less')
    .pipe(less(prefLessClone))
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('less:once', ['less']);

gulp.task('less:watch', function () {
  // Return the watcher so it can be closed after testing.
  return gulp.watch('less/**/*', {cwd: cssSrcDir}, ['less']);
});

gulp.task('less:watch-no-comment', function () {
  // Return the watcher so it can be closed after testing.
  return gulp.watch('less/**/*', {cwd: cssSrcDir}, ['less:no-comment']);
});

gulp.task('less:help', function (cb) {
  let out = `
Fepper Less Extension

Use:
    <task> [<additional args>...]

Tasks:
    fp less                     Build Fepper's Less files into frontend CSS.
    fp less:frontend-copy       Copy Less-built frontend CSS to backend.
    fp less:no-comment          Like 'fp less' but without line comments.
    fp less:once                Same as 'fp less'.
    fp less:watch               Watch for modifications to Less files and build when modified.
    fp less:watch-no-comment    Like 'fp less:watch' but without line comments.
    fp less:help                Print fp-less tasks and descriptions.
`;

  utils.info(out);
  cb();
});
