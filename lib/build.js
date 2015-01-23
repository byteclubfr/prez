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

  var addAssets = [];

  if (options.dynamicTheme) {
    copy(path.join(pathToData, "dynamic-theme.js"), path.join(to, "js"), notify);
    addAssets.push("js/dynamic-theme.js");
  }

  if (!options.skipReveal) {
    _.map(revealFiles, function (src) {
      copy(src, to, notify);
    });
  }

  if (options.printNotes) {
    copy(path.join(pathToData, "print-with-notes.js"), path.join(to, "js"), notify);
    copy(path.join(pathToData, "print-with-notes.css"), path.join(to, "css"), notify);
    addAssets.push("js/print-with-notes.js");
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
    html = inject(getThemeLink(options.theme), html, "<!-- THEME HERE -->");
    if (!options.skipUser) {
      html = inject(getCustomCSS(from, addAssets), html, "<!-- INCLUDE CSS HERE -->");
      html = inject(getCustomJS(from, addAssets), html, "<!-- INCLUDE JS HERE -->");
    }
    html = inject(generateSlidesHTML(parsed), html, "<!-- SLIDES HERE -->");
    write(path.join(to, "index.html"), html, notify);
  }
}

function copy (src, to, notify) {
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(to, path.basename(src)));
    notify("copy", src, to);
  } else {
    notify("cannot copy", src, to);
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

function getAssets (from, base) {
  var assetsFile = path.join(from, "includes.txt");
  if (!fs.existsSync(assetsFile)) {
    return [];
  }

  var paths = fs.readFileSync(assetsFile, "utf8").split("\n");
  return (base || []).concat(_.filter(_.map(paths, function (asset) {
    return asset.trim();
  })));
}

function getCustomJS (from, base) {
  return _.map(_.filter(getAssets(from, base), function (file) {
    return file.match(/\.js$/i);
  }), function (file) {
    return "<script src=\"" + file + "\"></script>";
  }).join("");
}

function getCustomCSS (from, base) {
  return _.map(_.filter(getAssets(from, base), function (file) {
    return file.match(/\.css$/i);
  }), function (file) {
    return "<link rel=\"stylesheet\" href=\"" + file + "\">";
  }).join("");
}

function getThemeLink (theme) {
  return "<link rel=\"stylesheet\" href=\"css/theme/" + theme + ".css\" id=\"theme\">";
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
