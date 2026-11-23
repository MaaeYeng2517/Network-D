import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session");
  
  if (!session?.value) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};