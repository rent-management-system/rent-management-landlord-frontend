import { propertyService } from '@/services/property';
import { apiClient } from '@/lib/api';
import { PropertySubmitRequest } from '@/types/property';

// Mock the apiClient
jest.mock('@/lib/api');

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitProperty', () => {
    it('should submit property successfully', async () => {
      const mockPropertyData: PropertySubmitRequest = {
        title: 'Test Property',
        description: 'Test Description',
        location: 'Test Location',
        price: 1000,
        amenities: ['wifi', 'parking'],
        photos: [],
      };

      const mockResponse = {
        property_id: '123',
        status: 'PENDING' as const,
        payment_url: 'https://payment.example.com',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await propertyService.submitProperty(mockPropertyData);

      expect(apiClient.post).toHaveBeenCalledWith('/submit', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validatePropertyData', () => {
    it('should return no errors for valid data', async () => {
      const validData: PropertySubmitRequest = {
        title: 'Valid Property',
        description: 'Valid description',
        location: 'Valid location',
        price: 1000,
        amenities: ['wifi'],
        photos: [new File([''], 'test.jpg')],
      };

      const errors = await propertyService.validatePropertyData(validData);

      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid data', async () => {
      const invalidData: PropertySubmitRequest = {
        title: '',
        description: '',
        location: '',
        price: 0,
        amenities: [],
        photos: [],
      };

      const errors = await propertyService.validatePropertyData(invalidData);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
