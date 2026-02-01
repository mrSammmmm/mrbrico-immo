/**
 * Types principaux pour l'application MrBrico Immo
 * Réexporte les types de la base de données et ajoute des types additionnels
 */

// Réexport des types database
export type {
  User,
  PropertyManager,
  Building,
  WorkRequest,
  Message,
  Photo,
  Document,
  StatusHistory,
  WorkRequestStatus,
  Priority,
  UserRole,
} from '@/lib/supabase/database.types'

// Types additionnels pour l'UI

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  managerOnly?: boolean
}

export interface SelectOption {
  label: string
  value: string
}

// Options pour les formulaires
export const WORK_CATEGORIES: SelectOption[] = [
  { label: 'Plomberie', value: 'plumbing' },
  { label: 'Électricité', value: 'electrical' },
  { label: 'Rénovation', value: 'renovation' },
  { label: 'Peinture', value: 'painting' },
  { label: 'Plancher', value: 'flooring' },
  { label: 'Chauffage/Climatisation', value: 'hvac' },
  { label: 'Toiture', value: 'roofing' },
  { label: 'Fenêtres', value: 'windows' },
  { label: 'Portes', value: 'doors' },
  { label: 'Général', value: 'general' },
  { label: 'Urgence', value: 'emergency' },
]

export const PRIORITY_OPTIONS: SelectOption[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Prioritaire', value: 'prioritaire' },
  { label: 'Urgent', value: 'urgent' },
]

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Nouveau', value: 'nouveau' },
  { label: 'En évaluation', value: 'en_evaluation' },
  { label: 'Soumission envoyée', value: 'soumission_envoyee' },
  { label: 'Approuvé', value: 'approuve' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Complété', value: 'complete' },
  { label: 'Facturé', value: 'facture' },
]

// Type pour les formulaires de création de demande
export interface CreateWorkRequestInput {
  buildingId: string
  unitNumbers: string[]
  workType: string
  workCategory: string
  priority: 'normal' | 'prioritaire' | 'urgent'
  description: string
  accessInfo?: string
  contactEmail?: boolean
  contactPhone?: boolean
  contactSms?: boolean
  contactPortal?: boolean
}

// Type pour les filtres de liste
export interface WorkRequestFilters {
  status?: string
  priority?: string
  managerId?: string
  buildingId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
