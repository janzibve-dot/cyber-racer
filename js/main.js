import { World } from './game/World.js';

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

// Делаем функцию остановки дождя доступной для других файлов
window.stopRain = () => RainSystem.destroy();

RainSystem.init();
console.log("Rain System Initialized");
