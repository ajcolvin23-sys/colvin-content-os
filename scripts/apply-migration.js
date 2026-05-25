/**
 * apply-migration.js
 *
 * Applies a Supabase SQL migration using your database password.
 *
 * Usage:
 *   node scripts/apply-migration.js supabase/migrations/003_hermes_tables.sql
 *
 * Requires: SUPABASE_DB_PASSWORD environment variable OR pass as arg
 *   SUPABASE_DB_PASSWORD=yourpassword node scripts/apply-migration.js supabase/migrations/003_hermes_tables.sql
 *
 * Find your database password:
 *   Supabase Dashboard → Project Settings → Database → Database Password → Reveal
 *
 * Add to .env.local (local only — never commit, never add to GitHub Secrets):
 *   SUPABASE_DB_PASSWORD=your_db_password_here
 */

const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(__dirname, '../node_modules/pg'));

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx < 0) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node scripts/apply-migration.js supabase/migrations/003_hermes_tables.sql');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in .env.local');
  process.exit(1);
}

if (!dbPassword) {
  console.error('');
  console.error('❌ SUPABASE_DB_PASSWORD not set.');
  console.error('');
  console.error('To find your database password:');
  console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.error('  2. Select your project');
  console.error('  3. Settings → Database → Database Password → Reveal');
  console.error('  4. Add to .env.local: SUPABASE_DB_PASSWORD=your_password');
  console.error('');
  console.error('OR: Apply the migration manually in the Supabase SQL Editor:');
  console.error('  1. Go to Supabase Dashboard → SQL Editor');
  console.error('  2. Click "New Query"');
  console.error('  3. Paste the contents of:', path.resolve(migrationFile));
  console.error('  4. Click "Run"');
  console.error('');
  process.exit(1);
}

const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const sqlContent = fs.readFileSync(path.resolve(migrationFile), 'utf8');

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log(`\nApplying migration: ${migrationFile}`);
  console.log(`Project: ${projectRef}`);

  await client.connect();
  console.log('✓ Connected to Supabase postgres');

  await client.query(sqlContent);
  console.log('✓ Migration applied successfully');

  // Verify
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('\nPublic tables now:');
  result.rows.forEach(r => console.log(' ·', r.table_name));

  await client.end();
  console.log('\n✓ Done.');
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
