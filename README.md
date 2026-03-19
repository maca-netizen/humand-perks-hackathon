# Humand Perks — Monorepo

3 apps, 1 base de datos (Supabase).

## Estructura
```
humand-perks-mono/
├── perks-app/      → App mobile del empleado (María García)
├── perks-web/      → Versión web desktop (María García)
├── perks-admin/    → Panel admin (Carolina Martinez)
└── README.md
```

## Deploy en Vercel (3 deploys desde 1 repo)

1. Subí este repo a GitHub
2. En Vercel, importá el repo 3 veces:
   - Import 1: Root Directory → `perks-app`
   - Import 2: Root Directory → `perks-web`
   - Import 3: Root Directory → `perks-admin`

## Correr local

Terminal 1:
```bash
cd perks-app && npm install @supabase/supabase-js && npm run dev -- -p 3001
```

Terminal 2:
```bash
cd perks-web && npm install @supabase/supabase-js && npm run dev -- -p 3002
```

Terminal 3:
```bash
cd perks-admin && npm install @supabase/supabase-js recharts && npm run dev -- -p 3003
```

## Supabase
- URL: https://robojpthadyiwcaryywi.supabase.co
- Las credenciales están en `lib/supabase.ts` de cada proyecto
