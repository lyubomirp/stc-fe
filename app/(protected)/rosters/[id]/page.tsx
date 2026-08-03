import { notFound, redirect } from "next/navigation";
import RosterView from "@/app/components/rosters/RosterView";
import { getFactions } from "@/app/data/getFactions";
import { apiServerFetch } from "@/app/data/api";
import type { OwnedRoster } from "@/app/types/RosterDetail";

// A saved list changes whenever it is saved, so this can never be cached.
export const dynamic = "force-dynamic";

export default async function RosterViewPage({
  params,
}: {
  params: { id: string };
}) {
  // Server-side, so the cookie has to be forwarded by hand -- there is no
  // browser in this request to attach it.
  const res = await apiServerFetch(`/rosters/${params.id}`);

  if (res.status === 401) {
    redirect(`/login?next=/rosters/${params.id}`);
  }

  // The API answers 404 for someone else's roster as well as a missing one --
  // ownership is part of the lookup, so the two are deliberately the same
  // answer and this page must not try to tell them apart either.
  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Failed to load roster: ${res.status}`);
  }

  const [roster, factions] = await Promise.all([
    res.json() as Promise<OwnedRoster>,
    getFactions(),
  ]);

  return (
    <RosterView
      roster={roster}
      factions={factions}
      shareToken={roster.shareToken}
      shareExpiresAt={roster.shareExpiresAt}
    />
  );
}
