(function () {
  if (window.location.search.match(/print-pdf/gi)) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "css/such-notes-print.css";
    document.getElementsByTagName("head")[0].appendChild(link);

    var sections = document.querySelectorAll("section.slide");
    var prev = null, prevHasNotes = false;
    for (var j = 0; j < sections.length; j++) {
      var section = sections[j];

      // data-background not supported
      if (section.getAttribute("data-background")) {
        section.innerHTML = "<p class=\"print-warning\">Slide background not included in print support</p>" + section.innerHTML;
        section.removeAttribute("data-background");
      }
      if (section.getAttribute("data-background-video")) {
        section.innerHTML = "<p class=\"print-warning\">Video background not included in print support</p>" + section.innerHTML;
        section.removeAttribute("data-background-video");
      }
      if (section.getAttribute("data-background-iframe")) {
        section.innerHTML = "<p class=\"print-warning\">Video background not included in print support</p>" + section.innerHTML;
        section.removeAttribute("data-background-iframe");
      }

      if (!section.querySelector("aside.notes") && prev && !prev.querySelector("aside.notes")) {
        // Two consecutive unannotated? Merge!
        prev.classList.add("merge-next");
        section.classList.add("merge-prev");
        // Reset merge loop
        prev = null;
      } else {
        // Just continue normal loop
        prev = section;
      }
    }
  }
})();
