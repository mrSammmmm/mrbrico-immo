'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WorkRequest, Building, PropertyManager } from '@/lib/supabase/database.types'

// Type étendu avec les relations
export type WorkRequestWithRelations = WorkRequest & {
  building?: Building | null
  property_manager?: PropertyManager | null
}

interface UseWorkRequestsOptions {
  status?: WorkRequest['status'] | 'all'
  priority?: WorkRequest['priority'] | 'all'
  managerId?: string
  limit?: number
}

/**
 * Hook pour récupérer les demandes de travaux
 */
export function useWorkRequests(options: UseWorkRequestsOptions = {}) {
  const { status = 'all', priority = 'all', managerId, limit = 50 } = options

  const [requests, setRequests] = useState<WorkRequestWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      let query = supabase
        .from('work_requests')
        .select(`
          *,
          building:buildings(*),
          property_manager:property_managers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filtres
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      if (priority !== 'all') {
        query = query.eq('priority', priority)
      }

      if (managerId) {
        query = query.eq('manager_id', managerId)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        throw queryError
      }

      setRequests(data || [])
    } catch (err: any) {
      console.error('Erreur lors de la récupération des demandes:', err)
      setError(err.message || 'Erreur lors de la récupération des demandes')
    } finally {
      setIsLoading(false)
    }
  }, [status, priority, managerId, limit])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const supabase = createClient()

    const subscription = supabase
      .channel('work_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_requests',
        },
        () => {
          // Recharger les demandes quand il y a un changement
          fetchRequests()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchRequests])

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
  }
}

/**
 * Hook pour récupérer une demande spécifique
 */
export function useWorkRequest(id: string | null) {
  const [request, setRequest] = useState<WorkRequestWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequest = useCallback(async () => {
    if (!id) {
      setRequest(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: queryError } = await supabase
        .from('work_requests')
        .select(`
          *,
          building:buildings(*),
          property_manager:property_managers(*)
        `)
        .eq('id', id)
        .single<Record<string, any>>()

      if (queryError) {
        throw queryError
      }

      setRequest(data)
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la demande:', err)
      setError(err.message || 'Erreur lors de la récupération de la demande')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  return {
    request,
    isLoading,
    error,
    refetch: fetchRequest,
  }
}

/**
 * Hook pour les statistiques des demandes
 */
export function useWorkRequestStats(managerId?: string) {
  const [stats, setStats] = useState({
    total: 0,
    nouveau: 0,
    en_cours: 0,
    complete: 0,
    urgent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        let query = supabase.from('work_requests').select('status, priority')

        if (managerId) {
          query = query.eq('manager_id', managerId)
        }

        const { data, error } = await query

        if (error) throw error

        const statsData = {
          total: data?.length || 0,
          nouveau: data?.filter(r => r.status === 'nouveau').length || 0,
          en_cours: data?.filter(r => ['en_evaluation', 'soumission_envoyee', 'approuve', 'en_cours'].includes(r.status)).length || 0,
          complete: data?.filter(r => ['complete', 'facture'].includes(r.status)).length || 0,
          urgent: data?.filter(r => r.priority === 'urgent').length || 0,
        }

        setStats(statsData)
      } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [managerId])

  return { stats, isLoading }
}
