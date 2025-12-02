import type { Metadata } from "next"
import "./globals.css"
import { StylisticSettingsProvider } from "@/components/layout/stylistic-settings-provider"

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
      <body>
        <StylisticSettingsProvider>{children}</StylisticSettingsProvider>
      </body>
    </html>
  )
}

