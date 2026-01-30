import * as THREE from 'three';
import { World } from './game/World.js';

const UI = {
    init: function() {
        // Менеджер загрузки
        const manager = new THREE.LoadingManager();
        
        // 1. Процесс загрузки
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
        };

        // 2. Когда всё загрузилось
        manager.onLoad = () => {
            console.log('All assets loaded!');
            document.getElementById('loading-screen').style.display = 'none'; // Убираем прелоадер
            document.getElementById('main-menu').classList.remove('hidden'); // Показываем меню
        };

        // Инициализируем мир, передавая менеджер
        window.gameWorld = new World('game-container', manager);

        // Кнопка старта
        document.getElementById('btn-start').onclick = () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('hud-panel').classList.remove('hidden');
            
            // ВОТ ИСПРАВЛЕНИЕ ОШИБКИ: Теперь метод точно вызывается
            if (window.gameWorld && window.gameWorld.start) {
                window.gameWorld.start();
            } else {
                console.error("Critical: World.start() not found!");
            }
        };
    }
};

UI.init();
