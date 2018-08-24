"use strict";

const path = require("path");
const { last } = require("lodash/fp");

const REVEAL = getModuleRoot("reveal.js");
const DATA = path.resolve(__dirname, "..", "data");

// 3rd party
// these reveal and highlight files will be copied to target unless --skip-reveal is true

// in these tuples, first is source dir/file, second is a function to filter in when true
exports.REVEAL_FILES = [
  ["css", src => !src.endsWith("scss")], // remove extraneous sass files
  ["js", () => true],
  ["lib", src => /js|css|lib|league|source|head/.test(last(src.split("/")))], // keep only relevant fonts and js
  ["plugin", () => true]
].map(([dir, regexp]) => [path.join(REVEAL, dir), regexp]);

exports.PRINT_PDF_JS = path.resolve(REVEAL, "plugin", "print-pdf", "print-pdf.js");
exports.HL_STYLES = path.join(getModuleRoot("highlight.js"), "styles");

// these dirs will be copied to target unless --skip-user is true
exports.USER_FILES = ["css", "js", "images", "media"];

// prez
exports.DATA = DATA;
// demo files (unicorn…)
exports.INIT_FILES = path.join(DATA, "init");
exports.INDEX = "index.html";

function getModuleRoot (name) {
  var parts = require.resolve(name).split(path.sep);
  return parts.slice(0, parts.lastIndexOf("node_modules") + 2).join(path.sep);
}
