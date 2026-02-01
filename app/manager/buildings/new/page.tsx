'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ButtonLoader } from '@/components/shared/LoadingSpinner'
import { ArrowLeft, Building2, MapPin, Home, Save, AlertTriangle } from 'lucide-react'

export default function NewBuildingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const managerId = user?.propertyManager?.id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Champs du formulaire
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [unitCount, setUnitCount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managerId) return

    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('buildings')
        .insert({
          manager_id: managerId,
          address: address.trim(),
          city: city.trim(),
          postal_code: postalCode.trim().toUpperCase(),
          unit_count: unitCount ? parseInt(unitCount) : null,
        })

      if (insertError) throw insertError

      router.push('/manager/buildings')
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || "Erreur lors de l'ajout de l'immeuble")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/manager/buildings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Ajouter un immeuble
          </h1>
          <p className="text-gray-500">
            Remplissez les informations de l'immeuble
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        {/* Message d'erreur */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-mrbrico-blue" />
              Informations de l'immeuble
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 rue Exemple"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Ville */}
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sherbrooke"
                required
              />
            </div>

            {/* Code postal */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="J1H 1A1"
                maxLength={7}
                required
              />
            </div>

            {/* Nombre d'unités */}
            <div className="space-y-2">
              <Label htmlFor="unitCount">Nombre d'unités (optionnel)</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="unitCount"
                  type="number"
                  min="1"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                  placeholder="Ex: 12"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <Link href="/manager/buildings">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <ButtonLoader />}
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
