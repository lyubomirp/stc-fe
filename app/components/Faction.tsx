"use client";
import React from "react";
import useFactionStore from "@/app/store/factionStore";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";

const Faction: React.FC<{ factionData: any }> = ({ factionData }) => {
  const setFaction = useFactionStore((store: any) => store.setFaction);

  return (
    // relative anchors the absolute symbol here; a % width would resolve
    // against the track, whose width these cards define.
    <div
      className={`relative flex h-[90%] w-[30vw] shrink-0 mx-10 my-auto text-white border border-white justify-center bg-cover bg-center cursor-pointer hover:border-red-500`}
      onClick={() => setFaction(factionData)}
    >
      <FactionSvgResolver
        factionId={factionData.id}
        className={"fill-white absolute w-2/12 max-h-72 self-center"}
      />
      <span className="self-start z-10 text-white mt-20 text-5xl">
        {factionData.name}
      </span>
    </div>
  );
};

export default Faction;
