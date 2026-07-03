# Cat Platformer — Phase 6 Prototype

A 2D tag-team action platformer starring cats. This is the Phase 6 build:
the first real campaign stage. Fight the Hog King's crab patrol across a
long deliberate level, juggle enemies for combo bonus damage, watch the
story unfold in dialogue cutscenes, and dethrone the Hog King himself —
a boss with his own HP bar and a lunge-hop attack. All on top of the
3-breed tag team (Maine Coon / Siamese / Persian) with physics profiles
and signature abilities.

## How to run it

1. Keep `index.html`, `game.js`, and `assets.js` in the same folder.
2. Double-click `index.html` — it opens in your browser and just works.
   (It loads the Phaser framework from the internet the first time.)

## Art credits

Sprites are from [Kenney](https://kenney.nl)'s
[Cube Pets](https://kenney.nl/assets/cube-pets) and
[Platformer Kit](https://kenney.nl/assets/platformer-kit) packs
(Creative Commons CC0). They ship as 3D models; this game uses the
rendered preview images, trimmed to content and embedded as data URIs
in `assets.js` so the game still runs from a double-clicked file. The
trimmed PNGs also live in `assets/` for reference. Effect sprites
(claw swipe, puffs, stars) are still drawn in code.

## Controls

- **← →** — run
- **SPACE** — jump (tap for a short hop, hold for a full jump)
- **SPACE in mid-air** — Flash Jump (air dash in the direction you're facing;
  hold **↑** while pressing SPACE for a vertical flash jump)
- **Z** — claw swipe (hits enemies in front of you; 3 hits defeats a blob)
- **X** — tag-swap to the next living cat (Maine Coon → Siamese → Persian);
  the incoming cat performs a free assist swipe as it enters
- **C** — signature ability (each breed has its own, with a cooldown shown
  as a pip next to its HP bar):
  - *Maine Coon — Ground Pound*: press in mid-air to slam down; the landing
    shockwave damages every blob nearby
  - *Siamese — Blink Dash*: short teleport in the facing direction, passes
    through enemies, briefly invulnerable
  - *Persian — Puff Shield*: a floof bubble that absorbs the next contact
    hit within a few seconds
- **R** — restart after a game over or stage clear
- **SPACE** during dialogue — advance (press once to finish the line,
  again to continue)

## Tuning the game feel

Open `game.js` and edit the `TUNING` object (global feel: acceleration,
combat timing, enemies) or the `BREEDS` profiles (per-cat feel: run speed,
jump, gravity, flash jump, damage, max HP) at the top. Change a number,
save, refresh the browser. The heavy Maine Coon vs. zippy Siamese contrast
is all in those profile numbers.

## What's already built in

- Coyote time (jump shortly after walking off a ledge)
- Jump buffering (press jump slightly before landing)
- Variable jump height (release early = shorter hop)
- Squash & stretch animation on jump/land
- Flash Jump with a smoky particle trail
- Camera follow across a world wider than the screen
- Claw swipe attack with cooldown, knockback, and hit-flash
- Enemy blobs that patrol platforms and turn at edges and walls
- Colorful damage numbers that float up and fade on every hit
- 3 breeds with distinct physics: Maine Coon (heavy, 2-damage swipes),
  Siamese (fastest run + flash jump, fragile), Persian (floaty, tankiest)
- 3-cat roster with independent HP bars in the top-left HUD
  (bar length reflects each breed's max HP)
- Contact damage with invulnerability flicker, knockback, and camera shake
- Auto-swap to the next living cat on KO; game over + restart when all fall
- Signature abilities with per-breed cooldowns and HUD cooldown pips
- Tag-assist: swapping in a cat triggers a free swipe on entry
- Juggle combos: airborne enemies take bonus damage (blue numbers) and
  get re-launched; a combo counter ticks up and fades if you stop
- Dialogue cutscenes with portraits and typewriter text (stage start
  and stage clear)
- A 4200px campaign stage: warm-up, climb, gauntlet, and a boss arena
- The Hog King: 20 HP, a top-center boss bar, lunge-hops at nearby
  cats, deals double contact damage, and barely flinches at knockback

## Roadmap

- [x] Phase 1 — Movement core
- [x] Phase 2 — Enemies + basic attack + damage numbers
- [x] Phase 3 — 3-cat tag-swap with independent HP + auto-swap on KO
- [x] Phase 4 — Breed physics profiles (Maine Coon, Siamese, Persian)
- [x] Phase 5 — Signature abilities + tag-assists
- [x] Phase 6 — Juggles, dialogue cutscenes, a real campaign stage (this build)
- [ ] Phase 7 — Offline gacha + Cat Nap commissions

## Next Claude Code prompt (Phase 7)

Open Claude Code in this folder and paste:

> Read game.js and README.md. This is a Phaser 3 cat platformer, currently
> Phase 6 (campaign stage with a boss). Build Phase 7: offline gacha + Cat
> Nap commissions. Add fish coins: enemies drop 1-3 spinning fish coins on
> defeat (the Hog King drops a pile) that the cat collects on touch, with
> a coin counter in the HUD, persisted in localStorage. Add a Cat Nap
> commissions board on the stage-clear screen: assign a resting cat to a
> named nap job (Sunbeam Patrol, Keyboard Warmer, Box Inspector) that pays
> fish coins based on real elapsed time, even while the game is closed
> (check timestamps in localStorage on load). Add a gacha shrine at the
> start of the stage: press UP in front of it to spend 10 fish coins on a
> random cosmetic collar color for a random roster cat (visible tint ring
> or bandana on the sprite, saved in localStorage, duplicates convert to
> 2 coins). Keep TUNING/BREEDS patterns. No build tools; keep plain
> script files.

