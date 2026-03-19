"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ChevronLeft } from "lucide-react"
import { PerkCard } from "@/components/perk-card"
import { perks } from "@/lib/perks-data"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

function CatalogContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "all"

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", name: t("all") },
    { id: "food", name: t("food") },
    { id: "wellness", name: t("wellness") },
    { id: "entertainment", name: t("entertainment") },
    { id: "shopping", name: t("shopping") },
  ]

  const filteredPerks = perks.filter(perk => {
    const matchesCategory = selectedCategory === "all" || perk.category === selectedCategory
    const matchesSearch = searchQuery === "" ||
      perk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perk.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3">
        <Link href="/perks" className="p-1">
          <ChevronLeft className="h-6 w-6 text-[#2D3748]" />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#2D3748]">{t("benefits")}</h1>
      </header>

      <main className="max-w-lg mx-auto px-5 py-4 pb-28">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096]" />
          <input
            type="text"
            placeholder={t("searchBenefits")}
            className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl text-[14px] text-[#2D3748] placeholder:text-[#A0AEC0] border border-[#E8ECF1] focus:outline-none focus:border-[#3D5A80]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]"
                  : "bg-white border border-[#E8ECF1] text-[#2D3748]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredPerks.map((perk) => (
            <PerkCard key={perk.id} perk={perk} />
          ))}
        </div>

        {filteredPerks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#718096]">{t("noBenefitsFound")}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogContent />
    </Suspense>
  )
}
