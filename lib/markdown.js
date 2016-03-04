"use strict";

var marked = require("marked");
var highlightjs = require("highlight.js");

module.exports = md2html;

var renderer = new marked.Renderer();
renderer.heading = renderHeadingWithoutId;

function renderHeadingWithoutId (text, level) {
  var tag = "h" + level;
  return "<" + tag + ">" + text + "</" + tag + ">";
}

function md2html (md) {
  return marked(md, {
    renderer: renderer,
    highlight: function (code, lang) {
      if (lang) {
        return highlightjs.highlight(lang, code).value;
      } else {
        return highlightjs.highlightAuto(code).value;
      }
    }
  });
}
