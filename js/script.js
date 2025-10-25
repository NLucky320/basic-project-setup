// script.js
window.addEventListener("DOMContentLoaded", function () {
  // ====== CONFIG ======
  const USE_DYNAMIC_BG = true; // change section/column color per slide
  const FALLBACK_BG = "#ffffff";

  // ====== DOM ======
  const sectionHero = document.getElementById("hero");
  const heroImage = document.getElementById("heroImage");
  const heroLeft = document.querySelector(".hero-left");
  const heroRight = document.querySelector(".hero-right");
  const splideEl = document.getElementById("textSplide");
  if (!splideEl) return;

  // ====== SPLIDE (v2.x) ======
  const textSplide = new Splide("#textSplide", {
    perPage: 1,
    perMove: 1,
    direction: "ttb",
    height: "60vh",
    focus: "center",
    type: "loop",
    arrows: false,
    pagination: false,
    speed: 1500,
    dragAngleThreshold: 60,
    waitForTransition: true,
    updateOnMove: true, // we update at specific events
  });

  // ====== STATE (anti-flicker) ======
  let lastIdx = -1;
  let lastColor = "";
  let lastImg = "";
  let rafToken = null;

  // ====== HELPERS ======
  function isDesktop() {
    return window.matchMedia("(min-width: 992px)").matches;
  }
  function isMounted() {
    try {
      return textSplide && textSplide.State && textSplide.State.is(3);
    } catch (e) {
      return false;
    }
  }
  function getSlideElByIndex(idx) {
    // Prefer Splide API (v2)
    try {
      const Slides = textSplide.Components && textSplide.Components.Slides;
      const s = Slides && Slides.getAt && Slides.getAt(idx);
      if (s && s.slide) return s.slide;
    } catch (e) {}
    // Fallback to DOM index
    const all = splideEl.querySelectorAll(".splide__slide");
    if (!all || !all.length) return null;
    // normalize idx
    const n = ((idx % all.length) + all.length) % all.length;
    return all[n] || null;
  }
  function getActiveSlideEl() {
    return splideEl.querySelector(".splide__slide.is-active");
  }

  function setBG(color) {
    const c = USE_DYNAMIC_BG ? color || FALLBACK_BG : FALLBACK_BG;
    if (c === lastColor) return; // no repaint if same
    lastColor = c;
    if (sectionHero) sectionHero.style.backgroundColor = c;
    if (heroRight) heroRight.style.backgroundColor = c; // ensure visible area updates
  }

  function setImage(url) {
    if (!heroImage || !url || url === lastImg) return;
    lastImg = url;
    // crossfade without reflow hacks
    heroImage.style.opacity = 0;
    requestAnimationFrame(() => {
      heroImage.style.backgroundImage = `url("${url}")`;
      requestAnimationFrame(() => {
        heroImage.style.opacity = 1;
      });
    });
  }

  function applyFromSlideEl(
    slideEl,
    { updateImage = true, updateColor = true } = {}
  ) {
    if (!slideEl) return;
    if (updateColor) setBG(slideEl.getAttribute("data-color"));
    if (updateImage && isDesktop()) setImage(slideEl.getAttribute("data-img"));
  }

  // ====== Mobile helpers ======
  function addMobileImagesIfMissing() {
    splideEl.querySelectorAll(".splide__slide").forEach((li) => {
      if (!li.querySelector("img.mobile-img")) {
        const src = li.getAttribute("data-img");
        if (src) {
          const img = document.createElement("img");
          img.src = src;
          img.alt = "";
          img.className = "mobile-img";
          li.appendChild(img);
        }
      }
      const color = li.getAttribute("data-color");
      if (color) li.style.setProperty("--block", color);
    });
  }
  function removeMobileImages() {
    splideEl
      .querySelectorAll(".splide__slide img.mobile-img")
      .forEach((img) => {
        img.parentNode.removeChild(img);
      });
    splideEl.querySelectorAll(".splide__slide").forEach((li) => {
      li.style.removeProperty("--block");
    });
  }
  function setupMobileStatic() {
    if (heroLeft) heroLeft.style.display = "none";
    addMobileImagesIfMissing();
    const first = splideEl.querySelector(".splide__slide");
    setBG(first && first.getAttribute("data-color"));
  }
  function teardownMobileStatic() {
    if (heroLeft) heroLeft.style.display = "";
    removeMobileImages();
  }

  // ====== Desktop wheel (debounced) ======
  let wheelLock = false;
  function onWheel(e) {
    if (!isDesktop() || !isMounted()) return;
    if (wheelLock) return;
    wheelLock = true;
    e.deltaY < 0 ? textSplide.go("-1") : textSplide.go("+1");
    setTimeout(() => (wheelLock = false), 1200);
  }

  // ====== Bind Splide events ======
  function bindDesktopEvents() {
    textSplide.off("mounted move moved active");

    // 1) CHANGE COLOR AT THE BEGINNING OF THE SLIDE
    textSplide.on("move", function (newIdx, oldIdx, destIdx) {
      const idx = typeof destIdx === "number" ? destIdx : newIdx;
      if (idx === lastIdx) return;
      lastIdx = idx;

      const slideEl = getSlideElByIndex(idx);
      // Update ONLY color at the start to avoid flicker during motion
      applyFromSlideEl(slideEl, { updateImage: false, updateColor: true });
    });

    // 2) FINALIZE IMAGE (and re-affirm color) AFTER MOVEMENT ENDS
    const finalize = () => {
      if (rafToken) cancelAnimationFrame(rafToken);
      rafToken = requestAnimationFrame(() => {
        const slideEl = getActiveSlideEl();
        applyFromSlideEl(slideEl, { updateImage: true, updateColor: true });
      });
    };

    textSplide.on("mounted", finalize);
    textSplide.on("moved", finalize);
    textSplide.on("active", finalize);
  }

  // ====== Responsive mount/destroy ======
  function mountDesktop() {
    teardownMobileStatic();
    if (isMounted()) return;

    bindDesktopEvents();

    try {
      textSplide.mount();
    } catch (e) {}
    // Init state
    const active =
      getActiveSlideEl() || getSlideElByIndex(textSplide.index || 0);
    // Do both immediately on first paint to avoid flash
    applyFromSlideEl(active, { updateImage: true, updateColor: true });
  }

  function mountMobile() {
    try {
      textSplide.destroy(true);
    } catch (e) {}
    setupMobileStatic();
  }

  function syncToViewport() {
    if (isDesktop()) mountDesktop();
    else mountMobile();
  }

  // ====== INIT ======
  if (!USE_DYNAMIC_BG) setBG(FALLBACK_BG);

  window.addEventListener("wheel", onWheel, { passive: true });
  syncToViewport();

  const mq = window.matchMedia("(min-width: 992px)");
  mq.addEventListener("change", syncToViewport);
  window.addEventListener("resize", syncToViewport);
});
