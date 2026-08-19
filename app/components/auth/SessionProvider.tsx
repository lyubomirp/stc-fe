"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  // Sign-out cannot wait for the re-check below. It ends on `/`, and signing
  // out while already there leaves the pathname unchanged, so the effect never
  // re-fires and the nav goes on offering a session that is gone.
  clear: () => void;
}

const SessionContext = createContext<Session>({
  user: null,
  known: false,
  clear: () => {},
});

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
  const [session, setSession] = useState<Omit<Session, "clear">>({
    user: initial ?? null,
    known: initial !== undefined,
  });
  const pathname = usePathname();

  // The value of the provider ABOVE this one -- a component does not see its
  // own context. Inside (protected) that is the root layout's provider; at the
  // root it is the default no-op.
  const { clear: clearOuter } = useContext(SessionContext);

  // Clears the outer provider as well, because the nested one only shadows it.
  // Sign-out navigates to `/`, which unmounts (protected) and hands the nav
  // back to the root provider -- still holding the user it fetched earlier. It
  // showed as ADMIN blinking back for one frame before the root's own
  // /auth/me returned 401.
  const clear = useCallback(() => {
    setSession({ user: null, known: true });
    clearOuter();
  }, [clearOuter]);

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

  const value = useMemo(() => ({ ...session, clear }), [session, clear]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
