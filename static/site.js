// Sayon's website: the switch between the light and dark themes, a copy
// button on each block of code, `/` to search, a link on each heading of a
// guide, and the section in view in its contents.
//
// It runs in the page's head, so that a chosen theme applies before the
// page is drawn, and the rest once the page is read.

(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "sayon-theme";

  function chosen() {
    try {
      return localStorage.getItem(KEY);
    } catch (error) {
      return null;
    }
  }

  var theme = chosen();
  if (theme === "light" || theme === "dark") {
    root.setAttribute("data-theme", theme);
  }
  root.classList.add("js");

  var ICONS = {
    clipboard: '<svg class="clipboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    check: '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  function dark() {
    var set = root.getAttribute("data-theme");
    if (set) {
      return set === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function themeSwitches() {
    var buttons = document.querySelectorAll("[data-theme-switch]");
    function label() {
      var text = dark() ? "Use the light theme" : "Use the dark theme";
      buttons.forEach(function (button) {
        button.setAttribute("aria-label", text);
        button.setAttribute("title", text);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var next = dark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem(KEY, next);
        } catch (error) {
          // A browser that keeps nothing still switches for this page.
        }
        label();
      });
    });
    label();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var copied = document.execCommand("copy");
      document.body.removeChild(area);
      if (copied) {
        resolve();
      } else {
        reject(new Error("the browser would not copy"));
      }
    });
  }

  function copyButtons() {
    document.querySelectorAll("pre:not(.terminal)").forEach(function (pre) {
      var box = document.createElement("div");
      box.className = "code";
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "copy";
      button.setAttribute("aria-label", "Copy the code");
      button.setAttribute("title", "Copy");
      button.innerHTML = ICONS.clipboard + ICONS.check;
      var timer = null;
      button.addEventListener("click", function () {
        copyText(pre.innerText.replace(/\n$/, "")).then(function () {
          button.classList.add("done");
          button.setAttribute("aria-label", "Copied");
          clearTimeout(timer);
          timer = setTimeout(function () {
            button.classList.remove("done");
            button.setAttribute("aria-label", "Copy the code");
          }, 1600);
        }, function () {
          button.setAttribute("aria-label", "Select the code to copy it");
        });
      });
      box.appendChild(button);
    });
  }

  function searchKey() {
    var search = document.querySelector("[data-search]");
    if (!search) {
      return;
    }
    document.addEventListener("keydown", function (event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      var target = event.target;
      if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }
      event.preventDefault();
      search.focus();
      search.select();
    });
  }

  function headingLinks() {
    document.querySelectorAll(".prose h2[id], .prose h3[id]").forEach(function (heading) {
      var link = document.createElement("a");
      link.className = "anchor";
      link.href = "#" + heading.id;
      link.setAttribute("aria-label", "Link to this section");
      link.textContent = "#";
      heading.appendChild(link);
    });
  }

  // The contents mark the last section whose heading has passed the bar.
  function sectionInView() {
    var links = document.querySelectorAll(".toc a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) {
      return;
    }
    var byId = {};
    var headings = [];
    links.forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute("href").slice(1));
      var heading = document.getElementById(id);
      if (heading) {
        (byId[id] = byId[id] || []).push(link);
        headings.push(heading);
      }
    });
    var current = null;
    function mark(id) {
      if (id === current) {
        return;
      }
      if (current && byId[current]) {
        byId[current].forEach(function (link) {
          link.removeAttribute("aria-current");
        });
      }
      current = id;
      if (id && byId[id]) {
        byId[id].forEach(function (link) {
          link.setAttribute("aria-current", "true");
        });
      }
    }
    var observer = new IntersectionObserver(function () {
      var passed = null;
      headings.forEach(function (heading) {
        if (heading.getBoundingClientRect().top < 120) {
          passed = heading.id;
        }
      });
      mark(passed || (headings[0] && headings[0].id));
    }, { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] });
    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  function start() {
    themeSwitches();
    copyButtons();
    searchKey();
    headingLinks();
    sectionInView();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
