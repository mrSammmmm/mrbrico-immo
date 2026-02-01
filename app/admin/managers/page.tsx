'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { PropertyManager } from '@/lib/supabase/database.types'
import { Users, Building2, Mail, Phone, MapPin, Plus, Edit } from 'lucide-react'

type ManagerWithBuildings = PropertyManager & {
  buildings: { count: number }[]
  user?: { email: string; full_name: string } | null
}

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<ManagerWithBuildings[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('property_managers')
          .select(`
            *,
            buildings:buildings(count),
            user:users(email, full_name)
          `)
          .order('company_name')

        if (error) throw error
        setManagers(data || [])
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchManagers()
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
            Gestionnaires immobiliers
          </h1>
          <p className="text-gray-500">
            {managers.length} gestionnaire{managers.length > 1 ? 's' : ''} enregistré{managers.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/managers/new">
          <Button className="bg-mrbrico-orange hover:bg-mrbrico-orange/90">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau gestionnaire
          </Button>
        </Link>
      </div>

      {/* Liste des gestionnaires */}
      {managers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucun gestionnaire
            </h3>
            <p className="mt-2 text-gray-500">
              Les gestionnaires apparaîtront ici une fois créés
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <Card key={manager.id} className="card-hover relative">
              <Link href={`/admin/managers/${manager.id}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mrbrico-blue/10">
                      <Building2 className="h-5 w-5 text-mrbrico-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{manager.company_name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {manager.user?.full_name || 'Contact non défini'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {manager.user?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{manager.user.email}</span>
                    </div>
                  )}
                  {manager.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{manager.phone}</span>
                    </div>
                  )}
                  {manager.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{manager.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-mrbrico-orange" />
                      <span className="text-sm font-medium">
                        {manager.buildings?.[0]?.count || 0} immeuble{(manager.buildings?.[0]?.count || 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/admin/managers/${manager.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
