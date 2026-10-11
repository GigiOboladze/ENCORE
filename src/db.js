// SQLite storage (built into Node >= 22.13, no native dependencies).
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "encore.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',          -- 'super' | 'admin'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  chemistry TEXT NOT NULL,                     -- LFP, NMC, NCA, LMO, LCO, LiPo, LTO, other
  form_factor TEXT NOT NULL,                   -- 18650, 21700, pouch, prismatic, module, other
  form_other TEXT,
  capacity_value REAL NOT NULL,
  capacity_unit TEXT NOT NULL DEFAULT 'mAh',   -- mAh | Ah | Wh
  source TEXT NOT NULL,                        -- ev, scooter, ebike, laptop, tool, vape, phone, other
  source_other TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  used_qty INTEGER NOT NULL DEFAULT 0,
  unit_price REAL,
  soh REAL,
  grade TEXT NOT NULL DEFAULT 'B',             -- A | B | C | D
  voltage REAL,
  internal_resistance REAL,
  weight_g REAL,
  notes TEXT,
  photo TEXT,
  received_at TEXT NOT NULL DEFAULT (date('now')),
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_ka TEXT NOT NULL,
  name_en TEXT NOT NULL,
  short_ka TEXT, short_en TEXT,
  desc_ka TEXT, desc_en TEXT,
  specs_ka TEXT, specs_en TEXT,                -- one spec per line: "Label: value"
  price_from REAL,
  cells_needed INTEGER,
  photos TEXT NOT NULL DEFAULT '[]',           -- JSON array of file names (max 3)
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  delivery TEXT,                               -- pickup | delivery
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new',          -- new | in_progress | ready | done | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,                          -- contact | handin
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT,
  battery_source TEXT,
  battery_qty TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',          -- new | contacted | done
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

const SETTING_DEFAULTS = {
  phone: "+995 5XX XX XX XX",
  email: "hello@encore.ge",
  address_ka: "სენაკის ტექნოპარკი, სენაკი, საქართველო",
  address_en: "Senaki Technopark, Senaki, Georgia",
  hours_ka: "ორშ–პარ, 10:00–19:00",
  hours_en: "Mon–Fri, 10:00–19:00",
  facebook: "",
  instagram: "",
  linkedin: "",
  hero_title_ka: "ბატარეის მეორე სიცოცხლე — სუფთა ხვალინდელი დღისთვის",
  hero_title_en: "A second life for batteries — for a cleaner tomorrow",
  hero_sub_ka: "ვაგროვებთ ნახმარ ლითიუმის ბატარეებს, AI-ით ვამოწმებთ და ვაქცევთ მზის ენერგიის სადგურებად, პორტატულ სადგურებად და ხელსაწყოების ბატარეებად.",
  hero_sub_en: "We collect used lithium batteries, test them with AI and rebuild them into solar storage stations, portable power stations and power tool batteries.",
};

// Contact details for the site can be edited in site.config.json (used by the GitHub Pages build too).
try {
  const fileConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "site.config.json"), "utf8"));
  for (const [k, v] of Object.entries(fileConfig)) if (k in SETTING_DEFAULTS) SETTING_DEFAULTS[k] = String(v ?? "");
} catch {}

const getSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
const putSetting = db.prepare("INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");

function settings() {
  const out = { ...SETTING_DEFAULTS };
  for (const row of db.prepare("SELECT key, value FROM settings").all()) out[row.key] = row.value;
  return out;
}
function saveSettings(obj) {
  for (const key of Object.keys(SETTING_DEFAULTS)) {
    if (key in obj) putSetting.run(key, String(obj[key] ?? "").trim());
  }
}

function tx(fn) {
  db.exec("BEGIN");
  try { const r = fn(); db.exec("COMMIT"); return r; } catch (e) { db.exec("ROLLBACK"); throw e; }
}

module.exports = { db, DATA_DIR, UPLOAD_DIR, settings, saveSettings, getSetting, tx };
