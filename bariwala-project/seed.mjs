import fs from 'node:fs';
import pg from 'pg';
import bcrypt from 'bcrypt';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const client = new pg.Client({
  host: env.DB_HOST, port: Number(env.DB_PORT),
  user: env.DB_USERNAME, password: env.DB_PASS, database: env.DB_NAME,
});

async function upsertUser(name, email, phone, role, hash) {
  const r = await client.query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, email, phone, hash, role],
  );
  return r.rows[0].id;
}

async function ensureFlat(flatNo, ownerId) {
  const found = await client.query('SELECT id FROM flats WHERE flat_no = $1 AND "ownerId" = $2', [flatNo, ownerId]);
  if (found.rowCount > 0) return found.rows[0].id;
  const r = await client.query(
    `INSERT INTO flats (flat_no, address, floor, bedrooms, rent, "ownerId")
     VALUES ($1, 'Mirpur, Dhaka', 1, 2, 15000, $2) RETURNING id`,
    [flatNo, ownerId],
  );
  return r.rows[0].id;
}

try {
  await client.connect();
  const hash = await bcrypt.hash('password123', 10);

  await upsertUser('Admin User', 'admin@test.com', '01711111111', 'admin', hash);
  const owner1 = await upsertUser('Owner One', 'owner1@test.com', '01722222222', 'owner', hash);
  const owner2 = await upsertUser('Owner Two', 'owner2@test.com', '01733333333', 'owner', hash);
  const tenantUser = await upsertUser('Tenant One', 'tenant1@test.com', '01744444444', 'tenant', hash);

  const flat1 = await ensureFlat('A-101', owner1);
  await ensureFlat('B-201', owner2);

  await client.query(
    'INSERT INTO tenants (user_id, flat_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [tenantUser, flat1],
  );

  console.log('Seed done. Test users (password: password123):');
  console.log('  owner1@test.com  (owner of flat A-101)');
  console.log('  owner2@test.com  (owner of a different flat)');
  console.log('  tenant1@test.com (tenant living in flat A-101)');
  console.log('  admin@test.com');
} catch (e) {
  console.error('SEED FAILED:', e.message);
  console.error('Did you start the app once (npm run start:dev) so the tables were created?');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}