const UI = {
    lang: 'ru',
    isMuted: false,

    texts: {
        en: { start: "START GAME", langBtn: "LANG: EN", move: "MOVEMENT", look: "LOOK / STEER" },
        ru: { start: "НАЧАТЬ ИГРУ", langBtn: "ЯЗЫК: RU", move: "ДВИЖЕНИЕ", look: "ОБЗОР / РУЛЬ" }
    },

    elements: {
        startBtn: document.getElementById('btn-start'),
        langBtn: document.getElementById('btn-lang'),
        muteBtn: document.getElementById('btn-mute'),
        muteIcon: document.querySelector('#btn-mute i'),
        menu: document.getElementById('main-menu'),
        buttons: document.querySelectorAll('.mech-btn'),
        iconBoxes: document.querySelectorAll('.icon-box'),
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

        this.updateTexts();

        // 1. Кнопка СТАРТ (только здесь звук мотора)
        this.elements.startBtn.addEventListener('click', () => {
            this.playEngineSound(); 
            setTimeout(() => this.startGame(), 2000);
        });

        // 2. Кнопка ЯЗЫК (здесь обычный клик/ховер звук)
        this.elements.langBtn.addEventListener('click', () => {
            // ИСПРАВЛЕНИЕ: Используем легкий звук hover вместо тяжелого мотора
            this.playSound('hover'); 
            this.toggleLang();
        });

        // Кнопка MUTE
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());

        // Звуки наведения
        this.elements.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => this.playSound('hover'));
        });
        this.elements.iconBoxes.forEach(icon => {
            icon.addEventListener('mouseenter', () => this.playSound('hover'));
        });
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.elements.muteIcon.className = 'fas fa-volume-mute';
            this.elements.muteIcon.style.color = '#555';
            this.elements.muteIcon.style.textShadow = 'none';
        } else {
            this.elements.muteIcon.className = 'fas fa-volume-up';
            this.elements.muteIcon.style.color = '#ff00ff';
            this.elements.muteIcon.style.textShadow = '0 0 10px #ff00ff';
            this.playSound('hover');
        }
    },

    playSound: function(soundName) {
        if (this.isMuted) return;
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => {});
    },

    // Функция только для старта двигателя
    playEngineSound: function() {
        if (this.isMuted) return;
        const sound = this.sounds.click; // Твой тяжелый файл
        sound.currentTime = 1.0; 
        sound.play().catch(e => {});
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
        this.elements.startBtn.querySelector('span').textContent = t.start;
        this.elements.langBtn.querySelector('span').textContent = t.langBtn;
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
