export type ItemStatus =
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'archived'
  | 'awaiting_approval'
  | 'draft'

export type StatusFilter = 'all' | ItemStatus

export interface CatalogItem {
  id: string
  name: string
  imageUrl: string
  sku: string
  barcode: string
  stock: number
  price: number
  currency: string
  prepTime: number
  status: ItemStatus
  branchIssues: number
  hasChoiceGroups: boolean
  hasMixedStock?: boolean
  rejectionShortReason?: string
  rejectionReason?: string
  category?: string
}

export interface SubCategory {
  id: string
  name: string
  items: CatalogItem[]
}

export interface Category {
  id: string
  name: string
  subCategories: SubCategory[]
}
