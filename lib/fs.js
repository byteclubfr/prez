"use strict";

var fs = require("fs-extra");
var path = require("path");

exports.copy = (src, to, notify) => {
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(to, path.basename(src)));
    notify("copy", src, to);
    return true;
  } else {
    notify("cannot copy", src, to);
    return false;
  }
};

exports.unlink = (file, dir, notify) => {
  var fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    notify("delete", fullPath);
    return true;
  }
  return false;
};

exports.write = (to, content, notify) => {
  fs.writeFileSync(to, content, "utf8");
  notify("write", to, content);
};

