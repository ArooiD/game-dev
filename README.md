# Game Dev — Widelands-inspired RTS Prototype

Минимальный браузерный прототип RTS/settlement-sim в духе Widelands.

Это не копия Widelands и не использует её ассеты или код. Цель репозитория — собственный прототип с похожими идеями: поселение, экономика, рабочие, добыча ресурсов, дороги и производственные цепочки.

## Текущий фокус

- 2D canvas prototype
- TypeScript + Vite
- игровая карта из тайлов
- камера и перемещение по карте
- базовые ресурсы: wood, stone, food
- здания: headquarters, lumberjack, quarry, farm, road
- рабочие, которые выполняют задачи
- простая экономика поселения
- UI-панель состояния

## Запуск

```bash
npm install
npm run dev
```

## Команды

```bash
npm run dev      # локальный dev server
npm run build    # production build
npm run preview  # preview production build
```

## Идея MVP

Игрок развивает поселение. Центральный штаб хранит ресурсы. Производственные здания создают или добывают ресурсы. Рабочие перемещаются между зданиями и ресурсными точками. Дороги ускоряют логистику.

## Roadmap

См. `docs/roadmap.md`.
