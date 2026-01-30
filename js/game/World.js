import * as THREE from 'three';
import { City } from './City.js';
import { Car } from './Car.js';
import { Obstacles } from './Obstacles.js'; 
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId, loadingManager) {
        this.container = document.getElementById(containerId);
        this.loadingManager = loadingManager; // Сохраняем менеджер

        this.uiDist = document.getElementById('dist-counter');
        this.uiSpeed = document.getElementById('speed-counter');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.isPaused = true; // Игра стоит на паузе при загрузке
        this.gameStarted = false; // Флаг, что кнопка Start нажата

        this.currentSpeed = 0; // Скорость 0, пока в меню
        this.targetSpeed = CONFIG.speed.max;
        this.totalDistance = 0;

        // FPS Stats
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps
        this.stats.dom.style.cssText = 'position:absolute;top:0px;left:0px;z-index:100;';
        document.body.appendChild(this.stats.dom);

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene, this.loadingManager); // Передаем менеджер в машину
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

    // ИСПРАВЛЕНИЕ: Метод старта, который вызывает UI
    start() {
        console.log("Game World Started");
        this.gameStarted = true;
        this.isPaused = false;
        this.currentSpeed = CONFIG.speed.start;
        this.clock.start();
        if (window.stopRain) window.stopRain(); // Останавливаем дождь из меню
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 10, 120); // Плотный туман

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 1000);
        
        // ПРАВКА: Камера (0, 2.0, 4.0) — Очень близко
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
        
        this.stats.begin(); // Начало замера FPS

        // Если игра на паузе или не начата — рендерим статичный кадр (фон меню)
        if (this.isPaused && !this.gameStarted) {
            // Можно добавить медленное вращение камеры вокруг города для красоты в меню
            if(this.city) this.city.update(10, 0.016); 
            this.renderer.render(this.scene, this.camera);
            this.stats.end();
            return;
        }

        if (this.isPaused) { this.stats.end(); return; }

        const dt = this.clock.getDelta();

        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        if (this.city) this.city.update(this.currentSpeed, dt);
        if (this.car) this.car.update(this.currentSpeed, dt);
        if (this.obstacles) this.obstacles.update(this.currentSpeed, dt); 

        this.updateHUD(dt); 
        
        // Слежение камеры
        const carX = this.car.mesh.position.x;
        const lookX = carX * 0.7; 
        this.camera.position.x += (carX * 0.6 - this.camera.position.x) * dt * 3;
        this.camera.lookAt(lookX, 1.5, -50);

        this.renderer.render(this.scene, this.camera);
        
        this.stats.end(); // Конец замера FPS
    }
}
