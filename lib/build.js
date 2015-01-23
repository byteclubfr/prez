"use strict";

var _ = require("lodash");
var fs = require("fs-extra");
var path = require("path");
var parse = require("./parse");

module.exports = build;

var pathToData = path.resolve(__dirname, "..", "data");
var pathToReveal = path.resolve(__dirname, "..", "node_modules", "reveal.js");
var revealFiles = [
  path.join(pathToReveal, "css"),
  path.join(pathToReveal, "js"),
  path.join(pathToReveal, "lib"),
  path.join(pathToReveal, "plugin")
];

var userFiles = [
  "css",
  "js",
  "images",
  "media"
];

build.init = function (dst, notify) {
  var dir = path.join(pathToData, "init");
  _.map(fs.readdirSync(dir), function (f) {
    copy(path.join(dir, f), dst, notify);
  });
};

function build (from, to, options, notify) {
  var slides = getSlidesList(path.join(from, options.slides));

  var parsed = parse(slides);

  if (!options.skipReveal) {
    _.map(revealFiles, function (src) {
      copy(src, to, notify);
    });
  }

  if (!options.skipUser) {
    _.map(userFiles, function (f) {
      var src = path.join(from, f);
      copy(src, to, notify);
    });
  }

  if (!options.skipIndex) {
    copy(path.join(pathToData, "index.html"), to, notify);
    var html = fs.readFileSync(path.join(to, "index.html"), "utf8");
    if (!options.skipUser) {
      html = inject(getCustomCSS(from), html, "<!-- INCLUDE CSS HERE -->");
      html = inject(getCustomJS(from, printWithNotes), html, "<!-- INCLUDE JS HERE -->");
    }
    html = inject(generateSlidesHTML(parsed), html, "<!-- SLIDES HERE -->");
    write(path.join(to, "index.html"), html, notify);
  }
}

function copy (src, to, notify) {
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(to, path.basename(src)));
    notify("copy", src, to);
  }
}

function write (dst, content, notify) {
  fs.writeFileSync(dst, content, "utf8");
  notify("write", dst, content);
}

function inject (content, html, marker) {
  if (!content) {
    return html;
  }

  var index = html.indexOf(marker);

  if (index === -1) {
    return html;
  }

  return html.substring(0, index) + content + html.substring(index + marker.length);
}

function getAssets (from) {
  var assetsFile = path.join(from, "includes.txt");
  if (!fs.existsSync(assetsFile)) {
    return [];
  }

  return _.filter(_.map(fs.readFileSync(assetsFile, "utf8").split("\n"), function (asset) {
    return asset.trim();
  }));
}

function getCustomJS (from) {
  return _.map(_.filter(getAssets(from), function (file) {
    return file.match(/\.js$/i);
  }), function (file) {
    return "<script src=\"" + file + "\"></script>";
  }).join("");
}

function getCustomCSS (from) {
  return _.map(_.filter(getAssets(from), function (file) {
    return file.match(/\.css$/i);
  }), function (file) {
    return "<link rel=\"stylesheet\" href=\"" + file + "\">";
  }).join("");
}

function generateSlidesHTML (contents) {
  return contents.map(function (content) {
    if (Array.isArray(content)) {
      content = generateSlidesHTML(content);
    }

    return "<section>" + content + "</section>";
  }).join("");
}

function getSlidesList (dir, endOfRecursion) {
  if (!fs.existsSync(dir)) {
    throw new Error("Slides folder '" + dir + "' not found");
  }

  return _.filter(_.map(fs.readdirSync(dir), function (f) {
    var full = path.join(dir, f);
    var stat = fs.statSync(full);
    if (stat.isDirectory() && !endOfRecursion) {
      // sub-slides
      return getSlidesList(full, true);
    } else if (stat.isFile()) {
      // direct slide
      return filterSlideName(full);
    }
  }));
}

function filterSlideName (f) {
  return f.match(/\.(md|html)$/) ? f : null;
}
