/* eslint-disable @typescript-eslint/no-explicit-any */
// import { USER_ROLE } from "@/contains/role";

export type ResponseSuccessType = {
  data: any;
  meta?: TMeta;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  // totalPage: number;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};







// ─── Category Types ──────────────────────────────────────────────────────────

export interface TCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  order: number;
}

// ─── Product Types ────────────────────────────────────────────────────────────

export interface TVariant {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  weight?: number;
  isAvailable?: boolean;
}

export interface TProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string | TCategory;
  tags?: string[];
  thumbnail: string;
  gallery?: string[];
  variants: TVariant[];
  rating?: number;
  reviewCount?: number;
  status?: "active" | "draft" | "archived";
  isFeatured?: boolean;
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export type TPaymentMethod = "cod" | "bkash" | "nagad" | "card" | "bank";
export type TPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface TOrderVariantSnapshot {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
}

export interface TOrderItem {
  _id?: string;
  product: string | TProduct;
  variant: TOrderVariantSnapshot;
  quantity: number;
  totalPrice: number;
  isReviewed?: boolean;
}

export interface TShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
}

export interface TStatusHistoryEntry {
  status: TOrderStatus;
  note?: string;
  changedAt?: string;
}

export interface TOrder {
  _id: string;
  user: any; // User type can be added later
  orderNumber: string;
  items: TOrderItem[];
  shippingAddress: TShippingAddress;
  paymentMethod: TPaymentMethod;
  paymentStatus?: TPaymentStatus;
  transactionId?: string;
  subtotal: number;
  shippingCharge?: number;
  discount?: number;
  totalAmount: number;
  orderStatus: TOrderStatus;
  statusHistory: TStatusHistoryEntry[];
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface TCartItem {
  product: TProduct;
  variantId: string;
  quantity: number;
}

export interface TCart {
  _id: string;
  user: string;
  items: TCartItem[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── User & Address Types ───────────────────────────────────────────────────

export interface TSavedAddress {
  _id?: string;
  label?: string;        // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface TUser {
  _id?: string;
  username: string;
  email: string;
  contactNumber: string;
  address?: string;
  profilePicture?: string;
  role: 'user' | 'admin' | 'superAdmin';
  isBlocked?: boolean;
  savedAddresses?: TSavedAddress[];
}
