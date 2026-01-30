import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.model = null;
        this.targetX = 0;
        
        // ПРАВКА: Увеличил скорость бокового смещения с 35 до 50
        this.sideSpeed = 50; 
        
        this.isNitro = false;
        this.isBraking = false;
        
        // Огни заднего хода
        this.brakeLights = [];

        this.loadModel();
        this.initControls();
        this.initLights(); // Добавляем свет
        
        this.mesh.position.set(0, 0.8, -5.5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        // Загрузка карты отражений (нужен файл assets/images/env.jpg)
        const texLoader = new THREE.TextureLoader();
        const envMap = texLoader.load('assets/images/env.jpg');
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            this.model.scale.set(3.8, 3.8, 3.8); 
            this.model.rotation.y = 0; 

            // ПРАВКА: Применяем отражения ко всем деталям машины
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.envMap = envMap;
                    child.material.envMapIntensity = 1.5; // Сила отражения
                    child.material.metalness = 0.9;       // Делаем металл зеркальным
                    child.material.roughness = 0.1;       // Очень гладкая поверхность
                }
            });

            this.mesh.add(this.model);
        }, undefined, (e) => this.createPlaceholder());
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(2, 0.8, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        this.mesh.add(new THREE.Mesh(geo, mat));
    }

    initLights() {
        // Создаем два красных источника света сзади (левый и правый)
        const lightL = new THREE.PointLight(0xff0000, 0.5, 10);
        const lightR = new THREE.PointLight(0xff0000, 0.5, 10);
        
        // Позиция огней (подбираем под задний бампер)
        lightL.position.set(-0.8, 0.5, 2.5);
        lightR.position.set(0.8, 0.5, 2.5);

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

        // ПРАВКА: Логика стоп-сигналов
        const intensity = this.isBraking ? 5.0 : 0.5; // Ярко вспыхивают при торможении
        this.brakeLights.forEach(l => l.intensity = intensity);

        const limit = (CONFIG.road.width / 2) - 5.0;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));
        
        // ПРАВКА: Увеличил плавность с 0.05 до 0.1 (машина поворачивает в 2 раза быстрее)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;
        
        this.mesh.rotation.z = 0; 
        this.mesh.position.y = 0.8 + Math.sin(Date.now() * 0.005) * 0.05;
    }
}
