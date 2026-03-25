import { Planet, Rocket, Vec2, OrbitingObstacle } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vec2): Vec2 {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Computes the world-space position of an orbiting obstacle,
 * given its current angle and the effective planet center.
 */
export function getOrbitPosition(obs: OrbitingObstacle, planetX: number, planetY: number): Vec2 {
  return {
    x: planetX + Math.cos(obs.angle) * obs.orbitRadius,
    y: planetY + Math.sin(obs.angle) * obs.orbitRadius,
  };
}

/** Checks if the rocket overlaps an orbiting obstacle using computed orbit position. */
export function checkOrbitHit(rocketX: number, rocketY: number, obsPos: Vec2, obsSize: number): boolean {
  const dist = distance({ x: rocketX, y: rocketY }, obsPos);
  return dist <= obsSize + GAME_CONFIG.ROCKET_RADIUS * 0.85;
}

export function computeTrajectory(
  startX: number,
  startY: number,
  vx: number,
  vy: number,
  steps: number,
  stepSize: number,
  damping: number = 0,
): Vec2[] {
  const points: Vec2[] = [];
  let x = startX;
  let y = startY;
  let cvx = vx;
  let cvy = vy;
  const dampFactor = 1 - damping;

  for (let i = 0; i < steps; i++) {
    cvx *= dampFactor;
    cvy *= dampFactor;
    x += cvx * stepSize * 60;
    y += cvy * stepSize * 60;
    points.push({ x, y });
  }
  return points;
}

export function checkLanding(rocket: Rocket, planet: Planet): boolean {
  const dist = distance({ x: rocket.x, y: rocket.y }, { x: planet.x, y: planet.y });
  return dist <= planet.radius * GAME_CONFIG.LANDING_TOLERANCE + GAME_CONFIG.ROCKET_RADIUS;
}

export function getRocketAngle(vx: number, vy: number): number {
  return Math.atan2(vy, vx) * (180 / Math.PI) + 90;
}

export function clampDragVector(dragDelta: Vec2, maxDist: number): Vec2 {
  const mag = Math.sqrt(dragDelta.x * dragDelta.x + dragDelta.y * dragDelta.y);
  if (mag <= maxDist) return dragDelta;
  const scale = maxDist / mag;
  return { x: dragDelta.x * scale, y: dragDelta.y * scale };
}

export function lerpCameraY(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

/** Returns the raw drag distance (magnitude, before clamping) */
export function dragMagnitude(dragDelta: Vec2): number {
  return Math.sqrt(dragDelta.x * dragDelta.x + dragDelta.y * dragDelta.y);
}
