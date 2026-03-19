"use client"

import { useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Clock, Check, Copy, Download, Utensils, Dumbbell, Ticket, ShoppingBag } from "lucide-react"
import { QRCode } from "@/components/qr-code"
import { getPerkById } from "@/lib/perks-data"
import Link from "next/link"

const categoryConfig = {
  food: { icon: Utensils, color: "#F97316", bgLight: "#FFF7ED", label: "Comida" },
  wellness: { icon: Dumbbell, color: "#22C55E", bgLight: "#F0FDF4", label: "Bienestar" },
  entertainment: { icon: Ticket, color: "#8B5CF6", bgLight: "#FAF5FF", label: "Entretenimiento" },
  shopping: { icon: ShoppingBag, color: "#EC4899", bgLight: "#FDF2F8", label: "Shopping" },
}

export default function RedeemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isRedeemed, setIsRedeemed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  const perk = getPerkById(id)
  
  if (!perk) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-[#718096]">Beneficio no encontrado</p>
      </div>
    )
  }

  const config = categoryConfig[perk.category]
  const Icon = config.icon
  const redemptionCode = `HP-${perk.id.padStart(4, "0")}-${Date.now().toString(36).toUpperCase()}`
  const discount = perk.originalValue 
    ? Math.round((1 - perk.price / perk.originalValue) * 100) 
    : 0

  const handleRedeem = () => {
    setIsRedeemed(true)
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(redemptionCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3">
        <Link href="/perks/catalog" className="p-1">
          <ChevronLeft className="h-6 w-6 text-[#2D3748]" />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#2D3748]">Detalle</h1>
      </header>
      
      <main className="max-w-lg mx-auto px-5 py-5 pb-28">
        {!isRedeemed ? (
          /* Pre-Redemption View */
          <>
            {/* Perk Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: config.bgLight }}
              >
                <Icon className="h-12 w-12" style={{ color: config.color }} />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span 
                  className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: config.bgLight, color: config.color }}
                >
                  {config.label}
                </span>
                {discount > 0 && (
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
                    -{discount}%
                  </span>
                )}
              </div>

              <h1 className="text-[22px] font-bold text-[#2D3748] mb-1">{perk.name}</h1>
              <p className="text-[#718096]">{perk.merchant}</p>

              {perk.location && (
                <div className="flex items-center justify-center gap-1 text-[13px] text-[#718096] mt-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {perk.location}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 mb-4">
              <h3 className="font-semibold text-[#2D3748] mb-2 text-[15px]">Sobre este beneficio</h3>
              <p className="text-[14px] text-[#718096] leading-relaxed">
                {perk.description}
              </p>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 mb-6">
              <h3 className="font-semibold text-[#2D3748] mb-3 text-[15px]">Condiciones</h3>
              <ul className="text-[14px] text-[#718096] space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0 text-[#3D5A80]" />
                  Valido por 30 dias despues del canje
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#3D5A80]" />
                  Un solo uso
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#3D5A80]" />
                  No combinable con otras ofertas
                </li>
              </ul>
            </div>

            {/* Price & Redeem */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[12px] text-[#718096] mb-0.5">Precio</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-bold text-[#2D3748]">{perk.price} <span className="text-[14px] font-medium">creditos</span></span>
                    {perk.originalValue && (
                      <span className="text-[14px] text-[#A0AEC0] line-through">
                        {perk.originalValue} cr
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#718096] mb-0.5">Tu saldo</p>
                  <span className="text-[18px] font-semibold text-[#22C55E]">245 cr</span>
                </div>
              </div>
              <button 
                className="w-full bg-[#3D5A80] hover:bg-[#2C4A6E] text-white h-12 rounded-xl text-[15px] font-semibold transition-colors" 
                onClick={handleRedeem}
              >
                Canjear por {perk.price} creditos
              </button>
            </div>
          </>
        ) : (
          /* Post-Redemption View - QR Code */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-[#22C55E]" />
            </div>
            
            <h1 className="text-[22px] font-bold text-[#2D3748] mb-2">
              Beneficio canjeado
            </h1>
            <p className="text-[#718096] mb-8">
              Mostra este QR o codigo al comercio
            </p>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-6">
              <div className="bg-white p-4 rounded-xl inline-block mb-4 border border-[#E8ECF1]">
                <QRCode value={redemptionCode} size={180} />
              </div>
              
              <div className="space-y-2">
                <p className="text-[12px] text-[#718096]">Codigo de canje</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-[15px] font-mono font-semibold tracking-wider text-[#2D3748]">
                    {redemptionCode}
                  </code>
                  <button 
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7]"
                    onClick={handleCopyCode}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-[#22C55E]" />
                    ) : (
                      <Copy className="h-4 w-4 text-[#718096]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Perk Details Summary */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 mb-6 text-left">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: config.bgLight }}
                >
                  <Icon className="h-6 w-6" style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2D3748]">{perk.name}</h3>
                  <p className="text-[13px] text-[#718096]">{perk.merchant}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8ECF1] flex items-center justify-between text-[14px]">
                <span className="text-[#718096]">Valido hasta</span>
                <span className="font-medium text-[#2D3748]">17 Abril, 2026</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 h-12 rounded-xl border border-[#E8ECF1] bg-white text-[#2D3748] font-medium flex items-center justify-center gap-2 hover:bg-[#F8F9FB]">
                <Download className="h-4 w-4" />
                Guardar
              </button>
              <button 
                className="flex-1 h-12 rounded-xl bg-[#3D5A80] hover:bg-[#2C4A6E] text-white font-medium transition-colors"
                onClick={() => router.push("/perks")}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
