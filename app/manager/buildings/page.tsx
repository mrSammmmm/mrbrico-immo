'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Building } from '@/lib/supabase/database.types'
import { Building2, MapPin, Home, PlusCircle, Pencil, Trash2 } from 'lucide-react'

export default function ManagerBuildingsPage() {
  const { user } = useAuth()
  const managerId = user?.propertyManager?.id

  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBuildings = async () => {
      if (!managerId) return

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('manager_id', managerId)
          .order('address')

        if (error) throw error
        setBuildings(data || [])
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBuildings()
  }, [managerId])

  const handleDelete = async (buildingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet immeuble?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', buildingId)

      if (error) throw error
      setBuildings(buildings.filter(b => b.id !== buildingId))
    } catch (error) {
      console.error('Erreur:', error)
      alert('Impossible de supprimer cet immeuble. Il est peut-être lié à des demandes.')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Mes immeubles
          </h1>
          <p className="text-gray-500">
            {buildings.length} immeuble{buildings.length > 1 ? 's' : ''} enregistré{buildings.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/manager/buildings/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Ajouter un immeuble
          </Button>
        </Link>
      </div>

      {/* Liste des immeubles */}
      {buildings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucun immeuble
            </h3>
            <p className="mt-2 text-gray-500">
              Ajoutez vos immeubles pour pouvoir créer des demandes de travaux
            </p>
            <Link href="/manager/buildings/new" className="mt-4">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un immeuble
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <Card key={building.id} className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{building.address}</p>
                    <p className="text-sm text-gray-500">
                      {building.city}, {building.postal_code}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {building.unit_count && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span>{building.unit_count} unités</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Link href={`/manager/buildings/${building.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(building.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
