// Requires Node 18+ (native fetch/FormData/Blob) and a .env file loaded via dotenv.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const R2_BASE = process.env.VITE_R2_PUBLIC_URL;
const CONCURRENCY = 8;
const MAX_RETRIES = 2;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !R2_BASE) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_R2_PUBLIC_URL');
  process.exit(1);
}

// Dedupe: identical source URLs are migrated once and reused everywhere they appear.
const urlCache = new Map();
const failures = [];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateImageOnce(oldUrl) {
  const res = await fetch(oldUrl);
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const blob = await res.blob();
  const ext = oldUrl.split('.').pop().split('?')[0] || 'webp';
  const filePath = `migrated/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const formData = new FormData();
  formData.append('file', blob, filePath);
  formData.append('filePath', filePath);
  formData.append('cacheControl', '31536000');

  const { data, error } = await supabase.functions.invoke('upload-image', { body: formData });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Prefer the URL the function actually reports, if it returns one.
  return data?.url || `${R2_BASE}/${filePath}`;
}

async function migrateImage(oldUrl) {
  if (!oldUrl || !oldUrl.includes('supabase.co/storage')) return oldUrl;
  if (urlCache.has(oldUrl)) return urlCache.get(oldUrl);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const newUrl = await migrateImageOnce(oldUrl);
      urlCache.set(oldUrl, newUrl);
      return newUrl;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error('Migration failed permanently:', oldUrl, err.message);
        failures.push({ url: oldUrl, error: err.message });
        urlCache.set(oldUrl, oldUrl); // don't retry again this run if seen again
        return oldUrl;
      }
      await sleep(500 * (attempt + 1));
    }
  }
}

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, next));
  return results;
}

async function migrateProducts() {
  const { data: products, error } = await supabase.from('products').select('product_id, image_url, images');
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  console.log(`Migrating ${products.length} products...`);

  await runPool(products, async (p) => {
    const newImageUrl = await migrateImage(p.image_url);
    const newImages = p.images?.length ? await Promise.all(p.images.map(migrateImage)) : p.images;

    const changed = newImageUrl !== p.image_url || JSON.stringify(newImages) !== JSON.stringify(p.images);
    if (!changed) return;

    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: newImageUrl, images: newImages })
      .eq('product_id', p.product_id);
    if (updateError) {
      console.error('DB update failed for product', p.product_id, updateError.message);
      failures.push({ table: 'products', id: p.product_id, error: updateError.message });
      return;
    }
    console.log('✓ product', p.product_id);
  }, CONCURRENCY);
}

async function migrateVariants() {
  const { data: variants, error } = await supabase.from('product_variants').select('variant_id, images');
  if (error) throw new Error(`Failed to fetch product_variants: ${error.message}`);
  console.log(`Migrating ${variants.length} variants...`);

  await runPool(variants, async (v) => {
    if (!v.images?.length) return;
    const newImages = await Promise.all(v.images.map(migrateImage));
    if (JSON.stringify(newImages) === JSON.stringify(v.images)) return;

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ images: newImages })
      .eq('variant_id', v.variant_id);
    if (updateError) {
      console.error('DB update failed for variant', v.variant_id, updateError.message);
      failures.push({ table: 'product_variants', id: v.variant_id, error: updateError.message });
      return;
    }
    console.log('✓ variant', v.variant_id);
  }, CONCURRENCY);
}

async function migrateSingleImageTable(table, idCol) {
  const { data: rows, error } = await supabase.from(table).select(`${idCol}, image_url`);
  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  console.log(`Migrating ${rows.length} ${table}...`);

  await runPool(rows, async (r) => {
    const newUrl = await migrateImage(r.image_url);
    if (newUrl === r.image_url) return;

    const { error: updateError } = await supabase.from(table).update({ image_url: newUrl }).eq(idCol, r[idCol]);
    if (updateError) {
      console.error(`DB update failed for ${table}`, r[idCol], updateError.message);
      failures.push({ table, id: r[idCol], error: updateError.message });
      return;
    }
    console.log(`✓ ${table}`, r[idCol]);
  }, CONCURRENCY);
}

async function run() {
  const steps = [
    ['products', migrateProducts],
    ['product_variants', migrateVariants],
    ['categories', () => migrateSingleImageTable('categories', 'category_id')],
    ['subcategories', () => migrateSingleImageTable('subcategories', 'subcategory_id')],
  ];

  for (const [name, fn] of steps) {
    try {
      await fn();
    } catch (err) {
      console.error(`Step "${name}" aborted:`, err.message);
      failures.push({ step: name, error: err.message });
    }
  }

  if (failures.length) {
    writeFileSync('migration-failures.json', JSON.stringify(failures, null, 2));
    console.log(`Done with ${failures.length} failure(s) — see migration-failures.json`);
  } else {
    console.log('Done. No failures.');
  }
}

run();