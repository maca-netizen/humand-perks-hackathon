import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Humand Perks — Admin Panel",
  description: "Panel de administración de beneficios",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
