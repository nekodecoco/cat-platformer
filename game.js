// ============================================================
//  CAT PLATFORMER — PHASE 1 PROTOTYPE
//  One controllable cat, platforms, run + jump + Flash Jump.
//
//  CONTROLS
//    ← →        run
//    SPACE / ↑  jump (tap = short hop, hold = full jump)
//    SPACE in mid-air = FLASH JUMP (air dash in the direction
//    you're facing; hold ↑ for a vertical flash jump instead)
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

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
        'ARROWS to run  |  SPACE to jump  |  SPACE in mid-air = FLASH JUMP',
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
new Phaser.Game({
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
