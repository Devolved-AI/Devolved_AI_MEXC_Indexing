import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValid } from "@/src/app/var";

// The middleware function intercepts incoming requests to perform authentication checks.
export async function middleware(req: NextRequest) {
  // Retrieve the token and email from the cookies.
  // If the cookie is missing, default to an empty string.
  const token = req.cookies.get("token")?.value || "";
  const email = req.cookies.get("email")?.value || "";

  // Helper function to redirect the user to the authentication page (/auth).
  const redirectToAuth = () => NextResponse.redirect(new URL("/auth", req.url));
  
  // Helper function to redirect the user to the dashboard (/dashboard).
  const redirectToDashboard = () => NextResponse.redirect(new URL("/", req.url));

  try {
    // If either the email or token is missing, the user is not authenticated.
    // Redirect them to the authentication page.
    if (!email || !token) {
      return redirectToAuth();
    }

    // Call the API endpoint to validate the user's token and email.
    // The API is expected to return a JSON object with a `valid` property.
    const response = await fetch(isValid, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the token in the Authorization header as a Bearer token.
        Authorization: `Bearer ${token}`,
      },
      // Send the user's email in the request body as JSON.
      body: JSON.stringify({ email }),
    });

    // Parse the JSON response from the validation API.
    const res = await response.json();

    // If the API indicates that the token/email combination is not valid,
    // redirect the user to the authentication page.
    if (!res.valid) {
      return redirectToAuth();
    }

    // Define the paths that should automatically redirect authenticated users
    // to the dashboard. For example, if an authenticated user tries to access
    // the root ("/") or "/dashboard", they are redirected to the dashboard.
    const pathsToRedirect = ["/"];

    // If the current request pathname is one of the paths to redirect,
    // send the user to the dashboard.
    if (pathsToRedirect.includes(req.nextUrl.pathname)) {
      return redirectToDashboard();
    }

    // If all checks pass, allow the request to proceed to the intended route.
    return NextResponse.next();
  } catch (error) {
    // Log any errors that occur during validation.
    console.error("Error validating user:", error);
    // If there's an error, assume the user is unauthenticated and redirect them.
    return redirectToAuth();
  }
}

// The config object sets up the matcher to determine which paths this middleware applies to.
// In this case, it applies to the root path ("/").
// Uncomment additional paths (e.g., "/competition", "/dashboard") as needed.
export const config = {
  matcher: [
    "/",
    "/contract-address",
    "/myaccount",
    "/myverify_address",
    "/verifyaddress",
    "/verifycontract",
    "/verifyContract-solc-multiple"
  ],
};