// Arcadia-style sticky scroll with content switching
function initStickyContentScroll() {
  const sections = document.querySelectorAll(".main-container > div");

  sections.forEach((section, sectionIndex) => {
    const divFlex = section.querySelector(".div-flex");
    if (!divFlex) return;

    const img = divFlex.querySelector("img");
    const textContent = divFlex.children[1];

    if (!img || !textContent) return;

    // Create new structure
    const container = document.createElement("div");
    container.className = "sticky-container";
    container.setAttribute("data-section", sectionIndex);

    // Image side (sticky)
    const imageSide = document.createElement("div");
    imageSide.className = "sticky-side";
    imageSide.innerHTML = `
      <div class="sticky-image-wrapper">
        ${img.outerHTML}
      </div>
    `;

    // Content side (scrollable)
    const contentSide = document.createElement("div");
    contentSide.className = "content-side";

    // Create spacer for scroll height
    const spacer = document.createElement("div");
    spacer.className = "content-spacer";

    // Wrap the existing content
    const contentItem = document.createElement("div");
    contentItem.className = "content-item";
    contentItem.innerHTML = textContent.innerHTML;

    spacer.appendChild(contentItem);
    contentSide.appendChild(spacer);

    // Assemble
    container.appendChild(imageSide);
    container.appendChild(contentSide);

    // Replace original content
    divFlex.innerHTML = "";
    divFlex.appendChild(container);

    // Setup scroll animation
    setupScrollAnimation(section, imageSide, contentItem);
  });
}

function setupScrollAnimation(section, imageSide, contentItem) {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: buildThresholdArray(),
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const scrollProgress = entry.intersectionRatio;
        updateContentOpacity(contentItem, scrollProgress);
      }
    });
  }, observerOptions);

  observer.observe(section);
}

function buildThresholdArray() {
  const steps = 100;
  const thresholds = [];
  for (let i = 0; i <= steps; i++) {
    thresholds.push(i / steps);
  }
  return thresholds;
}

function updateContentOpacity(contentItem, progress) {
  // Fade in content as user scrolls
  const opacity = Math.min(1, progress * 2);
  const translateY = Math.max(0, (1 - progress * 2) * 50);

  contentItem.style.opacity = opacity;
  contentItem.style.transform = `translateY(${translateY}px)`;
}

// Smooth section navigation
function setupSectionNavigation() {
  const sections = document.querySelectorAll(".main-container > div");

  sections.forEach((section, index) => {
    section.setAttribute("data-section-index", index);
  });

  // Optional: Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      scrollToNextSection();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      scrollToPrevSection();
    }
  });
}

function getCurrentSection() {
  const sections = document.querySelectorAll(".main-container > div");
  const scrollPos = window.scrollY + window.innerHeight / 2;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionBottom = sectionTop + rect.height;

    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      return i;
    }
  }
  return 0;
}

function scrollToNextSection() {
  const current = getCurrentSection();
  const sections = document.querySelectorAll(".main-container > div");

  if (current < sections.length - 1) {
    sections[current + 1].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function scrollToPrevSection() {
  const current = getCurrentSection();
  const sections = document.querySelectorAll(".main-container > div");

  if (current > 0) {
    sections[current - 1].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Initialize everything
function init() {
  // Wait for images to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        initStickyContentScroll();
        setupSectionNavigation();
      }, 100);
    });
  } else {
    setTimeout(() => {
      initStickyContentScroll();
      setupSectionNavigation();
    }, 100);
  }
}

init();
