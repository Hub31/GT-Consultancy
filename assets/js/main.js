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

// ---- Original icon set (matches logo's shield/globe/flask visual language) ----
var SERVICE_ICONS = {
  "lab-systems-strengthening":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7 15h10"/></svg>',
  "biorepository-design":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 9h10M7 15h10" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  "disease-surveillance":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6M10 7v3l2 2"/></svg>',
  "quality-accreditation":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.6 1.9 3.2-.2 1 3 2.7 1.8-1 3 1 3-2.7 1.8-1 3-3.2-.2L12 21l-2.6-1.9-3.2.2-1-3-2.7-1.8 1-3-1-3 2.7-1.8 1-3 3.2.2z"/><path d="M9 12l2 2 4-4"/></svg>',
  "biosafety-biosecurity":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>',
  "training-capacity":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4L2 8l10 4 10-4z"/><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/></svg>',
  "data-systems":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
  "technical-assistance":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5z"/></svg>'
};

// ---- Render Services from /data/services.json (Document 5, Section 2) ----
function renderServices(targetSelector, options) {
  var target = document.querySelector(targetSelector);
  if (!target) return;
  options = options || {};

  fetch("data/services.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (services) {
      var list = options.limit ? services.slice(0, options.limit) : services;
      target.innerHTML = list
        .map(function (s) {
          return (
            '<div class="service-item" id="' + escapeAttr(s.id) + '">' +
            '<div class="service-icon">' + (SERVICE_ICONS[s.id] || "") + "</div>" +
            "<div><h3>" + escapeHtml(s.title) + "</h3>" +
            "<p>" + escapeHtml(s.description) + "</p>" +
            (options.linkToServicesPage
              ? '<a class="service-link" href="services.html#' + s.id + '">Learn more</a>'
              : "") +
            "</div></div>"
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

  fetch("data/case-studies.json")
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

// ---- Render Publications from /data/publications.json ----
function renderPublications(targetSelector) {
  var target = document.querySelector(targetSelector);
  if (!target) return;

  fetch("data/publications.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (pubs) {
      target.innerHTML = pubs
        .map(function (p) {
          return (
            '<div class="publication-item">' +
            "<p style=\"margin-bottom:6px;\">" + escapeHtml(p.citation) + "</p>" +
            '<div class="meta"><em>' + escapeHtml(p.journal) + "</em>, " + escapeHtml(p.year) +
            "; " + escapeHtml(p.details) +
            ' · <a href="https://doi.org/' + escapeAttr(p.doi) + '" target="_blank" rel="noopener">DOI: ' + escapeHtml(p.doi) + "</a></div>" +
            "</div>"
          );
        })
        .join("");
    })
    .catch(function (err) {
      console.error("Could not load publications:", err);
    });
}

// ---- Render interactive Country accordion (click a nation to expand its details) ----
function renderCountryAccordion(containerSelector) {
  var container = document.querySelector(containerSelector);
  if (!container) return;

  Promise.all([
    fetch("data/countries.json").then(function (r) { return r.json(); }),
    fetch("data/case-studies.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    var countries = results[0];
    var caseStudies = results[1];

    container.innerHTML = countries
      .map(function (c, i) {
        return (
          '<div class="accordion-item' + (i === 0 ? " open" : "") + '" data-id="' + escapeAttr(c.id) + '">' +
          '<button type="button" class="accordion-header" aria-expanded="' + (i === 0 ? "true" : "false") + '">' +
          "<span class=\"accordion-title\">" + escapeHtml(c.name) + "</span>" +
          "<span class=\"accordion-summary\">" + escapeHtml(c.summary) + "</span>" +
          '<span class="accordion-chevron" aria-hidden="true">&#9662;</span>' +
          "</button>" +
          '<div class="accordion-panel"><div class="accordion-panel-inner"></div></div>' +
          "</div>"
        );
      })
      .join("");

    function fillPanel(item, country) {
      var inner = item.querySelector(".accordion-panel-inner");
      if (inner.dataset.filled) return; // build content once, lazily, on first open

      var matches = caseStudies.filter(function (cs) {
        return cs.countries && cs.countries.indexOf(country.name) !== -1;
      });

      var html = "";
      if (matches.length) {
        html = matches
          .map(function (cs) {
            return (
              '<article class="case-study">' +
              '<div class="meta">' + escapeHtml(cs.institution || "") +
              (cs.year ? " · " + escapeHtml(cs.year) : "") + "</div>" +
              "<h4>" + escapeHtml(cs.title) + "</h4>" +
              '<div class="cs-block"><span class="label">The Challenge</span>' + escapeHtml(cs.challenge) + "</div>" +
              '<div class="cs-block"><span class="label">The Action</span>' + escapeHtml(cs.action) + "</div>" +
              '<div class="cs-block"><span class="label">The Result</span>' + escapeHtml(cs.result) + "</div>" +
              "</article>"
            );
          })
          .join("");
      }
      if (country.note) {
        html += '<p class="honest-note">' + escapeHtml(country.note) + "</p>";
      }
      inner.innerHTML = html || "<p>Details coming soon.</p>";
      inner.dataset.filled = "1";
    }

    var items = container.querySelectorAll(".accordion-item");

    items.forEach(function (item) {
      var id = item.getAttribute("data-id");
      var country = countries.find(function (c) { return c.id === id; });
      var header = item.querySelector(".accordion-header");
      var panel = item.querySelector(".accordion-panel");

      if (item.classList.contains("open")) {
        fillPanel(item, country);
        panel.style.maxHeight = "none";
      }

      header.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");

        // Close all others (single-open accordion)
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
          fillPanel(item, country);
          item.classList.add("open");
          header.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }).catch(function (err) {
    console.error("Could not load country accordion:", err);
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
