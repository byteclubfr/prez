var path = require("path");

var packageInfo = readPackageJson(process.cwd());

function readPackageJson (dir) {
  var packageInfo;
  try {
    var pathToPackage = path.resolve(dir, "package.json");
    packageInfo = require(pathToPackage);
  } catch(e) {
    // blank default
    // Do not define props to let merge do its magic properly
    packageInfo = {};
  }
  return packageInfo;
}


module.exports = {
  "slides": "slides",
  "skipReveal": false,
  "skipIndex": false,
  "skipUser": false,
  "keepHidden": false,
  "print": false,
  "printTheme": "simple",
  "phantomjs": "phantomjs",
  "suchNotes": false,
  "theme": "solarized",
  "highlightTheme": "zenburn",
  "dynamicTheme": true,
  "watch": false,
  "subCovers": false,
  "title": packageInfo.name || "Prez",
  "author": packageInfo.author || process.env.USER || "",
  "description": packageInfo.description || "",
  "parser": "marked"
};
