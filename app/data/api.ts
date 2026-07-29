export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// The session is an httpOnly cookie on the API's origin. Browsers omit cookies
// from cross-origin fetches unless asked, so every call that needs a session
// must say so -- a plain fetch() to a guarded route just 401s.
export const apiFetch = (
  path: string,
  init: RequestInit = {},
): Promise<Response> =>
  fetch(`${API}${path}`, { ...init, credentials: "include" });

// Server components have no browser to attach cookies for them: the incoming
// request's Cookie header has to be forwarded by hand or the API sees an
// anonymous call and 401s. next/headers is imported lazily so this module stays
// importable from client components, where it throws.
export const apiServerFetch = async (
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const { headers } = await import("next/headers");
  const cookie = headers().get("cookie") ?? "";

  return fetch(`${API}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), cookie },
    cache: "no-store",
  });
};
