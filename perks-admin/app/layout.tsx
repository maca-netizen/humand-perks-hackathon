import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Humand Perks — Admin Panel",
  description: "Panel de administración de beneficios",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
