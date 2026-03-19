"use client"

import Link from "next/link"
import { Utensils, Dumbbell, Ticket, ShoppingBag } from "lucide-react"

export interface Perk {
  id: string
  name: string
  merchant: string
  category: "food" | "wellness" | "entertainment" | "shopping"
  price: number
  originalValue?: number
  description: string
  location?: string
  featured?: boolean
  imageUrl?: string
}

const categoryConfig = {
  food: { icon: Utensils, color: "#F97316" },
  wellness: { icon: Dumbbell, color: "#22C55E" },
  entertainment: { icon: Ticket, color: "#8B5CF6" },
  shopping: { icon: ShoppingBag, color: "#EC4899" },
}

interface PerkCardProps {
  perk: Perk
}

export function PerkCard({ perk }: PerkCardProps) {
  const config = categoryConfig[perk.category]
  const Icon = config.icon
  const discount = perk.originalValue 
    ? Math.round((1 - perk.price / perk.originalValue) * 100) 
    : 0

  return (
    <Link href={`/perks/redeem/${perk.id}`}>
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Icon Section */}
        <div className="aspect-square flex items-center justify-center p-6 relative bg-[#FAFBFC]">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center">
            <Icon className="h-8 w-8" style={{ color: config.color }} />
          </div>
          {discount > 0 && (
            <span className="absolute top-3 right-3 text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 text-center">
          <h3 className="font-semibold text-[14px] text-[#2D3748] mb-0.5 line-clamp-1">{perk.name}</h3>
          <p className="text-[12px] text-[#718096] mb-2">{perk.merchant}</p>
          
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[16px] font-bold text-[#3D5A80]">{perk.price} <span className="text-[12px] font-medium">cr</span></span>
            {perk.originalValue && (
              <span className="text-[12px] text-[#A0AEC0] line-through">
                {perk.originalValue} cr
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
