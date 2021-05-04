"use strict";

var marked = require("marked");
var highlightjs = require("highlight.js");

module.exports = md2html;

var renderer = new marked.Renderer();

// We do not want marked to render IDs that could conflict with Reveal's ones
renderer.heading = renderHeadingWithoutId;
function renderHeadingWithoutId (text, level) {
  var tag = "h" + level;
  return "<" + tag + ">" + text + "</" + tag + ">";
}

function md2html (md) {
  return marked(md, {
    renderer: renderer,
    highlight: function (code, language) {
      if (language) {
        return highlightjs.highlight(code, { language }).value;
      } else {
        return highlightjs.highlightAuto(code).value;
      }
    }
  });
}
