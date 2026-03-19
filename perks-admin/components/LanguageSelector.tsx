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

  const tokens = {
    colors: {
      neutral: { 50: "#f5f6f8", 100: "#eeeef1", 200: "#dfe0e6", 600: "#8d8c9f" },
      humand: { 500: "#496be3" },
    },
    semantic: {
      bgCard: "#ffffff",
      border: "#dfe0e6",
      textDefault: "#303036",
      textLighter: "#636271",
    },
    shadow: {
      dp8: "-1px 8px 16px 0px rgba(170,170,186,0.45)",
    },
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.colors.neutral[100],
          border: `1px solid ${tokens.semantic.border}`,
          cursor: "pointer",
          color: tokens.colors.neutral[600],
          transition: "all 0.2s",
        }}
        title="Change language"
      >
        <Globe size={18} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "160px",
            backgroundColor: tokens.semantic.bgCard,
            borderRadius: "8px",
            border: `1px solid ${tokens.semantic.border}`,
            boxShadow: tokens.shadow.dp8,
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => handleSelectLanguage("en")}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              fontSize: "13px",
              fontWeight: 500,
              color: tokens.semantic.textDefault,
              backgroundColor: "transparent",
              border: "none",
              borderBottom: `1px solid ${tokens.semantic.border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = tokens.colors.neutral[100]
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "transparent"
            }}
          >
            <span>English</span>
            {language === "en" && <Check size={14} color="#34C759" />}
          </button>
          <button
            onClick={() => handleSelectLanguage("es")}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              fontSize: "13px",
              fontWeight: 500,
              color: tokens.semantic.textDefault,
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = tokens.colors.neutral[100]
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "transparent"
            }}
          >
            <span>Español</span>
            {language === "es" && <Check size={14} color="#34C759" />}
          </button>
        </div>
      )}
    </div>
  )
}
