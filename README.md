# Velô Sprint - Configurador de Veículo Elétrico

Aplicação web em React para configuração e compra do veículo elétrico **Velô Sprint**.

## Sobre o Projeto

Uma SPA (Single Page Application) que permite:
- Personalizar cores, rodas e opcionais do veículo
- Calcular preços em tempo real
- Realizar pedidos com análise de crédito
- Consultar status de pedidos

**Especificações do Velô Sprint:** 450 km de autonomia | 0-100 km/h em 3.2s | 500 cv

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado** | Zustand (global), React Hook Form (formulários) |
| **Validação** | Zod |
| **Data Fetching** | TanStack Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |

---

## Instalação

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn run dev
```

Acesse: `http://localhost:5173`

---

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha um nome e senha para o banco
4. Aguarde a criação (~2 minutos)

### 2. Variáveis de Ambiente (produção + preview)

Dois projetos Supabase:

| Ambiente | Projeto | Arquivo local |
|----------|---------|---------------|
| **Produção** | `sugncocagmdocjbytveg` (Velô) | `.env` |
| **Preview** | `inhdobqkqjybeucjtqps` (velo-sprint-preview) | `.env.preview` |

**Produção (padrão — não apague):**

```bash
cp .env.example .env
# Edite .env com as chaves reais de produção (Settings → API)
```

**Preview (opcional, para testar o segundo projeto):**

```bash
cp .env.preview.example .env.preview
# Edite .env.preview com as chaves do velo-sprint-preview
```

| Comando | Supabase usado |
|---------|----------------|
| `yarn dev` | **Produção** (`.env`) |
| `yarn dev:preview` | **Preview** (`.env.preview`) |

> Chaves em: **Project Settings → API** de cada projeto no dashboard.

#### Vercel (preview deploy sem perder produção)

No dashboard da Vercel → projeto → **Settings → Environment Variables**, cadastre as **mesmas chaves** `VITE_SUPABASE_*` duas vezes com escopos diferentes:

| Variável | Production | Preview |
|----------|------------|---------|
| `VITE_SUPABASE_URL` | URL do projeto **prod** | URL do **velo-sprint-preview** |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key **prod** | anon key **preview** |
| `VITE_SUPABASE_PROJECT_ID` | `sugncocagmdocjbytveg` | `inhdobqkqjybeucjtqps` |

Assim o deploy de **Production** continua no Supabase de PRD e o deploy de **Preview** usa o Supabase novo.

#### GitHub Actions (E2E no preview)

| Secret | Uso |
|--------|-----|
| **`DATABASE_URL_PREVIEW`** | Banco **velo-sprint-preview** (senha URL-encoded; o CI usa pooler IPv4) |
| **`VERCEL_*`** | Deploy preview + `vercel pull` no job E2E (mesmas `VITE_SUPABASE_*` do escopo Preview na Vercel) |

Os testes E2E no CI rodam contra **`vite preview` local** (bundle com env de preview), não contra a URL do deploy. O job anterior ainda publica o preview na Vercel. Isso evita falhas por **Vercel Deployment Protection** (página de login no lugar do app) e cold start.

Mantenha **`DATABASE_URL`** se ainda usar testes locais contra produção.

### 3. Deploy (banco + functions)

```bash
# Instalar CLI
yarn add supabase -D

# Login e vincular projeto
yarn supabase login
yarn supabase link --project-ref sugncocagmdocjbytveg

# Aplicar migrações (cria tabelas e RLS)
yarn supabase db push

# Deploy das Edge Functions
yarn supabase functions deploy
```

Pronto! O banco e as functions estarão configurados.

---

## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/configure` | Configurador do veículo |
| `/order` | Checkout/Pedido |
| `/success` | Confirmação do pedido |
| `/lookup` | Consulta de pedidos |

---

## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---

## Banco de Dados

**Tabela `orders`** — campos principais:
- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---

## Análise de Crédito

| Score | Resultado |
|-------|-----------|
| > 700 | Aprovado |
| 501-700 | Em análise |
| ≤ 500 | Reprovado |

*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---

## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
```