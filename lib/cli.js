"use strict";

var updateNotifier = require("update-notifier");
var _ = require("lodash");
var path = require("path");
var pkg = require("../package.json");

exports.version = function () {
  console.log(pkg.version);
};

exports.help = function () {
  console.log("Usage: " + pkg.name + " <from> <to> [options]");
};

exports.checkUpdate = function () {
  updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
  }).notify();
};

function readDefaults () {
  var packageInfo = readPackageJson(process.cwd());

  return require("rc")("prez", {
    "slides": "slides",
    "skipReveal": false,
    "skipIndex": false,
    "skipUser": false,
    "keepHidden": false,
    "print": false,
    "printTheme": "simple",
    "phantomjs": "phantomjs",
    "suchNotes": false,
    "theme": "solarized",
    "highlightTheme": "zenburn",
    "dynamicTheme": true,
    "watch": false,
    "subCovers": false,
    "title": packageInfo.name || "Prez",
    "author": packageInfo.author || process.env.USER || "",
    "description": packageInfo.description || ""
  });
}

function readPackageJson (dir) {
  var packageInfo;
  try {
    var pathToPackage = path.resolve(dir, "package.json");
    packageInfo = require(pathToPackage);
  } catch(e) {
    // blank default
    // Do not define props to let merge do its magic properly
    packageInfo = {};
  }
  return packageInfo;
}

exports.options = function (args) {
  var defaults = readDefaults();

  return _.merge(defaults, {
    "slides": args.s || args["slides-dir"],
    "skipReveal": args["skip-reveal"],
    "skipIndex": args["skip-index"],
    "skipUser": args["skip-user"],
    "keepHidden": args["keep-hidden"],
    "print": args.print,
    "printTheme": args["print-theme"],
    "phantomjs": args.phantomjs,
    "suchNotes": args["such-notes"],
    "theme": args.theme,
    "highlightTheme": args["highlight-theme"],
    "dynamicTheme": !args["no-dynamic-theme"],
    "watch": args.w || args.watch,
    "subCovers": args["sub-covers"],
    // meta
    "title": args.title,
    "author": args.author,
    "description": args.description
  });
};
