"use strict";

const fs = require("fs");
const watch = require("node-watch");
const { castArray } = require("lodash/fp");
const { notify } = require("./notify");

module.exports = watcher;

function watcher(filesOrDirs, callback) {
  filesOrDirs = castArray(filesOrDirs)
    .filter(fs.existsSync)
    .map(file => {
      notify("watch", file);
      return file;
    });

  watch(filesOrDirs, { recursive: true }, (evt, file) => {
    if (fs.existsSync(file)) {
      // can't know if update or create: let's say update
      callback(file, "update");
    } else {
      callback(file, "delete");
    }
  });
}
