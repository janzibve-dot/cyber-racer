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
        
        // ПРАВКА: Изменил Z с -8 на -6 (ближе к экрану)
        this.mesh.position.set(0, 0.6, -6); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            // Центрирование модели внутри контейнера
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            // ПРАВКА: Увеличил масштаб с 2.5 до 2.8
            this.model.scale.set(2.8, 2.8, 2.8); 
            
            // ПРАВКА: Убрал разворот (было Math.PI), теперь 0 — машина смотрит вперед
            this.model.rotation.y = 0; 

            this.mesh.add(this.model);
        }, undefined, (e) => this.createPlaceholder());
    }

    createPlaceholder() {
        // Временный куб, если модель не загрузилась
        const geo = new THREE.BoxGeometry(2, 0.8, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        this.mesh.add(new THREE.Mesh(geo, mat));
    }

    initControls() {
        this.keys = { left: false, right: false, up: false, down: false };
        
        window.addEventListener('keydown', (e) => this.updateKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.updateKeys(e.code, false));
        
        // Управление мышью
        window.addEventListener('mousemove', (e) => {
            if (!this.model) return;
            // Преобразуем координаты мыши в позицию на дороге
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
        // Логика перемещения
        if (this.keys.left) this.targetX -= this.sideSpeed * dt;
        if (this.keys.right) this.targetX += this.sideSpeed * dt;
        
        this.isNitro = this.keys.up;
        this.isBraking = this.keys.down;

        // Ограничение движения границами дороги
        const limit = (CONFIG.road.width / 2) - 3.5;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        // Плавное смещение (интерполяция)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        
        // Легкое покачивание (имитация работы двигателя)
        this.mesh.position.y = 0.6 + Math.sin(Date.now() * 0.005) * 0.05;
        
        // Наклон корпуса при повороте
        this.mesh.rotation.z = (this.mesh.position.x - this.targetX) * 0.15;
    }
}
