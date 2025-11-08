import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import FrontPage from "./FrontPage";
import { 
  Building2, Upload, CheckCircle2, Home, MapPin, DollarSign, Bed, Bath, 
  Square, Wifi, Car, Shield, Dumbbell, Trees, Building, Eye, Star, 
  Calendar, Filter, Search, Plus, MoreVertical, Edit, Trash2, ExternalLink
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/style.scss";

import { useAuth } from '@/contexts/AuthContext';
import { propertyService } from '@/services/property';
import { PropertySubmitRequest, Property } from '@/types/property';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [end, duration, hasAnimated]);

  // Reset animation when component mounts
  useEffect(() => {
    setHasAnimated(false);
    setCount(0);
  }, []);

  return (
    <span className="text-4xl font-bold mb-2 block">
      {count}+
    </span>
  );
};

// Enhanced Property Card Component
const EnhancedPropertyCard = ({ property, onEdit, onViewDetails }: any) => {
  const { t } = useTranslation();
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPROVED: { 
        label: t("approved_status"), 
        class: "bg-green-500/20 text-green-700 border-green-300 dark:text-green-300",
        icon: CheckCircle2
      },
      PENDING: { 
        label: t("pending_status"), 
        class: "bg-yellow-500/20 text-yellow-700 border-yellow-300 dark:text-yellow-300",
        icon: Calendar
      },
      REJECTED: { 
        label: "Rejected", 
        class: "bg-red-500/20 text-red-700 border-red-300 dark:text-red-300",
        icon: Trash2
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`${config.class} font-medium px-3 py-1`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const amenitiesIcons = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
    Gym: Dumbbell,
    Pool: Trees,
    Garden: Trees,
    Balcony: Building,
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
      {/* Property Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
        {property.image ? (
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge(property.status)}
        </div>

        {/* View Count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          <Eye className="h-3 w-3" />
          {property.views}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      <CardContent className="p-6">
        {/* Property Title and Location */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            {property.price.toLocaleString()} ETB
          </div>
          <p className="text-xs text-muted-foreground">ዋጋ</p>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bed className="h-4 w-4 text-primary" />
              <span className="font-semibold">{property.bedrooms}</span>
            </div>
            <p className="text-xs text-muted-foreground">መኝታ</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bath className="h-4 w-4 text-primary" />
              <span className="font-semibold">{property.bathrooms}</span>
            </div>
            <p className="text-xs text-muted-foreground">መታጠቢያ</p>
          </div>
        </div>

        {/* Rating and Reviews */}
        {property.rating && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{property.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({property.reviewCount} {t("reviews")})
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {property.views} {t("views")}
            </div>
          </div>
        )}

        {/* Amenities */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity: string) => {
              const IconComponent = amenitiesIcons[amenity as keyof typeof amenitiesIcons];
              return (
                <Badge 
                  key={amenity} 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2 py-1 text-xs"
                >
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  {t(amenity.toLowerCase())}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            {t("edit")}
          </Button>
          <Button 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onViewDetails}
          >
            <ExternalLink className="h-4 w-4" />
            {t("view_details")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Landlord = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isOwner } = useAuth(); // Added useAuth hook
  console.log('Landlord Component: User:', user, 'isAuthenticated:', isAuthenticated, 'isOwner:', isOwner);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
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

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [properties, setProperties] = useState<Property[]>([]); // Changed to dynamic properties
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  // Load properties on component mount
  useEffect(() => {
    if (isAuthenticated && isOwner) {
      loadMyProperties();
    }
  }, [isAuthenticated, isOwner]);

  const loadMyProperties = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // This would call your backend endpoint for owner's properties
      const myProperties = await propertyService.getMyProperties();
      setProperties(myProperties);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity as keyof typeof formData.amenities],
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).slice(0, 10 - uploadedImages.length);
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!isOwner) {
      toast.error('Only property owners can submit listings');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare formData for submission
      const submissionData: PropertySubmitRequest = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseFloat(formData.area),
        amenities: Object.entries(formData.amenities)
          .filter(([, checked]) => checked)
          .map(([amenity]) => amenity),
        photos: uploadedImages,
      };

      // Validate property data
      const errors = await propertyService.validatePropertyData(submissionData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        setIsSubmitting(false); // Stop submitting if validation fails
        return;
      }

      // Submit property
      const response = await propertyService.submitProperty(submissionData);
      
      toast.success('Property listed successfully! Redirecting to payment...');
      
      // Redirect to payment URL
      window.location.href = response.payment_url;
      
    } catch (error) {
      console.error('Property submission error:', error);
      toast.error('Failed to submit property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenitiesIcons = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
    Gym: Dumbbell,
    Pool: Trees,
    Garden: Trees,
    Balcony: Building,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <FrontPage />
        
        {/* Updated How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="step-main-cont1 text-center mb-12">
              <p className="text-lg text-muted-foreground mb-2">{t("how_it_works")}</p>
              <div className="flex justify-center mb-4">
                <img src="/hr.svg" alt="divider" className="h-1" />
              </div>
              <h1 className="text-3xl font-bold">{t("three_quick_steps")}</h1>
            </div>

            <div className="step-main-cont2 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <Card className="text-center" aria-labelledby="step1-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center" aria-hidden="true">
                    <i className="fa-solid fa-right-to-bracket fa-xl text-primary" title="Login"></i>
                  </div>
                  <CardTitle id="step1-title" className="text-xl">{t("login_and_search")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("login_and_search_p")}
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="text-center" aria-labelledby="step2-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center" aria-hidden="true">
                    <i className="fa-solid fa-phone fa-xl text-primary" title="Contact Owner / Apply"></i>
                  </div>
                  <CardTitle id="step2-title" className="text-xl">{t("contact_owner_and_apply")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("contact_owner_and_apply_p")}
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="text-center" aria-labelledby="step3-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center" aria-hidden="true">
                    <i className="fa-solid fa-house-chimney-crack fa-xl text-primary" title="Move In"></i>
                  </div>
                  <CardTitle id="step3-title" className="text-xl">{t("move_in_and_settle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("move_in_and_settle_p")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Updated Stats Section with Animated Counters */}
        <section className="py-16 bg-gradient-to-br from-background to-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* Active Listings */}
              <div className="group p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/5">
                <div className="relative inline-block">
                  <AnimatedCounter end={50} duration={2500} />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-muted-foreground text-lg font-medium transition-colors group-hover:text-foreground">
                  {t("active_listings")}
                </p>
              </div>

              {/* Happy Clients */}
              <div className="group p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/5">
                <div className="relative inline-block">
                  <AnimatedCounter end={100} duration={3000} />
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-muted-foreground text-lg font-medium transition-colors group-hover:text-foreground">
                  {t("happy_clients")}
                </p>
              </div>

              {/* Property Types */}
              <div className="group p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/5">
                <div className="relative inline-block">
                  <AnimatedCounter end={3} duration={1500} />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-muted-foreground text-lg font-medium transition-colors group-hover:text-foreground">
                  {t("property_types")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Create Property Listing Form */}
        <section id="create-listing" className="py-16 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t("listProperty")}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("fill_details_pay_per_post")}
                </p>
              </div>

              <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {t("pay_per_post_fee")}
                  </Badge>
                  <CardDescription className="text-base">
                    ንብረትዎን ለመዘርዘር ከታች ያሉትን ዝርዝሮች ይሙሉ
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Property Basic Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-xl font-semibold">{t("basic_information")}</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {t("propertyTitle")}
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t("propertyTitlePlaceholder")}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t("location")}
                          </Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder={t("locationPlaceholder")}
                            className="h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {t("price")}
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder={t("pricePlaceholder")}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bedrooms" className="text-sm font-medium flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            {t("bedrooms")}
                          </Label>
                          <Input
                            id="bedrooms"
                            name="bedrooms"
                            type="number"
                            value={formData.bedrooms}
                            onChange={handleInputChange}
                            placeholder={t("bedrooms_placeholder")}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bathrooms" className="text-sm font-medium flex items-center gap-2">
                            <Bath className="h-4 w-4" />
                            {t("bathrooms")}
                          </Label>
                          <Input
                            id="bathrooms"
                            name="bathrooms"
                            type="number"
                            value={formData.bathrooms}
                            onChange={handleInputChange}
                            placeholder={t("bathrooms_placeholder")}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="area" className="text-sm font-medium flex items-center gap-2">
                            <Square className="h-4 w-4" />
                            Area (m²)
                          </Label>
                          <Input
                            id="area"
                            name="area"
                            type="number"
                            value={formData.area}
                            onChange={handleInputChange}
                            placeholder="ለምሳሌ፣ 120"
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <Label htmlFor="description" className="text-sm font-medium">
                        {t("description")}
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder={t("descriptionPlaceholder")}
                        rows={6}
                        className="resize-none"
                        required
                      />
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        {t("amenities")}
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(formData.amenities).map(([amenity, checked]) => {
                          const IconComponent = amenitiesIcons[amenity as keyof typeof amenitiesIcons];
                          return (
                            <div key={amenity} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={amenity}
                                checked={checked}
                                onCheckedChange={() => handleAmenityChange(amenity)}
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={amenity}
                                className="flex items-center gap-2 text-sm font-normal cursor-pointer flex-1"
                              >
                                {IconComponent && <IconComponent className="h-4 w-4" />}
                                {t(amenity.toLowerCase())}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-4">
                      <Label htmlFor="photos" className="text-sm font-medium">
                        {t("photos")}
                      </Label>
                      <input
                        type="file"
                        id="photos"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="photos"
                        className="block mt-2 border-2 border-dashed border-primary/20 rounded-xl p-8 text-center hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all duration-300 cursor-pointer group"
                      >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          {t("uploadPhotos")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("image_upload_format")}
                        </p>
                      </label>

                      {/* Image Previews */}
                      {uploadedImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            {uploadedImages.length} images selected
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {uploadedImages.map((file, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Upload ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            {t("submitListingWithPrice")}
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        {t("post_payment_message")}
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced My Properties Section */}
        <section id="my-properties" className="py-16 bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4">
            {/* Header with Stats and Actions */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t("myProperties")}
                  </h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {properties.length} {t("total_listings")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {properties.filter(p => p.status === "APPROVED").length} Approved
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                      {properties.filter(p => p.status === "PENDING").length} Pending
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => document.getElementById('create-listing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Property
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties by title or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("ALL")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "APPROVED" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("APPROVED")}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Approved
                    </Button>
                    <Button
                      variant={statusFilter === "PENDING" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("PENDING")}
                      className="gap-2"
                    >
                      <Calendar className="h-3 w-3" />
                      Pending
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || statusFilter !== "ALL" 
                      ? "Try adjusting your search or filter criteria"
                      : "You haven't listed any properties yet"
                    }
                  </p>
                  <Button 
                    onClick={() => document.getElementById('create-listing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    List Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <EnhancedPropertyCard
                    key={property.id}
                    property={property}
                    onEdit={() => toast.info(t("edit_coming_soon"))}
                    onViewDetails={() => toast.info(t("view_details_coming_soon"))}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landlord;