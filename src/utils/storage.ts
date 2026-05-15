export const STORAGE_KEYS = {
  RECIPES: 'recipes',
  HEALTH_RECORDS: 'health_records',
  CUSTOM_CONDITION_TAGS: 'custom_condition_tags',
  CUSTOM_TAGS: 'custom_tags',
  CUSTOM_CONDITION_INGREDIENTS: 'custom_condition_ingredients',
} as const

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = uni.getStorageSync(key)
    if (data === '' || data === undefined || data === null) {
      return defaultValue
    }
    return JSON.parse(data) as T
  } catch {
    return defaultValue
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage set error:', e)
  }
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    console.error('Storage remove error:', e)
  }
}
