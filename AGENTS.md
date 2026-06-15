# AGENTS.md

> 📚 **ВНИМАНИЕ:** Для полной документации см. [`.agents/README.md`](./.agents/README.md)
> 
> Этот файл содержит краткий контекст для OpenHands. Расширенная документация находится в `.agents/`.

---

## 🚀 Быстрый старт

1. **Новые AI-агенты:** начните с [`.agents/CONTEXT.md`](./.agents/CONTEXT.md)
2. **Архитектурные решения:** [`.agents/docs/DECISIONS.md`](./.agents/docs/DECISIONS.md)
3. **Правила вклада:** [`.agents/CONTRIBUTING.md`](./.agents/CONTRIBUTING.md)

---

## Project

Repository: `ArooiD/game-dev`

The project is a browser-based historical RTS / strategy prototype built with Phaser 3 and TypeScript. The visual direction is an isometric RTS inspired by games like Cossacks / early Total War-era strategy games.

Primary scene:

- `src/scenes/BattleScene.ts`

Important support modules:

- `src/ui/PortraitPanel.ts`
- `src/ui/actionIcons.ts`
- `src/economy/buildingTypes.ts`
- `src/economy/productionRules.ts`
- `src/economy/productionTypes.ts`
- `src/world/buildingRenderer.ts`
- `src/assets/buildings/buildingAssetTypes.ts`
- `src/assets/buildings/buildingAssetRegistry.ts`

## Current gameplay direction

The current prototype has:

- isometric terrain grid;
- selectable workers and military units;
- bottom HUD / portrait panel;
- command action icons;
- worker building placement;
- explicit construction process;
- right-click worker assignment to unfinished buildings;
- building production queues;
- staged building visuals;
- primitive placeholder building visuals until real SVG/PNG/WebP assets are added.

## Building system direction

Do not hardcode final building art directly into `BattleScene.ts`.

Buildings should use an asset-pack architecture that supports:

- different countries / cultures;
- different building types;
- multiple construction stages;
- completed state;
- damaged state;
- ruins state;
- layered visuals;
- future SVG source assets;
- future optimized runtime PNG/WebP textures;
- building occlusion / transparency when units are behind or need visibility.

Current country registry starts with:

- `russia`

Reserved future countries:

- `europe`
- `ottoman`

Current building kinds:

- `town_center`
- `house`
- `barracks`
- `stable`
- `foundry`
- `storehouse`

Current staged asset IDs:

- `construction_0`
- `construction_1`
- `construction_2`
- `construction_3`
- `complete`
- `damaged`
- `ruins`

## Building asset-pack files

The registry/schema files are:

- `src/assets/buildings/buildingAssetTypes.ts`
- `src/assets/buildings/buildingAssetRegistry.ts`

Per-building metadata currently exists under:

- `src/assets/buildings/russia/town_center/meta.json`
- `src/assets/buildings/russia/house/meta.json`
- `src/assets/buildings/russia/barracks/meta.json`
- `src/assets/buildings/russia/stable/meta.json`
- `src/assets/buildings/russia/foundry/meta.json`

Expected future asset layout:

```text
src/assets/buildings/<country>/<building_kind>/
  meta.json
  construction_0/
    shadow.svg
    base.svg
    scaffolding.svg
  construction_1/
    shadow.svg
    base.svg
    scaffolding.svg
  construction_2/
    shadow.svg
    base.svg
    roof.svg
    scaffolding.svg
  construction_3/
    shadow.svg
    base.svg
    roof.svg
    details.svg
    scaffolding.svg
  complete/
    shadow.svg
    base.svg
    roof.svg
    details.svg
  damaged/
    shadow.svg
    base.svg
    roof_broken.svg
    smoke.svg
  ruins/
    shadow.svg
    rubble.svg
```

SVG is acceptable as source art. Runtime should later support either loading SVG directly or using generated PNG/WebP textures. Prefer keeping metadata independent of the final runtime texture format.

## Building renderer

Renderer file:

- `src/world/buildingRenderer.ts`

Current renderer uses Phaser primitive placeholders. These are not final art. They should be treated as temporary stand-ins for staged asset packs.

Current important types/functions:

- `BuildingVisualSet`
- `createBuildingVisuals(...)`
- `syncBuildingVisuals(...)`
- `rebuildBuildingVisuals(...)`

Important implementation detail:

`BuildingVisualSet` owns a Phaser `Container` root. Building parts should be local children of this root. Do not position every primitive independently in world/screen coordinates during sync, because that caused roofs and bodies to visually split apart.

Correct pattern:

```ts
const root = scene.add.container(x, y);
root.add(part);
root.setPosition(x, y);
```

Incorrect pattern:

```ts
part.setPosition(worldX, worldY);
// and then later every part is reset to the same x/y during sync
```

## BattleScene building integration

`BattleScene.ts` currently keeps each building as a `Building` object from `src/economy/productionTypes.ts`.

The `Building` type currently has:

```ts
visuals: BuildingVisualSet;
```

When synchronizing a building, assign the return value of `syncBuildingVisuals(...)` back to the building:

```ts
building.visuals = syncBuildingVisuals(
  building.visuals,
  this,
  progress,
  building.completed,
  p.x,
  p.y - 18,
  d - 2,
  alpha,
);
```

Do not call:

```ts
building.visuals.forEach(...)
```

Use:

```ts
building.visuals.items.forEach(...)
```

or preferably manipulate the container root:

```ts
building.visuals.root.setAlpha(alpha);
```

## Recent important commits

Recent commits related to building visuals and construction:

- `d1061b7` — Allow workers to join construction by right click
- `583cba2` — Make town center resemble historic city hall
- `17043db` — Support composite building visuals
- `3ea48ee` — Add town center primitive renderer
- `6781cc2` — Render town center with composite visuals
- `5584def` — Add building asset pack schema
- `79c9302` — Add Russian building asset registry
- `fd8890f` — Add Russian town center asset metadata
- `4ba5805` — Add Russian house asset metadata
- `b71fa76` — Add Russian barracks asset metadata
- `f2e4a08` — Add Russian stable asset metadata
- `69df03c` — Add Russian foundry asset metadata
- `df3fd9a` — Select building visuals by construction stage
- `75786ae` — Store staged building visual sets
- `95afb7c` — Fix staged building visual synchronization
- `7b1e63b` — Replace primitive buildings with coherent iso sprites

## Known user requirements

The user wants practical implementation, not long plans. If asked to continue, make a concrete code change and commit it.

The user prefers Russian responses.

Important behavioral requirements:

- Do not reintroduce a hammer emoji above workers.
- Worker construction state should be represented by behavior and UI, not by a floating hammer label.
- Selected workers should be able to join an unfinished building by right-clicking it.
- Building placement should keep the selected worker context.
- Action icons should remain clickable in the HUD.

## Known risk in `BattleScene.ts`

`BattleScene.ts` has become compressed and hard to maintain because several methods are one-line implementations. Be careful when editing it.

Avoid destructive rewrites unless intentionally refactoring the whole scene.

Potentially simplified or regressed areas from earlier edits:

- formation hotkeys and advanced formation behavior;
- battalion rendering;
- enemy combat behavior;
- minimap drawing.

If you modify these systems, inspect current code first and avoid removing existing behavior accidentally.

## Recommended next refactors

1. Split `BattleScene.ts` into smaller systems:
   - selection;
   - building placement;
   - construction;
   - combat;
   - HUD;
   - minimap.

2. Replace primitive placeholder building art with real staged assets.

3. Add proper asset preload pipeline for SVG/PNG/WebP building layers.

4. Add occlusion logic:
   - if units are behind a building, fade occludable layers;
   - keep shadow / footprint visible;
   - never alter pathing footprint when fading visuals.

5. Add pathfinding / building obstacle avoidance using `footprint` from asset metadata / building specs.

## Debug notes

The previous runtime error:

```text
Uncaught TypeError: building.visuals.forEach is not a function
```

was caused by changing `visuals` from `GameObject[]` to `BuildingVisualSet` while `BattleScene.renderBuildingState` still treated it as an array.

Fix pattern:

```ts
building.visuals.items.forEach(...)
```

or use:

```ts
building.visuals.root.setAlpha(...)
```

## Style guidance for future agents

Prefer small, safe commits.

Use clear commit messages.

When changing visual systems, keep the data model and renderer separate:

- metadata / registry in `src/assets/buildings/*`;
- rendering in `src/world/buildingRenderer.ts`;
- game state in `src/economy/*`;
- orchestration in `src/scenes/BattleScene.ts`.

Do not put country-specific art logic directly into `BattleScene.ts`.
