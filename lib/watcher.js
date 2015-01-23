"use strict";

var fs = require("fs");
var watch = require("node-watch");

module.exports = watcher;

function watcher (filesOrDirectories, callback) {
  watch(filesOrDirectories, function (file) {
    if (fs.existsSync(file)) {
      // can't know if update or create: let's say update
      callback(file, "update");
    } else {
      callback(file, "delete");
    }
  });
}
