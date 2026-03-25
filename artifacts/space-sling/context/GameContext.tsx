import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { GameState, Particle, Vec2, Obstacle } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';
import { generateInitialPlanets, generatePlanet, generateObstacles, generateStars } from '@/utils/generation';
import { getRocketAngle, clampDragVector, distance, checkObstacleHit, computeTrajectory, lerpCameraY } from '@/utils/physics';
import { getHighScore, saveHighScore, getSoundEnabled, saveSoundEnabled } from '@/utils/storage';
import Colors from '@/constants/colors';

const { width: SW, height: SH } = Dimensions.get('window');

type GameAction =
  | { type: 'INIT'; highScore: number; soundEnabled: boolean }
  | { type: 'START_GAME' }
  | { type: 'DRAG_START'; point: Vec2 }
  | { type: 'DRAG_MOVE'; point: Vec2 }
  | { type: 'DRAG_END' }
  | { type: 'TICK'; delta: number }
  | { type: 'RESTART' }
  | { type: 'GO_MENU' }
  | { type: 'TOGGLE_SOUND' };

function makeParticles(x: number, y: number, count: number, type: 'land' | 'crash' | 'launch'): Particle[] {
  const landColors = [Colors.accentLight, Colors.primaryLight, Colors.secondaryLight, Colors.white, '#FFF'];
  const crashColors = [Colors.danger, '#FF6B35', '#FFD700', Colors.white, '#FF4444'];
  const launchColors = [Colors.rocketFlame, Colors.accentLight, Colors.white, '#FFD700'];
  const colors = type === 'land' ? landColors : type === 'crash' ? crashColors : launchColors;

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 1.2;
    const speed = type === 'crash'
      ? 2.5 + Math.random() * 5
      : type === 'launch'
      ? 1.5 + Math.random() * 3
      : 1.8 + Math.random() * 3.5;
    return {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: type === 'crash' ? 4 + Math.random() * 7 : 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: type === 'crash' ? GAME_CONFIG.PARTICLE_LIFETIME * 1.3 : GAME_CONFIG.PARTICLE_LIFETIME,
      maxLife: type === 'crash' ? GAME_CONFIG.PARTICLE_LIFETIME * 1.3 : GAME_CONFIG.PARTICLE_LIFETIME,
    };
  });
}

function buildInitialState(highScore: number, soundEnabled: boolean): GameState {
  const planets = generateInitialPlanets(SW, SH);
  const startPlanet = planets[0];
  return {
    screen: 'menu',
    score: 0,
    highScore,
    planets,
    obstacles: [],
    rocket: {
      x: startPlanet.x,
      y: startPlanet.y - startPlanet.radius - GAME_CONFIG.ROCKET_RADIUS,
      vx: 0, vy: 0, angle: 0,
      attached: true,
      attachedPlanetId: 'planet_0',
    },
    stars: generateStars(SW, SH),
    particles: [],
    cameraY: 0,
    targetCameraY: 0,
    cameraShake: 0,
    isDragging: false,
    dragStart: null,
    dragCurrent: null,
    trajectoryPoints: [],
    isGameOver: false,
    soundEnabled,
    lastLandedPlanetId: 'planet_0',
    obstacleRotations: {},
    movingPlanetOffsets: {},
    tickCount: 0,
  };
}

let planetCounter = 2;
let obstacleCounter = 0;

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
      return buildInitialState(action.highScore, action.soundEnabled);

    case 'START_GAME':
      return { ...state, screen: 'game' };

    case 'DRAG_START': {
      if (!state.rocket.attached || state.screen !== 'game') return state;
      return { ...state, isDragging: true, dragStart: action.point, dragCurrent: action.point };
    }

    case 'DRAG_MOVE': {
      if (!state.isDragging || !state.dragStart) return state;
      const rawDelta = {
        x: action.point.x - state.dragStart.x,
        y: action.point.y - state.dragStart.y,
      };
      const clamped = clampDragVector(rawDelta, GAME_CONFIG.SLING_MAX_DISTANCE);
      const launchVx = -clamped.x * GAME_CONFIG.LAUNCH_SPEED_MULTIPLIER;
      const launchVy = -clamped.y * GAME_CONFIG.LAUNCH_SPEED_MULTIPLIER;
      const traj = computeTrajectory(
        state.rocket.x, state.rocket.y,
        launchVx, launchVy,
        GAME_CONFIG.TRAJECTORY_DOTS,
        GAME_CONFIG.TRAJECTORY_STEP,
      );
      return { ...state, dragCurrent: action.point, trajectoryPoints: traj };
    }

    case 'DRAG_END': {
      if (!state.isDragging || !state.dragStart || !state.dragCurrent) {
        return { ...state, isDragging: false, dragStart: null, dragCurrent: null, trajectoryPoints: [] };
      }
      const rawDelta = {
        x: state.dragCurrent.x - state.dragStart.x,
        y: state.dragCurrent.y - state.dragStart.y,
      };
      const clamped = clampDragVector(rawDelta, GAME_CONFIG.SLING_MAX_DISTANCE);
      if (Math.abs(clamped.x) < 3 && Math.abs(clamped.y) < 3) {
        return { ...state, isDragging: false, dragStart: null, dragCurrent: null, trajectoryPoints: [] };
      }
      const vx = -clamped.x * GAME_CONFIG.LAUNCH_SPEED_MULTIPLIER;
      const vy = -clamped.y * GAME_CONFIG.LAUNCH_SPEED_MULTIPLIER;

      // Launch particles at rocket position
      const launchParticles = makeParticles(state.rocket.x, state.rocket.y, GAME_CONFIG.LAUNCH_PARTICLE_COUNT, 'launch');

      return {
        ...state,
        isDragging: false,
        dragStart: null,
        dragCurrent: null,
        trajectoryPoints: [],
        particles: [...state.particles, ...launchParticles],
        rocket: {
          ...state.rocket,
          vx,
          vy,
          attached: false,
          attachedPlanetId: null,
          angle: getRocketAngle(vx, vy),
        },
      };
    }

    case 'TICK': {
      if (state.screen !== 'game' || state.rocket.attached) return state;

      const dt = action.delta;
      const tickCount = state.tickCount + 1;
      const { rocket, planets, obstacles, score } = state;

      let newX = rocket.x + rocket.vx * dt * 60;
      let newY = rocket.y + rocket.vy * dt * 60;
      const newAngle = getRocketAngle(rocket.vx, rocket.vy);

      // Smooth camera: lerp toward target
      const attachedPlanet = planets.find(p => p.id === state.lastLandedPlanetId);
      const smoothCameraY = lerpCameraY(state.cameraY, state.targetCameraY, GAME_CONFIG.CAMERA_LERP);
      const cameraShake = Math.max(0, state.cameraShake - dt * 300);

      // Update moving planet offsets
      const newMovingOffsets = { ...state.movingPlanetOffsets };
      for (const planet of planets) {
        if (planet.isMoving) {
          const current = newMovingOffsets[planet.id] ?? 0;
          newMovingOffsets[planet.id] = current + planet.moveSpeed * dt;
        }
      }

      // Update obstacle rotations
      const newObstacleRotations = { ...state.obstacleRotations };
      for (const obs of obstacles) {
        const current = newObstacleRotations[obs.id] ?? obs.rotation;
        newObstacleRotations[obs.id] = current + obs.rotationSpeed;
      }

      let landed = false;
      let landedPlanetId: string | null = null;
      let newScore = score;
      let newParticles: Particle[] = [...state.particles];
      let newPlanets = [...planets];
      let newObstacles = [...obstacles];
      let newTargetCameraY = state.targetCameraY;
      let newCameraShake = cameraShake;

      // Get effective planet positions (accounting for movement)
      const getEffectiveX = (p: typeof planets[0]) => {
        if (!p.isMoving) return p.x;
        const offset = newMovingOffsets[p.id] ?? 0;
        return p.x + Math.sin(offset + p.moveOffset) * p.moveRange;
      };

      // Check obstacle collisions first
      for (const obs of obstacles) {
        if (checkObstacleHit(newX, newY, obs)) {
          const crashParticles = makeParticles(newX, newY, GAME_CONFIG.CRASH_PARTICLE_COUNT, 'crash');
          return {
            ...state,
            screen: 'gameover',
            isGameOver: true,
            cameraShake: 20,
            particles: [...newParticles, ...crashParticles],
            obstacleRotations: newObstacleRotations,
            movingPlanetOffsets: newMovingOffsets,
            tickCount,
            rocket: { ...rocket, x: newX, y: newY, angle: newAngle },
          };
        }
      }

      // Check landing on planets
      for (const planet of newPlanets) {
        if (planet.id === state.lastLandedPlanetId) continue;
        const px = getEffectiveX(planet);
        const dist = distance({ x: newX, y: newY }, { x: px, y: planet.y });
        if (dist <= planet.radius + GAME_CONFIG.ROCKET_RADIUS * 1.2) {
          landed = true;
          landedPlanetId = planet.id;
          newScore = score + GAME_CONFIG.SCORE_PER_PLANET;

          // Snap rocket to planet surface
          const landAngle = Math.atan2(newY - planet.y, newX - px);
          newX = px + Math.cos(landAngle) * (planet.radius + GAME_CONFIG.ROCKET_RADIUS);
          newY = planet.y + Math.sin(landAngle) * (planet.radius + GAME_CONFIG.ROCKET_RADIUS);

          // Landing particles + camera shake
          newParticles = [...newParticles, ...makeParticles(newX, newY, GAME_CONFIG.PARTICLE_COUNT, 'land')];
          newCameraShake = 6;

          // Camera target = landed planet centered on upper portion of screen
          newTargetCameraY = -(planet.y - SH * GAME_CONFIG.CAMERA_TARGET_Y_RATIO);

          // Prune old planets that are far off camera
          const cameraWorld = -newTargetCameraY;
          newPlanets = newPlanets.filter(p => p.y > cameraWorld - SH * 0.3);
          newObstacles = newObstacles.filter(o => o.y > cameraWorld - SH * 0.3);

          // Spawn next planet (always keep 2 ahead)
          const planetsAhead = newPlanets.filter(p => p.y < planet.y);
          if (planetsAhead.length < 2) {
            const highestY = Math.min(...newPlanets.map(p => p.y));
            const newPlanet = generatePlanet(`planet_${planetCounter++}`, SW, highestY, newScore);
            newPlanets = [...newPlanets, newPlanet];

            // Generate obstacles in the gap between last planet and new one
            if (newPlanets.length >= 2) {
              const fromPlanet = newPlanets.find(p => p.id === landedPlanetId) ?? planet;
              const newObs = generateObstacles(fromPlanet, newPlanet, newScore, SW);
              newObstacles = [...newObstacles, ...newObs];
            }
          }

          break;
        }
      }

      // Tick particles
      const updatedParticles = newParticles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.04,
          vx: p.vx * 0.97,
          life: p.life - dt * 1000,
        }))
        .filter(p => p.life > 0);

      // Game over: off-screen
      const screenYRel = newY + smoothCameraY;
      const offscreen = newX < -50 || newX > SW + 50 || screenYRel > SH + 120;

      if (offscreen && !landed) {
        const crashParticles = makeParticles(newX, newY, GAME_CONFIG.CRASH_PARTICLE_COUNT, 'crash');
        return {
          ...state,
          screen: 'gameover',
          isGameOver: true,
          cameraShake: 15,
          particles: [...updatedParticles, ...crashParticles],
          cameraY: smoothCameraY,
          obstacleRotations: newObstacleRotations,
          movingPlanetOffsets: newMovingOffsets,
          tickCount,
          rocket: { ...rocket, x: newX, y: newY, angle: newAngle },
        };
      }

      if (landed) {
        return {
          ...state,
          score: newScore,
          highScore: Math.max(newScore, state.highScore),
          planets: newPlanets,
          obstacles: newObstacles,
          cameraY: smoothCameraY,
          targetCameraY: newTargetCameraY,
          cameraShake: newCameraShake,
          particles: updatedParticles,
          lastLandedPlanetId: landedPlanetId,
          obstacleRotations: newObstacleRotations,
          movingPlanetOffsets: newMovingOffsets,
          tickCount,
          rocket: {
            x: newX, y: newY, vx: 0, vy: 0,
            angle: newAngle,
            attached: true,
            attachedPlanetId: landedPlanetId,
          },
        };
      }

      return {
        ...state,
        particles: updatedParticles,
        cameraY: smoothCameraY,
        cameraShake,
        obstacleRotations: newObstacleRotations,
        movingPlanetOffsets: newMovingOffsets,
        tickCount,
        rocket: { ...rocket, x: newX, y: newY, angle: newAngle },
      };
    }

    case 'RESTART': {
      planetCounter = 2;
      obstacleCounter = 0;
      const planets = generateInitialPlanets(SW, SH);
      const startPlanet = planets[0];
      return {
        ...state,
        screen: 'game',
        score: 0,
        planets,
        obstacles: [],
        rocket: {
          x: startPlanet.x,
          y: startPlanet.y - startPlanet.radius - GAME_CONFIG.ROCKET_RADIUS,
          vx: 0, vy: 0, angle: 0,
          attached: true,
          attachedPlanetId: 'planet_0',
        },
        particles: [],
        cameraY: 0,
        targetCameraY: 0,
        cameraShake: 0,
        isDragging: false,
        dragStart: null,
        dragCurrent: null,
        trajectoryPoints: [],
        isGameOver: false,
        lastLandedPlanetId: 'planet_0',
        obstacleRotations: {},
        movingPlanetOffsets: {},
        tickCount: 0,
      };
    }

    case 'GO_MENU': {
      planetCounter = 2;
      obstacleCounter = 0;
      return { ...buildInitialState(state.highScore, state.soundEnabled), screen: 'menu' };
    }

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  toggleSound: () => void;
  onDragStart: (point: Vec2) => void;
  onDragMove: (point: Vec2) => void;
  onDragEnd: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, buildInitialState(0, true));
  const lastTickRef = useRef<number>(Date.now());
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const [highScore, soundEnabled] = await Promise.all([getHighScore(), getSoundEnabled()]);
      dispatch({ type: 'INIT', highScore, soundEnabled });
    })();
  }, []);

  useEffect(() => {
    if (state.highScore > 0) saveHighScore(state.highScore);
  }, [state.highScore]);

  useEffect(() => {
    saveSoundEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  useEffect(() => {
    if (state.screen !== 'game' || state.rocket.attached) {
      if (rafRef.current) { clearInterval(rafRef.current); rafRef.current = null; }
      return;
    }
    lastTickRef.current = Date.now();
    rafRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.min((now - lastTickRef.current) / 1000, 0.05);
      lastTickRef.current = now;
      dispatch({ type: 'TICK', delta });
    }, 16);
    return () => { if (rafRef.current) { clearInterval(rafRef.current); rafRef.current = null; } };
  }, [state.screen, state.rocket.attached]);

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const restartGame = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const goToMenu = useCallback(() => dispatch({ type: 'GO_MENU' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const onDragStart = useCallback((point: Vec2) => dispatch({ type: 'DRAG_START', point }), []);
  const onDragMove = useCallback((point: Vec2) => dispatch({ type: 'DRAG_MOVE', point }), []);
  const onDragEnd = useCallback(() => dispatch({ type: 'DRAG_END' }), []);

  return (
    <GameContext.Provider value={{ state, dispatch, startGame, restartGame, goToMenu, toggleSound, onDragStart, onDragMove, onDragEnd }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
