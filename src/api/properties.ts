
import { z } from "zod";

const API_BASE_URL = "https://property-listing-service.onrender.com/api/v1";

const PropertyPublicResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  location: z.string(),
  price: z.string(),
  amenities: z.array(z.string()),
  status: z.string(),
});

export type PropertyPublicResponse = z.infer<typeof PropertyPublicResponseSchema>;

export const getProperties = async (): Promise<PropertyPublicResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }
  const data = await response.json();
  return z.array(PropertyPublicResponseSchema).parse(data);
};
