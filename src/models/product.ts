    
export type ProductSource = 'themealdb' | 'dummyjson' | 'local'

export interface Category {
  id: string
  name: string
}

export interface Nutrition {
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
}

export interface Product {
  id: string
  name: string
  image: string
  category: string
  price: number
  source: ProductSource
  ingredients: string[]
  calories?: number
  nutrition?: Nutrition
  isAvailable: boolean
  type?: 'FOOD' | 'DRINK'
  categoryId?: string
  description?: string
  isFeatured?: boolean
  imageFileName?: string
  imageSourceUrl?: string
}

export type LunchProduct = Product
