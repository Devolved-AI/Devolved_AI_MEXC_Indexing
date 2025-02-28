import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValid } from "@/app/var";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value || "";

  const redirectToAuth = () => NextResponse.redirect(new URL("/login", req.url));
  const redirectToChat = () => NextResponse.redirect(new URL("/myaccount", req.url));

  try {
    // Redirect to /auth if email or token are missing
    if (!token) return redirectToAuth();

    // Perform the API call to validate the token and email
    const response = await fetch(isValid, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const res = await response.json();

    if (!res.valid) return redirectToAuth();

    // Paths to redirect authenticated users to /chat
    const pathsToRedirect = ["/", "/myaccount", "/login"];
    if (pathsToRedirect.includes(req.nextUrl.pathname)) return redirectToChat();
  } catch (error) {
    console.error("Error validating user:", error);
    return redirectToAuth();
  }
}

export const config = {
  matcher: [
    "/", 
    "/myaccount"
  ],
};