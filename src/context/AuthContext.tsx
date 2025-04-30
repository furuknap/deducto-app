
import { createContext, useContext } from "react";

// Simplified User type
export type User = {
  id: string;
  email: string;
};

// Create a default test user
const defaultUser: User = {
  id: "default_user",
  email: "user@example.com"
};

type AuthContextType = {
  user: User;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Always provide the default user
  const user = defaultUser;
  const loading = false;

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
