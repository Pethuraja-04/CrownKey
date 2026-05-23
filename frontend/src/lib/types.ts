export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'PG';
export type ListingType = 'SALE' | 'RENT';
export type Furnishing = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';
export type PropertyStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RENTED';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD' | 'DORMITORY';

export interface PropertyImage {
  id?: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface PropertyListItem {
  id: string;
  slug: string;
  title: string;
  price: string | number;
  type: PropertyType;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  furnishing: Furnishing;
  roomType?: RoomType | null;
  city: string;
  locality: string;
  isVerified: boolean;
  createdAt: string;
  images: PropertyImage[];
  status?: PropertyStatus;
  viewCount?: number;
}

export interface Property extends PropertyListItem {
  description: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities: string[];
  owner: PropertyOwner;
  updatedAt: string;
  status: PropertyStatus;
  viewCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: 'USER' | 'AGENT' | 'ADMIN';
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T extends any[] ? T : never;
  pagination?: Pagination;
  error?: { code: string; message: string; details?: unknown };
}

export type PostedWithin = '24h' | '7d' | '30d';

export interface PropertyFilters {
  q?: string;
  city?: string;
  type?: PropertyType;
  listingType?: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  roomType?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  amenities?: string[];
  isVerified?: boolean;
  postedWithin?: PostedWithin;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_desc';
  page?: number;
  limit?: number;
}
