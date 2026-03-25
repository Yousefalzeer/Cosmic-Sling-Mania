import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { GameState, GameScreen, Particle, Vec2 } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';
import { generateInitialPlanets, generatePlanet, generateStars, generateAsteroids } from '@/utils/generation';
import { checkLanding, computeTrajectory, getRocketAngle, clampDragVector, distance } from '@/utils/physics';
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
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' }
  | { type: 'GO_MENU' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'ADD_PARTICLE'; particles: Particle[] }
  | { type: 'CLEAR_OLD_PARTICLES' };

function makeParticles(x: number, y: number, count: number): Particle[] {
  const colors = [Colors.accentLight, Colors.primaryLight, Colors.secondaryLight, Colors.white];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 3;
    return {
      id: `p_${Date.now()}_${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: GAME_CONFIG.PARTICLE_LIFETIME,
      maxLife: GAME_CONFIG.PARTICLE_LIFETIME,
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
    rocket: {
      x: startPlanet.x,
      y: startPlanet.y - startPlanet.radius - GAME_CONFIG.ROCKET_RADIUS,
      vx: 0,
      vy: 0,
      angle: 0,
      attached: true,
      attachedPlanetId: 'planet_0',
    },
    stars: generateStars(SW, SH),
    asteroids: generateAsteroids(SW, SH),
    particles: [],
    cameraY: 0,
    isDragging: false,
    dragStart: null,
    dragCurrent: null,
    trajectoryPoints: [],
    isGameOver: false,
    soundEnabled,
    lastLandedPlanetId: 'planet_0',
  };
}

let planetCounter = 2;

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT': {
      return buildInitialState(action.highScore, action.soundEnabled);
    }

    case 'START_GAME': {
      return { ...state, screen: 'game' };
    }

    case 'DRAG_START': {
      if (!state.rocket.attached || state.screen !== 'game') return state;
      return {
        ...state,
        isDragging: true,
        dragStart: action.point,
        dragCurrent: action.point,
      };
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
        state.rocket.x,
        state.rocket.y,
        launchVx,
        launchVy,
        GAME_CONFIG.TRAJECTORY_DOTS,
        GAME_CONFIG.TRAJECTORY_STEP,
      );

      return {
        ...state,
        dragCurrent: action.point,
        trajectoryPoints: traj,
      };
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

      return {
        ...state,
        isDragging: false,
        dragStart: null,
        dragCurrent: null,
        trajectoryPoints: [],
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
      const { rocket, planets, cameraY, score } = state;

      let newX = rocket.x + rocket.vx * dt * 60;
      let newY = rocket.y + rocket.vy * dt * 60;
      const newAngle = getRocketAngle(rocket.vx, rocket.vy);

      // Check landing on planets
      let landed = false;
      let landedPlanetId: string | null = null;
      let newScore = score;
      let newParticles: Particle[] = [...state.particles];
      let newPlanets = [...planets];
      let newCameraY = cameraY;

      for (const planet of planets) {
        if (planet.id === state.lastLandedPlanetId) continue;
        const dist = distance({ x: newX, y: newY }, { x: planet.x, y: planet.y });
        if (dist <= planet.radius + GAME_CONFIG.ROCKET_RADIUS * 1.2) {
          landed = true;
          landedPlanetId = planet.id;
          newScore = score + GAME_CONFIG.SCORE_PER_PLANET;

          const landAngle = Math.atan2(newY - planet.y, newX - planet.x);
          newX = planet.x + Math.cos(landAngle) * (planet.radius + GAME_CONFIG.ROCKET_RADIUS);
          newY = planet.y + Math.sin(landAngle) * (planet.radius + GAME_CONFIG.ROCKET_RADIUS);

          newParticles = [...newParticles, ...makeParticles(newX, newY, GAME_CONFIG.PARTICLE_COUNT)];

          // Scroll camera toward landed planet
          const targetCameraY = -(planet.y - SH * 0.6);
          newCameraY = targetCameraY;

          // Spawn new planets
          const highestY = Math.min(...newPlanets.map(p => p.y)) + newCameraY;
          if (highestY > -SH * 0.5) {
            const aboveYWorld = Math.min(...newPlanets.map(p => p.y));
            const newPlanet = generatePlanet(
              `planet_${planetCounter++}`,
              SW,
              aboveYWorld,
              newScore,
            );
            newPlanets = [...newPlanets, newPlanet];
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
          vy: p.vy + 0.05,
          life: p.life - dt * 1000,
        }))
        .filter(p => p.life > 0);

      // Check off-screen (game over)
      const screenX = newX;
      const screenYRel = newY + newCameraY;

      const offscreen =
        screenX < -40 ||
        screenX > SW + 40 ||
        screenYRel > SH + 100;

      if (offscreen && !landed) {
        return {
          ...state,
          screen: 'gameover',
          isGameOver: true,
          particles: updatedParticles,
          rocket: {
            ...rocket,
            x: newX,
            y: newY,
            angle: newAngle,
          },
        };
      }

      if (landed) {
        return {
          ...state,
          score: newScore,
          highScore: Math.max(newScore, state.highScore),
          planets: newPlanets,
          cameraY: newCameraY,
          particles: updatedParticles,
          lastLandedPlanetId: landedPlanetId,
          rocket: {
            x: newX,
            y: newY,
            vx: 0,
            vy: 0,
            angle: newAngle,
            attached: true,
            attachedPlanetId: landedPlanetId,
          },
        };
      }

      return {
        ...state,
        particles: updatedParticles,
        cameraY: newCameraY,
        rocket: {
          ...rocket,
          x: newX,
          y: newY,
          angle: newAngle,
        },
      };
    }

    case 'GAME_OVER': {
      return { ...state, screen: 'gameover', isGameOver: true };
    }

    case 'RESTART': {
      planetCounter = 2;
      const planets = generateInitialPlanets(SW, SH);
      const startPlanet = planets[0];
      return {
        ...state,
        screen: 'game',
        score: 0,
        planets,
        rocket: {
          x: startPlanet.x,
          y: startPlanet.y - startPlanet.radius - GAME_CONFIG.ROCKET_RADIUS,
          vx: 0,
          vy: 0,
          angle: 0,
          attached: true,
          attachedPlanetId: 'planet_0',
        },
        particles: [],
        cameraY: 0,
        isDragging: false,
        dragStart: null,
        dragCurrent: null,
        trajectoryPoints: [],
        isGameOver: false,
        lastLandedPlanetId: 'planet_0',
      };
    }

    case 'GO_MENU': {
      planetCounter = 2;
      const planets = generateInitialPlanets(SW, SH);
      const startPlanet = planets[0];
      return {
        ...buildInitialState(state.highScore, state.soundEnabled),
        screen: 'menu',
      };
    }

    case 'TOGGLE_SOUND': {
      return { ...state, soundEnabled: !state.soundEnabled };
    }

    case 'ADD_PARTICLE': {
      return { ...state, particles: [...state.particles, ...action.particles] };
    }

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

  // Save high score when it changes
  useEffect(() => {
    if (state.highScore > 0) {
      saveHighScore(state.highScore);
    }
  }, [state.highScore]);

  // Save sound preference
  useEffect(() => {
    saveSoundEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // Game loop
  useEffect(() => {
    if (state.screen !== 'game' || state.rocket.attached) {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();
    rafRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.min((now - lastTickRef.current) / 1000, 0.05);
      lastTickRef.current = now;
      dispatch({ type: 'TICK', delta });
    }, 16);

    return () => {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
    };
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
