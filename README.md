# Cat Platformer — Phase 5 Prototype

A 2D tag-team action platformer starring cats. This is the Phase 5 build:
a roster of 3 cat breeds with their own physics profiles AND signature
abilities — heavy Maine Coon (Ground Pound), zippy Siamese (Blink Dash),
floaty Persian (Puff Shield) — plus tag-assist strikes, independent HP,
claw-swipe combat, patrolling enemy blobs, damage numbers, contact damage
with knockback, and a game-over screen.

## How to run it

1. Keep `index.html` and `game.js` in the same folder.
2. Double-click `index.html` — it opens in your browser and just works.
   (It loads the Phaser framework from the internet the first time.)

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
- **R** — restart after a game over

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

## Roadmap

- [x] Phase 1 — Movement core
- [x] Phase 2 — Enemies + basic attack + damage numbers
- [x] Phase 3 — 3-cat tag-swap with independent HP + auto-swap on KO
- [x] Phase 4 — Breed physics profiles (Maine Coon, Siamese, Persian)
- [x] Phase 5 — Signature abilities + tag-assists (this build)
- [ ] Phase 6 — Juggles, dialogue cutscenes, a real campaign stage
- [ ] Phase 7 — Offline gacha + Cat Nap commissions

## Next Claude Code prompt (Phase 6)

Open Claude Code in this folder and paste:

> Read game.js and README.md. This is a Phaser 3 cat platformer, currently
> Phase 5 (3-breed tag team with signature abilities). Build Phase 6:
> juggles, dialogue cutscenes, and a real campaign stage. Add juggle
> combos: enemies launched by attacks can be hit again in mid-air for
> bonus damage, with a combo counter that fades if you stop. Add a simple
> dialogue system: speaker name + portrait swatch + typewriter text in a
> box at the bottom, advanced with SPACE, triggered at stage start and
> stage clear. Turn the world into a campaign stage: a wider level with
> more platforms, more blobs placed deliberately, and a boss blob at the
> end with a big HP bar; defeating it clears the stage. Keep TUNING/BREEDS
> patterns. No build tools; keep plain script files.
