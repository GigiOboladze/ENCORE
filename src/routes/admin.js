// Admin panel: login, dashboard statistics, cell batches, products, orders, hand-in requests, admins, settings.
const express = require("express");
const multer = require("multer");
const { db, settings, saveSettings } = require("../db");
const auth = require("../auth");
const { upload, removeUpload } = require("../upload");
const C = require("../cells");

const router = express.Router();
const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const flash = (req, type, text) => { req.session.flash = { type, text }; };
const ip = (req) => req.ip || "unknown";

// ---------- auth ----------
router.get("/login", (req, res) => {
  if (req.session.adminId) return res.redirect("/admin");
  res.render("admin/login", { error: null, username: "" });
});

router.post("/login", (req, res) => {
  const username = clean(req.body.username, 60);
  if (auth.tooManyAttempts(ip(req))) {
    return res.status(429).render("admin/login", { error: res.locals.lang === "ka" ? "ძალიან ბევრი მცდელობა. სცადე 15 წუთში." : "Too many attempts. Try again in 15 minutes.", username });
  }
  const admin = auth.verify(username, req.body.password);
  if (!admin) {
    auth.recordFailure(ip(req));
    return res.status(401).render("admin/login", { error: res.locals.lang === "ka" ? "მომხმარებელი ან პაროლი არასწორია." : "Wrong username or password.", username });
  }
  auth.clearFailures(ip(req));
  req.session.adminId = admin.id;
  res.redirect("/admin");
});

router.post("/logout", (req, res) => { req.session = null; res.redirect("/admin/login"); });

router.use(auth.requireAdmin);
router.use((req, res, next) => {
  res.locals.counts = {
    orders: db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'new'").get().n,
    inquiries: db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").get().n,
  };
  res.locals.C = C;
  next();
});

// ---------- dashboard ----------
router.get("/", (req, res) => {
  const recent = db.prepare("SELECT * FROM cells ORDER BY id DESC LIMIT 6").all();
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 5").all();
  res.render("admin/dashboard", { stats: C.computeStats(), recent, orders });
});

// ---------- cells ----------
function readCell(body) {
  const chemistry = C.CHEMISTRIES.includes(body.chemistry) ? body.chemistry : "other";
  const form_factor = C.FORMS.includes(body.form_factor) ? body.form_factor : "other";
  const source = C.SOURCES.includes(body.source) ? body.source : "other";
  const soh = num(body.soh);
  const grade = C.GRADES.includes(body.grade) ? body.grade : (C.gradeFromSoh(soh) || "B");
  const quantity = Math.max(parseInt(body.quantity, 10) || 0, 0);
  return {
    chemistry, form_factor, form_other: form_factor === "other" ? clean(body.form_other, 60) : null,
    capacity_value: num(body.capacity_value), capacity_unit: C.UNITS.includes(body.capacity_unit) ? body.capacity_unit : "mAh",
    source, source_other: source === "other" ? clean(body.source_other, 60) : null,
    quantity, used_qty: Math.min(Math.max(parseInt(body.used_qty, 10) || 0, 0), quantity),
    unit_price: num(body.unit_price), soh: soh !== null ? Math.min(Math.max(soh, 0), 100) : null, grade,
    voltage: num(body.voltage), internal_resistance: num(body.internal_resistance), weight_g: num(body.weight_g),
    notes: clean(body.notes, 2000), received_at: /^\d{4}-\d{2}-\d{2}$/.test(body.received_at || "") ? body.received_at : new Date().toISOString().slice(0, 10),
  };
}
function cellErrors(c, lang) {
  const e = [];
  if (!(c.capacity_value > 0)) e.push(lang === "ka" ? "ტევადობა სავალდებულოა" : "Capacity is required");
  if (!(c.quantity > 0)) e.push(lang === "ka" ? "რაოდენობა უნდა იყოს 1 ან მეტი" : "Quantity must be 1 or more");
  if (c.form_factor === "other" && !c.form_other) e.push(lang === "ka" ? "მიუთითე ფორმა" : "Specify the form factor");
  if (c.source === "other" && !c.source_other) e.push(lang === "ka" ? "მიუთითე, რისი ელემენტი იყო" : "Specify where it came from");
  return e;
}

router.get("/cells", (req, res) => {
  const where = [];
  const args = [];
  const q = clean(req.query.q, 60);
  if (q) { where.push("(code LIKE ? OR notes LIKE ? OR source_other LIKE ? OR form_other LIKE ?)"); args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (C.GRADES.includes(req.query.grade)) { where.push("grade = ?"); args.push(req.query.grade); }
  if (C.SOURCES.includes(req.query.source)) { where.push("source = ?"); args.push(req.query.source); }
  if (C.CHEMISTRIES.includes(req.query.chemistry)) { where.push("chemistry = ?"); args.push(req.query.chemistry); }
  const cells = db.prepare(`SELECT * FROM cells ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC`).all(...args);
  const totals = cells.reduce((t, c) => ({ qty: t.qty + c.quantity, value: t.value + c.quantity * (c.unit_price || 0), wh: t.wh + c.quantity * C.unitWh(c) }), { qty: 0, value: 0, wh: 0 });
  res.render("admin/cells", { cells, totals, filters: { q, grade: req.query.grade || "", source: req.query.source || "", chemistry: req.query.chemistry || "" } });
});

router.get("/cells/new", (req, res) => {
  res.render("admin/cell_form", { cell: { quantity: 1, capacity_unit: "mAh", grade: "A", chemistry: "NMC", form_factor: "18650", source: "ev", received_at: new Date().toISOString().slice(0, 10), used_qty: 0 }, errors: [] });
});

router.post("/cells", upload.single("photo"), (req, res) => {
  const c = readCell(req.body);
  const errors = cellErrors(c, res.locals.lang);
  if (errors.length) { if (req.file) removeUpload(req.file.filename); return res.status(400).render("admin/cell_form", { cell: c, errors }); }
  const r = db.prepare(`INSERT INTO cells(chemistry, form_factor, form_other, capacity_value, capacity_unit, source, source_other, quantity, used_qty, unit_price, soh, grade, voltage, internal_resistance, weight_g, notes, photo, received_at, created_by)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    c.chemistry, c.form_factor, c.form_other, c.capacity_value, c.capacity_unit, c.source, c.source_other, c.quantity, c.used_qty,
    c.unit_price, c.soh, c.grade, c.voltage, c.internal_resistance, c.weight_g, c.notes, req.file?.filename || null, c.received_at, req.admin.id);
  const code = C.makeCode(r.lastInsertRowid, c.received_at);
  db.prepare("UPDATE cells SET code = ? WHERE id = ?").run(code, r.lastInsertRowid);
  flash(req, "ok", res.locals.lang === "ka" ? `პარტია ${code} დაემატა` : `Batch ${code} added`);
  res.redirect(`/admin/cells/${r.lastInsertRowid}`);
});

router.get("/cells/:id", (req, res, next) => {
  const cell = db.prepare("SELECT * FROM cells WHERE id = ?").get(req.params.id);
  if (!cell) return next();
  res.render("admin/cell_view", { cell });
});

router.get("/cells/:id/edit", (req, res, next) => {
  const cell = db.prepare("SELECT * FROM cells WHERE id = ?").get(req.params.id);
  if (!cell) return next();
  res.render("admin/cell_form", { cell, errors: [] });
});

router.post("/cells/:id", upload.single("photo"), (req, res, next) => {
  const old = db.prepare("SELECT * FROM cells WHERE id = ?").get(req.params.id);
  if (!old) return next();
  const c = readCell(req.body);
  const errors = cellErrors(c, res.locals.lang);
  if (errors.length) { if (req.file) removeUpload(req.file.filename); return res.status(400).render("admin/cell_form", { cell: { ...old, ...c }, errors }); }
  let photo = old.photo;
  if (req.file) { removeUpload(old.photo); photo = req.file.filename; } else if (req.body.remove_photo) { removeUpload(old.photo); photo = null; }
  db.prepare(`UPDATE cells SET chemistry=?, form_factor=?, form_other=?, capacity_value=?, capacity_unit=?, source=?, source_other=?, quantity=?, used_qty=?, unit_price=?, soh=?, grade=?, voltage=?, internal_resistance=?, weight_g=?, notes=?, photo=?, received_at=?, updated_at=datetime('now') WHERE id=?`).run(
    c.chemistry, c.form_factor, c.form_other, c.capacity_value, c.capacity_unit, c.source, c.source_other, c.quantity, c.used_qty,
    c.unit_price, c.soh, c.grade, c.voltage, c.internal_resistance, c.weight_g, c.notes, photo, c.received_at, old.id);
  flash(req, "ok", res.locals.lang === "ka" ? "ცვლილებები შენახულია" : "Changes saved");
  res.redirect(`/admin/cells/${old.id}`);
});

router.post("/cells/:id/delete", (req, res) => {
  const cell = db.prepare("SELECT * FROM cells WHERE id = ?").get(req.params.id);
  if (cell) { removeUpload(cell.photo); db.prepare("DELETE FROM cells WHERE id = ?").run(cell.id); }
  flash(req, "ok", res.locals.lang === "ka" ? "პარტია წაიშალა" : "Batch deleted");
  res.redirect("/admin/cells");
});

// ---------- products ----------
const allProducts = () => db.prepare("SELECT * FROM products ORDER BY sort_order, id").all().map((p) => ({ ...p, photos: JSON.parse(p.photos || "[]") }));
const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || `product-${Date.now()}`;

function readProduct(body) {
  return {
    name_ka: clean(body.name_ka, 160), name_en: clean(body.name_en, 160), short_ka: clean(body.short_ka, 400), short_en: clean(body.short_en, 400),
    desc_ka: clean(body.desc_ka, 5000), desc_en: clean(body.desc_en, 5000), specs_ka: clean(body.specs_ka, 3000), specs_en: clean(body.specs_en, 3000),
    price_from: num(body.price_from), cells_needed: parseInt(body.cells_needed, 10) || null, sort_order: parseInt(body.sort_order, 10) || 0,
    active: body.active ? 1 : 0, slug: clean(body.slug, 60),
  };
}

router.get("/products", (req, res) => res.render("admin/products", { products: allProducts() }));
router.get("/products/new", (req, res) => res.render("admin/product_form", { p: { photos: [], active: 1, sort_order: 0 }, errors: [] }));

router.post("/products", upload.array("photos", 3), (req, res) => {
  const p = readProduct(req.body);
  const files = (req.files || []).map((f) => f.filename);
  if (!p.name_ka || !p.name_en) {
    files.forEach(removeUpload);
    return res.status(400).render("admin/product_form", { p: { ...p, photos: [] }, errors: [res.locals.lang === "ka" ? "სახელი ორივე ენაზე სავალდებულოა" : "Name is required in both languages"] });
  }
  let slug = p.slug ? slugify(p.slug) : slugify(p.name_en);
  if (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) slug = `${slug}-${Date.now().toString(36)}`;
  db.prepare(`INSERT INTO products(slug, name_ka, name_en, short_ka, short_en, desc_ka, desc_en, specs_ka, specs_en, price_from, cells_needed, photos, sort_order, active)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(slug, p.name_ka, p.name_en, p.short_ka, p.short_en, p.desc_ka, p.desc_en, p.specs_ka, p.specs_en,
    p.price_from, p.cells_needed, JSON.stringify(files.slice(0, 3)), p.sort_order, p.active);
  flash(req, "ok", res.locals.lang === "ka" ? "პროდუქტი დაემატა" : "Product added");
  res.redirect("/admin/products");
});

router.get("/products/:id/edit", (req, res, next) => {
  const p = allProducts().find((x) => String(x.id) === req.params.id);
  if (!p) return next();
  res.render("admin/product_form", { p, errors: [] });
});

router.post("/products/:id", upload.array("photos", 3), (req, res, next) => {
  const old = allProducts().find((x) => String(x.id) === req.params.id);
  if (!old) return next();
  const p = readProduct(req.body);
  const files = (req.files || []).map((f) => f.filename);
  if (!p.name_ka || !p.name_en) {
    files.forEach(removeUpload);
    return res.status(400).render("admin/product_form", { p: { ...old, ...p, photos: old.photos }, errors: [res.locals.lang === "ka" ? "სახელი ორივე ენაზე სავალდებულოა" : "Name is required in both languages"] });
  }
  const remove = [].concat(req.body.remove_photos || []);
  let photos = old.photos.filter((f) => !remove.includes(f));
  remove.filter((f) => old.photos.includes(f)).forEach(removeUpload);
  const room = 3 - photos.length;
  files.slice(room).forEach(removeUpload);
  photos = photos.concat(files.slice(0, Math.max(room, 0)));
  let slug = p.slug ? slugify(p.slug) : old.slug;
  if (slug !== old.slug && db.prepare("SELECT 1 FROM products WHERE slug = ? AND id <> ?").get(slug, old.id)) slug = `${slug}-${Date.now().toString(36)}`;
  db.prepare(`UPDATE products SET slug=?, name_ka=?, name_en=?, short_ka=?, short_en=?, desc_ka=?, desc_en=?, specs_ka=?, specs_en=?, price_from=?, cells_needed=?, photos=?, sort_order=?, active=? WHERE id=?`)
    .run(slug, p.name_ka, p.name_en, p.short_ka, p.short_en, p.desc_ka, p.desc_en, p.specs_ka, p.specs_en, p.price_from, p.cells_needed, JSON.stringify(photos), p.sort_order, p.active, old.id);
  flash(req, "ok", res.locals.lang === "ka" ? "პროდუქტი განახლდა" : "Product updated");
  res.redirect("/admin/products");
});

router.post("/products/:id/delete", (req, res) => {
  const p = allProducts().find((x) => String(x.id) === req.params.id);
  if (p) { p.photos.forEach(removeUpload); db.prepare("DELETE FROM products WHERE id = ?").run(p.id); }
  flash(req, "ok", res.locals.lang === "ka" ? "პროდუქტი წაიშალა" : "Product deleted");
  res.redirect("/admin/products");
});

// ---------- orders & inquiries ----------
const ORDER_STATUSES = ["new", "in_progress", "ready", "done", "cancelled"];
const INQ_STATUSES = ["new", "contacted", "done"];

router.get("/orders", (req, res) => {
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : "";
  const orders = db.prepare(`SELECT * FROM orders ${status ? "WHERE status = ?" : ""} ORDER BY id DESC`).all(...(status ? [status] : []));
  res.render("admin/orders", { orders, status, statuses: ORDER_STATUSES });
});
router.post("/orders/:id/status", (req, res) => {
  if (ORDER_STATUSES.includes(req.body.status)) db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
  res.redirect(req.get("referer")?.includes("/admin/orders") ? req.get("referer") : "/admin/orders");
});
router.post("/orders/:id/delete", (req, res) => { db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id); res.redirect("/admin/orders"); });

router.get("/inquiries", (req, res) => {
  const type = ["contact", "handin"].includes(req.query.type) ? req.query.type : "";
  const items = db.prepare(`SELECT * FROM inquiries ${type ? "WHERE type = ?" : ""} ORDER BY id DESC`).all(...(type ? [type] : []));
  res.render("admin/inquiries", { items, type, statuses: INQ_STATUSES });
});
router.post("/inquiries/:id/status", (req, res) => {
  if (INQ_STATUSES.includes(req.body.status)) db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
  res.redirect(req.get("referer")?.includes("/admin/inquiries") ? req.get("referer") : "/admin/inquiries");
});
router.post("/inquiries/:id/delete", (req, res) => { db.prepare("DELETE FROM inquiries WHERE id = ?").run(req.params.id); res.redirect("/admin/inquiries"); });

// ---------- admins ----------
router.get("/admins", auth.requireSuper, (req, res) => {
  const admins = db.prepare("SELECT id, username, role, created_at FROM admins ORDER BY id").all();
  res.render("admin/admins", { admins, max: auth.MAX_ADMINS, error: null });
});
router.post("/admins", auth.requireSuper, (req, res) => {
  const username = clean(req.body.username, 40);
  const password = String(req.body.password || "");
  const admins = db.prepare("SELECT id, username, role, created_at FROM admins ORDER BY id").all();
  const ka = res.locals.lang === "ka";
  let error = null;
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) error = ka ? "მომხმარებლის სახელი: 3–40 ლათინური ასო, ციფრი ან . _ -" : "Username: 3–40 latin letters, digits or . _ -";
  else if (password.length < 8) error = ka ? "პაროლი მინიმუმ 8 სიმბოლო" : "Password must be at least 8 characters";
  else if (admins.length >= auth.MAX_ADMINS) error = ka ? `მაქსიმუმ ${auth.MAX_ADMINS} ადმინი` : `Maximum ${auth.MAX_ADMINS} admins`;
  else if (admins.some((a) => a.username.toLowerCase() === username.toLowerCase())) error = ka ? "ასეთი მომხმარებელი უკვე არსებობს" : "This username already exists";
  if (error) return res.status(400).render("admin/admins", { admins, max: auth.MAX_ADMINS, error });
  auth.createAdmin(username, password, req.body.role);
  flash(req, "ok", ka ? `ადმინი ${username} შეიქმნა` : `Admin ${username} created`);
  res.redirect("/admin/admins");
});
router.post("/admins/:id/password", auth.requireSuper, (req, res) => {
  const password = String(req.body.password || "");
  if (password.length >= 8) { auth.setPassword(req.params.id, password); flash(req, "ok", res.locals.lang === "ka" ? "პაროლი შეიცვალა" : "Password changed"); }
  else flash(req, "err", res.locals.lang === "ka" ? "პაროლი მინიმუმ 8 სიმბოლო" : "Password must be at least 8 characters");
  res.redirect("/admin/admins");
});
router.post("/admins/:id/delete", auth.requireSuper, (req, res) => {
  const target = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.params.id);
  const supers = db.prepare("SELECT COUNT(*) AS n FROM admins WHERE role = 'super'").get().n;
  if (target && target.id !== req.admin.id && !(target.role === "super" && supers <= 1)) {
    db.prepare("DELETE FROM admins WHERE id = ?").run(target.id);
    flash(req, "ok", res.locals.lang === "ka" ? "ადმინი წაიშალა" : "Admin deleted");
  } else flash(req, "err", res.locals.lang === "ka" ? "ამ ადმინის წაშლა შეუძლებელია" : "This admin cannot be deleted");
  res.redirect("/admin/admins");
});

// ---------- own account ----------
router.get("/account", (req, res) => res.render("admin/account", { error: null }));
router.post("/account", (req, res) => {
  const ka = res.locals.lang === "ka";
  const me = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.admin.id);
  if (!auth.verify(me.username, req.body.current)) return res.status(400).render("admin/account", { error: ka ? "მიმდინარე პაროლი არასწორია" : "Current password is wrong" });
  if (String(req.body.password || "").length < 8) return res.status(400).render("admin/account", { error: ka ? "ახალი პაროლი მინიმუმ 8 სიმბოლო" : "New password must be at least 8 characters" });
  if (req.body.password !== req.body.confirm) return res.status(400).render("admin/account", { error: ka ? "პაროლები არ ემთხვევა" : "Passwords do not match" });
  auth.setPassword(me.id, req.body.password);
  flash(req, "ok", ka ? "პაროლი შეიცვალა" : "Password changed");
  res.redirect("/admin/account");
});

// ---------- settings ----------
router.get("/settings", (req, res) => res.render("admin/settings", { s: settings() }));
router.post("/settings", (req, res) => {
  saveSettings(req.body);
  flash(req, "ok", res.locals.lang === "ka" ? "პარამეტრები შენახულია" : "Settings saved");
  res.redirect("/admin/settings");
});

// upload problems (file too large, more than 3 photos) → friendly message instead of an error page
router.use((err, req, res, next) => {
  if (!(err instanceof multer.MulterError)) return next(err);
  const ka = res.locals.lang === "ka";
  const text = err.code === "LIMIT_FILE_SIZE"
    ? (ka ? "ფაილი ძალიან დიდია (მაქს. 6MB)" : "File is too large (max 6MB)")
    : (ka ? "მაქსიმუმ 3 ფოტოს ატვირთვაა შესაძლებელი" : "You can upload at most 3 photos");
  flash(req, "err", text);
  const back = req.get("referer");
  res.redirect(back && back.includes("/admin") ? back : "/admin");
});

module.exports = router;
