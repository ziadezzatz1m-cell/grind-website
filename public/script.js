// ---------- Analytics ----------
// Paste the IDs here to switch tracking on. Leave empty to keep it off.
const ANALYTICS = {
  googleAnalyticsId: "", // e.g. "G-XXXXXXXXXX"
  clarityProjectId: "", // e.g. "abcd1234ef"
};

if (ANALYTICS.googleAnalyticsId) {
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.googleAnalyticsId}`;
  document.head.append(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ANALYTICS.googleAnalyticsId);
}

if (ANALYTICS.clarityProjectId) {
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", ANALYTICS.clarityProjectId);
}

const track = (name, params = {}) => {
  if (window.gtag) gtag("event", name, params);
  if (window.clarity) clarity("event", name);
};

// Which "Book a call" button was clicked: navbar, hero, system, contact or floating
document.querySelectorAll('a[href*="calendly.com"]').forEach((link) => {
  link.addEventListener("click", () => {
    const placement = link.closest("header")
      ? "navbar"
      : link.id === "floatCta"
        ? "floating"
        : link.closest("section")?.id || "hero";
    track("book_call_click", { placement });
  });
});

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

// Brands strip: duplicate logos so the loop is seamless
const brandsTrack = document.getElementById("brandsTrack");
[...brandsTrack.children].forEach((img) => {
  const copy = img.cloneNode();
  copy.alt = "";
  copy.setAttribute("aria-hidden", "true");
  brandsTrack.append(copy);
});

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

// Instagram embeds: load the embed script only when the first one is near
const igObserver = new IntersectionObserver(
  (entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    igObserver.disconnect();
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    document.body.append(s);
  },
  { rootMargin: "800px 0px" }
);
document.querySelectorAll(".instagram-media").forEach((el) => igObserver.observe(el));

// Video testimonials: custom play button
document.querySelectorAll(".video-item").forEach((item) => {
  const video = item.querySelector("video");
  item.querySelector(".play-btn").addEventListener("click", () => video.play());
  video.addEventListener("play", () => item.classList.add("playing"));
  video.addEventListener("play", () => track("testimonial_video_play"), { once: true });
});

// Reviews carousel: slides on its own, pauses while someone is interacting
const reviews = document.getElementById("reviews");
const reviewItems = [...reviews.children];
const dots = document.getElementById("reviewsDots");
reviewItems.forEach(() => dots.append(document.createElement("i")));

const reviewPos = (item) => item.offsetLeft - reviews.offsetLeft - parseFloat(getComputedStyle(reviews).paddingLeft);
const reviewsAtEnd = () => reviews.scrollLeft + reviews.clientWidth >= reviews.scrollWidth - 4;
const currentReview = () => {
  if (reviews.scrollLeft > 4 && reviewsAtEnd()) return reviewItems.length - 1;
  const left = reviews.scrollLeft;
  let best = 0;
  reviewItems.forEach((item, i) => {
    if (Math.abs(reviewPos(item) - left) < Math.abs(reviewPos(reviewItems[best]) - left)) best = i;
  });
  return best;
};
const goToReview = (i) => {
  const index = i >= reviewItems.length || (i > currentReview() && reviewsAtEnd()) ? 0 : (i + reviewItems.length) % reviewItems.length;
  reviews.scrollTo({ left: reviewPos(reviewItems[index]) });
};
const updateDots = () => {
  const i = currentReview();
  [...dots.children].forEach((d, j) => d.classList.toggle("active", i === j));
};
reviews.addEventListener("scroll", () => requestAnimationFrame(updateDots), { passive: true });
updateDots();

let reviewsPausedUntil = 0;
let reviewsInView = false;
const pauseReviews = (ms = 8000) => (reviewsPausedUntil = Date.now() + ms);
["pointerdown", "touchstart", "wheel", "mouseenter"].forEach((ev) =>
  reviews.addEventListener(ev, () => pauseReviews(), { passive: true })
);
reviews.addEventListener("mousemove", () => pauseReviews(), { passive: true });
document.getElementById("reviewsPrev").addEventListener("click", () => { pauseReviews(); goToReview(currentReview() - 1); });
document.getElementById("reviewsNext").addEventListener("click", () => { pauseReviews(); goToReview(currentReview() + 1); });
new IntersectionObserver((e) => (reviewsInView = e[0].isIntersecting), { threshold: 0.3 }).observe(reviews);

setInterval(() => {
  const watching =
    document.activeElement?.tagName === "IFRAME" || // tapped into an Instagram reel
    reviewItems.some((item) => { const v = item.querySelector("video"); return v && !v.paused; });
  if (!reviewsInView || document.hidden || watching || Date.now() < reviewsPausedUntil) return;
  goToReview(currentReview() + 1);
}, 3500);

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
