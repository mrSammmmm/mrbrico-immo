'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useWorkRequests } from '@/hooks/useWorkRequests'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminRequestCard } from '@/components/admin/AdminRequestCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/types'
import { Search, Filter, ClipboardList, Users } from 'lucide-react'
import type { PropertyManager } from '@/lib/supabase/database.types'

export default function AdminRequestsPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [managers, setManagers] = useState<PropertyManager[]>([])

  // Charger la liste des gestionnaires
  useEffect(() => {
    const fetchManagers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('property_managers')
        .select('*')
        .order('company_name')

      if (data) {
        setManagers(data)
      }
    }
    fetchManagers()
  }, [])

  const { requests, isLoading, error, refetch } = useWorkRequests({
    status: statusFilter === 'all' ? 'all' : statusFilter as any,
    priority: priorityFilter === 'all' ? 'all' : priorityFilter as any,
    managerId: managerFilter === 'all' ? undefined : managerFilter,
    limit: 100,
  })

  // Filtrer par recherche
  const filteredRequests = requests.filter(request => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.request_number?.toLowerCase().includes(query) ||
      request.work_type?.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query) ||
      request.building?.address?.toLowerCase().includes(query)
    )
  })

  // Callback pour rafraîchir après un changement de statut
  const handleStatusChange = () => {
    refetch()
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
            Toutes les demandes
          </h1>
          <p className="text-gray-500">
            {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} trouvée{filteredRequests.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, type, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre statut */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtre priorité */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtre gestionnaire */}
              <Select value={managerFilter} onValueChange={setManagerFilter}>
                <SelectTrigger>
                  <Users className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Gestionnaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les gestionnaires</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Bouton réinitialiser */}
              {(statusFilter !== 'all' || priorityFilter !== 'all' || managerFilter !== 'all' || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all')
                    setPriorityFilter('all')
                    setManagerFilter('all')
                    setSearchQuery('')
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune demande trouvée
            </h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucune demande de travaux pour le moment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <AdminRequestCard
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
