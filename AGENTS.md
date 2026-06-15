# AGENTS.md

> 📚 **ВНИМАНИЕ:** Полная документация находится в [`.agents/README.md`](./.agents/README.md)
> 
> Этот файл содержит минимальный контекст для OpenHands. Для работы с проектом читайте `.agents/`.

---

## 🚀 Начните здесь

**Все AI-агенты должны прочитать:**

1. [`.agents/CONTEXT.md`](./.agents/CONTEXT.md) — основной контекст и правила
2. [`.agents/docs/DECISIONS.md`](./.agents/docs/DECISIONS.md) — архитектурные решения
3. [`.agents/CONTRIBUTING.md`](./.agents/CONTRIBUTING.md) — правила вклада

---

## Кратко о проекте

**2.5D браузерная RTS** на TypeScript + Phaser 3 в стиле исторических стратегий.

**Критичные правила:**
- ❌ НЕ хардкодить арт зданий в код — использовать `buildingAssetRegistry`
- ❌ НЕ использовать `building.visuals.forEach()` — использовать `syncBuildingVisuals()`
- ⚠️ `BattleScene.ts` большой и сжатый — не рефакторить без запроса

**См. `.agents/CONTEXT.md` для деталей.**
