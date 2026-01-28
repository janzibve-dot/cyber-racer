import { World } from './game/World.js';

console.log("Main Module Loaded");

const RainSystem = {
    container: document.getElementById('rain-container'),
    init: function() {
        if(!this.container) return;
        this.container.innerHTML = '';
        for(let i=0; i<50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random()*100 + '%';
            drop.style.animationDuration = (0.5+Math.random())+'s';
            drop.style.animationDelay = Math.random()+'s';
            this.container.appendChild(drop);
        }
    },
    destroy: function() {
        if(this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }
};

// Глобальный класс
class GameApp {
    constructor() {
        this.active = false;
        this.world = null;
    }

    init() {
        console.log("GameApp: INIT called!");
        if (this.active) return;
        this.active = true;

        // Удаляем дождь
        RainSystem.destroy();

        // Запускаем мир
        try {
            this.world = new World('game-container');
            console.log("World created successfully");
        } catch (e) {
            console.error("Error creating world:", e);
        }
    }
}

// Запуск дождя в меню
RainSystem.init();

// Делаем доступным глобально
window.GameApp = new GameApp();
console.log("GameApp attached to window");
