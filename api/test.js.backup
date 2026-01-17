/**
 * Simple test function to verify Vercel serverless functions work
 */

export default function handler(request, response) {
  response.status(200).json({
    message: 'Vercel serverless functions are working!',
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method
  });
}