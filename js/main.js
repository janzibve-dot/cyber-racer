import { World } from './game/World.js';

console.log("Main Module Loaded");

// Дождь в меню
const RainSystem = {
    container: document.getElementById('rain-container'),
    init: function() {
        if(!this.container) return;
        this.container.innerHTML = '';
        for(let i=0; i<60; i++) {
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

class GameApp {
    constructor() {
        this.active = false;
        this.world = null;
    }

    init() {
        if (this.active) return;
        this.active = true;
        RainSystem.destroy();
        this.world = new World('game-container');
    }
}

RainSystem.init();
window.GameApp = new GameApp();
