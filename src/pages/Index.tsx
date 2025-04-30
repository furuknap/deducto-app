
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  // Automatically redirect to dashboard
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  // This will only show briefly before the redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Redirecting to dashboard...</p>
    </div>
  );
};

export default Index;
