"use strict";
const path = require("path");

var REVEAL = getModuleRoot("reveal.js");

// 3rd party
// these reveal and highlight files will be copied to target unless --skip-reveal is true
exports.REVEAL_FILES = ["css", "js", "lib", "plugin"].map(x => path.join(REVEAL, x));
exports.PRINT_PDF_JS = path.resolve(REVEAL, "plugin", "print-pdf", "print-pdf.js");
exports.HL_STYLES = path.join(getModuleRoot("highlight.js"), "styles");
exports.INDEX = "index.html";

// these dirs will be copied to target unless --skip-user is true
exports.USER_FILES = ["css", "js", "images", "media"];

// prez
exports.DATA = path.resolve(__dirname, "..", "data");

function getModuleRoot (name) {
  var parts = require.resolve(name).split(path.sep);
  return parts.slice(0, parts.lastIndexOf("node_modules") + 2).join(path.sep);
}
