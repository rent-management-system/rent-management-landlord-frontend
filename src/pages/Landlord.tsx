
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import heroImage from "@/assets/hero-property.png";
import { Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Landlord = () => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    amenities: {
      WiFi: false,
      Parking: false,
      Security: false,
    },
  });
  const [file, setFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to submit a property.");
      return;
    }

    const amenities = Object.keys(formData.amenities).filter(
      (amenity) => formData.amenities[amenity as keyof typeof formData.amenities]
    );

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("price", formData.price);
    amenities.forEach(amenity => data.append("amenities", amenity));
    if (file) {
      data.append("file", file);
    }

    try {
      const response = await fetch("https://property-listing-service.onrender.com/api/v1/properties/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to submit property");
      }

      const result = await response.json();
      toast.success("Property submitted successfully! Redirecting to payment...");
      window.location.href = result.payment_url;
    } catch (error) {
      toast.error("Failed to submit property");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              {/* Left Text */}
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                  {t("heroTitle")}
                </h1>

                <p className="text-lg text-muted-foreground mb-10 max-w-md">
                  {t("heroSubtitle")}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-base"
                    onClick={() => document.getElementById('create-listing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t("getStarted")}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base"
                    onClick={() => document.getElementById('my-properties')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t("myProperties")}
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl w-full h-[430px]">
                  <img
                    src={heroImage}
                    alt="Property Management"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-primary/20 rounded-full translate-x-10 translate-y-10"></div>
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
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photos">{t("photos")}</Label>
                    <Input id="photos" type="file" onChange={handleFileChange} />
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
              <p className="text-muted-foreground">0 Total Listings</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Properties will be fetched and displayed here */}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landlord;

