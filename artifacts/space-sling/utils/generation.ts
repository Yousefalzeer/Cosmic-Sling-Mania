import { Dimensions } from 'react-native';
import { Planet, Star, Obstacle, PlanetStyle } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

const { width: SW, height: SH } = Dimensions.get('window');

const PLANET_STYLES: Array<{ style: PlanetStyle; color: string; ringChance: number; ringColor: string }> = [
  { style: 'ocean',  color: '#1A6FBF', ringChance: 0.1, ringColor: 'rgba(100,180,255,0.4)' },
  { style: 'lava',   color: '#C0392B', ringChance: 0.0, ringColor: '' },
  { style: 'ice',    color: '#A8D8F0', ringChance: 0.3, ringColor: 'rgba(168,216,240,0.5)' },
  { style: 'gas',    color: '#8E44AD', ringChance: 0.6, ringColor: 'rgba(200,150,255,0.45)' },
  { style: 'crater', color: '#7D6608', ringChance: 0.0, ringColor: '' },
  { style: 'jungle', color: '#1E8449', ringChance: 0.15, ringColor: 'rgba(80,200,120,0.35)' },
  { style: 'toxic',  color: '#A9CC25', ringChance: 0.2, ringColor: 'rgba(180,230,50,0.35)' },
  { style: 'ringed', color: '#D4AC0D', ringChance: 1.0, ringColor: 'rgba(230,190,50,0.5)' },
];

export function getTier(score: number) {
  const tierIndex = Math.min(
    Math.floor(score / (GAME_CONFIG.SCORE_PER_PLANET * GAME_CONFIG.DIFFICULTY_RAMP_EVERY)),
    GAME_CONFIG.DIFFICULTY_TIERS.length - 1,
  );
  return GAME_CONFIG.DIFFICULTY_TIERS[tierIndex];
}

/**
 * Generate a planet above `fromPlanet`, guaranteed to be visible after the camera
 * settles at fromPlanet. The camera after landing on fromPlanet will target:
 *   cameraY = -(fromPlanet.y - SH * CAMERA_TARGET_Y_RATIO)
 * So the new planet's screen Y = newPlanet.y + cameraY
 *                               = newPlanet.y - fromPlanet.y + SH * ratio
 * We clamp dist so this falls within [PLANET_TOP_MARGIN, SH - 80].
 */
export function generatePlanet(
  id: string,
  fromPlanetX: number,
  fromPlanetY: number,
  score: number,
): Planet {
  const tier = getTier(score);

  // Max dist so next planet stays on-screen after camera settles
  const maxAllowedDist = SH * GAME_CONFIG.CAMERA_TARGET_Y_RATIO - GAME_CONFIG.PLANET_TOP_MARGIN;

  const rawDist = tier.minDist + Math.random() * (tier.maxDist - tier.minDist);
  const dist = Math.min(rawDist, maxAllowedDist);

  // Horizontal: stay within safe margins and prefer to vary from fromPlanet's X
  const hMargin = GAME_CONFIG.PLANET_H_MARGIN;
  const safeWidth = SW - hMargin * 2;
  // Bias toward opposite side of screen for variety but never stack
  const centerBias = Math.random() < 0.5
    ? fromPlanetX < SW / 2 ? SW * 0.55 + Math.random() * SW * 0.3 : SW * 0.15 + Math.random() * SW * 0.3
    : hMargin + Math.random() * safeWidth;
  const x = Math.max(hMargin, Math.min(SW - hMargin, centerBias));
  const y = fromPlanetY - dist;

  const radius = tier.minRadius + Math.random() * (tier.maxRadius - tier.minRadius);
  const styleInfo = PLANET_STYLES[Math.floor(Math.random() * PLANET_STYLES.length)];
  const hasRing = Math.random() < styleInfo.ringChance;
  const isMoving = Math.random() < tier.movingChance;

  return {
    id,
    x,
    y,
    radius,
    color: styleInfo.color,
    style: styleInfo.style,
    ringColor: styleInfo.ringColor,
    hasRing,
    isMoving,
    moveSpeed: 0.4 + Math.random() * 0.6,
    moveRange: 35 + Math.random() * 40,
    moveOffset: Math.random() * Math.PI * 2,
  };
}

export function generateInitialPlanets(): Planet[] {
  const startPlanet: Planet = {
    id: 'planet_0',
    x: SW / 2,
    y: SH * 0.72,
    radius: 42,
    color: '#7C3AED',
    style: 'gas',
    hasRing: false,
    ringColor: '',
    isMoving: false,
    moveSpeed: 0,
    moveRange: 0,
    moveOffset: 0,
  };

  const secondPlanet: Planet = {
    id: 'planet_1',
    x: SW * 0.3 + Math.random() * SW * 0.4,
    y: SH * 0.72 - 190,
    radius: 36,
    color: '#1A6FBF',
    style: 'ocean',
    hasRing: true,
    ringColor: 'rgba(100,180,255,0.4)',
    isMoving: false,
    moveSpeed: 0,
    moveRange: 0,
    moveOffset: 0,
  };

  return [startPlanet, secondPlanet];
}

export function generateObstacles(
  fromPlanet: Planet,
  toPlanet: Planet,
  score: number,
): Obstacle[] {
  const tier = getTier(score);
  const obstacles: Obstacle[] = [];

  // 1. Static/Mid-gap obstacles (Existing logic)
  if (Math.random() < tier.obstacleChance) {
    const count = 1 + (Math.random() < 0.35 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const t = 0.3 + Math.random() * 0.4;
      const midX = fromPlanet.x + (toPlanet.x - fromPlanet.x) * t;
      const midY = fromPlanet.y + (toPlanet.y - fromPlanet.y) * t;
      const sideOffset = (Math.random() - 0.5) * 70;
      const type = score >= 30 && Math.random() < 0.3 ? 'blackhole' : 'asteroid';

      const obsX = Math.max(30, Math.min(SW - 30, midX + sideOffset));
      const distFromPlanet = Math.hypot(obsX - fromPlanet.x, midY - fromPlanet.y);
      if (distFromPlanet < fromPlanet.radius + 40) continue;

      obstacles.push({
        id: `obs_static_${Date.now()}_${i}`,
        x: obsX, y: midY,
        radius: type === 'blackhole' ? GAME_CONFIG.OBSTACLE_RADIUS_BLACKHOLE : GAME_CONFIG.OBSTACLE_RADIUS_ASTEROID,
        type,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3.5,
      });
    }
  }

  // 2. Orbiting obstacles (New requirement)
  // Scaling orbit chance and count based on score
  const orbitChance = GAME_CONFIG.ORBIT_CHANCE_BASE + (score / 100) * 0.4;
  if (Math.random() < orbitChance) {
    const maxOrbits = Math.min(GAME_CONFIG.ORBIT_COUNT_MAX, 1 + Math.floor(score / 15));
    const orbitCount = 1 + Math.floor(Math.random() * maxOrbits);
    
    const orbitRadius = toPlanet.radius + GAME_CONFIG.ORBIT_RADIUS_PADDING + 8;
    const baseSpeed = GAME_CONFIG.ORBIT_SPEED_BASE + (score / 100) * (GAME_CONFIG.ORBIT_SPEED_MAX - GAME_CONFIG.ORBIT_SPEED_BASE);
    const speed = baseSpeed * (Math.random() < 0.5 ? 1 : -1); // Random direction
    const startAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < orbitCount; i++) {
      // Space them out evenly if multiple
      const angle = startAngle + (i / orbitCount) * Math.PI * 2;
      
      obstacles.push({
        id: `obs_orbit_${toPlanet.id}_${i}`,
        x: toPlanet.x + Math.cos(angle) * orbitRadius,
        y: toPlanet.y + Math.sin(angle) * orbitRadius,
        radius: GAME_CONFIG.OBSTACLE_RADIUS_ASTEROID * 0.85, // Slightly smaller for orbiting
        type: 'asteroid',
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        isOrbiting: true,
        orbitPlanetId: toPlanet.id,
        orbitRadius,
        orbitAngle: angle,
        orbitSpeed: speed,
      });
    }
  }

  return obstacles;
}

export function generateStars(): Star[] {
  const stars: Star[] = [];
  const totalHeight = SH * 10;
  const startY = -totalHeight * 0.6;

  for (let i = 0; i < GAME_CONFIG.STAR_COUNT; i++) {
    const layer = (i % 3) as 0 | 1 | 2;
    stars.push({
      x: Math.random() * SW,
      y: startY + Math.random() * totalHeight,
      size: layer === 0 ? 0.8 + Math.random() * 1.2 : layer === 1 ? 1.2 + Math.random() * 1.8 : 2 + Math.random() * 2.5,
      opacity: layer === 0 ? 0.2 + Math.random() * 0.4 : layer === 1 ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 0.4,
      twinkleSpeed: 0.4 + Math.random() * 2.2,
      layer,
    });
  }
  return stars;
}
