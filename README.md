# Less extension for Fepper

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Mac/Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

### Install

```shell
cd extend
npm install --save-dev fp-less
```

### Use

Add these tasks to `extend/custom.js`:

* Under gulp task `'custom:frontend-copy'`
  * `'less:frontend-copy'`
* Under gulp task `'custom:once'`
  * `'less:once'`
* Under gulp task `'custom:watch'`
  * `'less:watch'`

On the command line:

```shell
fp less[:subtask]
```

Create a `source/_styles/src/less` directory and put all Less code there.

This extension will read one directory deep for files with a `.less` extension. 
Partials must be nested deeper. Less code will be preprocessed into CSS and 
built into the `paths.source.cssBld` directory as declared in 
`patternlab-config.json`.

This extension defaults toward the printing of line comments for debugging 
purposes. Doing so provides an unambiguous indication that the CSS was 
preprocessed and that direct edits to the CSS should be avoided. If a project 
decision is made to style with Less, it would be a good idea to have version 
control ignore CSS builds in the `source` directory. This would avoid committing 
line comments, which could otherwise lead to a morass of conflicts.

Another debugging alternative is writing CSS sourcemaps. (However, this will not 
work if line comments are enabled.) Add the following to your `pref.yml` file:

```yaml
less:
  dumpLineNumbers: false
  sourceMap: true
```

To write sourcemaps inline, configure as follows:

```yaml
less:
  dumpLineNumbers: false
  sourceMap:
    sourceMapFileInline: true
```

### Tasks

#### `'less'`
* Builds Less into CSS.
* Overwrites CSS whether or not it has direct edits.
* Respects the `less.dumpLineNumbers` setting in `pref.yml`.
* If `less.dumpLineNumbers` is not set, will default to printing line comments.

#### `'less:frontend-copy'`
* Usually under gulp task `'custom:frontend-copy'`.
* Builds Less without line comments
* The `frontend-copy` task then copies the CSS to the backend.
* Ignores any `less.dumpLineNumbers` setting in `pref.yml`.

#### `'less:no-comment'`
* Same as `'less'` and `'less:once'` but without line comments.
* Ignores any `less.dumpLineNumbers` setting in `pref.yml`.

#### `'less:once'`
* Usually under gulp task `'custom:once'`.
* Same as `'less'`.

#### `'less:watch'`
* Usually under gulp task `'custom:watch'`.
* Watches the `source/_styles/src/less` directory for file modifications.
* Triggers `less` and overwrites CSS whether or not it has direct edits.

#### `'less:watch-no-comment'`
* Usually under gulp task `'custom:watch'`.
* Watches the `source/_styles/src/less` directory for file modifications.
* Triggers `less:no-comment` and overwrites CSS whether or not it has direct 
  edits.

[snyk-image]: https://snyk.io/test/github/electric-eloquence/fp-less/master/badge.svg
[snyk-url]: https://snyk.io/test/github/electric-eloquence/fp-less/master

[travis-image]: https://img.shields.io/travis/electric-eloquence/fp-less.svg?label=mac%20%26%20linux
[travis-url]: https://travis-ci.org/electric-eloquence/fp-less

[appveyor-image]: https://img.shields.io/appveyor/ci/e2tha-e/fp-less.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/e2tha-e/fp-less

[coveralls-image]: https://img.shields.io/coveralls/electric-eloquence/fp-less/master.svg
[coveralls-url]: https://coveralls.io/r/electric-eloquence/fp-less

[license-image]: https://img.shields.io/github/license/electric-eloquence/fp-less.svg
[license-url]: https://raw.githubusercontent.com/electric-eloquence/fp-less/master/LICENSE
