# Cat Platformer — Phase 2 Prototype

A 2D tag-team action platformer starring cats. This is the Phase 2 build:
one controllable cat with movement that feels good, plus a claw swipe,
patrolling enemy blobs, and pop-up damage numbers.

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

## Roadmap

- [x] Phase 1 — Movement core
- [x] Phase 2 — Enemies + basic attack + damage numbers (this build)
- [ ] Phase 3 — 3-cat tag-swap with independent HP + auto-swap on KO
- [ ] Phase 4 — Breed physics profiles (Maine Coon, Siamese, Persian, Tabby)
- [ ] Phase 5 — Signature abilities + tag-assists
- [ ] Phase 6 — Juggles, dialogue cutscenes, a real campaign stage
- [ ] Phase 7 — Offline gacha + Cat Nap commissions

## Next Claude Code prompt (Phase 3)

Open Claude Code in this folder and paste:

> Read game.js and README.md. This is a Phaser 3 cat platformer, currently
> Phase 2 (movement + basic combat). Build Phase 3: a roster of 3 cats with
> independent HP. Show all three HP bars in the top-left with the active cat
> highlighted. Press X to tag-swap to the next living cat. Touching an enemy
> blob damages the active cat, with brief invulnerability flicker and
> knockback. When the active cat's HP hits 0 it auto-swaps to the next
> living cat; when all three are down, show a game-over screen with a key
> to restart. Keep all existing code patterns and the TUNING object — add
> the new values to it. No build tools; keep plain script files.
