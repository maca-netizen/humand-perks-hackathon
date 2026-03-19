"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Wallet, Clock, CreditCard, Check, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { getWallet, getBenefits, redeemBenefit } from "@/lib/supabase"

const categories = ["Todos", "Salud", "Educacion", "Bienestar", "Gastronomia", "Entretenimiento"]

type Benefit = { id: string; name: string; category: string; cost: number; image_url: string }
type Transaction = { id: string; description: string; amount: number; type: string; created_at: string; benefits?: { name: string } | null }
type Tab = "wallet" | "beneficios" | "historial"
type Screen = "tabs" | "confirm" | "success"

export default function PerksApp() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("wallet")
  const [screen, setScreen] = useState<Screen>("tabs")
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [balance, setBalance] = useState(0)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [voucherCode, setVoucherCode] = useState("")
  const [redeemResult, setRedeemResult] = useState<any>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const USER_ID = "b423f21e-9fa6-4046-906d-7e691e5e5cb6" // María García

  // Load data from Supabase
  useEffect(() => {
    async function load() {
      try {
        const walletData = await getWallet(USER_ID)
        setBalance(walletData.balance)
        setExpiresAt(walletData.expires_at)
        setTransactions(walletData.transactions)
        const benefitsData = await getBenefits()
        setBenefits(benefitsData)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const filteredBenefits = selectedCategory === "Todos"
    ? benefits
    : benefits.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase())

  const handleRedeem = (benefit: Benefit) => {
    setSelectedBenefit(benefit)
    setScreen("confirm")
  }

  const confirmRedeem = async () => {
    if (!selectedBenefit) return
    try {
      const result = await redeemBenefit(USER_ID, selectedBenefit.id)
      setBalance(result.remaining_balance)
      setVoucherCode(result.code)
      setRedeemResult(result)
      setScreen("success")
      // Refresh transactions
      const walletData = await getWallet(USER_ID)
      setTransactions(walletData.transactions)
    } catch (e: any) {
      alert(e.message === "INSUFFICIENT_BALANCE" ? "No tenés créditos suficientes" : "Error al canjear")
      setScreen("tabs")
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabItems: { key: Tab; label: string }[] = [
    { key: "wallet", label: "Mi Wallet" },
    { key: "beneficios", label: "Beneficios" },
    { key: "historial", label: "Historial" },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#F2F3F7] flex items-center justify-center">
      <div className="text-[#8E8E93] text-[15px]">Cargando...</div>
    </div>
  )

  // ===== STATUS BAR =====
  const StatusBar = () => (
    <div className="flex items-center justify-between px-5 pt-3 pb-1">
      <span className="text-[15px] font-semibold text-[#1A1A2E]">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1A1A2E"><rect x="0" y="5" width="3" height="6" rx="0.5" /><rect x="4.3" y="3.5" width="3" height="7.5" rx="0.5" /><rect x="8.6" y="1.5" width="3" height="9.5" rx="0.5" /><rect x="12.9" y="0" width="3" height="11" rx="0.5" /></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="#1A1A2E"><path d="M7.5 3.2C5.5 3.2 3.7 4 2.3 5.3L0.8 3.8C2.6 2 4.9 1 7.5 1C10.1 1 12.4 2 14.2 3.8L12.7 5.3C11.3 4 9.5 3.2 7.5 3.2ZM7.5 6C6.2 6 5 6.5 4.1 7.3L5.6 8.8C6.2 8.3 6.8 8 7.5 8C8.2 8 8.8 8.3 9.4 8.8L10.9 7.3C10 6.5 8.8 6 7.5 6Z" /><circle cx="7.5" cy="10.5" r="1.2" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#1A1A2E" strokeWidth="1" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#1A1A2E" /><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#1A1A2E" /></svg>
      </div>
    </div>
  )

  // ===== SUCCESS SCREEN =====
  if (screen === "success" && selectedBenefit) {
    return (
      <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
        <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col">
          <StatusBar />
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-[76px] h-[76px] rounded-full bg-[#34C759] flex items-center justify-center mb-5">
              <Check size={38} color="white" strokeWidth={3} />
            </div>

            <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-1 text-balance text-center">
              {"Beneficio activado!"}
            </h2>
            <p className="text-[15px] text-[#8E8E93] mb-8">{selectedBenefit.name}</p>

            <div className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
              <p className="text-[13px] text-[#8E8E93] mb-2">Codigo de voucher</p>
              <div className="flex items-center justify-between bg-[#F2F3F7] rounded-xl px-4 py-3 mb-5">
                <span className="text-[18px] font-mono font-bold text-[#1A1A2E] tracking-wider">{voucherCode}</span>
                <button onClick={handleCopyCode} className="text-[#4B5EAA] active:scale-90 transition-transform">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <div className="w-[160px] h-[160px] mx-auto bg-[#F2F3F7] rounded-xl flex items-center justify-center mb-5">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect x="10" y="10" width="28" height="28" rx="3" fill="#1A1A2E" />
                  <rect x="14" y="14" width="20" height="20" rx="2" fill="white" />
                  <rect x="19" y="19" width="10" height="10" fill="#1A1A2E" />
                  <rect x="82" y="10" width="28" height="28" rx="3" fill="#1A1A2E" />
                  <rect x="86" y="14" width="20" height="20" rx="2" fill="white" />
                  <rect x="91" y="19" width="10" height="10" fill="#1A1A2E" />
                  <rect x="10" y="82" width="28" height="28" rx="3" fill="#1A1A2E" />
                  <rect x="14" y="86" width="20" height="20" rx="2" fill="white" />
                  <rect x="19" y="91" width="10" height="10" fill="#1A1A2E" />
                  <rect x="48" y="10" width="7" height="7" fill="#1A1A2E" />
                  <rect x="60" y="10" width="7" height="7" fill="#1A1A2E" />
                  <rect x="48" y="22" width="7" height="7" fill="#1A1A2E" />
                  <rect x="60" y="22" width="7" height="7" fill="#1A1A2E" />
                  <rect x="48" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="60" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="10" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="22" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="34" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="82" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="94" y="48" width="7" height="7" fill="#1A1A2E" />
                  <rect x="82" y="82" width="7" height="7" fill="#1A1A2E" />
                  <rect x="94" y="94" width="7" height="7" fill="#1A1A2E" />
                  <rect x="106" y="82" width="7" height="7" fill="#1A1A2E" />
                  <rect x="82" y="106" width="7" height="7" fill="#1A1A2E" />
                  <rect x="106" y="106" width="7" height="7" fill="#1A1A2E" />
                </svg>
              </div>

              <div className="flex justify-between text-[13px]">
                <span className="text-[#8E8E93]">Vence</span>
                <span className="text-[#1A1A2E] font-medium">18 Abr 2026</span>
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#8E8E93]">Saldo restante</span>
                <span className="text-[18px] font-bold text-[#4B5EAA]">{balance} creditos</span>
              </div>
            </div>

            <button
              onClick={() => { setScreen("tabs"); setActiveTab("wallet"); }}
              className="w-full h-[50px] bg-[#4B5EAA] text-white rounded-2xl text-[16px] font-semibold active:scale-[0.98] transition-transform"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== CONFIRM MODAL =====
  const ConfirmModal = () => {
    if (screen !== "confirm" || !selectedBenefit) return null
    const canAfford = balance >= selectedBenefit.cost

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setScreen("tabs")} />
        <div className="relative w-full max-w-[420px] bg-white rounded-t-3xl px-6 pt-5 pb-8">
          <div className="w-10 h-1 bg-[#E5E5EA] rounded-full mx-auto mb-5" />
          <h3 className="text-[20px] font-bold text-[#1A1A2E] mb-1">Confirmar canje</h3>
          <p className="text-[14px] text-[#8E8E93] mb-5">
            {"Vas a canjear "}
            <span className="font-semibold text-[#1A1A2E]">{selectedBenefit.name}</span>
            {" por "}
            <span className="font-semibold text-[#1A1A2E]">{selectedBenefit.cost} creditos</span>.
          </p>

          <div className="bg-[#F2F3F7] rounded-2xl p-4 mb-5">
            <div className="flex justify-between mb-3">
              <span className="text-[14px] text-[#8E8E93]">Saldo actual</span>
              <span className="text-[14px] font-semibold text-[#1A1A2E]">{balance} creditos</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[14px] text-[#8E8E93]">Costo</span>
              <span className="text-[14px] font-semibold text-[#E8B230]">-{selectedBenefit.cost} creditos</span>
            </div>
            <div className="h-px bg-[#E5E5EA] my-2" />
            <div className="flex justify-between pt-1">
              <span className="text-[14px] text-[#8E8E93]">Saldo restante</span>
              <span className={`text-[15px] font-bold ${canAfford ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                {balance - selectedBenefit.cost} creditos
              </span>
            </div>
          </div>

          {!canAfford && (
            <p className="text-[13px] text-[#FF3B30] mb-4 text-center">No tenes creditos suficientes.</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setScreen("tabs")}
              className="flex-1 h-[50px] border-2 border-[#E5E5EA] rounded-2xl text-[15px] font-semibold text-[#1A1A2E] active:bg-[#F2F3F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmRedeem}
              disabled={!canAfford}
              className="flex-1 h-[50px] bg-[#4B5EAA] text-white rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== MAIN LAYOUT =====
  return (
    <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col">
        {/* Header */}
        <div className="bg-white">
          <StatusBar />
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.push("/")} className="p-1 -ml-1 active:scale-90 transition-transform">
              <ChevronLeft size={24} color="#4B5EAA" />
            </button>
            <h1 className="text-[17px] font-semibold text-[#1A1A2E]">Perks</h1>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[#E5E5EA]">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 pb-3 pt-1 text-center relative"
              >
                <span
                  className="text-[14px]"
                  style={{
                    color: activeTab === tab.key ? "#4B5EAA" : "#8E8E93",
                    fontWeight: activeTab === tab.key ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-[#4B5EAA] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ===== MI WALLET ===== */}
          {activeTab === "wallet" && (
            <div className="px-4 py-5 flex flex-col gap-4">
              {/* Balance card */}
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-[#EDEDFC] flex items-center justify-center shrink-0">
                    <Wallet size={24} color="#4B5EAA" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#8E8E93] mb-0.5">Mi saldo</p>
                    <p className="text-[30px] font-bold text-[#1A1A2E] leading-none tracking-tight">{balance}.00</p>
                  </div>
                  <div className="bg-[#F2F3F7] rounded-full px-3 py-1.5 shrink-0">
                    <span className="text-[12px] font-semibold text-[#4B5EAA]">Creditos: {balance}</span>
                  </div>
                </div>
              </div>

              {/* Expiry banner */}
              {expiresAt && (
                <div className="bg-[#FFF5E0] rounded-2xl p-4 flex items-center gap-3 border border-[#E8B230]/20">
                  <div className="w-9 h-9 rounded-xl bg-[#E8B230]/20 flex items-center justify-center shrink-0">
                    <Clock size={18} color="#E8B230" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1A1A2E]">Tus creditos vencen el {new Date(expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                    <p className="text-[11px] text-[#8E8E93]">Usalos antes de que expiren</p>
                  </div>
                </div>
              )}

              {/* Available benefits CTA */}
              <button
                onClick={() => balance > 0 ? setActiveTab("beneficios") : null}
                className={`bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4 border active:bg-[#FAFAFA] transition-colors text-left ${balance > 0 ? 'border-[#E8B230]/30' : 'border-[#E5E5EA]'}`}
              >
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-[#1A1A2E]">{balance > 0 ? 'Beneficios disponibles' : 'Sin creditos disponibles'}</p>
                  <p className="text-[13px] text-[#8E8E93] mt-0.5">{balance > 0 ? 'Tenes creditos para usar' : 'Completa cursos para ganar creditos'}</p>
                </div>
                <ChevronRight size={20} color="#E8B230" />
              </button>

              {/* Transactions */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-3 px-1">Ultimos movimientos</h3>
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#F2F3F7]">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === "credit" ? "bg-[#E8F8ED]" : "bg-[#FFF5E0]"
                        }`}>
                          {tx.type === "credit"
                            ? <CreditCard size={16} color="#34C759" />
                            : <Clock size={16} color="#E8B230" />
                          }
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A2E]">{tx.description}</p>
                          <p className="text-[12px] text-[#8E8E93]">{new Date(tx.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`text-[15px] font-semibold shrink-0 ${
                        tx.type === "credit" ? "text-[#34C759]" : "text-[#1A1A2E]"
                      }`}>
                        {tx.type === "credit" ? "+" : "-"}{tx.amount} cr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== BENEFICIOS ===== */}
          {activeTab === "beneficios" && (
            <div className="py-4">
              {/* Category pills - horizontal scroll */}
              <div className="flex gap-2 px-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="shrink-0 px-4 py-[9px] rounded-full text-[13px] font-medium transition-all"
                    style={{
                      backgroundColor: selectedCategory === cat ? "#4B5EAA" : "white",
                      color: selectedCategory === cat ? "white" : "#1A1A2E",
                      boxShadow: selectedCategory !== cat ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-3 px-4">
                {filteredBenefits.map((benefit) => (
                  <div key={benefit.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="h-[100px] overflow-hidden">
                      <img
                        src={benefit.image_url}
                        alt={benefit.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <p className="text-[14px] font-semibold text-[#1A1A2E]">{benefit.name}</p>
                      <span className="inline-block self-start bg-[#EDEDFC] text-[#4B5EAA] text-[12px] font-semibold px-2.5 py-1 rounded-full">
                        {benefit.cost} creditos
                      </span>
                      <button
                        onClick={() => handleRedeem(benefit)}
                        disabled={balance < benefit.cost}
                        className="w-full h-[36px] bg-[#E8B230] text-white rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all disabled:opacity-40"
                      >
                        Canjear
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== HISTORIAL ===== */}
          {activeTab === "historial" && (
            <div className="px-4 py-5">
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#F2F3F7]">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "credit" ? "bg-[#E8F8ED]" : "bg-[#FFF5E0]"
                      }`}>
                        {tx.type === "credit"
                          ? <CreditCard size={16} color="#34C759" />
                          : <Clock size={16} color="#E8B230" />
                        }
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1A1A2E]">{tx.description}</p>
                        <p className="text-[12px] text-[#8E8E93]">{new Date(tx.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`text-[15px] font-semibold shrink-0 ${
                      tx.type === "credit" ? "text-[#34C759]" : "text-[#1A1A2E]"
                    }`}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount} cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal />
    </div>
  )
}
