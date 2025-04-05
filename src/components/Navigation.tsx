
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xl font-bold text-primary">
          {t("appName")}
        </Link>
        
        {user && (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-primary">
              {t("dashboard")}
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary">
              {t("categories")}
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <LanguageSwitcher />
        
        {user ? (
          <Button onClick={signOut} variant="outline">
            {t("signOut")}
          </Button>
        ) : (
          <span className="text-sm text-gray-500">
            {t("welcome")}
          </span>
        )}
      </div>
    </nav>
  );
}
