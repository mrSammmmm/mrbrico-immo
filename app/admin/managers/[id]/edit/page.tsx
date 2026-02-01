'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import Link from 'next/link'
import { PageLoader } from '@/components/shared/LoadingSpinner'

type Manager = {
  id: string
  company_name: string
  phone: string | null
  address: string | null
  notes: string | null
  user: {
    email: string
    full_name: string
  }
}

export default function EditManagerPage() {
  const router = useRouter()
  const params = useParams()
  const managerId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manager, setManager] = useState<Manager | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    loadManager()
  }, [managerId])

  const loadManager = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('property_managers')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .eq('id', managerId)
        .single<Manager>()

      if (error) throw error

      setManager(data)
      setFormData({
        fullName: data.user.full_name || '',
        email: data.user.email || '',
        companyName: data.company_name || '',
        phone: data.phone || '',
        address: data.address || '',
        notes: data.notes || '',
      })
    } catch (err: any) {
      console.error('Erreur chargement gestionnaire:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Appeler l'API route pour mettre à jour le gestionnaire
      const response = await fetch('/api/admin/managers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // Succès - rediriger vers la page détail
      router.push(`/admin/managers/${managerId}`)

    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!manager) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gestionnaire non trouvé</p>
        <Link href="/admin/managers">
          <Button className="mt-4">Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/managers/${managerId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Modifier le gestionnaire
          </h1>
          <p className="text-gray-500">
            {manager.company_name}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-mrbrico-blue" />
              Informations du gestionnaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Informations du compte */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Compte utilisateur</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Jean Tremblay"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jean@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Note: La modification de l'email nécessite une re-vérification
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de l'entreprise */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium text-gray-900">Informations entreprise</h3>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Gestion Immobilière Tremblay"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(514) 555-0123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 rue Principale, Montréal"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={4}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <Link href={`/admin/managers/${managerId}`}>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-mrbrico-orange hover:bg-mrbrico-orange/90"
              >
                {isSubmitting ? (
                  'Enregistrement...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
