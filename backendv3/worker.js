export class Container {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    // This Durable Object should proxy to the actual container
    // For now, let's test with the container directly
    const url = new URL(request.url);
    
    // Create a new request to the container on port 8080
    const containerUrl = new URL(request.url);
    containerUrl.hostname = 'localhost';
    containerUrl.port = '8080';
    
    try {
      // Forward to the Python container
      const containerRequest = new Request(containerUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return await fetch(containerRequest);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Container unavailable',
        message: error.message
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    
    // Route validation requests to container
    if (url.pathname.startsWith('/validate/')) {
      try {
        // Access container through Durable Object
        const id = env.ENVOY_VALIDATOR.idFromName('validator');
        const container = env.ENVOY_VALIDATOR.get(id);
        const response = await container.fetch(request);
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Container error',
          message: error.message,
          stack: error.stack
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Default response for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};