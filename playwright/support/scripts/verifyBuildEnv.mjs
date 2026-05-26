import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const distDir = 'dist/assets'
const files = readdirSync(distDir).filter((f) => f.endsWith('.js'))
const bundle = files.map((f) => readFileSync(join(distDir, f), 'utf8')).join('\n')

if (!bundle.includes('supabase.co')) {
  console.error('::error::O build não embutiu VITE_SUPABASE_URL (bundle sem supabase.co).')
  console.error('Configure secrets VITE_SUPABASE_*_PREVIEW no GitHub ou variáveis Preview na Vercel.')
  process.exit(1)
}

const projectId = process.env.EXPECTED_SUPABASE_PROJECT_ID
if (projectId && !bundle.includes(projectId)) {
  console.error(`::error::Bundle não contém o project id esperado (${projectId}).`)
  process.exit(1)
}

console.log('Build OK: variáveis Supabase presentes no bundle.')
