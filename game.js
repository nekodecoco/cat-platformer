// ============================================================
//  CAT PLATFORMER — PHASE 2 PROTOTYPE
//  One controllable cat, platforms, run + jump + Flash Jump,
//  plus melee combat: claw swipe, patrolling enemy blobs, and
//  pop-up damage numbers.
//
//  CONTROLS
//    ← →        run
//    SPACE / ↑  jump (tap = short hop, hold = full jump)
//    SPACE in mid-air = FLASH JUMP (air dash in the direction
//    you're facing; hold ↑ for a vertical flash jump instead)
//    Z          claw swipe (hits enemies in front of you)
//
//  GAME-FEEL FEATURES ALREADY TUNED IN:
//    - Coyote time  : you can still jump ~0.1s after walking off a ledge
//    - Jump buffer  : pressing jump just before landing still jumps
//    - Variable jump: releasing jump early cuts the jump short
//  These three are what make a platformer feel "right".
// ============================================================

// ---------- Tuning knobs (edit these to change game feel) ----------
const TUNING = {
  runSpeed: 230,        // horizontal run speed (px/sec)
  runAccel: 1800,       // how fast the cat reaches run speed
  airAccel: 1200,       // air control (lower = floatier commitment)
  jumpVelocity: -480,   // initial jump strength (negative = up)
  gravity: 1100,        // world gravity
  coyoteMs: 110,        // grace period after leaving a ledge
  jumpBufferMs: 130,    // grace period for early jump presses
  flashJumpX: 500,      // horizontal flash-jump burst speed
  flashJumpLift: -240,  // small upward pop during horizontal flash jump
  flashJumpUpY: -430,   // vertical flash-jump strength (hold UP)

  // --- Phase 2: combat & enemies ---
  attackDamage: 1,        // damage per swipe hit
  attackCooldownMs: 320,  // minimum time between swipes
  attackReach: 46,        // how far the swipe hitbox extends in front
  attackHeight: 40,       // vertical size of the swipe hitbox
  attackKnockbackX: 240,  // horizontal shove on hit enemies
  attackKnockbackY: -140, // upward pop on hit enemies
  enemySpeed: 55,         // blob patrol speed (px/sec)
  enemyHp: 3,             // swipes needed to defeat a blob
  enemyStunMs: 220,       // how long knockback overrides patrolling
};

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 720;

// ---------- Scene ----------
class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  // ----------------------------------------------------------
  // Create all textures in code so we need zero image files.
  // Later, replace these with real sprite sheets.
  // ----------------------------------------------------------
  makeTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // --- The cat (orange shorthair placeholder, 48x40) ---
    g.clear();
    // tail
    g.fillStyle(0xe8853b);
    g.fillRoundedRect(0, 14, 14, 7, 3);
    // body
    g.fillStyle(0xf59b4c);
    g.fillRoundedRect(8, 8, 34, 26, 10);
    // ears (two triangles)
    g.fillTriangle(14, 12, 19, 0, 24, 12);
    g.fillTriangle(26, 12, 31, 0, 36, 12);
    // inner ears
    g.fillStyle(0xffc9a3);
    g.fillTriangle(16, 10, 19, 4, 22, 10);
    g.fillTriangle(28, 10, 31, 4, 34, 10);
    // eyes (big glossy chibi eyes)
    g.fillStyle(0x3a2a1a);
    g.fillCircle(21, 18, 4);
    g.fillCircle(33, 18, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(22.5, 16.5, 1.5);
    g.fillCircle(34.5, 16.5, 1.5);
    // nose
    g.fillStyle(0xd96a4b);
    g.fillTriangle(25, 23, 29, 23, 27, 26);
    // paws
    g.fillStyle(0xffe3c9);
    g.fillRoundedRect(12, 30, 9, 8, 4);
    g.fillRoundedRect(29, 30, 9, 8, 4);
    g.generateTexture('cat', 48, 40);

    // --- Ground / platform tiles ---
    g.clear();
    g.fillStyle(0x8a5a44); // warm wood brown
    g.fillRect(0, 0, 64, 24);
    g.fillStyle(0xa9744f); // top highlight strip
    g.fillRect(0, 0, 64, 6);
    g.generateTexture('platform', 64, 24);

    // --- Enemy blob (grumpy green slime, 36x26) ---
    g.clear();
    g.fillStyle(0x58b048);
    g.fillRoundedRect(0, 4, 36, 22, { tl: 16, tr: 16, bl: 6, br: 6 });
    g.fillStyle(0x7ed468); // jelly highlight
    g.fillRoundedRect(4, 8, 28, 7, 3);
    g.fillStyle(0xffffff);
    g.fillCircle(12, 15, 4);
    g.fillCircle(24, 15, 4);
    g.fillStyle(0x203020);
    g.fillCircle(12, 16, 2);
    g.fillCircle(24, 16, 2);
    g.generateTexture('blob', 36, 26);

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
    for (let i = 0; i < 60; i++) {
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
      this.platforms.create(x + 32, WORLD_HEIGHT - 12, 'platform');
    }

    // Floating platforms at assorted heights: [x, y, widthInTiles]
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
    ];
    for (const [px, py, tiles] of layout) {
      for (let i = 0; i < tiles; i++) {
        this.platforms.create(px + i * 64, py, 'platform');
      }
    }

    // --- The cat ---
    this.cat = this.physics.add.sprite(120, WORLD_HEIGHT - 80, 'cat');
    this.cat.setCollideWorldBounds(true);
    this.cat.body.setGravityY(TUNING.gravity - this.physics.world.gravity.y);
    this.cat.body.setSize(34, 30).setOffset(8, 8);
    this.cat.setMaxVelocity(600, 900);

    this.physics.add.collider(this.cat, this.platforms);
    this.cameras.main.startFollow(this.cat, true, 0.12, 0.12);

    // --- Enemies: blobs that patrol platforms and turn at edges ---
    this.enemies = this.physics.add.group();
    const blobSpawns = [
      [860, 340],                 // on the 4-tile platform at x=800
      [1250, WORLD_HEIGHT - 60],  // on the ground, mid-world
      [1660, 520],                // on the 4-tile platform at x=1600
    ];
    for (const [bx, by] of blobSpawns) {
      const blob = this.enemies.create(bx, by, 'blob');
      blob.setCollideWorldBounds(true);
      blob.body.setGravityY(TUNING.gravity - this.physics.world.gravity.y);
      blob.body.setSize(32, 20).setOffset(2, 6);
      blob.setData('hp', TUNING.enemyHp);
      blob.setData('dir', Phaser.Math.RND.pick([-1, 1]));
      blob.setData('stunUntil', 0);
    }
    this.physics.add.collider(this.enemies, this.platforms);

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.nextAttackTime = 0;

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
        'ARROWS to run  |  SPACE to jump / FLASH JUMP in mid-air  |  Z to swipe',
        { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffe9c9' })
      .setScrollFactor(0)
      .setDepth(10);
  }

  // ----------------------------------------------------------
  // Main loop — runs every frame (~60x per second)
  // ----------------------------------------------------------
  update(time) {
    const cat = this.cat;
    const onGround = cat.body.blocked.down || cat.body.touching.down;

    // --- Track grounded state for coyote time & flash jump reset ---
    if (onGround) {
      this.lastGroundedTime = time;
      this.hasFlashJump = true;
      this.trail.emitting = false;
    }

    // --- Horizontal movement ---
    const accel = onGround ? TUNING.runAccel : TUNING.airAccel;
    if (this.cursors.left.isDown) {
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
    if (Math.abs(cat.body.velocity.x) > TUNING.runSpeed && !this.isDashing) {
      cat.setVelocityX(Math.sign(cat.body.velocity.x) * TUNING.runSpeed);
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
      cat.setVelocityY(TUNING.jumpVelocity);
      this.lastJumpPressTime = -9999; // consume the buffered press
      this.isJumpHeld = true;
      this.squash(1.15, 0.85); // little stretch on takeoff
    }
    // FLASH JUMP (jump pressed again while airborne)
    else if (jumpPressed && !onGround && !withinCoyote && this.hasFlashJump) {
      this.hasFlashJump = false;
      if (this.cursors.up.isDown && !Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        // Vertical flash jump: was already holding UP, pressed SPACE
        cat.setVelocityY(TUNING.flashJumpUpY);
      } else {
        // Horizontal flash jump in facing direction
        cat.setVelocityX(TUNING.flashJumpX * this.facing);
        cat.setVelocityY(TUNING.flashJumpLift);
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

    this.updateEnemies(time);
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
      if (!enemy.active) continue;
      if (Phaser.Geom.Rectangle.Overlaps(hitRect, enemy.getBounds())) {
        this.hitEnemy(enemy);
      }
    }
  }

  hitEnemy(enemy) {
    const hp = enemy.getData('hp') - TUNING.attackDamage;
    enemy.setData('hp', hp);
    this.popDamageNumber(enemy.x, enemy.y - 18, TUNING.attackDamage);

    // knockback away from the cat + brief white flash
    enemy.setVelocity(this.facing * TUNING.attackKnockbackX, TUNING.attackKnockbackY);
    enemy.setData('stunUntil', this.time.now + TUNING.enemyStunMs);
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(80, () => enemy.active && enemy.clearTint());

    if (hp <= 0) this.defeatEnemy(enemy);
  }

  defeatEnemy(enemy) {
    enemy.body.enable = false;
    this.add.particles(enemy.x, enemy.y, 'puff', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.6, end: 0 },
      lifespan: 400,
      tint: 0x9fe87c,
      emitting: false,
    }).explode(10);
    this.tweens.add({
      targets: enemy,
      scaleX: 1.4,
      scaleY: 0.2,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeIn',
      onComplete: () => enemy.destroy(),
    });
  }

  popDamageNumber(x, y, amount) {
    const colors = ['#ffd23e', '#ff6b6b', '#7cf0ff', '#c3f963', '#ff9ff3'];
    const txt = this.add
      .text(x + Phaser.Math.Between(-6, 6), y, `${amount}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        fontStyle: 'bold',
        color: Phaser.Math.RND.pick(colors),
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
      }
      enemy.setData('dir', dir);
      enemy.setVelocityX(dir * TUNING.enemySpeed);
      enemy.setFlipX(dir < 0);
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
  width: 960,
  height: 540,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // gravity is applied per-body in TUNING
      debug: false,      // set true to see hitboxes
    },
  },
  scene: [PlayScene],
});
