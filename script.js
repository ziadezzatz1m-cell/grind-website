const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Headline: split into words for the rise animation
const headline = document.getElementById("headline");
let wordIndex = 0;
const splitWords = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(" ");
        const outer = document.createElement("span");
        outer.className = "word";
        const inner = document.createElement("span");
        inner.style.setProperty("--i", wordIndex++);
        inner.textContent = part;
        outer.append(inner);
        frag.append(outer);
      });
      child.replaceWith(frag);
    } else {
      splitWords(child);
    }
  });
};
splitWords(headline);

// Navbar + floating CTA on scroll
const navWrap = document.querySelector(".nav-wrap");
const floatCta = document.getElementById("floatCta");
const hero = document.querySelector(".hero");
const onScroll = () => {
  navWrap.classList.toggle("scrolled", window.scrollY > 20);
  floatCta.classList.toggle("show", window.scrollY > hero.offsetHeight * 0.8);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const navLinks = document.getElementById("navLinks");
document.getElementById("menuToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  // Stagger siblings in grids
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  if (siblings.length > 2) el.style.transitionDelay = `${siblings.indexOf(el) * 0.06}s`;
  revealObserver.observe(el);
});

// Hero grid: random glowing cells
const gridBg = document.getElementById("gridBg");
if (!reduceMotion) {
  const flashCell = () => {
    const cols = Math.floor(gridBg.clientWidth / 64);
    const rows = Math.floor(gridBg.clientHeight / 64);
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.style.gridColumn = 1 + Math.floor(Math.random() * cols);
    cell.style.gridRow = 1 + Math.floor(Math.random() * rows);
    gridBg.append(cell);
    setTimeout(() => cell.remove(), 3300);
  };
  setInterval(flashCell, 280);
}

// About statement: words light up as you scroll
const statement = document.getElementById("statement");
const highlight = ["sustainable", "growth", "net", "profit.", "consistently"];
statement.innerHTML = statement.textContent
  .trim()
  .split(/\s+/)
  .map((w) => `<span class="w${highlight.includes(w.toLowerCase()) ? " hl" : ""}">${w}</span>`)
  .join(" ");
const statementWords = [...statement.querySelectorAll(".w")];
const lightStatement = () => {
  const rect = statement.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35)));
  const count = Math.round(progress * statementWords.length);
  statementWords.forEach((w, i) => w.classList.toggle("lit", i < count));
};
if (reduceMotion) statementWords.forEach((w) => w.classList.add("lit"));
else {
  window.addEventListener("scroll", lightStatement, { passive: true });
  lightStatement();
}

// Card spotlight follows the cursor
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// Magnetic buttons
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}
