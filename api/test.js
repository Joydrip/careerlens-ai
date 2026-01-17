export default function handler(request, response) {
  response.status(200).json({
    success: true,
    message: 'Vercel serverless functions are working!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    environment: process.env.NODE_ENV || 'unknown'
  });
}