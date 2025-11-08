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

const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t, i18n } = useTranslation();

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

  // Function to handle external navigation
  const handleExternalLink = (url: string) => {
    closeNav();
    window.open(url, "_blank");
  };

  return (
    <div className="flex items-center justify-between pt-4 px-3 relative z-20">
      <div>
        <img
          src="/Black.png"
          alt="Logo"
          className="h-20"
        />
      </div>

      <nav className="items-center space-x-12 list-none hidden md:flex">
        <a
          href="https://rent-management-system-tau.vercel.app/"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700 cursor-pointer"
        >
          {t("home")}
        </a>
        <a
          href="https://rent-management-system-tau.vercel.app/#about"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700 cursor-pointer"
        >
          {t("about")}
        </a>
        <a
          href="https://rent-management-system-tau.vercel.app/#product"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700 cursor-pointer"
        >
          {t("properties")}
        </a>
        <a
          href="https://rent-management-system-tau.vercel.app/#testimonials"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700 cursor-pointer"
        >
          {t("testimonials")}
        </a>
        <a
          href="https://rent-management-system-tau.vercel.app/contact"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-gray-700 cursor-pointer"
        >
          {t("contact")}
        </a>
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
              {t("select_language")}
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
          <button
            onClick={() => handleExternalLink("https://rent-management-system-tau.vercel.app/")}
            className="text-[1.25rem] font-medium text-left"
          >
            {t("home")}
          </button>

          <button
            onClick={() => handleExternalLink("https://rent-management-system-tau.vercel.app/#about")}
            className="text-[1.25rem] font-medium text-left"
          >
            {t("about")}
          </button>

          <button
            onClick={() => handleExternalLink("https://rent-management-system-tau.vercel.app/#product")}
            className="text-[1.25rem] font-medium text-left"
          >
            {t("properties")}
          </button>

          <button
            onClick={() => handleExternalLink("https://rent-management-system-tau.vercel.app/#testimonials")}
            className="text-[1.25rem] font-medium text-left"
          >
            {t("testimonials")}
          </button>

          <button
            onClick={() => handleExternalLink("https://rent-management-system-tau.vercel.app/contact")}
            className="text-[1.25rem] font-medium text-left"
          >
            {t("contact")}
          </button>

          <div className="mt-4">
            <select
              className="w-full p-2 rounded-md bg-[#333] border border-gray-600 text-white"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
            >
              <option value="" disabled>
                {t("select_language")}
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