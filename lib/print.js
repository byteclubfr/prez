"use strict";

var spawn = require("child_process").spawn;
var colors = require("colors"); // eslint-disable-line

var { notify } = require("./notify");
var { PRINT_PDF_JS } = require("./paths");

module.exports = print;


function print (options) {
  // happens to be a single boolean when used with '--print' with no argument
  if (options && typeof options.output !== "string") {
    delete options.output;
  }

  options = Object.assign({
    "output": "slides.pdf",
    "phantomjs": "phantomjs",
    "theme": null
  }, options || {});

  getPort((port) => {
    var url = "http://localhost:" + port + "/?";
    if (options.theme) {
      url += "theme=" + options.theme + "&";
    }
    url += "print-pdf";

    var proc = spawn(options.phantomjs, [PRINT_PDF_JS, url, options.output]);
    proc.on("error", () => {
      console.error("[%s] Could not start PhantomJS, is it installed?", "error".red);
      console.error("[%s] You can easily install it with 'npm install -g phantomjs'", "error".red);
      process.exit(1);
    });

    proc.stdout.on("data", (chunk) => {
      console.log("[%s] [%s] %s", "info".cyan, "phantom".gray.bold, chunk.toString("utf8").trim());
    });

    proc.stderr.on("data", (chunk) => {
      console.error("[%s] [%s] %s", "error".red, "phantom".gray.bold, chunk.toString("utf8").trim());
    });

    proc.on("close", (code) => {
      notify(code === 0 ? "print-ok" : "print-fail", options.output, code);
      if (options.killServerAfterPrint) {
        process.emit("kill-server");
      }
    });
  });
}


var CACHED_PORT = null;

function getPort (cb) {
  if (CACHED_PORT !== null) {
    return cb(CACHED_PORT);
  }

  process.on("server-ok", (port) => {
    CACHED_PORT = port;
    cb(port);
  });
}
