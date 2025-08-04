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
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the request
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          message: 'Request body must be valid JSON'
        })
      };
    }
    
    const { path, method, body, headers } = requestData;
    
    // Validate required fields
    if (!path) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Missing path parameter',
          message: 'Path is required in request body'
        })
      };
    }
    
    // Construct the target URL with correct port
    const targetUrl = `http://160.250.227.12:2134/api${path}`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    console.log(`Method: ${method || 'GET'}`);
    console.log(`Body: ${body}`);
    
    // Make the request to your API server
    const response = await fetch(targetUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body || undefined
    });
    
    console.log(`Target response status: ${response.status}`);
    
    const responseData = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseData);
    } catch (e) {
      console.log('Response is not JSON, treating as text');
      data = { text: responseData };
    }
    
    console.log(`Returning data:`, data);
    
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
        message: 'Proxy request failed',
        details: error.toString()
      })
    };
  }
}; 