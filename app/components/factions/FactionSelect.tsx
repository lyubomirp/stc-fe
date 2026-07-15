"use client";
import React, { useState } from "react";
import Image from "next/image";
import TopNav from "@/app/components/TopNav";
import FactionGrid from "@/app/components/factions/FactionGrid";
import FactionPanel from "@/app/components/factions/FactionPanel";

const FactionSelect: React.FC<{ factions: any[] }> = ({ factions }) => {
  const [preview, setPreview] = useState<any | null>(null);

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* The artwork's light break sits top-centre, where the heading goes;
          object-position drops it toward the grid and the gradient below
          keeps text off it. */}
      <Image
        src="/bg/factions.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none select-none object-cover object-[50%_35%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black" />

      <div className="relative flex min-h-screen w-full flex-col">
        <TopNav active={"Factions"} />

        <header className="px-8 pb-10 pt-6">
          <span className="flex items-center gap-2 text-hud text-white/40">
            <span className="h-1.5 w-1.5 rounded-full border border-white/40" />
            ACCESS LEVEL: STRATEGIC
          </span>
          <h1 className="mt-3 font-amsterdam text-6xl italic text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Faction List
          </h1>
        </header>

        {/* The panel is in flow on desktop so it pushes the grid rather than
            covering it; on mobile it is fixed and covers the screen. */}
        <div className="flex flex-1 items-start">
          <main
            className={`px-8 pb-16 transition-all duration-300 ${
              preview ? "w-full md:w-[70%]" : "w-full"
            }`}
          >
            <FactionGrid
              factions={factions}
              activeId={preview?.id}
              onSelect={setPreview}
              columns={
                preview
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              }
            />
          </main>

          {preview && (
            <FactionPanel faction={preview} onClose={() => setPreview(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FactionSelect;
