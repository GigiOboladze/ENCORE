// ENCORE website — Express + EJS + SQLite.
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieSession = require("cookie-session");

const { UPLOAD_DIR, settings } = require("./src/db");
const { translator, LANGS } = require("./src/i18n");
const { ensureSuperAdmin } = require("./src/auth");
const { seed } = require("./src/seed");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  next();
});

app.use("/static", express.static(path.join(__dirname, "public"), { maxAge: "7d" }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const secret = process.env.SESSION_SECRET || crypto.createHash("sha256").update(UPLOAD_DIR + "encore").digest("hex");
if (!process.env.SESSION_SECRET) console.warn("SESSION_SECRET is not set — using a derived fallback. Set it in production.");
app.use(cookieSession({
  name: "encore_sess",
  keys: [secret],
  maxAge: 12 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
}));

// Reject cross-site form posts (CSRF): the browser's Origin must match our host.
app.use((req, res, next) => {
  if (req.method !== "POST") return next();
  const origin = req.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.get("host")) return res.status(403).send("Forbidden");
    } catch { return res.status(403).send("Forbidden"); }
  }
  next();
});

// language, theme and shared view helpers
app.use((req, res, next) => {
  const cookieLang = (req.headers.cookie || "").match(/(?:^|;\s*)lang=(ka|en)/)?.[1];
  req.lang = (LANGS.includes(req.query.lang) && req.query.lang) || cookieLang || "ka";
  res.locals.lang = req.lang;
  res.locals.t = translator(req.lang);
  res.locals.L = (obj, field) => (obj ? obj[`${field}_${req.lang}`] || obj[`${field}_ka`] || "" : "");
  res.locals.theme = (req.headers.cookie || "").match(/(?:^|;\s*)theme=(dark|light)/)?.[1] || "";
  res.locals.path = req.path;
  res.locals.site = settings();
  const fmt = (n, digits = 0) => {
    const out = Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    return req.lang === "ka" ? out.replace(/,/g, " ").replace(".", ",") : out;
  };
  res.locals.fmt = fmt;
  res.locals.money = (n) => `${fmt(n, 2)} ₾`;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get("/lang/:code", (req, res) => {
  const code = LANGS.includes(req.params.code) ? req.params.code : "ka";
  res.cookie("lang", code, { maxAge: 365 * 24 * 3600 * 1000, sameSite: "lax" });
  const back = req.get("referer");
  let target = "/";
  try { if (back && new URL(back).host === req.get("host")) target = new URL(back).pathname + new URL(back).search.replace(/([?&])lang=\w+&?/, "$1"); } catch {}
  res.redirect(target);
});

app.use("/", require("./src/routes/public"));
app.use("/admin", require("./src/routes/admin"));

app.use((req, res) => res.status(404).render("error", { title: res.locals.t("errors.notFound"), message: res.locals.t("errors.notFoundText") }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { title: res.locals.t ? res.locals.t("errors.generic") : "Error", message: "" });
});

ensureSuperAdmin();
seed();
app.listen(PORT, () => console.log(`ENCORE running on http://localhost:${PORT}`));
