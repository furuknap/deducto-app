
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type Expense = Tables<"expenses">;
type Category = Tables<"categories">;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [count, setCount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch expenses and categories when the component mounts
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
    
    if (user) {
      fetchExpenses();
      fetchCategories();
    }
  }, [user, loading, navigate]);
  
  const fetchExpenses = async () => {
    try {
      setIsLoadingExpenses(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*, categories(name)")
        .order("date", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingExpenses(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        category_id: categoryId || null,
        count: parseInt(count),
      });
      
      if (error) throw error;
      
      toast({
        title: "Expense added",
        description: "Your expense has been successfully recorded",
      });
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategoryId("");
      setCount("1");
      
      // Refresh expenses
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="container mx-auto py-8 flex-1">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Expense Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What was this expense for?"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No categories yet
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="count">Count</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Recent Expenses */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpenses ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : expenses.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No expenses recorded yet. Add your first expense!
                </p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {expenses.map((expense) => {
                    const category = expense.categories as unknown as Category;
                    return (
                      <div
                        key={expense.id}
                        className="flex justify-between items-center p-3 border rounded bg-white"
                      >
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <div className="text-sm text-gray-500 flex space-x-2">
                            <span>
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                            {category && <span>• {category.name}</span>}
                            {expense.count > 1 && <span>• Qty: {expense.count}</span>}
                          </div>
                        </div>
                        <div className="font-bold">
                          ${parseFloat(expense.amount.toString()).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">
                  Total:{" "}
                  <span className="font-bold">
                    $
                    {expenses
                      .reduce(
                        (sum, expense) => 
                          sum + parseFloat(expense.amount.toString()) * expense.count, 
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
