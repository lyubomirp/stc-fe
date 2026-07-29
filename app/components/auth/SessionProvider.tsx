"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/app/data/api";

export interface SessionUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface Session {
  user: SessionUser | null;
  // Distinct from `user === null`: "not asked yet" is not "signed out", and
  // rendering the signed-out answer during the first is how a nav flickers.
  known: boolean;
}

const SessionContext = createContext<Session>({ user: null, known: false });

export const useSession = () => useContext(SessionContext);

// The session cookie is httpOnly, so the client cannot read it -- the only way
// to know is to ask the API.
//
// `initial` skips that. The (protected) layout resolves the session on the
// server and passes it in, so inside that group the nav is correct on the first
// render. Omitted in (public), where the layout is static by design and the
// answer can only arrive from the client.
//
// undefined means "not supplied"; null means "supplied, and signed out". They
// are different states and collapsing them would make a seeded signed-out
// render look unresolved.
export const SessionProvider: React.FC<{
  children: React.ReactNode;
  initial?: SessionUser | null;
}> = ({ children, initial }) => {
  const [session, setSession] = useState<Session>({
    user: initial ?? null,
    known: initial !== undefined,
  });
  const pathname = usePathname();

  // Re-checked on navigation, not just on mount: signing in is a client-side
  // route change, and this provider lives in a layout so it never remounts.
  // Without the pathname dependency the nav would keep saying "signed out"
  // until a full reload.
  useEffect(() => {
    let live = true;

    apiFetch("/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user: SessionUser | null) => {
        if (live) setSession({ user, known: true });
      })
      .catch(() => live && setSession({ user: null, known: true }));

    return () => {
      live = false;
    };
  }, [pathname]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
