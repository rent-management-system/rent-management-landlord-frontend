import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, User, X } from "lucide-react"; // X icon included
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const toggleNav = () => setIsNavOpen((s) => !s);
  const closeNav = () => setIsNavOpen(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // optionally: closeNav();
  };

  // lock body scrolling when drawer is open
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  return (
    <div className="flex items-center justify-between pt-4 px-3 relative z-20">
      <div>
        <img
          src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG9nb3xlbnwwfDB8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500"
          alt="Logo"
          className="h-10"
        />
      </div>

      <nav className="items-center space-x-12 list-none hidden md:flex">
        <Link
          to="/"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700"
        >
          About
        </Link>
        <Link
          to="/properties"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700"
        >
          Properties
        </Link>
        <Link
          to="/testimony"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700"
        >
          Testimony
        </Link>
        <Link
          to="/contact"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700"
        >
          Contact
        </Link>
      </nav>

      <div className="flex items-center">
        {/* Desktop right controls */}
        <div className="nav-child3 -mr-4 hidden md:flex items-center space-x-3">
          <select
            className="language-selector-desktop bg-transparent border p-1 rounded"
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
          >
            <option value="" disabled>
              {t("English")}
            </option>
            <option value="am">{t("amharic_option")}</option>
            <option value="en">{t("english_option")}</option>
            <option value="om">{t("afan_oromo_option")}</option>
          </select>

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
        </div>

        {/* Mobile: hamburger opens custom drawer */}
        <div className="md:hidden ml-2">
          <button
            onClick={toggleNav}
            aria-expanded={isNavOpen}
            aria-label="Open menu"
            className="p-2 rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          isNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } z-[9998]`}
        onClick={closeNav}
        aria-hidden={!isNavOpen}
      />

      {/* DRAWER (right side) */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[80vw] max-w-[420px] bg-[#222a2f] text-white z-[9999] transform transition-transform duration-300 shadow-lg
          ${isNavOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!isNavOpen}
        role="dialog"
        aria-label="Mobile navigation"
      >
        {/* Close / X button */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={closeNav}
            aria-label="Close menu"
            className="p-2 rounded-md hover:bg-white/10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Drawer content */}
        <nav className="px-6 pb-8 flex flex-col space-y-6">
          <Link
            to="/"
            onClick={closeNav}
            className="text-[1.25rem] font-medium"
          >
            {t("home")}
          </Link>

          <Link
            to="/about"
            onClick={closeNav}
            className="text-[1.25rem] font-medium"
          >
            {t("about")}
          </Link>

          <Link
            to="/properties"
            onClick={closeNav}
            className="text-[1.25rem] font-medium"
          >
            {t("properties")}
          </Link>

          <Link
            to="/testimonials"
            onClick={closeNav}
            className="text-[1.25rem] font-medium"
          >
            {t("testimonials")}
          </Link>

          <Link
            to="/contact"
            onClick={closeNav}
            className="text-[1.25rem] font-medium"
          >
            {t("contact")}
          </Link>

          <div className="mt-4">
            <select
              className="w-full p-2 rounded-md bg-[#333] border border-gray-600 text-white"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
            >
              <option value="" disabled>
                {t("English")}
              </option>
              <option value="am">{t("amharic_option")}</option>
              <option value="en">{t("english_option")}</option>
              <option value="om">{t("afan_oromo_option")}</option>
            </select>
          </div>

          <div className="mt-auto pb-6">
            <button className="w-full rounded-md border border-white/20 py-2">
              {t("login")}
            </button>
            <button className="w-full rounded-md bg-white text-black mt-3 py-2">
              {t("signUp")}
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Header;
