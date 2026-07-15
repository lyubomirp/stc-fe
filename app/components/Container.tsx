"use client";
import React, { useEffect } from "react";
import FactionSelect from "@/app/components/factions/FactionSelect";
import useFactionStore from "@/app/store/factionStore";
import Navbar from "@/app/components/Navbar";
import Datasheets from "@/app/components/datasheets/Datasheets";
import useDatasheetStore from "@/app/store/datasheetStore";

const Container: React.FC<{ data: any }> = ({ data }) => {
  const faction = useFactionStore((store: any) => store.faction);
  const datasheets = useDatasheetStore((store: any) => store.datasheets);
  const setDatasheets = useDatasheetStore((store: any) => store.setDatasheets);

  useEffect(() => {
    if (faction && faction.id) {
      fetch(`http://localhost:3000/datasheets/${faction.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (resp) => {
          let data = await resp.json();

          data = data.sort((a: any, b: any) => a.name.localeCompare(b.name));

          setDatasheets(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [faction]);

  const isDatasheetSet = () => faction && datasheets.length > 0;

  if (!faction) {
    return <FactionSelect factions={data} />;
  }

  return (
    <div className={"flex justify-center min-w-full h-screen"}>
      <div className={"flex flex-col min-w-full"}>
        <Navbar key={"nav"} />
        {isDatasheetSet() && <Datasheets key={datasheets.length} />}
      </div>
    </div>
  );
};

export default Container;
