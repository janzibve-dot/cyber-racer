import * as THREE from 'three';
import { City } from './City.js';
import { Car } from './Car.js';
import { Obstacles } from './Obstacles.js'; 
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId, loadingManager) {
        this.container = document.getElementById(containerId);
        this.loadingManager = loadingManager;

        this.uiDist = document.getElementById('dist-counter');
        this.uiSpeed = document.getElementById('speed-counter');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.isPaused = true;
        this.gameStarted = false;

        this.currentSpeed = 0; 
        this.targetSpeed = CONFIG.speed.max;
        this.totalDistance = 0;

        // ПРАВКА: Безопасное подключение FPS Stats
        // Проверяем, загрузилась ли библиотека
        if (typeof Stats !== 'undefined') {
            this.stats = new Stats();
            this.stats.showPanel(0); // 0: fps, 1: ms
            this.stats.dom.style.cssText = 'position:absolute;top:0px;right:0px;z-index:100;';
            document.body.appendChild(this.stats.dom);
        } else {
            console.warn('Stats.js not loaded via CDN');
            this.stats = { begin: () => {}, end: () => {} }; // Заглушка
        }

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene, this.loadingManager);
        this.obstacles = new Obstacles(this.scene); 
        
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.gameStarted) {
                this.isPaused = !this.isPaused;
                if (!this.isPaused) this.clock.getDelta(); 
            }
        });

        this.animate();
    }

    start() {
        console.log("Game World Started");
        this.gameStarted = true;
        this.isPaused = false;
        this.currentSpeed = CONFIG.speed.start;
        this.clock.start();
        if (window.stopRain) window.stopRain();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 10, 120);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 1000);
        
        // Камера настроена для агрессивной езды (низко и близко)
        this.camera.position.set(0, 2.0, 4.0);

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
        
        if (this.stats) this.stats.begin();

        // Меню (Игра на паузе, но мир живет)
        if (this.isPaused && !this.gameStarted) {
            // Двигаем город медленно для фона
            if(this.city) this.city.update(20, 0.016); 
            // Вращаем препятствия для красоты, если они видны
            if(this.obstacles) this.obstacles.update(20, 0.016);
            
            this.renderer.render(this.scene, this.camera);
            if (this.stats) this.stats.end();
            return;
        }

        // Пауза (Escape)
        if (this.isPaused) { 
            if (this.stats) this.stats.end(); 
            return; 
        }

        const dt = this.clock.getDelta();

        // Ускорение
        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        // Обновление всех систем
        if (this.city) this.city.update(this.currentSpeed, dt);
        if (this.car) this.car.update(this.currentSpeed, dt);
        if (this.obstacles) this.obstacles.update(this.currentSpeed, dt);

        this.updateHUD(dt); 
        
        // Камера следит за машиной
        const carX = this.car.mesh.position.x;
        const lookX = carX * 0.7; 
        
        // Плавное слежение по оси X
        this.camera.position.x += (carX * 0.6 - this.camera.position.x) * dt * 3;
        this.camera.lookAt(lookX, 1.5, -50);

        this.renderer.render(this.scene, this.camera);
        
        if (this.stats) this.stats.end();
    }
}
