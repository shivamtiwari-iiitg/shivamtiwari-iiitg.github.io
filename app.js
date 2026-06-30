/* Shivam Tiwari — shared interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- pointer-tracking ambient gradient ---------- */
  if (!reduce) {
    window.addEventListener("pointermove", function (e) {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    });
  }

  /* ---------- scroll progress bar ---------- */
  var prog = document.querySelector(".progress");
  if (prog) {
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? h.scrollTop / max : 0;
      prog.style.transform = "scaleX(" + pct + ")";
    }, { passive: true });
  }

  /* ---------- subtle 3D tilt + cursor spotlight on [data-tilt] cards ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = e.clientX - r.left;
        var py = e.clientY - r.top;
        var x = px / r.width - 0.5;
        var y = py / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 4) + "deg) rotateY(" + (x * 5) + "deg) translateY(-2px)";
        card.style.setProperty("--sx", px + "px");
        card.style.setProperty("--sy", py + "px");
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- magnetic CTA buttons ---------- */
  if (!reduce) {
    document.querySelectorAll(".btn, .nav-cta").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.18) + "px, " + (y * 0.25) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- sliding active-indicator under filter chips ---------- */
  var chipsRow = document.querySelector(".chips-row");
  if (chipsRow) {
    var indicator = document.createElement("span");
    indicator.className = "chip-indicator";
    chipsRow.appendChild(indicator);
    function moveIndicator() {
      var active = chipsRow.querySelector(".fchip.active");
      if (!active) return;
      var r = active.getBoundingClientRect();
      var rr = chipsRow.getBoundingClientRect();
      indicator.style.left = (r.left - rr.left) + "px";
      indicator.style.width = r.width + "px";
      indicator.classList.add("on");
    }
    requestAnimationFrame(moveIndicator);
    chipsRow.addEventListener("click", function (e) {
      if (e.target.classList.contains("fchip")) {
        setTimeout(moveIndicator, 0);
      }
    });
    window.addEventListener("resize", moveIndicator);
  }

  /* ---------- hero cycler (typewriter rotating taglines) ---------- */
  var cycler = document.querySelector(".cycler");
  if (cycler && !reduce) {
    var words = (cycler.getAttribute("data-words") || "").split("|").filter(Boolean);
    if (words.length > 1) {
      var wi = 0, ci = 0, deleting = false;
      function tick() {
        var word = words[wi];
        cycler.textContent = word.slice(0, ci);
        if (!deleting && ci < word.length) {
          ci++; setTimeout(tick, 70);
        } else if (deleting && ci > 0) {
          ci--; setTimeout(tick, 40);
        } else if (!deleting && ci === word.length) {
          deleting = true; setTimeout(tick, 1600);
        } else {
          deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 280);
        }
      }
      tick();
    }
  }


  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal,[data-stagger]");
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          if (el.hasAttribute("data-stagger")) {
            var kids = el.children, i = 0;
            [].forEach.call(kids, function (k) {
              k.style.transitionDelay = (i++ * 70) + "ms";
            });
          }
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (target % 1 !== 0) ? 1 : 0;
    if (reduce) { el.textContent = dec ? target.toFixed(1) : target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(1) : Math.round(val);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- hero line entrance ---------- */
  if (!reduce) {
    document.querySelectorAll(".hero h1 .ln i").forEach(function (el, i) {
      el.style.transform = "translateY(110%)";
      el.style.transition = "transform .9s cubic-bezier(.2,.8,.2,1)";
      el.style.transitionDelay = (120 + i * 110) + "ms";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.transform = "translateY(0)"; });
      });
    });
  }

  /* =====================================================
     PREP PAGE: search + filter + expand/collapse + TOC
     ===================================================== */
  var searchInput = document.getElementById("q-search");
  var qaItems = document.querySelectorAll(".qa");
  var cats = document.querySelectorAll(".cat");
  var noResults = document.querySelector(".no-results");
  var chips = document.querySelectorAll(".fchip");
  var activeCat = "all";

  function applyFilter() {
    var term = (searchInput ? searchInput.value : "").trim().toLowerCase();
    var anyVisible = false;
    cats.forEach(function (cat) {
      var catId = cat.getAttribute("data-cat");
      var catMatch = (activeCat === "all" || activeCat === catId);
      var visibleInCat = 0;
      cat.querySelectorAll(".qa").forEach(function (qa) {
        var text = qa.textContent.toLowerCase();
        var tags = (qa.getAttribute("data-tags") || "").toLowerCase();
        var textMatch = !term || text.indexOf(term) > -1 || tags.indexOf(term) > -1;
        var show = catMatch && textMatch;
        qa.style.display = show ? "" : "none";
        if (show) { visibleInCat++; anyVisible = true; }
      });
      cat.style.display = visibleInCat ? "" : "none";
    });
    if (noResults) noResults.style.display = anyVisible ? "none" : "block";
  }

  if (searchInput) searchInput.addEventListener("input", applyFilter);

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeCat = chip.getAttribute("data-target");
      applyFilter();
      if (activeCat !== "all") {
        var el = document.querySelector('.cat[data-cat="' + activeCat + '"]');
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: reduce ? "auto" : "smooth" });
      }
    });
  });

  var expandBtn = document.getElementById("expand-all");
  var collapseBtn = document.getElementById("collapse-all");
  if (expandBtn) expandBtn.addEventListener("click", function () {
    qaItems.forEach(function (qa) { if (qa.style.display !== "none") qa.open = true; });
  });
  if (collapseBtn) collapseBtn.addEventListener("click", function () {
    qaItems.forEach(function (qa) { qa.open = false; });
  });

  /* TOC scroll-spy */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("active"); });
          var t = map[en.target.id];
          if (t) t.classList.add("active");
        }
      });
    }, { rootMargin: "-140px 0px -70% 0px" });
    cats.forEach(function (c) { if (c.id) tio.observe(c); });
  }
})();
