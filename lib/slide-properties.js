"use strict";

/*
  Markdown files can benefit from special metadata (~= frontMatter)
  Each key value pair must be surrounded by dollar signs
  Example:
    $class:raw$
*/

var { merge } = require("lodash/fp");

module.exports = extractProps;

function extractProps (content) {
  var props = {};
  var lines = content.trim().split(/[\r\n]/);

  while (addProp(props, lines[0])) {
    lines.shift();
  }

  // data-has-notes?
  props = merge(props, inferProps(content));

  return Object.assign(props, {
    "content": lines.join("\n")
  });
}

// If content has notes, a dedicated prop can be useful for special CSS styling
function inferProps (content) {
  var hasNotes = content.match(/[\r\n]note:/igm);
  return addDataProp({}, "has-notes", Boolean(hasNotes));
}

function addProp (props, line) {
  if (!line) {
    return false;
  }

  line = line.trim();
  var m = line.match(/^\$([a-z-]+):([^$]+?)\$$/i);

  if (!m) {
    return false;
  }

  var prop = m[1].toLowerCase().trim();
  var val = m[2].trim();

  switch (prop) {

    case "class":
      if (!props.classes) {
        props.classes = [];
      }
      props.classes = props.classes.concat(val.split(/\s+/));
      break;

    case "id":
      props.id = val;
      break;

    default:
      addDataProp(props, prop, val);
      break;

  }

  return true;
}

function addDataProp (props, prop, val) {
  if (!props.datas) {
    props.datas = {};
  }
  // cast because DOMString in the end
  props.datas[prop] = String(val);
  return props;
}
