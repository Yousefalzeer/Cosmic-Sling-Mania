export const GAME_CONFIG = {
  GRAVITY: 0,
  ROCKET_RADIUS: 14,
  PLANET_MIN_RADIUS: 26,
  PLANET_MAX_RADIUS: 50,
  // Increased 3x — makes launch feel fast and arcade-like
  SLING_MAX_DISTANCE: 130,
  LAUNCH_SPEED_MULTIPLIER: 0.14,
  TRAJECTORY_DOTS: 22,
  TRAJECTORY_STEP: 0.08,
  LANDING_TOLERANCE: 1.45,
  SCORE_PER_PLANET: 10,
  INITIAL_PLANET_COUNT: 2,
  // How many planets before difficulty increases a tier
  DIFFICULTY_RAMP_EVERY: 5,
  // Difficulty tiers: distance between planets per tier
  DIFFICULTY_TIERS: [
    // tier 0: score 0-4  (very easy, close planets, large)
    { minDist: 160, maxDist: 240, minRadius: 36, maxRadius: 50, obstacleChance: 0, movingChance: 0 },
    // tier 1: score 5-9
    { minDist: 200, maxDist: 290, minRadius: 32, maxRadius: 46, obstacleChance: 0.15, movingChance: 0 },
    // tier 2: score 10-14
    { minDist: 230, maxDist: 330, minRadius: 30, maxRadius: 44, obstacleChance: 0.3, movingChance: 0 },
    // tier 3: score 15-19
    { minDist: 260, maxDist: 360, minRadius: 28, maxRadius: 42, obstacleChance: 0.4, movingChance: 0.2 },
    // tier 4: score 20-24
    { minDist: 280, maxDist: 390, minRadius: 26, maxRadius: 40, obstacleChance: 0.5, movingChance: 0.3 },
    // tier 5+: score 25+
    { minDist: 300, maxDist: 420, minRadius: 26, maxRadius: 38, obstacleChance: 0.65, movingChance: 0.4 },
  ],
  STAR_COUNT: 100,
  PARTICLE_COUNT: 20,
  PARTICLE_LIFETIME: 900,
  CRASH_PARTICLE_COUNT: 28,
  LAUNCH_PARTICLE_COUNT: 12,
  MAX_OBSTACLES_PER_GAP: 2,
  OBSTACLE_RADIUS_ASTEROID: 18,
  OBSTACLE_RADIUS_BLACKHOLE: 22,
  // Smooth camera follow lerp (0-1, lower = smoother)
  CAMERA_LERP: 0.08,
  CAMERA_TARGET_Y_RATIO: 0.55,
};
