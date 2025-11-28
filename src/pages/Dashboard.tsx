import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// PropertyDetailsModal import removed as it's not being used
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/services/propertyService";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import {
  MapPin,
  Star,
  Eye,
  Trash2,
  Plus,
  BarChart3,
  Clock,
  ArrowUpRight,
  Search,
  Building2,
  CheckCircle2,
  Bath,
  Wifi,
  Car,
  Shield,
  Dumbbell,
  Trees,
  Building,
  ExternalLink,
  Bed,
  TrendingUp,
  Edit,
  Crown,
  CreditCard,
  Calendar,
} from "lucide-react";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Real data via hook
  const { userProperties, loading, actions, metrics } = useProperties();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reservedOnly, setReservedOnly] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    price: "",
    amenities: {
      WiFi: false,
      Parking: false,
      Security: false,
      Gym: false,
      Pool: false,
      Garden: false,
      Balcony: false,
    },
  });

  // Approve state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Property | null>(null);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    // Use userProperties as the source
    const source = userProperties || [];

    const totalProperties = source.length;
    const approvedProperties = source.filter((p: Property) => p.status === 'APPROVED').length;
    const pendingProperties = source.filter((p: Property) => p.status === 'PENDING').length;
    const totalViews = source.reduce((sum: number, prop: Property) => sum + (prop.views || 0), 0);
    const totalRevenue = source
      .filter((p: Property) => p.status === 'APPROVED')
      .reduce((sum: number, prop: Property) => sum + (prop.price || 0), 0);
    const reservedProperties = source.filter((p: Property) => p.reserved).length;
    const reservedViewsTotal = source
      .filter((p: Property) => p.reserved)
      .reduce((sum: number, p: Property) => sum + (p.views || 0), 0);
    const reservedAverageViews = reservedProperties > 0
      ? Math.round(reservedViewsTotal / reservedProperties)
      : 0;

    return {
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalViews,
      totalRevenue,
      reservedProperties,
      approvalRate: totalProperties > 0 ? Math.round((approvedProperties / totalProperties) * 100) : 0,
      averageViews: totalProperties > 0 ? Math.round(totalViews / totalProperties) : 0,
      reservedViewsTotal,
      reservedAverageViews,
    };
  }, [userProperties]);

  const amenitiesIcons = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
    Gym: Dumbbell,
    Pool: Trees,
    Garden: Trees,
    Balcony: Building,
  };

  const openApproveDialog = (p: Property) => {
    setApproveTarget(p);
    setApproveOpen(true);
  };

  const handleApproveAndPay = async () => {
    if (!approveTarget) return;
    
    setApproveLoading(true);
    
    try {
      // Show a loading toast that will be updated with the result
      const toastId = toast.loading('Processing your payment request...');
      
      try {
        const res = await actions.approveAndPay(approveTarget.id);
        
        if (res && res.checkout_url) {
          // Update the toast to show success
          toast.success('Redirecting to payment...', { id: toastId });
          
          // Store payment details in session storage for after payment
          const paymentDetails = {
            propertyId: approveTarget.id,
            txRef: res.chapa_tx_ref,
            amount: approveTarget.price,
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem('lastPayment', JSON.stringify(paymentDetails));
          
          // Small delay to let the user see the success message
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Redirect to the payment URL with a return URL
          const successUrl = new URL('/payment/success', window.location.origin);
          successUrl.searchParams.append('property_id', approveTarget.id);
          successUrl.searchParams.append('tx_ref', res.chapa_tx_ref);
          successUrl.searchParams.append('amount', approveTarget.price.toString());
          
          // Update the checkout URL to include the success URL if possible
          const checkoutUrl = new URL(res.checkout_url);
          if (!checkoutUrl.searchParams.has('success_url')) {
            checkoutUrl.searchParams.set('success_url', successUrl.toString());
          }
          
          // Redirect to the payment gateway
          window.location.href = checkoutUrl.toString();
        }
      } catch (error: any) {
        // Handle rate limiting specifically
        if (error.message && error.message.includes('Please try again in')) {
          toast.error(error.message, { 
            id: toastId,
            duration: 10000, // Show for 10 seconds
            action: {
              label: 'Retry Now',
              onClick: () => handleApproveAndPay()
            }
          });
        } else {
          // For other errors, show a generic error message
          toast.error('Failed to process payment. Please try again later.', { 
            id: toastId,
            duration: 5000
          });
          console.error('Payment error:', error);
        }
        return; // Don't close the dialog on error
      }
      
      // Only close the dialog if we're redirecting to payment
      setApproveOpen(false);
      setApproveTarget(null);
    } finally {
      setApproveLoading(false);
    }
  };

  const openEdit = (property: Property) => {
    setEditingProperty(property);
    setEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditAmenityToggle = (name: keyof typeof editData.amenities) => {
    setEditData(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: !prev.amenities[name] },
    }));
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    const priceNum = parseFloat(editData.price);
    const amenities = Object.entries(editData.amenities)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    setEditSubmitting(true);
    const res = await actions.updateProperty(editingProperty.id, {
      title: editData.title,
      description: editData.description,
      price: priceNum,
      amenities,
    });
    setEditSubmitting(false);
    if (res) {
      setEditOpen(false);
      setEditingProperty(null);
    }
  };

  // Ensure userProperties is an array before filtering
  const filteredProperties = (Array.isArray(userProperties) ? userProperties : []).filter(property => {
    if (!property) return false;
    
    // First check search term match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = property.title?.toLowerCase().includes(searchLower) ||
      property.location?.toLowerCase().includes(searchLower);
    
    // Check reserved status if reservedOnly filter is active
    const matchesReserved = !reservedOnly || (property.reserved === true);
    
    // Check status filter (only if not filtering by reserved)
    const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
    
    return matchesSearch && matchesStatus && matchesReserved;
  });

  // Enhanced Property Card Component
  const EnhancedPropertyCard = ({ 
    property, 
    onEdit, 
    onViewDetails,
    onApprove,
    onDelete,
    onToggleReserve,
  }: { 
    property: Property; 
    onEdit: () => void; 
    onViewDetails: () => void;
    onApprove: () => void;
    onDelete: () => void;
    onToggleReserve: () => void;
  }) => {
    const { t } = useTranslation();

    const getStatusBadge = (status: string) => {
      const statusConfig = {
        APPROVED: { 
          label: t("approved_status"), 
          class: "bg-emerald-500/90 text-white border-emerald-200 dark:border-emerald-800 shadow-lg",
          icon: CheckCircle2 
        },
        PENDING: { 
          label: t("pending_status"), 
          class: "bg-amber-500/90 text-white border-amber-200 dark:border-amber-800 shadow-lg",
          icon: Calendar 
        },
        REJECTED: { 
          label: "Rejected", 
          class: "bg-rose-500/90 text-white border-rose-200 dark:border-rose-800 shadow-lg",
          icon: Trash2 
        },
      } as const;
      
      const config = (statusConfig as any)[status] || statusConfig.PENDING;
      const IconComponent = config.icon;
      
      return (
        <div className="relative z-20">
          <Badge 
            variant="outline" 
            className={`${config.class} font-medium px-3 py-1.5 rounded-full border-2 whitespace-nowrap shadow-md`}
          >
            <IconComponent className="h-3 w-3 mr-1.5" />
            {config.label}
          </Badge>
        </div>
      );
    };

    const getPaymentBadge = (payment?: string) => {
      if (!payment) return null;
      const map: Record<string, { label: string; className: string }> = {
        SUCCESS: { 
          label: t('payment_success') || 'Paid', 
          className: 'bg-emerald-500/90 text-white border-emerald-200 dark:text-white dark:border-emerald-800 shadow-lg' 
        },
        PENDING: { 
          label: t('payment_pending') || 'Payment Pending', 
          className: 'bg-amber-500/90 text-white border-amber-200 dark:text-white dark:border-amber-800 shadow-lg' 
        },
        FAILED: { 
          label: t('payment_failed') || 'Payment Failed', 
          className: 'bg-rose-500/90 text-white border-rose-200 dark:text-white dark:border-rose-800 shadow-lg' 
        },
      };
      const item = map[payment] ?? map.PENDING;
      return (
        <div className="relative z-20">
          <Badge 
            variant="outline" 
            className={`${item.className} font-medium px-3 py-1.5 rounded-full border-2 whitespace-nowrap shadow-md`}
          >
            {item.label}
          </Badge>
        </div>
      );
    };

    const isApproved = property.status === 'APPROVED';

    return (
      <Card className="group hover:shadow-2xl transition-all duration-500 border border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 overflow-hidden hover:scale-[1.02]">
        {/* Property Image Section */}
        <div className="relative h-52 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          {property.photos && property.photos.length > 0 ? (
            <img 
              src={property.photos[0]} 
              alt={property.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <Building2 className="h-16 w-16 text-primary/40" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status and Payment Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-10">
            <div className="relative">
              {getStatusBadge(property.status)}
            </div>
            <div className="relative">
              {getPaymentBadge(property.payment_status)}
            </div>
          </div>

          {/* Reserved Badge */}
          {property.reserved && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1.5 rounded-full shadow-lg">
                <Star className="h-3 w-3 mr-1.5 fill-current" />
                {t('reserved') || 'Reserved'}
              </Badge>
            </div>
          )}

          {/* View Count */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{property.views || 0}</span>
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <Button 
                size="sm" 
                className="bg-white/90 text-gray-900 hover:bg-white border-0 shadow-lg backdrop-blur-sm gap-2"
                onClick={onViewDetails}
              >
                <ExternalLink className="h-4 w-4" />
                {t("quick_view")}
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Property Title and Location */}
          <div className="mb-4">
            <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[3.5rem]">
              {property.title}
            </h3>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <span className="text-sm leading-relaxed line-clamp-2">{property.location}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-5 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <span>ETB</span>
              {property.price?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{t("monthly_rental_price")}</p>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Bed className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg">{property.bedrooms || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{t("bedrooms")}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Bath className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg">{property.bathrooms || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{t("bathrooms")}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg">{property.area ?? 'N/A'}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{t("area_label")} (m²)</p>
            </div>
          </div>

          {/* Rating and Performance */}
          {(property.rating || property.views) && (
            <div className="flex items-center justify-between mb-5 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center gap-2">
                {property.rating && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm">{property.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({property.reviewCount || 0})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                {property.views || 0} views
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">Key Amenities</p>
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 3).map((amenity: string) => {
                  const IconComponent = amenitiesIcons[amenity as keyof typeof amenitiesIcons];
                  return (
                    <Badge 
                      key={amenity} 
                      variant="secondary" 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100/80 dark:bg-gray-700/80 border-0"
                    >
                      {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                      {t(amenity.toLowerCase())}
                    </Badge>
                  );
                })}
                {property.amenities.length > 3 && (
                  <Badge variant="secondary" className="px-3 py-1.5 text-xs bg-gray-100/80 dark:bg-gray-700/80 border-0">
                    +{property.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Status-based actions */}
            {!isApproved && (
              <div className="grid grid-cols-2 gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t('approve') || 'Approve'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirm_approve_title') || 'Approve this property?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('confirm_approve_desc') || 'This will mark the property as approved and make it visible to renters.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction onClick={onApprove}>{t('approve') || 'Approve'}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-2"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                  {t("edit")}
                </Button>
              </div>
            )}

            {/* Approved property actions */}
            {isApproved && (
              <div className="grid grid-cols-2 gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={property.reserved ? "outline" : "default"}
                      size="sm"
                      className="gap-2 border-2"
                    >
                      <Star className="h-4 w-4" />
                      {property.reserved ? (t('reserved') || 'Reserved') : (t('mark_reserved') || 'Reserve')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {property.reserved ? (t('unreserve_title') || 'Remove reservation?') : (t('reserve_title') || 'Mark as reserved?')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {property.reserved 
                          ? (t('unreserve_desc') || 'This will make the property available again for other users to reserve.')
                          : (t('reserve_desc') || 'This will flag the property as reserved by a user and hide it from new applicants.')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction onClick={onToggleReserve}>
                        {property.reserved ? (t('unreserve') || 'Unreserve') : (t('reserve') || 'Reserve')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-2"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                  {t("edit")}
                </Button>
              </div>
            )}

            {/* Universal actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2 border-2"
                onClick={onViewDetails}
              >
                <ExternalLink className="h-4 w-4" />
                {t("view_details")}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('delete') || 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirm_delete_title') || 'Delete this property?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('confirm_delete_desc') || 'This action cannot be undone and will permanently delete the property.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onDelete}
                      className="bg-rose-600 hover:bg-rose-700"
                    >
                      {t('delete') || 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    color: string;
    trend?: number;
    subtitle?: string;
  }) => (
    <Card className={`bg-gradient-to-br ${color} border-0 text-white overflow-hidden relative group hover:scale-105 transition-transform duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12"></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-2 ${trend >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}% this month
              </div>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-800/20">
      <Header />
      <main className="flex-1">
        {/* Enhanced Dashboard Header */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t("dashboard") || "Property Dashboard"}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {t("dashboard_welcome") || "Manage your properties and track performance"}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title={t("total_listings")}
                value={dashboardMetrics.totalProperties}
                icon={Building2}
                color="from-blue-500 to-blue-600"
                trend={12}
              />
              <StatsCard
                title={t("approved_listings")}
                value={dashboardMetrics.approvedProperties}
                icon={CheckCircle2}
                color="from-emerald-500 to-emerald-600"
                trend={8}
                subtitle={`${dashboardMetrics.approvalRate}% rate`}
              />
              <StatsCard
                title={t("pending_listings")}
                value={metrics?.pending ?? 0}
                icon={Clock}
                color="from-amber-500 to-amber-600"
                trend={0}
                subtitle={t("pending_label")}
              />
              <StatsCard
                title={t("reserved_views") || "Reserved Views"}
                value={dashboardMetrics.reservedViewsTotal}
                icon={Eye}
                color="from-orange-500 to-orange-600"
                trend={0}
                subtitle={
                  dashboardMetrics.reservedProperties && dashboardMetrics.reservedProperties > 0
                    ? `${dashboardMetrics.reservedAverageViews} ${t("avg_reserved") || "avg/reserved"}`
                    : '-'
                }
              />
            </div>


          </div>
        </section>

        {/* Enhanced Properties Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t("myProperties")}</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">{t("myProperties")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("myPropertiesDescription")}
              </p>
            </div>

            {/* Enhanced Search and Filter Bar */}
            <Card className="p-6 mb-8 border border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative min-w-[300px]">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder={t("search_placeholder") || "Search properties by title or location..."} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-12 h-12 rounded-2xl border-2 border-gray-200/60 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex gap-2">
                      <Button
                        variant={statusFilter === "ALL" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setStatusFilter("ALL")}
                        className="rounded-2xl border-2"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {t("all_properties")}
                      </Button>
                      <Button
                        variant={statusFilter === "APPROVED" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setStatusFilter("APPROVED")}
                        className="rounded-2xl border-2 gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {t("approved_status")}
                      </Button>
                      <Button
                        variant={statusFilter === "PENDING" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setStatusFilter("PENDING")}
                        className="rounded-2xl border-2 gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        {t("pending_status")}
                      </Button>
                      <Button
                        variant={reservedOnly ? "default" : "outline"}
                        size="lg"
                        onClick={() => {
                          const newReservedOnly = !reservedOnly;
                          setReservedOnly(newReservedOnly);
                          // Reset status filter when toggling reserved
                          if (newReservedOnly) {
                            setStatusFilter("ALL");
                          }
                        }}
                        className="rounded-2xl border-2 gap-2"
                      >
                        <Star className="h-4 w-4" /> {t("reserved")} 
                        <span className="ml-1">
                          ({userProperties.filter(p => p?.reserved).length})
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>{userProperties.filter(p => p.status === "APPROVED").length} {t("active_label")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>{userProperties.filter(p => p.status === "PENDING").length} {t("pending_label")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{userProperties.filter(p => p.reserved).length} {t("reserved_label")}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Properties Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">{t("loading_properties")}</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <Card className="text-center py-20 border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 bg-transparent">
                <CardContent>
                  <Building2 className="h-20 w-20 mx-auto mb-6 text-muted-foreground/40" />
                  <h3 className="text-2xl font-semibold mb-3">{t("no_properties_found")}</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "ALL" 
                      ? (t("no_properties_filters_msg") || "No properties match your search criteria. Try adjusting your filters.")
                      : (t("no_properties_start_msg") || "Start building your property portfolio by listing your first property.")}
                  </p>
                  <Button 
                    onClick={() => navigate('/landlord#create-listing')}
                    className="gap-3 h-12 px-8 rounded-2xl"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    {t("create_listing")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <EnhancedPropertyCard
                    key={property.id}
                    property={property}
                    onEdit={() => openEdit(property)}
                    onViewDetails={() => {
                      // View details implementation
                      console.log('Viewing property:', property);
                    }}
                    onApprove={() => openApproveDialog(property)}
                    onDelete={() => actions.deleteProperty(property.id)}
                    onToggleReserve={() => actions.reserveProperty(property.id, !(property.reserved ?? false))}
                  />
                ))}
              </div>
            )}

            {/* Pagination or Load More */}
            {filteredProperties.length > 0 && (
              <div className="flex justify-center mt-12">
                <Button variant="outline" className="rounded-2xl border-2 px-8 gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  {t("load_more_properties")}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("edit_property") || "Edit Property"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submitEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-semibold">{t("propertyTitle")}</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    value={editData.title} 
                    onChange={handleEditChange} 
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="text-sm font-semibold">{t("price")}</Label>
                  <Input 
                    id="edit-price" 
                    name="price" 
                    type="number" 
                    value={editData.price} 
                    onChange={handleEditChange} 
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-semibold">{t("description")}</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  rows={5} 
                  value={editData.description} 
                  onChange={handleEditChange} 
                  required 
                  className="rounded-xl resize-none"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold">{t("amenities")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.keys(editData.amenities).map((amenity) => {
                    const checked = editData.amenities[amenity as keyof typeof editData.amenities];
                    const IconComponent = amenitiesIcons[amenity as keyof typeof amenitiesIcons];
                    return (
                      <div 
                        key={amenity} 
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          checked 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleEditAmenityToggle(amenity as any)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                          checked ? 'bg-primary border-primary' : 'border-gray-300'
                        }`}>
                          {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <Label htmlFor={`edit-${amenity}`} className="flex items-center gap-2 cursor-pointer flex-1">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {t(amenity.toLowerCase())}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <DialogFooter className="gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border-2 h-12 px-6"
                >
                  {t("cancel") || "Cancel"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSubmitting}
                  className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  {editSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("saving") || "Saving..."}
                    </>
                  ) : (
                    t("save_changes") || "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Approve & Pay Dialog */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Approve & Pay</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <CreditCard className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Complete Your Listing</p>
                <p className="text-sm text-muted-foreground mt-2">
                  To approve this property and make it visible to renters, you need to pay the listing fee.
                </p>
              </div>
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                <p className="text-2xl font-bold text-primary">500 ETB</p>
                <p className="text-sm text-muted-foreground">One-time listing fee</p>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setApproveOpen(false)}
                className="rounded-xl border-2 flex-1"
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleApproveAndPay} 
                disabled={approveLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 flex-1 gap-2"
              >
                {approveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {t("pay_now")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;