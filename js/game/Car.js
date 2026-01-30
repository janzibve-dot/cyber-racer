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
        
        // Машина отодвинута назад на 7.5 единиц
        this.mesh.position.set(0, 0.6, -7.5); 
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/models/Car2.glb', (gltf) => {
            this.model = gltf.scene;

            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.x += (this.model.position.x - center.x);
            this.model.position.y += (this.model.position.y - center.y);
            this.model.position.z += (this.model.position.z - center.z);

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    if (child.material) child.material.emissiveIntensity = 0.5;
                }
            });

            // МАСШТАБ: Увеличен до 1.5
            this.model.scale.set(1.5, 1.5, 1.5); 
            // РАЗВОРОТ: 0 (если снова задом - смени на Math.PI)
            this.model.rotation.y = 0; 

            this.mesh.add(this.model);
        }, undefined, (error) => {
            this.createPlaceholder();
        });
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
            const ratio = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetX = ratio * (CONFIG.road.width * 0.35); 
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

        const roadLimit = (CONFIG.road.width / 2) - 3.5;
        this.targetX = Math.max(-roadLimit, Math.min(roadLimit, this.targetX));
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.08;
        this.mesh.position.y = 0.6 + Math.sin(Date.now() * 0.01) * 0.03;

        this.mesh.rotation.z += ((this.mesh.position.x - this.targetX) * 0.2 - this.mesh.rotation.z) * 0.1;
        this.mesh.rotation.y = -(this.mesh.position.x - this.targetX) * 0.1;
    }
}
