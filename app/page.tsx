import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wrench, Building2, ClipboardList, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mrbrico-light via-white to-mrbrico-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mrbrico-orange">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-mrbrico-gray">
              MrBrico <span className="text-mrbrico-orange">Immo</span>
            </span>
          </div>
          <Link href="/login">
            <Button variant="outline">Connexion</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-mrbrico-gray sm:text-5xl md:text-6xl">
            Gérez vos demandes de travaux
            <span className="block text-mrbrico-orange">en toute simplicité</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Le portail MrBrico Immo permet aux gestionnaires d'immeubles de soumettre
            et suivre leurs demandes de travaux en temps réel avec l'équipe Monsieur Bricole.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Accéder au portail
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://mrbrico.ca" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                Visiter mrbrico.ca
              </Button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mrbrico-orange/10">
              <ClipboardList className="h-6 w-6 text-mrbrico-orange" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-mrbrico-gray">
              Soumission facile
            </h3>
            <p className="mt-2 text-gray-600">
              Créez une demande en quelques clics avec photos et détails.
              Recevez une confirmation immédiate.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mrbrico-blue/10">
              <Building2 className="h-6 w-6 text-mrbrico-blue" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-mrbrico-gray">
              Suivi en temps réel
            </h3>
            <p className="mt-2 text-gray-600">
              Suivez l'avancement de vos travaux étape par étape.
              Restez informé à chaque changement de statut.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-mrbrico-gray">
              Communication directe
            </h3>
            <p className="mt-2 text-gray-600">
              Échangez directement avec notre équipe via le système
              de messagerie intégré.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Monsieur Bricole - Sherbrooke, Québec</p>
        <p className="mt-1">
          <a href="tel:8195550123" className="link-mrbrico">(819) 555-0123</a>
          {' • '}
          <a href="mailto:info@mrbrico.ca" className="link-mrbrico">info@mrbrico.ca</a>
        </p>
      </footer>
    </div>
  )
}
