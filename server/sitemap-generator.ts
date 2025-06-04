import { db } from './db';
import { blogs, vehicles } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function generateSitemap(): Promise<string> {
  // Get all published blogs
  const publishedBlogs = await db.query.blogs.findMany({
    where: eq(blogs.status, 'published'),
    columns: {
      slug: true,
      updatedAt: true
    }
  });

  // Get all available vehicles
  const availableVehicles = await db.query.vehicles.findMany({
    where: eq(vehicles.availability, true),
    columns: {
      id: true
    }
  });

  // Base URLs
  const baseUrl = 'https://sirenda.rw';
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/vehicles', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' }
  ];

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Add blog posts
  for (const blog of publishedBlogs) {
    const lastmod = blog.updatedAt ? new Date(blog.updatedAt) : new Date();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${blog.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // Add vehicle pages
  for (const vehicle of availableVehicles) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/vehicles/${vehicle.id}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += '</urlset>';
  return xml;
} 