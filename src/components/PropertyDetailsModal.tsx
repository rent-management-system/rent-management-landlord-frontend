import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PropertyDetailsModalProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    status: "APPROVED" | "PENDING" | "REJECTED";
    description?: string;
    amenities?: string[];
    views: number;
    rating?: number;
    reviewCount?: number;
  } | null;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailsModal({ property, onOpenChange }: PropertyDetailsModalProps) {
  const { t } = useTranslation();
  
  if (!property) return null;

  return (
    <Dialog open={!!property} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{property.title}</DialogTitle>
          <DialogDescription>{property.location}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("price")}</p>
              <p className="font-medium">{property.price.toLocaleString()} ETB/month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <Badge 
                variant={property.status === "APPROVED" ? "default" : property.status === "PENDING" ? "secondary" : "destructive"}
              >
                {property.status}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("bedrooms")}</p>
              <p className="font-medium">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("bathrooms")}</p>
              <p className="font-medium">{property.bathrooms}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t("description")}</p>
            <p className="text-foreground">
              {property.description || t("no_description")}
            </p>
          </div>
          
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("amenities")}</p>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              {property.views} {t("views")}
            </div>
            {property.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {property.rating} ({property.reviewCount || 0} {t("reviews")})
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
