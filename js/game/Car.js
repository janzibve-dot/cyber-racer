import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.model = null;
        this.targetX = 0;
        this.sideSpeed = 35;
        this.isNitro = false;
        this.isBraking = false;

        this.loadModel();
        this.initControls();
        
        // Позиция машины
        this.mesh.position.set(0, 0.8, -5.5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            // Масштаб 3.8 (как и просил ранее)
            this.model.scale.set(3.8, 3.8, 3.8); 
            this.model.rotation.y = 0; 

            this.mesh.add(this.model);
        }, undefined, (e) => this.createPlaceholder());
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(2, 0.8, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        this.mesh.add(new THREE.Mesh(geo, mat));
    }

    initControls() {
        this.keys = { left: false, right: false, up: false, down: false };
        window.addEventListener('keydown', (e) => this.updateKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.updateKeys(e.code, false));
        window.addEventListener('mousemove', (e) => {
            if (!this.model) return;
            this.targetX = ((e.clientX / window.innerWidth) * 2 - 1) * (CONFIG.road.width * 0.35);
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

        const limit = (CONFIG.road.width / 2) - 5.0;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        // Плавность поворота (0.05 - "тяжелая" машина)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.05;
        
        // ПРАВКА: Убрал наклон (rotation.z)
        this.mesh.rotation.z = 0; 

        // ПРАВКА: Убрал cornerLift (компенсацию высоты), так как нет наклона
        // Оставил только легкое покачивание двигателя
        this.mesh.position.y = 0.8 + Math.sin(Date.now() * 0.005) * 0.05;
    }
}
