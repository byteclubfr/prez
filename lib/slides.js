"use strict";

var path = require("path");
var fs = require("fs");
var parse = require("./parse");
var { identity } = require("lodash/fp");

exports.generateSlidesHTML = generateSlidesHTML;
exports.getSlides = getSlides;
exports.getSlidesList = getSlidesList;

// enclose with nested <section> tags
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

// id, class and data-*
function generateSectionHTMLAttributes (slide) {
  var s = 'id="' + slide.id + '"';
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

// get slides as JSON
function getSlides (from, options) {
  var slidesDir = path.join(from, options.slides);
  var slides = getSlidesList(slidesDir, options.keepHidden);
  return parse(options.parser, slides, slidesDir);
}

// fs operations
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
