import dns from 'node:dns'
import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

// GitHub Actions não alcança Supabase via IPv6 (ENETUNREACH); prioriza IPv4 no DNS
dns.setDefaultResultOrder('ipv4first')

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não definida. Configure no .env local ou no secret do GitHub Actions.'
  )
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
})

export const db = new Kysely<Database>({
  dialect,
})
