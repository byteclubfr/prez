'use strict'

const fs = require('fs')
const watch = require('node-watch')
const { castArray } = require('lodash/fp')
const { notify } = require('./notify')

module.exports = watcher

function watcher(filesOrDirectories, callback) {
  filesOrDirectories = castArray(filesOrDirectories)

  filesOrDirectories.forEach(file => notify('watch', file))

  watch(filesOrDirectories, file => {
    if (fs.existsSync(file)) {
      // can't know if update or create: let's say update
      callback(file, 'update')
    } else {
      callback(file, 'delete')
    }
  })
}
