# Less extension for Fepper

### Install
Add these tasks to `excludes/extend/custom.js`:

* Under gulp task 'custom:frontend-copy'
  * 'less:frontend-copy'
* Under gulp task 'custom:once'
  * 'less'
* Under gulp task 'custom:watch'
  * 'less:watch'

Create a `source/_styles/src/less` directory and put all Less code there.
