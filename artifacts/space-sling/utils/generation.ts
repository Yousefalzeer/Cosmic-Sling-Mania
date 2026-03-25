import { Planet, Star, Asteroid } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';
import Colors from '@/constants/colors';

const PLANET_COLORS = [
  Colors.planet1,
  Colors.planet2,
  Colors.planet3,
  Colors.planet4,
  Colors.planet5,
  Colors.planet6,
];

export function generatePlanet(
  id: string,
  screenWidth: number,
  aboveY: number,
  score: number,
): Planet {
  const difficulty = Math.floor(score / (GAME_CONFIG.SCORE_PER_PLANET * GAME_CONFIG.DIFFICULTY_RAMP_EVERY));
  const minDist = GAME_CONFIG.MIN_PLANET_DISTANCE;
  const maxDist = Math.max(
    minDist + 40,
    GAME_CONFIG.MAX_PLANET_DISTANCE - difficulty * 15,
  );
  const dist = minDist + Math.random() * (maxDist - minDist);

  const margin = 60;
  const x = margin + Math.random() * (screenWidth - margin * 2);
  const y = aboveY - dist;

  const maxRadius = Math.max(GAME_CONFIG.PLANET_MIN_RADIUS, GAME_CONFIG.PLANET_MAX_RADIUS - difficulty * 3);
  const radius = GAME_CONFIG.PLANET_MIN_RADIUS + Math.random() * (maxRadius - GAME_CONFIG.PLANET_MIN_RADIUS);

  const colorIdx = Math.floor(Math.random() * PLANET_COLORS.length);
  const hasRing = Math.random() > 0.65;
  const ringColors = ['rgba(255,255,255,0.3)', 'rgba(167,139,250,0.4)', 'rgba(6,182,212,0.35)'];

  return {
    id,
    x,
    y,
    radius,
    color: PLANET_COLORS[colorIdx],
    ringColor: ringColors[Math.floor(Math.random() * ringColors.length)],
    hasRing,
  };
}

export function generateInitialPlanets(screenWidth: number, screenHeight: number): Planet[] {
  const startPlanet: Planet = {
    id: 'planet_0',
    x: screenWidth / 2,
    y: screenHeight * 0.72,
    radius: 42,
    color: Colors.planet1,
    hasRing: false,
  };

  const secondPlanet: Planet = {
    id: 'planet_1',
    x: screenWidth * 0.3 + Math.random() * screenWidth * 0.4,
    y: screenHeight * 0.72 - 260,
    radius: 36,
    color: Colors.planet2,
    hasRing: true,
    ringColor: 'rgba(6,182,212,0.4)',
  };

  return [startPlanet, secondPlanet];
}

export function generateStars(screenWidth: number, screenHeight: number): Star[] {
  const stars: Star[] = [];
  const totalHeight = screenHeight * 6;
  for (let i = 0; i < GAME_CONFIG.STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * screenWidth,
      y: Math.random() * totalHeight - totalHeight / 2,
      size: 0.8 + Math.random() * 2.2,
      opacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2,
    });
  }
  return stars;
}

export function generateAsteroids(screenWidth: number, screenHeight: number): Asteroid[] {
  const asteroids: Asteroid[] = [];
  for (let i = 0; i < GAME_CONFIG.ASTEROID_COUNT; i++) {
    asteroids.push({
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      width: 12 + Math.random() * 24,
      height: 8 + Math.random() * 16,
      rotation: Math.random() * 360,
      speedY: 0.3 + Math.random() * 0.7,
    });
  }
  return asteroids;
}
