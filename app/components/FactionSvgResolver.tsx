import React, { useEffect, useState } from "react";
import { Svg } from "@/app/types/Svg";
import AdeptusCustodes from "@/app/components/svg/AdeptusCustodes";
import Aeldari from "@/app/components/svg/Aeldari";
import AstraMilitarum from "@/app/components/svg/AstraMilitarum";
import AdeptaSororitas from "@/app/components/svg/AdeptaSororitas";
import AdeptusMechanicus from "@/app/components/svg/AdeptusMechanicus";
import AgentsOfTheImperium from "@/app/components/svg/AgentsOfTheImperium";
import ChaosDemons from "@/app/components/svg/ChaosDemons";
import ChaosSpaceMarines from "@/app/components/svg/ChaosSpaceMarines";
import DeathGuard from "@/app/components/svg/DeathGuard";
import Drukhari from "@/app/components/svg/Drukhari";
import EmperorsChildren from "@/app/components/svg/EmperorsChildren";
import GenestealerCults from "@/app/components/svg/GenestealerCults";
import GrayKnights from "@/app/components/svg/GrayKnights";
import LeaguesOfVotann from "@/app/components/svg/LeaguesOfVotann";
import Necrons from "@/app/components/svg/Necrons";
import Orks from "@/app/components/svg/Orks";
import ImperialKnights from "@/app/components/svg/ImperialKnights";
import ChaosKnights from "@/app/components/svg/ChaosKnights";
import SpaceMarines from "@/app/components/svg/SpaceMarines";
import Tau from "@/app/components/svg/Tau";
import AdeptusTitanicus from "@/app/components/svg/AdeptusTitanicus";
import ThousandSons from "@/app/components/svg/ThousandSons";
import Tyranids from "@/app/components/svg/Tyranids";
import UnalignedForces from "@/app/components/svg/UnalignedForces";
import WorldEaters from "@/app/components/svg/WorldEaters";

const FactionSvgResolver: React.FC<{
  factionId: string;
  className: string;
}> = ({ factionId, className }) => {
  const [SvgComponent, setSvgComponent] = useState<React.FC<Svg>>();

  const svgs: { [key: string]: React.FC<Svg> } = {
    ac: AdeptusCustodes,
    ae: Aeldari,
    am: AstraMilitarum,
    as: AdeptaSororitas,
    adm: AdeptusMechanicus,
    aoi: AgentsOfTheImperium,
    cd: ChaosDemons,
    csm: ChaosSpaceMarines,
    dg: DeathGuard,
    dru: Drukhari,
    ec: EmperorsChildren,
    gc: GenestealerCults,
    gk: GrayKnights,
    lov: LeaguesOfVotann,
    nec: Necrons,
    ork: Orks,
    qi: ImperialKnights,
    qt: ChaosKnights,
    sm: SpaceMarines,
    tau: Tau,
    tl: AdeptusTitanicus,
    ts: ThousandSons,
    tyr: Tyranids,
    un: UnalignedForces,
    we: WorldEaters,
  };

  useEffect(() => {
    if (factionId) {
      setSvgComponent(() => svgs[factionId.toLowerCase()]);
    }
  }, [factionId]);

  return SvgComponent && factionId ? (
    <SvgComponent className={className} key={factionId.toLowerCase()} />
  ) : null;
};

export default FactionSvgResolver;
