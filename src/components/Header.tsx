import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

// Extend the global Window and Document interfaces
declare global {
  interface Window {
    location: {
      href: string;
      assign(url: string): void;
    };
  }
  
  interface Document {
    body: {
      style: {
        overflow: string;
      };
    };
  }
}

const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleNav = () => setIsNavOpen((s) => !s);
  const closeNav = () => setIsNavOpen(false);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement> | string) => {
    const lang = typeof e === 'string' ? e : (e.target as unknown as { value: string }).value;
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    try {
      // Clear authentication tokens from storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("access_token");
      console.log("🔒 Cleared auth tokens from storage");
    } catch (e) {
      console.warn("Failed to clear tokens during logout", e);
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = "https://rental-user-management-frontend-sigma.vercel.app/";
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard");
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

  return (
    <div className="flex items-center justify-between pt-4 px-3 relative z-20">
      <div>
        <Link to="/">
          <img
            src="/Black.png"
            alt="Logo"
            className="h-20 cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      <nav className="items-center space-x-12 list-none hidden md:flex">
        <Link
          to="/"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
          onClick={closeNav}
        >
          {t("home")}
        </Link>
        <Link 
          to="/dashboard"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
        >
          {t("dashboard")}
        </Link>
        <Link
          to="/landlord#create-listing"
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
          onClick={closeNav}
        >
          {t("properties")}
        </Link>
        <li className="nav-item">
          <Link 
            className="nav-link text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer" 
            to="/contact"
          >
            {t('contact')}
          </Link>
        </li>
      </nav>

      <div className="flex items-center">
        {/* Desktop right controls */}
        <div className="nav-child3 -mr-4 hidden md:flex items-center space-x-3">
          <select
            className="language-selector-desktop bg-transparent border p-1 rounded"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = (e.target as unknown as { value: string }).value;
              changeLanguage(value);
            }}
            value={i18n.language}
          >
            <option value="" disabled>
              {t("select_language")}
            </option>
            <option value="am">{t("amharic_option")}</option>
            <option value="en">{t("english_option")}</option>
            <option value="om">{t("afan_oromo_option")}</option>
          </select>

          {/* ENHANCED Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
                {/* Beautiful User Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                {/* Chevron Icon */}
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-primary transition-transform duration-300 group-hover:rotate-180"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 p-2 rounded-xl shadow-xl border border-gray-200"
            >
              {/* Dashboard Option */}
              <DropdownMenuItem 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={handleDashboard}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Dashboard</span>
                  <span className="text-xs text-gray-500">Manage your account</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              {/* Logout Button */}
              <DropdownMenuItem 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors group"
                onClick={handleLogout}
              >
                <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 group-hover:text-destructive transition-colors">
                    Logout
                  </span>
                  <span className="text-xs text-gray-500">Sign out of your account</span>
                </div>
              </DropdownMenuItem>
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
              boxShadow: isNavOpen ? "0px 0px 30px rgba(0, 0, 0, 0.1)" : "none",
              color: "hsl(var(--primary))"
            }}
          >
            <div 
              className={`icon-1 ${isNavOpen && "a"}`}
              style={{
                width: isNavOpen ? "37px" : "32px",
                height: "3px",
                backgroundColor: "currentColor",
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
                backgroundColor: "currentColor",
                transition: "all 400ms ease",
                opacity: isNavOpen ? "0" : "1"
              }}
            ></div>
            <div 
              className={`icon-3 ${isNavOpen && "b"}`}
              style={{
                width: isNavOpen ? "37px" : "32px",
                height: "3px",
                backgroundColor: "currentColor",
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
            <Link 
              to="/" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("home")}
            </Link>
          </li>
          <li className="li li2" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <Link 
              to="/dashboard"
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("dashboard")}
            </Link>
          </li>
          <li className="li li3" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <Link 
              to="/landlord#create-listing"
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t("properties")}
            </Link>
          </li>
          
          {/* Dashboard Link */}
          <li className="li li-dashboard" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="/dashboard" 
              onClick={(e) => {
                e.preventDefault();
                closeNav();
                handleDashboard();
              }}
              style={{ 
                textDecoration: "none", 
                color: "#d8ccccfc", 
                whiteSpace: "normal", 
                overflowWrap: "break-word",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <LayoutDashboard size={20} />
              {t("dashboard")}
            </a>
          </li>
          
          {/* Logout Button */}
          <li className="li li-logout" style={{ listStyle: "none", fontSize: "24px", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <button
              onClick={() => {
                closeNav();
                handleLogout();
              }}
              style={{ 
                background: "none",
                border: "none",
                color: "#ff6b6b",
                padding: 0,
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <LogOut size={20} />
              {t("logout")}
            </button>
          </li>
          <li className="li li5" style={{ listStyle: "none", fontSize: "24px", color: "#fff", lineHeight: "2.2", textTransform: "uppercase", letterSpacing: "1.7px", cursor: "pointer" }}>
            <a 
              href="https://rent-management-system-tau.vercel.app/contact" 
              onClick={closeNav}
              style={{ textDecoration: "none", color: "#d8ccccfc", whiteSpace: "normal", overflowWrap: "break-word" }}
            >
              {t('contact')}
            </a>
          </li>
          <li className="li">
            <select
              className="sign"
              onChange={changeLanguage}
              value={i18n.language}
              style={{
                display: "flex",
                padding: "0 2rem",
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                backgroundImage: "url(" + "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E" + ")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.7em top 50%",
                backgroundSize: "1em auto"
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