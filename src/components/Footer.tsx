import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white text-foreground mt-20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{t("rentalManagement")}</h3>
            <p className="text-sm opacity-90">
              Ethiopia's premier rental management platform connecting landlords and tenants.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:opacity-70 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:opacity-70 transition-opacity">
                  About
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:opacity-70 transition-opacity">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/landlord" className="hover:opacity-70 transition-opacity">
                  Landlord Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="hover:opacity-70 transition-opacity">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:opacity-70 transition-opacity">
                  Testimonials
                </Link>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} {t("rentalManagement")}. {t("allRightsReserved")}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;