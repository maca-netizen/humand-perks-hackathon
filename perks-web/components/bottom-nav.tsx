"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, LayoutGrid, Star, User } from "lucide-react"

const navItems = [
  { name: "Home", icon: Home, href: "/home" },
  { name: "Chats", icon: MessageSquare, href: "/chats", hasBadge: true },
  { name: "Apps", icon: LayoutGrid, href: "/" },
  { name: "Reco...", icon: Star, href: "/reco" },
  { name: "Profile", icon: User, href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8ECF1] px-2 pb-6 pt-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] relative"
            >
              <div className="relative">
                <item.icon 
                  className="h-6 w-6" 
                  strokeWidth={1.5}
                  color={isActive ? "#3D5A80" : "#718096"}
                />
                {item.hasBadge && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3D5A80]" />
                )}
              </div>
              <span 
                className="text-[11px] font-medium"
                style={{ color: isActive ? "#3D5A80" : "#718096" }}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
