'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useWorkRequests, useWorkRequestStats } from '@/hooks/useWorkRequests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RequestCardCompact } from '@/components/dashboard/RequestCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp,
  FileText,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()

  const { stats, isLoading: statsLoading } = useWorkRequestStats()
  const { requests: recentRequests, isLoading: requestsLoading } = useWorkRequests({
    limit: 10,
  })
  const { requests: urgentRequests } = useWorkRequests({
    priority: 'urgent',
    limit: 5,
  })

  const isLoading = authLoading || statsLoading || requestsLoading

  if (isLoading) {
    return <PageLoader />
  }

  const newRequests = recentRequests.filter(r => r.status === 'nouveau')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Tableau de bord Admin
          </h1>
          <p className="text-gray-500">
            Vue d'ensemble de toutes les demandes de travaux
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/requests">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Toutes les demandes
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="secondary">
              <TrendingUp className="mr-2 h-4 w-4" />
              Rapports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total demandes"
          value={stats.total}
          icon={ClipboardList}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Nouvelles"
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
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Alertes urgentes */}
      {urgentRequests.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Demandes urgentes ({urgentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-red-100">
              {urgentRequests.map((request) => (
                <RequestCardCompact key={request.id} request={request} basePath="/admin" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grille 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nouvelles demandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-mrbrico-orange" />
              Nouvelles demandes
            </CardTitle>
            <Link href="/admin/requests?status=nouveau">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {newRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="mt-2 text-gray-500">
                  Aucune nouvelle demande à traiter
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {newRequests.slice(0, 5).map((request) => (
                  <RequestCardCompact key={request.id} request={request} basePath="/admin" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-mrbrico-blue" />
              Activité récente
            </CardTitle>
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentRequests.slice(0, 5).map((request) => (
                <RequestCardCompact key={request.id} request={request} basePath="/admin" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accès rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/managers">
          <Card className="card-hover cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-mrbrico-blue" />
              </div>
              <div>
                <h3 className="font-semibold">Gestionnaires</h3>
                <p className="text-sm text-gray-500">Gérer les comptes clients</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/buildings">
          <Card className="card-hover cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Immeubles</h3>
                <p className="text-sm text-gray-500">Voir tous les immeubles</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="card-hover cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Rapports</h3>
                <p className="text-sm text-gray-500">Statistiques et exports</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
