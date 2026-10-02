import Product from '../models/Product.js';

const seededCategories = ['Home & Living', 'Everyday Carry', 'Audio & Tech', 'On the Move'];

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getPublicOrigin(request) {
  const configuredOrigin = process.env.PUBLIC_SITE_URL?.trim();
  const origin = configuredOrigin || `${request.protocol}://${request.get('host')}`;
  return new URL(origin).origin;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character]);
}

export async function getSitemap(request, response) {
  try {
    const origin = getPublicOrigin(request);
    const products = await Product.find({ isActive: true }).select('_id name category updatedAt').limit(50000).lean();
    const categories = [...new Set([...seededCategories, ...products.map((product) => product.category).filter(Boolean)])];
    const entries = [
      { path: '/', changeFrequency: 'weekly', priority: '1.0' },
      { path: '/shop', changeFrequency: 'daily', priority: '0.9' },
      { path: '/about', changeFrequency: 'monthly', priority: '0.4' },
      ...categories.map((category) => ({ path: `/category/${slugify(category)}`, changeFrequency: 'weekly', priority: '0.7' })),
      ...products.map((product) => ({
        path: `/products/${slugify(product.name)}-${product._id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: '0.8',
      })),
    ];
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map((entry) => [
        '<url>',
        `<loc>${escapeXml(new URL(entry.path, origin).href)}</loc>`,
        entry.lastModified ? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>` : '',
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority}</priority>`,
        '</url>',
      ].join('')),
      '</urlset>',
    ].join('');

    response.type('application/xml').set('Cache-Control', 'public, max-age=300').send(xml);
  } catch {
    response.status(503).type('text/plain').send('Sitemap is temporarily unavailable.');
  }
}

export function getRobots(request, response) {
  try {
    const origin = getPublicOrigin(request);
    response.type('text/plain').send([
      'User-agent: *',
      'Allow: /',
      'Disallow: /login',
      'Disallow: /register',
      'Disallow: /cart',
      'Disallow: /checkout',
      'Disallow: /orders',
      'Disallow: /admin',
      'Disallow: /shop?search=',
      `Sitemap: ${new URL('/api/seo/sitemap.xml', origin).href}`,
      '',
    ].join('\n'));
  } catch {
    response.status(503).type('text/plain').send('Robots policy is temporarily unavailable.');
  }
}