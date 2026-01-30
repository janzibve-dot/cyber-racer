import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group(); 
        this.model = null;
        
        // Физика и управление
        this.targetX = 0; 
        this.sideSpeed = 35; // Чуть снизил скорость реакции клавиш
        this.isNitro = false;
        this.isBraking = false;

        this.loadModel();
        this.initControls();
        
        // Фиксированная позиция над дорогой
        this.mesh.position.set(0, 0.6, -5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;

            // Центрирование
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.x += (this.model.position.x - center.x);
            this.model.position.y += (this.model.position.y - center.y);
            this.model.position.z += (this.model.position.z - center.z);

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    if (child.material) {
                        child.material.emissiveIntensity = 0.4;
                        child.material.needsUpdate = true;
                    }
                }
            });

            // УМЕНЬШЕНИЕ: масштаб изменен с 1.5 до 0.8
            this.model.scale.set(0.8, 0.8, 0.8); 
            this.model.rotation.y = Math.PI; 

            this.mesh.add(this.model);
            console.log("Car2.glb: масштаб и плавность обновлены");
        }, undefined, (error) => {
            console.warn("Ошибка загрузки Car2.glb. Создаю заглушку.");
            this.createPlaceholder();
        });
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(1.5, 0.6, 3);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        const box = new THREE.Mesh(geo, mat);
        this.mesh.add(box);
    }

    initControls() {
        this.keys = { left: false, right: false, up: false, down: false };
        window.addEventListener('keydown', (e) => this.updateKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.updateKeys(e.code, false));
        
        window.addEventListener('mousemove', (e) => {
            const ratio = (e.clientX / window.innerWidth) * 2 - 1;
            // ОГРАНИЧЕНИЕ: уменьшил множитель, чтобы мышь не уводила машину за экран
            this.targetX = ratio * (CONFIG.road.width * 0.3); 
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

        // ЛИМИТ: сузил границы, чтобы машина всегда была видна
        const roadLimit = (CONFIG.road.width / 2) - 4;
        this.targetX = Math.max(-roadLimit, Math.min(roadLimit, this.targetX));

        // ПЛАВНОСТЬ: коэффициент изменен с 0.15 на 0.08 (стала менее резкой)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.08;
        
        const hover = Math.sin(Date.now() * 0.01) * 0.03;
        this.mesh.position.y = 0.6 + hover;

        const tiltZ = (this.mesh.position.x - this.targetX) * 0.2;
        this.mesh.rotation.z += (tiltZ - this.mesh.rotation.z) * 0.1;
        this.mesh.rotation.y = -(this.mesh.position.x - this.targetX) * 0.1;
    }
}
