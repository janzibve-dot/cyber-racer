const UI = {
    lang: 'ru',
    isMuted: false,

    texts: {
        en: { start: "START RACE", langBtn: "LANG: EN", move: "STEER / MOUSE", look: "PAUSE / ESC" },
        ru: { start: "НАЧАТЬ ГОНКУ", langBtn: "ЯЗЫК: RU", move: "РУЛИТЬ / ОБЗОР", look: "ПАУЗА / ESC" }
    },

    elements: {
        startBtn: document.getElementById('btn-start'),
        langBtn: document.getElementById('btn-lang'),
        muteBtn: document.getElementById('btn-mute'),
        muteIcon: document.querySelector('#btn-mute i'),
        menu: document.getElementById('main-menu'),
        hud: document.getElementById('hud-panel'), // Добавил HUD
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
        this.sounds.click.volume = 0.6;

        this.updateTexts();

        // КНОПКА СТАРТ (РОВНО 2.5 СЕКУНДЫ)
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                // 1. Сразу звук
                this.playEngineSound();
                
                // 2. Анимация нажатия
                this.elements.startBtn.style.color = '#ffea00';
                this.elements.startBtn.style.borderColor = '#ffea00';
                
                // 3. Ждем 2500мс
                setTimeout(() => {
                    this.startGame();
                }, 2500);
            });
        }

        if (this.elements.langBtn) {
            this.elements.langBtn.addEventListener('click', () => { this.playSound('hover'); this.toggleLang(); });
        }
        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        }

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
        if (sound) { sound.currentTime = 0; sound.play().catch(e => {}); }
    },

    playEngineSound: function() {
        if (this.isMuted) return;
        const sound = this.sounds.click; 
        if (sound) { sound.currentTime = 0; sound.play().catch(e => {}); }
    },

    toggleLang: function() {
        this.lang = this.lang === 'en' ? 'ru' : 'en';
        this.updateTexts();
    },

    updateTexts: function() {
        const t = this.texts[this.lang];
        if (this.elements.startBtn) this.elements.startBtn.querySelector('span').textContent = t.start;
        if (this.elements.langBtn) this.elements.langBtn.querySelector('span').textContent = t.langBtn;
        if (this.elements.descMove) this.elements.descMove.textContent = t.move;
        if (this.elements.descLook) this.elements.descLook.textContent = t.look;
    },

    startGame: function() {
        // Скрываем меню
        this.elements.menu.classList.add('hidden');
        // Показываем HUD
        if (this.elements.hud) this.elements.hud.classList.remove('hidden');
        // Запускаем мир
        if (window.GameApp && window.GameApp.init) {
            window.GameApp.init();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
