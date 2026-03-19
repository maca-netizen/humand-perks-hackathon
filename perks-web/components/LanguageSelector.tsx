"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelectLanguage = (lang: "en" | "es") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F3F7] transition-colors"
        title="Change language"
      >
        <Globe size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => handleSelectLanguage("en")}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100"
          >
            <span>English</span>
            {language === "en" && <Check size={16} className="text-green-500" />}
          </button>
          <button
            onClick={() => handleSelectLanguage("es")}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Español</span>
            {language === "es" && <Check size={16} className="text-green-500" />}
          </button>
        </div>
      )}
    </div>
  )
}
