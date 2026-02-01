/**
 * Constantes de l'application MrBrico Immo
 */

// URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://mrbrico.ca'

// Limites
export const MAX_PHOTOS_PER_REQUEST = 5
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Catégories de travaux avec icônes
export const WORK_CATEGORY_ICONS: Record<string, string> = {
  plumbing: '🔧',
  electrical: '⚡',
  renovation: '🏗️',
  painting: '🎨',
  flooring: '🪵',
  hvac: '❄️',
  roofing: '🏠',
  windows: '🪟',
  doors: '🚪',
  general: '🔨',
  emergency: '🚨',
}

// Couleurs des statuts pour les badges
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  nouveau: { bg: 'bg-blue-100', text: 'text-blue-800' },
  en_evaluation: { bg: 'bg-purple-100', text: 'text-purple-800' },
  soumission_envoyee: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  approuve: { bg: 'bg-green-100', text: 'text-green-800' },
  en_cours: { bg: 'bg-orange-100', text: 'text-orange-800' },
  complete: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  facture: { bg: 'bg-teal-100', text: 'text-teal-800' },
}

// Couleurs des priorités
export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-gray-100', text: 'text-gray-800' },
  prioritaire: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800' },
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  VALIDATION: 'Veuillez vérifier les informations saisies.',
  FILE_TOO_LARGE: `Le fichier est trop volumineux. Maximum: ${MAX_FILE_SIZE_MB} MB`,
  MAX_PHOTOS: `Vous pouvez ajouter maximum ${MAX_PHOTOS_PER_REQUEST} photos.`,
}

// Messages de succès
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Votre demande a été créée avec succès.',
  REQUEST_UPDATED: 'La demande a été mise à jour.',
  MESSAGE_SENT: 'Votre message a été envoyé.',
  FILE_UPLOADED: 'Le fichier a été téléversé.',
  STATUS_CHANGED: 'Le statut a été modifié.',
}
