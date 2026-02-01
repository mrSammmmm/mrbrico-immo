'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, translateStatus, getStatusColor } from '@/lib/utils'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import type { StatusHistory } from '@/lib/supabase/database.types'

interface StatusTimelineProps {
  workRequestId: string
  currentStatus: string
}

const STATUS_ORDER = [
  'nouveau',
  'en_evaluation',
  'soumission_envoyee',
  'approuve',
  'en_cours',
  'complete',
  'facture',
]

export function StatusTimeline({ workRequestId, currentStatus }: StatusTimelineProps) {
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('status_history')
          .select('*')
          .eq('work_request_id', workRequestId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setHistory(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [workRequestId])

  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-mrbrico-gray">Progression</h3>

      {/* Timeline visuelle */}
      <div className="flex items-center justify-between">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          return (
            <div key={status} className="flex flex-col items-center">
              {/* Icône */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-mrbrico-orange text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs text-center max-w-[60px] ${
                  isCurrent ? 'font-semibold text-mrbrico-orange' : 'text-gray-500'
                }`}
              >
                {translateStatus(status)}
              </span>

              {/* Ligne de connexion */}
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={`absolute h-0.5 w-full ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{
                    left: `calc(${(100 / (STATUS_ORDER.length - 1)) * index}% + 16px)`,
                    width: `calc(${100 / (STATUS_ORDER.length - 1)}% - 32px)`,
                    top: '16px',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Historique détaillé */}
      {history.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Historique</h4>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 text-sm"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-mrbrico-blue flex-shrink-0" />
                <div>
                  <p>
                    <span className="font-medium">
                      {translateStatus(item.new_status)}
                    </span>
                    {item.old_status && (
                      <span className="text-gray-500">
                        {' '}(depuis {translateStatus(item.old_status)})
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    {formatDate(item.created_at, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {item.notes && ` — ${item.notes}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
