"use strict";

var updateNotifier = require("update-notifier");
var pkg = require("../package.json");

exports.version = function () {
  console.log(pkg.version);
};

exports.help = function () {
  console.log("Usage: " + pkg.name + " <from> <to> [options]");
};

exports.checkUpdate = function () {
  updateNotifier({
    packageName:    pkg.name,
    packageVersion: pkg.version
  }).notify();
};
