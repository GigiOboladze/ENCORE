// Public site: home, products, about, contact / hand-in, order.
// Also a small JSON API so the static GitHub Pages copy of the site can submit its forms here.
const express = require("express");
const { db } = require("../db");
const { computeStats, SOURCES } = require("../cells");

const router = express.Router();

const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const products = () => db.prepare("SELECT * FROM products WHERE active = 1 ORDER BY sort_order, id").all()
  .map((p) => ({ ...p, photos: JSON.parse(p.photos || "[]") }));

// returns { ok, type, form }
function saveInquiry(body) {
  const type = body.type === "contact" ? "contact" : "handin";
  const form = {
    name: clean(body.name, 120), phone: clean(body.phone, 40), email: clean(body.email, 120),
    city: clean(body.city, 80), battery_source: SOURCES.includes(body.battery_source) ? body.battery_source : "",
    battery_qty: clean(body.battery_qty, 200), message: clean(body.message, 3000),
  };
  if (body.website) return { ok: true, type, form }; // honeypot: pretend success for bots
  const valid = form.name && (form.phone || form.email) && (type === "handin" || form.message);
  if (!valid) return { ok: false, type, form };
  db.prepare("INSERT INTO inquiries(type, name, phone, email, city, battery_source, battery_qty, message) VALUES(?,?,?,?,?,?,?,?)")
    .run(type, form.name, form.phone, form.email, form.city, form.battery_source, form.battery_qty, form.message);
  return { ok: true, type, form };
}

// returns { ok, product, form }; the product can be given by id or slug
function saveOrder(body) {
  const list = products();
  const product = list.find((p) => String(p.id) === String(body.product_id)) || list.find((p) => p.slug === body.product_slug);
  const form = {
    product_id: body.product_id, quantity: Math.min(Math.max(parseInt(body.quantity, 10) || 1, 1), 999),
    name: clean(body.name, 120), phone: clean(body.phone, 40), email: clean(body.email, 120),
    city: clean(body.city, 80), delivery: body.delivery === "delivery" ? "delivery" : "pickup", note: clean(body.note, 3000),
  };
  if (body.website) return { ok: true, product, form, list };
  if (!product || !form.name || !form.phone) return { ok: false, product, form, list };
  db.prepare("INSERT INTO orders(product_id, product_name, quantity, name, phone, email, city, delivery, note) VALUES(?,?,?,?,?,?,?,?,?)")
    .run(product.id, product.name_ka, form.quantity, form.name, form.phone, form.email, form.city, form.delivery, form.note);
  return { ok: true, product, form, list };
}

router.get("/", (req, res) => {
  res.render("home", { stats: computeStats(), products: products() });
});

router.get("/products", (req, res) => res.render("products", { products: products() }));

router.get("/products/:slug", (req, res, next) => {
  const p = products().find((x) => x.slug === req.params.slug);
  if (!p) return next();
  res.render("product", { p });
});

router.get("/about", (req, res) => res.render("about", { stats: computeStats() }));

router.get("/contact", (req, res) => {
  res.render("contact", { tab: req.query.tab === "contact" ? "contact" : "handin", sent: req.query.sent === "1", error: null, form: {}, sources: SOURCES });
});

router.post("/contact", (req, res) => {
  const r = saveInquiry(req.body);
  if (!r.ok) return res.status(400).render("contact", { tab: r.type, sent: false, error: res.locals.t("errors.form"), form: r.form, sources: SOURCES });
  res.redirect(`/contact?sent=1&tab=${r.type}`);
});

router.get("/order", (req, res) => {
  res.render("order", { products: products(), selected: clean(req.query.product, 80), sent: req.query.sent === "1", error: null, form: {} });
});

router.post("/order", (req, res) => {
  const r = saveOrder(req.body);
  if (!r.ok) return res.status(400).render("order", { products: r.list, selected: r.product?.slug || "", sent: false, error: res.locals.t("errors.form"), form: r.form });
  res.redirect("/order?sent=1");
});

// ---------- JSON API for the static (GitHub Pages) site ----------
router.post("/api/contact", (req, res) => {
  const r = saveInquiry(req.body);
  res.status(r.ok ? 200 : 400).json({ ok: r.ok });
});

router.post("/api/order", (req, res) => {
  const r = saveOrder(req.body);
  res.status(r.ok ? 200 : 400).json({ ok: r.ok });
});

module.exports = router;
