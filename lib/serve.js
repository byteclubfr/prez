"use strict";

var http = require("http");
var connect = require("connect");
var serveStatic = require("serve-static");
var serveIndex = require("serve-index");
var path = require("path");
var minimatch = require("minimatch");
var tinyLR = require("tiny-lr");
var connectLR = require("connect-livereload");
var open = require("opn");

var { notify } = require("./notify");
var watcher = require("./watcher");

module.exports = serve;

function serve (port, dir, enableLR, lrPort, watchFiles, openBrowser) {
  if (port === "auto") {
    port = 0;
  } else if (isNaN(Number(String(port)))) {
    port = 9000;
  }

  if (enableLR && isNaN(Number(String(lrPort)))) {
    lrPort = 35729;
  }

  watchFiles = watchFiles || ["**/*.html", "**/*.js", "**/*.css", "**/*.xml"];

  dir = path.resolve(dir);

  var app = connect();

  if (enableLR) {
    app.use(connectLR({
      "port": lrPort
    }));

    var lrServer = tinyLR();
    lrServer.listen(lrPort, (err) => {
      if (err) {
        return notify("cannot listen", "live-reload", lrPort);
      }

      notify("listen", "live-reload", lrPort);
    });

    watcher(dir, (file) => {
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

  app.use(serveStatic(dir));

  app.use(serveIndex(dir, {
    "icons": true
  }));

  var server = http.createServer(app);

  server.once("error", () => {
    notify("cannot listen", "http", port);
  }).listen(port, () => {
    port = server.address().port;

    notify("listen", "http", port);
    process.emit("server-ok", port);

    if (openBrowser) {
      open("http://127.0.0.1:" + port);
    }
  });

  process.on("kill-server", () => {
    server.close();
    process.exit();
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
