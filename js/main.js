/* ============================================================
   BAJE AUTO SERVICES — interactions (shared across all pages)
   Feature-detected, so this file runs safely on every page.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Business config — EDIT THESE --------------------------------- */
  const CONFIG = {
    email: "info@pretsellsauto.ca",
    phone: "9056371122",
    instagram: "https://www.facebook.com/PretsellsAutoService/",
    endpoint: ""
  };
  window.BAJE = CONFIG;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);

  /* ---- HEADER ---- */
  const header = $("#header");
  if (header) {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 24);
      if (y > 320 && y > last) header.classList.add("hidden"); else header.classList.remove("hidden");
      last = y;
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE DRAWER ---- */
  const drawer = $("#drawer"), scrim = $("#scrim");
  const openD = () => { drawer && drawer.classList.add("open"); scrim && scrim.classList.add("show"); document.body.style.overflow = "hidden"; };
  const closeD = () => { drawer && drawer.classList.remove("open"); scrim && scrim.classList.remove("show"); document.body.style.overflow = ""; };
  on($("#menuToggle"), "click", openD);
  on($("#drawerClose"), "click", closeD);
  on(scrim, "click", closeD);
  $$("#drawer a").forEach(a => on(a, "click", closeD));
  on(document, "keydown", e => { if (e.key === "Escape") closeD(); });

  /* ---- SCROLL REVEAL (with failsafe) ---- */
  const revealEls = $$(".reveal, .reveal-scale");
  const revealAll = () => revealEls.forEach(el => el.classList.add("in"));
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
    setTimeout(() => { if (!document.querySelector(".reveal.in, .reveal-scale.in")) revealAll(); }, 1500);
  } else { revealAll(); }

  /* ---- COUNTERS ---- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split(".")[1] || "").length;
        const dur = 1600, t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(dec);
        };
        requestAnimationFrame(tick); cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---- TESTIMONIAL CAROUSEL ---- */
  const track = $("#tstTrack");
  if (track) {
    const slides = $$(".tst-slide", track), dotsWrap = $("#tstDots");
    let idx = 0, timer;
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "tst-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", "Go to review " + (i + 1));
      on(d, "click", () => go(i)); dotsWrap && dotsWrap.appendChild(d);
    });
    const dots = dotsWrap ? $$(".tst-dot", dotsWrap) : [];
    const go = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("active", k === idx));
      restart();
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 6000); };
    on($("#tstNext"), "click", () => go(idx + 1));
    on($("#tstPrev"), "click", () => go(idx - 1));
    restart();
  }

  /* ---- GALLERY LIGHTBOX ---- */
  const lb = $("#lightbox");
  if (lb) {
    const items = $$(".gal-item"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
    let ci = 0;
    const build = items.map(it => ({ src: $("img", it).getAttribute("src"), cap: it.dataset.cap || "" }));
    const show = (i) => { ci = (i + build.length) % build.length; lbImg.setAttribute("src", build[ci].src); lbCap.textContent = build[ci].cap; lb.classList.add("show"); document.body.style.overflow = "hidden"; };
    const hide = () => { lb.classList.remove("show"); document.body.style.overflow = ""; };
    items.forEach((it, i) => on(it, "click", () => show(i)));
    on($("#lbClose"), "click", hide);
    on($("#lbPrev"), "click", () => show(ci - 1));
    on($("#lbNext"), "click", () => show(ci + 1));
    on(lb, "click", e => { if (e.target === lb) hide(); });
    on(document, "keydown", e => { if (!lb.classList.contains("show")) return; if (e.key === "Escape") hide(); if (e.key === "ArrowRight") show(ci + 1); if (e.key === "ArrowLeft") show(ci - 1); });
  }

  /* ---- FAQ ACCORDION ---- */
  $$(".faq-item").forEach(item => {
    const q = $(".faq-q", item), a = $(".faq-a", item);
    on(q, "click", () => {
      const isOpen = item.classList.contains("open");
      $$(".faq-item").forEach(o => { o.classList.remove("open"); const oa = $(".faq-a", o); if (oa) oa.style.maxHeight = null; });
      if (!isOpen) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---- BACK TO TOP ---- */
  const toTop = $("#toTop");
  if (toTop) {
    on(window, "scroll", () => toTop.classList.toggle("show", window.scrollY > 600), { passive: true });
    on(toTop, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---- TOAST ---- */
  function toast(msg) {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${msg}</span>`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 4200);
  }
  window.bajeToast = toast;

  /* ---- BOOKING FORM ---- */
  const form = $("#quoteForm");
  if (form) {
    const steps = $$(".fstep", form), stepPips = $$(".stepper .st");
    let cur = 0;
    // [price, minutes]
    // [starting price, approx minutes] — estimates only
    const SERVICE = {
      "Oil Change": [50, 45], "Brakes (per axle)": [180, 90], "Tire Rotation": [40, 30],
      "Wheel Alignment": [110, 60], "Diagnostics": [110, 60], "Battery Service": [180, 45],
      "A/C Service": [140, 60], "Safety Inspection": [90, 60], "Suspension Repair": [250, 120],
      "Tune-Up": [160, 90]
    };

    const showStep = (n) => {
      cur = Math.max(0, Math.min(n, steps.length - 1));
      steps.forEach((s, i) => s.classList.toggle("active", i === cur));
      stepPips.forEach((p, i) => { p.classList.toggle("active", i === cur); p.classList.toggle("done", i < cur); });
      const back = $("#fBack"), next = $("#fNext"), submit = $("#fSubmit");
      if (back) back.classList.toggle("hidden", cur === 0);
      if (next) next.style.display = cur === steps.length - 1 ? "none" : "inline-flex";
      if (submit) submit.style.display = cur === steps.length - 1 ? "inline-flex" : "none";
    };
    const validateStep = () => {
      const active = steps[cur];
      for (const f of $$("[required]", active)) {
        if (!f.value.trim()) { f.focus(); f.style.borderColor = "var(--navy-bright)"; toast("Please fill in the highlighted field."); return false; }
        f.style.borderColor = "";
      }
      if (cur === 0 && $$("input[name=services]:checked", form).length === 0) { toast("Pick at least one service."); return false; }
      return true;
    };
    on($("#fNext"), "click", () => { if (validateStep()) showStep(cur + 1); });
    on($("#fBack"), "click", () => showStep(cur - 1));

    /* live total */
    const estOut = $("#estAmount"), estMeta = $("#estMeta");
    const updateEstimate = () => {
      const chosen = $$("input[name=services]:checked", form).map(c => c.value);
      let total = 0, mins = 0;
      chosen.forEach(v => { const s = SERVICE[v]; if (s) { total += s[0]; mins += s[1]; } });
      if (estOut) estOut.textContent = total ? `$${total}` : "$0";
      if (estMeta) estMeta.textContent = chosen.length ? `${chosen.length} service${chosen.length > 1 ? "s" : ""} · ~${mins} min · from pricing` : "Select your services";
    };
    $$("input[name=services]", form).forEach(c => on(c, "change", updateEstimate));
    updateEstimate();

    /* submit -> email handoff */
    on(form, "submit", async (e) => {
      e.preventDefault();
      if (!validateStep()) return;
      if (form.companyWebsite && form.companyWebsite.value) return; // honeypot
      const data = Object.fromEntries(new FormData(form).entries());
      const services = $$("input[name=services]:checked", form).map(c => c.value).join(", ");
      const lead = {
        source: "baje-website", name: data.name, phone: data.phone, email: data.email || "",
        services, date: data.eventDate || "flexible", time: data.time || "any time",
        message: data.message || "", submittedAt: new Date().toISOString()
      };
      const btn = $("#fSubmit"), orig = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';

      if (CONFIG.endpoint) {
        try { await fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }); } catch (_) {}
      }

      const subject = encodeURIComponent(`Appointment request — ${services}`);
      const bodyLines = [
        "Hi Pretsell's Auto, I'd like to book a service.", "",
        `Service(s): ${services}`, `Preferred date: ${lead.date}`, `Preferred time: ${lead.time}`, "",
        `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email || "—"}`, "",
        `Notes: ${lead.message || "—"}`
      ];
      const mailto = `mailto:${CONFIG.email}?subject=${subject}&body=${encodeURIComponent(bodyLines.join("\r\n"))}`;

      setTimeout(() => {
        btn.disabled = false; btn.innerHTML = orig;
        const body = form.querySelector(".form-body"); if (body) body.style.display = "none";
        const success = $("#formSuccess"), emailBtn = $("#successEmail");
        if (emailBtn) emailBtn.setAttribute("href", mailto);
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
        toast("Request ready — send it, or call us to confirm your slot.");
      }, 700);
    });

    showStep(0);
  }

  /* ---- FOOTER YEAR ---- */
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();
