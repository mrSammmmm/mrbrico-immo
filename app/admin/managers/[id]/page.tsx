'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building2, ClipboardList, User } from 'lucide-react'
import type { PropertyManager, Building, WorkRequest } from '@/lib/supabase/database.types'
import { translateStatus, translatePriority, formatRelativeDate } from '@/lib/utils'

type ManagerWithDetails = PropertyManager & {
  user?: { email: string; full_name: string } | null
  buildings?: Building[]
  work_requests?: (WorkRequest & { building?: Building })[]
}

export default function ManagerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [manager, setManager] = useState<ManagerWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('property_managers')
          .select(`
            *,
            user:users(email, full_name),
            buildings(*),
            work_requests:work_requests(*, building:buildings(*))
          `)
          .eq('id', params.id)
          .single<Record<string, any>>()

        if (error) throw error
        setManager(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchManager()
    }
  }, [params.id])

  if (isLoading) {
    return <PageLoader />
  }

  if (!manager) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Gestionnaire non trouvé</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/managers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-mrbrico-gray">
              {manager.company_name}
            </h1>
            <p className="text-gray-500">{manager.user?.full_name || 'Contact non défini'}</p>
          </div>
        </div>
        <Link href={`/admin/managers/${manager.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-mrbrico-blue" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {manager.user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{manager.user.email}</p>
                  </div>
                </div>
              )}

              {manager.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="text-gray-900">{manager.contact_phone}</p>
                  </div>
                </div>
              )}

              {manager.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adresse</p>
                    <p className="text-gray-900">{manager.address}</p>
                  </div>
                </div>
              )}

              {manager.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{manager.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Immeubles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-mrbrico-orange" />
                Immeubles ({manager.buildings?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!manager.buildings || manager.buildings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucun immeuble</p>
              ) : (
                <div className="space-y-3">
                  {manager.buildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-start justify-between p-4 rounded-lg border hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{building.address}</p>
                        <p className="text-sm text-gray-500">
                          {building.city}, {building.postal_code}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {building.total_units} unité{building.total_units > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-mrbrico-blue" />
                Demandes récentes ({manager.work_requests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!manager.work_requests || manager.work_requests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune demande</p>
              ) : (
                <div className="space-y-3">
                  {manager.work_requests.slice(0, 5).map((request) => (
                    <Link
                      key={request.id}
                      href={`/admin/requests/${request.id}`}
                      className="block p-4 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold text-mrbrico-blue">
                              {request.request_number}
                            </span>
                            <Badge variant={request.status as any}>
                              {translateStatus(request.status)}
                            </Badge>
                            <Badge variant={request.priority as any}>
                              {translatePriority(request.priority)}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900">{request.work_type}</p>
                          {request.building && (
                            <p className="text-sm text-gray-500">
                              {request.building.address}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Statistiques */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <div>
                  <p className="text-sm text-gray-600">Immeubles</p>
                  <p className="text-2xl font-bold text-mrbrico-blue">
                    {manager.buildings?.length || 0}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-mrbrico-blue/50" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                <div>
                  <p className="text-sm text-gray-600">Demandes</p>
                  <p className="text-2xl font-bold text-mrbrico-orange">
                    {manager.work_requests?.length || 0}
                  </p>
                </div>
                <ClipboardList className="h-8 w-8 text-mrbrico-orange/50" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div>
                  <p className="text-sm text-gray-600">Actif depuis</p>
                  <p className="text-sm font-medium text-green-700">
                    {new Date(manager.created_at).toLocaleDateString('fr-CA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
