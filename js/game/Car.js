import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.model = null;
        this.targetX = 0;
        this.sideSpeed = 60; 
        
        // --- HITBOX INFO ---
        // Визуальная ширина: ~1.5 метра
        // Визуальная длина: ~3.5 метра
        // Для логики столкновений используем радиус 0.75 или Box3 (1.5, 1.0, 3.5)
        // -------------------

        this.isNitro = false;
        this.isBraking = false;
        this.brakeLights = [];

        this.loadModel();
        this.initControls();
        this.initLights();
        
        this.mesh.position.set(0, 0.4, -5.5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        // ПРАВКА: Безопасная загрузка отражений
        const texLoader = new THREE.TextureLoader();
        let envMap = null;
        
        // Пытаемся загрузить. Если файла нет, onError сработает, игра не упадет.
        texLoader.load(
            'assets/images/env.jpg', 
            (texture) => {
                envMap = texture;
                envMap.mapping = THREE.EquirectangularReflectionMapping;
                // Если модель уже успела загрузиться раньше текстуры, применяем тут
                if (this.model) this.applyReflections(envMap);
            },
            undefined, 
            (err) => { console.warn('Env map not found, using default material'); }
        );

        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            this.model.scale.set(1.9, 1.9, 1.9); 
            this.model.rotation.y = 0; 

            // Если текстура загрузилась раньше модели, применяем сразу
            if (envMap) this.applyReflections(envMap);

            this.mesh.add(this.model);
        }, undefined, (e) => this.createPlaceholder());
    }

    // Вынес логику наложения отражений в отдельный метод
    applyReflections(map) {
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.material.envMap = map;
                child.material.envMapIntensity = 2.0; 
                child.material.metalness = 1.0;
                child.material.roughness = 0.0;
                child.material.needsUpdate = true;
            }
        });
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(1, 0.4, 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        this.mesh.add(new THREE.Mesh(geo, mat));
    }

    initLights() {
        const lightL = new THREE.PointLight(0xff0000, 0.5, 8);
        const lightR = new THREE.PointLight(0xff0000, 0.5, 8);
        lightL.position.set(-0.4, 0.3, 1.2); 
        lightR.position.set(0.4, 0.3, 1.2);
        this.mesh.add(lightL);
        this.mesh.add(lightR);
        this.brakeLights.push(lightL, lightR);
    }

    initControls() {
        this.keys = { left: false, right: false, up: false, down: false };
        window.addEventListener('keydown', (e) => this.updateKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.updateKeys(e.code, false));
        window.addEventListener('mousemove', (e) => {
            if (!this.model) return;
            this.targetX = ((e.clientX / window.innerWidth) * 2 - 1) * (CONFIG.road.width * 0.4);
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

        const intensity = this.isBraking ? 5.0 : 0.5; 
        this.brakeLights.forEach(l => l.intensity = intensity);

        const limit = (CONFIG.road.width / 2) - 3.0;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        
        this.mesh.rotation.z = 0; 
        this.mesh.position.y = 0.4 + Math.sin(Date.now() * 0.005) * 0.02;
    }
}
