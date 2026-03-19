"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("humand-lang") as Language | null
    if (saved && (saved === "en" || saved === "es")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("humand-lang", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

const translations = {
  en: {
    // Bottom nav & app grid
    apps: "Apps",
    home: "Home",
    chats: "Chats",
    recommendations: "Reco...",
    profile: "Profile",
    formsAndTasks: "Forms & Tasks",
    people: "People",
    timeControl: "Time control",
    orgChart: "Org Chart",
    files: "Files",
    onboarding: "Onboarding",
    surveys: "Surveys",
    sportsForecast: "Sport Forecasts",
    marketplace: "Marketplace",
    timeOff: "Time off",
    performanceReview: "Performance Review",
    agentWorkspace: "Agent workspace",
    perks: "Perks",
    learning: "Learning",
    goals: "Goals",
    // Perks inner pages — tabs
    myWallet: "My Wallet",
    benefits: "Benefits",
    history: "History",
    // Perks — wallet tab
    loading: "Loading...",
    myBalance: "My balance",
    creditsExpire: "Your credits expire on",
    useBeforeExpiry: "Use them before they expire",
    benefitsAvailable: "Available benefits",
    noCreditsAvailable: "No credits available",
    youHaveCredits: "You have credits to use",
    completeCoursesForCredits: "Complete courses to earn credits",
    recentMovements: "Recent activity",
    credits: "credits",
    // Perks — benefits tab
    redeem: "Redeem",
    // Perks — confirm modal
    confirmRedemption: "Confirm redemption",
    aboutToRedeem: "You are about to redeem",
    forCredits: "for",
    currentBalance: "Current balance",
    cost: "Cost",
    remainingBalance: "Remaining balance",
    insufficientCredits: "You don't have enough credits.",
    cancel: "Cancel",
    confirm: "Confirm",
    // Perks — success screen
    benefitActivated: "Benefit activated!",
    voucherCode: "Voucher code",
    expires: "Expires",
    back: "Back",
    // Catalog page
    searchBenefits: "Search benefits...",
    noBenefitsFound: "No benefits found.",
    // Category names
    all: "All",
    food: "Food",
    health: "Health",
    education: "Education",
    wellness: "Wellness",
    gastronomy: "Gastronomy",
    entertainment: "Entertainment",
    shopping: "Shopping",
    // History page
    all_filter: "All",
    redemptions: "Redemptions",
    creditsFilter: "Credits",
    statusActive: "Active",
    statusUsed: "Used",
    statusExpired: "Expired",
    statusCompleted: "Completed",
    noTransactionsFound: "No transactions found.",
    viewCode: "View code",
    // Redeem detail page
    detail: "Detail",
    aboutThisBenefit: "About this benefit",
    terms: "Terms",
    validFor30Days: "Valid for 30 days after redemption",
    singleUse: "Single use",
    notCombinableWithOtherOffers: "Not combinable with other offers",
    price: "Price",
    yourBalance: "Your balance",
    redeemFor: "Redeem for",
    benefitRedeemed: "Benefit redeemed",
    showQROrCode: "Show this QR or code to the merchant",
    redemptionCode: "Redemption code",
    validUntil: "Valid until",
    save: "Save",
    backToHome: "Back to home",
  },
  es: {
    // Bottom nav & app grid
    apps: "Apps",
    home: "Inicio",
    chats: "Chats",
    recommendations: "Reco...",
    profile: "Perfil",
    formsAndTasks: "Formularios y Tareas",
    people: "Personas",
    timeControl: "Control de tiempo",
    orgChart: "Organigrama",
    files: "Archivos",
    onboarding: "Onboarding",
    surveys: "Encuestas",
    sportsForecast: "Pronosticos deportivos",
    marketplace: "Marketplace",
    timeOff: "Tiempo libre",
    performanceReview: "Evaluación de desempeño",
    agentWorkspace: "Espacio de agente",
    perks: "Perks",
    learning: "Aprendizaje",
    goals: "Objetivos",
    // Perks inner pages — tabs
    myWallet: "Mi Wallet",
    benefits: "Beneficios",
    history: "Historial",
    // Perks — wallet tab
    loading: "Cargando...",
    myBalance: "Mi saldo",
    creditsExpire: "Tus créditos vencen el",
    useBeforeExpiry: "Usalos antes de que expiren",
    benefitsAvailable: "Beneficios disponibles",
    noCreditsAvailable: "Sin créditos disponibles",
    youHaveCredits: "Tenés créditos para usar",
    completeCoursesForCredits: "Completá cursos para ganar créditos",
    recentMovements: "Últimos movimientos",
    credits: "créditos",
    // Perks — benefits tab
    redeem: "Canjear",
    // Perks — confirm modal
    confirmRedemption: "Confirmar canje",
    aboutToRedeem: "Vas a canjear",
    forCredits: "por",
    currentBalance: "Saldo actual",
    cost: "Costo",
    remainingBalance: "Saldo restante",
    insufficientCredits: "No tenés créditos suficientes.",
    cancel: "Cancelar",
    confirm: "Confirmar",
    // Perks — success screen
    benefitActivated: "¡Beneficio activado!",
    voucherCode: "Código de voucher",
    expires: "Vence",
    back: "Volver",
    // Catalog page
    searchBenefits: "Buscar beneficios...",
    noBenefitsFound: "No se encontraron beneficios.",
    // Category names
    all: "Todos",
    food: "Comida",
    health: "Salud",
    education: "Educación",
    wellness: "Bienestar",
    gastronomy: "Gastronomía",
    entertainment: "Entretenimiento",
    shopping: "Shopping",
    // History page
    all_filter: "Todos",
    redemptions: "Canjes",
    creditsFilter: "Créditos",
    statusActive: "Activo",
    statusUsed: "Usado",
    statusExpired: "Vencido",
    statusCompleted: "Completado",
    noTransactionsFound: "No se encontraron transacciones.",
    viewCode: "Ver código",
    // Redeem detail page
    detail: "Detalle",
    aboutThisBenefit: "Sobre este beneficio",
    terms: "Condiciones",
    validFor30Days: "Válido por 30 días después del canje",
    singleUse: "Un solo uso",
    notCombinableWithOtherOffers: "No combinable con otras ofertas",
    price: "Precio",
    yourBalance: "Tu saldo",
    redeemFor: "Canjear por",
    benefitRedeemed: "Beneficio canjeado",
    showQROrCode: "Mostrá este QR o código al comercio",
    redemptionCode: "Código de canje",
    validUntil: "Válido hasta",
    save: "Guardar",
    backToHome: "Volver al inicio",
  },
}
