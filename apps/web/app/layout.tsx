import type { Metadata } from "next"
import "./globals.css"
import { StylisticSettingsProvider } from "@/components/layout/stylistic-settings-provider"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Accountant App",
  description: "Cloud accounting SaaS for Polish SMEs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col">
        <StylisticSettingsProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </StylisticSettingsProvider>
      </body>
    </html>
  )
}

