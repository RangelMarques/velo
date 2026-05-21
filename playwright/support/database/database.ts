import dns from 'node:dns'
import { lookup } from 'node:dns/promises'
import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

dns.setDefaultResultOrder('ipv4first')

/** Região do pooler do projeto (Supabase → Connect → Session pooler) */
const SUPABASE_POOLER_HOST =
  process.env.SUPABASE_POOLER_HOST ?? 'aws-1-sa-east-1.pooler.supabase.com'

function parsePostgresUrl(connectionString: string) {
  const normalized = connectionString.trim().replace(/^postgresql:/, 'postgres:')
  const url = new URL(normalized)
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
  }
}

/**
 * db.PROJECT.supabase.co só resolve em IPv6 — GitHub Actions não alcança.
 * O Session pooler (aws-*-*.pooler.supabase.com) tem IPv4.
 */
export function resolveConnectionString(connectionString: string): string {
  const parsed = parsePostgresUrl(connectionString)
  const directMatch = parsed.host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  if (!directMatch) return connectionString

  const projectRef = directMatch[1]
  const user = `postgres.${projectRef}`
  const password = encodeURIComponent(parsed.password)
  const database = parsed.database

  return `postgresql://${user}:${password}@${SUPABASE_POOLER_HOST}:${parsed.port}/${database}`
}

async function resolveHostIPv4(host: string): Promise<string> {
  try {
    const { address } = await lookup(host, { family: 4 })
    return address
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOTFOUND' || err.code === 'ENETUNREACH') {
      throw new Error(
        `Host "${host}" sem IPv4 acessível. No GitHub secret DATABASE_URL use o Session pooler ` +
          `(Supabase → Connect), ex.: postgresql://postgres.PROJECT:senha@${SUPABASE_POOLER_HOST}:5432/postgres`
      )
    }
    throw error
  }
}

async function createPool(): Promise<pg.Pool> {
  const raw = process.env.DATABASE_URL?.trim()
  if (!raw) {
    throw new Error(
      'DATABASE_URL não definida. Configure no .env local ou no secret DATABASE_URL do GitHub Actions.'
    )
  }

  const connectionString =
    process.env.CI === 'true' ? resolveConnectionString(raw) : raw
  const parsed = parsePostgresUrl(connectionString)
  const isSupabase = parsed.host.includes('supabase.co')
  const ssl = isSupabase ? { rejectUnauthorized: false } as const : undefined

  const host =
    process.env.CI === 'true' ? await resolveHostIPv4(parsed.host) : parsed.host

  if (process.env.CI === 'true') {
    return new pg.Pool({
      host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl: isSupabase ? { rejectUnauthorized: false, servername: parsed.host } : undefined,
      max: 10,
    })
  }

  return new pg.Pool({
    connectionString,
    ssl,
    max: 10,
  })
}

let pool: pg.Pool | null = null
let dbInstance: Kysely<Database> | null = null

export async function getDb(): Promise<Kysely<Database>> {
  if (!dbInstance) {
    pool = await createPool()
    dbInstance = new Kysely<Database>({
      dialect: new PostgresDialect({ pool }),
    })
  }
  return dbInstance
}
