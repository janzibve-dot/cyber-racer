import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { City } from './City.js';
import { Car } from './Car.js'; // ИМПОРТ МАШИНЫ
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
        this.mouseX = 0;
        this.mouseY = 0;

        this.initScene();
        this.city = new City(this.scene);
        this.car = new Car(this.scene); // СОЗДАНИЕ МАШИНЫ
        
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 20, 150);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 1000);
        this.camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);

        const ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(ambient);
    }

    onMouseMove(event) {
        if (this.isPaused) return;
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) this.clock.getDelta(); 
        }
    }

    updateCamera(time) {
        const lookX = this.mouseX * 30;
        const lookY = 2.5 + (this.mouseY * 20);
        this.camera.lookAt(lookX, lookY, -100);

        const bobFreq = 15; 
        const bobAmp = 0.15 * (this.currentSpeed / CONFIG.speed.max);
        this.camera.position.y = CONFIG.camera.position.y + Math.sin(time * bobFreq) * bobAmp;
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
        const time = this.clock.getElapsedTime();

        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        if (this.city) this.city.update(this.currentSpeed, dt);
        if (this.car) this.car.update(this.currentSpeed, dt); // ОБНОВЛЕНИЕ МАШИНЫ

        this.updateHUD(dt);
        this.updateCamera(time);

        this.renderer.render(this.scene, this.camera);
    }
}
