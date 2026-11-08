/* =========================================================
   Smart Land — ملف JavaScript الرئيسي
   تفاعلات بسيطة: القائمة، الحركات عند التمرير، العدادات، النموذج
   ========================================================= */

const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme, persist) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) localStorage.setItem("smartland-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن");
  }
}

themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next, true);
});
applyTheme(document.documentElement.getAttribute("data-theme") || "light", false);

const introAudioBtn = document.getElementById("introAudioBtn");
const introAudio = document.getElementById("introAudio");
if (introAudioBtn && introAudio) {
  const setPlaying = (playing) => {
    introAudioBtn.classList.toggle("is-playing", playing);
    introAudioBtn.setAttribute("aria-pressed", playing);
    introAudioBtn.setAttribute("aria-label", playing ? "إيقاف التسجيل التعريفي" : "تشغيل التسجيل التعريفي");
  };
  introAudioBtn.addEventListener("click", () => {
    if (introAudio.paused) introAudio.play();
    else introAudio.pause();
  });
  introAudio.addEventListener("play", () => setPlaying(true));
  introAudio.addEventListener("pause", () => setPlaying(false));
  introAudio.addEventListener("ended", () => setPlaying(false));
}

const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const toTop = document.getElementById("toTop");
const sections = document.querySelectorAll("section[id]");

/* ---------- 1. تغيير شكل شريط التنقل عند التمرير ---------- */
function onScroll() {
  const scrolled = window.scrollY > 60;
  navbar.classList.toggle("scrolled", scrolled || navLinks.classList.contains("open"));
  toTop.classList.toggle("show", window.scrollY > 600);
  highlightActiveLink();
}
window.addEventListener("scroll", onScroll);
onScroll();

/* ---------- 2. قائمة الموبايل ---------- */
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  onScroll();
});

// إغلاق القائمة عند الضغط على أي رابط
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", false);
  });
});

/* ---------- 3. تمييز رابط القسم الظاهر حالياً ---------- */
function highlightActiveLink() {
  let current = "";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}

/* ---------- 4. حركة الظهور عند التمرير (Fade In + Slide Up) ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- 5. العدادات المتحركة في قسم "من نحن" ---------- */
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
});
document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

/* ---------- 6. زر العودة للأعلى ---------- */
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- 7. التحقق من نموذج التواصل (بدون خادم) ---------- */
const form = document.getElementById("contactForm");
const success = document.getElementById("formSuccess");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

function setError(input, message) {
  const field = input.parentElement;
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".error").textContent = message;
  return !message;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  const ok = [
    setError(nameInput, name.length < 3 ? "الرجاء إدخال الاسم (3 أحرف على الأقل)" : ""),
    setError(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "الرجاء إدخال بريد إلكتروني صحيح"),
    setError(messageInput, message.length < 10 ? "الرسالة قصيرة جداً (10 أحرف على الأقل)" : ""),
  ].every(Boolean);

  if (ok) {
    success.hidden = false;
    form.reset();
    setTimeout(() => (success.hidden = true), 5000);
  }
});

/* ---------- 8. سنة حقوق النشر تلقائياً ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
