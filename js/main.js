const WorldSystem = {
    rainContainer: document.getElementById('rain-container'),
    dropCount: 150, // Больше капель для густоты

    init: function() {
        console.log("World System: Initializing...");
        if (this.rainContainer) {
            this.createRain();
            console.log(`Rain created with ${this.dropCount} drops.`);
        } else {
            console.error("Error: #rain-container not found in HTML!");
        }
    },

    createRain: function() {
        for (let i = 0; i < this.dropCount; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain-drop');

            // 1. Позиция (вся ширина экрана)
            drop.style.left = Math.random() * 100 + 'vw';
            
            // 2. Скорость падения (быстрее/медленнее)
            const duration = Math.random() * 0.5 + 0.5; // от 0.5 до 1.0 сек
            drop.style.animationDuration = duration + 's';

            // 3. Задержка (чтобы падали хаотично)
            drop.style.animationDelay = Math.random() * 2 + 's';

            // 4. Прозрачность (делаем ярче: от 0.4 до 1.0)
            drop.style.opacity = Math.random() * 0.6 + 0.4;

            this.rainContainer.appendChild(drop);
        }
    }
};

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    WorldSystem.init();
});
