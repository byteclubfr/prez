#!/usr/bin/env node

"use strict";

var args = require("optimist").argv;
var colors = require("colors");
var cli = require("../lib/cli");
var build = require("../lib/build");
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


build(from, to, {
  "slides": args.s || args["slides-dir"] || "slides",
  "skipReveal": args["skip-reveal"],
  "skipIndex": args["skip-index"],
  "skipUser": args["skip-user"],
  "theme": args.theme || "solarized",
  "dynamicTheme": !args["no-dynamic-theme"]
}, notify);



function notify (type, file, what) {
  var level = "info".cyan;
  var info = what;

  file = path.relative(process.cwd(), file);

  if (type === "copy") {
    info = "to " + path.relative(process.cwd(), what);
  } else if (type === "write") {
    info = "(" + what.length + " bytes)";
  } else if (type === "cannot copy") {
    level = "warn".yellow;
    info = "(file not found)";
  }

  console.log("[%s] %s %s %s", level, type.bold, file.blue, info);
}
