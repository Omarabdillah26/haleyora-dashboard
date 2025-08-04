import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { getApiUrl } from "../config/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const API_BASE_URL = getApiUrl();
      const isUsingProxy = API_BASE_URL.includes("cors-anywhere.herokuapp.com");
      
      if (isUsingProxy) {
        // Use the CORS proxy - direct API call
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        console.log(`Login proxy response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Login proxy error response:', errorText);
          throw new Error(`Login proxy request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
          const userData: User = {
            id: data.data.id,
            username: data.data.username,
            password: "", // Empty password for security
            role: data.data.role,
            name: data.data.name,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          throw new Error(data.message || "Login failed");
        }
      } else {
        // Use direct API call
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
          const userData: User = {
            id: data.data.id,
            username: data.data.username,
            password: "", // Empty password for security
            role: data.data.role,
            name: data.data.name,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          throw new Error(data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
