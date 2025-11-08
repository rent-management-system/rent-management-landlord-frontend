import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      toast.success("Login successful! Redirecting...");
      navigate("/landlord");
    } else {
      toast.error("Login failed: No token provided.");
      navigate("/"); // Or to a login page
    }
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
