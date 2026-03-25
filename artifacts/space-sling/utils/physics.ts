import { Planet, Rocket, Vec2 } from '@/types/game';
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

export function computeTrajectory(
  startX: number,
  startY: number,
  vx: number,
  vy: number,
  steps: number,
  stepSize: number,
): Vec2[] {
  const points: Vec2[] = [];
  let x = startX;
  let y = startY;
  let dvx = vx;
  let dvy = vy;

  for (let i = 0; i < steps; i++) {
    x += dvx * stepSize * 60;
    y += dvy * stepSize * 60;
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
