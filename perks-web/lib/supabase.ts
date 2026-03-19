import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://robojpthadyiwcaryywi.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYm9qcHRoYWR5aXdjYXJ5eXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjU0MTAsImV4cCI6MjA4OTQ0MTQxMH0.wqE-A2wF9f6-ZF0WVpul3DNADVutXLrAhYPUd4hz75M'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ═══════════════════════════════════════════
// API HELPERS — Shared across all 3 apps
// ═══════════════════════════════════════════

export async function getWallet(userId: string) {
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, benefits(name, image_url)')
    .eq('wallet_id', wallet?.id)
    .order('created_at', { ascending: false })

  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()

  return {
    wallet_id: wallet?.id,
    user_name: user?.name,
    balance: wallet?.balance || 0,
    currency: wallet?.currency || 'USD',
    expires_at: wallet?.expires_at || null,
    transactions: transactions || [],
  }
}

export async function getBenefits(category?: string) {
  let query = supabase.from('benefits').select('*').eq('active', true)
  if (category && category !== 'all' && category !== 'Todos') {
    query = query.eq('category', category.toLowerCase())
  }
  const { data } = await query
  return data || []
}

export async function redeemBenefit(userId: string, benefitId: string) {
  // Get wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get benefit
  const { data: benefit } = await supabase
    .from('benefits')
    .select('*')
    .eq('id', benefitId)
    .single()

  if (!wallet || !benefit) throw new Error('NOT_FOUND')
  if (wallet.balance < benefit.cost) throw new Error('INSUFFICIENT_BALANCE')

  // Debit wallet
  const newBalance = Math.round((wallet.balance - benefit.cost) * 100) / 100
  await supabase
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', wallet.id)

  // Generate code
  const prefix = benefit.name.split(' ')[0].toUpperCase().slice(0, 4)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const code = `PERKS-${prefix}-${random}`

  // Create transaction
  const txnId = `tx_${Math.random().toString(36).substring(2, 10)}`
  await supabase.from('transactions').insert({
    id: txnId,
    wallet_id: wallet.id,
    benefit_id: benefit.id,
    type: 'debit',
    amount: benefit.cost,
    code,
    description: `Canje: ${benefit.name}`,
  })

  const expires = new Date()
  expires.setDate(expires.getDate() + 30)

  return {
    transaction_id: txnId,
    code,
    benefit_name: benefit.name,
    benefit_image: benefit.image_url,
    amount_debited: benefit.cost,
    remaining_balance: newBalance,
    expires_at: expires.toISOString(),
  }
}

export async function loadCredits(adminId: string, userIds: string[], amount: number, description: string) {
  const results = []
  for (const uid of userIds) {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (!wallet) continue

    const newBalance = Math.round((wallet.balance + amount) * 100) / 100
    await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id)

    const txnId = `tx_${Math.random().toString(36).substring(2, 10)}`
    await supabase.from('transactions').insert({
      id: txnId,
      wallet_id: wallet.id,
      type: 'credit',
      amount,
      description: description || 'Carga de creditos',
    })

    results.push({ user_id: uid, transaction_id: txnId, new_balance: newBalance })
  }
  return { credited_count: results.length, total_amount: results.length * amount, transactions: results }
}

export async function getDashboard() {
  const { data: transactions } = await supabase.from('transactions').select('*')
  const credits = (transactions || []).filter(t => t.type === 'credit')
  const debits = (transactions || []).filter(t => t.type === 'debit')

  const totalCredited = credits.reduce((s, t) => s + Number(t.amount), 0)
  const totalRedeemed = debits.reduce((s, t) => s + Number(t.amount), 0)
  const totalPending = Math.round((totalCredited - totalRedeemed) * 100) / 100

  const { data: wallets } = await supabase.from('wallets').select('id')
  const { data: users } = await supabase.from('users').select('id').eq('role', 'employee')

  // Top benefits
  const benefitCounts: Record<string, number> = {}
  debits.forEach(t => { if (t.benefit_id) benefitCounts[t.benefit_id] = (benefitCounts[t.benefit_id] || 0) + 1 })
  const { data: benefits } = await supabase.from('benefits').select('id, name')
  const topBenefits = Object.entries(benefitCounts)
    .map(([id, count]) => ({ id, name: benefits?.find(b => b.id === id)?.name || 'Unknown', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    total_credited: Math.round(totalCredited * 100) / 100,
    total_redeemed: Math.round(totalRedeemed * 100) / 100,
    total_pending: totalPending,
    redemption_rate: totalCredited > 0 ? Math.round((totalRedeemed / totalCredited) * 100) / 100 : 0,
    active_wallets: wallets?.length || 0,
    total_employees: users?.length || 0,
    total_transactions: (transactions || []).length,
    top_benefits: topBenefits,
    estimated_float_yield_annual: Math.round(totalPending * 0.06 * 100) / 100,
    estimated_breakage_annual: Math.round(totalCredited * 0.12 * 100) / 100,
  }
}

export async function getUsers(role?: string) {
  let query = supabase.from('users').select('*, wallets(balance)')
  if (role) query = query.eq('role', role)
  const { data } = await query
  return (data || []).map(u => ({
    ...u,
    balance: u.wallets?.[0]?.balance || 0,
    wallets: undefined,
  }))
}

export async function getAutoRules() {
  const { data } = await supabase.from('auto_rules').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getBulkHistory() {
  const { data } = await supabase.from('bulk_history').select('*').order('date', { ascending: false })
  return data || []
}

export async function getCourses() {
  const { data } = await supabase.from('courses').select('*').eq('active', true)
  return data || []
}

export async function getCourseById(courseId: string) {
  const { data } = await supabase.from('courses').select('*').eq('id', courseId).single()
  return data
}

export async function getUserCompletions(userId: string) {
  const { data } = await supabase.from('course_completions').select('course_id').eq('user_id', userId)
  return (data || []).map(c => c.course_id)
}

export async function completeCourse(userId: string, courseId: string) {
  // Get course to know reward
  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (!course) throw new Error('COURSE_NOT_FOUND')

  // Check if already completed
  const { data: existing } = await supabase.from('course_completions').select('id').eq('user_id', userId).eq('course_id', courseId).single()
  if (existing) throw new Error('ALREADY_COMPLETED')

  // Mark as completed
  await supabase.from('course_completions').insert({
    user_id: userId,
    course_id: courseId,
    credits_earned: course.credits_reward,
  })

  // Credit the wallet
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single()
  if (wallet) {
    const newBalance = Math.round((wallet.balance + Number(course.credits_reward)) * 100) / 100
    await supabase.from('wallets').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', wallet.id)
    await supabase.from('transactions').insert({
      id: `tx_${Math.random().toString(36).substring(2, 10)}`,
      wallet_id: wallet.id,
      type: 'credit',
      amount: course.credits_reward,
      description: `Curso completado: ${course.title}`,
    })
    return { credits_earned: course.credits_reward, new_balance: newBalance, course_title: course.title }
  }
  throw new Error('WALLET_NOT_FOUND')
}

export async function resetDemo() {
  // Reset wallets to $20
  await supabase.from('wallets').update({ balance: 20, updated_at: new Date().toISOString() }).neq('id', '')
  // Delete non-seed transactions
  await supabase.from('transactions').delete().not('id', 'like', 'tx_seed%')
  return { message: 'Demo reset complete' }
}
