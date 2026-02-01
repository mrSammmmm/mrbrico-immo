'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { WorkRequest, Building } from '@/lib/supabase/database.types'
import {
  ClipboardList,
  PlusCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye
} from 'lucide-react'
type WorkRequestWithBuilding = WorkRequest & {
  buildings: Building | null
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  nouveau: {
    label: 'Nouveau',
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  en_evaluation: {
    label: 'En évaluation',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  soumission_envoyee: {
    label: 'Soumission envoyée',
    color: 'bg-purple-100 text-purple-700',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  approuve: {
    label: 'Approuvé',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />
  },
  en_cours: {
    label: 'En cours',
    color: 'bg-orange-100 text-orange-700',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  complete: {
    label: 'Complété',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />
  },
  facture: {
    label: 'Facturé',
    color: 'bg-gray-100 text-gray-700',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />
  },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-600' },
  prioritaire: { label: 'Prioritaire', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function ManagerRequestsPage() {
  const { user } = useAuth()
  const managerId = user?.propertyManager?.id

  const [requests, setRequests] = useState<WorkRequestWithBuilding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchRequests = async () => {
      if (!managerId) return

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('work_requests')
          .select(`
            *,
            buildings (*)
          `)
          .eq('manager_id', managerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRequests(data || [])
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [managerId])

  const filteredRequests = filter === 'all'
    ? requests
    : filter === 'en_cours'
    ? requests.filter(r => ['en_evaluation', 'soumission_envoyee', 'approuve', 'en_cours'].includes(r.status))
    : filter === 'complete'
    ? requests.filter(r => ['complete', 'facture'].includes(r.status))
    : requests.filter(r => r.status === filter)

  const stats = {
    total: requests.length,
    nouveau: requests.filter(r => r.status === 'nouveau').length,
    en_cours: requests.filter(r => ['en_evaluation', 'soumission_envoyee', 'approuve', 'en_cours'].includes(r.status)).length,
    complete: requests.filter(r => ['complete', 'facture'].includes(r.status)).length,
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
            Mes demandes
          </h1>
          <p className="text-gray-500">
            {requests.length} demande{requests.length > 1 ? 's' : ''} de travaux
          </p>
        </div>
        <Link href="/manager/requests/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border transition-all ${filter === 'all' ? 'border-mrbrico-orange bg-mrbrico-orange/5' : 'hover:border-gray-300'}`}
        >
          <p className="text-2xl font-bold text-mrbrico-gray">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </button>
        <button
          onClick={() => setFilter('nouveau')}
          className={`p-4 rounded-xl border transition-all ${filter === 'nouveau' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.nouveau}</p>
          <p className="text-sm text-gray-500">Nouvelles</p>
        </button>
        <button
          onClick={() => setFilter('en_cours')}
          className={`p-4 rounded-xl border transition-all ${filter === 'en_cours' ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-300'}`}
        >
          <p className="text-2xl font-bold text-orange-600">{stats.en_cours}</p>
          <p className="text-sm text-gray-500">En cours</p>
        </button>
        <button
          onClick={() => setFilter('complete')}
          className={`p-4 rounded-xl border transition-all ${filter === 'complete' ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'}`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
          <p className="text-sm text-gray-500">Complétées</p>
        </button>
      </div>

      {/* Liste des demandes */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune demande
            </h3>
            <p className="mt-2 text-gray-500">
              Créez votre première demande de travaux
            </p>
            <Link href="/manager/requests/new" className="mt-4">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Aucune demande avec ce filtre</p>
            <Button variant="link" onClick={() => setFilter('all')}>
              Voir toutes les demandes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const status = statusConfig[request.status] || statusConfig.nouveau
            const priority = priorityConfig[request.priority] || priorityConfig.normal

            return (
              <Card key={request.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium text-mrbrico-orange">
                          #{request.request_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {request.priority !== 'normal' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                            <AlertTriangle className="h-3 w-3" />
                            {priority.label}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 font-medium text-gray-900 truncate">
                        {request.work_category} - {request.work_type}
                      </h3>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        {request.buildings && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {request.buildings.address}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.created_at).toLocaleDateString('fr-CA')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/manager/requests/${request.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
