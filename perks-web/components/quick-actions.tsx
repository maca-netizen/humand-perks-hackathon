"use client"

import Link from "next/link"
import { Gift, Coffee, Utensils, Ticket, ShoppingBag, Dumbbell } from "lucide-react"

const categories = [
  { name: "Food", icon: Utensils, iconColor: "#F97316", href: "/perks/catalog?category=food" },
  { name: "Wellness", icon: Dumbbell, iconColor: "#22C55E", href: "/perks/catalog?category=wellness" },
  { name: "Entertainment", icon: Ticket, iconColor: "#8B5CF6", href: "/perks/catalog?category=entertainment" },
  { name: "Shopping", icon: ShoppingBag, iconColor: "#EC4899", href: "/perks/catalog?category=shopping" },
  { name: "Coffee", icon: Coffee, iconColor: "#D97706", href: "/perks/catalog?category=coffee" },
  { name: "Todos", icon: Gift, iconColor: "#3D5A80", href: "/perks/catalog" },
]

export function QuickActions() {
  return (
    <div className="py-2">
      <h3 className="text-[15px] font-semibold text-[#2D3748] mb-4">Categorias</h3>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-[72px] h-[72px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <cat.icon className="h-7 w-7" style={{ color: cat.iconColor }} />
            </div>
            <span className="text-[12px] font-medium text-[#2D3748]">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
