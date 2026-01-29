const UI = {
    lang: 'ru',
    isMuted: false,

    texts: {
        en: { start: "START GAME", langBtn: "LANG: EN", move: "MOVEMENT", look: "LOOK / STEER" },
        ru: { start: "НАЧАТЬ ГОНКУ", langBtn: "ЯЗЫК: RU", move: "ДВИЖЕНИЕ", look: "ОБЗОР / РУЛЬ" }
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
        descLook: document.getElementById('desc-look'),
        hud: document.getElementById('hud-panel') // Ссылка на HUD
    },

    sounds: {
        hover: new Audio('assets/sounds/hover.mp3'),
        click: new Audio('assets/sounds/click.mp3') // Тяжелый звук
    },

    init: function() {
        // Настройка громкости
        this.sounds.hover.volume = 0.3;
        this.sounds.click.volume = 0.5;

        this.updateTexts();

        // 1. Кнопка СТАРТ
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                this.playEngineSound(); 
                // Небольшая задержка перед стартом для звука
                setTimeout(() => this.startGame(), 1000);
            });
        }

        // 2. Кнопка ЯЗЫК
        if (this.elements.langBtn) {
            this.elements.langBtn.addEventListener('click', () => {
                this.playSound('hover'); 
                this.toggleLang();
            });
        }

        // 3. Кнопка MUTE
        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // 4. Звуки наведения (Hover)
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
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio blocked:", e));
        }
    },

    playEngineSound: function() {
        if (this.isMuted) return;
        const sound = this.sounds.click; 
        if (sound) {
            sound.currentTime = 0; 
            sound.play().catch(e => {});
        }
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
        // Проверка на существование элементов (на случай изменений HTML)
        if (this.elements.descLook) this.elements.descLook.textContent = t.look;
    },

    startGame: function() {
        // Скрываем меню
        this.elements.menu.classList.add('hidden');
        
        // Показываем HUD (Спидометр)
        if (this.elements.hud) {
            this.elements.hud.classList.remove('hidden');
        }

        // Запускаем мир (через глобальный объект из main.js)
        if (window.GameApp && window.GameApp.init) {
            window.GameApp.init();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
