import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Eye, Star, MapPin, Wifi, Car, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: "APPROVED" | "PENDING" | "REJECTED";
  views: number;
  rating?: number;
  reviewCount?: number;
  amenities: string[];
  image?: string;
  onEdit: () => void;
  onViewDetails: () => void;
}

const PropertyCard = ({
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  status,
  views,
  rating,
  reviewCount,
  amenities,
  image,
  onEdit,
  onViewDetails,
}: PropertyCardProps) => {
  const { t } = useLanguage();
  
  const statusColors = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "destructive",
  } as const;

  const amenityIcons: Record<string, React.ElementType> = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <Badge 
          className="absolute top-4 right-4" 
          variant={status === "APPROVED" ? "default" : status === "PENDING" ? "secondary" : "destructive"}
        >
          {status}
        </Badge>
      </div>
      
      <CardHeader>
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {location}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-bold text-lg">{price.toLocaleString()} ETB</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Rooms</p>
            <p className="font-semibold">
              <Bed className="inline h-4 w-4 mr-1" />
              {bedrooms} BD / <Bath className="inline h-4 w-4 mr-1" />
              {bathrooms} BA
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {views} {t("views")}
          </div>
          {rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {rating} ({reviewCount})
            </div>
          ) : (
            <span className="text-muted-foreground">No reviews</span>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {amenities.map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <Badge key={amenity} variant="outline" className="gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                {amenity}
              </Badge>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          {t("edit")}
        </Button>
        <Button className="flex-1" onClick={onViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
