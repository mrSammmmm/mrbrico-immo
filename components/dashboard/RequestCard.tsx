import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, translateStatus, translatePriority } from '@/lib/utils'
import { Building2, Clock, User, ArrowRight } from 'lucide-react'
import type { WorkRequestWithRelations } from '@/hooks/useWorkRequests'

interface RequestCardProps {
  request: WorkRequestWithRelations
  basePath?: string
  showManager?: boolean
}

export function RequestCard({ request, basePath = '/manager', showManager = false }: RequestCardProps) {
  return (
    <Link href={`${basePath}/requests/${request.id}`}>
      <Card className="card-hover cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Infos principales */}
            <div className="flex-1 min-w-0">
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
                {showManager && request.property_manager && (
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
            </div>

            {/* Flèche */}
            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/**
 * Version compacte pour les listes admin
 */
export function RequestCardCompact({ request, basePath = '/admin' }: RequestCardProps) {
  return (
    <Link href={`${basePath}/requests/${request.id}`}>
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-sm font-semibold text-mrbrico-blue shrink-0">
            {request.request_number}
          </span>
          <span className="truncate text-sm">
            {request.work_type}
          </span>
          <Badge variant={request.status as any} className="shrink-0">
            {translateStatus(request.status)}
          </Badge>
          {request.priority === 'urgent' && (
            <Badge variant="urgent" className="shrink-0">
              Urgent
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
          {request.property_manager && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{request.property_manager.company_name}</span>
            </div>
          )}
          <span>{formatRelativeDate(request.created_at)}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
