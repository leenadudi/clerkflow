// This route is kept for backwards compatibility.
// All logic now lives in /api/app/records — re-export the handlers directly
// so GET and POST requests work identically without a redirect (redirects drop POST bodies).
export { GET, POST } from '@/app/api/app/records/route'
