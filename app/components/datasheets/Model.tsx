import React, { useEffect, useState } from "react";
import ModelValues from "@/app/components/datasheets/ModelValues";
import Shield from "@/app/components/svg/Shield";
import UnitComposition from "@/app/components/datasheets/UnitComposition";
import useDatasheetStore from "@/app/store/datasheetStore";

const Model: React.FC = () => {
  const [model, setModel] = useState<any>();
  const datasheetId = useDatasheetStore((store: any) => store.datasheetId);
  const modelKeys = [
    { title: "movement", key: "m" },
    { title: "toughness", key: "t" },
    { title: "armour save", key: "sv" },
    { title: "wounds", key: "w" },
    { title: "leadership", key: "ld" },
    { title: "objective control", key: "oc" },
  ];

  useEffect(() => {
    if (datasheetId) {
      if (datasheetId) {
        fetch(`http://localhost:3000/datasheets-models/${datasheetId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(async (resp) => {
            const data = await resp.json();
            if (data.length > 1) {
              console.log("more than one model!??!?!?", data);
            }

            setModel(data[0]);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [datasheetId]);

  const calculateTranslation = (idx: number) => {
    const rotation = 5.5 + (modelKeys.length - idx) / 1.45;
    // this is rem
    const radius = 6.5;

    const x = radius * Math.sin(rotation);
    const y = radius * Math.cos(rotation);

    return `translate(${x}rem, ${y}rem)`;
  };

  const formatName = (name: string) => {
    if (!name) return "??";

    const split = name?.split(" ");

    if (split && split.length > 1) return split.slice(0, 2).map((p) => p[0]);

    return name[0];
  };

  return model ? (
    <div className={"flex flex-col mt-24 gap-32 col-span-1"}>
      <div className={"relative flex flex-row self-start"}>
        {model.invSv !== "-" && (
          <div className={"relative flex group justify-center self-start h-32"}>
            <Shield className={"fill-white w-16 h-16 self-center"} />
            <span
              className={"absolute text-2xl self-center font-raleway"}
            >{`${model.invSv}+`}</span>
            <span
              className={
                "pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 " +
                "-translate-x-1/2 whitespace-nowrap rounded-sm bg-white px-1 " +
                "text-sm text-black opacity-0 transition-opacity group-hover:opacity-100"
              }
            >
              Invulnerability save
            </span>
          </div>
        )}
        <h2 className={"font-bold text-5xl font-amsterdam my-10"}>
          {formatName(model.name)}
        </h2>
        {modelKeys.map(({ key, title }, idx) => (
          <ModelValues
            key={idx}
            value={model[key]}
            title={key}
            tooltipTitle={title}
            className={"absolute left-10 top-9"}
            style={{
              // left: `${idx * (100 / idx)}px`,
              transform: `${calculateTranslation(idx)}`,
            }}
          />
        ))}
      </div>
      <UnitComposition datasheetId={datasheetId} />
    </div>
  ) : null;
};

export default Model;
