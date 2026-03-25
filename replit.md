# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a Space Sling mobile game built with Expo (React Native).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (api-server artifact)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo SDK 54, Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── space-sling/        # Space Sling mobile game (Expo)
│       ├── app/            # Expo Router screens
│       ├── screens/        # MenuScreen, GameScreen, GameOverScreen
│       ├── components/     # game/ and ui/ components
│       ├── context/        # GameContext (game state + reducer)
│       ├── constants/      # colors.ts, game.ts (GAME_CONFIG)
│       ├── types/          # TypeScript types
│       └── utils/          # physics.ts, generation.ts, storage.ts
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── package.json            # Root package
```

## Space Sling Game

A one-touch physics arcade game where players sling a rocket between planets.

### Architecture
- **GameContext**: Central game state with useReducer. Manages the entire game loop via setInterval.
- **Screens**: MenuScreen, GameScreen, GameOverScreen — mounted/unmounted based on `state.screen`
- **Physics**: `utils/physics.ts` — trajectory calculation, landing detection, vector math
- **Generation**: `utils/generation.ts` — procedural planet, star, and asteroid generation
- **Storage**: `utils/storage.ts` — AsyncStorage high score and sound preference persistence

### Key Game Config (`constants/game.ts`)
- `SLING_MAX_DISTANCE`: Max drag distance for aiming
- `LAUNCH_SPEED_MULTIPLIER`: Converts drag to velocity
- `TRAJECTORY_DOTS`: Number of trajectory preview dots
- `DIFFICULTY_RAMP_EVERY`: Score increments before increasing difficulty

### How to Run
```bash
pnpm --filter @workspace/space-sling run dev
```

### Building for iOS/Android

#### Prerequisites
1. Install EAS CLI: `npm install -g eas-cli`
2. Create an Expo account at expo.dev
3. Log in: `eas login`

#### iOS Build
```bash
cd artifacts/space-sling
eas build --platform ios
```
Requires Apple Developer account ($99/year) for App Store submission.

#### Android Build
```bash
cd artifacts/space-sling
eas build --platform android
```
Produces APK or AAB for Google Play Store.

#### Submit to Stores
```bash
eas submit --platform ios    # Submit to App Store Connect
eas submit --platform android # Submit to Google Play
```

### Before App Store / Play Store Submission

1. **App Icon**: Replace `assets/images/icon.png` with a 1024x1024 custom app icon
2. **Splash Screen**: Replace `assets/images/splash-icon.png` with a branded splash image
3. **Bundle ID**: Set unique bundle identifier in `app.json` (iOS: `ios.bundleIdentifier`, Android: `android.package`)
4. **Privacy Policy**: Required for both stores — create one and add URL to store listing
5. **Screenshots**: Capture gameplay screenshots for store listings (6.5" iPhone, 5.5" iPhone, iPad)
6. **Monetization**: Integrate rewarded ads (e.g., Google AdMob) wired to the "Continue" button
7. **Analytics**: Add Firebase Analytics or Amplitude for gameplay telemetry
8. **App Store Connect**: Create app listing, set age rating, categories, description
9. **Google Play Console**: Create app listing, content rating questionnaire
10. **Sound Effects**: Add actual audio files — game currently has sound toggle scaffolded but no audio loaded

### Monetization-Ready Structure
- `state.soundEnabled` — sound toggle with persistence
- Continue button in GameOverScreen — placeholder for rewarded ad integration
- Ad integration point: In `GameOverScreen.tsx`, the "CONTINUE" button's `onPress` handler should call your rewarded ad SDK and only restart game on ad completion
