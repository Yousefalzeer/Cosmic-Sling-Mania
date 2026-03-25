import { Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');

export const GAME_CONFIG = {
  GRAVITY: 0,
  ROCKET_RADIUS: 14,
  PLANET_MIN_RADIUS: 24,
  PLANET_MAX_RADIUS: 44,
  SLING_MAX_DISTANCE: 130,
  LAUNCH_SPEED_MULTIPLIER: 0.14,

  // --- Velocity damping (controls travel distance vs pull strength) ---
  // 0.022 = rocket loses 2.2% speed per frame; short pulls = short hops
  ROCKET_DAMPING: 0.022,
  MIN_SPEED_THRESHOLD: 0.35,

  // --- Fuel burnout (weak launch fail state) ---
  // Drag magnitude below this (px) triggers burnout mode instead of instant miss
  BURNOUT_DRAG_THRESHOLD: 38,        // pull shorter than this = burnout candidate
  BURNOUT_GRAVITY: 0.28,             // downward acceleration px/frame^2 during burnout
  BURNOUT_HORIZONTAL_DRAG: 0.94,     // horizontal speed multiplied per frame in burnout
  BURNOUT_FALL_TIMEOUT: 2.2,         // seconds before game-over triggers after burnout starts

  TRAJECTORY_DOTS: 22,
  TRAJECTORY_STEP: 0.08,
  LANDING_TOLERANCE: 1.4,
  SCORE_PER_PLANET: 10,
  INITIAL_PLANET_COUNT: 2,
  DIFFICULTY_RAMP_EVERY: 5,

  DIFFICULTY_TIERS: [
    // tier 0: score 0–4  — no orbit hazards
    {
      minDist: 140, maxDist: 200,
      minRadius: 34, maxRadius: 44,
      movingChance: 0,
      orbitCount: 0,
      orbitSpeedMin: 0.5, orbitSpeedMax: 0.8,
      orbitRadiusExtra: 28,           // added to planet radius for orbit ring
    },
    // tier 1: score 5–9 — 1 slow orbiter
    {
      minDist: 170, maxDist: 240,
      minRadius: 30, maxRadius: 42,
      movingChance: 0,
      orbitCount: 1,
      orbitSpeedMin: 0.55, orbitSpeedMax: 0.9,
      orbitRadiusExtra: 28,
    },
    // tier 2: score 10–14 — 1–2 orbiters, slightly faster
    {
      minDist: 195, maxDist: 275,
      minRadius: 28, maxRadius: 40,
      movingChance: 0,
      orbitCount: 2,
      orbitSpeedMin: 0.8, orbitSpeedMax: 1.3,
      orbitRadiusExtra: 26,
    },
    // tier 3: score 15–19 — 2 orbiters, moving planets
    {
      minDist: 215, maxDist: 300,
      minRadius: 26, maxRadius: 38,
      movingChance: 0.2,
      orbitCount: 2,
      orbitSpeedMin: 1.0, orbitSpeedMax: 1.6,
      orbitRadiusExtra: 24,
    },
    // tier 4: score 20–24 — 2–3 orbiters, faster
    {
      minDist: 230, maxDist: 320,
      minRadius: 24, maxRadius: 36,
      movingChance: 0.3,
      orbitCount: 3,
      orbitSpeedMin: 1.3, orbitSpeedMax: 2.0,
      orbitRadiusExtra: 22,
    },
    // tier 5+: score 25+ — 3 orbiters, tight windows
    {
      minDist: 245, maxDist: 340,
      minRadius: 24, maxRadius: 34,
      movingChance: 0.4,
      orbitCount: 3,
      orbitSpeedMin: 1.6, orbitSpeedMax: 2.5,
      orbitRadiusExtra: 20,
    },
  ],

  STAR_COUNT: 100,
  PARTICLE_COUNT: 20,
  PARTICLE_LIFETIME: 900,
  CRASH_PARTICLE_COUNT: 28,
  LAUNCH_PARTICLE_COUNT: 12,
  BURNOUT_PARTICLE_COUNT: 8,

  CAMERA_TARGET_Y_RATIO: 0.68,
  CAMERA_LERP: 0.07,
  MAX_PLANET_DIST_RATIO: 0.48,
  PLANET_H_MARGIN: 65,
  PLANET_TOP_MARGIN: 100,
};
