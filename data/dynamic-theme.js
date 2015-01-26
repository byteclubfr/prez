// Restore ability to change theme from query string
(function () {
  var theme = Reveal.getQueryHash().theme;
  if (theme) {
    document.getElementById('theme').setAttribute('href', 'css/theme/' + theme + '.css');
  }

  // Also change highlight.js theme!
  var highlightTheme = Reveal.getQueryHash().highlightTheme;
  if (highlightTheme) {
    document.getElementById('highlight-theme').setAttribute('href', 'css/highlight/styles/' + highlightTheme + '.css');
  }
})();
