import { Dimensions } from 'react-native';
import { Planet, Star, OrbitingObstacle, OrbitObstacleType, PlanetStyle } from '@/types/game';
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

const ORBIT_TYPES: OrbitObstacleType[] = ['asteroid', 'satellite', 'mine', 'debris'];

export function getTier(score: number) {
  const tierIndex = Math.min(
    Math.floor(score / (GAME_CONFIG.SCORE_PER_PLANET * GAME_CONFIG.DIFFICULTY_RAMP_EVERY)),
    GAME_CONFIG.DIFFICULTY_TIERS.length - 1,
  );
  return GAME_CONFIG.DIFFICULTY_TIERS[tierIndex];
}

export function generatePlanet(
  id: string,
  fromPlanetX: number,
  fromPlanetY: number,
  score: number,
): Planet {
  const tier = getTier(score);
  const maxAllowedDist = SH * GAME_CONFIG.CAMERA_TARGET_Y_RATIO - GAME_CONFIG.PLANET_TOP_MARGIN;
  const rawDist = tier.minDist + Math.random() * (tier.maxDist - tier.minDist);
  const dist = Math.min(rawDist, maxAllowedDist);

  const hMargin = GAME_CONFIG.PLANET_H_MARGIN;
  const safeWidth = SW - hMargin * 2;
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
    id, x, y, radius,
    color: styleInfo.color,
    style: styleInfo.style,
    ringColor: styleInfo.ringColor,
    hasRing, isMoving,
    moveSpeed: 0.4 + Math.random() * 0.6,
    moveRange: 35 + Math.random() * 40,
    moveOffset: Math.random() * Math.PI * 2,
  };
}

export function generateInitialPlanets(): Planet[] {
  const startPlanet: Planet = {
    id: 'planet_0', x: SW / 2, y: SH * 0.72, radius: 42,
    color: '#7C3AED', style: 'gas', hasRing: false, ringColor: '',
    isMoving: false, moveSpeed: 0, moveRange: 0, moveOffset: 0,
  };
  const secondPlanet: Planet = {
    id: 'planet_1',
    x: SW * 0.3 + Math.random() * SW * 0.4,
    y: SH * 0.72 - 190,
    radius: 36,
    color: '#1A6FBF', style: 'ocean', hasRing: true,
    ringColor: 'rgba(100,180,255,0.4)',
    isMoving: false, moveSpeed: 0, moveRange: 0, moveOffset: 0,
  };
  return [startPlanet, secondPlanet];
}

/**
 * Generates orbiting hazards for a specific planet.
 * Each hazard is assigned an evenly-spaced starting angle so there are always
 * clear windows between them — the gap angle is at least (2π / count) * gapFraction.
 */
export function generateOrbitingObstacles(
  planet: Planet,
  score: number,
): OrbitingObstacle[] {
  const tier = getTier(score);
  if (tier.orbitCount === 0) return [];

  const orbitRadius = planet.radius + tier.orbitRadiusExtra;
  const speed = tier.orbitSpeedMin + Math.random() * (tier.orbitSpeedMax - tier.orbitSpeedMin);
  // Alternate direction for variety: clockwise on even score multiples
  const direction = Math.floor(score / 10) % 2 === 0 ? 1 : -1;
  const finalSpeed = speed * direction;

  const startAngle = Math.random() * Math.PI * 2;
  const obstacles: OrbitingObstacle[] = [];

  for (let i = 0; i < tier.orbitCount; i++) {
    // Evenly space obstacles: each one is (2π / count) apart + random jitter within ±15%
    const baseAngle = startAngle + (i * Math.PI * 2) / tier.orbitCount;
    const jitter = ((Math.random() - 0.5) * Math.PI * 2) / tier.orbitCount * 0.15;
    const angle = baseAngle + jitter;

    const type = ORBIT_TYPES[Math.floor(Math.random() * ORBIT_TYPES.length)];
    // Size varies by type: satellites are small, mines and debris are medium, asteroids larger
    const size = type === 'satellite' ? 8 : type === 'mine' ? 10 : type === 'debris' ? 7 : 12;

    obstacles.push({
      id: `orbit_${planet.id}_${i}_${Date.now()}`,
      planetId: planet.id,
      orbitRadius,
      angle,
      orbitSpeed: finalSpeed,
      type,
      size,
      selfRotation: Math.random() * 360,
    });
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
