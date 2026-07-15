import React from "react";
import { Svg } from "@/app/types/Svg";
import ArmourPenetration from "@/app/components/svg/mechanics/ArmourPenetration";
import Assault from "@/app/components/svg/mechanics/Assault";
import Attacks from "@/app/components/svg/mechanics/Attacks";
import BallisticSkill from "@/app/components/svg/mechanics/BallisticSkill";
import Damage from "@/app/components/svg/mechanics/Damage";
import Grenade from "@/app/components/svg/mechanics/Grenade";
import Heavy from "@/app/components/svg/mechanics/Heavy";
import Leadership from "@/app/components/svg/mechanics/Leadership";
import Melee from "@/app/components/svg/mechanics/Melee";
import Move from "@/app/components/svg/mechanics/Move";
import Pistol from "@/app/components/svg/mechanics/Pistol";
import Range from "@/app/components/svg/mechanics/Range";
import RapidFire from "@/app/components/svg/mechanics/RapidFire";
import Save from "@/app/components/svg/mechanics/Save";
import Strength from "@/app/components/svg/mechanics/Strength";
import Toughness from "@/app/components/svg/mechanics/Toughness";
import Type from "@/app/components/svg/mechanics/Type";
import User from "@/app/components/svg/mechanics/User";
import WeaponSkill from "@/app/components/svg/mechanics/WeaponSkill";
import Wounds from "@/app/components/svg/mechanics/Wounds";

// Keyed by the datasheet/wargear field the icon labels, so callers use the
// API's own vocabulary rather than the artwork's filename.
const mechanics: { [key: string]: React.FC<Svg> } = {
  m: Move,
  t: Toughness,
  sv: Save,
  w: Wounds,
  ld: Leadership,
  oc: User,
  a: Attacks,
  bs: BallisticSkill,
  ws: WeaponSkill,
  s: Strength,
  ap: ArmourPenetration,
  d: Damage,
  range: Range,
  type: Type,
  melee: Melee,
  assault: Assault,
  heavy: Heavy,
  pistol: Pistol,
  "rapid fire": RapidFire,
  grenade: Grenade,
};

const MechanicSvgResolver: React.FC<{
  mechanic: string;
  className?: string;
}> = ({ mechanic, className }) => {
  const SvgComponent = mechanics[mechanic?.toLowerCase()?.trim()];

  if (!SvgComponent) {
    return null;
  }

  return <SvgComponent className={className} />;
};

export default MechanicSvgResolver;
