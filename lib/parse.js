"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var markdown = require("./markdown");

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

  return {
    "id": getId(path.relative(root, file)),
    "content": content
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
function getId (file) {
  var dir = path.dirname(file).toLowerCase();
  if (dir === ".") {
    dir = "";
  }
  dir = cleanLeadingDigits(dir);

  var ext = path.extname(file);
  var name = path.basename(file, ext).toLowerCase();
  name = cleanLeadingDigits(name);

  return (dir ? (dir + "-") : "") + name;
}

function cleanLeadingDigits (file) {
  var matches = file.match(/(?:(?:\d+)-)?(?:\d+)\-(.*)/);
  return matches ? matches[1] : file;
}
