#!/usr/bin/env node

"use strict";

var args = require("optimist").argv;
var colors = require("colors");
var cli = require("../lib/cli");
var build = require("../lib/build");
var serve = require("../lib/serve");
var fs = require("fs-extra");
var path = require("path");

if (args.h || args.help) {
  cli.help();
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
  var pkg = require("./package.json");
  require("update-notifier")({
    packageName:    pkg.name,
    packageVersion: pkg.version
  }).notify();
}


build(from, to, {
  "slides": args.s || args["slides-dir"] || "slides",
  "skipReveal": args["skip-reveal"],
  "skipIndex": args["skip-index"],
  "skipUser": args["skip-user"],
  "print": args.print,
  "printNotes": args["print-notes"],
  "theme": args.theme || "solarized",
  "dynamicTheme": !args["no-dynamic-theme"],
  "watch": args.w || args.watch,
}, notify);

if (args.serve) {
  serve(args.p || args.port || args.serve, to, !args["no-live-reload"], null, null, !args["no-open-browser"], notify);
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
  } else if (type === "delete") {
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
  }

  console.log("[%s] %s %s %s", level, type.bold, file.blue, info);
}
