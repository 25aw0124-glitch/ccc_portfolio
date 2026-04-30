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

// ---------- ヒーロー: 壁で反射する線アニメーション ----------
(function initHeroBounce() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;

  // 線オブジェクト
  class BounceLine {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.8 + Math.random() * 0.8;
      this.length = 120 + Math.random() * 160;
      this.opacity = 0.55 + Math.random() * 0.25;
      this.thickness = Math.random() < 0.5 ? 1.4 : 2;
      this.hue = Math.random() * 360;
      this.saturation = 70 + Math.random() * 20;
      this.lightness = 50 + Math.random() * 10;
    }
    update(w, h) {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      // 左右の壁で反射
      if (this.x < 0 || this.x > w) {
        this.angle = Math.PI - this.angle;
        this.x = Math.max(0, Math.min(w, this.x));
      }
      // 上下の壁で反射
      if (this.y < 0 || this.y > h) {
        this.angle = -this.angle;
        this.y = Math.max(0, Math.min(h, this.y));
      }
    }
    draw(ctx) {
      const half = this.length / 2;
      const cosA = Math.cos(this.angle);
      const sinA = Math.sin(this.angle);
      ctx.beginPath();
      ctx.moveTo(this.x - cosA * half, this.y - sinA * half);
      ctx.lineTo(this.x + cosA * half, this.y + sinA * half);
      ctx.strokeStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  let lines = [];
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    // 線を画面サイズに合わせて再生成
    const count = w < 700 ? 4 : 7;
    lines = Array.from({ length: count }, () => new BounceLine(w, h));
  }

  function loop() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    lines.forEach((line) => {
      line.update(w, h);
      line.draw(ctx);
    });
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);
  loop();
})();
