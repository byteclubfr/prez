"use strict";

var marky = require("marky-markdown");

module.exports = md2html;

function md2html (input) {
  return marky(input).html();
}
