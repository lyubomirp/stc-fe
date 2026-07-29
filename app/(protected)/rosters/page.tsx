import RosterList from "@/app/components/rosters/RosterList";
import { getFactions } from "@/app/data/getFactions";
import { redirect } from "next/navigation";
import { apiServerFetch } from "@/app/data/api";
import type { SavedRoster } from "@/app/types/SavedRoster";

// Saved armies change whenever one is saved, so this page can never be cached.
export const dynamic = "force-dynamic";

// Thrown rather than returned so the caller can tell "not signed in" from a
// genuine failure and redirect instead of rendering the error page.
const UNAUTHORISED = Symbol("unauthorised");

async function getRosters(path: string): Promise<SavedRoster[]> {
  // Server-side: the browser's cookie is forwarded by hand, since there is no
  // browser in this request to attach it.
  const res = await apiServerFetch(path);

  if (res.status === 401) {
    throw UNAUTHORISED;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
}

export default async function RostersPage() {
  try {
    const [rosters, deleted, factions] = await Promise.all([
      getRosters("/rosters"),
      getRosters("/rosters/deleted"),
      getFactions(),
    ]);

    return (
      <RosterList rosters={rosters} deleted={deleted} factions={factions} />
    );
  } catch (error) {
    // Called from the catch, not the try: redirect() signals by throwing, so
    // inside the try it would be swallowed by this very handler.
    if (error === UNAUTHORISED) {
      redirect("/login?next=/rosters");
    }

    console.error(error);

    return (
      <main className="flex h-screen items-center justify-center">
        <p>Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
