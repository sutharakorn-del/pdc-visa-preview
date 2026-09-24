/* PDC VISA — progressive enhancement only. Every page works without this file. */
(() => {
  "use strict";
  const doc = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Header state ---------- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Services mega menu ---------- */
  const trigger = $("[data-mega-trigger]");
  const mega = $("#mega-services");
  if (trigger && mega) {
    const setOpen = (open) => {
      trigger.setAttribute("aria-expanded", String(open));
      mega.classList.toggle("is-open", open);
    };
    trigger.addEventListener("click", () => setOpen(trigger.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mega.classList.contains("is-open")) { setOpen(false); trigger.focus(); }
    });
    document.addEventListener("click", (e) => {
      if (!mega.contains(e.target) && !trigger.contains(e.target)) setOpen(false);
    });
    mega.addEventListener("focusout", (e) => {
      if (e.relatedTarget && !mega.contains(e.relatedTarget) && e.relatedTarget !== trigger) setOpen(false);
    });
  }

  /* ---------- Mobile navigation ---------- */
  const menuBtn = $("[data-menu-btn]");
  const mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const main = $("main");
    const footer = $(".site-footer");
    const positionNav = () => {
      mobileNav.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`;
    };
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector("[data-menu-label]").textContent = open ? menuBtn.dataset.close : menuBtn.dataset.open;
      mobileNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      [main, footer].forEach((el) => el && (open ? el.setAttribute("inert", "") : el.removeAttribute("inert")));
      if (open) { positionNav(); const first = mobileNav.querySelector("a"); first && first.focus({ preventScroll: true }); }
    };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) { setOpen(false); menuBtn.focus(); }
    });
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.addEventListener("resize", () => { if (mobileNav.classList.contains("is-open")) positionNav(); });
    window.matchMedia("(min-width: 1080px)").addEventListener("change", (m) => { if (m.matches) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$("[data-reveal]");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || reduce.matches) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Process route rail (scroll-linked) ---------- */
  const rail = $("[data-rail]");
  if (rail) {
    const list = rail;
    const steps = $$(".process__step", list);
    let ticking = false;
    const update = () => {
      ticking = false;
      if (reduce.matches) { list.style.setProperty("--p", "1"); steps.forEach((s) => s.classList.add("is-reached")); return; }
      const vh = window.innerHeight, r = list.getBoundingClientRect(), line = vh * 0.62;
      const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      list.style.setProperty("--p", p.toFixed(3));
      steps.forEach((s) => s.classList.toggle("is-reached", s.getBoundingClientRect().top + 12 < line));
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
  }


  /* ---------- Route indicator: which act of the homepage story you are in ---------- */
  const route = $(".route");
  const acts = $$("[data-act]");
  if (route && acts.length) {
    const num = $("[data-route-num]", route), label = $("[data-route-label]", route), fill = $("[data-route-fill]", route);
    const set = (el) => { num.textContent = el.dataset.act; label.textContent = el.dataset.actLabel || ""; route.classList.toggle("is-hidden", el.dataset.act === "01"); };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => en.forEach((e) => e.isIntersecting && set(e.target)), { rootMargin: "-50% 0px -50% 0px" });
      acts.forEach((a) => io.observe(a));
    }
    let t = false;
    const upd = () => { t = false; const max = document.documentElement.scrollHeight - innerHeight; fill.style.setProperty("--route", max > 0 ? (scrollY / max).toFixed(3) : "0"); };
    addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- Language menu: close on outside click / Escape ---------- */
  $$(".langsel").forEach((d) => {
    document.addEventListener("click", (e) => { if (d.open && !d.contains(e.target)) d.open = false; });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && d.open) { d.open = false; d.querySelector("summary").focus(); } });
  });

  /* ---------- Knowledge: filter by category ---------- */
  const kf = $("[data-k-filter]");
  if (kf) {
    kf.hidden = false;
    const chips = $$(".chip", kf), items = $$(".k-item");
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      items.forEach((it) => { it.hidden = !!c.dataset.cat && it.dataset.cat !== c.dataset.cat; });
    }));
  }

  /* ---------- Table of contents: active section ---------- */
  const tocLinks = $$(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove("is-active"));
          const a = map.get(en.target.id); a && a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); el && io.observe(el); });
  }

  /* ---------- Contact: tabs + validation ---------- */
  const tablist = $("[role=tablist]");
  if (tablist) {
    const tabs = $$("[role=tab]", tablist);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          select(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true);
        }
      });
    });
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    const wanted = tabs.find((t) => t.dataset.type === type);
    if (wanted) select(wanted);
    const svc = params.get("service");
    if (svc) $$("select[name=service]").forEach((s) => { if ([...s.options].some((o) => o.value === svc)) s.value = svc; });
  }

  $$("form[data-validate]").forEach((form) => {
    const status = $("[data-form-status]", form.parentElement);
    const fieldOf = (el) => el.closest(".field") || el.closest(".check");
    const check = (el) => {
      const f = fieldOf(el);
      const ok = el.checkValidity();
      if (f) f.classList.toggle("is-invalid", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      return ok;
    };
    $$("input, select, textarea", form).forEach((el) => {
      el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") check(el); });
      el.addEventListener("input", () => { if (fieldOf(el)?.classList.contains("is-invalid")) check(el); });
    });
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = $$("input, select, textarea", form).filter((el) => el.name);
      const bad = fields.filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const endpoint = form.dataset.endpoint;
      const btn = $("button[type=submit]", form);
      const show = (key) => {
        $$("[data-state]", status).forEach((el) => (el.hidden = el.dataset.state !== key));
        status.hidden = false;
        status.focus();
      };
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      try {
        const data = Object.fromEntries(new FormData(form));
        if (data._honey) { show("sent"); return; }  // spam trap filled: pretend success
        delete data._honey;
        const sel = form.querySelector("select[name=service]");
        if (sel) data.service = sel.options[sel.selectedIndex].text;
        data.page = location.href;
        if (!endpoint) throw new Error("no endpoint");
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const body = await res.json().catch(() => ({}));
        if (/activat/i.test(body.message || "")) { show("activate"); return; }
        if (!res.ok || String(body.success) === "false") throw new Error(body.message || `HTTP ${res.status}`);
        form.reset();
        show("sent");
      } catch (err) {
        const detail = $("[data-error-detail]", status);
        if (detail) detail.textContent = err && err.message ? String(err.message).slice(0, 200) : "";
        const a = $("[data-mailto-fallback]", status);
        if (a && form.dataset.mailto) {
          const d = Object.fromEntries(new FormData(form));
          const lines = Object.entries(d).filter(([k, v]) => !k.startsWith("_") && v).map(([k, v]) => `${k}: ${v}`);
          a.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(d._subject || "PDC VISA")}&body=${encodeURIComponent(lines.join("\n"))}`;
        }
        show("error");
      } finally {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      }
    });
  });
})();
