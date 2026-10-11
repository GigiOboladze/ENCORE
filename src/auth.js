// Admin accounts: password hashing, super-admin bootstrap, login guards.
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { db } = require("./db");

const MAX_ADMINS = 5;

function ensureSuperAdmin() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (count > 0) return;
  const username = process.env.ADMIN_USERNAME || "superadmin";
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = crypto.randomBytes(9).toString("base64url");
    console.log("──────────────────────────────────────────────");
    console.log(` Super admin created: ${username}`);
    console.log(` Temporary password:  ${password}`);
    console.log(" Set ADMIN_PASSWORD to choose your own, and change it after first login.");
    console.log("──────────────────────────────────────────────");
  }
  db.prepare("INSERT INTO admins(username, password_hash, role) VALUES(?, ?, 'super')")
    .run(username, bcrypt.hashSync(password, 10));
}

function verify(username, password) {
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(String(username || "").trim());
  if (!admin) return null;
  return bcrypt.compareSync(String(password || ""), admin.password_hash) ? admin : null;
}

function createAdmin(username, password, role = "admin") {
  const count = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (count >= MAX_ADMINS) throw new Error("limit");
  return db.prepare("INSERT INTO admins(username, password_hash, role) VALUES(?, ?, ?)")
    .run(String(username).trim(), bcrypt.hashSync(password, 10), role === "super" ? "super" : "admin");
}

function setPassword(id, password) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(password, 10), id);
}

// simple in-memory brute-force guard for the login form
const attempts = new Map();
function tooManyAttempts(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > 15 * 60 * 1000) { attempts.delete(ip); return false; }
  return a.count >= 10;
}
function recordFailure(ip) {
  const a = attempts.get(ip) || { count: 0, first: Date.now() };
  a.count += 1;
  attempts.set(ip, a);
}
function clearFailures(ip) { attempts.delete(ip); }

function requireAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect("/admin/login");
  const admin = db.prepare("SELECT id, username, role FROM admins WHERE id = ?").get(req.session.adminId);
  if (!admin) { req.session = null; return res.redirect("/admin/login"); }
  req.admin = admin;
  res.locals.admin = admin;
  next();
}

function requireSuper(req, res, next) {
  if (req.admin?.role !== "super") return res.status(403).render("admin/forbidden");
  next();
}

module.exports = {
  MAX_ADMINS, ensureSuperAdmin, verify, createAdmin, setPassword,
  tooManyAttempts, recordFailure, clearFailures, requireAdmin, requireSuper,
};
