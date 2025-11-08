import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthCallback component mounted.");
    console.log("Current location.search:", location.search);

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    console.log("Extracted token:", token ? "Token found" : "No token found");

    if (token) {
      localStorage.setItem("authToken", token);
      console.log("Auth token stored in localStorage.");
      toast.success("Login successful! Redirecting...");
      navigate("/landlord");
    } else {
      console.error("AuthCallback: No token provided in URL.");
      toast.error("Login failed: No token provided.");
      navigate("/"); // Or to a login page
    }
    console.log("AuthCallback useEffect finished.");
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
