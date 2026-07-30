import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_URL = 'https://alamins20.ami.bd';

async function generateSitemap() {
  console.log('Fetching data from Firebase...');
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

  try {
    // Fetch Blogs
    const blogsSnap = await getDocs(collection(db, 'blogs'));
    blogsSnap.forEach((doc) => {
      xml += `  <url>
    <loc>${BASE_URL}/blog/${doc.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    // Fetch Projects
    const projectsSnap = await getDocs(collection(db, 'projects'));
    projectsSnap.forEach((doc) => {
      xml += `  <url>
    <loc>${BASE_URL}/project/${doc.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    const outPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outPath, xml);
    console.log(`Sitemap generated successfully at ${outPath}! Added ${blogsSnap.size} blogs and ${projectsSnap.size} projects.`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
  } finally {
    process.exit(0);
  }
}

generateSitemap();
