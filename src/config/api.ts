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
  
  // For production, use direct API call
  // We'll handle mixed content issues in the API service
  return API_CONFIG.PROD_URL;
}; 