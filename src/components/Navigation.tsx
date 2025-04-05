
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xl font-bold text-primary">
          Galletas y Gastos
        </Link>
        
        {user && (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-primary">
              Dashboard
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary">
              Categories
            </Link>
          </div>
        )}
      </div>
      
      {user ? (
        <Button onClick={signOut} variant="outline">
          Sign Out
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Welcome to expense tracking
          </span>
        </div>
      )}
    </nav>
  );
}
