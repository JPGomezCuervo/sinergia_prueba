import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = /* process.env.JWT_SECRET || */ "dev_secret";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request) {
  const token = request.cookies.get("session_token")?.value;
  const nextUrl = request.nextUrl.pathname;
  const isAuthPage = /(login|signup)/.test(nextUrl);
  const isCrearPage = /crear$/.test(nextUrl);


  if (isCrearPage)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  if (request.nextUrl.pathname === "/")
    return NextResponse.redirect(new URL("/login", request.url));

  if (!token) {
    return isAuthPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);

    if (isAuthPage)
      return NextResponse.redirect(new URL("/dashboard", request.url));

    return NextResponse.next();
  } catch (err) {
    console.error("[MIDDLEWARE] Invalid token:", err.message);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
