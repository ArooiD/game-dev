# Game Engine Architecture

## Overview
2.5D Top-Down RTS Game Engine built with TypeScript, following ECS (Entity-Component-System) pattern.

## Architecture

```
src/
├── core/           # Core ECS framework
│   ├── Entity.ts          # Base entity class
│   ├── EntityManager.ts   # Entity management
│   └── index.ts           # Core exports
│
├── entities/       # Game entities
│   ├── Unit.ts            # Unit entity with stats, movement
│   ├── Building.ts        # Building entity
│   └── index.ts           # Entity exports
│
├── system/         # Game systems
│   ├── TileMap.ts         # Map generation, pathfinding (A*)
│   └── index.ts           # System exports
│
├── render/         # Rendering system
│   ├── Camera.ts          # Camera position, zoom, bounds
│   ├── Renderer.ts        # Main renderer, draw calls
│   └── index.ts           # Render exports
│
├── input/          # Input handling
│   ├── InputHandler.ts    # Mouse, keyboard events
│   └── index.ts           # Input exports
│
├── ui/             # User interface
│   ├── SelectionPanel.ts  # Unit stats display
│   ├── UIManager.ts       # UI management
│   └── index.ts           # UI exports
│
├── game/           # Game logic
│   ├── Game.ts            # Main game class, orchestration
│   ├── GameLoop.ts        # Game loop (update/render)
│   └── index.ts           # Game exports
│
├── utils/          # Utilities
│   ├── IsoUtils.ts        # Coordinate transformations (top-down)
│   └── index.ts           # Utils exports
│
├── types.ts        # Shared type definitions
└── main.ts         # Application entry point
```

## Core Components

### 1. ECS Framework (`core/`)

**Entity**
- Base class for all game objects
- Properties: id, type, position, dimensions, color
- Components: health, selection, etc.
- Tags: for grouping and filtering

**EntityManager**
- Creates, stores, and manages entities
- Query by type, tags, components
- Update cycle for all entities

### 2. Game Systems (`system/`)

**TileMap**
- Grid-based map (32x32 default)
- Tile types: GRASS, FOREST, MOUNTAIN, WATER, ROAD
- Walkability and movement cost
- A* pathfinding algorithm
- Safe zone generation for spawning

### 3. Rendering (`render/`)

**Camera**
- Position in world coordinates
- Zoom (currently fixed at 1.0)
- Bounds clamping
- Smooth movement

**Renderer**
- Canvas-based rendering
- Layered drawing (tiles, units, buildings, selection, paths)
- Top-down coordinate transformation
- Selection box visualization
- Path visualization (dotted lines, waypoints)

### 4. Input (`input/`)

**InputHandler**
- Mouse events: click, drag, right-click
- Keyboard: WASD camera movement
- Selection: single click vs box selection
- Camera pan controls

### 5. Entities (`entities/`)

**Unit**
- Types: INFANTRY, ARCHER, CAVALRY, ARTILLERY
- Stats: health, morale, stamina, attack, defense, speed
- Movement: pathfinding, speed, direction tracking
- Commands: moveTo, stop, attack

**Building**
- Types: BARRACKS, STABLE, ARCHERY_RANGE, TOWER
- Stats: health, defense
- Functions: unit production, defense

### 6. UI (`ui/`)

**SelectionPanel**
- Unit portrait and type icon
- Health bar
- Stats display (attack, defense, speed)
- Color-coded by team

**UIManager**
- Panel management
- Update cycle
- Rendering overlay

### 7. Game Logic (`game/`)

**Game**
- Initialization and setup
- Entity creation and management
- Input binding
- Render loop orchestration
- Test scene generation

**GameLoop**
- Fixed timestep updates
- Render synchronization
- Delta time calculation

### 8. Utilities (`utils/`)

**IsoUtils** (now TopDownUtils)
- Coordinate transformations:
  - gridToScreen: grid → pixel
  - screenToGrid: pixel → grid
  - worldToScreen: world + camera → pixel
  - screenToWorld: pixel + camera → world
- Depth sorting
- Hit testing
- Map size calculation

## Data Flow

```
Input → InputHandler
       ↓
Game (process input)
       ↓
EntityManager (update entities)
       ↓
TileMap (pathfinding if needed)
       ↓
Renderer (draw frame)
       ↓
UIManager (update UI)
```

## Key Features

### Movement System
- A* pathfinding on grid
- Path smoothing (skip unnecessary waypoints)
- Dynamic path optimization during movement
- Direction tracking for visualization
- Direct movement fallback when path not found

### Selection System
- Single unit selection (click)
- Box selection (drag)
- Team-based selection filtering
- Visual selection ring

### Camera System
- Pan with WASD or edge scrolling
- Bounds clamping to map size
- Fixed zoom (zoom disabled for simplicity)
- Smooth movement interpolation

### Path Visualization
- Dotted yellow line for entire path
- Yellow dots for waypoints
- Red dot for final destination
- Yellow arrow for current direction

## Types System

```typescript
// Core types
EntityType: 'unit' | 'building' | 'tile'
UnitType: 'infantry' | 'archer' | 'cavalry' | 'artillery'
BuildingType: 'barracks' | 'stable' | 'archery_range' | 'tower'
TileType: 'grass' | 'forest' | 'mountain' | 'water' | 'road'

// Data structures
WorldPosition: { x, y, z }
Vector2: { x, y }
Dimensions: { width, height, depth }
Color: { r, g, b, a }
UnitStats: { health, morale, stamina, attack, defense, moveSpeed }
```

## Usage Example

```typescript
// Initialize game
const game = new Game();
game.start();

// Create unit
const unit = new Unit(
  'unit_1',
  UnitType.INFANTRY,
  { x: 16, y: 16, z: 0 },
  { width: 1, height: 1, depth: 1 },
  { r: 52, g: 152, b: 219, a: 1 }
);
game.entityManager.add(unit);

// Move unit
unit.moveTo(20, 20);

// Game loop runs automatically
```

## Future Enhancements

- [ ] Zoom functionality re-enabled
- [ ] Combat system
- [ ] Resource gathering
- [ ] Building construction
- [ ] Unit production from buildings
- [ ] AI opponent
- [ ] Multiplayer support
- [ ] Save/load game state
- [ ] More terrain types
- [ ] Fog of war
- [ ] Sound effects and music

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run lint
```

## License

MIT
