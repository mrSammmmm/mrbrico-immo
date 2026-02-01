import { RequestForm } from '@/components/requests/RequestForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/manager/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Nouvelle demande de travaux
          </h1>
          <p className="text-gray-500">
            Remplissez le formulaire pour soumettre une nouvelle demande
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl">
        <RequestForm />
      </div>
    </div>
  )
}
