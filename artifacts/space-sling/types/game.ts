export interface Vec2 {
  x: number;
  y: number;
}

export interface Planet {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  ringColor?: string;
  hasRing: boolean;
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
}

export interface Asteroid {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  speedY: number;
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
  rocket: Rocket;
  stars: Star[];
  asteroids: Asteroid[];
  particles: Particle[];
  cameraY: number;
  isDragging: boolean;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  trajectoryPoints: Vec2[];
  isGameOver: boolean;
  soundEnabled: boolean;
  lastLandedPlanetId: string | null;
}
