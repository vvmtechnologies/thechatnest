// Generates public/sitemap.xml at build time with current ISO date as lastmod.
// Run automatically before `vite build` via prebuild hook in package.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.resolve(__dirname, "..", "public", "sitemap.xml");
const SITE = "https://www.thechatnest.com";
const TODAY = new Date().toISOString().slice(0, 10);

const ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/pricing", priority: 0.95, changefreq: "weekly" },
  { path: "/features", priority: 0.9, changefreq: "weekly" },
  { path: "/compare", priority: 0.85, changefreq: "monthly" },
  { path: "/downloads", priority: 0.85, changefreq: "weekly" },
  { path: "/demo", priority: 0.85, changefreq: "monthly" },
  { path: "/contact", priority: 0.8, changefreq: "monthly" },
  { path: "/how-it-works", priority: 0.75, changefreq: "monthly" },
  { path: "/help", priority: 0.7, changefreq: "weekly" },
  { path: "/versions", priority: 0.7, changefreq: "weekly" },
  { path: "/security", priority: 0.7, changefreq: "monthly" },
  { path: "/status", priority: 0.65, changefreq: "daily" },
  { path: "/brand", priority: 0.55, changefreq: "monthly" },
  { path: "/auth/register", priority: 0.9, changefreq: "monthly" },
  { path: "/auth/login", priority: 0.7, changefreq: "monthly" },
  { path: "/saas-privacy", priority: 0.4, changefreq: "yearly" },
  { path: "/gdpr", priority: 0.4, changefreq: "yearly" },
  { path: "/refund-policy", priority: 0.4, changefreq: "yearly" },
];

const escape = (s) => String(s).replace(/&/g, "&amp;");

const urls = ROUTES.map(
  ({ path: p, priority, changefreq }) => `  <url>
    <loc>${escape(SITE + p)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(OUT_PATH, xml, "utf8");
console.log(`✓ Sitemap generated (${ROUTES.length} routes, lastmod=${TODAY}) → ${OUT_PATH}`);
