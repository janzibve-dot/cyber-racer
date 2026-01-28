
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
            title: "КИБЕР ГОНКИ",
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
        menu: document.getElementById('main-menu')
    },

    init: function() {
        // Навешиваем события
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.langBtn.addEventListener('click', () => this.toggleLang());
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
        // Скрываем меню
        this.elements.menu.classList.add('hidden');
        console.log("Game State: Started");
        // Запускаем инициализацию игры из main.js
        if (window.GameApp && window.GameApp.init) {
            window.GameApp.init();
        }
    }
};

// Запуск UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
