"use strict";

module.exports = convert;

function convert (parser, content) {
  return getParser(parser)(content);
}

// Cache loaded parsers
var _parsers = {};

function getParser (parser) {
  if (!_parsers[parser]) {
    // Try to load prez default implementations
    try {
      _parsers[parser] = require("./parsers/" + parser);
    } catch (e) {
      throw new Error("Cannot find parser '" + parser + "'");
    }
  }

  return _parsers[parser];
}
