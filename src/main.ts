/**
 * Точка входа в приложение
 */

import { Game } from './game/Game.js';

// Создаем и запускаем игру
const game = new Game();
game.init();
game.start();

console.log('Historical RTS Prototype v0.1.0');
console.log('Controls:');
console.log('  Left click + drag - Select units');
console.log('  Right click - Move command');
console.log('  Mouse wheel - Zoom');
console.log('  Arrow keys / Edge scroll - Move camera');
console.log('  ESC - Deselect');
console.log('  Space - Pause/Resume');
