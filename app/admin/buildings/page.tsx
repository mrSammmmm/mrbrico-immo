'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Building, PropertyManager } from '@/lib/supabase/database.types'
import { Building2, MapPin, Home, Users } from 'lucide-react'

type BuildingWithManager = Building & {
  property_manager?: PropertyManager | null
}

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingWithManager[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('buildings')
          .select(`
            *,
            property_manager:property_managers(*)
          `)
          .order('city')
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
  }, [])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Immeubles
          </h1>
          <p className="text-gray-500">
            {buildings.length} immeuble{buildings.length > 1 ? 's' : ''} enregistré{buildings.length > 1 ? 's' : ''}
          </p>
        </div>
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
              Les immeubles apparaîtront ici une fois créés
            </p>
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
                {building.property_manager && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Users className="h-4 w-4 text-mrbrico-blue" />
                    <span className="text-sm">
                      {building.property_manager.company_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
