"use client"

import { Coffee, ShoppingBag, Utensils, Ticket, CreditCard, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface Transaction {
  id: string
  type: "debit" | "credit"
  category: "food" | "shopping" | "entertainment" | "wellness" | "deposit"
  description: string
  amount: number
  date: string
  merchant?: string
}

const categoryConfig = {
  food: { icon: Utensils, color: "#F97316" },
  shopping: { icon: ShoppingBag, color: "#EC4899" },
  entertainment: { icon: Ticket, color: "#8B5CF6" },
  wellness: { icon: Coffee, color: "#22C55E" },
  deposit: { icon: CreditCard, color: "#3D5A80" },
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8ECF1]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#2D3748]">Actividad reciente</h3>
          <Link href="/perks/history" className="text-[13px] text-[#3D5A80] font-medium">
            Ver todo
          </Link>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-[#E8ECF1]">
        {transactions.map((tx) => {
          const config = categoryConfig[tx.category]
          const Icon = config.icon
          
          return (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
              <div 
                className="w-10 h-10 rounded-xl bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] flex items-center justify-center"
              >
                <Icon className="h-5 w-5" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#2D3748] truncate">{tx.description}</p>
                <p className="text-[12px] text-[#718096]">
                  {tx.merchant && `${tx.merchant} · `}{tx.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[14px] font-semibold"
                  style={{ color: tx.type === "credit" ? "#22C55E" : "#2D3748" }}
                >
                  {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString()} cr
                </span>
                <ChevronRight className="h-4 w-4 text-[#CBD5E0]" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
