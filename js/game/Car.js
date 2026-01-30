import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group(); // Контейнер для модели
        this.model = null; // Здесь будет сама GLB модель
        
        // Физика и управление
        this.targetX = 0; 
        this.sideSpeed = 45; 
        this.isNitro = false;
        this.isBraking = false;

        this.loadModel();
        this.initControls();
        
        this.mesh.position.set(0, 0.6, -5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        // Путь к твоей модели на GitHub
        loader.load('assets/models/car.glb', (gltf) => {
            this.model = gltf.scene;
            
            // Настройка материалов модели для стиля Киберпанк
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    // Если хочешь, чтобы модель немного светилась:
                    if (child.material) {
                        child.material.emissiveIntensity = 0.5;
                    }
                }
            });

            // Масштабируем модель, если она слишком большая или маленькая
            this.model.scale.set(1.2, 1.2, 1.2); 
            // Разворачиваем модель передом к дороге (зависит от осей твоей модели)
            this.model.rotation.y = Math.PI; 

            this.mesh.add(this.model);
            console.log("Cyber-Car Loaded!");
        }, undefined, (error) => {
            console.error("Ошибка загрузки модели:", error);
        });
    }

    initControls() {
        this.keys = { left: false, right: false, up: false, down: false };
        window.addEventListener('keydown', (e) => this.updateKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.updateKeys(e.code, false));
        
        window.addEventListener('mousemove', (e) => {
            const ratio = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetX = ratio * (CONFIG.road.width * 0.4); 
        });
    }

    updateKeys(code, isDown) {
        if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = isDown;
        if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = isDown;
        if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = isDown;
        if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = isDown;
    }

    update(speed, dt) {
        if (this.keys.left) this.targetX -= this.sideSpeed * dt;
        if (this.keys.right) this.targetX += this.sideSpeed * dt;
        
        this.isNitro = this.keys.up;
        this.isBraking = this.keys.down;

        const roadLimit = (CONFIG.road.width / 2) - 2.5;
        this.targetX = Math.max(-roadLimit, Math.min(roadLimit, this.targetX));

        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.15;

        // Эффект парения
        const hover = Math.sin(Date.now() * 0.01) * 0.04;
        this.mesh.position.y = 0.6 + hover;

        // Наклоны модели при поворотах
        const tiltZ = (this.mesh.position.x - this.targetX) * 0.3;
        this.mesh.rotation.z += (tiltZ - this.mesh.rotation.z) * 0.1;
        this.mesh.rotation.y = -(this.mesh.position.x - this.targetX) * 0.2;
    }
}
