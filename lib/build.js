"use strict";

var _ = require("lodash");
var fs = require("fs-extra");
var path = require("path");
var parse = require("./parse");
var watcher = require("./watcher");
var print = require("./print");
var esc = require("escape-html");

module.exports = build;

var pathToData = path.resolve(__dirname, "..", "data");

// these reveal and highlight files will be copied to target unless --skip-reveal is true
var pathToReveal = getModuleRoot("reveal.js");
var revealFiles = [
  path.join(pathToReveal, "css"),
  path.join(pathToReveal, "js"),
  path.join(pathToReveal, "lib"),
  path.join(pathToReveal, "plugin")
];
var highlightStyles = path.join(getModuleRoot("highlight.js"), "styles");

// these dirs will be copied to target unless --skip-user is true
var userFiles = [
  "css",
  "js",
  "images",
  "media"
];

build.init = function (dst, notify) {
  var dir = path.join(pathToData, "init");
  fs.readdirSync(dir).forEach(function (f) {
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
    revealFiles.forEach(function (src) {
      copy(src, to, notify);
    });
    copy(highlightStyles, path.join(to, "css", "highlight"), notify);
  }

  if (options.suchNotes) {
    // Special print layout
    enableBigNotesPrintLayout(to, notify, addAssets);
    // Special live notes layout
    enableBiggerNotesPopup(to, notify);
  }

  if (!options.skipUser) {
    userFiles.forEach(function (f) {
      copy(path.join(from, f), to, notify);
    });
  }

  if (!options.skipIndex) {
    buildIndex(from, to, options, notify, addAssets);
  }

  mayPrintPDF(options, notify);

  if (options.watch) {
    watch(from, to, _.omit(options, "watch"), notify, addAssets);
  }
}

function mayPrintPDF (options, notify) {
  if (!options.print) {
    return;
  }

  print({
    "output": options.print,
    "theme": options.printTheme,
    "phantomjs": options.phantomjs
  }, notify);
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

  // Less mandatory: enables highlight theme in notes.html
  copy(path.join(pathToData, "such-notes-popup.js"), path.join(to, "js"), notify);

  var html = fs.readFileSync(notesHtml, "utf8");
  html = html.replace(/<\/head>/, "<link rel=\"stylesheet\" href=\"../../css/such-notes-popup.css\">\n</head>");
  html = html.replace(/<\/body>/, "<script src=\"../../js/such-notes-popup.js\"></script>\n</head>");
  write(notesHtml, html, notify);
}

function enableBigNotesPrintLayout (to, notify, addAssets) {
  copy(path.join(pathToData, "such-notes-print.js"), path.join(to, "js"), notify);
  copy(path.join(pathToData, "such-notes-print.css"), path.join(to, "css"), notify);
  addAssets.push("js/such-notes-print.js");
}

// replace placeholders
function buildIndex (from, to, options, notify, addAssets) {
  var slidesDir = path.join(from, options.slides);
  var slides = getSlidesList(slidesDir, options.keepHidden);
  var parsed = parse(slides, slidesDir);

  copy(path.join(pathToData, "index.html"), to, notify);
  var html = fs.readFileSync(path.join(to, "index.html"), "utf8");
  // meta
  html = inject(options.title, html, "<!-- TITLE HERE -->");
  html = inject(esc(options.author), html, "-- AUTHOR HERE --");
  html = inject(esc(options.description), html, "-- DESCRIPTION HERE --");
  // CSS
  html = inject(getThemeLink(options.theme), html, "<!-- THEME HERE -->");
  html = inject(getHighlightThemeLink(options.highlightTheme), html, "<!-- HIGHLIGHT-THEME HERE -->");
  if (!options.skipUser) {
    html = inject(getCustomCSS(from, addAssets), html, "<!-- INCLUDE CSS HERE -->");
    html = inject(getCustomJS(from, addAssets), html, "<!-- INCLUDE JS HERE -->");
  }
  html = inject(generateSlidesHTML(parsed, options.subCovers), html, "<!-- SLIDES HERE -->");
  write(path.join(to, "index.html"), html, notify);
}

function watch (from, to, options, notify, addAssets) {
  // Change in current basecode: should restart
  watcher(path.join(__dirname, ".."), function (file, type) {
    notify("prez-update", path.relative(from, file), type);
  });

  // User assets: only copy differences
  watcher(userFiles.map(function (f) {
    return path.join(from, f);
  }), function (file, type) {
    var rel = path.relative(from, file);
    var dir = path.dirname(rel);
    notify("change", rel, type);
    if (type === "update") {
      copy(file, path.join(to, dir), notify);
      // Regenerate pdf?
      mayPrintPDF(options, notify);
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
    // Regenerate pdf?
    mayPrintPDF(options, notify);
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
  return (base || []).concat(_.filter(_.invoke(paths, "trim")));
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

function getHighlightThemeLink (theme) {
  return "<link rel=\"stylesheet\" href=\"css/highlight/styles/" + theme + ".css\" id=\"highlight-theme\">";
}

function generateSlidesHTML (slides, subCovers) {
  return slides.map(function (slide) {
    var startTag;
    if (Array.isArray(slide)) {
      startTag = "<section>";
      var content = generateSlidesHTML(slide, subCovers);
      if (subCovers) {
        content = generateSubCover(slide) + content;
      }
      slide.content = content;
    } else {
      startTag = "<section " + generateSectionHTMLAttributes(slide) + ">";
    }

    return startTag + "\n" + slide.content + "\n</section>";
  }).join("\n");
}

function generateSectionHTMLAttributes (slide) {
  // id
  var s = "id=\"" + slide.id + "\"";

  // class
  s += " class=\"" + ((slide.classes || []).concat(["slide"])).join(" ") + "\"";

  // data attributes
  if (slide.datas) {
    for (var attr in slide.datas) {
      s += " data-" + attr + "=\"" + slide.datas[attr].replace(/"/g, "&quot;") + "\"";
    }
  }

  return s;
}

function generateSubCover (slides) {
  if (!slides.length) {
    return "";
  }

  var id = slides[0].chapter.id;
  var title = slides[0].chapter.title;
  return "<section id=\"" + id + "\" class=\"slide cover\"><h1>" + title + "</h1></section>";
}

function getSlidesList (dir, keepHidden, endOfRecursion) {
  if (!fs.existsSync(dir)) {
    throw new Error("Slides folder '" + dir + "' not found");
  }

  return _.filter(_.map(fs.readdirSync(dir).sort(), function (f) {
    var isHidden = /^\./.test(f);
    if (!keepHidden && isHidden) {
      return false;
    }
    var full = path.join(dir, f);
    var stat = fs.statSync(full);
    if (stat.isDirectory() && !endOfRecursion) {
      // sub-slides
      return getSlidesList(full, keepHidden, true);
    } else if (stat.isFile()) {
      // direct slide
      return filterSlideName(full);
    }
  }));
}

function filterSlideName (f) {
  return f.match(/\.(md|html)$/) ? f : null;
}

function getModuleRoot (name) {
  var parts = require.resolve(name).split(path.sep);

  return parts.slice(0, parts.lastIndexOf("node_modules") + 2).join(path.sep);
}
