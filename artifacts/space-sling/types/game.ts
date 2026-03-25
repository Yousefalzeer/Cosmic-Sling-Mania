export interface Vec2 {
  x: number;
  y: number;
}

export type PlanetStyle = 'ocean' | 'lava' | 'ice' | 'gas' | 'crater' | 'jungle' | 'toxic' | 'ringed';

export interface Planet {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  style: PlanetStyle;
  ringColor?: string;
  hasRing: boolean;
  isMoving: boolean;
  moveSpeed: number;
  moveRange: number;
  moveOffset: number;
}

export type OrbitObstacleType = 'asteroid' | 'satellite' | 'mine' | 'debris';

/** A hazard that orbits a specific planet. Position is always derived from angle. */
export interface OrbitingObstacle {
  id: string;
  planetId: string;       // which planet this orbits
  orbitRadius: number;    // distance from planet center
  angle: number;          // current angle in radians
  orbitSpeed: number;     // radians/second (negative = counter-clockwise)
  type: OrbitObstacleType;
  size: number;           // collision radius
  selfRotation: number;   // visual self-rotation in degrees (for asteroids, etc.)
}

export interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  attached: boolean;
  attachedPlanetId: string | null;
  /** True when the rocket ran out of fuel from a weak launch */
  burnoutMode: boolean;
  /** Accumulates time in burnout so we can delay game-over for the fall animation */
  burnoutTimer: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  layer: 0 | 1 | 2;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export type GameScreen = 'menu' | 'game' | 'gameover';

export interface GameState {
  screen: GameScreen;
  score: number;
  highScore: number;
  planets: Planet[];
  orbitingObstacles: OrbitingObstacle[];
  rocket: Rocket;
  stars: Star[];
  particles: Particle[];
  cameraY: number;
  targetCameraY: number;
  cameraShake: number;
  isDragging: boolean;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  trajectoryPoints: Vec2[];
  isGameOver: boolean;
  soundEnabled: boolean;
  lastLandedPlanetId: string | null;
  visitedPlanetIds: string[];
  movingPlanetOffsets: Record<string, number>;
  tickCount: number;
}
