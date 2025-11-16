import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertyService, Property } from "@/services/propertyService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  Building2, MapPin, DollarSign, Bed, Bath, Square, Eye, Star
} from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await propertyService.getPropertyById(id);
        if (active) setProperty(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load property";
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const map: Record<string, { label: string; className: string }> = {
      APPROVED: { label: t("approved_status"), className: "bg-green-500/20 text-green-700 border-green-300 dark:text-green-300" },
      PENDING: { label: t("pending_status"), className: "bg-yellow-500/20 text-yellow-700 border-yellow-300 dark:text-yellow-300" },
      REJECTED: { label: "Rejected", className: "bg-red-500/20 text-red-700 border-red-300 dark:text-red-300" },
    };
    const item = map[status] ?? map.PENDING;
    return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
  };

  const getPaymentBadge = (payment?: string) => {
    if (!payment) return null;
    const map: Record<string, { label: string; className: string }> = {
      SUCCESS: { label: t('payment_success') || 'Paid', className: 'bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:text-emerald-300' },
      PENDING: { label: t('payment_pending') || 'Payment Pending', className: 'bg-yellow-500/20 text-yellow-700 border-yellow-300 dark:text-yellow-300' },
      FAILED: { label: t('payment_failed') || 'Payment Failed', className: 'bg-red-500/20 text-red-700 border-red-300 dark:text-red-300' },
    };
    const item = map[payment] ?? map.PENDING;
    return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Skeleton className="h-9 w-24" />
          </div>
          <Card className="overflow-hidden">
            <div className="h-72 bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-8 w-40"><Skeleton className="h-8 w-40" /></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{t("not_found") || "Not found"}</h3>
        <p className="text-muted-foreground mb-6">{error || t("property_not_found") || "Property could not be found."}</p>
        <Button onClick={() => navigate(-1)}>{t("go_back") || "Go back"}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          {t("back") || "Back"}
        </Button>

        <Card className="overflow-hidden">
          {/* Image */}
          <div className="relative h-72 bg-muted">
            {property.photos && property.photos.length > 0 ? (
              <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary/40" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2 items-center">
              {getStatusBadge(property.status)}
              {getPaymentBadge(property.payment_status)}
              {property.reserved && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-700 border-purple-300 dark:text-purple-300">
                  {t('reserved') || 'Reserved'}
                </Badge>
              )}
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">{property.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {property.location}
            </CardDescription>
            {property.house_type && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {t('houseType')}: {property.house_type}
                </Badge>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <DollarSign className="h-5 w-5" />
                {property.price.toLocaleString()} ETB
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.bedrooms || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("bedrooms")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Bath className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.bathrooms || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("bathrooms")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Square className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.area || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">m²</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.views || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("views")}</p>
              </div>
            </div>

            {/* Payment/Approval and Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('payment_status') || 'Payment Status'}:</span>
                {getPaymentBadge(property.payment_status)}
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">{t('approval_time') || 'Approval Time'}</p>
                <p className="text-sm font-medium">
                  {property.approval_timestamp ? new Date(property.approval_timestamp).toLocaleString() : (t('not_available') || 'N/A')}
                </p>
              </div>
              {(property.lat !== undefined && property.lon !== undefined) && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{t('coordinates') || 'Coordinates'}</p>
                  <p className="text-sm font-medium">{property.lat.toFixed(2)}, {property.lon.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('amenities') || 'Amenities'}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {property.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{property.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({property.reviewCount || 0} {t("reviews")})
                </span>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">{t("description")}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyDetails;
