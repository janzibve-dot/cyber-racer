import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { City } from './City.js';
import { Car } from './Car.js';
import { Obstacles } from './Obstacles.js'; 
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
        this.initPostProcessing();

        this.city = new City(this.scene);
        this.car = new Car(this.scene);
        this.obstacles = new Obstacles(this.scene);
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.sky, 100, 1500); 

        this.renderer = new THREE.WebGLRenderer({ antialias: false }); 
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, this.width / this.height, 0.1, 2000);
        this.camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);
        
        const ambient = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambient);
    }

    initPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.2;
        bloomPass.strength = 1.2; 
        bloomPass.radius = 0.5;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
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

    updateCamera(time, dt) {
        const lookX = this.mouseX * 30;
        const lookY = 2.5 + (this.mouseY * 20);
        this.camera.lookAt(lookX, lookY, -100);
        
        const bobFreq = (this.car && this.car.isNitro) ? 25 : 15; 
        const bobAmp = 0.15 * (this.currentSpeed / CONFIG.speed.max);
        this.camera.position.y = CONFIG.camera.position.y + Math.sin(time * bobFreq) * bobAmp;

        const targetFOV = (this.car && this.car.isNitro) ? CONFIG.camera.fov + 15 : CONFIG.camera.fov;
        this.camera.fov += (targetFOV - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();
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
        if (this.composer) this.composer.setSize(this.width, this.height);
    }

    lerp(start, end, factor) { return start + (end - start) * factor; }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isPaused) return;

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        let finalTargetSpeed = CONFIG.speed.max;
        if (this.car) {
            if (this.car.isNitro) finalTargetSpeed *= 1.8;
            if (this.car.isBraking) finalTargetSpeed *= 0.2;
        }

        this.currentSpeed = this.lerp(this.currentSpeed, finalTargetSpeed, dt * CONFIG.speed.acceleration);

        if (this.city) this.city.update(this.currentSpeed, dt);
        if (this.car) this.car.update(this.currentSpeed, dt);
        if (this.obstacles) {
            this.obstacles.spawn(this.totalDistance); 
            this.obstacles.update(this.currentSpeed, dt);
        }

        this.updateHUD(dt);
        this.updateCamera(time, dt);
        if (this.composer) this.composer.render();
    }
}
