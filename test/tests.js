'use strict';

const fs = require('fs-extra');
const {dirname, extname} = require('path');

const expect = require('chai').expect;

// Instantiate gulp and assign it to the fp const.
process.env.ROOT_DIR = __dirname;
const fp = require('fepper/tasker');
require('../less~extend');

const conf = global.conf;
const pref = global.pref;

const pubCssBldDir = conf.ui.paths.public.cssBld;
const srcCssBldDir = conf.ui.paths.source.cssBld;
const srcCssSrcDir = conf.ui.paths.source.cssSrc;

const cssHtml = 'html {\n  font-size: 62.5%;\n}\n';
const cssBody = `body {
  background: white;
  font: 1.6em/1.5 Helvetica, "Nimbus Sans L", "Liberation Sans", Roboto, sans-serif;
  color: #333333;
  min-height: 100vh;
  padding-bottom: 5rem;
  position: relative;
}
`;
const cssA = `a {
  color: #333333;
}
`;
const cssPseudoClass = `a:hover,
a:focus {
  color: gray;
}
`;
const enc = 'utf8';
const styleBack = `${__dirname}/backend/${pref.backend.synced_dirs.styles_dir}/bld/style.css`;
const styleBld = `${srcCssBldDir}/style.css`;
const styleLocalPref = `${srcCssBldDir}/local-pref.css`;
const styleLess = `${srcCssSrcDir}/less/style.less`;
const styleWatchCss = `${srcCssBldDir}/watch-fixture.css`;
const styleWatchLess = `${srcCssSrcDir}/less/watch-fixture.less`;
const sourcemap = `${styleBld}.map`;
const lessHtml = 'html {\n  font-size: 62.5%;\n}\n';

function rmSrcCssBldFiles(files) {
  for (const file of files) {
    if (extname(file) === '.css') {
      fs.unlinkSync(`${srcCssBldDir}/${file}`);
    }
  }
}

function rmSrcCssMapFiles(files) {
  for (const file of files) {
    if (extname(file) === '.map') {
      fs.unlinkSync(`${srcCssBldDir}/${file}`);
    }
  }
}

describe('fp-less', function () {
  describe('fp less', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'less',
          done
        );
      });
    });

    it('compiles LESS partials into a CSS file with line comments', function (done) {
      const styleBldCss = fs.readFileSync(styleBld, enc);

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.have.string(cssBody);
      expect(styleBldCss).to.have.string(cssA);
      expect(styleBldCss).to.have.string(cssPseudoClass);
      expect(styleBldCss).to.have.string('/* line 3');
      expect(styleBldCss).to.have.string('/* line 11');
      expect(styleBldCss).to.have.string('/* line 13');

      done();
    });

    it('accepts custom options', function (done) {
      pref.less.dumpLineNumbers = false;

      fp.runSeq(
        'less',
        () => {
          const styleBldCss = fs.readFileSync(styleBld, enc);

          expect(styleBldCss).to.have.string(cssBody);
          expect(styleBldCss).to.have.string(cssA);
          expect(styleBldCss).to.have.string(cssPseudoClass);
          expect(styleBldCss).to.not.have.string('/* line ');

          pref.less.dumpLineNumbers = 'comments';

          done();
        }
      );
    });

    describe('sourcemapping', function () {
      let sourcemapExistsBefore;

      before(function (done) {
        fs.readdir(srcCssBldDir, (err, files) => {
          rmSrcCssMapFiles(files);

          pref.less.sourceMap = {};

          done();
        });
      });

      beforeEach(function (done) {
        pref.less.dumpLineNumbers = false;

        fs.readdir(srcCssBldDir, (err, files) => {
          rmSrcCssMapFiles(files);

          sourcemapExistsBefore = fs.existsSync(sourcemap);

          done();
        });
      });

      after(function () {
        pref.less.dumpLineNumbers = 'comments';
        delete pref.less.sourceMap;
      });

      it('does not write a sourcemap if configured to print line comments', function (done) {
        pref.less.dumpLineNumbers = 'comments';

        fp.runSeq(
          'less',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.false;
            expect(styleBldCss).to.not.have.string('/*# sourceMappingURL=');

            pref.less.dumpLineNumbers = false;

            done();
          }
        );
      });

      it('writes a sourcemap inline if configured to so', function (done) {
        pref.less.sourceMap.sourceMapFileInline = true;

        fp.runSeq(
          'less',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.false;
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=data:application/json;');

            fs.copyFileSync(styleBld, `${pubCssBldDir}/sourcemap-inline.css`);
            delete pref.less.sourceMap.sourceMapFileInline;

            done();
          }
        );
      });

      it('writes a sourcemap file if configured to do so', function (done) {
        fp.runSeq(
          'less',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const sourcemapJson = fs.readJsonSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.true;
            expect(sourcemapJson).to.have.property('version');
            expect(sourcemapJson).to.have.property('sources');
            expect(sourcemapJson).to.have.property('names');
            expect(sourcemapJson).to.have.property('mappings');
            expect(sourcemapJson).to.have.property('file');
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=');

            done();
          }
        );
      });

      it('writes a sourcemap file with a custom sourceRoot if configured to so', function (done) {
        pref.less.sourceMap.sourceMapRootpath = '/foo/bar';

        fp.runSeq(
          'less',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const sourcemapJson = fs.readJsonSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.true;
            expect(sourcemapJson.sourceRoot).to.equal(pref.less.sourceMap.sourceMapRootpath);
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=');

            fs.copyFileSync(styleBld, styleBld.replace(srcCssBldDir, pubCssBldDir));
            fs.copyFileSync(sourcemap, sourcemap.replace(srcCssBldDir, pubCssBldDir));
            delete pref.less.sourceMap.sourceMapRootpath;

            done();
          }
        );
      });
    });
  });

  describe('fp less:frontend-copy', function () {
    const styleBackAlt = `${__dirname}/backend/docroot/local-pref/local-pref.css`;
    let styleBackExistsBefore;
    let styleBackAltExistsBefore;
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleBack)) {
          fs.emptyDirSync(dirname(styleBack));
        }
        if (fs.existsSync(styleBackAlt)) {
          fs.emptyDirSync(dirname(styleBackAlt));
        }

        styleBackExistsBefore = fs.existsSync(styleBack);
        styleBackAltExistsBefore = fs.existsSync(styleBackAlt);
        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'less:frontend-copy',
          'frontend-copy',
          done
        );
      });
    });

    it('compiles Less without line comments and copy it to the backend', function () {
      const styleBackCss = fs.readFileSync(styleBack, enc);
      const styleBackAltCss = fs.readFileSync(styleBackAlt, enc);
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBackExistsBefore).to.be.false;
      expect(styleBackAltExistsBefore).to.be.false;

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.not.have.string('/* line ');
      expect(styleLocalPrefCss).to.not.have.string('/* line ');

      expect(styleBldCss).to.equal(styleBackCss);
      expect(styleLocalPrefCss).to.equal(styleBackAltCss);
    });

    it('copies CSS without sourcemapping to the backend', function () {
      const styleBackCss = fs.readFileSync(styleBack, enc);
      const styleBackAltCss = fs.readFileSync(styleBackAlt, enc);

      expect(styleBackCss).to.not.have.string('/*# sourceMappingURL=');
      expect(styleBackAltCss).to.not.have.string('/*# sourceMappingURL=');
    });
  });

  describe('fp less:no-comment', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'less:no-comment',
          done
        );
      });
    });

    it('does not print line comments', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.not.have.string('/* line ');
      expect(styleLocalPrefCss).to.not.have.string('/* line ');
    });
  });

  describe('fp less:once', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'less:once',
          done
        );
      });
    });

    it('is an alias for `fp less`', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.have.string(cssBody);
      expect(styleBldCss).to.have.string(cssA);
      expect(styleBldCss).to.have.string(cssPseudoClass);
      expect(styleLocalPrefCss).to.have.string(cssBody);
      expect(styleLocalPrefCss).to.have.string(cssA);
      expect(styleLocalPrefCss).to.have.string(cssPseudoClass);

      expect(styleBldCss).to.have.string('/* line 3');
      expect(styleBldCss).to.have.string('/* line 11');
      expect(styleBldCss).to.have.string('/* line 13');
      expect(styleLocalPrefCss).to.have.string('/* line 3');
      expect(styleLocalPrefCss).to.have.string('/* line 11');
      expect(styleLocalPrefCss).to.have.string('/* line 13');
    });
  });

  describe('fp less:watch', function () {
    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchLess)) {
          fs.unlinkSync(styleWatchLess);
        }

        done();
      });
    });

    after(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchLess)) {
          fs.unlinkSync(styleWatchLess);
        }

        done();
      });
    });

    it('compiles LESS into bld CSS with line comments when a LESS partial is modified', function (done) {
      const less = fs.readFileSync(styleLess, enc);
      const watcher = fp.tasks['less:watch'].fn();

      setTimeout(() => {
        fs.writeFileSync(styleWatchLess, less + lessHtml);
        setTimeout(() => {
          const css = fs.readFileSync(styleWatchCss, enc);

          expect(css).to.have.string(cssHtml);
          expect(css).to.have.string(cssBody);
          expect(css).to.have.string(cssA);
          expect(css).to.have.string(cssPseudoClass);
          expect(css).to.have.string('/* line 3');
          expect(css).to.have.string('/* line 11');
          expect(css).to.have.string('/* line 13');

          watcher.close();
          done();
        }, 500);
      }, 100);
    });
  });

  describe('fp less:watch-no-comment', function () {
    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchLess)) {
          fs.unlinkSync(styleWatchLess);
        }

        done();
      });
    });

    after(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchLess)) {
          fs.unlinkSync(styleWatchLess);
        }

        done();
      });
    });

    it('compiles LESS into bld CSS without line comments when a LESS partial is modified', function (done) {
      const less = fs.readFileSync(styleLess, enc);
      const watcher = fp.tasks['less:watch-no-comment'].fn();

      setTimeout(() => {
        fs.writeFileSync(styleWatchLess, less + lessHtml);
        setTimeout(() => {
          const css = fs.readFileSync(styleWatchCss, enc);

          expect(css).to.have.string(cssHtml);
          expect(css).to.have.string(cssBody);
          expect(css).to.have.string(cssA);
          expect(css).to.have.string(cssPseudoClass);
          expect(css).to.not.have.string('/* line ');

          watcher.close();
          done();
        }, 500);
      }, 100);
    });
  });

  describe('fp less:help', function () {
    it('prints help text', function (done) {
      fp.runSeq(
        'less:help',
        done
      );
    });
  });
});
