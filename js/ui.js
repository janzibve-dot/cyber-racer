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
            title: "CYBER RACER",
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
        buttons: document.querySelectorAll('.cyber-btn')
    },

    // Звуковые эффекты
    sounds: {
        hover: new Audio('assets/sounds/hover.mp3'),
        click: new Audio('assets/sounds/click.mp3')
    },

    init: function() {
        this.sounds.hover.volume = 0.3;
        this.sounds.click.volume = 0.5;

        // КНОПКА СТАРТ
        this.elements.startBtn.addEventListener('click', () => {
            // Играем обрезанный звук двигателя
            this.playEngineSound(); 
            
            // Задержка 2 секунды (ровно столько, сколько играет звук), потом старт
            setTimeout(() => this.startGame(), 2000);
        });

        // КНОПКА ЯЗЫКА (обычный клик, можно использовать звук hover или короткий клик)
        this.elements.langBtn.addEventListener('click', () => {
            this.playSound('hover'); // Для смены языка лучше легкий звук
            this.toggleLang();
        });

        // НАВЕДЕНИЕ (HOVER)
        this.elements.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    },

    // Обычная функция для коротких звуков
    playSound: function(soundName) {
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => console.warn(e));
    },

    // Специальная функция для звука двигателя (твоя просьба)
    playEngineSound: function() {
        const sound = this.sounds.click;
        
        // 1. Пропускаем первую секунду (начало)
        sound.currentTime = 1.0; 
        
        // 2. Запускаем звук
        sound.play().catch(e => console.warn(e));

        // 3. Через 2 секунды останавливаем звук (удаляем остальное)
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0; // Сброс
        }, 2000); // 2000 миллисекунд = 2 секунды
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

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
