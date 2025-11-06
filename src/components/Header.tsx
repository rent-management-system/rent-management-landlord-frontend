import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
    
        {/* Center Menu (Desktop) */}
        <nav className="hidden md:flex gap-10 text-gray-800 font-medium">
          <Link to="/" className="hover:text-black">{t("home")}</Link>
          <Link to="/about" className="hover:text-black">{t("about")}</Link>
          <Link to="/properties" className="hover:text-black">{t("properties")}</Link>
          <Link to="/testimonials" className="hover:text-black">{t("testimonials")}</Link>
          <Link to="/contact" className="hover:text-black">{t("contact")}</Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[120px]">
                {language === "en" ? "English" : language === "am" ? "አማርኛ" : "Afaan Oromo"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("am")}>አማርኛ</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("om")}>Afaan Oromo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Button */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5 text-gray-800" />
          </Button>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          <Link to="/" onClick={() => setOpen(false)}>{t("home")}</Link>
          <Link to="/about" onClick={() => setOpen(false)}>{t("about")}</Link>
          <Link to="/properties" onClick={() => setOpen(false)}>{t("properties")}</Link>
          <Link to="/testimonials" onClick={() => setOpen(false)}>{t("testimonials")}</Link>
          <Link to="/contact" onClick={() => setOpen(false)}>{t("contact")}</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
