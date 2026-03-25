import { Planet, Star, Obstacle, PlanetStyle } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';
import Colors from '@/constants/colors';

// Planet style definitions: each style has a primary color and ring preference
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

function getTier(score: number) {
  const tierIndex = Math.min(
    Math.floor(score / (GAME_CONFIG.SCORE_PER_PLANET * GAME_CONFIG.DIFFICULTY_RAMP_EVERY)),
    GAME_CONFIG.DIFFICULTY_TIERS.length - 1,
  );
  return GAME_CONFIG.DIFFICULTY_TIERS[tierIndex];
}

export function generatePlanet(
  id: string,
  screenWidth: number,
  aboveY: number,
  score: number,
): Planet {
  const tier = getTier(score);
  const dist = tier.minDist + Math.random() * (tier.maxDist - tier.minDist);
  const margin = 55;
  const x = margin + Math.random() * (screenWidth - margin * 2);
  const y = aboveY - dist;

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
    moveRange: 40 + Math.random() * 50,
    moveOffset: Math.random() * Math.PI * 2,
  };
}

export function generateInitialPlanets(screenWidth: number, screenHeight: number): Planet[] {
  const startPlanet: Planet = {
    id: 'planet_0',
    x: screenWidth / 2,
    y: screenHeight * 0.72,
    radius: 44,
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
    x: screenWidth * 0.28 + Math.random() * screenWidth * 0.44,
    y: screenHeight * 0.72 - 220,
    radius: 38,
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
  screenWidth: number,
): Obstacle[] {
  const tier = getTier(score);
  if (Math.random() > tier.obstacleChance) return [];

  const obstacles: Obstacle[] = [];
  const count = 1 + (Math.random() < 0.4 ? 1 : 0); // 1 or 2 obstacles

  // Place obstacles in the space between the two planets
  for (let i = 0; i < count; i++) {
    // Random position in the corridor between planets
    const t = 0.25 + Math.random() * 0.5; // 25%-75% of the way
    const midX = fromPlanet.x + (toPlanet.x - fromPlanet.x) * t;
    const midY = fromPlanet.y + (toPlanet.y - fromPlanet.y) * t;

    // Offset sideways a bit so it's not always directly in path
    const sideOffset = (Math.random() - 0.5) * 80;
    const type = score >= 30 && Math.random() < 0.3 ? 'blackhole' : 'asteroid';

    obstacles.push({
      id: `obs_${Date.now()}_${i}`,
      x: midX + sideOffset,
      y: midY,
      radius: type === 'blackhole' ? GAME_CONFIG.OBSTACLE_RADIUS_BLACKHOLE : GAME_CONFIG.OBSTACLE_RADIUS_ASTEROID,
      type,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
    });
  }

  return obstacles;
}

export function generateStars(screenWidth: number, screenHeight: number): Star[] {
  const stars: Star[] = [];
  const totalHeight = screenHeight * 8;
  const startY = -totalHeight / 2;

  for (let i = 0; i < GAME_CONFIG.STAR_COUNT; i++) {
    const layer = (i % 3) as 0 | 1 | 2;
    stars.push({
      x: Math.random() * screenWidth,
      y: startY + Math.random() * totalHeight,
      size: layer === 0 ? 0.8 + Math.random() * 1.2 : layer === 1 ? 1.2 + Math.random() * 1.8 : 2 + Math.random() * 2.5,
      opacity: layer === 0 ? 0.2 + Math.random() * 0.4 : layer === 1 ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 0.4,
      twinkleSpeed: 0.4 + Math.random() * 2.2,
      layer,
    });
  }
  return stars;
}
