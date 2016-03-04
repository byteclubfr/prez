"use strict";

var path = require("path");

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
    } catch (e1) {
      if (e1.code === "MODULE_NOT_FOUND" && e1.message.indexOf("'" + parser + "'") !== -1) {
        // No module: try to load user implementation
        try {
          _parsers[parser] = require(path.join(process.cwd(), parser));
        } catch (e2) {
          if (e2.code === "MODULE_NOT_FOUND") {
            throw new Error("Cannot find parser '" + parser + "' (" + e2 + ")");
          } else {
            throw new Error("Error while loading user parser '" + parser + "' (" + e2 + ")");
          }
        }
      } else {
        throw new Error("Error while loading parser '" + parser + "' (" + e1 + ")");
      }
    }
  }

  return _parsers[parser];
}
