import type { Recipe, Season } from '@/types/recipe'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId } from '@/utils/id'

export function getAllRecipes(): Recipe[] {
  return getStorage<Recipe[]>(STORAGE_KEYS.RECIPES, [])
}

export function getRecipeById(id: string): Recipe | undefined {
  const recipes = getAllRecipes()
  return recipes.find(r => r.id === id)
}

export function createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Recipe {
  const now = Date.now()
  const recipe: Recipe = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  const recipes = getAllRecipes()
  recipes.unshift(recipe)
  setStorage(STORAGE_KEYS.RECIPES, recipes)
  return recipe
}

export function updateRecipe(
  id: string,
  data: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>,
): Recipe | undefined {
  const recipes = getAllRecipes()
  const index = recipes.findIndex(r => r.id === id)
  if (index === -1) return undefined

  recipes[index] = {
    ...recipes[index],
    ...data,
    updatedAt: Date.now(),
  }
  setStorage(STORAGE_KEYS.RECIPES, recipes)
  return recipes[index]
}

export function deleteRecipe(id: string): boolean {
  const recipes = getAllRecipes()
  const filtered = recipes.filter(r => r.id !== id)
  if (filtered.length === recipes.length) return false
  setStorage(STORAGE_KEYS.RECIPES, filtered)
  return true
}

export function searchRecipes(keyword: string): Recipe[] {
  const recipes = getAllRecipes()
  if (!keyword.trim()) return recipes
  const lower = keyword.toLowerCase()
  return recipes.filter(
    r =>
      r.name.toLowerCase().includes(lower) ||
      r.ingredients.some(i => i.toLowerCase().includes(lower)),
  )
}

export function filterRecipes(options: {
  seasons?: Season[]
  conditions?: string[]
  tags?: string[]
}): Recipe[] {
  const recipes = getAllRecipes()
  return recipes.filter(r => {
    if (options.seasons?.length && !options.seasons.some(s => r.seasons.includes(s))) {
      return false
    }
    if (
      options.conditions?.length &&
      !options.conditions.some(c => r.conditions.includes(c))
    ) {
      return false
    }
    if (options.tags?.length && !options.tags.some(t => r.tags.includes(t))) {
      return false
    }
    return true
  })
}

export function getRecommendedRecipes(
  season: Season,
  conditions: string[],
): Recipe[] {
  const recipes = getAllRecipes()
  const scored = recipes
    .filter(r => r.seasons.includes(season))
    .map(r => {
      const matchedConditions = conditions.filter(c => r.conditions.includes(c))
      const score = matchedConditions.length
      return { recipe: r, score }
    })

  scored.sort((a, b) => b.score - a.score)
  return scored.map(s => s.recipe)
}
