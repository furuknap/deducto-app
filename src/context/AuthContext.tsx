
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  getAuthUser, 
  saveAuthUser, 
  clearAuthUser, 
  validateCredentials, 
  registerUser 
} from "@/utils/authStorage";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session in localStorage
    const checkSession = async () => {
      const storedUser = getAuthUser();
      setUser(storedUser);
      setLoading(false);
    };
    
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = validateCredentials(email, password);
      
      if (!user) throw new Error("Invalid email or password");
      
      // Save user to localStorage
      saveAuthUser(user);
      setUser(user);
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const user = registerUser(email, password);
      
      // Don't automatically sign in after registration
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      clearAuthUser();
      setUser(null);
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
