"use strict";

var _ = require("lodash");
var spawn = require("child_process").spawn;
var path = require("path");
var colors = require("colors"); // eslint-disable-line

module.exports = print;

var script = path.resolve(__dirname, "..", "node_modules", "reveal.js", "plugin", "print-pdf", "print-pdf.js");

function print (options, notify) {
  // happens to be a single boolean when used with '--print' with no argument
  if (options && typeof options.output !== "string") {
    delete options.output;
  }

  options = _.assign({
    "output": "slides.pdf",
    "phantomjs": "phantomjs",
    "theme": null
  }, options || {});

  getPort(function (port) {
    var url = "http://localhost:" + port + "/?";
    if (options.theme) {
      url += "theme=" + options.theme + "&";
    }
    url += "print-pdf";

    var proc = spawn(options.phantomjs, [script, url, options.output]);

    proc.on("error", function () {
      console.error("[%s] Could not start PhantomJS, is it installed?", "error".red);
      console.error("[%s] You can easily install it with 'npm install -g phantomjs'", "error".red);
      process.exit(1);
    });

    proc.stdout.on("data", function (chunk) {
      console.log("[%s] [%s] %s", "info".cyan, "phantom".gray.bold, chunk.toString("utf8").trim());
    });

    proc.stderr.on("data", function (chunk) {
      console.error("[%s] [%s] %s", "error".red, "phantom".gray.bold, chunk.toString("utf8").trim());
    });

    proc.on("close", function (code) {
      notify(code === 0 ? "print-ok" : "print-fail", options.output, code);
    });
  });
}


var CACHED_PORT = null;

function getPort (cb) {
  if (CACHED_PORT !== null) {
    return cb(CACHED_PORT);
  }

  process.on("server-ok", function (port) {
    CACHED_PORT = port;
    cb(port);
  });
}
