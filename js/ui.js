const UI = {
    lang: 'ru',
    
    texts: {
        en: {
            title: "CYBER RACER",
            start: "START RACE",
            langBtn: "LANG: EN",
            credits: "BUILD v0.2 | SYSTEM READY",
            move: "MOVEMENT",
            look: "LOOK / STEER"
        },
        ru: {
            title: "CYBER RACER",
            start: "НАЧАТЬ ГОНКУ",
            langBtn: "ЯЗЫК: RU",
            credits: "ВЕРСИЯ v0.2 | СИСТЕМА ГОТОВА",
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
        descMove: document.getElementById('desc-move'),
        descLook: document.getElementById('desc-look')
    },

    sounds: {
        hover: new Audio('assets/sounds/hover.mp3'),
        click: new Audio('assets/sounds/click.mp3')
    },

    audioUnlocked: false,

    init: function() {
        this.sounds.hover.volume = 0.3;
        this.sounds.click.volume = 0.5;

        // Пытаемся разблокировать аудио при первом же движении мыши по странице
        document.body.addEventListener('mousemove', () => this.unlockAudioContext(), { once: true });
        document.body.addEventListener('click', () => this.unlockAudioContext(), { once: true });

        this.updateTexts();

        // КНОПКА СТАРТ
        this.elements.startBtn.addEventListener('click', () => {
            this.playEngineSound(); 
            setTimeout(() => this.startGame(), 2000);
        });

        // КНОПКА ЯЗЫКА
        this.elements.langBtn.addEventListener('click', () => {
            this.playSound('hover'); 
            this.toggleLang();
        });

        // ЗВУК НАВЕДЕНИЯ
        this.elements.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    },

    // Трюк для обхода блокировки браузера
    unlockAudioContext: function() {
        if (this.audioUnlocked) return;
        
        // Запускаем и сразу ставим на паузу пустой звук, чтобы браузер дал добро
        const silent = this.sounds.hover;
        silent.play().then(() => {
            silent.pause();
            silent.currentTime = 0;
            this.audioUnlocked = true;
            console.log("Audio System Unlocked");
        }).catch((e) => {
            // Если всё еще нельзя, ждем клика
        });
    },

    playSound: function(soundName) {
        if (!this.audioUnlocked) return; // Не играем, если браузер еще блокирует
        
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Audio blocked:", e));
    },

    playEngineSound: function() {
        const sound = this.sounds.click;
        sound.currentTime = 1.0; // Пропуск 1 сек
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
        this.elements.title.textContent = t.title;
        this.elements.startBtn.textContent = t.start;
        this.elements.langBtn.textContent = t.langBtn;
        this.elements.credits.textContent = t.credits;
        this.elements.descMove.textContent = t.move;
        this.elements.descLook.textContent = t.look;
    },

    startGame: function() {
        this.elements.menu.classList.add('hidden');
        if (window.GameApp && window.GameApp.init) {
            window.GameApp.init();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
