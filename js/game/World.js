import * as THREE from 'three';
import { City } from './City.js';
import { Car } from './Car.js';
import { Obstacles } from './Obstacles.js'; // ПРАВКА: Импорт вернули
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.uiDist = document.getElementById('dist-counter');
        this.uiSpeed = document.getElementById('speed-counter');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isPaused = false;
        this.currentSpeed = CONFIG.speed.start;
        this.targetSpeed = CONFIG.speed.max;
        this.totalDistance = 0;

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene);
        this.obstacles = new Obstacles(this.scene); // ПРАВКА: Создаем препятствия
        
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.isPaused = !this.isPaused;
                if (!this.isPaused) this.clock.getDelta(); 
            }
        });

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 20, 150);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 1000);
        // Камера ближе и ниже для маленькой машины
        this.camera.position.set(0, 3, 6.5);

        const ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(ambient);
    }

    updateHUD(dt) {
        this.totalDistance += (this.currentSpeed * dt) / 10; 
        if (this.uiDist) this.uiDist.textContent = Math.floor(this.totalDistance).toString().padStart(4, '0');
        if (this.uiSpeed) this.uiSpeed.textContent = Math.floor(this.currentSpeed);
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
        if (this.isPaused) return;

        const dt = this.clock.getDelta();

        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        if (this.city) this.city.update(this.currentSpeed, dt);
        if (this.car) this.car.update(this.currentSpeed, dt);
        if (this.obstacles) this.obstacles.update(this.currentSpeed, dt); // ПРАВКА: Обновляем препятствия

        this.updateHUD(dt); 
        
        // ПРАВКА: Камера теперь следит за машиной по оси X
        // Используем lerp для плавности
        const carX = this.car.mesh.position.x;
        const lookX = carX * 0.8; // Камера смотрит чуть впереди машины
        
        // Смещаем саму камеру немного за машиной
        this.camera.position.x += (carX * 0.5 - this.camera.position.x) * dt * 2;
        this.camera.lookAt(lookX, 1.5, -50);

        this.renderer.render(this.scene, this.camera);
    }
}
