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
    // Read from localStorage on mount
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
    feed: "Feed",
    groups: "Groups",
    magazine: "Magazine",
    chats: "Chats",
    knowledgeLibraries: "Knowledge libraries",
    events: "Events",
    kudos: "Kudos",
    formsAndTasks: "Forms and Tasks",
    people: "People",
    learning: "Learning",
    onboarding: "Onboarding",
    benefits: "Benefits",
    addPeople: "Add People",
    writeSomething: "Write something...",
    post: "Post",
    search: "Search",
    seeMore: "See more",
    allOrg: "All the organization",
    reach: "Reach",
    celebrations: "Celebrations",
    allCelebrations: "All celebrations",
    anniversaries: "Anniversaries",
    birthdays: "Birthdays",
    noCelebrations: "There are no celebrations on this date",
    quickLinks: "Quick links",
    myWallet: "My Wallet",
    benefitsTab: "Benefits",
    history: "History",
    myBalance: "My balance",
    availableCredits: "available credits",
    creditsExpire: "Your credits expire on",
    useBeforeExpiry: "Use them before they expire",
    exploreBenefits: "Explore benefits",
    youHaveCredits: "You have credits to use",
    balance: "Balance",
    credits: "credits",
    redeem: "Redeem",
    latestMovements: "Latest movements",
    confirmRedeem: "Confirm redemption",
    youAreRedeeming: "You are redeeming",
    for: "for",
    currentBalance: "Current balance",
    cost: "Cost",
    remainingBalance: "Remaining balance",
    notEnoughCredits: "You don't have enough credits.",
    cancel: "Cancel",
    confirm: "Confirm",
    benefitActivated: "Benefit activated!",
    voucherCode: "Voucher code",
    expires: "Expires",
    backToHome: "Back to home",
    congratulations: "Congratulations!",
    completed: "Completed",
    earned: "You earned",
    newBalance: "New balance",
    useMyCredits: "Use my credits",
    backToCourses: "Back to courses",
    learningTitle: "Learning",
    learningSubtitle: "Complete courses and earn credits for your Perks wallet.",
    lesson: "Lesson",
    reading: "Reading",
    markLessonDone: "Mark your lesson as completed",
    back: "Back",
    continue: "Continue",
    details: "Details",
    progress: "Progress",
    type: "Type",
    duration: "Duration",
    reward: "Reward",
    startLesson: "Start lesson",
    courseCompleted: "Course completed ✓",
    completeAndEarn: "Complete this course and earn",
    forPerksWallet: "for your Perks wallet.",
    completeCoursesEarn: "Complete courses, earn credits",
    useInPerks: "Use them in Perks benefits",
    seePerks: "See Perks →",
    viewProfile: "View profile",
    settings: "Settings",
    logout: "Log out",
    language: "Language",
    admin: "Admin",
    errorRedeeming: "Error redeeming",
    alreadyCompleted: "You've already completed this course",
    all: "All",
    health: "Health",
    education: "Education",
    wellness: "Wellness",
    gastronomy: "Gastronomy",
    entertainment: "Entertainment",
  },
  es: {
    feed: "Feed",
    groups: "Grupos",
    magazine: "Revista",
    chats: "Chats",
    knowledgeLibraries: "Bibliotecas",
    events: "Eventos",
    kudos: "Kudos",
    formsAndTasks: "Formularios y Tareas",
    people: "Personas",
    learning: "Aprendizaje",
    onboarding: "Onboarding",
    benefits: "Beneficios",
    addPeople: "Agregar Personas",
    writeSomething: "Escribe algo...",
    post: "Publicar",
    search: "Buscar",
    seeMore: "Ver más",
    allOrg: "Toda la organización",
    reach: "Alcance",
    celebrations: "Celebraciones",
    allCelebrations: "Todas las celebraciones",
    anniversaries: "Aniversarios",
    birthdays: "Cumpleaños",
    noCelebrations: "No hay celebraciones en esta fecha",
    quickLinks: "Accesos rápidos",
    myWallet: "Mi Wallet",
    benefitsTab: "Beneficios",
    history: "Historial",
    myBalance: "Mi saldo",
    availableCredits: "créditos disponibles",
    creditsExpire: "Tus créditos vencen el",
    useBeforeExpiry: "Usalos antes de que expiren",
    exploreBenefits: "Explorar beneficios",
    youHaveCredits: "Tenés créditos para usar",
    balance: "Saldo",
    credits: "créditos",
    redeem: "Canjear",
    latestMovements: "Últimos movimientos",
    confirmRedeem: "Confirmar canje",
    youAreRedeeming: "Vas a canjear",
    for: "por",
    currentBalance: "Saldo actual",
    cost: "Costo",
    remainingBalance: "Saldo restante",
    notEnoughCredits: "No tenés créditos suficientes.",
    cancel: "Cancelar",
    confirm: "Confirmar",
    benefitActivated: "¡Beneficio activado!",
    voucherCode: "Código de voucher",
    expires: "Vence",
    backToHome: "Volver al inicio",
    congratulations: "¡Felicidades!",
    completed: "Completaste",
    earned: "Ganaste",
    newBalance: "Nuevo saldo",
    useMyCredits: "Usar mis créditos",
    backToCourses: "Volver a cursos",
    learningTitle: "Aprendizaje",
    learningSubtitle: "Completa cursos y gana créditos para tu wallet de Perks.",
    lesson: "Lección",
    reading: "Lectura",
    markLessonDone: "Marca tu lección como finalizada",
    back: "Volver",
    continue: "Continuar",
    details: "Detalles",
    progress: "Progreso",
    type: "Tipo",
    duration: "Duración",
    reward: "Recompensa",
    startLesson: "Comenzar lección",
    courseCompleted: "Curso completado ✓",
    completeAndEarn: "Completa este curso y gana",
    forPerksWallet: "para tu wallet de Perks.",
    completeCoursesEarn: "Completa cursos, gana créditos",
    useInPerks: "Usalos en beneficios de Perks",
    seePerks: "Ver Perks →",
    viewProfile: "Ver perfil",
    settings: "Configuración",
    logout: "Cerrar sesión",
    language: "Idioma",
    admin: "Admin",
    errorRedeeming: "Error al canjear",
    alreadyCompleted: "Ya completaste este curso",
    all: "Todos",
    health: "Salud",
    education: "Educación",
    wellness: "Bienestar",
    gastronomy: "Gastronomía",
    entertainment: "Entretenimiento",
  },
}
