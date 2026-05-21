import dns from 'node:dns'
import { lookup } from 'node:dns/promises'
import { config } from 'dotenv'
import pg from 'pg'

config()
dns.setDefaultResultOrder('ipv4first')

const POOLER_HOST = process.env.SUPABASE_POOLER_HOST ?? 'aws-1-sa-east-1.pooler.supabase.com'

function resolveForCi(connectionString) {
  const normalized = connectionString.trim().replace(/^postgresql:/, 'postgres:')
  const url = new URL(normalized)
  const match = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  if (!match) return connectionString

  const projectRef = match[1]
  const password = encodeURIComponent(decodeURIComponent(url.password))
  const database = url.pathname.replace(/^\//, '') || 'postgres'
  const port = url.port || '5432'
  return `postgresql://postgres.${projectRef}:${password}@${POOLER_HOST}:${port}/${database}`
}

const raw = process.env.DATABASE_URL?.trim()
if (!raw) {
  console.error('::error::DATABASE_URL não está definida')
  process.exit(1)
}

const connectionString = resolveForCi(raw)
const normalized = connectionString.replace(/^postgresql:/, 'postgres:')
const url = new URL(normalized)
const hostname = url.hostname

let pool
try {
  const { address } = await lookup(hostname, { family: 4 })
  const isSupabase = hostname.includes('supabase.co')

  pool = new pg.Pool({
    host: address,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
    ssl: isSupabase ? { rejectUnauthorized: false, servername: hostname } : undefined,
    max: 1,
  })
} catch (error) {
  console.error('::error::Falha ao resolver host:', hostname, error.message)
  process.exit(1)
}

try {
  const result = await pool.query('select 1 as ok')
  console.log('DATABASE_URL OK (host:', hostname + '):', result.rows[0])
} catch (error) {
  console.error('::error::Falha na query:', error.message)
  process.exit(1)
} finally {
  await pool.end()
}
