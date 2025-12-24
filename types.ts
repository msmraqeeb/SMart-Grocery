
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  badge?: string;
  unit?: string;
  shortDescription?: string;
  description: string; // Used as long description
  sku?: string;
  slug?: string;
  brand?: string;
  isFeatured?: boolean;
  variants?: Variant[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Variant {
  id: string;
  attributeValues: { [attributeName: string]: string };
  price: number; // Current selling price
  originalPrice?: number; // Strikethrough price
  sku: string;
  stock: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug?: string;
  parentId?: string | null;
  itemCount: number;
}

export interface AttributeValue {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Fixed' | 'Percentage';
  discountValue: number;
  minimumSpend: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
  autoApply: boolean;
  createdAt: string;
  isAutoApplied?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
  selectedVariantName?: string;
  selectedVariantImage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerDistrict?: string;
  customerArea?: string;
  date: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  coupon_code?: string;
}

export interface ShippingSettings {
  insideDhaka: number;
  outsideDhaka: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name?: string;
  created_at: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  district: string;
  area: string;
}

export type ViewMode = 'home' | 'products' | 'admin';
export type AdminTab = 'products' | 'orders' | 'shipping' | 'settings' | 'attributes' | 'categories' | 'brands' | 'coupons' | 'reviews' | 'users';

export interface StoreInfo {
  name: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}
