import { apiClient } from '@/lib/api';
import { Property, PropertySubmitRequest, PropertySubmitResponse, PropertyFilters, PropertyMetrics } from '@/types/property';

class PropertyService {
  // Public endpoints
  async getPublicProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return apiClient.get<Property[]>(`/?${params.toString()}`);
  }

  async getPropertyMetrics(): Promise<PropertyMetrics> {
    return apiClient.get<PropertyMetrics>('/metrics');
  }

  // Authenticated endpoints
  async submitProperty(propertyData: PropertySubmitRequest): Promise<PropertySubmitResponse> {
    // First upload photos if any
    const photoUrls = propertyData.photos.length > 0 
      ? await this.uploadPhotos(propertyData.photos)
      : [];

    // Prepare the property data for submission
    const submissionData = {
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      price: parseFloat(propertyData.price.toString()),
      bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms.toString()) : undefined,
      bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms.toString()) : undefined,
      area: propertyData.area ? parseFloat(propertyData.area.toString()) : undefined,
      amenities: propertyData.amenities,
      photos: photoUrls,
    };

    return apiClient.post<PropertySubmitResponse>('/submit', submissionData);
  }

  async getPropertyById(id: string): Promise<Property> {
    return apiClient.get<Property>(`/${id}`);
  }

  async getMyProperties(): Promise<Property[]> {
    // Note: This endpoint might need to be implemented in your backend
    // For now, we'll use the public endpoint with owner filtering
    return apiClient.get<Property[]>('/my-properties');
  }

  // File upload methods
  private async uploadPhotos(photos: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      try {
        const formData = new FormData();
        formData.append('file', photo);
        
        // Note: You'll need to implement the upload endpoint in your backend
        // For now, we'll simulate upload and return placeholder URLs
        const uploadedUrl = await this.simulatePhotoUpload(photo);
        uploadedUrls.push(uploadedUrl);
      } catch (error) {
        console.error('Failed to upload photo:', error);
        // Continue with other photos even if one fails
      }
    }

    return uploadedUrls;
  }

  private async simulatePhotoUpload(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would return the actual uploaded file URL
    // For now, we'll create a blob URL (this is temporary and for demo purposes)
    return URL.createObjectURL(file);
  }

  // Utility methods
  async validatePropertyData(data: PropertySubmitRequest): Promise<string[]> {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Property title is required');
    }

    if (!data.location?.trim()) {
      errors.push('Location is required');
    }

    if (!data.price || data.price <= 0) {
      errors.push('Valid price is required');
    }

    if (!data.description?.trim()) {
      errors.push('Description is required');
    }

    if (data.photos.length === 0) {
      errors.push('At least one photo is required');
    }

    return errors;
  }
}

export const propertyService = new PropertyService();
