"use strict";

var { range } = require("lodash/fp");

  // global stats
exports.count = (slidesList) =>
  slidesList.reduce((acc, s) => {
    if (Array.isArray(s)) {
      acc.chapters++;
      acc.slides += s.length;
      if (s.length > acc.max) acc.max = s.length;
    } else {
      acc.slides++;
    }
    return acc;
  }, { chapters: 0, slides: 0, max: 0 });

exports.graph = (slidesList, max) =>
  range(0, max).map(i =>
    slidesList.reduce((acc, s) =>
      Array.isArray(s)
        ? acc += s[i] ? "█" : " "
        : acc += i === 0 ? "█" : " "
    , "")
  ).join("\n");

