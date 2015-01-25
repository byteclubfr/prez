"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var markdown = require("./markdown");
var diacritics = require("diacritics");

module.exports = parse;

function parse (file, root) {
  if (Array.isArray(file)) {
    return _.map(file, function (f) {
      return parse(f, root);
    });
  }

  var content = fs.readFileSync(file, "utf8");

  if (file.match(/\.md$/)) {
    content = md2html(content);
  }

  var title = getTitle(path.relative(root, file));
  var chapter = getTitle(path.relative(root, path.dirname(file)));

  return {
    "title": title,
    "id": cleanString(title),
    "content": content,
    "chapter": {
      "title": chapter,
      "id": cleanString(chapter)
    }
  };
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

// beware: filenames without digits should be unique in a dir
function getTitle (file) {
  var dir = path.dirname(file).toLowerCase();
  if (dir === ".") {
    dir = "";
  }
  dir = cleanLeadingDigits(dir);

  var ext = path.extname(file);
  var title = path.basename(file, ext).toLowerCase();
  title = cleanLeadingDigits(title);

  return (dir ? (dir + "-") : "") + title;
}

function cleanString (s) {
  return diacritics.remove(s).replace(/\s+/g, "-");
}

function cleanLeadingDigits (file) {
  var matches = file.match(/(?:(?:\d+)-)?(?:\d+)\-(.*)/);
  return matches ? matches[1] : file;
}
