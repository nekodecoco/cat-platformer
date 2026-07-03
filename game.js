// ============================================================
//  CAT PLATFORMER — PHASE 6 PROTOTYPE
//  The first campaign stage: fight through the Hog King's crab
//  patrol across a long stage and dethrone the king himself.
//  Juggle combos, dialogue cutscenes, boss fight — plus the
//  3-breed tag team with signature abilities from Phase 5.
//
//  CONTROLS
//    ← →        run
//    SPACE / ↑  jump (tap = short hop, hold = full jump)
//    SPACE in mid-air = FLASH JUMP (air dash in the direction
//    you're facing; hold ↑ for a vertical flash jump instead)
//    Z          claw swipe (hits enemies in front of you)
//    X          tag-swap to the next living cat (assist swipe!)
//    C          signature ability (per breed, on cooldown)
//    R          restart after a game over
//
//  GAME-FEEL FEATURES ALREADY TUNED IN:
//    - Coyote time  : you can still jump ~0.1s after walking off a ledge
//    - Jump buffer  : pressing jump just before landing still jumps
//    - Variable jump: releasing jump early cuts the jump short
//  These three are what make a platformer feel "right".
// ============================================================

// ---------- Tuning knobs (edit these to change game feel) ----------
// Global, breed-independent values. Anything that differs per cat
// lives in the BREEDS profiles below instead.
const TUNING = {
  runAccel: 1800,       // how fast a cat reaches run speed
  airAccel: 1200,       // air control (lower = floatier commitment)
  coyoteMs: 110,        // grace period after leaving a ledge
  jumpBufferMs: 130,    // grace period for early jump presses

  // --- Combat & enemies ---
  attackCooldownMs: 320,  // minimum time between swipes
  attackReach: 46,        // how far the swipe hitbox extends in front
  attackHeight: 40,       // vertical size of the swipe hitbox
  attackKnockbackX: 240,  // horizontal shove on hit enemies
  attackKnockbackY: -140, // upward pop on hit enemies
  enemyGravity: 1100,     // gravity applied to enemy blobs
  enemySpeed: 55,         // blob patrol speed (px/sec)
  enemyHp: 3,             // damage needed to defeat a blob
  enemyStunMs: 220,       // how long knockback overrides patrolling

  // --- Juggles & combos (Phase 6) ---
  juggleBonusDamage: 1,   // extra damage when you hit an airborne enemy
  juggleKnockbackY: -300, // harder launch on juggled enemies (keeps them up)
  comboTimeoutMs: 1800,   // stop hitting this long and the combo fades

  // --- The Hog King (Phase 6 boss) ---
  bossHp: 20,
  bossSpeed: 40,          // patrol speed
  bossTouchDamage: 2,     // royal mass hurts more
  bossHopMs: 2200,        // how often he lunge-hops at a nearby cat
  bossHopVx: 190,
  bossHopVy: -430,

  // --- Tag team & taking damage ---
  touchDamage: 1,         // damage from bumping into a blob
  hurtInvulnMs: 900,      // invulnerability window after taking a hit
  hurtLockMs: 220,        // how long knockback overrides your controls
  hurtKnockbackX: 260,    // horizontal shove when you get hit
  hurtKnockbackY: -260,   // upward pop when you get hit
  swapCooldownMs: 400,    // minimum time between tag swaps
};

// ---------- Breed profiles (Phase 4) ----------
// Each roster cat is a breed with its own physics + combat feel.
// The active profile applies the moment you tag-swap.
const BREEDS = [
  {
    name: 'Maine Coon', // the heavyweight: slow, stompy, hits like a truck
    texture: 'cat-maine', // Kenney cube lion — the mane sells the mass
    profile: {
      maxHp: 6,
      runSpeed: 185,      // lumbering
      jumpVelocity: -540, // big leap...
      gravity: 1400,      // ...but comes down HARD
      flashJumpX: 430,
      flashJumpLift: -200,
      flashJumpUpY: -390,
      attackDamage: 2,    // two swipes fell a blob
    },
    ability: {
      type: 'pound',
      name: 'Ground Pound', // mid-air only: slam down, shockwave on landing
      cooldownMs: 4000,
      slamSpeed: 950,       // downward slam velocity
      radius: 130,          // shockwave reach around the landing point
      damage: 2,            // shockwave damage to each blob caught in it
    },
  },
  {
    name: 'Siamese', // the speedster: fastest run and flash jump, light hits
    texture: 'cat-siamese', // Kenney cube cat — sleek and pointy-eared
    profile: {
      maxHp: 4,
      runSpeed: 300,
      jumpVelocity: -470,
      gravity: 1100,
      flashJumpX: 650,    // screen-crossing zoomies
      flashJumpLift: -260,
      flashJumpUpY: -470,
      attackDamage: 1,
    },
    ability: {
      type: 'blink',
      name: 'Blink Dash',   // short teleport through enemies
      cooldownMs: 2200,
      distance: 150,        // teleport distance in the facing direction
      invulnMs: 300,        // brief invulnerability after the blink
    },
  },
  {
    name: 'Persian', // the cloud: floaty low gravity, slow, highest HP
    texture: 'cat-persian', // Kenney cube polar — maximum white floof
    profile: {
      maxHp: 7,
      runSpeed: 175,
      jumpVelocity: -400,
      gravity: 700,       // drifts down like a dandelion seed
      flashJumpX: 420,
      flashJumpLift: -220,
      flashJumpUpY: -380,
      attackDamage: 1,
    },
    ability: {
      type: 'shield',
      name: 'Puff Shield',  // a floof bubble absorbs the next contact hit
      cooldownMs: 6000,
      durationMs: 4000,     // shield pops on its own if unused this long
    },
  },
];

const WORLD_WIDTH = 4200; // campaign stage: ends at the Hog King's arena
const WORLD_HEIGHT = 720;

// ---------- Cutscene dialogue (Phase 6) ----------
const INTRO_DIALOGUE = [
  { speaker: 'Maine Coon', portrait: 'cat-maine',
    text: 'The Hog King trampled our nap spots. Every. Last. Sunbeam.' },
  { speaker: 'Siamese', portrait: 'cat-siamese',
    text: 'So we scratch through his crab patrol and take the naps back. Easy.' },
  { speaker: 'Persian', portrait: 'cat-persian',
    text: 'I was woken up for this. The Hog King will answer for that.' },
];
const CLEAR_DIALOGUE = [
  { speaker: 'Hog King', portrait: 'boss',
    text: 'Oink... I only wanted... a warm place to wallow...' },
  { speaker: 'Maine Coon', portrait: 'cat-maine',
    text: 'The sunbeams are ours again. Team, well scratched.' },
  { speaker: 'Siamese', portrait: 'cat-siamese',
    text: 'Victory nap. Right here. Right now. Tag me out.' },
  { speaker: 'Persian', portrait: 'cat-persian',
    text: 'Wake me when Phase 7 starts.' },
];

// ---------- Scene ----------
class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  // Kenney sprites (Cube Pets + Platformer Kit previews, CC0) are
  // embedded as data URIs in assets.js — no server needed to load them.
  preload() {
    for (const [key, uri] of Object.entries(ASSETS)) {
      this.load.image(key, uri);
    }
  }

  // ----------------------------------------------------------
  // Effect textures (swipe streaks, puffs, stars) are still
  // drawn in code; everything else comes from the Kenney packs.
  // ----------------------------------------------------------
  makeTextures() {
    // scene.restart() re-runs create(); textures survive, so skip regen.
    // Cats, enemies, boss, and platforms now come from assets.js (Kenney);
    // only the effect textures are still drawn in code.
    if (this.textures.exists('puff')) return;

    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // --- Claw swipe (three tapered streaks) ---
    g.clear();
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(0, 4, 40, 0, 40, 8);
    g.fillTriangle(0, 18, 44, 14, 44, 22);
    g.fillTriangle(0, 32, 40, 28, 40, 36);
    g.generateTexture('swipe', 44, 36);

    // --- Soft puff for the Flash Jump smoke trail ---
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('puff', 16, 16);

    // --- Background stars ---
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture('star', 4, 4);

    g.destroy();
  }

  create() {
    this.makeTextures();

    // --- World & camera ---
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor(0x3d3260); // cozy evening purple

    // Decorative stars in the background (parallax-ish, fixed to world)
    for (let i = 0; i < 110; i++) {
      const s = this.add.image(
        Phaser.Math.Between(0, WORLD_WIDTH),
        Phaser.Math.Between(0, 380),
        'star'
      );
      s.setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
    }

    // --- Platforms ---
    this.platforms = this.physics.add.staticGroup();

    // Ground: a full strip along the bottom
    for (let x = 0; x < WORLD_WIDTH; x += 64) {
      this.platforms.create(x + 32, WORLD_HEIGHT - 12, 'platform')
        .setDisplaySize(64, 44).refreshBody();
    }

    // Floating platforms at assorted heights: [x, y, widthInTiles]
    // Sections: warm-up -> climb -> gauntlet -> descent -> boss arena (3650+)
    const layout = [
      [260, 560, 3],
      [520, 460, 3],
      [800, 380, 4],
      [1100, 500, 3],
      [1350, 330, 3],
      [1600, 560, 4],
      [1850, 420, 3],
      [2100, 300, 3],
      [2300, 480, 2],
      [2550, 560, 3],
      [2750, 420, 4],
      [3000, 300, 3],
      [3200, 480, 3],
      [3450, 380, 2],
    ];
    for (const [px, py, tiles] of layout) {
      for (let i = 0; i < tiles; i++) {
        this.platforms.create(px + i * 64, py, 'platform')
          .setDisplaySize(64, 44).refreshBody();
      }
    }

    // --- Stage dressing (Kenney Platformer Kit, no physics) ---
    const groundTop = WORLD_HEIGHT - 34; // top of the ground blocks
    const dressing = [
      ['deco-tree', 180, 2.2], ['deco-flowers', 420, 1.5],
      ['deco-mushrooms', 700, 1.5], ['deco-pine', 980, 2.2],
      ['deco-grass', 1180, 1.5], ['deco-rocks', 1520, 1.5],
      ['deco-tree', 1780, 2.2], ['deco-flowers', 2050, 1.5],
      ['deco-pine', 2380, 2.2], ['deco-grass', 2680, 1.5],
      ['deco-mushrooms', 3100, 1.5], ['deco-rocks', 3400, 1.5],
      ['deco-tree', 3600, 2.2], ['deco-flag', 3700, 2],
      ['deco-pine', 4120, 2.2],
    ];
    for (const [key, dx, scale] of dressing) {
      this.add.image(dx, groundTop + 2, key).setOrigin(0.5, 1).setScale(scale);
    }

    // --- The tag team: one cat per breed, one on the field at a time ---
    this.roster = BREEDS.map((b) => ({ ...b, hp: b.profile.maxHp }));
    this.activeIndex = 0;

    this.cat = this.physics.add.sprite(120, WORLD_HEIGHT - 100, this.roster[0].texture);
    this.cat.setCollideWorldBounds(true);
    this.cat.body.setGravityY(this.activeProfile().gravity - this.physics.world.gravity.y);
    this.applyCatBody();
    this.cat.setMaxVelocity(700, 900); // roomy enough for Siamese flash jumps

    this.physics.add.collider(this.cat, this.platforms);
    this.cameras.main.startFollow(this.cat, true, 0.12, 0.12);

    // --- Enemies: blobs placed deliberately along the campaign route ---
    this.enemies = this.physics.add.group();
    const blobSpawns = [
      [860, 340],                 // warm-up: the 4-tile platform at x=800
      [1250, WORLD_HEIGHT - 60],  // ground wanderer
      [1660, 520],                // the 4-tile platform at x=1600
      [1450, WORLD_HEIGHT - 60],  // ground pair with the one above
      [2600, 520],                // gauntlet begins
      [2820, 380],
      [3060, 260],                // high road toll collector
      [3250, 440],
      [2950, WORLD_HEIGHT - 60],  // ground guard before the arena
    ];
    for (const [bx, by] of blobSpawns) {
      const blob = this.enemies.create(bx, by, 'blob'); // Kenney cube crab
      blob.setCollideWorldBounds(true);
      blob.body.setGravityY(TUNING.enemyGravity - this.physics.world.gravity.y);
      blob.body.setSize(28, 20).setOffset(2, 5);
      blob.setData('hp', TUNING.enemyHp);
      blob.setData('dir', Phaser.Math.RND.pick([-1, 1]));
      blob.setData('stunUntil', 0);
    }

    // --- The Hog King waits at the end of the stage ---
    this.boss = this.enemies.create(3950, WORLD_HEIGHT - 120, 'boss'); // Kenney cube hog
    this.boss.setCollideWorldBounds(true);
    this.boss.setScale(1.9); // king-sized
    this.boss.body.setGravityY(TUNING.enemyGravity - this.physics.world.gravity.y);
    this.boss.body.setSize(36, 40).setOffset(2, 5);
    this.boss.setData('hp', TUNING.bossHp);
    this.boss.setData('dir', -1);
    this.boss.setData('stunUntil', 0);
    this.boss.setData('isBoss', true);
    this.boss.setData('touchDamage', TUNING.bossTouchDamage);
    this.boss.setData('nextHopAt', 0);

    this.physics.add.collider(this.enemies, this.platforms);

    // Bumping into a blob hurts the active cat
    this.physics.add.overlap(this.cat, this.enemies, (_cat, enemy) => this.onTouchEnemy(enemy));

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.nextAttackTime = 0;
    this.nextSwapTime = 0;
    this.invulnUntil = 0;
    this.controlLockUntil = 0;
    this.gameOver = false;
    this.pounding = false;   // Maine Coon mid-slam
    this.shieldUntil = 0;    // Persian shield expiry time
    this.shieldFx = null;
    this.comboCount = 0;     // running hit combo
    this.comboExpireAt = 0;
    this.dialogueActive = false;
    this.dlgUi = null;       // dialogue box UI, built lazily
    this.stageCleared = false;

    // --- Game-feel state ---
    this.lastGroundedTime = 0;   // for coyote time
    this.lastJumpPressTime = -9999; // for jump buffering
    this.isJumpHeld = false;
    this.hasFlashJump = false;   // one flash jump per airtime
    this.facing = 1;             // 1 = right, -1 = left

    // --- Flash Jump smoke trail (off until dashing) ---
    this.trail = this.add.particles(0, 0, 'puff', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 350,
      tint: [0xcfc4ff, 0x9f8fff],
      frequency: 18,
      follow: this.cat,
      emitting: false,
    });

    // --- On-screen instructions ---
    this.add
      .text(16, 14,
        'ARROWS run  |  SPACE jump / flash  |  Z swipe  |  X swap  |  C ability  |  F fullscreen',
        { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffe9c9' })
      .setScrollFactor(0)
      .setDepth(10);

    this.createHud();

    // --- Opening cutscene ---
    this.time.delayedCall(350, () => this.startDialogue(INTRO_DIALOGUE));
  }

  // ----------------------------------------------------------
  // Main loop — runs every frame (~60x per second)
  // ----------------------------------------------------------
  update(time) {
    // fullscreen toggle works everywhere, even during cutscenes
    if (Phaser.Input.Keyboard.JustDown(this.keyF)) this.scale.toggleFullscreen();

    if (this.dialogueActive) {
      if (Phaser.Input.Keyboard.JustDown(this.keySpace)) this.advanceDialogue();
      return;
    }
    if (this.gameOver || this.stageCleared) {
      if (Phaser.Input.Keyboard.JustDown(this.keyR)) this.scene.restart();
      return;
    }

    const cat = this.cat;
    const P = this.activeProfile();
    const onGround = cat.body.blocked.down || cat.body.touching.down;

    // --- Track grounded state for coyote time & flash jump reset ---
    if (onGround) {
      this.lastGroundedTime = time;
      this.hasFlashJump = true;
      this.trail.emitting = false;
    }

    // --- Ground Pound lands: shockwave! ---
    if (this.pounding && onGround) {
      this.pounding = false;
      this.resolvePound();
    }

    // --- Horizontal movement ---
    const accel = onGround ? TUNING.runAccel : TUNING.airAccel;
    if (time < this.controlLockUntil || this.pounding) {
      cat.setAccelerationX(0); // knockback (or a slam) owns the cat for a beat
    } else if (this.cursors.left.isDown) {
      cat.setAccelerationX(-accel);
      this.facing = -1;
      cat.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      cat.setAccelerationX(accel);
      this.facing = 1;
      cat.setFlipX(false);
    } else {
      cat.setAccelerationX(0);
      // gentle friction so the cat doesn't slide forever
      cat.setVelocityX(cat.body.velocity.x * (onGround ? 0.8 : 0.97));
    }
    // clamp run speed (acceleration model can exceed it slightly)
    if (Math.abs(cat.body.velocity.x) > P.runSpeed && !this.isDashing &&
        time >= this.controlLockUntil) {
      cat.setVelocityX(Math.sign(cat.body.velocity.x) * P.runSpeed);
    }

    // --- Jump input (SPACE or UP both work) ---
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keySpace) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const jumpDown = this.keySpace.isDown || this.cursors.up.isDown;

    if (jumpPressed) this.lastJumpPressTime = time;

    const withinCoyote = time - this.lastGroundedTime < TUNING.coyoteMs;
    const buffered = time - this.lastJumpPressTime < TUNING.jumpBufferMs;

    // GROUND JUMP (with coyote time + jump buffering)
    if (buffered && (onGround || withinCoyote) && cat.body.velocity.y >= -10) {
      cat.setVelocityY(P.jumpVelocity);
      this.lastJumpPressTime = -9999; // consume the buffered press
      this.isJumpHeld = true;
      this.squash(1.15, 0.85); // little stretch on takeoff
    }
    // FLASH JUMP (jump pressed again while airborne, but not mid-slam)
    else if (jumpPressed && !onGround && !withinCoyote && this.hasFlashJump && !this.pounding) {
      this.hasFlashJump = false;
      if (this.cursors.up.isDown && !Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        // Vertical flash jump: was already holding UP, pressed SPACE
        cat.setVelocityY(P.flashJumpUpY);
      } else {
        // Horizontal flash jump in facing direction
        cat.setVelocityX(P.flashJumpX * this.facing);
        cat.setVelocityY(P.flashJumpLift);
        this.isDashing = true; // let the burst exceed run speed briefly
        this.time.delayedCall(260, () => (this.isDashing = false));
      }
      this.squash(1.3, 0.7);
      this.trail.emitting = true;
      this.time.delayedCall(280, () => (this.trail.emitting = false));
    }

    // VARIABLE JUMP HEIGHT: release early = shorter hop
    if (this.isJumpHeld && !jumpDown && cat.body.velocity.y < 0) {
      cat.setVelocityY(cat.body.velocity.y * 0.45);
      this.isJumpHeld = false;
    }
    if (onGround) this.isJumpHeld = jumpDown && this.isJumpHeld;

    // --- Landing squash ---
    if (onGround && this.wasAirborne) {
      this.squash(0.8, 1.2);
    }
    this.wasAirborne = !onGround;

    // --- Claw swipe ---
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) && time >= this.nextAttackTime) {
      this.nextAttackTime = time + TUNING.attackCooldownMs;
      this.swipeAttack();
    }

    // --- Tag swap (with an assist swipe from the incoming cat) ---
    if (Phaser.Input.Keyboard.JustDown(this.keyX) && time >= this.nextSwapTime) {
      const next = this.nextLivingCat(this.activeIndex);
      if (next !== null) {
        this.nextSwapTime = time + TUNING.swapCooldownMs;
        this.swapTo(next, true);
      }
    }

    // --- Signature ability ---
    if (Phaser.Input.Keyboard.JustDown(this.keyC)) {
      this.useAbility(time, onGround);
    }

    // --- Puff Shield follows the cat and pops when it expires ---
    if (this.shieldFx) {
      this.shieldFx.setPosition(cat.x, cat.y);
      if (time > this.shieldUntil) this.clearShield();
    }

    // --- Combo fades if you stop hitting things ---
    if (this.comboCount > 0 && time > this.comboExpireAt) {
      this.comboCount = 0;
      this.tweens.add({ targets: this.comboText, alpha: 0, duration: 250 });
    }

    this.updateEnemies(time);
    this.updateHud(); // every frame so the cooldown pips animate
  }

  // ----------------------------------------------------------
  // Phase 2: combat
  // ----------------------------------------------------------
  swipeAttack() {
    const reachCenter = this.cat.x + this.facing * (20 + TUNING.attackReach / 2);

    // claw-streak flash in front of the cat
    const fx = this.add.image(reachCenter, this.cat.y - 2, 'swipe');
    fx.setFlipX(this.facing < 0);
    fx.setTint(0xffe9c9);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      x: fx.x + this.facing * 14,
      duration: 140,
      ease: 'Quad.easeOut',
      onComplete: () => fx.destroy(),
    });

    const hitRect = new Phaser.Geom.Rectangle(
      reachCenter - TUNING.attackReach / 2,
      this.cat.y - TUNING.attackHeight / 2,
      TUNING.attackReach,
      TUNING.attackHeight
    );
    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active || !enemy.body.enable) continue; // skip dying enemies
      if (Phaser.Geom.Rectangle.Overlaps(hitRect, enemy.getBounds())) {
        this.hitEnemy(enemy, this.activeProfile().attackDamage, this.facing);
      }
    }
  }

  hitEnemy(enemy, damage, knockDir) {
    // juggle: airborne enemies take bonus damage and get launched again
    const juggled = !enemy.body.blocked.down && !enemy.getData('isBoss');
    const total = damage + (juggled ? TUNING.juggleBonusDamage : 0);
    const hp = enemy.getData('hp') - total;
    enemy.setData('hp', hp);
    this.popDamageNumber(enemy.x, enemy.y - 18, total, juggled ? '#7cf0ff' : undefined);

    // knockback + brief white flash (the king barely budges)
    const kbScale = enemy.getData('isBoss') ? 0.15 : 1;
    enemy.setVelocity(
      knockDir * TUNING.attackKnockbackX * kbScale,
      (juggled ? TUNING.juggleKnockbackY : TUNING.attackKnockbackY) * kbScale
    );
    enemy.setData('stunUntil', this.time.now + TUNING.enemyStunMs);
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(80, () => enemy.active && enemy.clearTint());

    // combo bookkeeping
    this.comboCount++;
    this.comboExpireAt = this.time.now + TUNING.comboTimeoutMs;
    this.showCombo();

    if (hp <= 0) this.defeatEnemy(enemy);
  }

  defeatEnemy(enemy) {
    enemy.body.enable = false;
    const isBoss = enemy.getData('isBoss');
    this.add.particles(enemy.x, enemy.y, 'puff', {
      speed: { min: 40, max: isBoss ? 220 : 120 },
      scale: { start: isBoss ? 1.1 : 0.6, end: 0 },
      lifespan: isBoss ? 700 : 400,
      tint: [0x9fe87c, 0xffd23e],
      emitting: false,
    }).explode(isBoss ? 26 : 10);
    this.tweens.add({
      targets: enemy,
      scaleX: enemy.scaleX * 1.4, // relative: the boss is drawn at 1.9x
      scaleY: enemy.scaleY * 0.2,
      alpha: 0,
      duration: isBoss ? 450 : 180,
      ease: 'Quad.easeIn',
      onComplete: () => enemy.destroy(),
    });

    if (isBoss) {
      this.cameras.main.shake(400, 0.01);
      this.time.delayedCall(900, () => {
        if (!this.gameOver) {
          this.startDialogue(CLEAR_DIALOGUE, () => this.showStageClear());
        }
      });
    }
  }

  popDamageNumber(x, y, amount, color) {
    const colors = ['#ffd23e', '#ff6b6b', '#7cf0ff', '#c3f963', '#ff9ff3'];
    const txt = this.add
      .text(x + Phaser.Math.Between(-6, 6), y, `${amount}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        fontStyle: 'bold',
        color: color || Phaser.Math.RND.pick(colors),
        stroke: '#2b1d3a',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: txt,
      y: y - 46,
      alpha: 0,
      scale: 1.25,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  // Patrol: walk forward, turn at walls and at platform edges
  updateEnemies(time) {
    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active || !enemy.body.enable) continue;
      if (time < enemy.getData('stunUntil')) continue; // knockback in progress

      // the Hog King lunge-hops at cats that get close
      if (
        enemy.getData('isBoss') &&
        enemy.body.blocked.down &&
        time > enemy.getData('nextHopAt') &&
        Math.abs(this.cat.x - enemy.x) < 350
      ) {
        enemy.setData('nextHopAt', time + TUNING.bossHopMs);
        const hopDir = Math.sign(this.cat.x - enemy.x) || 1;
        enemy.setVelocity(hopDir * TUNING.bossHopVx, TUNING.bossHopVy);
        enemy.setData('dir', hopDir);
        enemy.setFlipX(hopDir < 0);
        continue;
      }

      let dir = enemy.getData('dir');
      if (enemy.body.blocked.down) {
        if (enemy.body.blocked.left) dir = 1;
        else if (enemy.body.blocked.right) dir = -1;
        else {
          // no floor just past the front foot? turn around
          const aheadX = enemy.x + dir * (enemy.body.width / 2 + 6);
          const floor = this.physics.overlapRect(aheadX - 2, enemy.body.bottom + 2, 4, 10, false, true);
          if (floor.length === 0) dir = -dir;
        }
      } else if (enemy.getData('isBoss')) {
        continue; // mid-hop: let the arc play out
      }
      enemy.setData('dir', dir);
      enemy.setVelocityX(dir * (enemy.getData('isBoss') ? TUNING.bossSpeed : TUNING.enemySpeed));
      enemy.setFlipX(dir < 0);
    }
  }

  // ----------------------------------------------------------
  // Phase 3+4: tag team, HP, taking damage, breed profiles
  // ----------------------------------------------------------
  activeProfile() {
    return this.roster[this.activeIndex].profile;
  }

  // Fit the physics body to the current breed's frame: fixed 30px-wide
  // hitbox, feet flush with the frame bottom so every cat stands cleanly
  applyCatBody() {
    const f = this.cat.frame;
    this.cat.body.setSize(30, f.realHeight - 12);
    this.cat.body.setOffset((f.realWidth - 30) / 2, 12);
  }

  onTouchEnemy(enemy) {
    if (this.gameOver || !enemy.active || !enemy.body.enable) return;
    const now = this.time.now;
    if (now < this.invulnUntil) return;

    // Puff Shield absorbs the hit instead
    if (now < this.shieldUntil) {
      this.shieldUntil = 0;
      this.clearShield();
      this.invulnUntil = now + 500;
      const blockDir = Math.sign(this.cat.x - enemy.x) || 1;
      this.cat.setVelocity(blockDir * TUNING.hurtKnockbackX * 0.6, TUNING.hurtKnockbackY * 0.6);
      this.announce('Blocked!', '#f5c9d4');
      return;
    }

    const touchDamage = enemy.getData('touchDamage') || TUNING.touchDamage;
    const active = this.roster[this.activeIndex];
    active.hp = Math.max(0, active.hp - touchDamage);
    this.invulnUntil = now + TUNING.hurtInvulnMs;
    this.controlLockUntil = now + TUNING.hurtLockMs;

    this.popDamageNumber(this.cat.x, this.cat.y - 26, touchDamage, '#ff6b6b');

    // knockback away from the blob + red flash + invulnerability flicker
    const dir = Math.sign(this.cat.x - enemy.x) || 1;
    this.cat.setVelocity(dir * TUNING.hurtKnockbackX, TUNING.hurtKnockbackY);
    this.cat.setTintFill(0xff6b6b);
    this.time.delayedCall(90, () => this.cat.clearTint());
    this.tweens.add({
      targets: this.cat,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: Math.floor(TUNING.hurtInvulnMs / 180),
      onComplete: () => this.cat.setAlpha(1),
    });
    this.cameras.main.shake(120, 0.004);

    this.updateHud();
    if (active.hp <= 0) this.autoSwap();
  }

  // Next living cat after `from` (cycling), or null if nobody else can fight
  nextLivingCat(from) {
    for (let step = 1; step <= this.roster.length; step++) {
      const i = (from + step) % this.roster.length;
      if (i !== this.activeIndex && this.roster[i].hp > 0) return i;
    }
    return null;
  }

  swapTo(i, withAssist) {
    this.activeIndex = i;
    this.cat.setTexture(this.roster[i].texture);
    this.applyCatBody(); // each Kenney pet has slightly different dimensions
    // the incoming breed's physics take over immediately
    this.cat.body.setGravityY(this.activeProfile().gravity - this.physics.world.gravity.y);
    // any Persian shield belongs to the cat that just left
    this.clearShield();
    this.pounding = false;
    this.squash(1.25, 0.75);
    this.add.particles(this.cat.x, this.cat.y, 'puff', {
      speed: { min: 30, max: 90 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      tint: 0xcfc4ff,
      emitting: false,
    }).explode(8);
    // tag-assist: the incoming cat strikes as it enters
    if (withAssist) this.swipeAttack();
    this.updateHud();
  }

  autoSwap() {
    const next = this.nextLivingCat(this.activeIndex);
    if (next === null) {
      this.doGameOver();
    } else {
      this.swapTo(next);
    }
  }

  doGameOver() {
    this.gameOver = true;
    this.physics.pause();
    this.trail.emitting = false;
    this.add
      .rectangle(480, 270, 960, 540, 0x120c22, 0.7)
      .setScrollFactor(0)
      .setDepth(30);
    this.add
      .text(480, 240, 'ALL CATS DOWN', {
        fontFamily: 'Trebuchet MS', fontSize: '44px', fontStyle: 'bold',
        color: '#ff6b6b', stroke: '#2b1d3a', strokeThickness: 6,
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.add
      .text(480, 290, 'Press R to restart', {
        fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffe9c9',
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(31);
  }

  // ----------------------------------------------------------
  // Phase 5: signature abilities (C key)
  // ----------------------------------------------------------
  useAbility(time, onGround) {
    const cat = this.roster[this.activeIndex];
    const A = cat.ability;
    if (time < (cat.abilityReadyAt || 0)) return;

    let used = false;
    if (A.type === 'pound') used = this.doGroundPound(A, onGround);
    else if (A.type === 'blink') used = this.doBlinkDash(A);
    else if (A.type === 'shield') used = this.doPuffShield(A);

    if (used) {
      cat.abilityReadyAt = time + A.cooldownMs;
      this.announce(A.name + '!', '#ffd23e');
    }
  }

  // Maine Coon: slam straight down from mid-air; shockwave on landing
  doGroundPound(A, onGround) {
    if (onGround) return false; // needs air under those paws
    this.pounding = true;
    this.cat.setVelocity(0, A.slamSpeed);
    this.trail.emitting = true;
    return true;
  }

  resolvePound() {
    const A = this.roster[this.activeIndex].ability;
    const cx = this.cat.x;
    const cy = this.cat.body.bottom;
    this.trail.emitting = false;

    // expanding shockwave ring + dust + a hefty screen shake
    const ring = this.add.circle(cx, cy, 20, 0xffffff, 0).setStrokeStyle(5, 0xffd23e, 0.9);
    this.tweens.add({
      targets: ring,
      scale: A.radius / 20,
      alpha: 0,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
    this.add.particles(cx, cy, 'puff', {
      speed: { min: 60, max: 160 },
      scale: { start: 0.6, end: 0 },
      lifespan: 350,
      tint: 0xd9c9a3,
      emitting: false,
    }).explode(14);
    this.cameras.main.shake(180, 0.008);
    this.squash(1.45, 0.55);

    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active || !enemy.body.enable) continue;
      if (Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y) <= A.radius) {
        this.hitEnemy(enemy, A.damage, Math.sign(enemy.x - cx) || 1);
      }
    }
  }

  // Siamese: short teleport in the facing direction, through anything
  doBlinkDash(A) {
    const fromX = this.cat.x;
    const fromY = this.cat.y;
    const toX = Phaser.Math.Clamp(fromX + this.facing * A.distance, 24, WORLD_WIDTH - 24);
    const vx = this.cat.body.velocity.x;
    const vy = this.cat.body.velocity.y;
    this.cat.body.reset(toX, fromY);
    this.cat.setVelocity(vx, vy);
    this.invulnUntil = Math.max(this.invulnUntil, this.time.now + A.invulnMs);

    // a streak of afterimages along the blink path
    for (let i = 0; i <= 6; i++) {
      const px = Phaser.Math.Linear(fromX, toX, i / 6);
      const p = this.add.image(px, fromY, 'puff').setTint(0x9fd0ff).setAlpha(0.6).setScale(0.8);
      this.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0.1,
        duration: 250,
        delay: i * 25,
        onComplete: () => p.destroy(),
      });
    }
    return true;
  }

  // Persian: a floof bubble that absorbs the next contact hit
  doPuffShield(A) {
    this.shieldUntil = this.time.now + A.durationMs;
    if (this.shieldFx) this.shieldFx.destroy();
    this.shieldFx = this.add
      .circle(this.cat.x, this.cat.y, 34, 0xf5c9d4, 0.2)
      .setStrokeStyle(2, 0xf5c9d4, 0.9);
    return true;
  }

  clearShield() {
    this.shieldUntil = 0;
    if (!this.shieldFx) return;
    const fx = this.shieldFx;
    this.shieldFx = null;
    this.tweens.add({
      targets: fx,
      scale: 1.5,
      alpha: 0,
      duration: 180,
      onComplete: () => fx.destroy(),
    });
  }

  // Floating announcement text above the cat (ability names, blocks)
  announce(message, color) {
    const t = this.add
      .text(this.cat.x, this.cat.y - 44, message, {
        fontFamily: 'Trebuchet MS', fontSize: '16px', fontStyle: 'bold',
        color, stroke: '#2b1d3a', strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: t,
      y: t.y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  // ----------------------------------------------------------
  // Phase 6: combos, dialogue cutscenes, stage clear
  // ----------------------------------------------------------
  showCombo() {
    if (this.comboCount < 2) return; // a single hit isn't a combo yet
    this.comboText
      .setText(this.comboCount + ' HIT COMBO!')
      .setAlpha(1)
      .setVisible(true)
      .setScale(1.3);
    this.tweens.add({ targets: this.comboText, scale: 1, duration: 140, ease: 'Quad.easeOut' });
  }

  // --- Dialogue: typewriter box at the bottom, SPACE advances ---
  startDialogue(lines, onDone) {
    this.dialogueActive = true;
    this.physics.pause();
    this.trail.emitting = false;
    if (!this.dlgUi) {
      this.dlgUi = {
        box: this.add.rectangle(480, 465, 928, 120, 0x1d1636, 0.93)
          .setStrokeStyle(2, 0x8f86ae).setScrollFactor(0).setDepth(40),
        portrait: this.add.image(70, 465, 'cat-maine')
          .setScrollFactor(0).setDepth(41).setScale(1.5),
        name: this.add.text(125, 418, '', {
          fontFamily: 'Trebuchet MS', fontSize: '16px', fontStyle: 'bold', color: '#ffd23e',
        }).setScrollFactor(0).setDepth(41),
        body: this.add.text(125, 444, '', {
          fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffe9c9',
          wordWrap: { width: 770 },
        }).setScrollFactor(0).setDepth(41),
        hint: this.add.text(920, 508, 'SPACE ▸', {
          fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#8f86ae',
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(41),
      };
    }
    Object.values(this.dlgUi).forEach((o) => o.setVisible(true));
    this.dlg = { lines, idx: 0, typing: false, full: '', timer: null, onDone };
    this.showDialogueLine();
  }

  showDialogueLine() {
    const line = this.dlg.lines[this.dlg.idx];
    this.dlgUi.portrait.setTexture(line.portrait);
    this.dlgUi.name.setText(line.speaker);
    this.dlgUi.body.setText('');
    this.dlg.full = line.text;
    this.dlg.typing = true;
    this.dlg.timer = this.time.addEvent({
      delay: 16,
      repeat: line.text.length - 1,
      callback: () => {
        this.dlgUi.body.setText(this.dlg.full.slice(0, this.dlgUi.body.text.length + 1));
        if (this.dlgUi.body.text.length >= this.dlg.full.length) this.dlg.typing = false;
      },
    });
  }

  advanceDialogue() {
    if (this.dlg.typing) {
      // impatient? show the whole line at once
      this.dlg.timer.remove();
      this.dlg.typing = false;
      this.dlgUi.body.setText(this.dlg.full);
      return;
    }
    this.dlg.idx++;
    if (this.dlg.idx < this.dlg.lines.length) {
      this.showDialogueLine();
    } else {
      this.endDialogue();
    }
  }

  endDialogue() {
    Object.values(this.dlgUi).forEach((o) => o.setVisible(false));
    this.dialogueActive = false;
    const onDone = this.dlg.onDone;
    this.dlg = null;
    if (onDone) onDone();
    else this.physics.resume();
  }

  showStageClear() {
    this.stageCleared = true;
    this.add
      .rectangle(480, 270, 960, 540, 0x120c22, 0.55)
      .setScrollFactor(0).setDepth(30);
    this.add
      .text(480, 225, 'STAGE CLEAR!', {
        fontFamily: 'Trebuchet MS', fontSize: '48px', fontStyle: 'bold',
        color: '#ffd23e', stroke: '#2b1d3a', strokeThickness: 7,
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.add
      .text(480, 278, 'The nap spots are safe. Press R to replay.', {
        fontFamily: 'Trebuchet MS', fontSize: '19px', color: '#ffe9c9',
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(31);
    // confetti!
    this.add.particles(0, -10, 'star', {
      x: { min: 0, max: 960 },
      speedY: { min: 60, max: 140 },
      speedX: { min: -20, max: 20 },
      scale: { start: 1.6, end: 0.4 },
      lifespan: 5000,
      frequency: 60,
      tint: [0xffd23e, 0xff6b6b, 0x7cf0ff, 0xc3f963, 0xff9ff3],
    }).setScrollFactor(0).setDepth(32);
  }

  // --- HUD: one row per roster cat, active row highlighted ---
  createHud() {
    this.hudBars = this.add.graphics().setScrollFactor(0).setDepth(10);
    this.hudTexts = this.roster.map((c, i) =>
      this.add
        .text(16, 40 + i * 24, c.name, {
          fontFamily: 'Trebuchet MS', fontSize: '14px', fontStyle: 'bold',
        })
        .setScrollFactor(0)
        .setDepth(10)
    );
    this.comboText = this.add
      .text(944, 40, '', {
        fontFamily: 'Trebuchet MS', fontSize: '22px', fontStyle: 'bold',
        color: '#7cf0ff', stroke: '#2b1d3a', strokeThickness: 5,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10)
      .setVisible(false);
    this.bossLabel = this.add
      .text(480, 28, 'HOG KING', {
        fontFamily: 'Trebuchet MS', fontSize: '14px', fontStyle: 'bold',
        color: '#ff6b6b', stroke: '#2b1d3a', strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10)
      .setVisible(false);
    this.updateHud();
  }

  updateHud() {
    const g = this.hudBars;
    const now = this.time.now;
    g.clear();
    this.roster.forEach((c, i) => {
      const active = i === this.activeIndex;
      const y = 42 + i * 24;

      this.hudTexts[i].setColor(active ? '#ffe9c9' : '#8f86ae');
      this.hudTexts[i].setAlpha(c.hp > 0 ? 1 : 0.45);

      // bar background + fill (green -> yellow -> red as HP drops);
      // bar length scales with the breed's max HP (18px per point)
      const barW = c.profile.maxHp * 18;
      g.fillStyle(0x2b2344, 0.85);
      g.fillRect(110, y, barW, 12);
      if (c.hp > 0) {
        const frac = c.hp / c.profile.maxHp;
        g.fillStyle(frac > 0.6 ? 0x7ddf6a : frac > 0.3 ? 0xf5d442 : 0xff6b6b);
        g.fillRect(112, y + 2, (barW - 4) * frac, 8);
      }
      if (active) {
        g.lineStyle(2, 0xffe9c9, 1);
        g.strokeRect(109, y - 1, barW + 2, 14);
      }

      // ability cooldown pip: bright = ready, pie fills as it recharges
      const pipX = 110 + barW + 14;
      const pipY = y + 6;
      const readyAt = c.abilityReadyAt || 0;
      if (now >= readyAt) {
        g.fillStyle(0xffd23e, 1);
        g.fillCircle(pipX, pipY, 6);
      } else {
        g.fillStyle(0x2b2344, 0.9);
        g.fillCircle(pipX, pipY, 6);
        const frac = 1 - (readyAt - now) / c.ability.cooldownMs;
        if (frac > 0.02) {
          g.fillStyle(0x8f86ae, 1);
          g.slice(pipX, pipY, 6, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2, false);
          g.fillPath();
        }
      }
    });

    // --- Hog King HP bar, top-center once you're near his arena ---
    const boss = this.boss;
    const bossNear = boss && boss.active && Math.abs(this.cat.x - boss.x) < 900;
    this.bossLabel.setVisible(!!bossNear);
    if (bossNear) {
      g.fillStyle(0x2b2344, 0.85);
      g.fillRect(330, 38, 300, 14);
      const frac = Math.max(0, boss.getData('hp') / TUNING.bossHp);
      g.fillStyle(0xff6b6b, 1);
      g.fillRect(332, 40, 296 * frac, 10);
      g.lineStyle(2, 0xffe9c9, 0.9);
      g.strokeRect(329, 37, 302, 16);
    }
  }

  // Quick squash & stretch tween — cheap juice that sells movement
  squash(sx, sy) {
    this.tweens.add({
      targets: this.cat,
      scaleX: sx,
      scaleY: sy,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => this.cat.setScale(1, 1),
    });
  }
}

// ---------- Boot the game ----------
// (kept on window so you can poke at it from the browser console)
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,            // fill the window, keep 16:9
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // gravity is applied per-body in TUNING
      debug: false,      // set true to see hitboxes
    },
  },
  scene: [PlayScene],
});

