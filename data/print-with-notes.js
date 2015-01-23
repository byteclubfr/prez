window.addEventListener("load", function () {

  if (window.location.search.match(/print-pdf/gi)) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "css/print-with-notes.css";
    document.getElementsByTagName("head")[0].appendChild(link);
  }

  var sections = document.querySelectorAll("section");
  var prev = null, prevHasNotes = false;
  for (var j = 0; j < sections.length; j++) {
    var section = sections[j];

    if (section.classList.contains("stack")) {
      // New stack, reset merge
      prev = null;
      continue;
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
});
