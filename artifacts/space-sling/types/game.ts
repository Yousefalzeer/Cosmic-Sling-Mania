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
  // moving planet support
  isMoving: boolean;
  moveSpeed: number;
  moveRange: number;
  moveOffset: number; // phase offset for sin wave
}

export type ObstacleType = 'asteroid' | 'blackhole';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: ObstacleType;
  rotation: number;
  rotationSpeed: number;
}

export interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  attached: boolean;
  attachedPlanetId: string | null;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  layer: 0 | 1 | 2; // 0=far, 1=mid, 2=near
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
  obstacles: Obstacle[];
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
  obstacleRotations: Record<string, number>;
  movingPlanetOffsets: Record<string, number>;
  tickCount: number;
}
