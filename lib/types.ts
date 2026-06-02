export interface Manufacturer {
  id: string
  name: string
  slug: string
  category: 'alufefa' | 'partner' | 'sonstige'
  image_url: string | null
  created_at: string
}

export interface ProductType {
  id: string
  manufacturer_id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
  manufacturer?: Manufacturer
}

export interface Download {
  id: string
  product_type_id: string
  name: string
  file_url: string
  original_filename: string
  file_type: string
  file_size: string
  version: string
  created_at: string
  product_type?: ProductType
}

export interface DownloadLog {
  id: string
  user_id: string
  user_email: string
  user_name: string
  user_company: string
  download_id: string | null
  download_name: string
  manufacturer_name: string
  product_name: string
  downloaded_at: string
}

export type ActionState = {
  message?: string
  errors?: Record<string, string[] | undefined>
  success?: boolean
}

export const MANUFACTURER_CATEGORIES = [
  { value: 'alufefa', label: 'ALUFEFA Produkte' },
  { value: 'partner', label: 'Produkte unserer Partner' },
  { value: 'sonstige', label: 'Sonstige Dateien' },
] as const

export type ManufacturerCategory = 'alufefa' | 'partner' | 'sonstige'
