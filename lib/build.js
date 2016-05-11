"use strict";

var { compose, curry, identity, invokeMap, omit } = require("lodash/fp");
var fs = require("fs-extra");
var path = require("path");
var esc = require("escape-html");

var parse = require("./parse");
var watcher = require("./watcher");
var print = require("./print");
var { REVEAL_FILES, HL_STYLES, INDEX,
  INIT_FILES, USER_FILES, DATA } = require("./paths");

module.exports = build;

build.init = function (to, notify) {
  fs.readdirSync(INIT_FILES).forEach((f) => {
    copy(path.join(INIT_FILES, f), to, notify);
  });
};

function build (from, to, options, notify) {
  var addAssets = [];

  if (options.dynamicTheme) {
    copy(path.join(DATA, "dynamic-theme.js"), path.join(to, "js"), notify);
    addAssets.push("js/dynamic-theme.js");
  }

  if (!options.skipReveal) {
    notify("options", "--skip-reveal", "to not copy the following reveal files");
    REVEAL_FILES.forEach((src) => copy(src, to, notify));
    copy(HL_STYLES, path.join(to, "css", "highlight"), notify);
  }

  if (options.suchNotes) {
    // Special print layout
    enableBigNotesPrintLayout(to, notify, addAssets);
    // Special live notes layout
    enableBiggerNotesPopup(to, notify);
  }

  if (!options.skipUser) {
    notify("options", "--skip-user", "to not copy the following user files");
    USER_FILES.forEach((f) => copy(path.join(from, f), to, notify));
  }

  if (!options.skipIndex) {
    notify("options", "--skip-index", "to not generate index.html");
    buildIndex(from, to, options, notify, addAssets);
  }

  mayPrintPDF(options, notify);

  if (options.watch) {
    watch(from, to, omit("watch", options), notify, addAssets);
  }
}

function mayPrintPDF (options, notify) {
  if (!options.print) return;

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

  if (!copy(path.join(DATA, "such-notes-popup.css"), path.join(to, "css"), notify)) {
    // Failed to copy css, no need to go further
    return;
  }

  // Less mandatory: enables highlight theme in notes.html
  copy(path.join(DATA, "such-notes-popup.js"), path.join(to, "js"), notify);

  var html = fs.readFileSync(notesHtml, "utf8")
    .replace(/<\/head>/, '<link rel="stylesheet" href="../../css/such-notes-popup.css">\n</head>')
    .replace(/<\/body>/, '<script src="../../js/such-notes-popup.js"></script>\n</head>');
  write(notesHtml, html, notify);
}

function enableBigNotesPrintLayout (to, notify, addAssets) {
  copy(path.join(DATA, "such-notes-print.js"), path.join(to, "js"), notify);
  copy(path.join(DATA, "such-notes-print.css"), path.join(to, "css"), notify);
  addAssets.push("js/such-notes-print.js");
}

// replace placeholders
function buildIndex (from, to, options, notify, addAssets) {
  var slides = getSlides(from, options);
  copy(path.join(DATA, INDEX), to, notify);

  var injectAll = compose(
    inject(generateSlidesHTML(slides, options.subCovers), "<!-- SLIDES HERE -->"),
    // meta
    inject(options.title, "<!-- TITLE HERE -->"),
    inject(esc(options.author), "-- AUTHOR HERE --"),
    inject(esc(options.description), "-- DESCRIPTION HERE --"),
    // CSS
    inject(getThemeLink(options.theme), "<!-- THEME HERE -->"),
    inject(getHighlightThemeLink(options.highlightTheme), "<!-- HIGHLIGHT-THEME HERE -->")
  );

  if (!options.skipUser) {
    injectAll = compose(injectAll,
      inject(getCustomCSS(from, addAssets), "<!-- INCLUDE CSS HERE -->"),
      inject(getCustomJS(from, addAssets), "<!-- INCLUDE JS HERE -->")
    );
  }

  var html = injectAll(fs.readFileSync(path.join(to, INDEX), "utf8"));
  write(path.join(to, INDEX), html, notify);
}

function watch (from, to, options, notify, addAssets) {
  // Change in current basecode: should restart
  watcher(path.join(__dirname, ".."), (file, type) => {
    notify("prez-update", path.relative(from, file), type);
  });

  // User assets: only copy differences
  watcher(USER_FILES.map((f) => {
    return path.join(from, f);
  }), (file, type) => {
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
  ], (file, type) => {
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

function write (to, content, notify) {
  fs.writeFileSync(to, content, "utf8");
  notify("write", to, content);
}

var inject = curry((content, marker, html) => {
  if (!content) {
    return html;
  }

  var index = html.indexOf(marker);

  if (index === -1) {
    return html;
  }

  return html.substring(0, index) + content + html.substring(index + marker.length);
});

function getAssets (from, base) {
  var assetsFile = path.join(from, "includes.txt");
  if (!fs.existsSync(assetsFile)) return [];

  var paths = fs.readFileSync(assetsFile, "utf8").split("\n");
  return (base || []).concat(invokeMap("trim", paths).filter(identity));
}

function getCustomJS (from, base) {
  return getAssets(from, base)
    .filter((f) => f.match(/\.js$/i))
    .map((f) => '<script src="' + f + '"></script>')
    .join("");
}

function getCustomCSS (from, base) {
  return getAssets(from, base)
    .filter((f) => f.match(/\.css$/i))
    .map((f) => '<link rel="stylesheet" href="' + f + '">')
    .join("");
}

function getThemeLink (theme) {
  return '<link rel="stylesheet" href="css/theme/' + theme + '.css" id="theme">';
}

function getHighlightThemeLink (theme) {
  return '<link rel="stylesheet" href="css/highlight/styles/' + theme + '.css" id="highlight-theme">';
}

function getSlides (from, options) {
  var slidesDir = path.join(from, options.slides);
  var slides = getSlidesList(slidesDir, options.keepHidden);
  return parse(options.parser, slides, slidesDir);
}

function generateSlidesHTML (slides, subCovers) {
  return slides.map((slide) => {
    var startTag;
    if (Array.isArray(slide)) {
      var chapterId = slide[0] ? slide[0].chapter.id : "";
      startTag = '<section id="chapter-' + chapterId +'" class="chapter">';
      var content = generateSlidesHTML(slide, subCovers);
      if (subCovers) {
        content = generateSubCover(slide) + content;
      }
      slide.content = content;
    } else {
      startTag = "<section " + generateSectionHTMLAttributes(slide) + ">";
    }

    return startTag + "\n" + slide.content + "\n</section>";
  }).join("\n\n");
}

function generateSectionHTMLAttributes (slide) {
  // id
  var s = 'id="' + slide.id + '"';

  // class
  s += ' class="' + ((slide.classes || []).concat(["slide"])).join(" ") + '"';

  // data attributes, $prop:value$ collected from slide-properties.js
  if (slide.datas) {
    for (var attr in slide.datas) {
      s += " data-" + attr + '="' + slide.datas[attr].replace(/"/g, "&quot;") + '"';
    }
  }

  return s;
}

// the first slide is chosen to be the cover
function generateSubCover (slides) {
  if (!slides.length) return "";

  var id = slides[0].chapter.id;
  var title = slides[0].chapter.title;
  return '<section id="' + id + '" class="slide cover"><h1>' + title + "</h1></section>\n";
}

function getSlidesList (dir, keepHidden, endOfRecursion) {
  if (!fs.existsSync(dir)) {
    throw new Error("Slides folder '" + dir + "' not found");
  }

  return fs.readdirSync(dir).sort()
    .map((f) => {
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
    })
    .filter(identity);
}

function filterSlideName (f) {
  return f.match(/\.(md|html)$/) ? f : null;
}

