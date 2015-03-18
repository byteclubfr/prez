#!/usr/bin/env node

"use strict";

var args = require("optimist").argv;
var colors = require("colors"); // extends String prototype
var cli = require("../lib/cli");
var build = require("../lib/build");
var serve = require("../lib/serve");
var fs = require("fs-extra");
var path = require("path");

if (args.h || args.help) {
  cli.help();
  process.exit(0);
}

if (args.v || args.version) {
  cli.version();
  process.exit(0);
}

var from = args._[0];
if (!from) {
  console.error("[%s] %s", "warn".yellow, "Source folder not specified: use cwd");
  from = ".";
}
from = path.resolve(from);

var to = args._[1];
if (!to) {
  console.error("[%s] %s", "warn".yellow, "Destination folder not specified: use 'build'");
  to = "build";
}
to = path.resolve(to);
fs.ensureDirSync(to);


if (args.init) {
  build.init(from, notify);
}


if (!args["no-update-notifier"]) {
  cli.checkUpdate();
}

var killServerAfterPrint = false;

if (args.print && !args.serve) {
  console.error("[%s] %s", "warn".yellow, "Using option --print without --serve: use random port");
  args.serve = true;
  args.port = "auto";
  args["no-live-reload"] = true;
  args["no-open-browser"] = true;
  // One-shot server: kill it once print done
  killServerAfterPrint = true;
}

build(from, to, cli.options(args), notify);

if (args.serve) {
  console.log("[%s] %s slideshows from %s…", "info".cyan, "serve".bold, path.relative(process.cwd(), to).blue);
  serve(args.p || args.port || args.serve, to, args["live-reload"] !== false, null, null, args["open-browser"] !== false, notify);
}

function notify (type, file, what) {
  var level = "info".cyan;
  var info = what || "";

  file = path.relative(process.cwd(), file);

  if (type === "copy") {
    info = "to " + path.relative(process.cwd(), what);
  } else if (type === "write") {
    info = "(" + what.length + " bytes)";
  } else if (type === "cannot copy") {
    level = "warn".yellow;
    info = "(file not found)";
  } else if (type === "cannot read") {
    level = "warn".yellow;
    info = "(file not found)";
  } else if (type === "delete") {
    info = "(deleted)";
  } else if (type === "change") {
    info = "(" + what + ")";
  } else if (type === "prez-update") {
    level = "warn".yellow;
    info = "YOU SHOULD RESTART".red;
  } else if (type === "cannot listen") {
    level = "error".red;
    type = "cannot start server";
    info = "on port " + what;
  } else if (type === "listen") {
    type = "started server";
    info = "on port " + what;
  } else if (type === "print-ok") {
    type = "print";
    info = "(OK)";
    if (killServerAfterPrint) {
      process.emit("kill-server");
    }
  } else if (type === "print-fail") {
    level = "error".red;
    type = "print";
    info = "(FAIL code " + what + ")";
    if (killServerAfterPrint) {
      process.emit("kill-server");
    }
  }

  console.log("[%s] %s %s %s", level, type.bold, file.blue, info);
}
