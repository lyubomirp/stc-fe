# STC — Standard Template Construct (frontend)

The web client for [STC](https://github.com/lyubomirp/stc-api): browse Warhammer
40,000 factions, datasheets, weapon profiles, stratagems and abilities. Talks to
the STC API, which mirrors the [Wahapedia](https://wahapedia.ru) data exports
into Postgres.

Unofficial and non-commercial. Not affiliated with or endorsed by Games
Workshop. Warhammer 40,000 and all associated names, logos and iconography are
trademarks of Games Workshop Limited.

## Tech stack

|           |                                     |
| --------- | ----------------------------------- |
| Framework | Next.js 14 (App Router), React 18   |
| Styling   | Tailwind CSS 3                      |
| State     | Zustand (persisted to localStorage) |
| Language  | TypeScript 5                        |

## Getting started

**Prerequisites:** Node.js, and the STC API running on port 3000.

```bash
npm install
npm run dev
```

The API is expected at `http://localhost:3000`. Since it holds that port, Next
will offer the next free one for the client.

Useful routes:

- `/` — faction picker
- `/icons` — every faction and mechanic icon rendered at a uniform size, for
  checking visual consistency

## Icons

Faction and mechanic icons are SVGs rendered as React components under
`app/components/svg/`. They are normalised on import: fixed `width`/`height`
attributes stripped so CSS controls size, and fills mapped to `currentColor`
so they inherit text colour. Mechanic icons are additionally centred on a
square canvas, so one class renders them all at the same visual size.

`MechanicSvgResolver` is keyed by the API's own field names (`m`, `t`, `sv`,
`w`, `ld`, `oc`, `a`, `bs`, `ws`, `s`, `ap`, `d`, …) rather than by artwork
filename.

### Attribution

Some icons are derived from these projects, with thanks:

- [Warhammer40kGroup/wh40k-icon](https://github.com/Warhammer40kGroup/wh40k-icon)
  — faction and chapter iconography
- [Locequen/40k-Data-Card](https://github.com/Locequen/40k-Data-Card)
  — datasheet and weapon mechanic iconography

Neither project declares a license. They are used here in good faith for a
non-commercial fan project, and the underlying iconography is the intellectual
property of Games Workshop. If you maintain either project and would rather
these were not used, open an issue and they will be removed.

## Authors

- Lyubomir Petkov
- Claude (Anthropic)

## License

MIT — covering this project's own source only, not the game data or
iconography referenced above.
