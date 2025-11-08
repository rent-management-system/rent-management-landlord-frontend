export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  views?: number;
  rating?: number;
  reviewCount?: number;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
}

export interface PropertySubmitRequest {
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  photos: File[]; // Changed from string[] to File[] for actual file uploads
}

export interface PropertySubmitResponse {
  property_id: string;
  status: 'PENDING';
  payment_url: string;
}

export interface PropertyFilters {
  location?: string;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
  search?: string;
  offset?: number;
  limit?: number;
}

export interface PropertyMetrics {
  total_listings: number;
  pending: number;
  approved: number;
  rejected: number;
}
