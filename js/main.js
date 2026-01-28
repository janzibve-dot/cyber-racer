const WorldSystem = {
    rainContainer: document.getElementById('rain-container'),
    dropCount: 200, // Увеличили количество капель до 200

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

            // 1. Позиция
            drop.style.left = Math.random() * 100 + 'vw';
            
            // 2. Скорость (очень быстрая)
            const duration = Math.random() * 0.4 + 0.4; 
            drop.style.animationDuration = duration + 's';

            // 3. Задержка
            drop.style.animationDelay = Math.random() * 2 + 's';

            // 4. Прозрачность (почти непрозрачные для видимости)
            drop.style.opacity = Math.random() * 0.5 + 0.5;

            this.rainContainer.appendChild(drop);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WorldSystem.init();
});
