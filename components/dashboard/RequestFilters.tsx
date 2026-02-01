'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/types'
import { Search, Filter, X } from 'lucide-react'

interface RequestFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  showManagerFilter?: boolean
}

export interface FilterValues {
  search: string
  status: string
  priority: string
  dateFrom: string
  dateTo: string
}

const initialFilters: FilterValues = {
  search: '',
  status: 'all',
  priority: 'all',
  dateFrom: '',
  dateTo: '',
}

export function RequestFilters({ onFilterChange, showManagerFilter }: RequestFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    onFilterChange(initialFilters)
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro, description, immeuble..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={isExpanded ? 'secondary' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-mrbrico-orange text-xs text-white">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Statut */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priorité */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priorité</label>
            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date de début */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date début</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date de fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date fin</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
