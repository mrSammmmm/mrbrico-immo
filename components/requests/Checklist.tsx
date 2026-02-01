'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChecklistItem } from '@/lib/supabase/database.types'
import {
  CheckCircle2,
  Circle,
  Plus,
  X,
  GripVertical,
  Trash2
} from 'lucide-react'

interface ChecklistProps {
  workRequestId?: string
  mode: 'edit' | 'view' // edit pour gestionnaire, view pour admin
  items?: ChecklistItem[]
  onChange?: (items: ChecklistItem[]) => void
}

export function Checklist({ workRequestId, mode, items: initialItems, onChange }: ChecklistProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems || [])
  const [newItemText, setNewItemText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Charger les items depuis la DB si workRequestId est fourni
  useEffect(() => {
    if (workRequestId && !initialItems) {
      loadItems()
    }
  }, [workRequestId])

  const loadItems = async () => {
    if (!workRequestId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('work_request_id', workRequestId)
        .order('item_order')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Erreur chargement checklist:', error)
    }
  }

  const addItem = async () => {
    if (!newItemText.trim()) return

    const newItem: Partial<ChecklistItem> = {
      description: newItemText.trim(),
      item_order: items.length,
      is_completed: false
    }

    // Si on a un workRequestId, sauvegarder en DB
    if (workRequestId) {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('checklist_items')
          .insert({
            ...newItem,
            work_request_id: workRequestId
          })
          .select()
          .single()

        if (error) throw error
        setItems([...items, data])
      } catch (error) {
        console.error('Erreur ajout item:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Mode création: juste ajouter localement
      const tempItem = {
        ...newItem,
        id: `temp-${Date.now()}`,
        work_request_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        completed_by: null
      } as ChecklistItem

      const newItems = [...items, tempItem]
      setItems(newItems)
      onChange?.(newItems)
    }

    setNewItemText('')
  }

  const removeItem = async (itemId: string) => {
    if (workRequestId && !itemId.startsWith('temp-')) {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('checklist_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error
      } catch (error) {
        console.error('Erreur suppression item:', error)
        return
      } finally {
        setIsLoading(false)
      }
    }

    const newItems = items.filter(item => item.id !== itemId)
    setItems(newItems)
    onChange?.(newItems)
  }

  const toggleItem = async (itemId: string) => {
    if (mode !== 'view') return

    const item = items.find(i => i.id === itemId)
    if (!item) return

    const newCompleted = !item.is_completed

    if (workRequestId) {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('checklist_items')
          .update({
            is_completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null,
            completed_by: newCompleted ? user?.id : null
          })
          .eq('id', itemId)

        if (error) throw error
      } catch (error) {
        console.error('Erreur toggle item:', error)
        return
      } finally {
        setIsLoading(false)
      }
    }

    const newItems = items.map(i =>
      i.id === itemId
        ? {
            ...i,
            is_completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null,
            completed_by: newCompleted ? user?.id || null : null
          }
        : i
    )
    setItems(newItems)
    onChange?.(newItems)
  }

  const completedCount = items.filter(i => i.is_completed).length
  const totalCount = items.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Liste de tâches
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({completedCount}/{totalCount} complété{completedCount > 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Liste des items */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  item.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                {mode === 'edit' && (
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                )}

                <button
                  onClick={() => toggleItem(item.id)}
                  disabled={mode === 'edit'}
                  className={`flex-shrink-0 ${mode === 'view' ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <span
                  className={`flex-1 ${
                    item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {item.description}
                </span>

                {mode === 'edit' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {mode === 'edit' ? 'Aucune tâche. Ajoutez-en une ci-dessous.' : 'Aucune tâche définie'}
          </p>
        )}

        {/* Ajouter un item (mode edit seulement) */}
        {mode === 'edit' && (
          <div className="flex gap-2 pt-2 border-t">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Nouvelle tâche..."
              disabled={isLoading}
            />
            <Button
              onClick={addItem}
              disabled={!newItemText.trim() || isLoading}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
