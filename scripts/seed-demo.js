/**
 * Seed demo data — Humand Perks
 * Genera datos históricos realistas para la demo (6 meses: Oct 2025 - Mar 2026)
 *
 * Criterios:
 * - Créditos mensuales se acreditan el día 1 de cada mes
 * - Canjes distribuidos orgánicamente a lo largo de cada mes
 * - Bonuses en fechas lógicas (cumpleaños en su fecha, aniversarios, etc.)
 * - Patrón de adopción creciente (más canjes en meses recientes)
 *
 * Ejecutar: cd perks-admin && node -e "$(cat ../scripts/seed-demo.js)"
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://gvuouiwbzozomdyfzfzd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dW91aXdiem96b21keWZ6ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjA5NzUsImV4cCI6MjA4OTQzNjk3NX0.wERASOyj3HvYPFy7d4PHG5vrK1m7RTBZksc1FAdM20s"
);

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function randomCode(name) {
  const prefix = name.replace(/\s/g, "").slice(0, 4).toUpperCase();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `PERKS-${prefix}-${code}`;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDay(year, month, minDay, maxDay) {
  const day = Math.floor(Math.random() * (maxDay - minDay + 1)) + minDay;
  const hour = Math.floor(Math.random() * 12) + 8; // 8am-8pm
  const min = Math.floor(Math.random() * 60);
  return new Date(year, month, day, hour, min).toISOString();
}

// Gender assignments (coherent with names)
const genderMap = {
  "María García": "Femenino",
  "Juan Pérez": "Masculino",
  "Ana Rodríguez": "Femenino",
  "Carlos Ruiz": "Masculino",
  "Lucía Fernández": "Femenino",
  "Pedro Sánchez": "Masculino",
  "Laura Martínez": "Femenino",
  "Diego López": "Masculino",
  "Valentina Torres": "Femenino",
  "Fermín Cabrera": "Masculino",
};

async function seed() {
  console.log("🌱 Iniciando seed de datos demo...\n");

  // 1. Fetch existing data
  const { data: users } = await supabase.from("users").select("*");
  const { data: wallets } = await supabase.from("wallets").select("*");
  const { data: benefits } = await supabase.from("benefits").select("*");
  const { data: courses } = await supabase.from("courses").select("*");

  const employees = users.filter(u => u.role === "employee");
  const activeBenefits = benefits.filter(b => b.active);

  console.log(`👥 Empleados: ${employees.length}`);
  console.log(`🎁 Beneficios activos: ${activeBenefits.length}`);
  console.log(`📚 Cursos: ${courses.length}\n`);

  // 2. Clean ALL transactions and rebuild from scratch
  console.log("🗑️  Limpiando datos anteriores...");
  await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("course_completions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("bulk_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 3. Generate 6 months of transactions (Oct 2025 - Mar 2026)
  const transactions = [];
  const months = [
    { year: 2025, month: 9, name: "Oct" },   // Oct 2025
    { year: 2025, month: 10, name: "Nov" },  // Nov 2025
    { year: 2025, month: 11, name: "Dic" },  // Dec 2025
    { year: 2026, month: 0, name: "Ene" },   // Jan 2026
    { year: 2026, month: 1, name: "Feb" },   // Feb 2026
    { year: 2026, month: 2, name: "Mar" },   // Mar 2026
  ];

  const bulkHistory = [];
  const redemptionsPerMonth = [4, 6, 8, 12, 16, 22]; // adoption curve

  for (let mi = 0; mi < months.length; mi++) {
    const { year, month, name } = months[mi];
    const maxDay = month === 1 ? 28 : 28; // safe max day

    // ── CARGA MENSUAL: DÍA 1 de cada mes, todos los empleados ──
    for (const emp of employees) {
      const wallet = wallets.find(w => w.user_id === emp.id);
      if (!wallet) continue;

      transactions.push({
        id: uuid(),
        user_id: emp.id,
        wallet_id: wallet.id,
        benefit_id: null,
        type: "credit",
        amount: 20,
        code: null,
        description: `Carga mensual - ${name} ${year}`,
        created_at: new Date(year, month, 1, 9, 0).toISOString(),
      });
    }

    // Bulk history entry for monthly load
    bulkHistory.push({
      id: uuid(),
      date: new Date(year, month, 1, 9, 0).toISOString(),
      file: `carga_${name.toLowerCase()}_${year}.csv`,
      users_count: employees.length,
      credits: 20,
      total: employees.length * 20,
      status: "completed",
      created_by: "Fermín C.",
      created_at: new Date(year, month, 1, 9, 0).toISOString(),
    });

    // ── BONUS DE CUMPLEAÑOS: si el empleado cumple años este mes ──
    for (const emp of employees) {
      if (!emp.birthday) continue;
      const bday = new Date(emp.birthday);
      if (bday.getMonth() === month) {
        const wallet = wallets.find(w => w.user_id === emp.id);
        if (!wallet) continue;
        transactions.push({
          id: uuid(),
          user_id: emp.id,
          wallet_id: wallet.id,
          benefit_id: null,
          type: "credit",
          amount: 10,
          code: null,
          description: `Bonus de cumpleaños - ${emp.name}`,
          created_at: new Date(year, month, bday.getDate(), 10, 0).toISOString(),
        });
      }
    }

    // ── BONUS DE ANIVERSARIO: si el empleado tiene aniversario laboral este mes ──
    for (const emp of employees) {
      if (!emp.hire_date) continue;
      const hd = new Date(emp.hire_date);
      if (hd.getMonth() === month && hd.getFullYear() < year) {
        const wallet = wallets.find(w => w.user_id === emp.id);
        if (!wallet) continue;
        const years = year - hd.getFullYear();
        transactions.push({
          id: uuid(),
          user_id: emp.id,
          wallet_id: wallet.id,
          benefit_id: null,
          type: "credit",
          amount: 15,
          code: null,
          description: `Aniversario laboral - ${years} año${years > 1 ? "s" : ""} en la empresa`,
          created_at: new Date(year, month, hd.getDate(), 10, 0).toISOString(),
        });
      }
    }

    // ── BONUS TRIMESTRAL para líderes (Ene y Abr) ──
    if (month === 0 || month === 3) {
      const leaders = employees.filter(e => ["Marketing", "Tecnología", "Ventas"].includes(e.dept));
      for (const emp of leaders) {
        const wallet = wallets.find(w => w.user_id === emp.id);
        if (!wallet) continue;
        transactions.push({
          id: uuid(),
          user_id: emp.id,
          wallet_id: wallet.id,
          benefit_id: null,
          type: "credit",
          amount: 30,
          code: null,
          description: "Bonus trimestral líderes",
          created_at: new Date(year, month, 15, 11, 0).toISOString(),
        });
      }
      bulkHistory.push({
        id: uuid(),
        date: new Date(year, month, 15, 11, 0).toISOString(),
        file: `bonus_lideres_Q${month === 0 ? 1 : 2}_${year}.csv`,
        users_count: leaders.length,
        credits: 30,
        total: leaders.length * 30,
        status: "completed",
        created_by: "Ana M.",
        created_at: new Date(year, month, 15, 11, 0).toISOString(),
      });
    }

    // ── BONUS NAVIDEÑO (diciembre) ──
    if (month === 11) {
      for (const emp of employees) {
        const wallet = wallets.find(w => w.user_id === emp.id);
        if (!wallet) continue;
        transactions.push({
          id: uuid(),
          user_id: emp.id,
          wallet_id: wallet.id,
          benefit_id: null,
          type: "credit",
          amount: 50,
          code: null,
          description: "Bonus navideño 2025",
          created_at: new Date(year, month, 20, 10, 0).toISOString(),
        });
      }
      bulkHistory.push({
        id: uuid(),
        date: new Date(year, month, 20, 10, 0).toISOString(),
        file: "bonus_navidad_2025.csv",
        users_count: employees.length,
        credits: 50,
        total: employees.length * 50,
        status: "completed",
        created_by: "Fermín C.",
        created_at: new Date(year, month, 20, 10, 0).toISOString(),
      });
    }

    // ── CANJES: distribuidos orgánicamente en el mes ──
    const numRedemptions = redemptionsPerMonth[mi];
    for (let r = 0; r < numRedemptions; r++) {
      const emp = pick(employees);
      const wallet = wallets.find(w => w.user_id === emp.id);
      if (!wallet) continue;

      const benefit = pick(activeBenefits);
      transactions.push({
        id: uuid(),
        user_id: emp.id,
        wallet_id: wallet.id,
        benefit_id: benefit.id,
        type: "debit",
        amount: benefit.cost,
        code: randomCode(emp.name),
        description: `Canje: ${benefit.name}`,
        created_at: randomDay(year, month, 2, maxDay),
      });
    }
  }

  // ── TRANSACCIONES RECIENTES de María García (últimos días, para la demo en perks-app) ──
  const maria = employees.find(e => e.name === "María García");
  const mariaWallet = wallets.find(w => w.user_id === maria?.id);
  if (maria && mariaWallet) {
    const recentCanjes = activeBenefits.slice(0, 3);
    for (let i = 0; i < recentCanjes.length; i++) {
      const b = recentCanjes[i];
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      date.setHours(12 + i, 30, 0);
      transactions.push({
        id: uuid(),
        user_id: maria.id,
        wallet_id: mariaWallet.id,
        benefit_id: b.id,
        type: "debit",
        amount: b.cost,
        code: randomCode(maria.name),
        description: `Canje: ${b.name}`,
        created_at: date.toISOString(),
      });
    }
    // Recent credits
    [
      { amount: 50, desc: "Bonus especial", hoursAgo: 2 },
      { amount: 10, desc: "Ajuste de créditos", hoursAgo: 3 },
      { amount: 10, desc: "Reconocimiento del equipo", hoursAgo: 48 },
    ].forEach(c => {
      const date = new Date();
      date.setHours(date.getHours() - c.hoursAgo);
      transactions.push({
        id: uuid(),
        user_id: maria.id,
        wallet_id: mariaWallet.id,
        benefit_id: null,
        type: "credit",
        amount: c.amount,
        code: null,
        description: c.desc,
        created_at: date.toISOString(),
      });
    });
  }

  // ── TRANSACCIONES RECIENTES de otros empleados ──
  const otherRecent = employees.filter(e => e.name !== "María García").slice(0, 4);
  for (const emp of otherRecent) {
    const wallet = wallets.find(w => w.user_id === emp.id);
    if (!wallet) continue;
    const benefit = pick(activeBenefits);
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    transactions.push({
      id: uuid(),
      user_id: emp.id,
      wallet_id: wallet.id,
      benefit_id: benefit.id,
      type: "debit",
      amount: benefit.cost,
      code: randomCode(emp.name),
      description: `Canje: ${benefit.name}`,
      created_at: date.toISOString(),
    });
  }

  // 4. Insert transactions in batches
  console.log(`📝 Insertando ${transactions.length} transacciones...`);
  let txInserted = 0;
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const { error } = await supabase.from("transactions").insert(batch);
    if (error) console.error(`❌ Error batch ${i}:`, error.message);
    else txInserted += batch.length;
  }
  console.log(`✅ ${txInserted} transacciones insertadas`);

  // 5. Insert bulk history
  console.log(`📦 Insertando ${bulkHistory.length} registros de carga masiva...`);
  const { error: bhError } = await supabase.from("bulk_history").insert(bulkHistory);
  if (bhError) console.error("❌ Error bulk_history:", bhError.message);
  else console.log(`✅ ${bulkHistory.length} registros creados`);

  // 6. Generate course completions
  console.log("📚 Generando completions de cursos...");
  const completions = [];
  for (const emp of employees) {
    const numCourses = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...courses].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
      const course = shuffled[i];
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      completions.push({
        id: uuid(),
        user_id: emp.id,
        course_id: course.id,
        credits_earned: course.credits_reward,
        created_at: date.toISOString(),
      });
    }
  }
  const { error: ccError } = await supabase.from("course_completions").insert(completions);
  if (ccError) console.error("❌ Error course_completions:", ccError.message);
  else console.log(`✅ ${completions.length} course completions creadas`);

  // 7. Update wallet balances
  console.log("\n💰 Actualizando balances de wallets...");
  const { data: allTx } = await supabase.from("transactions").select("*");
  for (const wallet of wallets) {
    const wxTxs = allTx.filter(t => t.wallet_id === wallet.id);
    const totalCredits = wxTxs.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
    const totalDebits = wxTxs.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);
    const balance = Math.round((totalCredits - totalDebits) * 100) / 100;

    await supabase.from("wallets").update({ balance: Math.max(balance, 0) }).eq("id", wallet.id);
    const user = users.find(u => u.id === wallet.user_id);
    console.log(`  ${(user?.name || "?").padEnd(20)} créditos: ${String(totalCredits).padStart(4)} | canjes: ${String(totalDebits).padStart(4)} | balance: ${Math.max(balance, 0)}`);
  }

  // 8. Summary
  const credits = allTx.filter(t => t.type === "credit");
  const debits = allTx.filter(t => t.type === "debit");
  console.log(`\n🎉 Seed completo!`);
  console.log(`   Transacciones totales: ${allTx.length} (${credits.length} créditos + ${debits.length} canjes)`);
  console.log(`   Course completions: ${completions.length}`);
  console.log(`   Bulk history: ${bulkHistory.length}`);
  console.log(`\n📊 Distribución de canjes por mes:`);
  months.forEach((m, i) => {
    const monthDebits = debits.filter(t => {
      const d = new Date(t.created_at);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    });
    console.log(`   ${m.name} ${m.year}: ${monthDebits.length} canjes`);
  });
}

seed().catch(console.error);
