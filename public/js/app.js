// ENCORE front-end helpers: theme toggle, mobile menu, counters, confirm dialog, cell-form live summary.
(function () {
  const root = document.documentElement;
  const format = (n, d = 0) => {
    const s = Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
    return root.lang === "ka" ? s.replace(/,/g, " ").replace(".", ",") : s;
  };

  // theme
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dark = !root.classList.contains("dark");
      root.classList.toggle("dark", dark);
      try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
      document.cookie = `theme=${dark ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
    });
  });

  // mobile menu
  document.querySelectorAll("[data-menu-toggle]").forEach((btn) => {
    const menu = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("hidden") === false;
      if (menu.dataset.display) menu.classList.toggle(menu.dataset.display, open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // animated counters
  const counters = document.querySelectorAll("[data-count]");
  const animate = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const digits = parseInt(el.dataset.digits || "0", 10);
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased, digits);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  }

  // bars grow in
  document.querySelectorAll("[data-bar]").forEach((bar) => {
    const prop = bar.dataset.bar === "v" ? "height" : "width";
    const val = bar.style[prop];
    bar.style[prop] = "0%";
    requestAnimationFrame(() => setTimeout(() => { bar.style[prop] = val; }, 60));
  });

  // confirm dialog for destructive forms (no native confirm())
  const dialog = document.getElementById("confirm-dialog");
  let pending = null;
  document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (form.dataset.confirmed) return;
      e.preventDefault();
      pending = form;
      dialog.querySelector("[data-confirm-text]").textContent = form.dataset.confirm;
      dialog.classList.remove("hidden");
      dialog.classList.add("flex");
      dialog.querySelector("[data-confirm-cancel]").focus();
    });
  });
  if (dialog) {
    const close = () => { dialog.classList.add("hidden"); dialog.classList.remove("flex"); pending = null; };
    dialog.querySelector("[data-confirm-cancel]").addEventListener("click", close);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !dialog.classList.contains("hidden")) close(); });
    dialog.querySelector("[data-confirm-ok]").addEventListener("click", () => {
      if (!pending) return;
      pending.dataset.confirmed = "1";
      pending.submit();
    });
  }

  // tabs (contact page)
  document.querySelectorAll("[data-tabs]").forEach((wrap) => {
    const buttons = wrap.querySelectorAll("[data-tab]");
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((x) => { const on = x === b; x.setAttribute("aria-selected", String(on)); x.classList.toggle("active", on); });
      wrap.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== b.dataset.tab));
    }));
  });

  // "other" select → reveal free-text input
  document.querySelectorAll("select[data-other]").forEach((sel) => {
    const target = document.getElementById(sel.dataset.other);
    const sync = () => { const on = sel.value === "other"; target.classList.toggle("hidden", !on); target.querySelector("input").required = on; };
    sel.addEventListener("change", sync);
    sync();
  });

  // image file inputs → preview
  document.querySelectorAll("input[type=file][data-preview]").forEach((input) => {
    const box = document.getElementById(input.dataset.preview);
    input.addEventListener("change", () => {
      box.innerHTML = "";
      [...input.files].slice(0, Number(input.dataset.max || 3)).forEach((f) => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(f);
        img.className = "h-20 w-20 rounded-xl object-cover ring-1 ring-forest-100";
        box.appendChild(img);
      });
    });
  });

  // admin cell form: suggested grade + live summary
  const form = document.querySelector("[data-cell-form]");
  if (form) {
    const V = { LFP: 3.2, NMC: 3.6, NCA: 3.6, LMO: 3.7, LCO: 3.7, LiPo: 3.7, LTO: 2.4, other: 3.6 };
    const W = { "18650": 46, "21700": 68, "26650": 90 };
    const f = (n) => form.elements[n];
    const num = (n) => parseFloat(String(f(n)?.value || "").replace(",", ".")) || 0;
    const out = (k, v, d = 0) => { const el = form.querySelector(`[data-sum=${k}]`); if (el) el.textContent = format(v, d); };
    let gradeTouched = form.dataset.editing === "1";
    form.querySelectorAll("input[name=grade]").forEach((r) => r.addEventListener("change", () => { gradeTouched = true; update(); }));
    function update() {
      const chem = f("chemistry").value, form_ = f("form_factor").value, unit = f("capacity_unit").value;
      const cap = num("capacity_value"), qty = num("quantity"), price = num("unit_price"), soh = num("soh");
      const volts = form_ === "module" && num("voltage") > 0 ? num("voltage") : V[chem] || 3.6;
      const wh = unit === "Wh" ? cap : (unit === "Ah" ? cap : cap / 1000) * volts;
      const weight = num("weight_g") > 0 ? num("weight_g") : W[form_] || (wh / (form_ === "module" ? 0.12 : 0.15));
      if (soh > 0 && !gradeTouched) {
        const g = soh > 80 ? "A" : soh >= 70 ? "B" : soh >= 60 ? "C" : "D";
        const r = form.querySelector(`input[name=grade][value=${g}]`);
        if (r) r.checked = true;
      }
      const grade = form.querySelector("input[name=grade]:checked")?.value || "B";
      const eff = soh > 0 ? soh : ({ A: 85, B: 75, C: 65, D: 45 })[grade];
      out("wh", wh, 1);
      out("totalKwh", (wh * qty) / 1000, 2);
      out("liveKwh", grade === "D" ? 0 : (wh * qty * eff) / 100 / 1000, 2);
      out("kg", (weight * qty) / 1000, 1);
      out("value", price * qty, 2);
      const gEl = form.querySelector("[data-sum=grade]");
      if (gEl) { gEl.textContent = grade; gEl.className = `grade-${grade}`; }
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
  }
})();
