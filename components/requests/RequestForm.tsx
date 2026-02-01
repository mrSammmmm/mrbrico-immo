'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  SelectSeparator,
} from '@/components/ui/select'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ButtonLoader } from '@/components/shared/LoadingSpinner'
import { Checklist } from '@/components/requests/Checklist'
import { WORK_CATEGORIES, PRIORITY_OPTIONS } from '@/types'
import type { Building, ChecklistItem } from '@/lib/supabase/database.types'
import {
  Building2,
  Home,
  Wrench,
  AlertTriangle,
  FileText,
  Key,
  Send,
  ImagePlus,
  X,
  PlusCircle,
} from 'lucide-react'

interface RequestFormProps {
  onSuccess?: () => void
}

export function RequestForm({ onSuccess }: RequestFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const managerId = user?.propertyManager?.id

  // États du formulaire
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Valeurs du formulaire
  const [buildingId, setBuildingId] = useState('')
  const [unitNumbers, setUnitNumbers] = useState('')
  const [workType, setWorkType] = useState('')
  const [workCategory, setWorkCategory] = useState('')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [accessInfo, setAccessInfo] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])

  // Charger les immeubles du gestionnaire
  useEffect(() => {
    const fetchBuildings = async () => {
      if (!managerId) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('manager_id', managerId)
          .order('address')

        if (error) throw error
        setBuildings(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des immeubles:', err)
      } finally {
        setIsLoadingBuildings(false)
      }
    }

    fetchBuildings()
  }, [managerId])

  // Gestion des photos
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos autorisées')
      return
    }
    setPhotos([...photos, ...files])
    setError(null)
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Générer le numéro de demande
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('work_requests')
        .select('*', { count: 'exact', head: true })

      const requestNumber = `${year}-${String((count || 0) + 1).padStart(3, '0')}`

      // Créer la demande
      const { data: request, error: insertError } = await supabase
        .from('work_requests')
        .insert({
          request_number: requestNumber,
          manager_id: managerId,
          building_id: buildingId || null,
          unit_numbers: unitNumbers.split(',').map(u => u.trim()).filter(Boolean),
          work_type: workType,
          work_category: workCategory,
          priority: priority as 'normal' | 'prioritaire' | 'urgent',
          description,
          access_info: accessInfo || null,
          status: 'nouveau',
        })
        .select()
        .single<Record<string, any>>()

      if (insertError) throw insertError

      // Upload des photos si présentes
      if (photos.length > 0 && request) {
        for (const photo of photos) {
          const fileName = `${request.id}/${Date.now()}-${photo.name}`
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, photo)

          if (!uploadError) {
            // Enregistrer la photo dans la base
            await supabase.from('photos').insert({
              work_request_id: request.id,
              uploaded_by: user?.id,
              file_path: fileName,
              file_name: photo.name,
              file_size: photo.size,
              photo_type: 'initial',
            })
          }
        }
      }

      // Créer l'entrée dans l'historique
      if (request) {
        await supabase.from('status_history').insert({
          work_request_id: request.id,
          new_status: 'nouveau',
          changed_by: user?.id,
          notes: 'Demande créée',
        })
      }

      // Sauvegarder les checklist items
      if (request && checklistItems.length > 0) {
        for (const item of checklistItems) {
          await supabase.from('checklist_items').insert({
            work_request_id: request.id,
            description: item.description,
            item_order: item.item_order,
            is_completed: false,
          })
        }
      }

      // Succès
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/manager/requests/${request?.id}`)
      }
    } catch (err: any) {
      console.error('Erreur lors de la création:', err)
      setError(err.message || 'Erreur lors de la création de la demande')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {/* Immeuble */}
          <div className="space-y-2">
            <Label htmlFor="building">Immeuble</Label>
            <Select value={buildingId} onValueChange={setBuildingId}>
              <SelectTrigger id="building">
                <SelectValue placeholder="Sélectionner un immeuble" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.address}, {building.city}
                  </SelectItem>
                ))}
                {buildings.length > 0 && <SelectSeparator />}
                <Link
                  href="/manager/buildings/new"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500 hover:text-mrbrico-blue hover:bg-gray-50 rounded cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un immeuble
                </Link>
              </SelectContent>
            </Select>
            {buildings.length === 0 && !isLoadingBuildings && (
              <Link
                href="/manager/buildings/new"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-mrbrico-blue"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Ajouter votre premier immeuble
              </Link>
            )}
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
            <p className="text-xs text-gray-500">
              Séparez les numéros par des virgules si plusieurs unités
            </p>
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
          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={workCategory} onValueChange={setWorkCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
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

          {/* Type spécifique */}
          <div className="space-y-2">
            <Label htmlFor="workType">Description courte</Label>
            <Input
              id="workType"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              placeholder="Ex: Fuite d'eau, Prise électrique défectueuse..."
              required
            />
          </div>

          {/* Priorité */}
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
            {priority === 'urgent' && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Les demandes urgentes sont traitées en priorité
              </p>
            )}
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
          {/* Description détaillée */}
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée du problème</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail: où exactement, depuis quand, circonstances..."
              rows={4}
              required
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Photos (optionnel, max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 rounded-lg border bg-gray-50"
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accès */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-green-600" />
            Information d'accès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="access">Comment accéder à l'unité?</Label>
            <Textarea
              id="access"
              value={accessInfo}
              onChange={(e) => setAccessInfo(e.target.value)}
              placeholder="Ex: Locataire présent en journée. Appeler avant. Clé chez le concierge apt 101..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Checklist
        mode="edit"
        items={checklistItems}
        onChange={setChecklistItems}
      />

      {/* Bouton de soumission */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <ButtonLoader />}
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
        </Button>
      </div>
    </form>
  )
}
