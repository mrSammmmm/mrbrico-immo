'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useWorkRequests, useWorkRequestStats } from '@/hooks/useWorkRequests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RequestCard } from '@/components/dashboard/RequestCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react'

export default function ManagerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const managerId = user?.propertyManager?.id

  const { stats, isLoading: statsLoading } = useWorkRequestStats(managerId)
  const { requests, isLoading: requestsLoading } = useWorkRequests({
    managerId,
    limit: 5,
  })

  const isLoading = authLoading || statsLoading || requestsLoading

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Bonjour, {user?.full_name?.split(' ')[0] || 'Gestionnaire'}!
          </h1>
          <p className="text-gray-500">
            Voici un aperçu de vos demandes de travaux
          </p>
        </div>
        <Link href="/manager/requests/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total demandes"
          value={stats.total}
          icon={ClipboardList}
          color="blue"
        />
        <StatsCard
          title="En attente"
          value={stats.nouveau}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="En cours"
          value={stats.en_cours}
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Complétées"
          value={stats.complete}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Demandes urgentes */}
      {stats.urgent > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">
                {stats.urgent} demande{stats.urgent > 1 ? 's' : ''} urgente{stats.urgent > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">
                Ces demandes nécessitent une attention immédiate
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demandes récentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Demandes récentes</CardTitle>
          <Link href="/manager/requests">
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} basePath="/manager" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
