import { World } from './game/World.js';

const world = new World('game-container');
const mainMenu = document.getElementById('main-menu');
const hud = document.getElementById('hud-panel');

// Кнопка Бесконечного режима
document.getElementById('btn-start').onclick = () => {
    mainMenu.classList.add('hidden');
    hud.classList.remove('hidden');
    world.start('endless');
};

// Добавь в HTML вторую кнопку с id="btn-laps" для режима кругов
const btnLaps = document.getElementById('btn-laps');
if (btnLaps) {
    btnLaps.onclick = () => {
        mainMenu.classList.add('hidden');
        hud.classList.remove('hidden');
        world.start('laps');
    };
}
