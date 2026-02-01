'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useWorkRequest } from '@/hooks/useWorkRequests'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusTimeline } from '@/components/requests/StatusTimeline'
import { MessageThread } from '@/components/requests/MessageThread'
import { Checklist } from '@/components/requests/Checklist'
import { PageLoader, ButtonLoader } from '@/components/shared/LoadingSpinner'
import { STATUS_OPTIONS } from '@/types'
import {
  formatDate,
  translateStatus,
  translatePriority,
  getPhotoUrl,
} from '@/lib/utils'
import {
  ArrowLeft,
  Building2,
  Home,
  Calendar,
  User,
  FileText,
  Key,
  ExternalLink,
  DollarSign,
  Save,
  Camera,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminRequestDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { request, isLoading, error, refetch } = useWorkRequest(id)

  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [finalCost, setFinalCost] = useState('')

  const handleStatusUpdate = async () => {
    if (!newStatus || !request) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

      // Mettre à jour le statut
      const updates: any = { status: newStatus }

      // Ajouter les coûts si renseignés
      if (estimatedCost) {
        updates.estimated_cost = parseFloat(estimatedCost)
      }
      if (finalCost) {
        updates.final_cost = parseFloat(finalCost)
      }

      const { error: updateError } = await supabase
        .from('work_requests')
        .update(updates)
        .eq('id', request.id)

      if (updateError) throw updateError

      // Ajouter l'historique
      await supabase.from('status_history').insert({
        work_request_id: request.id,
        old_status: request.status,
        new_status: newStatus,
        changed_by: user?.id,
        notes: statusNote || null,
      })

      // Rafraîchir
      refetch()
      setNewStatus('')
      setStatusNote('')
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600">Demande non trouvée</p>
        <Link href="/admin/requests" className="mt-4">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/requests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-mrbrico-gray">
              Demande {request.request_number}
            </h1>
            <Badge variant={request.status as any}>
              {translateStatus(request.status)}
            </Badge>
            <Badge variant={request.priority as any}>
              {translatePriority(request.priority)}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-gray-600">{request.work_type}</p>
          {request.property_manager && (
            <p className="mt-1 text-sm text-gray-500">
              Client: {request.property_manager.company_name}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mise à jour du statut (Admin only) */}
          <Card className="border-mrbrico-orange/30 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-mrbrico-orange">
                <Save className="h-5 w-5" />
                Actions admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nouveau statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note (optionnel)</Label>
                  <Input
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Ajouter une note..."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Estimation ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder={request.estimated_cost?.toString() || '0.00'}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Coût final ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    placeholder={request.final_cost?.toString() || '0.00'}
                  />
                </div>
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating && <ButtonLoader />}
                Mettre à jour
              </Button>
            </CardContent>
          </Card>

          {/* Timeline de statut */}
          <Card>
            <CardContent className="pt-6">
              <StatusTimeline
                workRequestId={request.id}
                currentStatus={request.status}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-mrbrico-blue" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">
                {request.description}
              </p>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Checklist
            workRequestId={request.id}
            mode="view"
          />

          {/* Messages */}
          <Card>
            <CardContent className="pt-6">
              <MessageThread workRequestId={request.id} />
            </CardContent>
          </Card>

          {/* Information d'accès */}
          {request.access_info && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-600" />
                  Information d'accès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">
                  {request.access_info}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-mrbrico-orange" />
                  Photos ({request.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {request.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={getPhotoUrl(photo.file_path)}
                        alt={photo.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client */}
              {request.property_manager && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-gray-900">{request.property_manager.company_name}</p>
                  </div>
                </div>
              )}

              {/* Immeuble */}
              {request.building && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Immeuble</p>
                    <p className="text-gray-900">{request.building.address}</p>
                    <p className="text-sm text-gray-500">
                      {request.building.city}, {request.building.postal_code}
                    </p>
                  </div>
                </div>
              )}

              {/* Unité(s) */}
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Unité{request.unit_numbers.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-900">
                    {request.unit_numbers.join(', ')}
                  </p>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Créée le</p>
                  <p className="text-gray-900">
                    {formatDate(request.created_at, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Lien Trello */}
              {request.trello_url && (
                <a
                  href={request.trello_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-mrbrico-blue hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir sur Trello
                </a>
              )}
            </CardContent>
          </Card>

          {/* Coûts */}
          <Card>
            <CardHeader>
              <CardTitle>Coûts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Estimation</p>
                <p className="text-xl font-semibold text-gray-900">
                  {request.estimated_cost
                    ? new Intl.NumberFormat('fr-CA', {
                        style: 'currency',
                        currency: 'CAD',
                      }).format(request.estimated_cost)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Coût final</p>
                <p className="text-xl font-semibold text-mrbrico-blue">
                  {request.final_cost
                    ? new Intl.NumberFormat('fr-CA', {
                        style: 'currency',
                        currency: 'CAD',
                      }).format(request.final_cost)
                    : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
