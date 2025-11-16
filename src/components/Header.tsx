import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, User, X } from "lucide-react";
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
  };

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
        {/* Desktop right controls - FIXED ACCOUNT DROPDOWN */}
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

          {/* WORKING Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex gap-1 items-center cursor-pointer account-container">
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  className="text-[#222a2f] opacity-90"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-[#222a2f]"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t("login")}</DropdownMenuItem>
              <DropdownMenuItem>{t("signUp")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: HAMBURGER TOGGLE WITH INLINE STYLES */}
        <div className="md:hidden ml-2">
          <div
            className={`hamburger-icon ${isNavOpen && "gap"}`}
            onClick={toggleNav}
            style={{
              paddingRight: "2px",
              transform: "scale(0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "4px",
              position: "absolute",
              height: "44px",
              width: "60px",
              top: "1.4rem",
              right: "1rem",
              zIndex: 1000,
              cursor: "pointer",
              borderRadius: "5px",
              transition: "all 0.2s ease-in-out",
              background: "rgb(255 255 255 / 43%)",
              boxShadow: isNavOpen ? "0px 0px 30px rgba(0, 0, 0, 0.1)" : "none"
            }}
          >
            <div 
              className={`icon-1 ${isNavOpen && "a"}`}
              style={{
                width: isNavOpen ? "37px" : "32px",
                height: "3px",
                backgroundColor: "black",
                transition: "all 400ms ease",
                transform: isNavOpen ? "rotate(40deg)" : "none",
                position: "relative",
                top: isNavOpen ? "3px" : "0"
              }}
            ></div>
            <div 
              className={`icon-2 ${isNavOpen && "c"}`}
              style={{
                width: "32px",
                height: "3px",
                backgroundColor: "black",
                transition: "all 400ms ease",
                opacity: isNavOpen ? "0" : "1"
              }}
            ></div>
            <div 
              className={`icon-3 ${isNavOpen && "b"}`}
              style={{
                width: isNavOpen ? "37px" : "32px",
                height: "3px",
                backgroundColor: "black",
                transition: "all 400ms ease",
                transform: isNavOpen ? "rotate(-40deg)" : "none",
                position: "relative",
                bottom: isNavOpen ? "2px" : "0"
              }}
            ></div>
          </div>
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

      {/* ORIGINAL MOBILE NAVIGATION */}
      <div 
        id="nav" 
        className={`fixed top-0 right-0 h-screen bg-[#222a2f] text-white z-[9999] transition-all duration-600 ease-spring-bounce delay-100 ${
          isNavOpen ? "w-[53%] opacity-100" : "w-0 opacity-0"
        }`}
        aria-hidden={!isNavOpen}
      >
        <ul className="ul" style={{ margin: 0, position: "absolute", top: "30%", left: "7vw", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li className="li li1" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("home")}
            </a>
          </li>
          <li className="li li2" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/#about" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("about")}
            </a>
          </li>
          <li className="li li3" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/#product" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("properties")}
            </a>
          </li>
          <li className="li li4" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/#testimonials" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("testimonials")}
            </a>
          </li>
          <li className="li li5" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/contact" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("contact")}
            </a>
          </li>
          <li className="li">
            <select
              className="sign"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              style={{
                display: "flex",
                padding: "0 2rem",
                backgroundColor: "transparent",
                borderRadius: "0.3rem",
                alignItems: "center",
                color: "#d8ccccfc",
                fontSize: "1.3rem",
                marginTop: "1rem",
                transition: "all 0.3s",
                borderRight: "3px solid",
                borderTop: "1px solid",
                borderBottom: "3px solid",
                borderLeft: "1px solid"
              }}
            >
              <option value="" disabled>
                {t("select_language")}
              </option>
              <option value="am">{t("amharic_option")}</option>
              <option value="en">{t("english_option")}</option>
              <option value="om">{t("afan_oromo_option")}</option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;