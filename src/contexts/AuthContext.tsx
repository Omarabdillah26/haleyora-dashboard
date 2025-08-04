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

// CORS Proxy as fallback
const CORS_PROXY = "https://corsproxy.io/?";

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
      
      // Check if we're in a secure context (HTTPS)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
      
      if (isSecureContext) {
        console.warn('⚠️ Making HTTP request from HTTPS page. This may be blocked by the browser.');
        console.warn('💡 To fix this permanently, enable HTTPS on your backend server.');
      }

      // Try direct API call first
      try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        console.log(`Login response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Login error response:', errorText);
          throw new Error(`Login request failed: ${response.status} - ${errorText}`);
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
      } catch (directError) {
        // If direct call fails and we're in HTTPS, try CORS proxy
        if (isSecureContext && directError instanceof TypeError && directError.message.includes('Failed to fetch')) {
          console.warn('🔄 Direct login failed, trying CORS proxy...');
          
          const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/users/login`)}`;
          
          const proxyResponse = await fetch(proxyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (!proxyResponse.ok) {
            throw new Error(`Proxy login failed: ${proxyResponse.status}`);
          }

          const data = await proxyResponse.json();
          console.log('✅ Login successful via CORS proxy');

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
          throw directError;
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
