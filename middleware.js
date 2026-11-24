import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/_next",
  "/favicon.ico",
];

// Pages that student role is allowed to access
// student/student: topology, iperf, tcpdump, tshark, traceroute, scapy
const STUDENT_ALLOWED = [
  "/",
  "/topology",
  "/devices",
  "/iperf",
  "/tcpdump",
  "/tshark",
  "/traceroute",
  "/scapy",
  "/api/topology",
  "/api/topology/sim",
  "/api/iperf",
  "/api/tcpdump",
  "/api/tshark",
  "/api/traceroute",
  "/api/scapy",
  "/api/stream",
  "/api/info",
];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isStudentAllowed(pathname) {
  return STUDENT_ALLOWED.some((p) => pathname.startsWith(p));
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session");
  const role = req.cookies.get("role")?.value;

  if (!session?.value) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Student can only access allowed pages
  if (role === "student" && !isStudentAllowed(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};