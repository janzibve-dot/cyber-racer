import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { City } from './City.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 1. Создаем Сцену (Мир)
        this.scene = new THREE.Scene();
        // Темный туман, скрывающий горизонт (цвет как в твоем CSS --screen-bg)
        this.scene.fog = new THREE.FogExp2(0x050a10, 0.0035);
        this.scene.background = new THREE.Color(0x050a10);

        // 2. Камера (Глаза игрока)
        // FOV 60, соотношение сторон, видит от 0.1 до 1000 метров
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        // Ставим камеру по центру, чуть выше (y=3) и сзади (z=15)
        this.camera.position.set(0, 3, 15);
        this.camera.lookAt(0, 0, -50); // Смотрим вдаль

        // 3. Рендерер (Художник)
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio); // Для четкости на мобильных
        this.container.appendChild(this.renderer.domElement);

        // 4. Освещение
        this.setupLights();

        // 5. Создаем Окружение (Трасса и Город)
        this.city = new City(this.scene);

        // Таймер для анимации
        this.clock = new THREE.Clock();

        // Слушаем изменение размера окна
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Запускаем бесконечный цикл
        this.animate();
    }

    setupLights() {
        // Фоновый свет (чтобы не было полной тьмы)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Направленный свет (как луна или прожектор сити)
        const dirLight = new THREE.DirectionalLight(0xff00ff, 0.8); // Маджента
        dirLight.position.set(20, 50, 20);
        this.scene.add(dirLight);
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta(); // Время между кадрами

        // Обновляем город (движение дороги)
        if (this.city) this.city.update(dt);

        this.renderer.render(this.scene, this.camera);
    }
}
