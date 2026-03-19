import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Providers } from "@/components/Providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Humand Perks — Admin Panel",
  description: "Panel de administración de beneficios",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            closeButton
            duration={4000}
            style={{ zIndex: 9999 }}
            toastOptions={{
              style: {
                background: "#303036",
                color: "#ffffff",
                border: "none",
                borderBottom: "3px solid #4ed364",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                fontFamily: "'Roboto', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "0.2px",
                padding: "14px 16px",
                gap: "10px",
                minWidth: "320px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
