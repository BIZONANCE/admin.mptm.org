import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve security token from cookies
  const token = request.cookies.get("mptm_admin_token")?.value;
  const isAuthenticated = Boolean(token);

  // If requesting the login page while already authenticated, redirect to dashboard root
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect all dashboard routes (including root "/"): redirect to /login if unauthenticated
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.ico, bizonancelogo.png
     * - api routes if any
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.ico|bizonancelogo.png|api).*)",
  ],
};
