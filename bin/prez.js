#!/usr/bin/env node

"use strict";

var args = require("optimist").argv;
var colors = require("colors"); // eslint-disable-line
var cli = require("../lib/cli");
var build = require("../lib/build");
var serve = require("../lib/serve");
var { notify, warn } = require("../lib/notify");
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
  warn("Source folder not specified: use cwd");
  from = ".";
}
from = path.resolve(from);

if (args.stats) {
  cli.stats(from, args);
  process.exit(0);
}

var to = args._[1];
if (!to) {
  warn("Destination folder not specified: use 'build'");
  to = "build";
}
to = path.resolve(to);
fs.ensureDirSync(to);

if (!args["no-update-notifier"]) {
  cli.checkUpdate();
}

args.killServerAfterPrint = false;

if (args.print && !args.serve) {
  warn("Using option --print without --serve: use random port");
  args.serve = true;
  args.port = "auto";
  args["no-live-reload"] = true;
  args["no-open-browser"] = true;
  // One-shot server: kill it once print done
  args.killServerAfterPrint = true;
}

build(from, to, cli.options(args), notify);

if (args.serve) {
  console.log("[%s] %s slideshows from %s…", "info".cyan, "serve".bold, path.relative(process.cwd(), to).blue);
  serve(args.p || args.port || args.serve, to, args["live-reload"] !== false, null, null, args["open-browser"] !== false, notify);
}

