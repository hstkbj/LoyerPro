// Génère dist/sitemap.xml et dist/robots.txt avec l'URL réelle du site.
// URL : VITE_SITE_URL > APP_URL > VERCEL_PROJECT_PRODUCTION_URL > valeur par défaut.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const raw =
  process.env.VITE_SITE_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://loyerpro.vercel.app';
const base = raw.replace(/\/+$/, '');

const pages = [
  ['/', '1.0', 'weekly'],
  ['/properties', '0.9', 'daily'],
  ['/pricing', '0.7', 'monthly'],
  ['/about', '0.6', 'monthly'],
  ['/contact', '0.6', 'monthly'],
  ['/conditions-generales', '0.3', 'yearly'],
  ['/politique-de-confidentialite', '0.3', 'yearly'],
];
const today = new Date().toISOString().slice(0, 10);
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages
    .map(([p, prio, freq]) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`)
    .join('\n') +
  `\n</urlset>\n`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/sitemap.xml', xml);
if (existsSync('public/robots.txt')) {
  const robots = readFileSync('public/robots.txt', 'utf8').replace(/^Sitemap:.*$/m, `Sitemap: ${base}/sitemap.xml`);
  writeFileSync('dist/robots.txt', robots);
}
console.log(`sitemap.xml généré pour ${base}`);
