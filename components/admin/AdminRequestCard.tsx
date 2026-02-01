'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeDate, translateStatus, translatePriority } from '@/lib/utils'
import { Building2, Clock, User, ArrowRight, MoreVertical, CheckCircle, XCircle, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { WorkRequestWithRelations } from '@/hooks/useWorkRequests'
import type { WorkRequest } from '@/lib/supabase/database.types'

interface AdminRequestCardProps {
  request: WorkRequestWithRelations
  onStatusChange?: () => void
}

export function AdminRequestCard({ request, onStatusChange }: AdminRequestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: WorkRequest['status']) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

      // Mettre à jour le statut
      const { error } = await supabase
        .from('work_requests')
        .update({ status: newStatus })
        .eq('id', request.id)

      if (error) throw error

      // Créer une entrée dans l'historique
      await supabase.from('status_history').insert({
        work_request_id: request.id,
        old_status: request.status,
        new_status: newStatus,
        comment: 'Changement rapide depuis la liste admin',
      })

      // Rafraîchir la liste
      onStatusChange?.()
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error)
      alert(`Erreur: ${error.message || 'Impossible de changer le statut'}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Infos principales */}
          <Link href={`/admin/requests/${request.id}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
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

            <h3 className="mt-2 font-medium text-mrbrico-gray truncate">
              {request.work_type}
            </h3>

            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {request.description}
            </p>

            {/* Métadonnées */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {request.property_manager && (
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[150px]">
                    {request.property_manager.company_name}
                  </span>
                </div>
              )}
              {request.building && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[150px]">
                    {request.building.address}
                  </span>
                </div>
              )}
              {request.unit_numbers?.length > 0 && (
                <span>
                  Unité{request.unit_numbers.length > 1 ? 's' : ''}: {request.unit_numbers.join(', ')}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatRelativeDate(request.created_at)}</span>
              </div>
            </div>
          </Link>

          {/* Actions rapides */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/admin/requests/${request.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isUpdating}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {request.status === 'nouveau' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('en_evaluation')}>
                      <PlayCircle className="mr-2 h-4 w-4 text-blue-600" />
                      Passer en évaluation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('refuse')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Refuser
                    </DropdownMenuItem>
                  </>
                )}

                {request.status === 'en_evaluation' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('soumission_envoyee')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Marquer soumission envoyée
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('refuse')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Refuser
                    </DropdownMenuItem>
                  </>
                )}

                {request.status === 'soumission_envoyee' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('approuve')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Marquer approuvé
                  </DropdownMenuItem>
                )}

                {request.status === 'approuve' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('en_cours')}>
                    <PlayCircle className="mr-2 h-4 w-4 text-blue-600" />
                    Démarrer les travaux
                  </DropdownMenuItem>
                )}

                {request.status === 'en_cours' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('complete')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Marquer complété
                  </DropdownMenuItem>
                )}

                {request.status === 'complete' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('facture')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Marquer facturé
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/requests/${request.id}`}>
                    Voir les détails
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
