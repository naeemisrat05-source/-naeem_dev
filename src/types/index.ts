export type Language = 'bn' | 'en';

export type UserRole = 'customer' | 'admin' | 'manager';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: BangladeshAddress[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  sku: string;
  categoryId: string;
  category?: string;
  subcategoryId?: string;
  subcategory?: string;
  brand: string;
  shortDescription: string;
  shortDescriptionBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  discountPercent?: number;
  discountPercentage?: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  thumbnail: string;
  image?: string;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  tags: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  status: 'active' | 'draft' | 'out_of_stock';
  featured?: boolean;
  isFeatured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  image: string;
  itemCount: number;
  active: boolean;
  iconName?: string;
  subcategories?: { id: string; name: string; nameBn: string; slug: string }[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  nameBn: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxStock: number;
  image: string;
  sku: string;
}

export interface BangladeshAddress {
  id: string;
  recipientName: string;
  phone: string;
  alternativePhone?: string;
  division: string;
  district: string;
  upazila: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface ShippingMethod {
  id: 'inside_dhaka' | 'outside_dhaka' | 'express';
  name: string;
  nameBn: string;
  charge: number;
  estimatedDays: string;
  estimatedDaysBn: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  nameBn: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  shippingMethodId?: string;
  shippingMethod?: string;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  shippingAddress: BangladeshAddress;
  courierPartner?: string;
  trackingNumber?: string;
  trackingTimeline: OrderTimelineItem[];
  customerNote?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder?: number;
  minOrderAmount?: number;
  maximumDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  perUserLimit?: number;
  active?: boolean;
  isActive?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  badge?: string;
  badgeBn?: string;
  image: string;
  mobileImage?: string;
  link: string;
  buttonText: string;
  buttonTextBn: string;
  status: 'active' | 'inactive';
  sortOrder: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  taglineBn: string;
  phone: string;
  email: string;
  address: string;
  currencySymbol: string;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  expressCharge: number;
  freeDeliveryThreshold: number;
  bkashNumber: string;
  nagadNumber: string;
  sslcommerzEnabled: boolean;
  maintenanceMode: boolean;
}
