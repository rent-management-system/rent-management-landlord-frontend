
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wifi, Car, Shield } from "lucide-react";
import { PropertyPublicResponse } from "@/api/properties";

const PropertyCard = ({
  title,
  location,
  price,
  amenities,
  status,
}: PropertyPublicResponse) => {
  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          No Image
        </div>
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
        <div>
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="font-bold text-lg">{price} ETB</p>
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
    </Card>
  );
};

export default PropertyCard;

