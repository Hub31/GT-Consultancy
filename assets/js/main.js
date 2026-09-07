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

// ---- Hero background slideshow: JS-driven class toggle (not CSS
// animation-delay chains) — the simplest, most cross-browser-reliable way
// to cross-fade a stack of background images. ----
(function () {
  var slides = document.querySelectorAll(".bg-slide");
  if (!slides.length) return;
  slides[0].classList.add("active");
  if (prefersReducedMotion || slides.length < 2) return;
  var current = 0;
  setInterval(function () {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 6000);
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

// ---- Interactive Africa map: hover/focus/tap tooltips on data countries ----
(function () {
  var wraps = document.querySelectorAll(".map-wrap");
  if (!wraps.length) return;

  wraps.forEach(function (wrap) {
    var tooltip = wrap.querySelector(".map-tooltip");
    var paths = wrap.querySelectorAll("path[data-detail]");
    if (!tooltip || !paths.length) return;

    var activePath = null;

    function showTooltip(path) {
      var name = path.getAttribute("data-country") || "";
      var detail = path.getAttribute("data-detail") || "";
      tooltip.innerHTML = "<strong>" + name + "</strong>" + detail;
      tooltip.classList.add("visible");

      var wrapRect = wrap.getBoundingClientRect();
      var pathRect = path.getBoundingClientRect();
      var centerX = pathRect.left + pathRect.width / 2 - wrapRect.left;
      var pathTop = pathRect.top - wrapRect.top;
      var pathBottom = pathRect.bottom - wrapRect.top;
      var gap = 10;

      var tw = tooltip.offsetWidth;
      var th = tooltip.offsetHeight;

      // Clamp horizontally so the tooltip never overflows the map wrap
      var half = tw / 2;
      var clampedX = Math.max(half, Math.min(wrapRect.width - half, centerX));

      // Prefer placing above the country; flip below if there's no room
      var placeAbove = pathTop - th - gap >= 0;
      var topY = placeAbove ? pathTop - th - gap : pathBottom + gap;

      tooltip.style.left = clampedX + "px";
      tooltip.style.top = Math.max(0, topY) + "px";
      tooltip.classList.toggle("arrow-down", placeAbove);
      tooltip.classList.toggle("arrow-up", !placeAbove);
      activePath = path;
    }

    function hideTooltip() {
      tooltip.classList.remove("visible");
      activePath = null;
    }

    paths.forEach(function (path) {
      path.addEventListener("mouseenter", function () { showTooltip(path); });
      path.addEventListener("mouseleave", hideTooltip);
      path.addEventListener("focus", function () { showTooltip(path); });
      path.addEventListener("blur", hideTooltip);
      path.addEventListener("click", function (e) {
        e.stopPropagation();
        showTooltip(path);
      });
    });

    // Tapping elsewhere on the page dismisses an open tooltip (touch devices)
    document.addEventListener("click", function () {
      if (activePath) hideTooltip();
    });
  });
})();
