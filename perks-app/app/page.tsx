"use client"

import { useRouter } from "next/navigation"
import { Home, MessageSquare, LayoutGrid, Star, User } from "lucide-react"

const apps = [
  {
    name: "Forms & Tasks",
    color: "#EDEDFC",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="5" width="24" height="30" rx="4" fill="#C4B5FD" />
        <rect x="13" y="11" width="14" height="2.5" rx="1" fill="white" />
        <rect x="13" y="16" width="10" height="2.5" rx="1" fill="white" />
        <rect x="13" y="21" width="14" height="2.5" rx="1" fill="white" />
        <rect x="13" y="26" width="8" height="2.5" rx="1" fill="white" />
      </svg>
    ),
  },
  {
    name: "People",
    color: "#E8EEF8",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="14" r="6" fill="#7B9AC5" />
        <ellipse cx="20" cy="30" rx="10" ry="6" fill="#7B9AC5" />
      </svg>
    ),
  },
  {
    name: "Time control",
    color: "#E6F5E8",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="12" stroke="#5CB85C" strokeWidth="2.5" fill="none" />
        <line x1="20" y1="20" x2="20" y2="12" stroke="#5CB85C" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="20" x2="26" y2="20" stroke="#5CB85C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 4 L20 1 L24 4" stroke="#5CB85C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "Org Chart",
    color: "#FDEAE8",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="10" r="4" fill="#E8A09A" />
        <circle cx="11" cy="28" r="3.5" fill="#E8A09A" />
        <circle cx="29" cy="28" r="3.5" fill="#E8A09A" />
        <line x1="20" y1="14" x2="20" y2="20" stroke="#E8A09A" strokeWidth="2" />
        <line x1="11" y1="24" x2="20" y2="20" stroke="#E8A09A" strokeWidth="2" />
        <line x1="29" y1="24" x2="20" y2="20" stroke="#E8A09A" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Files",
    color: "#FFF5D6",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 14C8 12 9.5 10 12 10H18L21 14H28C30.5 14 32 15.5 32 18V30C32 32 30.5 34 28 34H12C9.5 34 8 32 8 30V14Z" fill="#E8C95A" />
      </svg>
    ),
  },
  {
    name: "Onboarding",
    color: "#E0F0F5",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="7" y="8" width="26" height="24" rx="4" fill="#8FC7D5" />
        <rect x="12" y="13" width="16" height="2.5" rx="1" fill="white" />
        <rect x="12" y="18" width="12" height="2.5" rx="1" fill="white" />
        <path d="M14 25L18 29L26 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "Surveys",
    color: "#EDE8F5",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M12 24L18 30L28 16" stroke="#8B6FC0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "Pronosticos deportivos",
    color: "#FFF5D6",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="26" r="8" fill="#F5DFA0" />
        <rect x="16" y="6" width="8" height="12" rx="2" fill="#E8C040" />
        <rect x="18" y="18" width="4" height="4" fill="#E8C040" />
      </svg>
    ),
  },
  {
    name: "Marketplace",
    color: "#FCE4EC",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="16" width="24" height="18" rx="3" fill="#E88A9A" />
        <path d="M8 16L12 8H28L32 16" stroke="#E88A9A" strokeWidth="2" />
        <rect x="16" y="22" width="8" height="12" rx="1" fill="white" />
      </svg>
    ),
  },
  {
    name: "Time off",
    color: "#E3F0FC",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="7" y="12" width="26" height="22" rx="4" fill="#7BAFD4" />
        <rect x="7" y="12" width="26" height="7" rx="4" fill="#5A97C2" />
        <circle cx="15" cy="26" r="2" fill="white" />
        <circle cx="20" cy="26" r="2" fill="white" />
        <circle cx="25" cy="26" r="2" fill="white" />
        <rect x="13" y="8" width="3" height="7" rx="1.5" fill="#5A97C2" />
        <rect x="24" y="8" width="3" height="7" rx="1.5" fill="#5A97C2" />
      </svg>
    ),
  },
  {
    name: "Performance Review",
    color: "#FFF5D6",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="26" r="9" fill="#F5DFA0" />
        <path d="M16 14L20 6L24 14" fill="#E89040" />
        <path d="M13 18L20 16L27 18" stroke="#E89040" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "Agent workspace",
    color: "#E0F5F0",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M10 20C10 14 14 10 20 10C26 10 30 14 30 20" stroke="#5AC5B0" strokeWidth="3" fill="none" />
        <circle cx="14" cy="22" r="4" fill="#5AC5B0" />
        <circle cx="26" cy="22" r="4" fill="#5AC5B0" />
        <rect x="15" y="28" width="10" height="4" rx="2" fill="#5AC5B0" />
      </svg>
    ),
  },
  {
    name: "Perks",
    color: "#E8EBF5",
    isPerks: true,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="12" width="28" height="18" rx="4" fill="#4B5EAA" />
        <circle cx="20" cy="21" r="5" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="20" y="24" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">{"cr"}</text>
        <rect x="12" y="28" width="16" height="3" rx="1.5" fill="#E8B230" />
      </svg>
    ),
  },
  {
    name: "Learning",
    color: "#E0F5EC",
    isLearning: true,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 8L6 16L20 24L34 16L20 8Z" fill="#6BC5A0" />
        <path d="M11 20V30L20 34L29 30V20" stroke="#4AA882" strokeWidth="2" fill="none" />
        <line x1="34" y1="16" x2="34" y2="28" stroke="#4AA882" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Goals",
    color: "#FDEAE8",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="13" fill="#FECACA" />
        <circle cx="20" cy="20" r="9" fill="white" />
        <circle cx="20" cy="20" r="5" fill="#FECACA" />
        <circle cx="20" cy="20" r="2" fill="#E05050" />
        <line x1="28" y1="12" x2="33" y2="7" stroke="#E05050" strokeWidth="2" />
        <path d="M30 7H33V10" stroke="#E05050" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

const bottomTabs = [
  { name: "Home", icon: Home },
  { name: "Chats", icon: MessageSquare, badge: true },
  { name: "Apps", icon: LayoutGrid, active: true },
  { name: "Reco...", icon: Star },
  { name: "Profile", icon: User },
]

export default function AppsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F2F3F7] flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-[#F2F3F7] flex flex-col relative">
        {/* iOS Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-[15px] font-semibold text-[#1A1A2E]">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="#1A1A2E">
              <rect x="0" y="5" width="3" height="6" rx="0.5" />
              <rect x="4.3" y="3.5" width="3" height="7.5" rx="0.5" />
              <rect x="8.6" y="1.5" width="3" height="9.5" rx="0.5" />
              <rect x="12.9" y="0" width="3" height="11" rx="0.5" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="#1A1A2E">
              <path d="M7.5 3.2C5.5 3.2 3.7 4 2.3 5.3L0.8 3.8C2.6 2 4.9 1 7.5 1C10.1 1 12.4 2 14.2 3.8L12.7 5.3C11.3 4 9.5 3.2 7.5 3.2ZM7.5 6C6.2 6 5 6.5 4.1 7.3L5.6 8.8C6.2 8.3 6.8 8 7.5 8C8.2 8 8.8 8.3 9.4 8.8L10.9 7.3C10 6.5 8.8 6 7.5 6Z" />
              <circle cx="7.5" cy="10.5" r="1.2" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#1A1A2E" strokeWidth="1" />
              <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#1A1A2E" />
              <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#1A1A2E" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-[30px] font-bold text-[#1A1A2E] tracking-tight">Apps</h1>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto px-3 pb-28">
          <div className="grid grid-cols-3 gap-y-5 gap-x-2">
            {apps.map((app) => (
              <button
                key={app.name}
                onClick={() => {
                  if (app.isPerks) router.push("/perks")
                  if (app.isLearning) router.push("/courses")
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center transition-transform group-active:scale-95"
                  style={{
                    backgroundColor: app.color,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {app.icon}
                </div>
                <span className="text-[12px] font-medium text-[#1A1A2E] text-center leading-[14px] max-w-[90px]">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#E5E5EA]">
          <div className="flex items-center justify-around pt-2 pb-6">
            {bottomTabs.map((tab) => (
              <div key={tab.name} className="flex flex-col items-center gap-1 min-w-[48px]">
                <div className="relative">
                  <tab.icon
                    size={22}
                    strokeWidth={1.8}
                    color={tab.active ? "#4B5EAA" : "#8E8E93"}
                  />
                  {tab.badge && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#4B5EAA]" />
                  )}
                </div>
                <span
                  className="text-[10px]"
                  style={{
                    color: tab.active ? "#4B5EAA" : "#8E8E93",
                    fontWeight: tab.active ? 600 : 500,
                  }}
                >
                  {tab.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
