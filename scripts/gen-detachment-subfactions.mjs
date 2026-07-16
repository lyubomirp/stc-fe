// Regenerates app/data/detachmentSubfactions.ts from BSData.
//
//   node scripts/gen-detachment-subfactions.mjs [--edition 10e|11e] [--check]
//
// Wahapedia cannot answer "which sub-faction may take this detachment": it
// states the constraint in English ("Deathwing model only") and never names the
// chapter, so Wrath of the Rock reads as available to Ultramarines. BSData
// states it structurally, on the detachment entry itself:
//
//   modifier: set hidden = true
//     when: notInstanceOf, scope=primary-catalogue, childId=<chapter catalogue>
//
//   = "hide unless the roster's primary catalogue is that chapter".
//
// That is the whole extraction. No entryLink/infoLink resolution, no modifier
// solving -- the graph is only hard if you need the graph. This reads one field.
//
// BSData is NOT a runtime dependency and the import is untouched: this runs by
// hand and commits a static map. 10e and 11e were verified to agree on all 39
// shared detachments, so either edition is safe; 10e is the default because the
// database is Wahapedia 10e.

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

// Wahapedia writes curly apostrophes, BSData writes straight ones, and the two
// disagree on punctuation generally. Names are the only join we have.
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

// XML and JSON carry the same schema; normalise the XML into the JSON shape so
// one extractor serves both editions.
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
          gate: gateJson(e),
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
        gate: gateXml(e),
      })),
    })),
  };
}

function gateJson(e) {
  for (const m of arr(e.modifiers)) {
    if (m.field !== "hidden" || m.value !== true) continue;
    for (const c of arr(m.conditions)) {
      if (c.type === "notInstanceOf" && c.scope === "primary-catalogue") {
        return c.childId;
      }
    }
  }
  return null;
}

function gateXml(e) {
  for (const m of arr(e.modifiers?.modifier)) {
    if (m["@_field"] !== "hidden" || String(m["@_value"]) !== "true") continue;
    for (const c of arr(m.conditions?.condition)) {
      if (
        c["@_type"] === "notInstanceOf" &&
        c["@_scope"] === "primary-catalogue"
      ) {
        return c["@_childId"];
      }
    }
  }
  return null;
}

// "Imperium - Adeptus Astartes - Dark Angels" -> "Dark Angels". The last
// segment is the sub-faction as Wahapedia keywords it.
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

  for (const cat of parsed) {
    const group = cat.groups.find((g) => g.name === "Detachment");
    if (!group) continue;

    for (const e of group.entries) {
      if (!e.name) continue;

      if (!e.gate) {
        generic++;
        continue;
      }

      const owner = byId.get(e.gate);
      if (!owner) continue; // gated on a catalogue we did not load

      map[norm(e.name)] = label(owner);
      gated++;
    }
  }

  console.log(`detachments: ${gated} chapter-gated, ${generic} generic`);
  console.log(
    `sub-factions seen: ${[...new Set(Object.values(map))].sort().join(", ")}`,
  );

  const body = `// GENERATED by scripts/gen-detachment-subfactions.mjs -- do not edit by hand.
// Source: BSData/${repo} (${edition}). Regenerate with:
//   node scripts/gen-detachment-subfactions.mjs --edition ${edition}
//
// Wahapedia states this constraint only in English prose, so it cannot be
// derived from the import. Absent = available to every sub-faction; a missing
// entry therefore shows the detachment rather than hiding it.
export const DETACHMENT_SUBFACTION: Record<string, string> = {
${Object.keys(map)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(map[k])},`)
  .join("\n")}
};

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** The sub-faction that exclusively owns this detachment, or null if any may take it. */
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
