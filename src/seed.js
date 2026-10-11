// First-run demo content: the four products (with the team's photos) and sample cell batches.
const fs = require("fs");
const path = require("path");
const { db, UPLOAD_DIR } = require("./db");
const { makeCode } = require("./cells");

const SEED_IMG = path.join(__dirname, "..", "public", "img", "products");

function copySeedImage(name) {
  const src = path.join(SEED_IMG, name);
  if (!fs.existsSync(src)) return null;
  const dest = `seed-${name}`;
  const target = path.join(UPLOAD_DIR, dest);
  if (!fs.existsSync(target)) fs.copyFileSync(src, target);
  return dest;
}

const PRODUCTS = [
  {
    slug: "encore-home", img: "home-storage.jpeg", price: 3500, cells: 462, order: 1,
    name_ka: "ENCORE Home — მზის ენერგიის სადგური", name_en: "ENCORE Home — Solar Energy Storage",
    short_ka: "5 kWh-დან. ინახავს მზის პანელების ენერგიას და გათიშვისას სახლს დენით ამარაგებს.",
    short_en: "From 5 kWh. Stores your solar energy and keeps the house powered during outages.",
    desc_ka: "კედელზე დასამონტაჟებელი ენერგიის შესანახი სადგური, აწყობილი A/B კლასის შემოწმებული, დაჯგუფებული ელემენტებისგან. დღისით ინახავს მზის პანელების ზედმეტ ენერგიას, საღამოს და დენის გათიშვისას კი სახლს ამარაგებს. მოდულური დიზაინი — ტევადობა მოგვიანებით შეგიძლიათ გაზარდოთ.",
    desc_en: "A wall-mounted energy storage station built from tested, matched grade A/B cells. It stores surplus solar energy during the day and powers your home in the evening and during outages. Modular — capacity can be expanded later.",
    specs_ka: "ტევადობა: 5 kWh (მოდულური, 10 kWh-მდე)\nსისტემის ძაბვა: 48V\nელემენტები: ~462 ცალი, A/B კლასი\nდაცვა: BMS, დამცველები, ტემპერატურის სენსორები\nმონიტორინგი: ეკრანი + მობილური აპლიკაცია",
    specs_en: "Capacity: 5 kWh (modular, up to 10 kWh)\nSystem voltage: 48V\nCells: ~462, grade A/B\nProtection: BMS, fuses, temperature sensors\nMonitoring: display + mobile app",
  },
  {
    slug: "portable-station", img: "portable-station.jpeg", price: 1700, cells: 91, order: 2,
    name_ka: "პორტატული ენერგოსადგური", name_en: "Portable Power Station",
    short_ka: "1–2 kWh კემპინგისთვის, ღონისძიებებისთვის და სამუშაო ობიექტებისთვის. ჩუმი, უსუნო.",
    short_en: "1–2 kWh for camping, events and work sites. Silent and fume-free.",
    desc_ka: "მობილური ენერგიის წყარო იქ, სადაც ქსელი არ არის: კემპინგი, ფესტივალები, გადაღებები, სამშენებლო ბრიგადები. ბენზინის გენერატორისგან განსხვავებით — ჩუმი, უსუნო და გამონაბოლქვის გარეშე. ორი ევროპული როზეტი, USB-C, USB-A და მანქანის 12V სოკეტი.",
    desc_en: "Mobile power wherever there is no grid: camping, festivals, film sets, work crews. Unlike a petrol generator it is silent, odourless and emission-free. Two Schuko outlets, USB-C, USB-A and a 12V car socket.",
    specs_ka: "ტევადობა: 1 kWh (1 700 ₾-დან) / 2 kWh (2 900 ₾-დან)\nგამოსასვლელები: 2× 220V, 2× USB-C, 2× USB-A, 12V\nდამუხტვა: ქსელი, მანქანა, მზის პანელი\nელემენტები: ~91 ცალი (1 kWh)",
    specs_en: "Capacity: 1 kWh (from 1,700 ₾) / 2 kWh (from 2,900 ₾)\nOutputs: 2× 220V, 2× USB-C, 2× USB-A, 12V\nCharging: grid, car, solar panel\nCells: ~91 (1 kWh)",
  },
  {
    slug: "tool-battery", img: "tool-battery.jpeg", price: 130, cells: 10, order: 3,
    name_ka: "ხელსაწყოს ბატარეა 18V", name_en: "Power Tool Battery 18V",
    short_ka: "~6Ah ბატარეა დრელისა და უსადენო ხელსაწყოებისთვის — ორიგინალზე ბევრად იაფი.",
    short_en: "~6Ah battery for drills and cordless tools — far cheaper than the original.",
    desc_ka: "18V ბატარეა დრელისთვის, ხრახნსაჭერისთვის და სხვა უსადენო ხელსაწყოებისთვის. აწყობილია A კლასის შემოწმებული ელემენტებისგან, რომლებიც ძლიერ დენს უძლებს. ხელმისაწვდომია 40V (~6Ah) ვერსიაც — 300 ₾-დან.",
    desc_en: "An 18V battery for drills, drivers and other cordless tools, built from tested grade A cells that handle high current. A 40V (~6Ah) version is also available from 300 ₾.",
    specs_ka: "ძაბვა: 18V (40V ვერსია — 300 ₾-დან)\nტევადობა: ~6Ah\nელემენტები: 10 ცალი, A კლასი\nინდიკატორი: 4 LED",
    specs_en: "Voltage: 18V (40V version from 300 ₾)\nCapacity: ~6Ah\nCells: 10, grade A\nIndicator: 4 LEDs",
  },
  {
    slug: "powerbank", img: "powerbank.jpeg", price: null, cells: 5, order: 4,
    name_ka: "ENCORE Powerbank", name_en: "ENCORE Powerbank",
    short_ka: "პორტატული დამტენი, აწყობილი გადარჩენილი ელემენტებისგან.",
    short_en: "A portable charger built from rescued cells.",
    desc_ka: "კომპაქტური powerbank სწრაფი დამუხტვით — აწყობილია ლეპტოპებიდან და სხვა მოწყობილობებიდან გადარჩენილი, შემოწმებული ელემენტებისგან.",
    desc_en: "A compact fast-charging power bank built from tested cells rescued from laptops and other devices.",
    specs_ka: "პორტები: USB-C PD, USB-A QC\nელემენტები: 4–5 ცალი 18650\nინდიკატორი: 4 LED",
    specs_en: "Ports: USB-C PD, USB-A QC\nCells: 4–5 × 18650\nIndicator: 4 LEDs",
  },
];

// Sample batches so the statistics are not empty on first launch. Tesla 18650 price per the team's price sheet: 1.92 ₾.
const CELLS = [
  { chemistry: "NCA", form_factor: "18650", capacity_value: 3400, capacity_unit: "mAh", source: "ev", quantity: 1200, used_qty: 462, unit_price: 1.92, soh: 86, grade: "A", voltage: 3.6, internal_resistance: 38, received_at: "-5", notes: "Tesla Model S მოდულიდან" },
  { chemistry: "NMC", form_factor: "18650", capacity_value: 2600, capacity_unit: "mAh", source: "scooter", quantity: 240, used_qty: 60, unit_price: 1.6, soh: 82, grade: "A", voltage: 3.6, internal_resistance: 45, received_at: "-4" },
  { chemistry: "NMC", form_factor: "module", capacity_value: 500, capacity_unit: "Wh", source: "ev", quantity: 24, used_qty: 0, unit_price: 70, soh: 76, grade: "B", voltage: 7.6, internal_resistance: null, weight_g: 3800, received_at: "-3", notes: "Nissan Leaf 24 kWh მოდულები" },
  { chemistry: "LCO", form_factor: "18650", capacity_value: 2200, capacity_unit: "mAh", source: "laptop", quantity: 180, used_qty: 40, unit_price: 1.2, soh: 68, grade: "C", voltage: 3.7, internal_resistance: 70, received_at: "-2" },
  { chemistry: "NMC", form_factor: "21700", capacity_value: 4000, capacity_unit: "mAh", source: "tool", quantity: 60, used_qty: 20, unit_price: 2.1, soh: 84, grade: "A", voltage: 3.6, internal_resistance: 22, received_at: "-1" },
  { chemistry: "LiPo", form_factor: "pouch", capacity_value: 550, capacity_unit: "mAh", source: "vape", quantity: 320, used_qty: 0, unit_price: 0.3, soh: 64, grade: "C", voltage: 3.7, internal_resistance: null, weight_g: 12, received_at: "-1" },
  { chemistry: "NMC", form_factor: "18650", capacity_value: 2500, capacity_unit: "mAh", source: "ebike", quantity: 90, used_qty: 0, unit_price: 0, soh: 48, grade: "D", voltage: 3.6, internal_resistance: 140, received_at: "0", notes: "გაბერილი / მაღალი თვითგანმუხტვა — მგვ ჯაჭვში" },
];

function monthOffset(offset) {
  const d = new Date();
  d.setDate(10);
  d.setMonth(d.getMonth() + Number(offset));
  return d.toISOString().slice(0, 10);
}

function seed() {
  const hasProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get().n > 0;
  if (!hasProducts) {
    const ins = db.prepare(`INSERT INTO products(slug, name_ka, name_en, short_ka, short_en, desc_ka, desc_en, specs_ka, specs_en, price_from, cells_needed, photos, sort_order)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const p of PRODUCTS) {
      const photo = copySeedImage(p.img);
      ins.run(p.slug, p.name_ka, p.name_en, p.short_ka, p.short_en, p.desc_ka, p.desc_en, p.specs_ka, p.specs_en,
        p.price, p.cells, JSON.stringify(photo ? [photo] : []), p.order);
    }
  }
  const hasCells = db.prepare("SELECT COUNT(*) AS n FROM cells").get().n > 0;
  if (!hasCells && process.env.SEED_DEMO_CELLS !== "false") {
    const ins = db.prepare(`INSERT INTO cells(chemistry, form_factor, capacity_value, capacity_unit, source, quantity, used_qty, unit_price, soh, grade, voltage, internal_resistance, weight_g, notes, received_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const setCode = db.prepare("UPDATE cells SET code = ? WHERE id = ?");
    for (const c of CELLS) {
      const at = monthOffset(c.received_at);
      const r = ins.run(c.chemistry, c.form_factor, c.capacity_value, c.capacity_unit, c.source, c.quantity, c.used_qty,
        c.unit_price, c.soh, c.grade, c.voltage, c.internal_resistance ?? null, c.weight_g ?? null, c.notes ?? null, at);
      setCode.run(makeCode(r.lastInsertRowid, at), r.lastInsertRowid);
    }
  }
}

module.exports = { seed };
