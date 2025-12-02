import { StylisticSettingsForm } from "@/components/forms/stylistic-settings-form"

export default function SettingsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      
      <section className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold">Stylistic Settings</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Customize the visual appearance of the application. Changes are saved automatically and applied immediately.
        </p>
        <StylisticSettingsForm />
      </section>
    </main>
  )
}

