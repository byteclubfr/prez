"use strict";

var highlightjs = require("highlight.js");
var Remarkable = require("remarkable");

var md = new Remarkable({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (code, lang) {
    if (lang) {
      return highlightjs.highlight(lang, code).value;
    } else {
      return highlightjs.highlightAuto(code).value;
    }
  }
});

module.exports = md2html;

function md2html (input) {
  return md.render(input);
}
