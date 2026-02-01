import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine des classes CSS avec clsx et tailwind-merge
 * Permet de fusionner proprement les classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Formate une date relative (il y a X minutes/heures/jours)
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  return formatDate(d)
}

/**
 * Génère un numéro de demande (format: ANNÉE-XXX)
 */
export function generateRequestNumber(count: number): string {
  const year = new Date().getFullYear()
  const num = String(count).padStart(3, '0')
  return `${year}-${num}`
}

/**
 * Traduit le statut en français lisible
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    nouveau: 'Nouveau',
    en_evaluation: 'En évaluation',
    soumission_envoyee: 'Soumission envoyée',
    approuve: 'Approuvé',
    en_cours: 'En cours',
    complete: 'Complété',
    facture: 'Facturé',
  }
  return statusMap[status] || status
}

/**
 * Traduit la priorité en français
 */
export function translatePriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    normal: 'Normal',
    prioritaire: 'Prioritaire',
    urgent: 'Urgent',
  }
  return priorityMap[priority] || priority
}

/**
 * Retourne la couleur associée à une priorité
 */
export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-800',
    prioritaire: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
  }
  return colorMap[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Retourne la couleur associée à un statut
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    nouveau: 'bg-blue-100 text-blue-800',
    en_evaluation: 'bg-purple-100 text-purple-800',
    soumission_envoyee: 'bg-indigo-100 text-indigo-800',
    approuve: 'bg-green-100 text-green-800',
    en_cours: 'bg-orange-100 text-orange-800',
    complete: 'bg-emerald-100 text-emerald-800',
    facture: 'bg-teal-100 text-teal-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Formate un montant en dollars canadiens
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Génère l'URL publique d'une photo depuis Supabase Storage
 * @param filePath - Le chemin du fichier dans le bucket 'photos'
 * @returns L'URL publique de la photo
 */
export function getPhotoUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL n\'est pas défini')
    return ''
  }

  // Format: https://[project-ref].supabase.co/storage/v1/object/public/photos/[file-path]
  return `${supabaseUrl}/storage/v1/object/public/photos/${filePath}`
}
