import { useState, lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
//import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Home, MapPin, Upload, Bath, Bed, 
  Square, Car, Shield, Dumbbell, Trees, Building, Wifi, DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/style.scss";
import { useProperties } from "@/hooks/useProperties";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PropertySubmission } from "@/services/propertyService";

// My Properties card and management moved to Dashboard page

const Landlord = () => {
  const { t } = useTranslation();
  const { actions } = useProperties();
  const { toast } = useToast();
  

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    house_type: "",
    amenities: {
      WiFi: false,
      Parking: false,
      Security: false,
      Gym: false,
      Pool: false,
      Garden: false,
      Balcony: false,
    },
    available_from: "",
    available_to: "",
    deposit: "",
    utilities_included: false,
    pets_allowed: false,
    furnished: false
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // My Properties filters moved to Dashboard

  // Approve & Pay moved to Dashboard

  // Edit property moved to Dashboard

  // Filtering moved to Dashboard

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- FORM VALIDATION ---
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property title is required."
      });
      return;
    }
    if (!formData.location.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Location is required."
      });
      return;
    }
    if (!formData.house_type) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a house type."
      });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A valid price is required."
      });
      return;
    }
    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Description is required."
      });
      return;
    }
    if (uploadedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one photo must be uploaded."
      });
      return;
    }
    // --- END VALIDATION ---

    setIsSubmitting(true);

    try {
      // Convert form data to API format
      const submissionData: PropertySubmission = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        house_type: formData.house_type,
        amenities: Object.entries(formData.amenities)
          .filter(([_, checked]) => checked)
          .map(([amenity]) => amenity),
        photos: uploadedImages,
        ...(formData.bedrooms && { bedrooms: parseInt(formData.bedrooms) }),
        ...(formData.bathrooms && { bathrooms: parseInt(formData.bathrooms) }),
        ...(formData.area && { area: parseInt(formData.area) }),
      };

      // Submit to backend using the correct action from useProperties
      const result = await actions.submitProperty(submissionData);
      
      if (result && result.chapa_tx_ref) {
        toast({
          title: "Success",
          description: "Property updated successfully! Redirecting to payment..."
        });
        
        // Redirect to Chapa payment URL
        window.location.href = result.chapa_tx_ref;
        
        // Reset form (this will only happen if redirection doesn't occur immediately)
        setFormData({
          title: "",
          location: "",
          price: "",
          bedrooms: "",
          bathrooms: "",
          area: "",
          description: "",
          house_type: "",
          amenities: {
            WiFi: false,
            Parking: false,
            Security: false,
            Gym: false,
            Pool: false,
            Garden: false,
            Balcony: false,
          },
          available_from: "",
          available_to: "",
          deposit: "",
          utilities_included: false,
          pets_allowed: false,
          furnished: false,
        });
        setUploadedImages([]);
      } else if (result) {
        // If result is true but chapa_tx_ref is missing, still reset form and refresh properties
        toast({
          title: "Success",
          description: "Property listed successfully!"
        });
        // Reset form with all required properties
        setFormData({
          title: "",
          location: "",
          price: "",
          bedrooms: "",
          bathrooms: "",
          area: "",
          description: "",
          house_type: "",
          amenities: {
            WiFi: false,
            Parking: false,
            Security: false,
            Gym: false,
            Pool: false,
            Garden: false,
            Balcony: false
          },
          available_from: "",
          available_to: "",
          deposit: "",
          utilities_included: false,
          pets_allowed: false,
          furnished: false
        });
        setUploadedImages([]);
        // Refresh properties if no redirection
      }
    } catch (error) {
      // Error is already handled and toasted by the useApi hook/service layer
      console.error('Submission error:', error);
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

  // Import FrontPage component
  const FrontPage = lazy(() => import('./FrontPage'));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-8 lg:px-16">
        <Suspense fallback={<div>Loading...</div>}>
          <FrontPage onListPropertyClick={() => {
            const element = document.getElementById('create-listing');
            if (element) {
              (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
            }
          }} />
        </Suspense>
        
        {/* Updated How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="step-main-cont1 text-center mb-12">
              <p className="text-lg font-bold text-black mb-2">{t("how_it_works")}</p>
              <div className="flex justify-center mb-4">
                <img src="/hr.svg" alt="divider" className="h-1" />
              </div>
              <h1 className="text-3xl font-bold">{t("three_quick_steps")}</h1>
            </div>

            <div className="step-main-cont2 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <Card className="text-center hover:shadow-lg transition-all duration-300" aria-labelledby="step1-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M15.5 3a2.5 2.5 0 0 1 0 5l-.5 0h-10a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-12a1 1 0 0 0-1-1l-.5 0a2.5 2.5 0 0 1-2.5-2.5V3Z"></path>
                      <path d="M8 12h.01"></path>
                      <path d="M12 12h.01"></path>
                      <path d="M16 12h.01"></path>
                    </svg>
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
              <Card className="text-center hover:shadow-lg transition-all duration-300" aria-labelledby="step2-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      <path d="M17 16.5a1 1 0 0 1-1-1v-1.2a1 1 0 0 1 .3-.7l1.4-1.4a1 1 0 0 0 .3-.7V8.5a1 1 0 0 0-1-1h-2.6a1 1 0 0 0-.7.3l-1.4 1.4a1 1 0 0 1-.7.3h-1.2a1 1 0 0 0-1 1v3.4a1 1 0 0 0 1 1h.3l.7.7a1 1 0 0 1 .3.7v1.2a1 1 0 0 0 1 1h3.4a1 1 0 0 0 .7-.3l.7-.7a1 1 0 0 1 .7-.3z"></path>
                    </svg>
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
              <Card className="text-center hover:shadow-lg transition-all duration-300" aria-labelledby="step3-title">
                <CardHeader>
                  <div className="icon-wrap mx-auto mb-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M2 22h20"></path>
                      <path d="M3.77 10.77 2 13l3.5 3.5 7.5-7.5 4.5 4.5 5-5"></path>
                      <path d="M12 2v16"></path>
                      <path d="M2 2h4v4H2z"></path>
                      <path d="M18 2h4v4h-4z"></path>
                      <path d="M2 18h4v4H2z"></path>
                    </svg>
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

        {/* Enhanced Create Property Listing Form */}
        <section id="create-listing" className="py-16 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Beautiful Header Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                  List Your Property with Ease
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Reach thousands of potential tenants by listing your property on our platform. Fill in the details below to get started.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <a 
                    href="#create-listing" 
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    List Your Property
                  </a>
                  <a 
                    href="#contact-us" 
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {t("pay_per_post_fee")}
                  </Badge>
                  <CardDescription className="text-base">
                    {t("fill_details_pay_per_post")}
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

                        {/* House Type Dropdown */}
                        <div className="space-y-2">
                          <Label htmlFor="house_type" className="text-sm font-medium flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {t("houseType")}
                          </Label>
                          <Select
                            name="house_type"
                            value={formData.house_type}
                            onValueChange={(value) => handleSelectChange("house_type", value)}
                            required
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t("selectHouseType")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="condominium">{t("condominium")}</SelectItem>
                              <SelectItem value="apartment">{t("apartment")}</SelectItem>
                              <SelectItem value="private home">{t("privateHome")}</SelectItem>
                            </SelectContent>
                          </Select>
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
                            {t("area_label")} (m²)
                          </Label>
                          <Input
                            id="area"
                            name="area"
                            type="number"
                            value={formData.area}
                            onChange={handleInputChange}
                            placeholder={t("area_placeholder") || "120"}
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
                        accept="image/jpeg, image/png, image/webp"
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
                            {t("images_selected", { count: uploadedImages.length })}
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
                            {t("processing")}
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

        {/* My Properties moved to Dashboard */}
      </main>
      <div id="contact-us">
        <Footer />
      </div>
    </div>
  );
};

export default Landlord;