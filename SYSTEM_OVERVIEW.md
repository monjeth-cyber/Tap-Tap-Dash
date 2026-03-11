# Tap Tap Dash - System Overview

This document describes the architecture and major components of the Tap Tap Dash game.

## Technologies
- Expo SDK 55 (React Native 0.83.2, React 19.2.0)
- JavaScript/React functional components
- Hooks for game logic and lifecycle
- Animated API for UI animations
- `expo-audio` (with graceful fallback) and `expo-haptics`
- AsyncStorage for persistent data

## High-Level Structure

```
App.js
src/
  components/
    StartScreen.js
    TutorialScreen.js
    LevelMapScreen.js
    GameScreen.js
    HUD.js
    PathView.js
    Player.js
    GameOverScreen.js
    LevelCompleteScreen.js
  hooks/
    useGameLoop.js
    useGameEngine.js
    useSaveData.js
    useGameLoop.js
  engine/
    pathGenerator.js
    levelController.js
    turnDetector.js
    collisionDetector.js
    scoreManager.js
  services/
    audioService.js
    hapticsService.js
    storageService.js
  utils/
    constants.js
    helpers.js
    theme.js
  data/
    levels.js
```

## App.js
- Root component handling navigation between screens (start, tutorial, map, game, gameOver, levelComplete)
- Maintains global state: selected level, difficulty, last score
- Uses `useSaveData` hook for persistence and unlocking
- Preloads/unloads sounds

## Hooks

### useGameLoop.js
- Provides a `requestAnimationFrame` loop with delta time capping
- Accepts callback and running boolean

### useGameEngine.js
- Core game logic: player movement, scoring, collisions, turns, jumps, pause/resume
- Accepts level id, callbacks, difficulty
- Returns gameState plus methods (start, restart, handleTap, jump, pause/resume)
- Uses internal refs for state and scoring

### useSaveData.js
- Manages AsyncStorage persistence for unlocked levels, best scores, sound settings
- Provides helper functions used by App and menus

## Engine

### pathGenerator.js
- Creates tile path array based on level config, with random turns/gems/obstacles

### levelController.js
- Provides base level configurations and applies difficulty modifiers (speed, window, obstacles)

### turnDetector.js
- Detects taps within valid turn window and missed turns

### collisionDetector.js
- Determines gem collection and obstacle hit

### scoreManager.js
- Score constants and functions for tile/gem/turn/level complete

## Components

### StartScreen.js
- Title animation, difficulty selector, play/tutorial buttons

### TutorialScreen.js
- 7-step interactive tutorial with animated transitions

### LevelMapScreen.js
- Displays levels grouped into tiers; allows selection/back navigation

### GameScreen.js
- Main gameplay screen with full-screen pressable input
- Handles single/double tap logic, pause/settings overlay, integrates HUD and PathView

### HUD.js
- Displays level info, score, gems, difficulty badge, gear icon for settings

### PathView.js
- Renders tiles, shadows, gems, obstacles, turn indicators, and player
- Handles 3D visual effects and animations

### Player.js
- Animated humanoid character with running and jump animations
- Always upright; rotates only if desired

### GameOverScreen.js / LevelCompleteScreen.js
- Animated end-game screens with scores and navigation buttons

## Services

### audioService.js
- Manages sound loading/playback
- Graceful fallback if native audio module missing

### hapticsService.js
- Wrapper around `expo-haptics` for simple vibration calls

### storageService.js
- AsyncStorage helpers used by `useSaveData`

## Utils

### constants.js
- Sizes, scoring values, directions, difficulties, storage keys

### helpers.js
- Utility functions (clamp, random, formatScore, etc.)

### theme.js
- Defines color themes for the game

## Flow Summary
1. App starts → loads save data and sounds
2. User interacts with `StartScreen` (choose difficulty, start or tutorial)
3. `GameScreen` uses `useGameEngine` to drive gameplay
   - `useGameLoop` calls engine.tick each frame
   - Input handled via tap/double-tap logic
   - GameState updates trigger rendering in PathView, HUD, etc.
4. Upon game over or level complete, callbacks navigate to respective screens
5. Scores and unlocks persisted via `useSaveData`

## Notes
- Difficulty modifies speed, turn window and obstacle density via `getLevelConfigWithDifficulty`.
- Settings menu pauses the game and allows quitting to main menu.
- Jump mechanic (double-tap) avoids obstacles; engine prevents obstacle checks during jump.
- UI animations use React Native Animated loops and interpolations.

This overview should help future developers understand the system quickly.
