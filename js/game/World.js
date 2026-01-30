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
        this.gameMode = 'endless'; // 'endless' или 'laps'

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene);
        this.obstacles = new Obstacles(this.scene);
        this.clock = new THREE.Clock();

        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02050a);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 5, 15);
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    }

    start(mode) {
        this.gameMode = mode;
        this.isPaused = false;
        this.totalDistance = 0;
        this.laps = 0;
        this.currentSpeed = CONFIG.speed.start;
    }

    updateHUD(dt) {
        const prevDist = this.totalDistance;
        this.totalDistance += (this.currentSpeed * dt) / 10;
        
        // Система кругов (каждые 1000 метров - новый круг)
        if (Math.floor(this.totalDistance / 1000) > Math.floor(prevDist / 1000)) {
            this.laps++;
            console.log("Lap completed:", this.laps);
        }

        if (this.uiDist) this.uiDist.textContent = Math.floor(this.totalDistance).toString().padStart(4, '0');
        if (this.uiSpeed) this.uiSpeed.textContent = Math.floor(this.currentSpeed);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isPaused) return;

        const dt = this.clock.getDelta();
        let targetSpeed = CONFIG.speed.max;
        if (this.car.isNitro) targetSpeed *= 1.5;
        if (this.car.isBraking) targetSpeed *= 0.3;

        this.currentSpeed += (targetSpeed - this.currentSpeed) * dt * 2;

        this.city.update(this.currentSpeed, dt);
        this.car.update(this.currentSpeed, dt);
        this.obstacles.update(this.currentSpeed, dt);
        this.updateHUD(dt);

        this.camera.lookAt(0, 2, -50);
        this.renderer.render(this.scene, this.camera);
    }
}
