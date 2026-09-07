/* ==========================================================================
   GT Consultancy — main.js
   All content is pre-rendered static HTML (for SEO, reliability, and no-JS
   support). This file only handles interactivity: nav toggle, animations,
   and the accordion expand/collapse. No runtime data-fetching.
   ========================================================================== */

// ---- Mobile nav toggle ----
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", function () {
    var isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
})();

// ---- Reduced motion check ----
var prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Hero entrance animation: one orchestrated sequence, once ----
(function () {
  var heroEls = document.querySelectorAll(".js-hero-el");
  if (!heroEls.length) return;
  if (prefersReducedMotion || typeof anime === "undefined") return;

  anime.set(heroEls, { opacity: 0, translateY: 16 });
  anime({
    targets: heroEls,
    opacity: [0, 1],
    translateY: [16, 0],
    delay: anime.stagger(40),
    duration: 500,
    easing: "easeOutQuad",
  });
})();

// ---- Stat count-up: meaningful motion, triggered once on scroll into view ----
(function () {
  var statEls = document.querySelectorAll(".js-count");
  if (!statEls.length) return;
  if (prefersReducedMotion || typeof anime === "undefined") return;

  var animated = new WeakSet();
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || animated.has(entry.target)) return;
        animated.add(entry.target);
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count-to"));
        var suffix = el.getAttribute("data-count-suffix") || "";
        if (isNaN(target)) return;
        var obj = { val: 0 };
        anime({
          targets: obj,
          val: target,
          duration: 1400,
          easing: "easeOutCubic",
          round: 1,
          update: function () {
            el.textContent = obj.val.toLocaleString() + suffix;
          },
        });
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach(function (el) { observer.observe(el); });
})();

// ---- Accordion interactivity (content is pre-rendered static HTML —
//      this only wires up expand/collapse, single-open behavior) ----
(function () {
  var container = document.querySelector("#country-accordion");
  if (!container) return;

  var items = container.querySelectorAll(".accordion-item");
  items.forEach(function (item) {
    var header = item.querySelector(".accordion-header");
    var panel = item.querySelector(".accordion-panel");

    if (item.classList.contains("open")) {
      panel.style.maxHeight = "none";
    }

    header.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      items.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
          other.querySelector(".accordion-panel").style.maxHeight = "0px";
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        header.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = "0px";
      } else {
        item.classList.add("open");
        header.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
})();
