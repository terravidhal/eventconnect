// Images par défaut pour chaque catégorie d'événements
export const CATEGORY_IMAGES = {
  'musique': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
  'sport': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  'culture': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center',
  'tech': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=center',
} as const

// Fonction utilitaire pour obtenir l'image par défaut selon la catégorie
export const getDefaultImage = (categoryName: string): string => {
  const category = Object.keys(CATEGORY_IMAGES).find(cat => 
    cat.toLowerCase() === categoryName.toLowerCase()
  )
  return category ? CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES] : CATEGORY_IMAGES.tech
}

// Image par défaut générique pour les événements sans catégorie
export const DEFAULT_EVENT_IMAGE = CATEGORY_IMAGES.tech 