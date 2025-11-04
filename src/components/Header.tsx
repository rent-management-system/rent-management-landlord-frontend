import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            {t("rentalManagement")}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:opacity-70 transition-opacity">
              {t("home")}
            </Link>
            <Link to="/about" className="hover:opacity-70 transition-opacity">
              {t("about")}
            </Link>
            <Link to="/properties" className="hover:opacity-70 transition-opacity">
              {t("properties")}
            </Link>
            <Link to="/testimonials" className="hover:opacity-70 transition-opacity">
              {t("testimonials")}
            </Link>
            <Link to="/contact" className="hover:opacity-70 transition-opacity">
              {t("contact")}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {language === "en" ? "English" : language === "am" ? "አማርኛ" : "Afaan Oromo"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("am")}>አማርኛ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("om")}>Afaan Oromo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t("login")}</DropdownMenuItem>
                <DropdownMenuItem>{t("signUp")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/">{t("home")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about">{t("about")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/properties">{t("properties")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/testimonials">{t("testimonials")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact">{t("contact")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
