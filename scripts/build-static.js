// Builds a static copy of the customer website (no admin panel) for GitHub Pages.
//
//   BASE_PATH       URL prefix the site is served under, e.g. "/ENCORE/" (default "/")
//   OUT_DIR         output folder (default "dist")
//   STATIC_API_URL  optional backend (e.g. the Railway app) that receives the contact/order forms;
//                   without it the forms open a pre-filled e-mail instead
//
// Usage: node scripts/build-static.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT = path.resolve(ROOT, process.env.OUT_DIR || "dist");
let BASE = process.env.BASE_PATH || "/";
if (!BASE.startsWith("/")) BASE = "/" + BASE;
if (!BASE.endsWith("/")) BASE += "/";
const PORT = Number(process.env.STATIC_PORT || 4599);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const LANGS = ["ka", "en"];

const routeDir = (route) => (route === "/" ? "" : route.replace(/^\/|\/$/g, "") + "/");

// Turn root-relative links of the server version into links that work under BASE on GitHub Pages.
function rewrite(html, lang, route) {
  const langPrefix = lang === "en" ? "en/" : "";
  return html.replace(/\b(href|src|action)="(\/[^"]*)"/g, (m, attr, url) => {
    if (url.startsWith("//")) return m;
    if (url.startsWith("/static/") || url.startsWith("/uploads/")) return `${attr}="${BASE}${url.slice(1)}"`;
    if (url === "/lang/en") return `${attr}="${BASE}en/${routeDir(route)}"`;
    if (url === "/lang/ka") return `${attr}="${BASE}${routeDir(route)}"`;
    if (url.startsWith("/admin")) return m;
    const cut = url.search(/[?#]/);
    const pathname = cut === -1 ? url : url.slice(0, cut);
    const rest = cut === -1 ? "" : url.slice(cut);
    return `${attr}="${BASE}${langPrefix}${routeDir(pathname)}${rest}"`;
  });
}

function copyDir(src, dest, skip = () => false) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (skip(s)) continue;
    if (entry.isDirectory()) copyDir(s, d, skip);
    else fs.copyFileSync(s, d);
  }
}

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(ORIGIN + "/")).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("server did not start");
}

async function render(route, lang) {
  const res = await fetch(ORIGIN + route, { headers: { cookie: `lang=${lang}`, "x-static-export": "1" } });
  return { status: res.status, html: await res.text() };
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

(async () => {
  // a fresh, seeded database so the build only ever contains the public demo content
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "encore-static-"));
  const server = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir, SESSION_SECRET: "static-build", ADMIN_PASSWORD: crypto.randomBytes(12).toString("hex"), NODE_ENV: "development" },
  });
  try {
    await waitForServer();
    fs.rmSync(OUT, { recursive: true, force: true });

    const productsHtml = (await render("/products", "ka")).html;
    const slugs = [...new Set([...productsHtml.matchAll(/href="\/products\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
    const routes = ["/", "/products", ...slugs.map((s) => `/products/${s}`), "/about", "/contact", "/order"];

    let pages = 0;
    for (const lang of LANGS) {
      for (const route of routes) {
        const { status, html } = await render(route, lang);
        if (status !== 200) throw new Error(`${route} (${lang}) returned ${status}`);
        write(`${lang === "en" ? "en/" : ""}${routeDir(route)}index.html`, rewrite(html, lang, route));
        pages++;
      }
    }
    const notFound = await render("/__missing__", "ka");
    write("404.html", rewrite(notFound.html, "ka", "/"));

    copyDir(path.join(ROOT, "public"), path.join(OUT, "static"), (p) => p.endsWith("input.css"));
    copyDir(path.join(dataDir, "uploads"), path.join(OUT, "uploads"));
    write(".nojekyll", "");
    console.log(`Static site: ${pages} pages + 404 → ${path.relative(ROOT, OUT) || OUT} (base ${BASE})`);
  } finally {
    server.kill();
    setTimeout(() => fs.rmSync(dataDir, { recursive: true, force: true }), 500);
  }
})().catch((e) => { console.error(e); process.exit(1); });
