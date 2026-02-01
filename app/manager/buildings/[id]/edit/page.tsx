'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, ButtonLoader } from '@/components/shared/LoadingSpinner'
import type { Building } from '@/lib/supabase/database.types'
import { ArrowLeft, Building2, MapPin, Home, Save, AlertTriangle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditBuildingPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const managerId = user?.propertyManager?.id

  const [building, setBuilding] = useState<Building | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Champs du formulaire
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [unitCount, setUnitCount] = useState('')

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', id)
          .single<Record<string, any>>()

        if (error) throw error

        setBuilding(data)
        setAddress(data.address || '')
        setCity(data.city || '')
        setPostalCode(data.postal_code || '')
        setUnitCount(data.unit_count?.toString() || '')
      } catch (err) {
        console.error('Erreur:', err)
        setError('Immeuble non trouvé')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBuilding()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managerId || !building) return

    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('buildings')
        .update({
          address: address.trim(),
          city: city.trim(),
          postal_code: postalCode.trim().toUpperCase(),
          unit_count: unitCount ? parseInt(unitCount) : null,
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push('/manager/buildings')
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || "Erreur lors de la modification")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!building) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600">Immeuble non trouvé</p>
        <Link href="/manager/buildings" className="mt-4">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    )
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
            Modifier l'immeuble
          </h1>
          <p className="text-gray-500">
            {building.address}, {building.city}
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
