'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { STATUS_OPTIONS, WORK_CATEGORIES } from '@/types'
import {
  TrendingUp,
  ClipboardList,
  Building2,
  Calendar,
  PieChart,
} from 'lucide-react'

interface Stats {
  totalRequests: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  byMonth: { month: string; count: number }[]
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        const { data: requests, error } = await supabase
          .from('work_requests')
          .select('status, work_category, created_at')

        if (error) throw error

        // Calculer les stats
        const byStatus: Record<string, number> = {}
        const byCategory: Record<string, number> = {}
        const byMonth: Record<string, number> = {}

        requests?.forEach((req) => {
          // Par statut
          byStatus[req.status] = (byStatus[req.status] || 0) + 1

          // Par catégorie
          if (req.work_category) {
            byCategory[req.work_category] = (byCategory[req.work_category] || 0) + 1
          }

          // Par mois
          if (req.created_at) {
            const month = new Date(req.created_at).toLocaleDateString('fr-CA', {
              year: 'numeric',
              month: 'long',
            })
            byMonth[month] = (byMonth[month] || 0) + 1
          }
        })

        setStats({
          totalRequests: requests?.length || 0,
          byStatus,
          byCategory,
          byMonth: Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([month, count]) => ({ month, count })),
        })
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <PageLoader />
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status
  }

  const getCategoryLabel = (category: string) => {
    return WORK_CATEGORIES.find(c => c.value === category)?.label || category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-mrbrico-gray">
          Rapports et statistiques
        </h1>
        <p className="text-gray-500">
          Vue d'ensemble des demandes de travaux
        </p>
      </div>

      {/* Total */}
      <Card className="bg-gradient-to-r from-mrbrico-blue to-blue-600">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <ClipboardList className="h-7 w-7 text-white" />
          </div>
          <div className="text-white">
            <p className="text-sm opacity-80">Total des demandes</p>
            <p className="text-3xl font-bold">{stats?.totalRequests || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats par statut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-mrbrico-orange" />
            Par statut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm text-gray-600">
                  {getStatusLabel(status)}
                </span>
                <span className="font-semibold text-mrbrico-gray">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-mrbrico-blue" />
            Par catégorie de travaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats?.byCategory || {})
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const percentage = stats?.totalRequests
                  ? Math.round((count / stats.totalRequests) * 100)
                  : 0
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{getCategoryLabel(category)}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-mrbrico-orange"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Évolution mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Évolution mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.byMonth && stats.byMonth.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {stats.byMonth.map(({ month, count }) => {
                const maxCount = Math.max(...stats.byMonth.map(m => m.count))
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium">{count}</span>
                    <div
                      className="w-full bg-mrbrico-blue rounded-t"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                    />
                    <span className="text-xs text-gray-500 text-center truncate w-full">
                      {month.split(' ')[0].slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Pas encore de données à afficher
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
