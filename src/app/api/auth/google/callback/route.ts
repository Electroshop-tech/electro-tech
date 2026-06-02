import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail, createUser } from "@/lib/store";
import { signToken, setAuthCookie } from "@/lib/auth";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  error?: string;
}

interface GoogleUserInfo {
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}

export async function GET(req: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/compte?error=google_denied`);
  }

  // CSRF state check
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/compte?error=invalid_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${baseUrl}/compte?error=token_exchange`);
  }

  const tokenData: GoogleTokenResponse = await tokenRes.json();

  // Fetch user profile from Google
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(`${baseUrl}/compte?error=userinfo`);
  }

  const googleUser: GoogleUserInfo = await userInfoRes.json();

  if (!googleUser.email) {
    return NextResponse.redirect(`${baseUrl}/compte?error=no_email`);
  }

  // Find existing user or create a new one
  let user = await getUserByEmail(googleUser.email);
  if (!user) {
    const firstName = googleUser.given_name ?? googleUser.name?.split(" ")[0] ?? "";
    const lastName =
      googleUser.family_name ?? googleUser.name?.split(" ").slice(1).join(" ") ?? "";
    user = await createUser({
      email: googleUser.email,
      firstName,
      lastName,
      passwordHash: "", // OAuth user — no password login
    });
  }

  const token = await signToken({ userId: user.id, email: user.email });
  await setAuthCookie(token);

  return NextResponse.redirect(`${baseUrl}/compte`);
}
