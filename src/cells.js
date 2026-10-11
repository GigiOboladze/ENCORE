// Battery-cell domain logic: option lists, energy / weight estimates, grading and statistics.
const { db } = require("./db");

const CHEMISTRIES = ["LFP", "NMC", "NCA", "LMO", "LCO", "LiPo", "LTO", "other"];
const FORMS = ["18650", "21700", "26650", "pouch", "prismatic", "module", "other"];
const SOURCES = ["ev", "hybrid", "scooter", "ebike", "laptop", "tool", "vape", "phone", "other"];
const UNITS = ["mAh", "Ah", "Wh"];
const GRADES = ["A", "B", "C", "D"];

// nominal cell voltage per chemistry, used to convert mAh/Ah to Wh
const NOMINAL_V = { LFP: 3.2, NMC: 3.6, NCA: 3.6, LMO: 3.7, LCO: 3.7, LiPo: 3.7, LTO: 2.4, other: 3.6 };
// typical mass of one cylindrical cell, grams
const FORM_WEIGHT_G = { "18650": 46, "21700": 68, "26650": 90 };
// SoH assumed for a grade when none was measured
const GRADE_SOH = { A: 85, B: 75, C: 65, D: 45 };
// kg CO2e emitted to manufacture 1 kWh of new battery (midpoint of the 60–150 range in the business plan)
const CO2_KG_PER_KWH = 100;

// Wh of one unit when new (nameplate)
function unitWh(c) {
  const v = Number(c.capacity_value) || 0;
  if (c.capacity_unit === "Wh") return v;
  const ah = c.capacity_unit === "Ah" ? v : v / 1000;
  const volts = Number(c.voltage) > 0 && c.form_factor === "module" ? Number(c.voltage) : (NOMINAL_V[c.chemistry] || 3.6);
  return ah * volts;
}

// grams of one unit: entered weight, typical cylindrical weight, or estimated from energy
function unitWeight(c) {
  if (Number(c.weight_g) > 0) return Number(c.weight_g);
  if (FORM_WEIGHT_G[c.form_factor]) return FORM_WEIGHT_G[c.form_factor];
  const density = c.form_factor === "module" ? 0.12 : 0.15; // Wh per gram
  return unitWh(c) / density;
}

function effectiveSoh(c) {
  return Number(c.soh) > 0 ? Number(c.soh) : GRADE_SOH[c.grade] || 70;
}

function gradeFromSoh(soh) {
  const s = Number(soh);
  if (!(s > 0)) return null;
  if (s > 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  return "D";
}

function makeCode(id, receivedAt) {
  const year = String(receivedAt || new Date().toISOString()).slice(0, 4);
  return `ENC-${year}-${String(id).padStart(5, "0")}`;
}

function computeStats() {
  const cells = db.prepare("SELECT * FROM cells").all();
  const s = {
    batches: cells.length, received: 0, revived: 0, recycled: 0, used: 0,
    revivedKwh: 0, kgSaved: 0, co2Tonnes: 0, inventoryValue: 0,
    byGrade: Object.fromEntries(GRADES.map((g) => [g, 0])),
    bySource: {}, byChemistry: {}, byForm: {}, byMonth: {},
  };
  for (const c of cells) {
    const q = Number(c.quantity) || 0;
    s.received += q;
    s.used += Math.min(Number(c.used_qty) || 0, q);
    s.kgSaved += (q * unitWeight(c)) / 1000;
    s.byGrade[c.grade] = (s.byGrade[c.grade] || 0) + q;
    s.bySource[c.source] = (s.bySource[c.source] || 0) + q;
    s.byChemistry[c.chemistry] = (s.byChemistry[c.chemistry] || 0) + q;
    s.byForm[c.form_factor] = (s.byForm[c.form_factor] || 0) + q;
    const month = String(c.received_at).slice(0, 7);
    s.byMonth[month] = (s.byMonth[month] || 0) + q;
    if (c.grade === "D") {
      s.recycled += q;
    } else {
      s.revived += q;
      s.revivedKwh += (q * unitWh(c) * effectiveSoh(c)) / 100 / 1000;
      s.inventoryValue += Math.max(q - (Number(c.used_qty) || 0), 0) * (Number(c.unit_price) || 0);
    }
  }
  s.co2Tonnes = (s.revivedKwh * CO2_KG_PER_KWH) / 1000;
  // last 6 months, oldest first
  const months = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, value: s.byMonth[key] || 0 });
  }
  s.months = months;
  s.orders = db.prepare("SELECT COUNT(*) AS n FROM orders").get().n;
  s.openOrders = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status IN ('new','in_progress')").get().n;
  s.newInquiries = db.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").get().n;
  return s;
}

module.exports = {
  CHEMISTRIES, FORMS, SOURCES, UNITS, GRADES, NOMINAL_V,
  unitWh, unitWeight, effectiveSoh, gradeFromSoh, makeCode, computeStats,
};
