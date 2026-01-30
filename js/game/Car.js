import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.model = null;
        this.targetX = 0;
        
        // Увеличиваем скорость реакции, так как машина стала легче
        this.sideSpeed = 60; 
        
        this.isNitro = false;
        this.isBraking = false;
        this.brakeLights = [];

        this.loadModel();
        this.initControls();
        this.initLights();
        
        this.mesh.position.set(0, 0.4, -5.5); // Опустили ниже (0.4), так как машина меньше
        this.scene.add(this.mesh);
    }

    loadModel() {
        const texLoader = new THREE.TextureLoader();
        const envMap = texLoader.load('assets/images/env.jpg');
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            // ПРАВКА: Уменьшил масштаб в 2 раза (было 3.8 -> 1.9)
            this.model.scale.set(1.9, 1.9, 1.9); 
            this.model.rotation.y = 0; 

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.material.envMapIntensity = 2.0; // Усилил отражения
                    child.material.metalness = 1.0;
                    child.material.roughness = 0.0;
                }
            });

            this.mesh.add(this.model);
        }, undefined, (e) => this.createPlaceholder());
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(1, 0.4, 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        this.mesh.add(new THREE.Mesh(geo, mat));
    }

    initLights() {
        // Огни стали ближе к центру, так как машина меньше
        const lightL = new THREE.PointLight(0xff0000, 0.5, 8);
        const lightR = new THREE.PointLight(0xff0000, 0.5, 8);
        
        lightL.position.set(-0.4, 0.3, 1.2); // Скорректированы координаты
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
            // Ограничиваем движение мыши шириной дороги
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

        // ПРАВКА: Лимит движения. Дорога 40, пол-дороги 20. Машина 1.5 шириной.
        // Оставляем запас 2.0 от края.
        const limit = (CONFIG.road.width / 2) - 3.0;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        
        this.mesh.rotation.z = 0; 
        this.mesh.position.y = 0.4 + Math.sin(Date.now() * 0.005) * 0.02;
    }
}
