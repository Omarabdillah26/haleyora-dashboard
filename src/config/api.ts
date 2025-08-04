// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL, fallback to production server
  BASE_URL: import.meta.env.VITE_API_URL || "http://160.250.227.12:2134/api",
  
  // Development URL (for local development)
  DEV_URL: "http://localhost:3001/api",
  
  // Production URL
  PROD_URL: "http://160.250.227.12:2134/api"
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return API_CONFIG.DEV_URL;
  }
  
  // For production, try CORS proxy first, fallback to direct HTTP
  // This avoids ad blocker issues with Netlify functions
  const corsProxyUrl = "https://cors-anywhere.herokuapp.com/http://160.250.227.12:2134/api";
  
  // Check if we're in a secure context (HTTPS)
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
  
  if (isSecureContext) {
    return corsProxyUrl;
  }
  
  return API_CONFIG.PROD_URL;
}; 