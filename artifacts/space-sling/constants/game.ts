import { Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');

export const GAME_CONFIG = {
  GRAVITY: 0,
  ROCKET_RADIUS: 14,
  PLANET_MIN_RADIUS: 24,
  PLANET_MAX_RADIUS: 44,
  SLING_MAX_DISTANCE: 130,
  LAUNCH_SPEED_MULTIPLIER: 0.14,
  // Velocity damping per frame (0-1). Controls travel distance for a given pull strength.
  // Higher = rocket decelerates faster = short pulls produce very short hops.
  ROCKET_DAMPING: 0.022,
  // If speed drops below this px/frame, snap velocity to 0 and check for game over
  MIN_SPEED_THRESHOLD: 0.35,
  TRAJECTORY_DOTS: 22,
  TRAJECTORY_STEP: 0.08,
  LANDING_TOLERANCE: 1.4,
  SCORE_PER_PLANET: 1,
  INITIAL_PLANET_COUNT: 2,
  DIFFICULTY_RAMP_EVERY: 5,
  DIFFICULTY_TIERS: [
    // tier 0: score 0-4
    { minDist: 140, maxDist: 200, minRadius: 34, maxRadius: 44, obstacleChance: 0, movingChance: 0 },
    // tier 1: score 5-9
    { minDist: 170, maxDist: 240, minRadius: 30, maxRadius: 42, obstacleChance: 0.15, movingChance: 0 },
    // tier 2: score 10-14
    { minDist: 195, maxDist: 275, minRadius: 28, maxRadius: 40, obstacleChance: 0.3, movingChance: 0 },
    // tier 3: score 15-19
    { minDist: 215, maxDist: 300, minRadius: 26, maxRadius: 38, obstacleChance: 0.4, movingChance: 0.2 },
    // tier 4: score 20-24
    { minDist: 230, maxDist: 320, minRadius: 24, maxRadius: 36, obstacleChance: 0.5, movingChance: 0.3 },
    // tier 5+: score 25+
    { minDist: 245, maxDist: 340, minRadius: 24, maxRadius: 34, obstacleChance: 0.65, movingChance: 0.4 },
  ],
  STAR_COUNT: 100,
  PARTICLE_COUNT: 20,
  PARTICLE_LIFETIME: 900,
  CRASH_PARTICLE_COUNT: 28,
  LAUNCH_PARTICLE_COUNT: 12,
  MAX_OBSTACLES_PER_GAP: 2,
  OBSTACLE_RADIUS_ASTEROID: 16,
  OBSTACLE_RADIUS_BLACKHOLE: 20,
  // Camera: how far down the screen the landed planet sits (0=top, 1=bottom).
  // 0.68 gives more vertical room above, so the next planet is always visible.
  CAMERA_TARGET_Y_RATIO: 0.68,
  // How fast camera lerps to target (lower = smoother)
  CAMERA_LERP: 0.07,
  // Max planet spawn distance as fraction of screen height (keeps next planet on-screen)
  MAX_PLANET_DIST_RATIO: 0.48,
  // Horizontal safe margin for planet centers
  PLANET_H_MARGIN: 65,
  // Vertical margin from screen top for spawned planets (so they're always in view)
  PLANET_TOP_MARGIN: 100,

  // Orbiting Obstacles
  ORBIT_SPEED_BASE: 0.015,
  ORBIT_SPEED_MAX: 0.045,
  ORBIT_RADIUS_PADDING: 12,
  ORBIT_COUNT_MAX: 4,
  ORBIT_CHANCE_BASE: 0.25,

  // Fuel Burnout
  BURNOUT_FORCE_THRESHOLD: 4.5,
  BURNOUT_GRAVITY: 0.45,
  BURNOUT_WOBBLE_INTENSITY: 1.8,
  BURNOUT_FLAME_FADE_SPEED: 0.08,
};
