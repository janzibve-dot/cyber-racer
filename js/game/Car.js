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
        
        // ПРАВКА: Приблизил Z с -6 до -4.5 (еще ближе к экрану)
        // ПРАВКА: Поднял Y с 0.6 до 0.8, так как машина стала больше
        this.mesh.position.set(0, 0.8, -4.5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            // ПРАВКА: Увеличил масштаб: 2.8 * 1.2 = 3.36
            this.model.scale.set(3.36, 3.36, 3.36); 
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

        const limit = (CONFIG.road.width / 2) - 4.5; // Чуть уменьшил лимит, т.к. машина шире
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        
        // Расчет наклона
        const tilt = (this.mesh.position.x - this.targetX) * 0.15;
        this.mesh.rotation.z = tilt;

        // ПРАВКА: Логика "Анти-проваливания"
        // Когда машина наклоняется (tilt), край опускается. Мы компенсируем это, поднимая Y.
        // Math.abs(tilt) * 1.5 — коэффициент подъема при повороте.
        const baseHeight = 0.8; 
        const bounce = Math.sin(Date.now() * 0.005) * 0.05;
        const cornerLift = Math.abs(tilt) * 1.5; 
        
        this.mesh.position.y = baseHeight + bounce + cornerLift;
    }
}
