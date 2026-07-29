import FactionSelect from "@/app/components/factions/FactionSelect";
import { getFactions } from "@/app/data/getFactions";

export const revalidate = 43200;

export default async function Home() {
  try {
    const factions = await getFactions();

    return <FactionSelect factions={factions} />;
  } catch (error) {
    console.error(error);

    return (
      <main className="flex h-screen items-center justify-center">
        <p>Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
