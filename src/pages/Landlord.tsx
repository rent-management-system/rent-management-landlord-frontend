import { useState } from "react";
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
import { Building2, Upload, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import "@/style.scss";

const Landlord = () => {
  const { t } = useLanguage();
  
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
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

  const [properties] = useState([
    {
      id: "1",
      title: "Modern Villa in CMC",
      location: "CMC, Addis Ababa",
      price: 45000,
      bedrooms: 3,
      bathrooms: 2,
      status: "APPROVED" as const,
      views: 142,
      rating: 4.5,
      reviewCount: 8,
      amenities: ["WiFi", "Parking", "Security"],
    },
    {
      id: "2",
      title: "Apartment in Bole",
      location: "Bole, Addis Ababa",
      price: 35000,
      bedrooms: 2,
      bathrooms: 1,
      status: "PENDING" as const,
      views: 0,
      amenities: ["WiFi", "Gym"],
    },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Redirecting to payment gateway...");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <FrontPage />

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">50+</h3>
                <p className="text-muted-foreground">Active Listings</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">100+</h3>
                <p className="text-muted-foreground">Happy Clients</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">3+</h3>
                <p className="text-muted-foreground">Property Types</p>
              </div>
            </div>
          </div>
        </section>

        {/* Create Property Listing Form */}
        <section id="create-listing" className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">{t("listProperty")}</CardTitle>
                <CardDescription>
                  Fill in the details below to list your property. Pay-per-post model - 500 ETB per listing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">{t("propertyTitle")}</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder={t("propertyTitlePlaceholder")}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">{t("location")}</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder={t("locationPlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">{t("price")}</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder={t("pricePlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        placeholder="e.g., 2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">{t("description")}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t("descriptionPlaceholder")}
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">{t("amenities")}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.keys(formData.amenities).map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={formData.amenities[amenity as keyof typeof formData.amenities]}
                            onCheckedChange={() => handleAmenityChange(amenity)}
                          />
                          <Label
                            htmlFor={amenity}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {amenity === "WiFi" ? t("wifi") : 
                             amenity === "Parking" ? t("parking") : 
                             amenity === "Security" ? t("security") : 
                             amenity === "Gym" ? t("gym") : 
                             amenity === "Pool" ? t("pool") : 
                             amenity === "Garden" ? t("generator") : amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photos">{t("photos")}</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {t("uploadPhotos")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    {t("submitListing")} - 500 ETB
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* My Properties Section */}
        <section id="my-properties" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{t("myProperties")}</h2>
              <p className="text-muted-foreground">{properties.length} Total Listings</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  onEdit={() => toast.info("Edit functionality coming soon")}
                  onViewDetails={() => toast.info("View details functionality coming soon")}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("howItWorks")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From submission to approval in just a few clicks. Get your property in front of thousands of tenants.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                      01
                    </div>
                    <Badge variant="outline">PENDING</Badge>
                  </div>
                  <CardTitle>{t("step1Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("step1Desc")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                      02
                    </div>
                    <Badge variant="secondary">PROCESSING</Badge>
                  </div>
                  <CardTitle>{t("step2Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("step2Desc")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                      03
                    </div>
                    <Badge className="bg-success text-success-foreground">APPROVED</Badge>
                  </div>
                  <CardTitle>{t("step3Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("step3Desc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landlord;
