// Global declarations for GSAP when using CDN without type defs
declare const gsap: any;
declare const ScrollTrigger: any;

// Easing helpers
const easeOutExpo = "expo.out";
const easeInOut = "power2.inOut";

// Cursor state
type CursorState = {
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  raf?: number;
  label: string | null;
};

// Linear interpolation
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Split text into spans for staggered animations
function splitText(node: Element): HTMLSpanElement[] {
  const text = node.textContent?.trim() ?? "";
  node.textContent = "";
  const frag = document.createDocumentFragment();
  const spans: HTMLSpanElement[] = [];
  for (const char of text) {
    const span = document.createElement("span");
    // Preserve spaces and make them visibly wider
    if (char === " ") {
      span.textContent = "\u00A0"; // non-breaking space
      span.style.display = "inline-block";
      span.style.width = "0.5em"; // visible gap between words
      span.style.willChange = "transform, opacity";
      frag.appendChild(span);
      spans.push(span);
      continue;
    }
    span.textContent = char;
    span.style.display = "inline-block";
    span.style.willChange = "transform, opacity";
    frag.appendChild(span);
    spans.push(span);
  }
  node.appendChild(frag);
  return spans;
}

// Animate hero headline
function animateHeroName(): void {
  const headline = document.querySelector(".hero-title-name .split");
  if (!headline) return;
  const letters = splitText(headline);
  gsap.fromTo(
    letters,
    { opacity: 0, y: 20, rotateX: -30 },
    {
      opacity: 1, y: 0, rotateX: 0,
      ease: easeOutExpo,
      duration: 1.1,
      stagger: { each: 0.02, from: "start" },
      delay: 0.2,
    }
  );
}

// Animate hero headline
function animateHeroProf(): void {
  const headline = document.querySelector(".hero-title-prof .split");
  if (!headline) return;
  const letters = splitText(headline);
  gsap.fromTo(
    letters,
    { opacity: 0, y: 20, rotateX: -30 },
    {
      opacity: 1, y: 0, rotateX: 0,
      ease: easeOutExpo,
      duration: 1.1,
      stagger: { each: 0.02, from: "start" },
      delay: 0.2,
    }
  );
}

// Floating background blobs
function animateBlobs(): void {
  const blobs = document.querySelectorAll<HTMLElement>(".blob");
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;

  blobs.forEach((blob, i) => {
    // Randomize initial position off-center for variety
    const startX = gsap.utils.random(0.1 * vw(), 0.9 * vw());
    const startY = gsap.utils.random(0.1 * vh(), 0.9 * vh());
    gsap.set(blob, { x: startX, y: startY, scale: gsap.utils.random(0.9, 1.15), opacity: gsap.utils.random(0.55, 0.75) });

    // Spotlight sweep path across the viewport
    const timeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    const dx = gsap.utils.random(0.2 * vw(), 0.8 * vw());
    const dy = gsap.utils.random(0.2 * vh(), 0.8 * vh());

    timeline.to(blob, {
      duration: gsap.utils.random(6, 10),
      x: `+=${dx * (i % 2 === 0 ? 1 : -1)}`,
      y: `+=${dy * (i % 2 === 0 ? -1 : 1)}`,
      scale: gsap.utils.random(0.95, 1.1),
      opacity: gsap.utils.random(0.6, 0.85),
    }, 0).progress(gsap.utils.random(0, 1));

    // subtle rotation/scale pulsation
    gsap.to(blob, { duration: gsap.utils.random(3, 5), scale: "+=0.05", yoyo: true, repeat: -1, ease: "sine.inOut" });
  });

  // Parallax sway on scroll for added depth
  if (typeof ScrollTrigger !== "undefined") {
    blobs.forEach((blob, idx) => {
      gsap.to(blob, {
        yPercent: (idx % 2 === 0 ? -1 : 1) * 8,
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true },
      });
    });
  }
}

// Scroll-triggered reveals
function setupScrollReveals(): void {
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
  revealEls.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        ease: easeOutExpo,
        duration: 0.9,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

// Animate hero photo on load
function animateHeroPhoto(): void {
  const photo = document.querySelector<HTMLElement>(".hero-photo-frame");
  if (!photo) return;
  gsap.fromTo(photo, { y: 20, opacity: 0, scale: 0.96, rotate: -2 }, { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: easeOutExpo, delay: 0.35 });
}

// Custom cursor & hover label
function setupCursor(): void {
  const cursor = document.getElementById("cursor");
  const label = document.getElementById("cursor-label");
  const infinityPath = document.getElementById("cursor-infinity");
  if (!cursor || !label) return;

  const state: CursorState = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0, label: null };

  let lastX = state.x;
  let lastY = state.y;
  let velocity = 0;
  function move(e: MouseEvent) {
    state.tx = e.clientX;
    state.ty = e.clientY;
  }

  function render() {
    const prevX = state.x;
    const prevY = state.y;
    state.x = lerp(state.x, state.tx, 0.22);
    state.y = lerp(state.y, state.ty, 0.22);
    cursor.style.transform = `translate(${state.x}px, ${state.y}px)`;
    // compute velocity and orient the infinity symbol
    const dx = state.x - prevX;
    const dy = state.y - prevY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const speed = Math.min(1, Math.hypot(dx, dy) / 24);
    velocity = lerp(velocity, speed, 0.2);

    const svg = cursor.querySelector("svg") as SVGSVGElement | null;
    if (svg) {
      const stretch = 1 + velocity * 0.35; // stretch with speed
      svg.style.transform = `rotate(${angle}deg) scaleX(${stretch})`;
      // stroke width also increases slightly with speed
      if (infinityPath instanceof SVGPathElement) {
        infinityPath.setAttribute("stroke-width", String(8 + velocity * 4));
        infinityPath.setAttribute("opacity", String(0.8 + 0.2 * velocity));
      }
    }
    state.raf = requestAnimationFrame(render);
  }

  state.raf = requestAnimationFrame(render);
  window.addEventListener("mousemove", move, { passive: true });

  // Hover effects for elements with data-hover or .has-hover
  const hoverables = document.querySelectorAll<HTMLElement>(".has-hover");
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const text = el.getAttribute("data-hover");
      if (text) {
        label.textContent = text;
        cursor.classList.add("show-label");
      }
      cursor.classList.add("enlarge");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("enlarge", "show-label");
      label.textContent = "";
    });
  });
}

// Magnetic hover effect for links/buttons
function setupMagnetic(): void {
  const magneticEls = document.querySelectorAll<HTMLElement>(".magnetic");
  const strength = 0.3; // 30% toward cursor
  const maxTranslate = 12; // px

  magneticEls.forEach((el) => {
    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      const tx = Math.max(-maxTranslate, Math.min(maxTranslate, relX * strength));
      const ty = Math.max(-maxTranslate, Math.min(maxTranslate, relY * strength));
      gsap.to(el, { x: tx, y: ty, duration: 0.3, ease: easeInOut });
    }

    function onLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: easeInOut });
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  });
}

// Page transition overlay
function setupPageTransitions(): void {
  const overlay = document.getElementById("transition-overlay");
  if (!overlay) return;

  function playIn(cb?: () => void) {
    gsap.fromTo(
      overlay,
      { transformOrigin: "top", scaleY: 0 },
      {
        scaleY: 1,
        duration: 0.5,
        ease: easeInOut,
        onComplete: cb,
      }
    );
  }

  function playOut() {
    gsap.fromTo(
      overlay,
      { transformOrigin: "bottom", scaleY: 1 },
      { scaleY: 0, duration: 0.6, ease: easeInOut, delay: 0.1 }
    );
  }

  // Smooth-scrolling between sections with transition
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".site-nav a[href^='#']");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href") || "");
      if (!target) return;
      playIn(() => {
        target.scrollIntoView({ behavior: "instant", block: "start" as ScrollLogicalPosition });
        // Small delay to ensure layout settle
        setTimeout(playOut, 50);
      });
    });
  });

  // Initial reveal
  playOut();
}

// Project overlay template
function setupProjectOverlay(): void {
  const overlay = document.getElementById("project-overlay");
  const closeBtn = overlay?.querySelector<HTMLButtonElement>(".overlay-close");
  const title = overlay?.querySelector<HTMLElement>(".overlay-title");
  const desc = overlay?.querySelector<HTMLElement>(".overlay-desc");
  const tags = overlay?.querySelector<HTMLElement>(".overlay-tags");
  const media = overlay?.querySelector<HTMLElement>(".overlay-media .img");
  if (!overlay || !closeBtn || !title || !desc || !tags || !media) return;

  function openProject(el: HTMLElement) {
    const pTitle = el.getAttribute("data-project-title") || "Project";
    const pDesc = el.getAttribute("data-project-desc") || "";
    const pTags = (el.getAttribute("data-project-tags") || "").split(",").map((t) => t.trim()).filter(Boolean);

    title.textContent = pTitle;
    desc.textContent = pDesc;
    tags.innerHTML = "";
    for (const t of pTags) {
      const badge = document.createElement("span");
      badge.className = "tag";
      badge.textContent = t;
      tags.appendChild(badge);
    }

    overlay.classList.add("active");
    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: easeInOut }
    );
    gsap.fromTo(
      ".project-overlay-inner",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: easeOutExpo }
    );
  }

  function closeProject() {
    gsap.to(".project-overlay-inner", { y: 10, opacity: 0, duration: 0.3, ease: easeInOut });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      ease: easeInOut,
      delay: 0.15,
      onComplete: () => {
        overlay.classList.remove("active");
        overlay.style.opacity = "";
      },
    });
  }

  document.querySelectorAll<HTMLElement>(".project-link").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      openProject(card);
    });
  });

  closeBtn.addEventListener("click", closeProject);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeProject();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) closeProject();
  });
}

// Footer year
function setYear(): void {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

// Initialize all behaviors
function init(): void {
  animateHeroName();
  animateHeroProf();
  animateBlobs();
  setupScrollReveals();
  setupCursor();
  setupMagnetic();
  setupPageTransitions();
  setupProjectOverlay();
  setYear();
  animateHeroPhoto();
}

// DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


