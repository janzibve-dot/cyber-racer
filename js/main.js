import { World } from './game/World.js';

// Система дождя (оставляем для меню)
const RainSystem = {
    container: document.getElementById('rain-container'),
    init: function() {
        for(let i=0; i<80; i++) {
            let drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random()*100 + 'vw';
            drop.style.animationDuration = (0.5 + Math.random()) + 's';
            drop.style.animationDelay = Math.random()*2 + 's';
            this.container.appendChild(drop);
        }
    },
    stop: function() {
        this.container.style.display = 'none'; // Скрываем дождь при старте игры
    }
};

// Глобальный класс приложения
class GameApp {
    constructor() {
        this.world = null;
        this.active = false;
    }

    // Этот метод вызывается из ui.js
    init() {
        console.log("Game Start Initialized");
        if (this.active) return;
        this.active = true;

        // 1. Останавливаем эффекты меню
        RainSystem.stop();

        // 2. Инициализируем 3D мир
        // Передаем ID div-а, в котором будет игра
        this.world = new World('game-container');
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    RainSystem.init();
    // Делаем доступным глобально, чтобы ui.js мог его вызвать
    window.GameApp = new GameApp();
});
