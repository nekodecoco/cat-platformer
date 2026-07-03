# Cat Platformer — Phase 1 Prototype

A 2D tag-team action platformer starring cats. This is the Phase 1 build:
one controllable cat, platforms, and movement that already feels good.

## How to run it

1. Keep `index.html` and `game.js` in the same folder.
2. Double-click `index.html` — it opens in your browser and just works.
   (It loads the Phaser framework from the internet the first time.)

## Controls

- **← →** — run
- **SPACE** — jump (tap for a short hop, hold for a full jump)
- **SPACE in mid-air** — Flash Jump (air dash in the direction you're facing;
  hold **↑** while pressing SPACE for a vertical flash jump)

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

## Roadmap

- [x] Phase 1 — Movement core (this build)
- [ ] Phase 2 — Enemies + basic attack + damage numbers
- [ ] Phase 3 — 3-cat tag-swap with independent HP + auto-swap on KO
- [ ] Phase 4 — Breed physics profiles (Maine Coon, Siamese, Persian, Tabby)
- [ ] Phase 5 — Signature abilities + tag-assists
- [ ] Phase 6 — Juggles, dialogue cutscenes, a real campaign stage
- [ ] Phase 7 — Offline gacha + Cat Nap commissions

## First Claude Code prompt (Phase 2)

Open Claude Code in this folder and paste:

> Read game.js and README.md. This is a Phaser 3 cat platformer, currently
> Phase 1 (movement only). Build Phase 2: add a basic melee attack on the
> Z key with a short swipe hitbox in front of the cat, add 3 simple walking
> enemy blobs that patrol platforms and turn at edges, give them 3 HP each,
> and make hits spawn colorful pop-up damage numbers that float up and fade.
> Keep all existing movement code and the TUNING object pattern — add enemy
> and combat tuning values to it. Don't add any build tools; keep it as
> plain script files that run by opening index.html.
