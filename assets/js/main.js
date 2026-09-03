/* ==========================================================================
   GT Consultancy — main.js
   Nav toggle, anime.js interactions (Document 4 Section 8), and JSON-driven
   rendering of services & case studies (Document 5 Backend Schema).
   Written in plain JavaScript — no build step, no framework, per the TRD.
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

// ---- Reduced motion check (Document 4, Section 8 & 9) ----
var prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Hero entrance animation: one orchestrated sequence, once ----
(function () {
  var heroEls = document.querySelectorAll(".js-hero-el");
  if (!heroEls.length) return;

  if (prefersReducedMotion || typeof anime === "undefined") {
    // Safe fallback: content is already visible in the HTML, nothing to do.
    return;
  }

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

  if (prefersReducedMotion || typeof anime === "undefined") {
    return; // numbers are already in the final HTML, fully readable without JS
  }

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

  statEls.forEach(function (el) {
    observer.observe(el);
  });
})();

// ---- Render Services from /data/services.json (Document 5, Section 2) ----
function renderServices(targetSelector, options) {
  var target = document.querySelector(targetSelector);
  if (!target) return;
  options = options || {};

  fetch("/data/services.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (services) {
      var list = options.limit ? services.slice(0, options.limit) : services;
      target.innerHTML = list
        .map(function (s) {
          return (
            '<div class="service-item" id="' + escapeAttr(s.id) + '">' +
            "<h3>" + escapeHtml(s.title) + "</h3>" +
            "<p>" + escapeHtml(s.description) + "</p>" +
            (options.linkToServicesPage
              ? '<a class="service-link" href="/services.html#' + s.id + '">Learn more</a>'
              : "") +
            "</div>"
          );
        })
        .join("");
    })
    .catch(function (err) {
      console.error("Could not load services:", err);
    });
}

// ---- Render Case Studies from /data/case-studies.json (Document 5, Section 1) ----
function renderCaseStudies(targetSelector, options) {
  var target = document.querySelector(targetSelector);
  if (!target) return;
  options = options || {};

  fetch("/data/case-studies.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (studies) {
      var list = options.featuredOnly
        ? studies.filter(function (s) {
            return s.featured;
          })
        : studies;
      if (options.limit) list = list.slice(0, options.limit);

      target.innerHTML = list
        .map(function (cs) {
          if (options.teaser) {
            return (
              '<div class="case-study">' +
              '<div class="meta">' + escapeHtml(cs.country) + " · " + escapeHtml(cs.year) + "</div>" +
              "<h3>" + escapeHtml(cs.title) + "</h3>" +
              "<p>" + escapeHtml(cs.result) + "</p>" +
              "</div>"
            );
          }
          return (
            '<article class="case-study" id="' + escapeAttr(cs.id) + '">' +
            '<div class="meta">' + escapeHtml(cs.country) +
            (cs.institution ? " · " + escapeHtml(cs.institution) : "") +
            " · " + escapeHtml(cs.year) + "</div>" +
            "<h3>" + escapeHtml(cs.title) + "</h3>" +
            '<div class="cs-block"><span class="label">The Challenge</span>' + escapeHtml(cs.challenge) + "</div>" +
            '<div class="cs-block"><span class="label">The Action</span>' + escapeHtml(cs.action) + "</div>" +
            '<div class="cs-block"><span class="label">The Result</span>' + escapeHtml(cs.result) + "</div>" +
            "</article>"
          );
        })
        .join("");
    })
    .catch(function (err) {
      console.error("Could not load case studies:", err);
    });
}

// ---- Small helpers ----
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}
