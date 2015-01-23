"use strict";

var _ = require("lodash");
var fs = require("fs-extra");
var path = require("path");
var parse = require("./parse");
var watcher = require("./watcher");

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

  if (options.suchNotes) {
    // Special print layout
    enableBigNotesPrintLayout(to, notify, addAssets);
    // Special live notes layout
    enableBiggerNotesPopup(to, notify);
  }

  if (!options.skipUser) {
    _.map(userFiles, function (f) {
      var src = path.join(from, f);
      copy(src, to, notify);
    });
  }

  if (!options.skipIndex) {
    buildIndex(from, to, options, notify, addAssets);
  }

  if (options.watch) {
    watch(from, to, _.omit(options, "watch"), notify, addAssets);
  }
}

function enableBiggerNotesPopup (to, notify) {
  var notesHtml = path.join(to, "plugin", "notes", "notes.html");
  if (!fs.existsSync(notesHtml)) {
    notify("cannot read", notesHtml);
    return;
  }

  if (!copy(path.join(pathToData, "such-notes-popup.css"), path.join(to, "css"), notify)) {
    // Failed to copy css, no need to go further
    return;
  }

  var html = fs.readFileSync(notesHtml, "utf8");
  html = html.replace(/<\/head>/, "<link rel=\"stylesheet\" href=\"../../css/such-notes-popup.css\">\n</head>");
  write(notesHtml, html, notify);
}

function enableBigNotesPrintLayout (to, notify, addAssets) {
  copy(path.join(pathToData, "such-notes-print.js"), path.join(to, "js"), notify);
  copy(path.join(pathToData, "such-notes-print.css"), path.join(to, "css"), notify);
  addAssets.push("js/such-notes-print.js");
}

function buildIndex (from, to, options, notify, addAssets) {
  var slides = getSlidesList(path.join(from, options.slides));
  var parsed = parse(slides);

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

function watch (from, to, options, notify, addAssets) {
  // Change in current basecode: should restart
  watcher(path.join(__dirname, ".."), function (file, type) {
    notify("prez-update", path.relative(from, file), type);
  });

  // User assets: only copy differences
  watcher(_.map(userFiles, function (f) {
    return path.join(from, f);
  }), function (file, type) {
    var rel = path.relative(from, file);
    var dir = path.dirname(rel);
    notify("change", rel, type);
    if (type === "update") {
      copy(file, path.join(to, dir), notify);
    } else {
      unlink(rel, to, notify);
    }
  });

  // Slides or includes.txt: rebuild index
  watcher([
    path.join(from, options.slides),
    path.join(from, "includes.txt")
  ], function (file, type) {
    notify("change", path.relative(from, file), type);
    buildIndex(from, to, options, notify, addAssets);
  });
}

function copy (src, to, notify) {
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(to, path.basename(src)));
    notify("copy", src, to);
    return true;
  } else {
    notify("cannot copy", src, to);
    return false;
  }
}

function unlink (file, dir, notify) {
  var fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    notify("delete", fullPath);
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
