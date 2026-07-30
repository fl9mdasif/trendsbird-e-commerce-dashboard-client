/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Standard Backend API Response Types ─────────────────────────────────────
export interface IResponseMeta {
  page: number;
  limit: number;
  total: number;
  pageCount?: number;
}

export type TMeta = IResponseMeta;

export interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: IResponseMeta;
  data: T;
}

export type ResponseSuccessType = IApiResponse<any>;

export interface IApiErrorResponse {
  statusCode: number;
  success: false;
  message: string;
  errors?: string[];
  errorMessages?: IGenericErrorMessage[];
}

export type IGenericErrorResponse = IApiErrorResponse;

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

// ── Saved Address & Legacy Types ─────────────────────────────────────────────
export interface TSavedAddress {
  _id?: string;
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

// ── Auth Interfaces ─────────────────────────────────────────────────────────
export interface ILoginInput {
  email: string;
  password: string;
}

// ── Permission & Role Interfaces ─────────────────────────────────────────────
export interface ICreatePermissionInput {
  name: string;
  description?: string;
  group?: string;
  module?: string;
  actions?: string[];
  permissions?: string[];
}

export interface IPermission {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePermission {
  roleId: string;
  permissionId: string;
  permission?: IPermission;
}

export interface IRole {
  id: string;
  _id?: string;
  name: string;
  description?: string | null;
  userCount?: number;
  usersCount?: number;
  users?: any[];
  permissions?: IRolePermission[] | IPermission[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  permissionIds?: string[];
}

export interface IAssignPermissionInput {
  permissionId: string;
}

// ── User Interfaces ──────────────────────────────────────────────────────────
export interface ICreateUserInput {
  email: string;
  password: string;
  name: string;
  active?: boolean;
  roleId: string;
}

export interface IUpdateUserInput {
  name?: string;
  email?: string;
  active?: boolean;
  roleId?: string;
}

export interface IUser {
  id: string;
  _id?: string;
  email: string;
  name: string;
  active: boolean;
  roleId: string;
  role?: IRole | string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Catalog (Brand, Attribute, Category) Interfaces ─────────────────────────
export interface ICreateBrandInput {
  name: string;
  logo?: string;
  description?: string;
}

export interface IBrand {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  logo?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateAttributeInput {
  name: string;
  type?: "dropdown" | "radio" | "color" | "image";
  values?: string[];
}

export interface IAttributeValue {
  id: string;
  value: string;
  hexCode?: string;
}

export interface IAttribute {
  id: string;
  _id?: string;
  name: string;
  type?: string;
  values?: IAttributeValue[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateCategoryInput {
  name: string;
  parentId?: string | null;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface ICategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: ICategory | null;
  children?: ICategory[];
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ── Product & Variant Interfaces ─────────────────────────────────────────────
export interface IVariantAttributeInput {
  attributeId: string;
  attributeValueId: string;
}

export interface IVariantInput {
  _id?: string;
  id?: string;
  name?: string;
  price: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  stock: number;
  sku: string;
  weight?: number;
  isAvailable?: boolean;
  attributes?: IVariantAttributeInput[];
}

export type TVariant = IVariantInput;

export interface ICreateProductInput {
  name: string;
  description?: string | null;
  hasVariants?: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  brandId?: string | null;
  categoryIds: string[];
  mediaIds?: string[];
  variants?: IVariantInput[];
}

export interface IUpdateProductInput {
  name?: string;
  description?: string | null;
  hasVariants?: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  brandId?: string | null;
  categoryIds?: string[];
  mediaIds?: string[];
  variants?: IVariantInput[];
}

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  hasVariants?: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  brandId?: string | null;
  brand?: IBrand | null;
  category?: string | ICategory;
  categories?: ICategory[];
  categoryIds?: string[];
  thumbnail?: string;
  gallery?: string[];
  mediaIds?: string[];
  variants?: IVariantInput[];
  status?: "active" | "draft" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export type TProduct = IProduct;

// ── Media Interfaces ────────────────────────────────────────────────────────
export interface IMedia {
  id: string;
  _id?: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  altText?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}
