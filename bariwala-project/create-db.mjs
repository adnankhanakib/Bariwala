import fs from 'node:fs';
import pg from 'pg';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const client = new pg.Client({
  host: env.DB_HOST, port: Number(env.DB_PORT),
  user: env.DB_USERNAME, password: env.DB_PASS, database: 'postgres',
});
try {
  await client.connect();
  const r = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [env.DB_NAME]);
  if (r.rowCount === 0) {
    await client.query(`CREATE DATABASE "${env.DB_NAME}"`);
    console.log(`Database "${env.DB_NAME}" created.`);
  } else {
    console.log(`Database "${env.DB_NAME}" already exists. OK.`);
  }
} catch (e) {
  console.error('FAILED:', e.message);
  console.error('Check DB_USERNAME / DB_PASS in the .env file, and that PostgreSQL is running.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}