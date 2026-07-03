# Cat Platformer — Phase 3 Prototype

A 2D tag-team action platformer starring cats. This is the Phase 3 build:
a roster of 3 cats with independent HP that you tag-swap between, plus
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
- **X** — tag-swap to the next living cat (Mochi → Sora → Nori)
- **R** — restart after a game over

## Tuning the game feel

Open `game.js` and edit the `TUNING` object at the top. Change a number,
save, refresh the browser. This edit → refresh loop is how you'll dial in
how each breed feels later (heavy Maine Coon vs. zippy Siamese).

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
- 3-cat roster with independent HP bars in the top-left HUD
- Contact damage with invulnerability flicker, knockback, and camera shake
- Auto-swap to the next living cat on KO; game over + restart when all fall

## Roadmap

- [x] Phase 1 — Movement core
- [x] Phase 2 — Enemies + basic attack + damage numbers
- [x] Phase 3 — 3-cat tag-swap with independent HP + auto-swap on KO (this build)
- [ ] Phase 4 — Breed physics profiles (Maine Coon, Siamese, Persian, Tabby)
- [ ] Phase 5 — Signature abilities + tag-assists
- [ ] Phase 6 — Juggles, dialogue cutscenes, a real campaign stage
- [ ] Phase 7 — Offline gacha + Cat Nap commissions

## Next Claude Code prompt (Phase 4)

Open Claude Code in this folder and paste:

> Read game.js and README.md. This is a Phaser 3 cat platformer, currently
> Phase 3 (3-cat tag team + combat). Build Phase 4: breed physics profiles.
> Rename the roster cats to breeds — Maine Coon (heavy: slower run, higher
> jump gravity, harder-hitting swipe), Siamese (zippy: fastest run and
> flash jump, lighter hits), and Persian (floaty: low gravity, slow but
> highest HP) — each with its own palette and a per-cat physics profile
> (runSpeed, jumpVelocity, gravity, flash jump, attack damage, max HP)
> that applies on tag-swap. Move the shared movement values in TUNING into
> per-breed profile objects, keeping global values for anything breed-
> independent. Update the HUD names and README. No build tools; keep
> plain script files.
