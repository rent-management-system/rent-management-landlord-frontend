// import React, { createContext, useContext } from 'react';
// import { useTranslation } from 'react-i18next';

// interface LanguageContextType {
//   t: (key: string) => string;
//   i18n: any; // i18n instance from react-i18next
//   changeLanguage: (lang: string) => void;
// }

// const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { t, i18n } = useTranslation();

//   const changeLanguage = (lang: string) => {
//     i18n.changeLanguage(lang);
//   };

//   return (
//     <LanguageContext.Provider value={{ t, i18n, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (context === undefined) {
//     throw new Error('useLanguage must be used within a LanguageProvider');
//   }
//   return context;
// };



import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "am" | "om";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    rentalManagement: "Rental Management",
    home: "Home",
    about: "About",
    properties: "Properties",
    testimonials: "Testimonials",
    contact: "Contact",
    login: "Login",
    signUp: "Sign Up",
    
    // Hero
    heroTitle: "List Your Property with Confidence",
    heroSubtitle: "Reach thousands of potential tenants and manage your properties efficiently with our platform",
    getStarted: "Get Started",
    
    // How it works
    howItWorks: "How It Works",
    step1Title: "Create Listing",
    step1Desc: "Add your property details, photos, and pricing",
    step2Title: "Pay & Activate",
    step2Desc: "Choose your package and activate your listing",
    step3Title: "Manage Inquiries",
    step3Desc: "Receive and manage tenant applications",
    
    // Form
    listProperty: "List Your Property",
    propertyTitle: "Property Title",
    propertyTitlePlaceholder: "e.g., Modern 2BR Apartment in Bole",
    description: "Description",
    descriptionPlaceholder: "Describe your property...",
    location: "Location",
    locationPlaceholder: "e.g., Bole, Addis Ababa",
    price: "Monthly Rent (ETB)",
    pricePlaceholder: "e.g., 15000",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    amenities: "Amenities",
    wifi: "WiFi",
    parking: "Parking",
    gym: "Gym",
    pool: "Pool",
    security: "24/7 Security",
    generator: "Generator",
    photos: "Property Photos",
    uploadPhotos: "Upload Photos",
    package: "Select Package",
    basic: "Basic - 500 ETB",
    featured: "Featured - 1000 ETB",
    premium: "Premium - 2000 ETB",
    submitListing: "Submit Listing",
    
    // Dashboard
    myProperties: "My Properties",
    views: "views",
    rating: "rating",
    edit: "Edit",
    delete: "Delete",
    
    // Footer
    quickLinks: "Quick Links",
    forLandlords: "For Landlords",
    forTenants: "For Tenants",
    resources: "Resources",
    howToList: "How to List",
    pricing: "Pricing",
    faq: "FAQ",
    blog: "Blog",
    support: "Support",
    contactUs: "Contact Us",
    helpCenter: "Help Center",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    followUs: "Follow Us",
    allRightsReserved: "All rights reserved",
  },
  am: {
    // Header
    rentalManagement: "የኪራይ አስተዳደር",
    home: "ዋና ገጽ",
    about: "ስለ እኛ",
    properties: "ንብረቶች",
    testimonials: "ምስክርነቶች",
    contact: "አግኙን",
    login: "ግባ",
    signUp: "ተመዝገብ",
    
    // Hero
    heroTitle: "ንብረትዎን በልበ ሙሉነት ያስዋጁ",
    heroSubtitle: "በሺዎች የሚቆጠሩ ተከራዮችን ይድረሱ እና ንብረትዎን በብቃት ያስተዳድሩ",
    getStarted: "ይጀምሩ",
    
    // How it works
    howItWorks: "እንዴት ይሰራል",
    step1Title: "ዝርዝር ይፍጠሩ",
    step1Desc: "የንብረት ዝርዝሮች፣ ፎቶዎች እና ዋጋ ያክሉ",
    step2Title: "ይክፈሉ እና ያግብሩ",
    step2Desc: "ፓኬጅዎን ይምረጡ እና ዝርዝርዎን ያግብሩ",
    step3Title: "ጥያቄዎችን ያስተዳድሩ",
    step3Desc: "የተከራይ ማመልከቻዎችን ይቀበሉ እና ያስተዳድሩ",
    
    // Form
    listProperty: "ንብረትዎን ያስዋጁ",
    propertyTitle: "የንብረት ርዕስ",
    propertyTitlePlaceholder: "ምሳሌ: በቦሌ ያለ ዘመናዊ 2 መኝታ ቤት",
    description: "መግለጫ",
    descriptionPlaceholder: "ንብረትዎን ይግለጹ...",
    location: "አድራሻ",
    locationPlaceholder: "ምሳሌ: ቦሌ፣ አዲስ አበባ",
    price: "ወርሃዊ ኪራይ (ብር)",
    pricePlaceholder: "ምሳሌ: 15000",
    bedrooms: "መኝታ ቤቶች",
    bathrooms: "መታጠቢያ ቤቶች",
    amenities: "አገልግሎቶች",
    wifi: "ዋይፋይ",
    parking: "መኪና ማቆሚያ",
    gym: "ጂም",
    pool: "ገንዳ",
    security: "24/7 ደህንነት",
    generator: "ጄነሬተር",
    photos: "የንብረት ፎቶዎች",
    uploadPhotos: "ፎቶዎችን ይጫኑ",
    package: "ፓኬጅ ይምረጡ",
    basic: "መሰረታዊ - 500 ብር",
    featured: "የተመረጠ - 1000 ብር",
    premium: "ፕሪሚየም - 2000 ብር",
    submitListing: "ዝርዝር ያስገቡ",
    
    // Dashboard
    myProperties: "የእኔ ንብረቶች",
    views: "እይታዎች",
    rating: "ደረጃ",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    
    // Footer
    quickLinks: "ፈጣን አገናኞች",
    forLandlords: "ለቤት ባለቤቶች",
    forTenants: "ለተከራዮች",
    resources: "ግብዓቶች",
    howToList: "እንዴት እንደሚዘረዝር",
    pricing: "ዋጋ አሰጣጥ",
    faq: "ተደጋጋሚ ጥያቄዎች",
    blog: "ብሎግ",
    support: "ድጋፍ",
    contactUs: "አግኙን",
    helpCenter: "የእገዛ ማእከል",
    legal: "ህጋዊ",
    privacyPolicy: "የግላዊነት ፖሊሲ",
    termsOfService: "የአገልግሎት ውሎች",
    followUs: "ይከተሉን",
    allRightsReserved: "መብቱ በህግ የተጠበቀ ነው",
  },
  om: {
    // Header
    rentalManagement: "Bulchiinsa Kiraa",
    home: "Mana",
    about: "Waa'ee Keenya",
    properties: "Qabeenyawwan",
    testimonials: "Ragaalee",
    contact: "Nu Quunnamaa",
    login: "Seeni",
    signUp: "Galmaa'i",
    
    // Hero
    heroTitle: "Qabeenyaa Kee Amanamummaan Beeksisi",
    heroSubtitle: "Kireeffattoota kumaatama argachuu fi qabeenyaa kee bu'a qabeessaan bulchi",
    getStarted: "Jalqabi",
    
    // How it works
    howItWorks: "Akkamitti Hojjeta",
    step1Title: "Tarree Uumi",
    step1Desc: "Ibsa qabeenyaa, suuraa fi gatii dabalaa",
    step2Title: "Kaffaltii fi Kakaasaa",
    step2Desc: "Paakeejii kee filattee tarree kee kakaasaa",
    step3Title: "Gaaffilee Bulchi",
    step3Desc: "Iyyannoo kireeffattoota fudhadhuu bulchi",
    
    // Form
    listProperty: "Qabeenyaa Kee Tarreessi",
    propertyTitle: "Mataduree Qabeenyaa",
    propertyTitlePlaceholder: "Fkn: Mana Hidhaa 2 Ammayyaa Bole keessa",
    description: "Ibsa",
    descriptionPlaceholder: "Qabeenyaa kee ibsi...",
    location: "Bakka",
    locationPlaceholder: "Fkn: Bole, Finfinnee",
    price: "Kiraa Ji'aa (Qarshii)",
    pricePlaceholder: "Fkn: 15000",
    bedrooms: "Kutaa Rafaa",
    bathrooms: "Kutaa Dhiqannaa",
    amenities: "Tajaajilawwan",
    wifi: "Waayifaay",
    parking: "Konkolaataa Dhaabbii",
    gym: "Jiim",
    pool: "Haroo",
    security: "Nageenyaa 24/7",
    generator: "Jenereetara",
    photos: "Suuraa Qabeenyaa",
    uploadPhotos: "Suuraa Fe'i",
    package: "Paakeejii Fili",
    basic: "Bu'uraa - Qarshii 500",
    featured: "Filatamaa - Qarshii 1000",
    premium: "Piremiiyeemii - Qarshii 2000",
    submitListing: "Tarree Galchi",
    
    // Dashboard
    myProperties: "Qabeenyawwan Koo",
    views: "ilaalchisoota",
    rating: "sadarkaa",
    edit: "Gulaali",
    delete: "Haqi",
    
    // Footer
    quickLinks: "Geessituu Saffisaa",
    forLandlords: "Abbootii Qabeenyaatiif",
    forTenants: "Kireeffattoota",
    resources: "Qabeenya",
    howToList: "Akkamitti Tarreessuu",
    pricing: "Gatii",
    faq: "Gaaffilee Irra Deddeebi'an",
    blog: "Biloogii",
    support: "Deeggara",
    contactUs: "Nu Quunnamaa",
    helpCenter: "Giddugala Gargaarsaa",
    legal: "Seeraa",
    privacyPolicy: "Imaammata Iccitii",
    termsOfService: "Haalawwan Tajaajilaa",
    followUs: "Nu Hordofaa",
    allRightsReserved: "Mirgi hunduu ni eegama",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("am");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
