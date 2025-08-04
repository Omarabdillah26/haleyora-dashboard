// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL, fallback to production server
  BASE_URL: import.meta.env.VITE_API_URL || "http://160.250.227.12:2134/api",
  
  // Development URL (for local development)
  DEV_URL: "http://localhost:3001/api",
  
  // Production URL - using HTTP for now to avoid mixed content
  PROD_URL: "http://160.250.227.12:2134/api",
  
  // Netlify function proxy URL (for HTTPS environments)
  NETLIFY_PROXY_URL: "/.netlify/functions/api-proxy"
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return API_CONFIG.DEV_URL;
  }
  
  // For production, check if we're in HTTPS environment
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
  
  if (isSecureContext) {
    // Use Netlify function proxy for HTTPS environments
    return API_CONFIG.NETLIFY_PROXY_URL;
  }
  
  // Use direct API call for HTTP environments
  return API_CONFIG.PROD_URL;
}; 