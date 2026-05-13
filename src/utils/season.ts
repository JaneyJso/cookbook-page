import type { Season } from '@/types/recipe'

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

export function getSeasonColor(season: Season): string {
  const colorMap: Record<Season, string> = {
    '春': '#4CAF50',
    '夏': '#FF9800',
    '秋': '#FFC107',
    '冬': '#2196F3',
  }
  return colorMap[season]
}

export function getSeasonEmoji(season: Season): string {
  const emojiMap: Record<Season, string> = {
    '春': '🌸',
    '夏': '☀️',
    '秋': '🍂',
    '冬': '❄️',
  }
  return emojiMap[season]
}

export function getAllSeasons(): Season[] {
  return ['春', '夏', '秋', '冬']
}
