// js/main.js
import { World } from './game/World.js';

console.log("Main Module Loaded");

// Убираем старый дождь, если он был
const RainSystem = {
    container: document.getElementById('rain-container'),
    destroy: function() {
        if(this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }
};

class GameApp {
    constructor() {
        this.active = false;
        this.world = null;
    }

    init() {
        console.log("GameApp: INIT called!");
        if (this.active) return;
        this.active = true;

        RainSystem.destroy();

        try {
            // Передаем ID контейнера
            this.world = new World('game-container');
        } catch (e) {
            console.error("Error creating world:", e);
        }
    }
}

window.GameApp = new GameApp();
