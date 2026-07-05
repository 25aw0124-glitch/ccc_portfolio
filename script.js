// ---------- フッターの年号 ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- スクロール時のナビ枠線 ----------
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
});

// ---------- モバイルメニューの開閉 ----------
const toggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

toggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// リンクをクリックしたらメニューを閉じる
navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ---------- スクロールに合わせて表示するアニメーション ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- 作品カード: 矢印ボタンで紹介文を開閉 ----------
// PC: 全カード連動 / モバイル(860px以下): カードごとに個別開閉
const featuredToggles = Array.from(document.querySelectorAll(".featured-toggle"));
const mobileQuery = window.matchMedia("(max-width: 860px)");
let featuredOpen = false;

function setToggleState(btn, open) {
  const desc = btn.nextElementSibling;
  const label = btn.querySelector(".featured-toggle-label");
  btn.classList.toggle("is-open", open);
  desc.classList.toggle("is-open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", open ? "詳細を閉じる" : "詳細を表示");
  if (label) label.textContent = open ? "閉じる" : "詳しく見る";
}

featuredToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (mobileQuery.matches) {
      setToggleState(btn, !btn.classList.contains("is-open"));
    } else {
      featuredOpen = !featuredOpen;
      featuredToggles.forEach((b) => setToggleState(b, featuredOpen));
    }
  });
});

// ---------- ヒーロー: ブロブの浮遊 + マウスで反発 ----------
(function initHeroBlobs() {
  const field = document.querySelector(".hero-blobs");
  const hero = document.getElementById("top");
  if (!field || !hero) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const blobs = Array.from(field.querySelectorAll(".blob")).map(() => ({
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speed: 0.7 + Math.random() * 0.5,
    floatRange: 14 + Math.random() * 10,
    baseX: 0,
    baseY: 0,
    offsetX: 0,
    offsetY: 0,
  }));
  const blobEls = Array.from(field.querySelectorAll(".blob"));

  // 各ブロブの本来の中心位置とサイズ（transform適用前）を測定
  function measureBases() {
    blobEls.forEach((el) => (el.style.transform = "none"));
    const fieldRect = field.getBoundingClientRect();
    blobEls.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      blobs[i].baseX = r.left + r.width / 2 - fieldRect.left;
      blobs[i].baseY = r.top + r.height / 2 - fieldRect.top;
      blobs[i].radius = r.width / 2;
    });
  }

  measureBases();
  window.addEventListener("resize", measureBases);

  let mouseX = null;
  let mouseY = null;

  hero.addEventListener("mousemove", (e) => {
    const rect = field.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  hero.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
  });

  const REPEL_MARGIN = 20; // 見た目の縁からどれくらい外側まで反応するか
  const REPEL_STRENGTH = 90;

  function loop(t) {
    blobs.forEach((b, i) => {
      let tx = 0;
      let ty = 0;

      if (!reduceMotion) {
        tx += Math.sin(t * 0.0006 * b.speed + b.phaseX) * b.floatRange;
        ty += Math.cos(t * 0.0005 * b.speed + b.phaseY) * b.floatRange;
      }

      if (mouseX !== null) {
        const cx = b.baseX + tx;
        const cy = b.baseY + ty;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.hypot(dx, dy);
        const edgeDist = dist - b.radius; // 0以下 = 見た目のブロブに乗っている
        if (edgeDist < REPEL_MARGIN && dist > 0.01) {
          const t2 = Math.min(Math.max(edgeDist / REPEL_MARGIN, 0), 1);
          const falloff = Math.pow(1 - t2, 2);
          const force = falloff * REPEL_STRENGTH;
          tx += (dx / dist) * force;
          ty += (dy / dist) * force;
        }
      }

      b.offsetX += (tx - b.offsetX) * 0.05;
      b.offsetY += (ty - b.offsetY) * 0.05;

      blobEls[i].style.transform = `translate(${b.offsetX.toFixed(1)}px, ${b.offsetY.toFixed(1)}px)`;
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
