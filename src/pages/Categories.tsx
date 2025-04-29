import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getUserCategories, addCategory, deleteCategory, Category } from "@/utils/dataStorage";

const Categories = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch categories when the component mounts
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
    
    if (user) {
      fetchCategories();
    }
  }, [user, loading, navigate]);
  
  const fetchCategories = () => {
    try {
      setIsLoading(true);
      if (!user) return;
      
      console.log("Fetching categories for user:", user.id);
      
      const userCategories = getUserCategories(user.id);
      console.log(`Fetched ${userCategories.length} categories for user ${user.id}`);
      
      setCategories(userCategories);
    } catch (error: any) {
      toast({
        title: t("errorFetchingCategories"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      addCategory(user.id, newCategoryName.trim());
      
      toast({
        title: t("categoryAdded"),
        description: t("categorySuccessfullyAdded"),
      });
      
      // Reset form
      setNewCategoryName("");
      
      // Refresh categories
      fetchCategories();
    } catch (error: any) {
      toast({
        title: t("errorAddingCategory"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = (id: string) => {
    try {
      if (!user) return;
      
      const success = deleteCategory(user.id, id);
      
      if (!success) throw new Error("Failed to delete category");
      
      toast({
        title: t("categoryDeleted"),
        description: t("categorySuccessfullyDeleted"),
      });
      
      // Refresh categories
      fetchCategories();
    } catch (error: any) {
      toast({
        title: t("errorDeletingCategory"),
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="container mx-auto py-8 flex-1">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Category Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("addNewCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">{t("categoryName")}</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("enterCategoryName")}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("addingCategory") : t("addCategory")}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>{t("manageCategories")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>{t("loadingCategories")}</p>
              ) : categories.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {t("noCategories")}
                </p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex justify-between items-center p-3 border rounded bg-white"
                    >
                      <span>{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        aria-label={t("deleteCategory")}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Categories;
