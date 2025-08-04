// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL, fallback to production server
  BASE_URL: import.meta.env.VITE_API_URL || "http://160.250.227.12:2134/api",
  
  // Development URL (for local development)
  DEV_URL: "http://localhost:3001/api",
  
  // Production URL - using HTTP for now to avoid mixed content
  PROD_URL: "http://160.250.227.12:2134/api"
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return API_CONFIG.DEV_URL;
  }
  
  // For production, always use HTTP to avoid mixed content issues
  // until backend is configured with HTTPS
  return API_CONFIG.PROD_URL;
}; 