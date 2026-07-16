import ArmyBuilder from "@/app/components/army/ArmyBuilder";
import { getFactions } from "@/app/data/getFactions";

export const revalidate = 43200;

export default async function ArmyBuilderPage({
  searchParams,
}: {
  searchParams: { roster?: string };
}) {
  try {
    const factions = await getFactions();

    // Taken from the server's searchParams rather than useSearchParams: that
    // hook forces the whole client tree into a Suspense boundary for no gain.
    return (
      <ArmyBuilder factions={factions} rosterId={searchParams.roster ?? null} />
    );
  } catch (error) {
    console.error(error);

    return (
      <main className="flex h-screen items-center justify-center">
        <p>Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
