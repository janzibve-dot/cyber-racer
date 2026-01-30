import { World } from './game/World.js';

const UI = {
    init: function() {
        this.menu = document.getElementById('main-menu');
        this.hud = document.getElementById('hud-panel');
        this.modeDisplay = document.getElementById('mode-display');
        
        // Создаем мир
        window.gameWorld = new World('game-container');

        // События кнопок
        document.getElementById('btn-start').addEventListener('click', () => this.startGame('БЕСКОНЕЧНО'));
        document.getElementById('btn-laps').addEventListener('click', () => this.startGame('КРУГИ'));
        
        console.log("UI System Ready");
    },
    
    startGame: function(modeName) {
        this.menu.classList.add('hidden');
        this.hud.classList.remove('hidden');
        if (this.modeDisplay) this.modeDisplay.textContent = modeName;
        
        // Запускаем мир
        if (window.gameWorld) {
            window.gameWorld.start(modeName === 'КРУГИ' ? 'laps' : 'endless');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());
