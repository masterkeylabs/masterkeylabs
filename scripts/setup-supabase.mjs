#!/usr/bin/env node
/**
 * Automated Supabase setup for Masterkey Labs
 * 
 * Requires: SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)
 * Run: SUPABASE_ACCESS_TOKEN=your_token node scripts/setup-supabase.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = 'https://api.supabase.com/v1';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const existingUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const existingKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!token && !existingUrl) {
  console.error('\n❌ Setup requires one of:');
  console.error('   A) SUPABASE_ACCESS_TOKEN - to create project automatically');
  console.error('      Get it: https://supabase.com/dashboard/account/tokens');
  console.error('   B) NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY - to link existing project');
  console.error('\n   Opening Supabase... Create a project, then run:');
  console.error('   $env:NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="your-key"; node scripts/setup-supabase.mjs\n');
  const { execSync } = await import('child_process');
  try {
    if (process.platform === 'win32') execSync('start https://supabase.com/dashboard/new', { stdio: 'ignore' });
    else if (process.platform === 'darwin') execSync('open https://supabase.com/dashboard/new', { stdio: 'ignore' });
    else execSync('xdg-open https://supabase.com/dashboard/new', { stdio: 'ignore' });
  } catch (_) {}
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(data?.message || data?.error || text || res.statusText);
  return data;
}

async function main() {
  console.log('\n🔧 Setting up Supabase for Masterkey Labs...\n');

  // Mode B: Link existing project
  if (existingUrl && existingKey) {
    const ref = existingUrl.match(/https:\/\/([a-z]+)\.supabase\.co/)?.[1];
    if (!ref) throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL');
    const envPath = join(ROOT, '.env.local');
    writeFileSync(envPath, `NEXT_PUBLIC_SUPABASE_URL=${existingUrl}\nSUPABASE_SERVICE_ROLE_KEY=${existingKey}\n`);
    console.log('✓ .env.local written');
    console.log('\n✅ Run the schema in Supabase SQL Editor: supabase/schema.sql\n');
    return;
  }

  // Mode A: Create new project
  // 1. Get organizations
  const orgs = await api('GET', '/organizations');
  const org = orgs[0];
  if (!org) {
    throw new Error('No organization found. Create one at https://supabase.com/dashboard');
  }
  console.log('✓ Using organization:', org.name);

  // 2. Get available regions
  const regionsRes = await api('GET', `/projects/available-regions?organization_slug=${org.slug}`);
  const region = regionsRes?.regions?.[0]?.id || 'us-east-1';
  console.log('✓ Region:', region);

  // 3. Create project
  const dbPassword = `MkLabs${Date.now().toString(36)}!`;
  const project = await api('POST', '/projects', {
    organization_id: org.id,
    name: 'masterkeylabs',
    database_password: dbPassword,
    region,
  });
  const ref = project.ref;
  console.log('✓ Project created:', ref);
  console.log('  (Provisioning may take 1-2 minutes...)');

  // 4. Wait for project to be ready
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const health = await api('GET', `/projects/${ref}/health`);
      if (health?.status === 'ACTIVE_HEALTHY' || health?.healthy) {
        console.log('✓ Project is ready');
        break;
      }
    } catch (e) {
      if (i === 59) throw new Error('Project provisioning timed out. Check https://supabase.com/dashboard');
    }
    process.stdout.write('.');
  }

  // 5. Run migration
  const sqlPath = join(ROOT, 'supabase', 'migrations', '20240212000000_create_applications_and_bookings.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  try {
    await api('POST', `/projects/${ref}/database/query`, { query: sql });
    console.log('✓ Tables created');
  } catch (e) {
    console.warn('⚠ Could not run migration via API:', e.message);
    console.warn('  Run the SQL manually in Supabase SQL Editor:');
    console.warn('  supabase/schema.sql');
  }

  // 6. Get API keys
  const keys = await api('GET', `/projects/${ref}/api-keys/legacy`);
  const serviceKey = keys?.service_role;
  const url = `https://${ref}.supabase.co`;
  if (!serviceKey) {
    console.warn('⚠ Could not fetch service_role key. Get it from:');
    console.warn(`  https://supabase.com/dashboard/project/${ref}/settings/api`);
  }

  // 7. Write .env.local
  const envContent = `# Supabase - Auto-generated
NEXT_PUBLIC_SUPABASE_URL=${url}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey || 'REPLACE_ME'}
`;
  const envPath = join(ROOT, '.env.local');
  writeFileSync(envPath, envContent);
  console.log('✓ Written .env.local');

  console.log('\n✅ Setup complete!');
  console.log('   Run: npm run dev\n');
  if (!serviceKey) {
    console.log('   Then add SUPABASE_SERVICE_ROLE_KEY to .env.local from the dashboard.\n');
  }
}

main().catch((e) => {
  console.error('\n❌', e.message);
  process.exit(1);
});
