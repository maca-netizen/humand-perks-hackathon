const BASE = 'https://gvuouiwbzozomdyfzfzd.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dW91aXdiem96b21keWZ6ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjA5NzUsImV4cCI6MjA4OTQzNjk3NX0.wERASOyj3HvYPFy7d4PHG5vrK1m7RTBZksc1FAdM20s';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function query(table, params = '') {
  const r = await fetch(`${BASE}/${table}?${params}`, { headers: { ...H, 'Prefer': 'return=representation' } });
  return r.json();
}
async function patch(table, params, body) {
  return (await fetch(`${BASE}/${table}?${params}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) })).status;
}
async function del(table, params) {
  return (await fetch(`${BASE}/${table}?${params}`, { method: 'DELETE', headers: H })).status;
}
async function post(table, body) {
  return (await fetch(`${BASE}/${table}`, { method: 'POST', headers: H, body: JSON.stringify(body) })).status;
}

console.log("=== STEP 1: Delete all transactions ===");
await del('transactions', 'id=not.is.null');
console.log("Done");

console.log("\n=== STEP 2: Reset all wallets to 20 credits ===");
await patch('wallets', 'id=not.is.null', { balance: 20 });
console.log("Done");

console.log("\n=== STEP 3: Get users and wallets ===");
const users = await query('users', 'select=id,name,role&order=name');
const wallets = await query('wallets', 'select=id,user_id,balance');
const benefits = await query('benefits', 'select=id,name,cost&order=name');

// Only employees get the initial credit load
const employees = users.filter(u => u.role === 'employee');
console.log(`${employees.length} employees, ${benefits.length} benefits`);

console.log("\n=== STEP 4: Create initial credit transaction (20 credits each) ===");
for (const emp of employees) {
  const w = wallets.find(x => x.user_id === emp.id);
  if (!w) continue;
  await post('transactions', {
    user_id: emp.id,
    wallet_id: w.id,
    type: 'credit',
    amount: 20,
    description: 'Carga mensual - Marzo 2026',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  });
}
console.log("Done");

console.log("\n=== STEP 5: Create some redemptions (small amounts 2-8 credits) ===");
// Pick some users and benefits for realistic redemptions
const redemptions = [
  { user: 'María García', benefit: 'Starbucks', daysAgo: 2 },
  { user: 'María García', benefit: 'Coffee break premium', daysAgo: 1 },
  { user: 'Juan Pérez', benefit: 'Netflix', daysAgo: 3 },
  { user: 'Ana Rodríguez', benefit: 'Clase de yoga', daysAgo: 4 },
  { user: 'Carlos Ruiz', benefit: 'Curso Udemy', daysAgo: 1 },
  { user: 'Lucía Fernández', benefit: 'PedidosYa', daysAgo: 2 },
  { user: 'Pedro Sánchez', benefit: 'Entrada de cine', daysAgo: 3 },
  { user: 'Laura Martínez', benefit: 'Coffee Shop', daysAgo: 5 },
  { user: 'Diego López', benefit: 'Streaming mensual', daysAgo: 1 },
  { user: 'Valentina Torres', benefit: 'Sesión de nutrición', daysAgo: 2 },
];

for (const r of redemptions) {
  const usr = users.find(u => u.name === r.user);
  const ben = benefits.find(b => b.name === r.benefit);
  const w = wallets.find(x => x.user_id === usr?.id);
  if (!usr || !ben || !w) { console.log('Skip:', r.user, r.benefit); continue; }

  const prefix = ben.name.split(' ')[0].toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  await post('transactions', {
    user_id: usr.id,
    wallet_id: w.id,
    type: 'debit',
    amount: Number(ben.cost),
    benefit_id: ben.id,
    code: `PERKS-${prefix}-${random}`,
    description: `Canje: ${ben.name}`,
    created_at: new Date(Date.now() - r.daysAgo * 86400000).toISOString(),
  });
  console.log(`${usr.name} canjeó ${ben.name} (${ben.cost} créditos)`);
}

console.log("\n=== STEP 6: Recalculate all wallet balances ===");
const txns = await query('transactions', 'select=wallet_id,type,amount');
const walletsNow = await query('wallets', 'select=id,user_id,balance');

for (const w of walletsNow) {
  const cr = txns.filter(t => t.wallet_id === w.id && t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
  const db = txns.filter(t => t.wallet_id === w.id && t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
  const expected = Math.round((cr - db) * 100) / 100;
  await patch('wallets', `id=eq.${w.id}`, { balance: expected });
}

console.log("\n=== VERIFICATION ===");
const w2 = await query('wallets', 'select=id,user_id,balance');
const t2 = await query('transactions', 'select=wallet_id,type,amount');

users.forEach(usr => {
  const wl = w2.find(x => x.user_id === usr.id);
  const cr = t2.filter(x => x.wallet_id === wl?.id && x.type === 'credit').reduce((s, x) => s + Number(x.amount), 0);
  const db = t2.filter(x => x.wallet_id === wl?.id && x.type === 'debit').reduce((s, x) => s + Number(x.amount), 0);
  console.log(`${usr.name} | balance=${wl?.balance} | loaded=${cr} | spent=${db}`);
});
