import * as THREE from 'three';
import { City } from './City.js';
import { Car } from './Car.js';
import { Obstacles } from './Obstacles.js';
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.uiDist = document.getElementById('dist-counter');
        this.uiSpeed = document.getElementById('speed-counter');
        this.isPaused = true;
        this.currentSpeed = 0;
        this.totalDistance = 0;
        this.laps = 0;

        // Для эффекта Zoom при торможении
        this.baseFov = CONFIG.camera.fov;
        this.targetFov = this.baseFov;

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene);
        this.obstacles = new Obstacles(this.scene);
        this.clock = new THREE.Clock();

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') this.isPaused = !this.isPaused;
        });

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02050a);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth/window.innerHeight, 0.1, 2000);
        
        // ПРАВКА: Камера еще ближе и ниже (было 0, 4, 9 -> стало 0, 3, 6.5)
        // Это создает очень агрессивный вид "с хвоста"
        this.camera.position.set(0, 3, 6.5);
        
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    }

    start(mode) {
        this.isPaused = false;
        if (window.stopRain) window.stopRain();
        this.totalDistance = 0;
        this.currentSpeed = CONFIG.speed.start;
        this.clock.start();
    }

    updateHUD(dt) {
        this.totalDistance += (this.currentSpeed * dt) / 10;
        if (this.uiDist) this.uiDist.textContent = Math.floor(this.totalDistance).toString().padStart(4, '0');
        if (this.uiSpeed) this.uiSpeed.textContent = Math.floor(this.currentSpeed);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isPaused) return;

        const dt = this.clock.getDelta();
        let targetSpeed = CONFIG.speed.max;
        if (this.car.isNitro) targetSpeed *= 1.8;
        if (this.car.isBraking) targetSpeed *= 0.3;

        this.currentSpeed += (targetSpeed - this.currentSpeed) * dt * 2;
        
        // ПРАВКА: Логика динамического FOV (Зум при торможении)
        // Если тормозим - FOV 60 (ближе), если едем - FOV 75 (стандарт)
        const desiredFov = this.car.isBraking ? 55 : this.baseFov;
        // Плавный переход FOV
        this.camera.fov += (desiredFov - this.camera.fov) * dt * 5; 
        this.camera.updateProjectionMatrix(); // Обязательно обновляем матрицу камеры

        this.city.update(this.currentSpeed, dt);
        this.car.update(this.currentSpeed, dt);
        this.obstacles.update(this.currentSpeed, dt);
        this.updateHUD(dt);

        this.camera.lookAt(this.car.mesh.position.x * 0.5, 1.5, -50);
        this.renderer.render(this.scene, this.camera);
    }
}
