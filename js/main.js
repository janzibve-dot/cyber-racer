// js/main.js
import { World } from './game/World.js';

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

    // ОПТИМИЗАЦИЯ: Полное удаление элементов
    destroy: function() {
        this.container.innerHTML = ''; // Удаляем DOM узлы
        this.container.style.display = 'none';
    }
};

class GameApp {
    constructor() {
        this.world = null;
        this.active = false;
    }

    init() {
        if (this.active) return;
        this.active = true;

        console.log("System: Cleaning Memory...");
        RainSystem.destroy(); // Чистим память

        console.log("System: Starting World...");
        this.world = new World('game-container');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    RainSystem.init();
    window.GameApp = new GameApp();
});
