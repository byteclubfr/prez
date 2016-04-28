"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var convert = require("./convert");
var diacritics = require("diacritics");
var properties = require("./slide-properties");

module.exports = parse;

function parse (parser, file, root) {
  // recursion
  if (Array.isArray(file)) {
    return file.map((f) => parse(parser, f, root));
  }

  var content = fs.readFileSync(file, "utf8");

  var props = properties(content);
  content = props.content;

  if (file.match(/\.md$/)) {
    content = md2html(parser, content);
  }

  var title = getTitle(file, root);
  var chapter = getTitle(path.dirname(file), root);

  return _.assign({
    "title": title,
    "id": cleanString(title),
    "content": content,
    "chapter": {
      "title": chapter,
      "id": cleanString(chapter)
    }
  }, _.omit(props, "content"));
}

function md2html (parser, md) {
  // Find notes
  var notes = "";
  var foundNotes = md.match(/[\r\n]note:/igm);
  if (foundNotes) {
    var index = md.indexOf(foundNotes[0]);
    notes = md.substring(index + foundNotes[0].length).trim();
    md = md.substring(0, index).trim();
  }

  var html = convert(parser, md).trim();

  if (notes) {
    html += "<aside class=\"notes\">" + convert(parser, notes).trim() + "</aside>";
  }

  return html;
}

// beware: filenames without digits should be unique in a dir
function getTitle (file, root) {
  var rel = path.relative(root, file);
  var isSubSlide = path.dirname(rel) !== ".";

  var chapter = isSubSlide ? cleanLeadingDigits(path.dirname(rel)) : null;
  var ext = path.extname(rel);
  var slide = cleanLeadingDigits(path.basename(rel, ext));

  return (chapter ? (chapter + "-") : "") + slide;
}

function cleanString (s) {
  return diacritics.remove(s.toLowerCase().replace(/\s+/g, "-"));
}

function cleanLeadingDigits (file) {
  var matches = file.match(/(?:(?:\d+)-)?(?:\d+)\-(.*)/);
  return matches ? matches[1] : file;
}
