// js/game/World.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { City } from './City.js';
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Состояние игры
        this.isPaused = false;
        this.currentSpeed = CONFIG.speed.start;
        this.targetSpeed = CONFIG.speed.max;
        
        // Для вращения головой (Мышь)
        this.mouseX = 0;
        this.mouseY = 0;

        this.initScene();
        this.city = new City(this.scene);
        this.clock = new THREE.Clock();

        // Обработчики событий
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        // Туман скрывает конец дороги, создавая "бесконечность"
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 20, 150);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Реалистичная камера
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            this.width / this.height,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        // Ставим камеру в точку старта
        this.camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);

        // Свет (хотя для Wireframe он не особо нужен, но пусть будет для объема дороги)
        const ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(ambient);
    }

    onMouseMove(event) {
        if (this.isPaused) return;
        // Вычисляем положение мыши от центра экрана (-1 до +1)
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onKeyDown(event) {
        // Пауза по ESC
        if (event.code === 'Escape') {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                console.log("GAME PAUSED");
                // Можно показать меню паузы через HTML здесь
            } else {
                console.log("GAME RESUMED");
                this.clock.getDelta(); // Сброс таймера, чтобы не было скачка
            }
        }
    }

    updateCamera() {
        // Эффект "поворота головы"
        // Камера смотрит вперед (0, 2.5, -100), но смещается от мыши
        const lookAtX = this.mouseX * 20; // Поворот влево-вправо
        const lookAtY = 2.5 + (this.mouseY * 20); // Взгляд вверх-вниз
        
        this.camera.lookAt(lookAtX, lookAtY, -100);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPaused) return; // Если пауза, не обновляем логику

        const dt = this.clock.getDelta();
        
        // Разгон
        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        // Обновляем мир
        if (this.city) this.city.update(this.currentSpeed, dt);
        
        // Обновляем поворот головы
        this.updateCamera();

        this.renderer.render(this.scene, this.camera);
    }
}
