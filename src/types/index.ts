/* ─── Auth & Users ────────────────────────────────────── */
export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  addresses: Address[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  department: string;
  zip_code?: string;
  is_default: boolean;
}

/* ─── Categories ──────────────────────────────────────── */
export type Gender = "hombre" | "mujer" | "unisex";

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  image_url: string | null;
  created_at: string;
}

/* ─── Products ────────────────────────────────────────── */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_on_sale: boolean;
  sale_price: number | null;
  discount_percent: number | null;
  sale_start_at: string | null;
  sale_end_at: string | null;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
}

/* ─── Cart ────────────────────────────────────────────── */
export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_variant_id: string;
  quantity: number;
  variant?: ProductVariant & { product?: Product };
}

/* ─── Orders ──────────────────────────────────────────── */
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: Address;
  payment_id: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  variant?: ProductVariant & { product?: Product };
}

/* ─── Filters & Pagination ────────────────────────────── */
export interface ProductFilters {
  category_id?: string;
  gender?: Gender;
  size?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  in_stock?: boolean;
  on_sale?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
