import SessionProvider from "@/app/components/auth/SessionProvider";
import { apiServerFetch } from "@/app/data/api";
import type { SessionUser } from "@/app/components/auth/SessionProvider";

// Resolving the session here rather than in the root layout is the whole point
// of the split: reading cookies makes a layout dynamic, and every route in this
// group is dynamic already (/rosters and /admin are force-dynamic, /army-builder
// reads searchParams). So it costs nothing here, while (public) keeps its static
// rendering.
//
// The nav therefore knows the session on the FIRST render inside this group --
// no /auth/me round trip, no tabs popping in.
async function currentUser(): Promise<SessionUser | null> {
  try {
    const res = await apiServerFetch("/auth/me");
    return res.ok ? ((await res.json()) as SessionUser) : null;
  } catch {
    // The API being unreachable is not the same as being signed out, but the
    // only thing this drives is nav visibility, and hiding is the safe default.
    return null;
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Shadows the root layout's provider for this subtree: React context takes
  // the nearest one, so the server-known value wins over the client fetch.
  return <SessionProvider initial={user}>{children}</SessionProvider>;
}
