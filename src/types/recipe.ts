export type Season = '春' | '夏' | '秋' | '冬'

export interface Recipe {
  id: string
  name: string           // 菜名
  ingredients: string[]  // 食材列表
  steps: string          // 做法步骤
  seasons: Season[]      // 适合季节
  conditions: string[]   // 适合的身体状况标签
  tags: string[]         // 自定义标签
  image: string          // 图片(base64或本地路径)
  createdAt: number
  updatedAt: number
}
