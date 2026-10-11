/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/js/**/*.js", "./src/**/*.js"],
  darkMode: "class",
  // classes built dynamically in templates (grade-${g}, status-${s}, bar-${g})
  safelist: ["grade-A", "grade-B", "grade-C", "grade-D", "bar-A", "bar-B", "bar-C", "bar-D", "status-new", "status-in_progress", "status-contacted", "status-ready", "status-done", "status-cancelled"],
  theme: {
    extend: {
      colors: {
        forest: { 50: "#EEF7F1", 100: "#DCEBDF", 200: "#B9D7C2", 300: "#8FBC9E", 400: "#5E9A73", 500: "#2F6B4C", 600: "#1F5C47", 700: "#174A39", 800: "#143A30", 900: "#0E2A21", 950: "#081A14" },
        lime: { 50: "#F5FDE8", 100: "#E8FAC8", 200: "#D2F59A", 300: "#B8EE66", 400: "#A3E635", 500: "#84CC16", 600: "#65A30D" },
        mint: { 50: "#F6FBF7", 100: "#EDF8EF", 200: "#DFF4E3" },
        graphite: { 950: "#0B0F0D", 900: "#0F1412", 850: "#131A17", 800: "#161D1A", 700: "#1E2723", 600: "#24302B", 500: "#33413B" },
        ink: { DEFAULT: "#0E2A21", soft: "#4B5F57" },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Noto Sans Georgian"', "system-ui", "sans-serif"],
        sans: ["Inter", '"Noto Sans Georgian"', "system-ui", "sans-serif"],
        logo: ["Montserrat", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Noto Sans Georgian"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,42,33,.04), 0 8px 24px -12px rgba(14,42,33,.12)",
        lift: "0 2px 4px rgba(14,42,33,.05), 0 18px 40px -18px rgba(14,42,33,.25)",
        glow: "0 0 0 1px rgba(163,230,53,.35), 0 8px 28px -6px rgba(163,230,53,.45)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        rise: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "none" } },
        pulseDot: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
      },
      animation: { rise: "rise .6s ease-out both", pulseDot: "pulseDot 1.8s ease-in-out infinite" },
    },
  },
  plugins: [],
};
