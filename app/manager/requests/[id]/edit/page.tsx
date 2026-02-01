'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, ButtonLoader } from '@/components/shared/LoadingSpinner'
import { Checklist } from '@/components/requests/Checklist'
import { getPhotoUrl } from '@/lib/utils'
import { WORK_CATEGORIES, PRIORITY_OPTIONS } from '@/types'
import type { WorkRequest, Building, Photo, ChecklistItem } from '@/lib/supabase/database.types'
import {
  ArrowLeft,
  Building2,
  Home,
  Wrench,
  FileText,
  Key,
  Save,
  ImagePlus,
  X,
  Camera,
  AlertTriangle
} from 'lucide-react'

type WorkRequestWithRelations = WorkRequest & {
  buildings: Building | null
  photos: Photo[]
  checklist_items: ChecklistItem[]
}

export default function EditRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const requestId = params.id as string

  const [request, setRequest] = useState<WorkRequestWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formulaire
  const [unitNumbers, setUnitNumbers] = useState('')
  const [workType, setWorkType] = useState('')
  const [workCategory, setWorkCategory] = useState('')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [accessInfo, setAccessInfo] = useState('')

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])

  // Checklist
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])

  useEffect(() => {
    fetchRequest()
  }, [requestId])

  const fetchRequest = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_requests')
        .select(`
          *,
          buildings (*),
          photos (*),
          checklist_items (*)
        `)
        .eq('id', requestId)
        .single<Record<string, any>>()

      if (error) throw error
      if (!data) throw new Error('Demande non trouvée')

      setRequest(data)
      setUnitNumbers(data.unit_numbers?.join(', ') || '')
      setWorkType(data.work_type || '')
      setWorkCategory(data.work_category || '')
      setPriority(data.priority || 'normal')
      setDescription(data.description || '')
      setAccessInfo(data.access_info || '')
      setExistingPhotos(data.photos || [])
      setChecklistItems(data.checklist_items || [])
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = existingPhotos.length - photosToDelete.length + newPhotos.length + files.length

    if (totalPhotos > 5) {
      setError('Maximum 5 photos au total')
      return
    }

    setNewPhotos([...newPhotos, ...files])
    setError(null)
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index))
  }

  const markPhotoForDeletion = (photoId: string) => {
    setPhotosToDelete([...photosToDelete, photoId])
  }

  const unmarkPhotoForDeletion = (photoId: string) => {
    setPhotosToDelete(photosToDelete.filter(id => id !== photoId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const supabase = createClient()

      // 1. Mettre à jour la demande
      const { error: updateError } = await supabase
        .from('work_requests')
        .update({
          unit_numbers: unitNumbers.split(',').map(u => u.trim()).filter(Boolean),
          work_type: workType,
          work_category: workCategory,
          priority: priority as 'normal' | 'prioritaire' | 'urgent',
          description,
          access_info: accessInfo || null,
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // 2. Supprimer les photos marquées
      for (const photoId of photosToDelete) {
        const photo = existingPhotos.find(p => p.id === photoId)
        if (photo) {
          // Supprimer du storage
          await supabase.storage.from('photos').remove([photo.file_path])
          // Supprimer de la DB
          await supabase.from('photos').delete().eq('id', photoId)
        }
      }

      // 3. Upload des nouvelles photos
      for (const photo of newPhotos) {
        const fileName = `${requestId}/${Date.now()}-${photo.name}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photo)

        if (!uploadError) {
          await supabase.from('photos').insert({
            work_request_id: requestId,
            uploaded_by: user?.id,
            file_path: fileName,
            file_name: photo.name,
            file_size: photo.size,
            photo_type: 'initial',
          })
        }
      }

      // 4. Ajouter une entrée dans l'historique
      await supabase.from('status_history').insert({
        work_request_id: requestId,
        new_status: request?.status || 'nouveau',
        changed_by: user?.id,
        notes: 'Demande modifiée',
      })

      // Succès
      router.push(`/manager/requests/${requestId}`)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <PageLoader />

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

  const visiblePhotos = existingPhotos.filter(p => !photosToDelete.includes(p.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/manager/requests/${requestId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-mrbrico-gray">
            Modifier la demande #{request.request_number}
          </h1>
          <p className="text-gray-500">
            Modifiez les informations de votre demande
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Message d'erreur */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-mrbrico-blue" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Immeuble (lecture seule) */}
            <div className="space-y-2">
              <Label>Immeuble</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {request.buildings?.address}, {request.buildings?.city}
              </div>
            </div>

            {/* Numéro(s) d'unité */}
            <div className="space-y-2">
              <Label htmlFor="units">Numéro(s) d'unité</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="units"
                  value={unitNumbers}
                  onChange={(e) => setUnitNumbers(e.target.value)}
                  placeholder="Ex: 304 ou 102, 205, 308"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type de travaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-mrbrico-orange" />
              Type de travaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={workCategory} onValueChange={setWorkCategory} required>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Description courte</Label>
              <Input
                id="workType"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                placeholder="Ex: Fuite d'eau..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Niveau de priorité</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-mrbrico-blue" />
              Détails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le problème..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-mrbrico-orange" />
              Photos ({visiblePhotos.length + newPhotos.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photos existantes */}
            {visiblePhotos.length > 0 && (
              <div className="space-y-2">
                <Label>Photos actuelles</Label>
                <div className="flex flex-wrap gap-2">
                  {visiblePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative h-20 w-20 rounded-lg border bg-gray-50"
                    >
                      <img
                        src={getPhotoUrl(photo.file_path)}
                        alt={photo.file_name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => markPhotoForDeletion(photo.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos */}
            {newPhotos.length > 0 && (
              <div className="space-y-2">
                <Label>Nouvelles photos</Label>
                <div className="flex flex-wrap gap-2">
                  {newPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative h-20 w-20 rounded-lg border bg-gray-50"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Nouvelle ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter des photos */}
            {(visiblePhotos.length + newPhotos.length) < 5 && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-mrbrico-orange hover:bg-orange-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  multiple
                />
                <ImagePlus className="h-6 w-6 text-gray-400" />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Checklist
          workRequestId={requestId}
          mode="edit"
          items={checklistItems}
        />

        {/* Accès */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-green-600" />
              Information d'accès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={accessInfo}
              onChange={(e) => setAccessInfo(e.target.value)}
              placeholder="Comment accéder à l'unité?..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <Link href={`/manager/requests/${requestId}`}>
            <Button type="button" variant="outline" disabled={isSaving}>
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <ButtonLoader />}
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
