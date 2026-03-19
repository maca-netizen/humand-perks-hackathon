const BASE = 'https://gvuouiwbzozomdyfzfzd.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dW91aXdiem96b21keWZ6ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjA5NzUsImV4cCI6MjA4OTQzNjk3NX0.wERASOyj3HvYPFy7d4PHG5vrK1m7RTBZksc1FAdM20s';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'return=representation', 'Content-Type': 'application/json' };

const users = await (await fetch(`${BASE}/users?select=id,name,role&order=name`, { headers: H })).json();
const wallets = await (await fetch(`${BASE}/wallets?select=id,user_id,balance`, { headers: H })).json();

// Set small, realistic balances for each employee
const targets = {
  'Ana Rodríguez': 17,
  'Carlos Ruiz': 15,
  'Diego López': 16,
  'Juan Pérez': 12,
  'Laura Martínez': 18,
  'Lucía Fernández': 13,
  'María García': 15,
  'Pedro Sánchez': 17,
  'Valentina Torres': 14,
  'Fermín Cabrera': 0,
};

for (const u of users) {
  const w = wallets.find(x => x.user_id === u.id);
  const target = targets[u.name];
  if (w && target !== undefined) {
    const r = await fetch(`${BASE}/wallets?id=eq.${w.id}`, {
      method: 'PATCH',
      headers: { ...H, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ balance: target }),
    });
    console.log(`${u.name}: ${w.balance} -> ${target} (${r.status})`);
  }
}

// Verify
const w2 = await (await fetch(`${BASE}/wallets?select=user_id,balance`, { headers: H })).json();
const totalBalance = w2.reduce((s, w) => s + Number(w.balance), 0);
console.log(`\nTotal balance across all wallets: ${totalBalance} credits`);
