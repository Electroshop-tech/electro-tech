export function GET() {
  return Response.json({ enabled: Boolean(process.env.GOOGLE_CLIENT_ID) });
}
