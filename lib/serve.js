"use strict";

var connect = require("connect");
var serveStatic = require("serve-static");
var serveIndex = require("serve-index");
var path = require("path");
var watcher = require("./watcher");
var minimatch = require("minimatch");
var tinyLR = require("tiny-lr");
var connectLR = require("connect-livereload");
var open = require("open");

module.exports = serve;

function serve (port, dir, enableLR, lrPort, watchFiles, openBrowser, notify) {
  if (isNaN(Number(String(port)))) {
    port = 9000;
  }

  if (enableLR && isNaN(Number(String(lrPort)))) {
    lrPort = 35729;
  }

  watchFiles = watchFiles || ["**/*.html", "**/*.js", "**/*.css", "**/*.xml"];

  dir = path.resolve(dir);

  var server = connect();

  if (enableLR) {
    server.use(connectLR({
      "port": lrPort
    }));

    var lrServer = tinyLR();
    lrServer.listen(lrPort, function (err) {
      if (err) {
        return notify("cannot listen", "live-reload", lrPort);
      }

      notify("listen", "live-reload", lrPort);
    })

    watcher(dir, function (file, type) {
      if (match(watchFiles, file)) {
        notify("change", file, "live-reload");
        lrServer.changed({
          "body": {
            "files": file
          }
        });
      }
    });
  }

  server.use(serveStatic(dir));

  server.use(serveIndex(dir, {
    "icons": true
  }));

  server.once("error", function (err) {
    notify("cannot listen", "http", port);
  }).listen(port, function (err) {
    notify("listen", "http", port);

    if (openBrowser) {
      open("http://127.0.0.1:" + port);
    }
  });
}

function match (globs, file) {
  for (var i = 0; i < globs.length; i++) {
    if (minimatch(file, globs[i])) {
      return true;
    }
  }

  return false;
}
