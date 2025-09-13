export interface BankInfo {
  bank_name?: string
  branch_name?: string
  account_type?: string
  account_number?: string
  account_holder?: string
}

export interface CompanySettings {
  id: string
  company_name: string
  postal_code: string | null
  address: string
  phone: string
  email: string | null
  fax: string | null
  bank_info: BankInfo | null
  created_at: string
  updated_at: string
}

export interface CompanySettingsInput {
  company_name: string
  postal_code?: string
  address: string
  phone: string
  email?: string
  fax?: string
  bank_info?: BankInfo
}