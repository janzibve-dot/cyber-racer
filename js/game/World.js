// js/game/World.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { City } from './City.js';
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Переменные скорости
        this.currentSpeed = CONFIG.speed.start;
        this.targetSpeed = CONFIG.speed.max;

        // Инициализация
        this.initScene();
        this.initLights();
        
        this.city = new City(this.scene);

        this.clock = new THREE.Clock();
        window.addEventListener('resize', () => this.onResize());
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.003);
        this.scene.background = new THREE.Color(CONFIG.colors.fog);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Включаем поддержку теней (на будущее)
        this.renderer.shadowMap.enabled = true; 
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 1000);
        this.camera.position.set(CONFIG.camera.x, CONFIG.camera.y, CONFIG.camera.z);
    }

    initLights() {
        // 1. HemisphereLight (Небо + Земля)
        // Первый цвет - небо (фиолетовый), Второй - земля (черный)
        const hemiLight = new THREE.HemisphereLight(CONFIG.colors.sky, CONFIG.colors.ground, 1); 
        this.scene.add(hemiLight);

        // 2. Направленный свет (Имитация луны/прожектора)
        const dirLight = new THREE.DirectionalLight(CONFIG.colors.neonPink, 1.5);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true; // Пусть отбрасывает тени
        this.scene.add(dirLight);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    // Линейная интерполяция (Плавный переход от a к b)
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();

        // 1. Плавный разгон (Lerp)
        // Каждый кадр мы приближаем текущую скорость к целевой на маленький шаг
        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        // 2. Обновляем город (передаем текущую скорость)
        if (this.city) this.city.update(this.currentSpeed, dt);

        this.renderer.render(this.scene, this.camera);
    }
}
