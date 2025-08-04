const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const API_BASE_URL = 'http://160.250.227.12:2134/api';
    
    // Get the path from the URL
    const path = event.path.replace('/.netlify/functions/api-proxy', '');
    const fullUrl = `${API_BASE_URL}${path}`;
    
    console.log(`Proxying request to: ${fullUrl}`);
    console.log(`Method: ${event.httpMethod}`);
    console.log(`Headers:`, event.headers);
    
    // Prepare request options
    const requestOptions = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers
      }
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(event.httpMethod) && event.body) {
      requestOptions.body = event.body;
    }

    // Make the request to the backend
    const response = await fetch(fullUrl, requestOptions);
    
    console.log(`Backend response status: ${response.status}`);
    
    // Get response body
    const responseBody = await response.text();
    
    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseBody);
    } catch (e) {
      responseData = responseBody;
    }

    // Return the response
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Proxy request failed',
        error: error.message
      })
    };
  }
}; 