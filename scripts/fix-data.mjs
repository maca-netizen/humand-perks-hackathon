const URL = 'https://gvuouiwbzozomdyfzfzd.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dW91aXdiem96b21keWZ6ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjA5NzUsImV4cCI6MjA4OTQzNjk3NX0.wERASOyj3HvYPFy7d4PHG5vrK1m7RTBZksc1FAdM20s';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function query(table, params = '') {
  const r = await fetch(`${URL}/${table}?${params}`, { headers: { ...H, 'Prefer': 'return=representation' } });
  return r.json();
}
async function patch(table, params, body) {
  const r = await fetch(`${URL}/${table}?${params}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  return r.status;
}

// 1. Fix broken images
console.log("=== FIXING IMAGES ===");
let s1 = await patch('benefits', 'image_url=like.*1540555700478*', { image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop' });
console.log('Spa fix:', s1);
let s2 = await patch('benefits', 'image_url=like.*1523050854058*', { image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop' });
console.log('Cert fix:', s2);

// 2. Fix wallet balances
console.log("\n=== FIXING BALANCES ===");
const wallets = await query('wallets', 'select=id,user_id,balance');
const txns = await query('transactions', 'select=wallet_id,type,amount');
const users = await query('users', 'select=id,name&order=name');

for (const w of wallets) {
  const cr = txns.filter(t => t.wallet_id === w.id && t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
  const db = txns.filter(t => t.wallet_id === w.id && t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
  const expected = Math.round((cr - db) * 100) / 100;
  const usr = users.find(u => u.id === w.user_id);
  if (Number(w.balance) !== expected) {
    const st = await patch('wallets', `id=eq.${w.id}`, { balance: expected });
    console.log(`Fixed ${usr?.name}: ${w.balance} -> ${expected} (${st})`);
  } else {
    console.log(`OK ${usr?.name}: ${w.balance}`);
  }
}

// 3. Verify images
console.log("\n=== VERIFY IMAGES ===");
const bens = await query('benefits', 'select=name,image_url&name=in.(Día de spa,Certificación profesional)');
bens.forEach(b => console.log(b.name, '->', b.image_url));
