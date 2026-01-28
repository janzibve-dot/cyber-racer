const UI = {
    // Устанавливаем русский язык по умолчанию
    lang: 'ru',
    
    texts: {
        en: {
            title: "CYBER RACER",
            start: "START RACE",
            langBtn: "LANG: EN",
            credits: "BUILD v0.2 | SYSTEM READY",
            // Новые переводы для управления
            move: "MOVEMENT",
            look: "LOOK / STEER"
        },
        ru: {
            title: "CYBER RACER",
            start: "НАЧАТЬ ГОНКУ",
            langBtn: "ЯЗЫК: RU",
            credits: "ВЕРСИЯ v0.2 | СИСТЕМА ГОТОВА",
            // Новые переводы для управления
            move: "ДВИЖЕНИЕ",
            look: "ОБЗОР / РУЛЬ"
        }
    },

    elements: {
        title: document.querySelector('.cyber-glitch'),
        startBtn: document.getElementById('btn-start'),
        langBtn: document.getElementById('btn-lang'),
        credits: document.querySelector('.credits'),
        menu: document.getElementById('main-menu'),
        buttons: document.querySelectorAll('.cyber-btn'),
        // Новые элементы для перевода блока управления
        descMove: document.getElementById('desc-move'),
        descLook: document.getElementById('desc-look')
    },

    sounds: {
        hover: new Audio('assets/sounds/hover.mp3'),
        click: new Audio('assets/sounds/click.mp3')
    },

    init: function() {
        this.sounds.hover.volume = 0.3;
        this.sounds.click.volume = 0.5;

        // Принудительно обновляем текст при старте, чтобы убедиться, что всё совпадает
        this.updateTexts();

        this.elements.startBtn.addEventListener('click', () => {
            this.playEngineSound(); 
            setTimeout(() => this.startGame(), 2000);
        });

        this.elements.langBtn.addEventListener('click', () => {
            this.playSound('hover'); 
            this.toggleLang();
        });

        this.elements.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    },

    playSound: function(soundName) {
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => console.warn(e));
    },

    playEngineSound: function() {
        const sound = this.sounds.click;
        sound.currentTime = 1.0; 
        sound.play().catch(e => console.warn(e));
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 2000); 
    },

    toggleLang: function() {
        this.lang = this.lang === 'en' ? 'ru' : 'en';
        this.updateTexts();
    },

    updateTexts: function() {
        const t = this.texts[this.lang];
        
        // Обновляем основные тексты
        this.elements.title.textContent = t.title;
        this.elements.startBtn.textContent = t.start;
        this.elements.langBtn.textContent = t.langBtn;
        this.elements.credits.textContent = t.credits;
        
        // Обновляем блок управления
        this.elements.descMove.textContent = t.move;
        this.elements.descLook.textContent = t.look;
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
