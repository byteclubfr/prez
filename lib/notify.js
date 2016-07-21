const path = require("path");
const colors = require("colors"); // eslint-disable-line

exports.notify = (type, file, what) => {
  var level = "info".cyan;
  var info = what || "";

  file = path.relative(process.cwd(), file);

  if (type === "options") {
    level = "tips".grey;
  }

  // fs
  else if (type === "copy") {
    info = "to " + (path.relative(process.cwd(), what) || ".");
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

  // server
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

  // print
  } else if (type === "print-ok") {
    type = "print";
    info = "(OK)";
  } else if (type === "print-fail") {
    level = "error".red;
    type = "print";
    info = "(FAIL code " + what + ")";
  }

  console.log("[%s] %s %s %s", level, type.bold, file.blue, info);
};

exports.warn = msg => console.error("[%s] %s", "warn".yellow, msg);
