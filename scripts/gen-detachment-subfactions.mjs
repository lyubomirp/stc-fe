// Regenerates app/data/detachmentSubfactions.ts from BSData. Runs by hand.
//
//   node scripts/gen-detachment-subfactions.mjs [--edition 10e|11e] [--check]

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { XMLParser } from "fast-xml-parser";

const EDITIONS = {
  "10e": { repo: "wh40k-10e", ext: ".cat" },
  "11e": { repo: "wh40k-11e", ext: ".json" },
};

const argv = process.argv.slice(2);
const edition = argv.includes("--edition")
  ? argv[argv.indexOf("--edition") + 1]
  : "10e";
const checkOnly = argv.includes("--check");

if (!EDITIONS[edition]) {
  console.error(`unknown edition "${edition}" (expected 10e or 11e)`);
  process.exit(1);
}

const { repo, ext } = EDITIONS[edition];
const CACHE = path.join(os.tmpdir(), `bsdata-${repo}`);
const OUT = path.join("app", "data", "detachmentSubfactions.ts");

const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Some factions are one shared library whose detachments are NOT gated per
// sub-faction catalogue (as SM chapters are) -- every non-Drukhari Aeldari
// detachment is available to any Aeldari army. The sub-faction each one belongs
// to is instead the keyword its rules buff (e.g. Ghosts of the Webway buffs
// "Harlequins"). Classify those detachments by that keyword; default otherwise.
const KEYWORD_LIBRARIES = {
  "Aeldari - Aeldari Library": {
    group: "Detachments",
    // Detachments gated to this catalogue are that faction's own, not a
    // sub-faction of the library owner -- skip them.
    exclude: "Drukhari",
    keywords: ["Harlequins", "Ynnari"],
    fallback: "Asuryani",
  },
};

// Gather rule/description text under an entry (XML and JSON shapes), lowercased,
// so a detachment can be classified by the keyword it buffs.
const collectText = (node, out) => {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const v of node) collectText(v, out);
    return;
  }
  if (typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (k === "description" && typeof v === "string") out.push(v);
    else if (k === "#text" && typeof v === "string") out.push(v);
    else collectText(v, out);
  }
};

const entryText = (e) => {
  const out = [];
  collectText(e, out);
  return out.join(" ").toLowerCase();
};

const countKeyword = (text, kw) =>
  (text.match(new RegExp(kw.toLowerCase(), "g")) || []).length;

// Name is the only join to Wahapedia; keep in step with the emitted norm below.
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function listCatalogues() {
  const res = await fetch(
    `https://api.github.com/repos/BSData/${repo}/contents/`,
  );
  if (!res.ok) throw new Error(`GitHub listing failed: ${res.status}`);
  return (await res.json())
    .filter((f) => f.name.endsWith(ext))
    .map((f) => f.name);
}

async function load(name) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, name);

  if (!fs.existsSync(file)) {
    const url = `https://raw.githubusercontent.com/BSData/${repo}/main/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: ${res.status}`);
    fs.writeFileSync(file, await res.text());
  }

  return fs.readFileSync(file, "utf8");
}

// 10e XML and 11e JSON share a schema; normalise XML into the JSON shape.
const xml = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function parseCatalogue(name, raw) {
  if (ext === ".json") {
    const c = JSON.parse(raw).catalogue;
    return {
      id: c.id,
      name: c.name,
      groups: arr(c.sharedSelectionEntryGroups).map((g) => ({
        name: g.name,
        entries: arr(g.selectionEntries).map((e) => ({
          name: e.name,
          hidden: hiddenJson(e),
          text: entryText(e),
        })),
      })),
    };
  }

  const c = xml.parse(raw).catalogue;
  return {
    id: c["@_id"],
    name: c["@_name"],
    groups: arr(c.sharedSelectionEntryGroups?.selectionEntryGroup).map((g) => ({
      name: g["@_name"],
      entries: arr(g.selectionEntries?.selectionEntry).map((e) => ({
        name: e["@_name"],
        hidden: hiddenXml(e),
        text: entryText(e),
      })),
    })),
  };
}

// The first `hidden` modifier gated on the primary catalogue, as {type, childId}.
// SM chapters use notInstanceOf (shown only for that chapter); Aeldari uses
// instanceOf Drukhari (hidden for Drukhari) -- both are needed now.
function hiddenJson(e) {
  for (const m of arr(e.modifiers)) {
    if (m.field !== "hidden" || m.value !== true) continue;
    for (const c of arr(m.conditions)) {
      if (
        (c.type === "notInstanceOf" || c.type === "instanceOf") &&
        c.scope === "primary-catalogue"
      ) {
        return { type: c.type, childId: c.childId };
      }
    }
  }
  return null;
}

function hiddenXml(e) {
  for (const m of arr(e.modifiers?.modifier)) {
    if (m["@_field"] !== "hidden" || String(m["@_value"]) !== "true") continue;
    for (const c of arr(m.conditions?.condition)) {
      const type = c["@_type"];
      if (
        (type === "notInstanceOf" || type === "instanceOf") &&
        c["@_scope"] === "primary-catalogue"
      ) {
        return { type, childId: c["@_childId"] };
      }
    }
  }
  return null;
}

// "Imperium - Adeptus Astartes - Dark Angels" -> "Dark Angels".
const label = (catalogueName) => catalogueName.split(" - ").pop().trim();

const main = async () => {
  const names = await listCatalogues();
  console.log(`BSData/${repo}: ${names.length} catalogues`);

  const parsed = [];
  for (const n of names) {
    try {
      parsed.push(parseCatalogue(n, await load(n)));
    } catch (err) {
      console.warn(`  skipped ${n}: ${err.message}`);
    }
  }

  const byId = new Map(parsed.map((c) => [c.id, c.name]));
  const map = {};
  let gated = 0;
  let generic = 0;

  // Per-catalogue gating: each detachment is hidden unless the primary catalogue
  // is its owner (SM chapters).
  for (const cat of parsed) {
    const group = cat.groups.find((g) => g.name === "Detachment");
    if (!group) continue;

    for (const e of group.entries) {
      if (!e.name) continue;

      const owner =
        e.hidden?.type === "notInstanceOf" ? byId.get(e.hidden.childId) : null;
      if (!owner) {
        generic++;
        continue;
      }

      map[norm(e.name)] = label(owner);
      gated++;
    }
  }

  // Keyword-classified libraries: one shared detachment pool, sub-faction read
  // off the keyword each detachment's rules buff.
  for (const cat of parsed) {
    const cfg = KEYWORD_LIBRARIES[cat.name];
    if (!cfg) continue;

    const group = cat.groups.find((g) => g.name === cfg.group);
    if (!group) continue;

    for (const e of group.entries) {
      if (!e.name) continue;

      // A detachment gated to the excluded catalogue is that faction's own.
      const gatedOwner =
        e.hidden?.type === "notInstanceOf" ? byId.get(e.hidden.childId) : null;
      if (gatedOwner && label(gatedOwner) === cfg.exclude) continue;

      const best = cfg.keywords
        .map((k) => [k, countKeyword(e.text, k)])
        .sort((a, b) => b[1] - a[1])[0];
      map[norm(e.name)] = best && best[1] > 0 ? best[0] : cfg.fallback;
      gated++;
    }
  }

  console.log(`detachments: ${gated} sub-faction-gated, ${generic} generic`);
  console.log(
    `sub-factions seen: ${[...new Set(Object.values(map))].sort().join(", ")}`,
  );

  const body = `// GENERATED by scripts/gen-detachment-subfactions.mjs -- do not edit by hand.
// Source: BSData/${repo} (${edition}). Regenerate with:
//   node scripts/gen-detachment-subfactions.mjs --edition ${edition}
//
// Absent = available to every sub-faction.
export const DETACHMENT_SUBFACTION: Record<string, string> = {
${Object.keys(map)
  .sort()
  .map((k) => {
    // Match prettier's quoteProps:"as-needed" -- bare identifier keys unquoted.
    const key = /^[a-z][a-z0-9]*$/.test(k) ? k : JSON.stringify(k);
    return `  ${key}: ${JSON.stringify(map[k])},`;
  })
  .join("\n")}
};

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const detachmentSubfaction = (name: string): string | null =>
  DETACHMENT_SUBFACTION[norm(name)] ?? null;
`;

  if (checkOnly) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (current !== body) {
      console.error(`\n${OUT} is stale -- re-run without --check`);
      process.exit(1);
    }
    console.log(`\n${OUT} is up to date`);
    return;
  }

  fs.writeFileSync(OUT, body);
  console.log(`\nwrote ${OUT} (${Object.keys(map).length} entries)`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
