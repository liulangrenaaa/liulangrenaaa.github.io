(function () {
  var documentRoot = document.querySelector("[data-resume-document]");
  if (!documentRoot) {
    return;
  }

  var source = documentRoot.querySelector("[data-resume-source]");
  var pages = documentRoot.querySelector("[data-resume-pages]");
  var printButton = documentRoot.querySelector("[data-resume-print]");
  var scheduled = false;
  var lastLayoutWidth = 0;

  function setPrintMode(enabled) {
    documentRoot.classList.toggle("is-printing", enabled);
  }

  function createPage(index) {
    var page = document.createElement("section");
    var content = document.createElement("div");
    page.className = "resume-page";
    page.dataset.page = String(index);
    page.setAttribute("aria-label", "简历第 " + index + " 页");
    content.className = "resume-page-content";
    page.appendChild(content);
    pages.appendChild(page);
    return content;
  }

  function isResumeItem(node) {
    return node.classList && node.classList.contains("resume-item");
  }

  function createSectionShell(section, leadingNodes) {
    var shell = section.cloneNode(false);

    leadingNodes.forEach(function (node) {
      shell.appendChild(node.cloneNode(true));
    });

    return shell;
  }

  function overflows(content) {
    return content.scrollHeight > content.clientHeight + 1;
  }

  function getLayoutWidth() {
    var firstPage = pages.querySelector(".resume-page");
    if (firstPage) {
      return Math.round(firstPage.getBoundingClientRect().width);
    }

    return Math.round(documentRoot.getBoundingClientRect().width);
  }

  function layoutPages() {
    if (!documentRoot.classList.contains("is-printing")) {
      var previewContent;

      pages.innerHTML = "";
      previewContent = createPage(1);
      Array.prototype.slice.call(source.children).forEach(function (node) {
        previewContent.appendChild(node.cloneNode(true));
      });
      documentRoot.dataset.pages = "1";
      lastLayoutWidth = getLayoutWidth();
      return;
    }

    var nodes = Array.prototype.slice.call(source.children);
    var pageIndex = 1;
    var content;

    pages.innerHTML = "";
    content = createPage(pageIndex);

    function nextPage() {
      pageIndex += 1;
      content = createPage(pageIndex);
    }

    function appendWholeNode(node) {
      var clone = node.cloneNode(true);
      content.appendChild(clone);

      if (overflows(content) && content.children.length > 1) {
        content.removeChild(clone);
        nextPage();
        content.appendChild(clone);
      }
    }

    function appendSection(section) {
      var children = Array.prototype.slice.call(section.children);
      var firstItemIndex = children.findIndex(isResumeItem);
      var items;
      var leadingNodes;
      var shell;
      var shellItemCount = 0;

      if (firstItemIndex === -1) {
        appendWholeNode(section);
        return;
      }

      leadingNodes = children.slice(0, firstItemIndex);
      items = children.filter(isResumeItem);

      function startSection() {
        shell = createSectionShell(section, leadingNodes);
        shellItemCount = 0;
        content.appendChild(shell);

        if (overflows(content) && content.children.length > 1) {
          content.removeChild(shell);
          nextPage();
          content.appendChild(shell);
        }
      }

      startSection();

      items.forEach(function (item) {
        var clone = item.cloneNode(true);
        shell.appendChild(clone);

        if (overflows(content)) {
          shell.removeChild(clone);

          if (shellItemCount === 0 && shell.parentNode) {
            content.removeChild(shell);
          }

          nextPage();
          startSection();
          shell.appendChild(clone);
        }

        shellItemCount += 1;
      });
    }

    nodes.forEach(function (node) {
      if (node.classList && node.classList.contains("resume-section")) {
        appendSection(node);
        return;
      }

      appendWholeNode(node);
    });

    documentRoot.dataset.pages = String(pageIndex);
    lastLayoutWidth = getLayoutWidth();
  }

  function printResume() {
    setPrintMode(true);
    layoutPages();
    window.setTimeout(function () {
      window.print();
    }, 150);
  }

  function scheduleLayout() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      layoutPages();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleLayout);
  } else {
    scheduleLayout();
  }

  window.addEventListener("resize", function () {
    var width = getLayoutWidth();
    if (width !== lastLayoutWidth) {
      scheduleLayout();
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleLayout);
  }

  if (printButton) {
    printButton.addEventListener("click", printResume);
  }

  window.addEventListener("beforeprint", function () {
    setPrintMode(true);
    layoutPages();
  });

  window.addEventListener("afterprint", function () {
    setPrintMode(false);
    scheduleLayout();
  });
})();
