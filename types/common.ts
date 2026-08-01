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
  permissionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePermission {
  roleId?: string;
  permissionId?: string;
  permission?: IPermission | string;
  id?: string;
  name?: string;
  description?: string | null;
}

export type TPermissionItem = IRolePermission | IPermission | string;

export interface IRole {
  id: string;
  _id?: string;
  name: string;
  description?: string | null;
  userCount?: number;
  usersCount?: number;
  users?: any[];
  permissions?: TPermissionItem[];
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

// ── Brand Interfaces ─────────────────────────────────────────────────────────
export interface ICreateBrandInput {
  name: string;
}

export interface IBrand {
  id: string;
  _id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Attribute & Attribute Value Interfaces ──────────────────────────────────
export interface ICreateAttributeInput {
  name: string;
}

export interface IAttributeValue {
  id: string;
  _id?: string;
  attributeId: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAttribute {
  id: string;
  _id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  values?: IAttributeValue[];
}

// ── Category Interfaces ──────────────────────────────────────────────────────
export interface ICreateCategoryInput {
  name: string;
  parentId?: string | null;
}

export interface ICategory {
  id: string;
  _id?: string;
  name: string;
  parentId?: string | null;
  children?: ICategory[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Media Interfaces ────────────────────────────────────────────────────────
export interface IMedia {
  id: string;
  _id?: string;
  name?: string;
  filename?: string;
  url: string;
  thumbnailUrl?: string | null;
  mimeType: string;
  sizeBytes?: number;
  size?: number;
  altText?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Product & Variant Interfaces ─────────────────────────────────────────────
export interface IVariantAttributeInput {
  attributeId: string;
  attributeValueId: string;
  attribute?: IAttribute;
  attributeValue?: IAttributeValue;
}

export interface IVariantInput {
  id?: string;
  _id?: string;
  name?: string;
  productId?: string;
  price: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  stock: number;
  sku: string;
  attributes: IVariantAttributeInput[];
  createdAt?: string;
  updatedAt?: string;
}

export type TVariant = IVariantInput;

export interface IProductCategoryLink {
  productId: string;
  categoryId: string;
  category: ICategory;
}

export interface IProductMediaLink {
  productId: string;
  mediaId: string;
  media: IMedia;
}

export interface ICreateProductInput {
  name: string;
  description?: string | null;
  hasVariants: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  brandId?: string | null;
  categoryIds: string[];
  mediaIds?: string[];
  variants?: IVariantInput[];
}

export interface IProduct {
  id: string;
  _id?: string;
  name: string;
  thumbnail?: string;
  description?: string | null;
  hasVariants: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  brandId?: string | null;
  brand?: IBrand | null;
  categories?: IProductCategoryLink[];
  media?: IProductMediaLink[];
  variants?: IVariantInput[];
  createdAt?: string;
  updatedAt?: string;
}

export type TProduct = IProduct;

// ── Unified Module Entity & Response Types ────────────────────────────────────
export type TModuleEntity =
  | IProduct
  | ICategory
  | IBrand
  | IAttribute
  | IMedia
  | IUser
  | IRole
  | IPermission;

export type TModuleListResponse =
  | IApiResponse<IProduct[]>
  | IApiResponse<ICategory[]>
  | IApiResponse<IBrand[]>
  | IApiResponse<IAttribute[]>
  | IApiResponse<IMedia[]>
  | IApiResponse<IUser[]>
  | IApiResponse<IRole[]>
  | IApiResponse<IPermission[]>
  | IProduct[]
  | ICategory[]
  | IBrand[]
  | IAttribute[]
  | IMedia[]
  | IUser[]
  | IRole[]
  | IPermission[];

export type TModuleSingleResponse =
  | IApiResponse<IProduct>
  | IApiResponse<ICategory>
  | IApiResponse<IBrand>
  | IApiResponse<IAttribute>
  | IApiResponse<IMedia>
  | IApiResponse<IUser>
  | IApiResponse<IRole>
  | IApiResponse<IPermission>;
