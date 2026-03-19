"use client"

import Link from "next/link"
import { TrendingUp, ChevronRight } from "lucide-react"

interface BalanceCardProps {
  balance: number
  monthlyAllowance: number
  expiresIn: number
}

export function BalanceCard({ balance, monthlyAllowance, expiresIn }: BalanceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Main Balance Section */}
      <div className="p-5 pb-4">
        <p className="text-[13px] text-[#718096] mb-1">Saldo disponible</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[38px] font-bold tracking-tight text-[#2D3748] leading-none">
            {balance.toLocaleString()}
          </span>
          <span className="text-base text-[#718096] font-medium">creditos</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 pb-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full">
          <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
          <span className="text-[12px] font-medium text-[#22C55E]">
            +{monthlyAllowance} este mes
          </span>
        </div>
        <span className="text-[12px] text-[#718096]">
          Vence en {expiresIn} dias
        </span>
      </div>

      {/* Action Link */}
      <Link 
        href="/perks/catalog"
        className="flex items-center justify-between px-5 py-3.5 bg-[#FEF3C7] hover:bg-[#FDE68A] transition-colors"
      >
        <span className="text-[14px] font-semibold text-[#92400E]">Explorar beneficios</span>
        <ChevronRight className="h-4 w-4 text-[#92400E]" />
      </Link>
    </div>
  )
}
