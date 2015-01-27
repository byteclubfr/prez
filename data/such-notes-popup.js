(function () {
  var opener = window.opener;

  if (!opener) {
    return;
  }

  var link = opener.document.getElementById("highlight-theme");
  if (!link) {
    return;
  }

  var href = link.getAttribute("href");
  if (!href) {
    href = "css/highlight/styles/default.css";
  }

  if (href[0] !== "/") {
    href = "/" + href;
  }

  // href = /css/highlight/styles/{highlightTheme}.css
  // notes.html in /plugin/notes/ => prepend ../..
  href = "../.." + href;

  link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  document.head.appendChild(link);
})();
