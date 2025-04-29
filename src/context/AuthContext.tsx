import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { isOnline } from "@/utils/serviceWorkerUtils";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  offlineSignIn: (email: string) => Promise<void>;
  isOfflineMode: boolean;
};

// Create a mock user for offline mode
const createOfflineUser = (email: string): User => {
  return {
    id: `offline-${email.replace(/[^a-zA-Z0-9]/g, "-")}`,
    email: email,
    app_metadata: {},
    user_metadata: { isOfflineUser: true },
    aud: "offline",
    created_at: new Date().toISOString(),
  } as User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        // Check if we have an offline user stored
        const offlineUserStr = localStorage.getItem("offlineUser");
        if (offlineUserStr) {
          const offlineUser = JSON.parse(offlineUserStr);
          setUser(offlineUser);
          setIsOfflineMode(true);
          setLoading(false);
          return;
        }

        // If online, try to get the session from Supabase
        if (isOnline()) {
          const { data } = await supabase.auth.getSession();
          setUser(data.session?.user || null);
          setIsOfflineMode(false);
        } else {
          // If offline and no stored user, we're in offline mode but not logged in
          setIsOfflineMode(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsOfflineMode(!isOnline());
      } finally {
        setLoading(false);
      }

      // Listen for auth changes if online
      if (isOnline()) {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user || null);
            // If user signs out, clear offline user too
            if (event === "SIGNED_OUT") {
              localStorage.removeItem("offlineUser");
              setIsOfflineMode(false);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    };

    checkSession();

    // Listen for online/offline changes
    const handleOnline = () => {
      setIsOfflineMode(false);
      checkSession();
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // If offline, use offline sign in
      if (!isOnline()) {
        return offlineSignIn(email);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: unknown) {
      toast({
        title: "Error signing in",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const offlineSignIn = async (email: string) => {
    try {
      // Create an offline user
      const offlineUser = createOfflineUser(email);

      // Store in localStorage for persistence
      localStorage.setItem("offlineUser", JSON.stringify(offlineUser));

      // Update state
      setUser(offlineUser);
      setIsOfflineMode(true);

      toast({
        title: "Offline Mode",
        description:
          "You are now signed in with offline mode. Some features may be limited.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error signing in offline",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // If offline, use offline sign in instead
      if (!isOnline()) {
        return offlineSignIn(email);
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check your email for the confirmation link",
      });
    } catch (error: unknown) {
      toast({
        title: "Error signing up",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear offline user
      localStorage.removeItem("offlineUser");

      // If online, also sign out from Supabase
      if (isOnline()) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      // Update state
      setUser(null);
      setIsOfflineMode(false);
    } catch (error: unknown) {
      toast({
        title: "Error signing out",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        offlineSignIn,
        isOfflineMode,
      }}
    >
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
