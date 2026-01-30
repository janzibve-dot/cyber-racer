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
        this.gameMode = 'endless';

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene);
        this.obstacles = new Obstacles(this.scene);
        this.clock = new THREE.Clock();

        this.mouseX = 0;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        });

        // ПАУЗА НА ESCAPE
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && !document.getElementById('main-menu').classList.contains('hidden') === false) {
                this.isPaused = !this.isPaused;
                console.log("Pause:", this.isPaused);
            }
        });

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02050a);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 5, 12);
        
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    }

    start(mode) {
        this.gameMode = mode;
        this.isPaused = false;
        
        // ОСТАНОВКА ДОЖДЯ (вызываем функцию из RainSystem в main.js через глобальный объект)
        if (window.stopRain) window.stopRain();

        this.totalDistance = 0;
        this.laps = 0;
        this.currentSpeed = CONFIG.speed.start;
        this.clock.start();
    }

    updateHUD(dt) {
        const prevDist = this.totalDistance;
        this.totalDistance += (this.currentSpeed * dt) / 10;
        if (Math.floor(this.totalDistance / 1000) > Math.floor(prevDist / 1000)) this.laps++;
        if (this.uiDist) this.uiDist.textContent = Math.floor(this.totalDistance).toString().padStart(4, '0');
        if (this.uiSpeed) this.uiSpeed.textContent = Math.floor(this.currentSpeed);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isPaused) return;

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        let targetSpeed = CONFIG.speed.max;
        if (this.car.isNitro) targetSpeed *= 1.8;
        if (this.car.isBraking) targetSpeed *= 0.3;

        this.currentSpeed += (targetSpeed - this.currentSpeed) * dt * 2;

        this.city.update(this.currentSpeed, dt);
        this.car.update(this.currentSpeed, dt);
        this.obstacles.update(this.currentSpeed, dt);
        this.updateHUD(dt);

        this.camera.lookAt(this.car.mesh.position.x * 0.5, 2, -50);
        this.renderer.render(this.scene, this.camera);
    }
}
