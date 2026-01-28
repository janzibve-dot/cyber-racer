const UI = {
    // Словарь переводов
    lang: 'en',
    texts: {
        en: {
            title: "CYBER RACER",
            start: "START RACE",
            langBtn: "LANG: EN",
            credits: "BUILD v0.1 | SYSTEM READY"
        },
        ru: {
            title: "CYBER RACER", // Название игры часто оставляют на английском для стиля
            start: "НАЧАТЬ ГОНКУ",
            langBtn: "ЯЗЫК: RU",
            credits: "ВЕРСИЯ v0.1 | СИСТЕМА ГОТОВА"
        }
    },

    // Элементы DOM
    elements: {
        title: document.querySelector('.cyber-glitch'),
        startBtn: document.getElementById('btn-start'),
        langBtn: document.getElementById('btn-lang'),
        credits: document.querySelector('.credits'),
        menu: document.getElementById('main-menu'),
        buttons: document.querySelectorAll('.cyber-btn') // Выбираем все кнопки сразу
    },

    // Звуковые эффекты
    sounds: {
        hover: new Audio('assets/sounds/hover.mp3'),
        click: new Audio('assets/sounds/click.mp3')
    },

    init: function() {
        // Настройка громкости (чтобы не оглушить игрока)
        this.sounds.hover.volume = 0.3; 
        this.sounds.click.volume = 0.5;

        // Навешиваем события клика
        this.elements.startBtn.addEventListener('click', () => {
            this.playSound('click');
            // Небольшая задержка перед стартом, чтобы звук успел проиграться
            setTimeout(() => this.startGame(), 500);
        });

        this.elements.langBtn.addEventListener('click', () => {
            this.playSound('click');
            this.toggleLang();
        });

        // Навешиваем события наведения (hover) на ВСЕ кнопки
        this.elements.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    },

    playSound: function(soundName) {
        // Сбрасываем время звука на 0, чтобы при быстром наведении он играл заново
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(error => {
            // Браузеры иногда блокируют звук, если пользователь еще ничего не нажал
            console.warn("Audio play blocked by browser policy until interaction:", error);
        });
    },

    toggleLang: function() {
        this.lang = this.lang === 'en' ? 'ru' : 'en';
        this.updateTexts();
    },

    updateTexts: function() {
        const t = this.texts[this.lang];
        this.elements.title.textContent = t.title;
        this.elements.startBtn.textContent = t.start;
        this.elements.langBtn.textContent = t.langBtn;
        this.elements.credits.textContent = t.credits;
    },

    startGame: function() {
        this.elements.menu.classList.add('hidden');
        console.log("Game State: Started");
        if (window.GameApp && window.GameApp.init) {
            window.GameApp.init();
        }
    }
};

// Запуск UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
