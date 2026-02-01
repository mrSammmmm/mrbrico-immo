'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { Checklist } from '@/components/requests/Checklist'
import { getPhotoUrl } from '@/lib/utils'
import type { WorkRequest, Building, Message, Photo, ChecklistItem } from '@/lib/supabase/database.types'
import {
  ArrowLeft,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Camera,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Monitor,
  Send,
  Edit
} from 'lucide-react'

type WorkRequestDetails = WorkRequest & {
  buildings: Building | null
  messages: Message[]
  photos: Photo[]
  checklist_items: ChecklistItem[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  nouveau: {
    label: 'Nouveau',
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock className="h-4 w-4" />
  },
  en_evaluation: {
    label: 'En évaluation',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="h-4 w-4" />
  },
  soumission_envoyee: {
    label: 'Soumission envoyée',
    color: 'bg-purple-100 text-purple-700',
    icon: <Clock className="h-4 w-4" />
  },
  approuve: {
    label: 'Approuvé',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  en_cours: {
    label: 'En cours',
    color: 'bg-orange-100 text-orange-700',
    icon: <Clock className="h-4 w-4" />
  },
  complete: {
    label: 'Complété',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  facture: {
    label: 'Facturé',
    color: 'bg-gray-100 text-gray-700',
    icon: <CheckCircle2 className="h-4 w-4" />
  },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-600' },
  prioritaire: { label: 'Prioritaire', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const requestId = params.id as string

  const [request, setRequest] = useState<WorkRequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return

      try {
        const supabase = createClient()

        const { data, error} = await supabase
          .from('work_requests')
          .select(`
            *,
            buildings (*),
            messages (*),
            photos (*),
            checklist_items (*)
          `)
          .eq('id', requestId)
          .single<Record<string, any>>()

        if (error) throw error
        setRequest(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [requestId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !request) return

    setIsSending(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('messages')
        .insert({
          work_request_id: request.id,
          sender_id: user.id,
          sender_type: 'manager',
          message: newMessage.trim()
        })
        .select()
        .single<Record<string, any>>()

      if (error) throw error

      setRequest({
        ...request,
        messages: [...request.messages, data]
      })
      setNewMessage('')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Demande non trouvée</p>
        <Link href="/manager/requests">
          <Button variant="link">Retour aux demandes</Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[request.status] || statusConfig.nouveau
  const priority = priorityConfig[request.priority] || priorityConfig.normal

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/manager/requests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-mrbrico-gray">
              Demande #{request.request_number}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
            {request.priority !== 'normal' && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}>
                <AlertTriangle className="h-4 w-4" />
                {priority.label}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            Créée le {new Date(request.created_at).toLocaleDateString('fr-CA')}
          </p>
        </div>
        <Link href={`/manager/requests/${requestId}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la demande */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-mrbrico-orange" />
                Détails de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-medium">{request.work_category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type de travaux</p>
                  <p className="font-medium">{request.work_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap">{request.description}</p>
              </div>

              {request.unit_numbers && request.unit_numbers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Unités concernées</p>
                  <p className="font-medium">{request.unit_numbers.join(', ')}</p>
                </div>
              )}

              {request.access_info && (
                <div>
                  <p className="text-sm text-gray-500">Informations d'accès</p>
                  <p className="mt-1">{request.access_info}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Checklist
            workRequestId={requestId}
            mode="edit"
            items={request.checklist_items}
          />

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-mrbrico-orange" />
                Messages ({request.messages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.messages && request.messages.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {request.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender_type === 'manager'
                          ? 'bg-mrbrico-orange/10 ml-8'
                          : 'bg-gray-100 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {msg.sender_type === 'manager' ? 'Vous' : 'MrBrico'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString('fr-CA')}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun message</p>
              )}

              {/* Nouveau message */}
              <div className="flex gap-2 pt-4 border-t">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mrbrico-orange/50"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>

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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Immeuble */}
          {request.buildings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-mrbrico-orange" />
                  Immeuble
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{request.buildings.address}</p>
                <p className="text-gray-500">
                  {request.buildings.city}, {request.buildings.postal_code}
                </p>
                {request.buildings.unit_count && (
                  <p className="text-sm text-gray-500">
                    {request.buildings.unit_count} unités
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Préférences de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Préférences de contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${request.contact_email ? 'text-green-600' : 'text-gray-400'}`}>
                  <Mail className="h-4 w-4" />
                  <span>Courriel {request.contact_email ? '✓' : ''}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${request.contact_phone ? 'text-green-600' : 'text-gray-400'}`}>
                  <Phone className="h-4 w-4" />
                  <span>Téléphone {request.contact_phone ? '✓' : ''}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${request.contact_sms ? 'text-green-600' : 'text-gray-400'}`}>
                  <MessageCircle className="h-4 w-4" />
                  <span>SMS {request.contact_sms ? '✓' : ''}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${request.contact_portal ? 'text-green-600' : 'text-gray-400'}`}>
                  <Monitor className="h-4 w-4" />
                  <span>Portail {request.contact_portal ? '✓' : ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coûts (si disponibles) */}
          {(request.estimated_cost || request.final_cost) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coûts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {request.estimated_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimé</span>
                    <span className="font-medium">{request.estimated_cost.toFixed(2)} $</span>
                  </div>
                )}
                {request.final_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Final</span>
                    <span className="font-medium">{request.final_cost.toFixed(2)} $</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lien Trello (si disponible) */}
          {request.trello_url && (
            <Card>
              <CardContent className="pt-6">
                <a
                  href={request.trello_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  Voir sur Trello
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
