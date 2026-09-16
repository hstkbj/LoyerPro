export type UserRole = 'owner' | 'agency' | 'superadmin';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationDocument {
  id: string;
  name: string;
  document_type: 'id_card' | 'passport' | 'business_register' | 'property_deed' | 'agency_mandate' | 'tax_certificate' | 'other';
  file_url: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  agency_name?: string;
  country?: string;
  city?: string;
  is_suspended?: boolean;
  verification_status?: VerificationStatus;
  verification_documents?: VerificationDocument[];
  verified_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserProfile = Profile;

export type PropertyType = 
  | 'Chambre seule'
  | 'Chambre & Salon'
  | 'Studio'
  | 'Colocation'
  | 'Appartement'
  | 'Villa'
  | 'Maison'
  | 'Bureau / Commerce'
  | 'Immeuble'
  | 'Terrain';

export type PropertyStatus = 'available' | 'rented' | 'maintenance';

export interface Property {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description?: string;
  type: PropertyType;
  country?: string;
  city: string;
  neighborhood?: string;
  address?: string;
  price: number;
  currency?: string;
  bedrooms: number;
  bathrooms: number;
  surface?: number;
  amenities: string[];
  conditions?: string;
  status: PropertyStatus;
  published: boolean;
  is_published?: boolean;
  photos: string[];
  // Room-specific & tenant rental details
  room_category?: 'chambre_seule' | 'chambre_salon' | 'studio' | 'colocation' | 'appartement' | 'villa' | 'autre';
  deposit_months?: number; // Ex: 1 ou 2 mois de caution
  charges_included?: boolean;
  utilities_included?: string[]; // e.g. ['Eau', 'Électricité', 'Wi-Fi haut débit', 'Ménage', 'Gardiennage']
  bathroom_type?: 'private' | 'shared';
  kitchen_type?: 'private' | 'shared' | 'none';
  owner_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  // optional joined owner info for public view
  owner?: {
    full_name: string;
    agency_name?: string;
    phone: string;
    email?: string;
    role: UserRole;
    is_verified?: boolean;
    verification_status?: VerificationStatus;
  };
  profiles?: {
    full_name: string;
    agency_name?: string;
    phone: string;
    email?: string;
    role: UserRole;
    is_verified?: boolean;
    verification_status?: VerificationStatus;
  };
}

export interface Tenant {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  id_card_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
}

export type ContractStatus = 'active' | 'ended' | 'terminated';

export interface Contract {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
  payment_day?: number;
  payment_due_day?: number;
  terms?: string;
  status: ContractStatus;
  created_at?: string;
  property?: Property;
  tenant?: Tenant;
}

export type PaymentMethod = 'MTN Mobile Money' | 'Moov Money' | 'momo' | 'flooz' | 'virement' | 'Virement bancaire' | 'especes' | 'Espèces' | 'cheque' | 'Chèque' | string;
export type PaymentStatus = 'completed' | 'received' | 'pending' | 'unpaid' | 'late' | string;

export interface Payment {
  id: string;
  user_id: string;
  contract_id?: string;
  property_id?: string;
  tenant_id?: string;
  amount: number;
  payment_date: string;
  month: string;
  period_month?: string; // "YYYY-MM"
  payment_method: PaymentMethod;
  reference?: string;
  status: PaymentStatus;
  notes?: string;
  created_at?: string;
  property?: Property;
  tenant?: Tenant;
}

export type ExpenseCategory = 
  | 'Travaux & Réparations' 
  | 'Électricité & Eau' 
  | 'Impôts & Foncier' 
  | 'Frais d\'agence' 
  | 'Entretien courant' 
  | 'Autre'
  | 'reparation' 
  | 'entretien' 
  | 'eau' 
  | 'electricite' 
  | 'travaux' 
  | 'autre'
  | string;

export interface Expense {
  id: string;
  user_id: string;
  property_id?: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string;
  provider_name?: string;
  created_at?: string;
  property?: Property;
}

export type VisitStatus = 'pending' | 'accepted' | 'rejected' | 'rescheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface VisitRequest {
  id: string;
  property_id: string;
  owner_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: VisitStatus;
  counter_proposal?: string;
  created_at?: string;
  property?: Property;
}

export type InquiryStatus = 'new' | 'in_progress' | 'resolved';

export interface Inquiry {
  id: string;
  property_id: string;
  owner_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  message: string;
  status: InquiryStatus;
  is_replied?: boolean;
  created_at: string;
  property?: Property;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in FCFA
  currency: string;
  interval: 'month' | 'year';
  max_properties: number;
  max_tenants?: number;
  description: string;
  features: string[];
  popular?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  trial_days?: number;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string;
  amount: number;
  transaction_id?: string;
  payment_gateway: string;
  created_at?: string;
  plan?: SubscriptionPlan;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  fedapay_transaction_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'canceled';
  payment_method?: string;
  created_at?: string;
}
