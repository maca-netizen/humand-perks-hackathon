"use client"

import { useState, useEffect } from "react"
import {
  Home, Users, Newspaper, MessageSquare, BookOpen, CalendarDays, Heart,
  ClipboardList, UserCircle, GraduationCap, FileText, Menu, Search, Globe, Bell,
  HelpCircle, Gift, Wallet, Clock, CreditCard, Check, Copy, ChevronRight, X
} from "lucide-react"
import { getWallet, getBenefits, redeemBenefit, getCourses, getUserCompletions, completeCourse } from "@/lib/supabase"

const perksCategories = ["Todos", "Salud", "Educacion", "Bienestar", "Gastronomia", "Entretenimiento"]

const sidebarItems = [
  { name: "Feed", icon: Home },
  { name: "Groups", icon: Users },
  { name: "Magazine", icon: Newspaper },
  { name: "Chats", icon: MessageSquare },
  { name: "Knowledge libraries", icon: BookOpen },
  { name: "Events", icon: CalendarDays },
  { name: "Kudos", icon: Heart },
  { name: "Forms and Tasks", icon: ClipboardList },
  { name: "People", icon: UserCircle },
  { name: "Learning", icon: GraduationCap },
  { name: "Onboarding", icon: FileText },
  { name: "Beneficios", icon: Gift },
]

const celebrationDates = [
  { label: "MAR 18 (Today)", active: true },
  { label: "APR 8", active: false },
  { label: "MAY 23", active: false },
  { label: "MAY 28", active: false },
]

type ActivePage = "feed" | "beneficios" | "learning"
type PerksTab = "wallet" | "beneficios" | "historial"
type PerksScreen = "tabs" | "confirm" | "success"

type Benefit = { id: string; name: string; category: string; cost: number; image_url: string }
type Transaction = { id: string; description: string; amount: number; type: string; created_at: string }

export default function HumandApp() {
  const [activePage, setActivePage] = useState<ActivePage>("feed")
  const [perksTab, setPerksTab] = useState<PerksTab>("wallet")
  const [perksScreen, setPerksScreen] = useState<PerksScreen>("tabs")
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [balance, setBalance] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [voucherCode, setVoucherCode] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [learningScreen, setLearningScreen] = useState<"list" | "detail" | "lesson" | "complete">("list")
  const [lessonChecked, setLessonChecked] = useState(false)
  const [courseReward, setCourseReward] = useState<any>(null)

  const USER_ID = "b423f21e-9fa6-4046-906d-7e691e5e5cb6" // María García

  useEffect(() => {
    async function load() {
      const walletData = await getWallet(USER_ID)
      setBalance(walletData.balance)
      setExpiresAt(walletData.expires_at)
      setTransactions(walletData.transactions)
      const benefitsData = await getBenefits()
      setBenefits(benefitsData)
      const coursesData = await getCourses()
      setCourses(coursesData)
      const completions = await getUserCompletions(USER_ID)
      setCompletedCourseIds(completions)
    }
    load()
  }, [])

  const filteredBenefits = selectedCategory === "Todos"
    ? benefits
    : benefits.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase())

  const handleRedeem = (benefit: typeof benefits[0]) => {
    setSelectedBenefit(benefit)
    setPerksScreen("confirm")
  }

  const confirmRedeem = async () => {
    if (!selectedBenefit) return
    try {
      const result = await redeemBenefit(USER_ID, selectedBenefit.id)
      setBalance(result.remaining_balance)
      setVoucherCode(result.code)
      setPerksScreen("success")
      const walletData = await getWallet(USER_ID)
      setTransactions(walletData.transactions)
    } catch (e: any) {
      alert(e.message === "INSUFFICIENT_BALANCE" ? "No tenés créditos suficientes" : "Error al canjear")
      setPerksScreen("tabs")
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSidebarClick = (name: string) => {
    if (name === "Beneficios") {
      setActivePage("beneficios")
      setPerksTab("wallet")
      setPerksScreen("tabs")
    } else if (name === "Learning") {
      setActivePage("learning")
      setLearningScreen("list")
    } else {
      setActivePage("feed")
    }
  }

  // ===== TOP NAV BAR =====
  const TopBar = () => (
    <header className="h-[60px] bg-white border-b border-[#E5E5EA] flex items-center justify-between px-5 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="text-[#8E8E93] hover:text-[#1A1A2E] transition-colors">
          <Menu size={22} />
        </button>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M4 16L12 8L16 12L8 20L4 16Z" fill="#E05050" />
            <path d="M16 12L20 8L28 16L24 20L16 12Z" fill="#4B5EAA" />
            <path d="M8 20L16 28L24 20L16 12L8 20Z" fill="#4B5EAA" opacity="0.7" />
          </svg>
          <span className="text-[20px] font-bold text-[#4B5EAA] tracking-tight">NovaTech</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E5EA] rounded-lg text-[13px] font-medium text-[#4B5EAA] hover:bg-[#F2F3F7] transition-colors">
          <Users size={15} />
          Add People
        </button>
        <button className="px-4 py-2 border border-[#4B5EAA] rounded-lg text-[13px] font-medium text-[#4B5EAA] hover:bg-[#4B5EAA] hover:text-white transition-colors">
          Admin
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F3F7] transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F3F7] transition-colors">
          <Globe size={20} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:bg-[#F2F3F7] transition-colors">
          <Bell size={20} />
        </button>
        <div className="relative ml-1">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-9 h-9 rounded-full bg-[#EDEDFC] flex items-center justify-center text-[12px] font-bold text-[#4B5EAA]">
            MG
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-[260px] bg-white rounded-2xl shadow-lg border border-[#E5E5EA] py-4 px-5 z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#EDEDFC] flex items-center justify-center text-[13px] font-bold text-[#4B5EAA]">MG</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#34C759] rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1A1A2E]">Maria Garcia</p>
                  <p className="text-[12px] text-[#8E8E93]">maria@novatech.com</p>
                </div>
              </div>
              <div className="border-t border-[#E5E5EA] pt-3 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#1A1A2E] hover:bg-[#F2F3F7] transition-colors">
                  <UserCircle size={18} color="#8E8E93" />Ver perfil
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#1A1A2E] hover:bg-[#F2F3F7] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings
                </button>
              </div>
              <div className="border-t border-[#E5E5EA] mt-3 pt-3">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#4B5EAA] hover:bg-[#F2F3F7] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5EAA" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Cerrar sesion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )

  // ===== LEFT SIDEBAR =====
  const LeftSidebar = () => (
    <aside className="w-[240px] shrink-0 bg-white border-r border-[#E5E5EA] overflow-y-auto sticky top-[60px] h-[calc(100vh-60px)]">
      <nav className="py-2">
        {sidebarItems.map((item) => {
          const isActive =
            (item.name === "Feed" && activePage === "feed") ||
            (item.name === "Beneficios" && activePage === "beneficios") ||
            (item.name === "Learning" && activePage === "learning")
          return (
            <button
              key={item.name}
              onClick={() => handleSidebarClick(item.name)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                isActive
                  ? "bg-[#F2F3F7] text-[#1A1A2E] font-semibold"
                  : "text-[#1A1A2E] hover:bg-[#F8F8FA]"
              }`}
            >
              <item.icon size={20} strokeWidth={1.8} color={isActive ? "#4B5EAA" : "#8E8E93"} />
              <span className="text-[14px]">{item.name}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )

  // ===== RIGHT SIDEBAR =====
  const RightSidebar = () => (
    <aside className="w-[320px] shrink-0 overflow-y-auto sticky top-[60px] h-[calc(100vh-60px)] p-4 flex flex-col gap-4">
      {/* Celebrations */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-4">Celebrations</h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {["All celebrations", "Anniversaries", "Birthdays"].map((label, i) => (
            <button
              key={label}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                i === 0
                  ? "bg-[#4B5EAA] text-white border-[#4B5EAA]"
                  : "bg-white text-[#1A1A2E] border-[#E5E5EA] hover:bg-[#F2F3F7]"
              }`}
            >
              {i === 0 && <span className="mr-1">{"✓"}</span>}
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mb-6">
          {celebrationDates.map((d) => (
            <button
              key={d.label}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                d.active
                  ? "bg-[#F2F3F7] text-[#4B5EAA] font-semibold border-b-2 border-[#4B5EAA]"
                  : "text-[#8E8E93] hover:bg-[#F8F8FA]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center py-6 text-[#8E8E93]">
          <CalendarDays size={32} strokeWidth={1.2} className="mb-3 opacity-40" />
          <p className="text-[14px]">There are no celebrations on this date</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-4">Quick links</h3>
        <div className="flex gap-3">
          {[
            { label: "NovaTech", color: "#4B5EAA" },
            { label: "HR", color: "#E05050" },
            { label: "IT", color: "#4B5EAA" },
            { label: "Events", color: "#E8B230" },
            { label: "Book", color: "#34C759" },
          ].map((link) => (
            <div key={link.label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-[48px] h-[48px] rounded-xl flex items-center justify-center"
                style={{ backgroundColor: link.color + "18" }}
              >
                <span className="text-[11px] font-bold" style={{ color: link.color }}>{link.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )

  // ===== FEED CONTENT =====
  const FeedContent = () => (
    <div>
      {/* Title row */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]">Feed</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E5EA] rounded-lg text-[13px] text-[#1A1A2E] hover:bg-white transition-colors">
            <Search size={14} />
            Search
          </button>
          <button className="w-9 h-9 rounded-full border border-[#E5E5EA] flex items-center justify-center hover:bg-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="8" r="1.5" fill="#8E8E93" />
              <circle cx="8" cy="8" r="1.5" fill="#8E8E93" />
              <circle cx="12" cy="8" r="1.5" fill="#8E8E93" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post composer */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#EDEDFC] flex items-center justify-center text-[13px] font-bold text-[#4B5EAA]">MG</div>
          <div>
            <p className="text-[14px] font-semibold text-[#1A1A2E]">Maria Garcia</p>
            <p className="text-[12px] text-[#4B5EAA]">All the organization</p>
          </div>
          <div className="ml-auto text-right">
            <div className="flex items-center gap-1.5 text-[#8E8E93]">
              <Users size={14} />
              <span className="text-[13px] font-medium text-[#1A1A2E]">Reach: 1388</span>
            </div>
            <p className="text-[11px] text-[#8E8E93]">0 / 100 MB</p>
          </div>
        </div>
        <div className="border border-[#E5E5EA] rounded-xl px-4 py-3 mb-4">
          <span className="text-[14px] text-[#8E8E93]">Write something...</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[#8E8E93]">
            <button className="hover:text-[#4B5EAA] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></button>
            <button className="hover:text-[#4B5EAA] transition-colors text-[13px] font-bold">GIF</button>
            <button className="hover:text-[#4B5EAA] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg></button>
            <button className="hover:text-[#4B5EAA] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>
          </div>
          <button className="px-6 py-2 border border-[#E5E5EA] rounded-lg text-[14px] font-medium text-[#1A1A2E] hover:bg-[#F2F3F7] transition-colors">
            Post
          </button>
        </div>
      </div>

      {/* Post */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4B5EAA] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M4 16L12 8L16 12L8 20L4 16Z" fill="#E05050" />
                  <path d="M16 12L20 8L28 16L24 20L16 12Z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A2E]">NovaTech Communications</p>
                <p className="text-[12px] text-[#8E8E93]">February 11th, 2026 at 12:57 PM</p>
              </div>
            </div>
            <button className="text-[#8E8E93] hover:text-[#1A1A2E] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
          <p className="text-[15px] font-semibold text-[#1A1A2E] mb-3">
            {"International Day of Women and Girls in Science | February 11"}
          </p>
          <p className="text-[14px] text-[#1A1A2E] leading-relaxed mb-2">
            Today, we recognize the women and girls whose knowledge, talent, and dedication drive science, innovation, and sustainable development.
          </p>
          <p className="text-[14px] text-[#8E8E93]">...</p>
          <button className="text-[14px] text-[#4B5EAA] font-medium mt-1 hover:underline">See more</button>
        </div>
        <div className="h-[200px] bg-gradient-to-r from-[#1A3A5C] via-[#E05050] to-[#4B5EAA] flex items-center justify-center">
          <span className="text-white text-[28px] font-bold">Women and Girls in Science</span>
        </div>
      </div>
    </div>
  )

  // ===== PERKS CONTENT =====
  const PerksContent = () => {
    const perksTabItems: { key: PerksTab; label: string }[] = [
      { key: "wallet", label: "Mi Wallet" },
      { key: "beneficios", label: "Beneficios" },
      { key: "historial", label: "Historial" },
    ]

    // Success screen
    if (perksScreen === "success" && selectedBenefit) {
      return (
        <div className="flex flex-col items-center py-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[#34C759] flex items-center justify-center mb-5">
            <Check size={36} color="white" strokeWidth={3} />
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-1">{"Beneficio activado!"}</h2>
          <p className="text-[15px] text-[#8E8E93] mb-6">{selectedBenefit.name}</p>

          <div className="w-full max-w-[400px] bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-4">
            <p className="text-[13px] text-[#8E8E93] mb-2">Codigo de voucher</p>
            <div className="flex items-center justify-between bg-[#F2F3F7] rounded-xl px-4 py-3 mb-5">
              <span className="text-[18px] font-mono font-bold text-[#1A1A2E] tracking-wider">{voucherCode}</span>
              <button onClick={handleCopyCode} className="text-[#4B5EAA] hover:scale-110 transition-transform">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#8E8E93]">Vence</span>
              <span className="text-[#1A1A2E] font-medium">18 Abr 2026</span>
            </div>
          </div>

          <div className="w-full max-w-[400px] bg-white rounded-2xl px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#8E8E93]">Saldo restante</span>
              <span className="text-[18px] font-bold text-[#4B5EAA]">{balance} creditos</span>
            </div>
          </div>

          <button
            onClick={() => { setPerksScreen("tabs"); setPerksTab("wallet"); }}
            className="px-8 py-3 bg-[#4B5EAA] text-white rounded-xl text-[15px] font-semibold hover:bg-[#3D4E94] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      )
    }

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[28px] font-bold text-[#1A1A2E]">Beneficios</h1>
          <div className="bg-[#EDEDFC] rounded-full px-4 py-2">
            <span className="text-[13px] font-semibold text-[#4B5EAA]">Saldo: {balance} creditos</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#E5E5EA] mb-6">
          {perksTabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPerksTab(tab.key)}
              className="pb-3 px-5 relative"
            >
              <span
                className="text-[14px]"
                style={{
                  color: perksTab === tab.key ? "#4B5EAA" : "#8E8E93",
                  fontWeight: perksTab === tab.key ? 600 : 400,
                }}
              >
                {tab.label}
              </span>
              {perksTab === tab.key && (
                <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#4B5EAA] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Wallet tab */}
        {perksTab === "wallet" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-5">
                <div className="w-[56px] h-[56px] rounded-2xl bg-[#EDEDFC] flex items-center justify-center">
                  <Wallet size={26} color="#4B5EAA" />
                </div>
                <div>
                  <p className="text-[13px] text-[#8E8E93]">Mi saldo</p>
                  <p className="text-[32px] font-bold text-[#1A1A2E] leading-none">{balance}.00</p>
                  <p className="text-[13px] text-[#8E8E93] mt-1">creditos disponibles</p>
                </div>
              </div>
            </div>

            {/* Expiry banner */}
            {expiresAt && (
              <div className="bg-[#FFF5E0] rounded-2xl p-4 flex items-center gap-3 border border-[#E8B230]/20">
                <div className="w-10 h-10 rounded-xl bg-[#E8B230]/20 flex items-center justify-center shrink-0">
                  <Clock size={18} color="#E8B230" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1A1A2E]">Tus creditos vencen el {new Date(expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                  <p className="text-[12px] text-[#8E8E93]">Usalos antes de que expiren</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setPerksTab("beneficios")}
              className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center gap-4 border border-[#E8B230]/30 hover:bg-[#FAFAFA] transition-colors text-left"
            >
              <div className="w-[44px] h-[44px] rounded-xl bg-[#FFF5E0] flex items-center justify-center">
                <Gift size={22} color="#E8B230" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1A1A2E]">Explorar beneficios</p>
                <p className="text-[13px] text-[#8E8E93]">Tenes creditos para usar</p>
              </div>
              <ChevronRight size={20} color="#E8B230" />
            </button>

            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-3">Ultimos movimientos</h3>
              <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-[#F2F3F7]">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-[#E8F8ED]" : "bg-[#FFF5E0]"}`}>
                        {tx.type === "credit" ? <CreditCard size={18} color="#34C759" /> : <Clock size={18} color="#E8B230" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1A1A2E]">{tx.description}</p>
                        <p className="text-[12px] text-[#8E8E93]">{new Date(tx.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`text-[15px] font-semibold ${tx.type === "credit" ? "text-[#34C759]" : "text-[#1A1A2E]"}`}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount} cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Beneficios tab */}
        {perksTab === "beneficios" && (
          <div>
            <div className="flex gap-2 mb-5 flex-wrap">
              {perksCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat ? "#4B5EAA" : "white",
                    color: selectedCategory === cat ? "white" : "#1A1A2E",
                    boxShadow: selectedCategory !== cat ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {filteredBenefits.map((benefit) => (
                <div key={benefit.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] group">
                  <div className="h-[110px] overflow-hidden">
                    <img
                      src={benefit.image_url}
                      alt={benefit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <p className="text-[14px] font-semibold text-[#1A1A2E]">{benefit.name}</p>
                    <span className="inline-block self-start bg-[#EDEDFC] text-[#4B5EAA] text-[12px] font-semibold px-2.5 py-1 rounded-full">
                      {benefit.cost} creditos
                    </span>
                    <button
                      onClick={() => handleRedeem(benefit)}
                      disabled={balance < benefit.cost}
                      className="w-full h-[38px] bg-[#E8B230] text-white rounded-xl text-[13px] font-semibold hover:bg-[#D4A02A] transition-all disabled:opacity-40"
                    >
                      Canjear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial tab */}
        {perksTab === "historial" && (
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-[#F2F3F7]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-[#E8F8ED]" : "bg-[#FFF5E0]"}`}>
                    {tx.type === "credit" ? <CreditCard size={18} color="#34C759" /> : <Clock size={18} color="#E8B230" />}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A2E]">{tx.description}</p>
                    <p className="text-[12px] text-[#8E8E93]">{new Date(tx.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-[15px] font-semibold ${tx.type === "credit" ? "text-[#34C759]" : "text-[#1A1A2E]"}`}>
                  {tx.type === "credit" ? "+" : "-"}{tx.amount} cr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ===== CONFIRM MODAL =====
  const ConfirmModal = () => {
    if (perksScreen !== "confirm" || !selectedBenefit) return null
    const canAfford = balance >= selectedBenefit.price

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPerksScreen("tabs")} />
        <div className="relative w-full max-w-[440px] bg-white rounded-2xl px-6 pt-5 pb-6 mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[20px] font-bold text-[#1A1A2E]">Confirmar canje</h3>
            <button onClick={() => setPerksScreen("tabs")} className="w-8 h-8 rounded-full hover:bg-[#F2F3F7] flex items-center justify-center transition-colors">
              <X size={18} color="#8E8E93" />
            </button>
          </div>
          <p className="text-[14px] text-[#8E8E93] mb-5">
            {"Vas a canjear "}
            <span className="font-semibold text-[#1A1A2E]">{selectedBenefit.name}</span>
            {" por "}
            <span className="font-semibold text-[#1A1A2E]">{selectedBenefit.price} creditos</span>.
          </p>

          <div className="bg-[#F2F3F7] rounded-2xl p-4 mb-5">
            <div className="flex justify-between mb-3">
              <span className="text-[14px] text-[#8E8E93]">Saldo actual</span>
              <span className="text-[14px] font-semibold text-[#1A1A2E]">{balance} creditos</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[14px] text-[#8E8E93]">Costo</span>
              <span className="text-[14px] font-semibold text-[#E8B230]">-{selectedBenefit.price} creditos</span>
            </div>
            <div className="h-px bg-[#E5E5EA] my-2" />
            <div className="flex justify-between pt-1">
              <span className="text-[14px] text-[#8E8E93]">Saldo restante</span>
              <span className={`text-[15px] font-bold ${canAfford ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                {balance - selectedBenefit.price} creditos
              </span>
            </div>
          </div>

          {!canAfford && (
            <p className="text-[13px] text-[#FF3B30] mb-4 text-center">No tenes creditos suficientes.</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setPerksScreen("tabs")}
              className="flex-1 h-[46px] border-2 border-[#E5E5EA] rounded-xl text-[14px] font-semibold text-[#1A1A2E] hover:bg-[#F2F3F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmRedeem}
              disabled={!canAfford}
              className="flex-1 h-[46px] bg-[#4B5EAA] text-white rounded-xl text-[14px] font-semibold hover:bg-[#3D4E94] transition-colors disabled:opacity-40"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== LEARNING CONTENT =====
  const handleCompleteCourse = async () => {
    if (!selectedCourse) return
    try {
      const result = await completeCourse(USER_ID, selectedCourse.id)
      setCourseReward(result)
      setCompletedCourseIds(prev => [...prev, selectedCourse.id])
      setLearningScreen("complete")
      const walletData = await getWallet(USER_ID)
      setBalance(walletData.balance)
      setTransactions(walletData.transactions)
    } catch (e: any) {
      if (e.message === "ALREADY_COMPLETED") alert("Ya completaste este curso")
    }
  }

  const LearningContent = () => {
    if (learningScreen === "complete" && courseReward) {
      return (
        <div className="flex flex-col items-center py-10">
          <div className="relative bg-[#F0FDF4] rounded-2xl w-full py-10 mb-6 flex justify-center overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: i % 3 === 0 ? 10 : 6, height: i % 3 === 0 ? 10 : 6,
                background: i % 3 === 0 ? '#34C759' : i % 3 === 1 ? '#4B5EAA' : '#E8B230',
                left: `${(i * 37 + 5) % 90}%`, top: `${(i * 23 + 10) % 80}%`, opacity: 0.5,
              }} />
            ))}
            <div className="w-[72px] h-[72px] rounded-full bg-white border-[3px] border-[#34C759] flex items-center justify-center relative">
              <Check size={36} color="#34C759" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-2">{"¡Felicidades!"}</h2>
          <p className="text-[15px] text-[#8E8E93] mb-6">Completaste {selectedCourse?.title}</p>
          <div className="w-full max-w-[400px] bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#E8B230]/30 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-[48px] h-[48px] rounded-2xl bg-[#FFF5E0] flex items-center justify-center"><Gift size={24} color="#E8B230" /></div>
              <div>
                <p className="text-[13px] text-[#8E8E93]">Ganaste</p>
                <p className="text-[24px] font-bold text-[#E8B230] leading-none">+{courseReward.credits_earned} creditos</p>
              </div>
            </div>
            <div className="h-px bg-[#F2F3F7] my-4" />
            <div className="flex justify-between">
              <span className="text-[13px] text-[#8E8E93]">Nuevo saldo</span>
              <span className="text-[15px] font-bold text-[#4B5EAA]">{courseReward.new_balance} creditos</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setActivePage("beneficios"); setPerksTab("wallet"); }} className="px-6 py-3 bg-[#4B5EAA] text-white rounded-xl text-[15px] font-semibold hover:bg-[#3D4E94] transition-colors">
              Usar mis creditos
            </button>
            <button onClick={() => setLearningScreen("list")} className="px-6 py-3 text-[#4B5EAA] text-[15px] font-semibold hover:bg-[#F2F3F7] rounded-xl transition-colors">
              Volver a cursos
            </button>
          </div>
        </div>
      )
    }

    if (learningScreen === "lesson" && selectedCourse) {
      const paragraphs = selectedCourse.lesson_content.split('\n\n')
      return (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[28px] font-bold text-[#1A1A2E]">{selectedCourse.lesson_title}</h1>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={14} color="#8E8E93" />
              <span className="text-[12px] text-[#8E8E93] uppercase tracking-wide font-medium">Lectura</span>
            </div>
            <div className="space-y-4">
              {paragraphs.map((p: string, i: number) => {
                const parts = p.split(/(\*\*[^*]+\*\*)/)
                return (
                  <p key={i} className="text-[14px] text-[#1A1A2E] leading-relaxed">
                    {parts.map((part: string, j: number) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                      return <span key={j}>{part}</span>
                    })}
                  </p>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${lessonChecked ? 'bg-[#4B5EAA] border-[#4B5EAA]' : 'border-[#D1D1D6]'}`} onClick={() => setLessonChecked(!lessonChecked)}>
                {lessonChecked && <Check size={14} color="white" strokeWidth={3} />}
              </div>
              <span className="text-[14px] text-[#1A1A2E]">Marca tu leccion como finalizada</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setLearningScreen("detail")} className="px-5 py-2.5 text-[#4B5EAA] text-[14px] font-semibold hover:bg-[#F2F3F7] rounded-xl transition-colors">Volver</button>
              <button onClick={handleCompleteCourse} disabled={!lessonChecked} className="px-5 py-2.5 bg-[#4B5EAA] text-white rounded-xl text-[14px] font-semibold hover:bg-[#3D4E94] transition-colors disabled:opacity-40">Continuar</button>
            </div>
          </div>
        </div>
      )
    }

    if (learningScreen === "detail" && selectedCourse) {
      const isCompleted = completedCourseIds.includes(selectedCourse.id)
      return (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[28px] font-bold text-[#1A1A2E]">{selectedCourse.title}</h1>
          </div>
          <div className="h-[240px] rounded-2xl overflow-hidden mb-5">
            <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
          <div className="bg-[#EDEDFC] rounded-2xl p-4 flex items-start gap-3 mb-5">
            <Gift size={18} color="#4B5EAA" className="shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#1A1A2E]">Completa este curso y gana <strong className="text-[#E8B230]">{selectedCourse.credits_reward} creditos</strong> para tu wallet de Perks.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <p className="text-[12px] text-[#8E8E93] uppercase tracking-wide mb-3">Detalles</p>
              <div className="space-y-2 text-[14px] text-[#1A1A2E]">
                <p>Tipo: Lectura</p>
                <p>Duracion: 3 min</p>
                <p>Recompensa: <strong className="text-[#E8B230]">{selectedCourse.credits_reward} cr</strong></p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <p className="text-[12px] text-[#8E8E93] uppercase tracking-wide mb-3">Progreso</p>
              <div className="h-2 bg-[#E5E5EA] rounded-full mb-2">
                <div className="h-full bg-[#4B5EAA] rounded-full" style={{ width: isCompleted ? '100%' : '0%' }} />
              </div>
              <p className="text-[13px] text-[#8E8E93]">{isCompleted ? '1/1' : '0/1'} leccion</p>
            </div>
          </div>
          <button onClick={() => { setLearningScreen("lesson"); setLessonChecked(false); }} disabled={isCompleted} className="w-full h-[48px] bg-[#4B5EAA] text-white rounded-xl text-[15px] font-semibold hover:bg-[#3D4E94] transition-colors disabled:opacity-40">
            {isCompleted ? "Curso completado ✓" : "Comenzar leccion"}
          </button>
        </div>
      )
    }

    // List screen
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[28px] font-bold text-[#1A1A2E]">Aprendizaje</h1>
        </div>
        <p className="text-[15px] text-[#8E8E93] mb-5">Completa cursos y gana creditos para tu wallet de Perks.</p>
        {courses.map((course: any) => {
          const isCompleted = completedCourseIds.includes(course.id)
          return (
            <button key={course.id} onClick={() => { setSelectedCourse(course); setLearningScreen("detail"); }} className="w-full bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-4 flex items-center gap-5 text-left hover:bg-[#FAFAFA] transition-colors">
              <div className="w-[100px] h-[70px] rounded-xl overflow-hidden shrink-0">
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1A1A2E] mb-2">{course.title}</p>
                <div className="h-1.5 bg-[#E5E5EA] rounded-full mb-1.5">
                  <div className="h-full bg-[#4B5EAA] rounded-full" style={{ width: isCompleted ? '100%' : '0%' }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#8E8E93]">{isCompleted ? '1/1' : '0/1'} leccion</span>
                  <span className="text-[12px] font-semibold text-[#E8B230]">+{course.credits_reward} cr</span>
                </div>
              </div>
              <ChevronRight size={18} color="#D1D1D6" />
            </button>
          )
        })}
        <div className="bg-[#EDEDFC] rounded-2xl p-4 flex items-center gap-3 mt-4">
          <Gift size={20} color="#4B5EAA" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#1A1A2E]">Completa cursos, gana creditos</p>
            <p className="text-[11px] text-[#8E8E93]">Usalos en beneficios de Perks</p>
          </div>
          <button onClick={() => { setActivePage("beneficios"); setPerksTab("wallet"); }} className="text-[12px] font-semibold text-[#4B5EAA]">{"Ver Perks →"}</button>
        </div>
      </div>
    )
  }

  // ===== MAIN LAYOUT =====
  return (
    <div className="min-h-screen bg-[#F2F3F7]">
      <TopBar />
      <div className="flex">
        <LeftSidebar />
        <main className={`flex-1 p-6 min-w-0 ${activePage === "feed" ? "max-w-[760px]" : ""}`}>
          {activePage === "feed" && <FeedContent />}
          {activePage === "beneficios" && <PerksContent />}
          {activePage === "learning" && <LearningContent />}
        </main>
        {activePage === "feed" && <RightSidebar />}
      </div>
      <ConfirmModal />
    </div>
  )
}
