// Compiled from main.ts
const easeOutExpo = "expo.out";
const easeInOut = "power2.inOut";
function lerp(start, end, t) {
  return start + (end - start) * t;
}
function splitText(node) {
  const text = (node.textContent == null ? void 0 : node.textContent.trim()) ?? "";
  node.textContent = "";
  const frag = document.createDocumentFragment();
  const spans = [];
  for (const char of text) {
    const span = document.createElement("span");
    if (char === " ") {
      span.textContent = "\u00A0";
      span.style.display = "inline-block";
      span.style.width = "0.5em";
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
function animateHero() {
  const headline = document.querySelector(".hero-title-prof .split");
  if (!headline) return;
  const letters = splitText(headline);
  gsap.fromTo(letters, { opacity: 0, y: 20, rotateX: -30 }, { opacity: 1, y: 0, rotateX: 0, ease: easeOutExpo, duration: 5.1, stagger: { each: 0.02, from: "start" }, delay: 0.5 });
}
function animateBlobs() {
  const blobs = document.querySelectorAll(".blob");
  blobs.forEach((blob, i) => {
    gsap.to(blob, { x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(-40, 40), scale: () => gsap.utils.random(0.9, 1.1), duration: () => gsap.utils.random(6, 10), ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.2 });
  });
}
function setupScrollReveals() {
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: easeOutExpo, duration: 0.9, scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });
  });
}
function setupCursor() {
  const cursor = document.getElementById("cursor");
  const label = document.getElementById("cursor-label");
  if (!cursor || !label) return;
  const state = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0, label: null };
  function move(e) {
    state.tx = e.clientX;
    state.ty = e.clientY;
  }
  function render() {
    state.x = lerp(state.x, state.tx, 0.18);
    state.y = lerp(state.y, state.ty, 0.18);
    cursor.style.transform = `translate(${state.x}px, ${state.y}px)`;
    state.raf = requestAnimationFrame(render);
  }
  state.raf = requestAnimationFrame(render);
  window.addEventListener("mousemove", move, { passive: true });
  const hoverables = document.querySelectorAll(".has-hover");
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
function setupMagnetic() {
  const magneticEls = document.querySelectorAll(".magnetic");
  const strength = 0.3;
  const maxTranslate = 12;
  magneticEls.forEach((el) => {
    function onMove(e) {
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
function setupPageTransitions() {
  const overlay = document.getElementById("transition-overlay");
  if (!overlay) return;
  function playIn(cb) {
    gsap.fromTo(overlay, { transformOrigin: "top", scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: easeInOut, onComplete: cb });
  }
  function playOut() {
    gsap.fromTo(overlay, { transformOrigin: "bottom", scaleY: 1 }, { scaleY: 0, duration: 0.6, ease: easeInOut, delay: 0.1 });
  }
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href") || "");
      if (!target) return;
      playIn(() => {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        setTimeout(playOut, 50);
      });
    });
  });
  playOut();
}
function setupProjectOverlay() {
  const overlay = document.getElementById("project-overlay");
  const closeBtn = overlay?.querySelector(".overlay-close");
  const title = overlay?.querySelector(".overlay-title");
  const desc = overlay?.querySelector(".overlay-desc");
  const tags = overlay?.querySelector(".overlay-tags");
  const media = overlay?.querySelector(".overlay-media .img");
  if (!overlay || !closeBtn || !title || !desc || !tags || !media) return;
  function openProject(el) {
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
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: easeInOut });
    gsap.fromTo(".project-overlay-inner", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: easeOutExpo });
  }
  function closeProject() {
    gsap.to(".project-overlay-inner", { y: 10, opacity: 0, duration: 0.3, ease: easeInOut });
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: easeInOut, delay: 0.15, onComplete: () => {
      overlay.classList.remove("active");
      overlay.style.opacity = "";
    } });
  }
  document.querySelectorAll(".project-link").forEach((card) => {
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
function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}
function init() {
  animateHero();
  animateBlobs();
  setupScrollReveals();
  setupCursor();
  setupMagnetic();
  setupPageTransitions();
  setupProjectOverlay();
  setYear();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


