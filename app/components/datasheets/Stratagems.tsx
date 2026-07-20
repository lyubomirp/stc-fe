import React, { useEffect, useState } from "react";
import _ from "lodash";
import useDatasheetStore from "@/app/store/datasheetStore";

const Stratagems: React.FC = () => {
  const [stratagems, setStratagems] = useState<any>(null);
  const [detachments, setDetachments] = useState<any>(null);
  const [selectedDetachment, setSelectedDetachment] = useState<string>("");
  const datasheetId = useDatasheetStore((store: any) => store.datasheetId);

  const resolveColor = (value: string) => {
    if (value.includes("Opponent")) {
      return "border-red-200";
    }

    if (value.includes("Either")) {
      return "border-blue-200";
    }

    return "border-green-200";
  };

  useEffect(() => {
    if (datasheetId) {
      fetch(`http://localhost:3000/datasheets-stratagems/${datasheetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (resp) => {
          const data = await resp.json();
          setStratagems(data.stratagems);
          setDetachments(data.detachments);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [datasheetId]);

  useEffect(() => {
    if (detachments) {
      setSelectedDetachment(detachments[0]?.id ?? "");
    }
  }, [detachments]);

  return stratagems ? (
    <div className={"flex flex-col gap-5 w-11/12"}>
      <h2 className={"font-amsterdam text-2xl"}>Stratagems</h2>
      {detachments && detachments.length >= 1 && (
        <select
          className={
            "text-white rounded-md bg-black border border-white p-2 appearance-none text-lg"
          }
          onChange={(e) => setSelectedDetachment(e.target.value)}
        >
          {detachments.map((detachment: any) => (
            <option key={detachment.id} value={detachment.id}>
              {detachment.name}
            </option>
          ))}
        </select>
      )}
      <div className={"flex flex-row gap-10"}>
        <p className={"flex gap-2 text-sm"}>
          Your turn:
          <span className={"flex min-w-5 rounded-full bg-green-200"}></span>
        </p>
        <p className={"flex gap-2 text-sm"}>
          Enemy turn:{" "}
          <span className={"flex min-w-5 rounded-full bg-red-200"}></span>
        </p>
        <p className={"flex gap-2 text-sm"}>
          Either turn:{" "}
          <span className={"flex min-w-5 rounded-full bg-blue-200"}></span>
        </p>
      </div>
      <div className={"grid grid-cols-3 gap-2 w-full"}>
        {stratagems
          .filter(
            (s: any) =>
              !s.detachmentRef?.id || s.detachmentRef.id === selectedDetachment,
          )
          .map((s: any, k: number) => (
            <div
              className={`flex flex-col border border-solid ${resolveColor(s.turn)} p-5 rounded-2xl`}
              key={k}
            >
              <p
                className={"font-bold"}
              >{`${_.capitalize(s?.name)} - ${s.cpCost} CP`}</p>
              <p>{s.type.split("–")[1].trim()}</p>
              <p>{s.phase}</p>
            </div>
          ))}
      </div>
    </div>
  ) : null;
};
export default Stratagems;
