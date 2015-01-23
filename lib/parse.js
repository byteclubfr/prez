"use strict";

var _ = require("lodash");
var fs = require("fs");
var markdown = require("./markdown");

module.exports = parse;

function parse (file) {
  if (Array.isArray(file)) {
    return _.map(file, parse);
  }

  var content = fs.readFileSync(file, "utf8");

  if (file.match(/\.md$/)) {
    content = md2html(content);
  }

  return content;
}

function md2html (md) {
  // Find notes
  var notes = "";
  var foundNotes = md.match(/[\r\n]note:/igm);
  if (foundNotes) {
    var index = md.indexOf(foundNotes[0]);
    notes = md.substring(index + foundNotes[0].length).trim();
    md = md.substring(0, index).trim();
  }

  var html = markdown(md).trim();

  if (notes) {
    html += "<aside class=\"notes\">" + markdown(notes).trim() + "</aside>";
  }

  return html;
}
