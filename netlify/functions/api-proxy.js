const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse the request
    const { path, method, body, headers } = JSON.parse(event.body || '{}');
    
    // Construct the target URL with correct port
    const targetUrl = `http://160.250.227.12:2134/api${path}`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Make the request to your API server
    const response = await fetch(targetUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const responseData = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseData);
    } catch (e) {
      data = { text: responseData };
    }
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: error.message,
        message: 'Proxy request failed'
      })
    };
  }
}; 