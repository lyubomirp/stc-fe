import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "stc_session";

// Gated at the edge so a signed-out visitor never renders the builder shell at
// all. Works because the API's cookie is set on the same domain -- cookies
// ignore ports locally, and stc.* / stc-api.* share a registrable domain in
// production, so it is visible here either way.
//
// This is a presence check, NOT verification: the token is signed with a secret
// this process does not have. Anyone can forge a cookie *named* stc_session and
// get past this line -- and then every API call still 401s, because the API
// verifies properly. The point here is to skip rendering a page that would be
// empty, not to be the security boundary.
const GATED = ["/army-builder", "/rosters", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!GATED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (req.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/army-builder/:path*", "/rosters/:path*", "/admin/:path*"],
};
