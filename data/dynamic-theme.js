// Restore ability to change theme from query string
(function () {
  var theme = Reveal.getQueryHash().theme;
  if (theme) {
    document.getElementById('theme').setAttribute('href', 'css/theme/' + theme + '.css');
  }
})();
