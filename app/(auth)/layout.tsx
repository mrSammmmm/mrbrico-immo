import { Wrench } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-mrbrico-light">
      {/* Header minimaliste */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mrbrico-orange">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-mrbrico-gray">
            MrBrico <span className="text-mrbrico-orange">Immo</span>
          </span>
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer minimaliste */}
      <footer className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Monsieur Bricole - Sherbrooke, Québec
      </footer>
    </div>
  )
}
