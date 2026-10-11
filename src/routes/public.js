// Public site: home, products, about, contact / hand-in, order.
const express = require("express");
const { db } = require("../db");
const { computeStats, SOURCES } = require("../cells");

const router = express.Router();

const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const products = () => db.prepare("SELECT * FROM products WHERE active = 1 ORDER BY sort_order, id").all()
  .map((p) => ({ ...p, photos: JSON.parse(p.photos || "[]") }));

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
  const type = req.body.type === "contact" ? "contact" : "handin";
  const form = {
    name: clean(req.body.name, 120), phone: clean(req.body.phone, 40), email: clean(req.body.email, 120),
    city: clean(req.body.city, 80), battery_source: clean(req.body.battery_source, 40), battery_qty: clean(req.body.battery_qty, 200),
    message: clean(req.body.message, 3000),
  };
  if (req.body.website) return res.redirect(`/contact?sent=1&tab=${type}`); // honeypot
  const valid = form.name && (form.phone || form.email) && (type === "handin" || form.message);
  if (!valid) return res.status(400).render("contact", { tab: type, sent: false, error: res.locals.t("errors.form"), form, sources: SOURCES });
  db.prepare("INSERT INTO inquiries(type, name, phone, email, city, battery_source, battery_qty, message) VALUES(?,?,?,?,?,?,?,?)")
    .run(type, form.name, form.phone, form.email, form.city, form.battery_source, form.battery_qty, form.message);
  res.redirect(`/contact?sent=1&tab=${type}`);
});

router.get("/order", (req, res) => {
  res.render("order", { products: products(), selected: clean(req.query.product, 80), sent: req.query.sent === "1", error: null, form: {} });
});

router.post("/order", (req, res) => {
  const list = products();
  const product = list.find((p) => String(p.id) === String(req.body.product_id));
  const form = {
    product_id: req.body.product_id, quantity: Math.min(Math.max(parseInt(req.body.quantity, 10) || 1, 1), 999),
    name: clean(req.body.name, 120), phone: clean(req.body.phone, 40), email: clean(req.body.email, 120),
    city: clean(req.body.city, 80), delivery: req.body.delivery === "delivery" ? "delivery" : "pickup", note: clean(req.body.note, 3000),
  };
  if (req.body.website) return res.redirect("/order?sent=1");
  if (!product || !form.name || !form.phone) {
    return res.status(400).render("order", { products: list, selected: product?.slug || "", sent: false, error: res.locals.t("errors.form"), form });
  }
  db.prepare("INSERT INTO orders(product_id, product_name, quantity, name, phone, email, city, delivery, note) VALUES(?,?,?,?,?,?,?,?,?)")
    .run(product.id, product.name_ka, form.quantity, form.name, form.phone, form.email, form.city, form.delivery, form.note);
  res.redirect("/order?sent=1");
});


module.exports = router;
