import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RosterView from "@/app/components/rosters/RosterView";
import { getFactions } from "@/app/data/getFactions";
import { API } from "@/app/data/api";
import type { RosterDetail } from "@/app/types/RosterDetail";

// A shared list changes whenever its owner saves, so this can never be cached.
export const dynamic = "force-dynamic";

// In (public) on purpose: middleware.ts's GATED list must never gain /shared, or
// the one route built for people without an account would demand one.
//
// apiServerFetch is deliberately NOT used -- there is no session to forward and
// the route does not want one. A plain fetch is the honest call, and it also
// means a signed-in visitor sees exactly what a stranger does.
// cache() so generateMetadata and the page itself share one call per request
// rather than hitting the API twice for the same list.
const load = cache(async (token: string): Promise<RosterDetail | null> => {
  const res = await fetch(`${API}/shared/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to load shared roster: ${res.status}`);
  }

  return (await res.json()) as RosterDetail;
});

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const roster = await load(params.token);

  // The token is a secret. Keep it out of the title, and keep the page out of
  // search results -- a link handed to one opponent should not become public.
  return {
    title: roster ? `${roster.name} — STC` : "Shared list — STC",
    robots: { index: false, follow: false },
  };
}

export default async function SharedRosterPage({
  params,
}: {
  params: { token: string };
}) {
  const [roster, factions] = await Promise.all([
    load(params.token),
    getFactions(),
  ]);

  // Revoked, mistyped, and deleted are all the same answer -- the API does not
  // distinguish them and neither may this page.
  if (!roster) {
    notFound();
  }

  return <RosterView roster={roster} factions={factions} guest />;
}
