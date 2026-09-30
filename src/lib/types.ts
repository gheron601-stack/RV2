export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type OrderStatus =
  | 'pending_payment'
  | 'pending_verification'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'payment_rejected'
  | 'cancelled';

export type ProductCategory = 'device' | 'pod' | 'eliquid' | 'coil' | 'accessory';

export type LogisticsCompany = 'standard' | 'lalamove' | 'lbc';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  address?: string;
  id_document_url?: string;
  verification_status: VerificationStatus;
  is_admin: boolean;
  created_at: string;
}

export interface Flavor {
  name: string;
  stock: number;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  category: ProductCategory;
  brand: string;
  ps_license_no?: string;
  image_url?: string;
  flavors?: Flavor[];
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  flavor?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer?: Profile;
  status: OrderStatus;
  total_amount: number;
  logistics_company: LogisticsCompany;
  detailed_address?: string;
  contact_full_name: string;
  contact_phone: string;
  reference_code: string;
  tracking_no?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment_proof?: PaymentProof;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  image_url: string;
  uploaded_at: string;
  review_status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_notes?: string;
  reviewed_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFlavor?: string;
}

export interface PaymentMethod {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_image_url?: string;
}

export interface ShopSettings {
  payment_methods: PaymentMethod[];
}
