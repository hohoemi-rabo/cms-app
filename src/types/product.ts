export interface Product {
  id: string
  name: string
  default_price: number
  unit: string
  description: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProductCreateInput {
  name: string
  default_price: number
  unit: string
  description?: string
}

export interface ProductUpdateInput {
  name?: string
  default_price?: number
  unit?: string
  description?: string
}