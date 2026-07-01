export type DocumentType = 'invoice' | 'quotation'
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type DiscountType = 'percentage' | 'fixed'
export type PaymentMethodType = 'bank' | 'upi' | 'paypal' | 'other'
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'CHF' | 'SGD' | 'AED' | 'SAR' | 'MXN' | 'BRL' | 'ZAR'

export interface Profile {
  id: string
  company_name: string | null
  company_address: string | null
  gst_id: string | null
  email: string | null
  phone: string | null
  logo_url: string | null
  upi_id: string | null
  paypal_email: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_routing_number: string | null
  bank_swift_code: string | null
  created_at: string
  updated_at: string
  financial_year_start?: number // 1-12, month when financial year starts (default 4 = April)
  default_currency?: Currency // Default currency for new documents (default 'INR')
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  gst_id: string | null
  pan_number: string | null
  company_name: string | null
  contact_person: string | null
  auto_reminder: boolean
  created_at: string
  updated_at: string
}

export interface LineItem {
  id: string
  document_id: string
  name: string
  description: string | null
  quantity: number
  rate: number
  tax_percent: number
  line_total: number
  sort_order: number
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  client_id: string | null
  type: DocumentType
  number: string
  issue_date: string
  due_date: string | null
  valid_until: string | null // For quotations - expiry date
  status: DocumentStatus
  currency: Currency
  subtotal: number
  tax_total: number
  discount_type: DiscountType | null
  discount_value: number
  grand_total: number
  notes: string | null
  terms: string | null
  payment_method: string | null
  upi_id: string | null
  client_name: string | null
  client_email: string | null
  client_address: string | null
  client_gst_id: string | null
  include_tax: boolean
  created_at: string
  updated_at: string
  line_items?: LineItem[]
}

export interface NewLineItem {
  id?: string
  name: string
  description: string
  quantity: number
  rate: number
  tax_percent: number
}

export interface DocumentFormData {
  type: DocumentType
  number: string
  issue_date: string
  due_date: string
  valid_until: string
  status: DocumentStatus
  currency: Currency
  client_id: string | null
  client_name: string
  client_email: string
  client_address: string
  client_gst_id: string
  notes: string
  terms: string
  payment_methods: PaymentMethodType[]
  payment_method_type: PaymentMethodType | null
  payment_method: string
  upi_id: string
  paypal_email: string
  bank_name: string
  bank_account_name: string
  bank_account_number: string
  bank_routing_number: string
  bank_swift_code: string
  discount_type: DiscountType | null
  discount_value: number
  include_tax: boolean
  line_items: NewLineItem[]
}

export const CURRENCIES: { value: Currency; label: string; symbol: string; country: string }[] = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹', country: 'India' },
  { value: 'USD', label: 'US Dollar', symbol: '$', country: 'United States' },
  { value: 'EUR', label: 'Euro', symbol: '€', country: 'European Union' },
  { value: 'GBP', label: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥', country: 'China' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
  { value: 'SGD', label: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
  { value: 'SAR', label: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia' },
  { value: 'MXN', label: 'Mexican Peso', symbol: 'MX$', country: 'Mexico' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R', country: 'South Africa' },
]

export const PAYMENT_METHODS: { value: PaymentMethodType; label: string }[] = [
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
]

export const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Approximate exchange rates to INR (for revenue calculation)
export const EXCHANGE_RATES_TO_INR: Record<Currency, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90.5,
  GBP: 105.5,
  CAD: 61.5,
  AUD: 54.5,
  JPY: 0.56,
  CNY: 11.5,
  CHF: 94.5,
  SGD: 62.0,
  AED: 22.7,
  SAR: 22.3,
  MXN: 4.9,
  BRL: 17.0,
  ZAR: 4.6,
}

// Product/Service Catalog
export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  unit: string
  rate: number
  tax_rate: number
  hsn_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Payments for partial payment tracking
export interface Payment {
  id: string
  document_id: string
  user_id: string
  amount: number
  payment_date: string
  payment_method: string | null
  reference_number: string | null
  notes: string | null
  created_at: string
}

// Extended Document type with new fields
export interface DocumentWithPayments extends Document {
  share_token?: string | null
  amount_paid?: number
  last_reminder_sent?: string | null
  reminder_count?: number
  payments?: Payment[]
}
