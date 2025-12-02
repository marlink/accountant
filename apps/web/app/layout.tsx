import type { Metadata } from "next"
import "./globals.css"

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
      <body>{children}</body>
    </html>
  )
}

