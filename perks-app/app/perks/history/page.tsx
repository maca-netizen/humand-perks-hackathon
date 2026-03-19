"use client"

import { useState } from "react"
import Link from "next/link"
import { Coffee, ShoppingBag, Utensils, Ticket, CreditCard, QrCode, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const transactions = [
  {
    id: "1",
    type: "redemption",
    category: "food",
    description: "Almuerzo Gourmet",
    amount: 15,
    date: "Mar 18, 2026",
    merchant: "Cafe Central",
    status: "used",
  },
  {
    id: "2",
    type: "credit",
    category: "deposit",
    description: "Credito Mensual",
    amount: 100,
    date: "Mar 1, 2026",
    status: "completed",
  },
  {
    id: "3",
    type: "redemption",
    category: "wellness",
    description: "Clase de Yoga",
    amount: 25,
    date: "Feb 28, 2026",
    merchant: "Zen Studio",
    status: "active",
    code: "HP-0003-ABC123",
  },
  {
    id: "4",
    type: "redemption",
    category: "entertainment",
    description: "Cine para Dos",
    amount: 20,
    date: "Feb 25, 2026",
    merchant: "CinePlex",
    status: "used",
  },
  {
    id: "5",
    type: "credit",
    category: "deposit",
    description: "Bono de Bienvenida",
    amount: 50,
    date: "Feb 15, 2026",
    status: "completed",
  },
  {
    id: "6",
    type: "redemption",
    category: "shopping",
    description: "50 Creditos Shopping",
    amount: 40,
    date: "Feb 10, 2026",
    merchant: "MegaStore",
    status: "expired",
  },
]

const categoryConfig = {
  food: { icon: Utensils, color: "#F97316" },
  shopping: { icon: ShoppingBag, color: "#EC4899" },
  entertainment: { icon: Ticket, color: "#8B5CF6" },
  wellness: { icon: Coffee, color: "#22C55E" },
  deposit: { icon: CreditCard, color: "#3D5A80" },
}

type FilterType = "all" | "redemptions" | "credits"

export default function HistoryPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<FilterType>("all")

  const statusConfig = {
    active: { label: t("statusActive"), bg: "#F0FDF4", color: "#22C55E" },
    used: { label: t("statusUsed"), bg: "#F1F3F7", color: "#718096" },
    expired: { label: t("statusExpired"), bg: "#FEF2F2", color: "#EF4444" },
    completed: { label: t("statusCompleted"), bg: "#F0FDF4", color: "#22C55E" },
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true
    if (filter === "redemptions") return tx.type === "redemption"
    if (filter === "credits") return tx.type === "credit"
    return true
  })

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3">
        <Link href="/perks" className="p-1">
          <ChevronLeft className="h-6 w-6 text-[#2D3748]" />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#2D3748]">{t("history")}</h1>
      </header>

      <main className="max-w-lg mx-auto px-5 py-4 pb-28">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-5 -mx-5 px-5 overflow-x-auto scrollbar-hide">
          {([
            { id: "all", label: t("all_filter") },
            { id: "redemptions", label: t("redemptions") },
            { id: "credits", label: t("creditsFilter") }
          ] as { id: FilterType; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                filter === f.id
                  ? "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]"
                  : "bg-white border border-[#E8ECF1] text-[#2D3748]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E8ECF1]">
          {filteredTransactions.map((tx) => {
            const config = categoryConfig[tx.category as keyof typeof categoryConfig]
            const Icon = config.icon
            const status = statusConfig[tx.status as keyof typeof statusConfig]
            
            return (
              <div key={tx.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06)] flex items-center justify-center">
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-[14px] text-[#2D3748]">{tx.description}</h3>
                        <p className="text-[12px] text-[#718096]">
                          {tx.merchant && `${tx.merchant} · `}{tx.date}
                        </p>
                      </div>
                      <span 
                        className="text-[14px] font-semibold"
                        style={{ color: tx.type === "credit" ? "#22C55E" : "#2D3748" }}
                      >
                        {tx.type === "credit" ? "+" : "-"}{tx.amount} cr
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span 
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      
                      {tx.status === "active" && tx.code && (
                        <button className="flex items-center gap-1 text-[12px] font-medium text-[#3D5A80]">
                          <QrCode className="h-3.5 w-3.5" />
                          {t("viewCode")}
                        </button>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#CBD5E0] flex-shrink-0" />
                </div>
              </div>
            )
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#718096]">{t("noTransactionsFound")}</p>
          </div>
        )}
      </main>
    </div>
  )
}
