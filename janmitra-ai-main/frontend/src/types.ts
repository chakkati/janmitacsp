export type Lang = 'en' | 'te'
export type TabId = 'dashboard' | 'chat' | 'schemes' | 'saved' | 'profile'
export type FontSize = 'normal' | 'large' | 'extra-large'

export interface SchemeDocument {
  id: string
  name: string
  code: string
  description?: string
}

export interface RuleMatch {
  field_name: string
  description: string
  passed: boolean
  error_message?: string
}

export interface EligibilityResult {
  scheme_id: string
  scheme_name: string
  eligible: boolean
  benefits_summary: string
  rules_checked: RuleMatch[]
  required_documents: SchemeDocument[]
  official_website?: string
  helpline?: string
  pdf_source_url?: string
}

export interface Profile {
  id: string
  full_name: string
  phone_number: string
  age: number
  gender: string
  caste_category: string
  occupation: string
  annual_income: number
  is_disabled: boolean
  is_farmer: boolean
  district: string
  state: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; url: string }[]
  created_at: string
}

export interface HealthStatus {
  status: string
  api: string
  database: string
}

export interface ProfileUpdatePayload {
  full_name: string
  phone_number: string
  age: number
  gender: string
  caste_category: string
  occupation: string
  annual_income: number
  is_disabled: boolean
  is_farmer: boolean
  district: string
  state: string
}
