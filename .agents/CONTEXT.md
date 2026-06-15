# Project Context — Historical RTS Prototype

> **Цель:** Быстрый онбординг любого AI-агента к кодовой базе.

## 🎯 Краткое описание

2.5D браузерная RTS в стиле исторических стратегий (Cossacks 2, Age of Empires).  
**Стек:** TypeScript + Phaser 3 + Vite.

**Ключевые фичи:**
- Изометрический вид
- Система формаций (линия, колонна, квадрат)
- Экономика и строительство
- Боевая система (мораль, залпы, артиллерия)
- Пошаговая стратегическая карта (кампания)

---

## 📂 Структура проекта

```
src/
├── main.ts                    # Точка входа, инициализация Phaser
├── types.ts                   # Общие типы (Vector2, UnitType, FormationType...)
├── scenes/
│   ├── CampaignScene.ts       # Стратегическая карта (пошаговая)
│   └── BattleScene.ts         # Тактическая битва (реальное время) ⚠️
├── campaign/                  # Логика кампании
├── world/                     # Мир, рендеринг, изометрия
│   ├── isoTerrain.ts          # Отрисовка ландшафта
│   ├── iso.ts                 # Изометрические преобразования
│   └── buildingRenderer.ts    # Рендеринг зданий ⚠️
├── economy/                   # Экономика, производство
│   ├── buildingTypes.ts       # Типы зданий
│   ├── productionRules.ts     # Правила производства
│   └── productionTypes.ts     # Типы для производства
├── ui/                        # Интерфейс
│   ├── PortraitPanel.ts       # Панель портретов
│   └── actionIcons.ts         # Иконки действий
├── assets/                    # Метаданные ассетов (не сами текстуры)
│   └── buildings/
│       └── <country>/<building>/meta.json
└── core/                      # ECS ядро (если используется)
```

---

## ⚠️ Критичные правила разработки

### 1. **Система зданий** (ВАЖНО!)

❌ **НЕЛЬЗЯ:**
- Хардкодить арт зданий в `BattleScene.ts`
- Использовать `building.visuals.forEach(...)`
- Двигать части здания независимо (`part.setPosition(...)`)

✅ **НАДО:**
- Использовать `buildingAssetRegistry` для загрузки мета-данных
- Использовать `BuildingVisualSet` с `container root`
- Синхронизировать через `syncBuildingVisuals(...)`
- Присваивать результат: `building.visuals = syncBuildingVisuals(...)`

**Пример правильного кода:**
```typescript
import { createBuildingVisuals, syncBuildingVisuals } from '../world/buildingRenderer';
import { buildingAssetRegistry } from '../assets/buildings/buildingAssetRegistry';

// Создание
const visuals = createBuildingVisuals(scene, 'russia', 'house', 'complete', x, y);

// Синхронизация
building.visuals = syncBuildingVisuals(
  building.visuals,
  scene,
  progress,
  building.completed,
  x, y,
  depth,
  alpha
);

// Управление альфа-каналом
building.visuals.root.setAlpha(alpha);
```

### 2. **BattleScene.ts**

- Файл **сжат и сложен** для поддержки
- Не делать рефакторинг без явного запроса
- Не удалять функционал: формации, батальоны, combat, minimap
- При изменениях — проверять текущий код перед правками

### 3. **Поведение рабочих**

- ❌ Не добавлять молоток над рабочими
- ✅ Рабочие присоединяются к стройке через **правый клик**
- ✅ Сохранять контекст выделения при размещении зданий

### 4. **Архитектура ассетов**

```
src/assets/buildings/<country>/<building_kind>/
  meta.json              # Метаданные здания
  construction_0/        # Стадии строительства
    shadow.svg
    base.svg
  complete/
    shadow.svg
    base.svg
    roof.svg
  damaged/
  ruins/
```

**Правило:** Метаданные в `meta.json`, рендеринг в `buildingRenderer.ts`, оркестрация в `BattleScene.ts`.

---

## 🚀 Быстрый старт

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production build
npm run preview  # Preview build
```

### Горячие клавиши

**CampaignScene:**
- `N` — следующий ход
- `B` — тестовая битва

**BattleScene:**
- `WASD` — камера
- `ESC` — отмена
- `H/B/S/F` — построить дом/казармы/конюшню/оружейную
- `T/Q/E/C/A` — тренировать рабочих/солдат/специалистов/кавалерию/артиллерию
- `X` — стоп

---

## 📝 Важные файлы для изучения

| Файл | Описание | Приоритет |
|------|----------|-----------|
| `src/scenes/BattleScene.ts` | Основной игровой цикл | ⚠️ Высокий |
| `src/world/buildingRenderer.ts` | Рендеринг зданий | ⚠️ Высокий |
| `src/assets/buildings/buildingAssetRegistry.ts` | Регистр ассетов | Высокий |
| `src/economy/productionRules.ts` | Правила производства | Средний |
| `src/ui/PortraitPanel.ts` | UI панель | Средний |
| `docs/roadmap.md` | План разработки | Низкий |

---

## 🐛 Известные проблемы

1. **`building.visuals.forEach is not a function`**  
   Причина: `visuals` теперь `BuildingVisualSet`, а не массив.  
   Решение: Использовать `building.visuals.items.forEach(...)` или `building.visuals.root.setAlpha(...)`.

2. **BattleScene.ts слишком большой**  
   Причина: Много логики в одном файле.  
   Решение: Не рефакторить без явного запроса.

---

## 📚 Ссылки

- `AGENTS.md` — расширенный контекст для OpenHands
- `docs/ARCHITECTURE.md` — детальная архитектура
- `docs/roadmap.md` — план разработки
- `README.md` — общее описание проекта

---

## ✅ Чеклист перед коммитом

- [ ] Код следует паттернам из `CONTEXT.md`
- [ ] Не добавлен хардкод-арт в код
- [ ] Используется `BuildingVisualSet` для зданий
- [ ] Изменения в `BattleScene.ts` минимальны и обоснованы
- [ ] Коммит на русском (или английском, если проект international)
