"use strict";

var updateNotifier = require("update-notifier");
var { merge }= require("lodash/fp");
var pkg = require("../package.json");
var defaults = require("./defaults");

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
  return require("rc")("prez", defaults);
}

exports.options = function (args) {
  var defaults = readDefaults();

  return merge(defaults, {
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
