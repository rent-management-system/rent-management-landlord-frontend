import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    console.log("🎯 AuthCallback component mounted");
    console.log("📍 Full current URL:", window.location.href);
    console.log("🔍 Location search:", location.search);
    console.log("📁 Location pathname:", location.pathname);

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    console.log("🔑 Extracted token:", token ? `Present (${token.length} chars)` : "NULL");

    if (token) {
      try {
        // Store token
        localStorage.setItem("authToken", token);
        console.log("✅ Token stored in localStorage successfully");
        
        // Verify storage
        const storedToken = localStorage.getItem("authToken");
        console.log("🔒 Verified stored token:", storedToken ? "Present" : "Missing");
        
        setStatus("success");
        toast.success("Login successful! Redirecting to dashboard...");
        
        // Small delay to show success message
        setTimeout(() => {
          console.log("🔄 Redirecting to /landlord...");
          navigate("/landlord", { replace: true });
        }, 1000);
        
      } catch (error) {
        console.error("❌ Error storing token:", error);
        setStatus("error");
        toast.error("Authentication failed: Could not store token");
        setTimeout(() => navigate("/"), 2000);
      }
    } else {
      console.error("❌ No token provided in URL");
      console.log("📋 All URL parameters:", Object.fromEntries(params.entries()));
      setStatus("error");
      toast.error("Login failed: No authentication token provided");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [location, navigate]);

  // Different UI states based on status
  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-green-600 font-medium">Authentication successful! Redirecting...</p>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="w-12 h-12 border-4 border-red-500 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <p className="text-red-600 font-medium">Authentication failed! Redirecting...</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium">Processing authentication...</p>
            <p className="text-sm text-gray-500">Please wait while we verify your credentials</p>
          </div>
        );
    }
  };

  return renderContent();
};

export default AuthCallback;