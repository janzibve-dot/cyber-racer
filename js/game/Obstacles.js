import * as THREE from 'three';
import { CONFIG } from './Config.js';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.spawnTimer = 0;
        
        // Геометрия для переиспользования
        this.boxGeo = new THREE.BoxGeometry(2, 2, 2);
        this.boxMat = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            roughness: 0.4,
            metalness: 0.8,
            emissive: 0x330000 
        });
    }

    spawn() {
        // Создаем визуальную коробку
        const mesh = new THREE.Mesh(this.boxGeo, this.boxMat);
        
        // Случайная позиция на дороге (ширина 40)
        // Ограничиваем -15..15, чтобы не спавнились в стенах
        const xPos = (Math.random() * 30) - 15;
        
        mesh.position.set(xPos, 1, -100); // Спавн вдалеке
        
        // --- COYOTE TIME (ХИТБОКСЫ) ---
        // Визуально коробка 2x2. Логически хитбокс будет 1.4 (70%)
        // Это прощает игроку касание краем
        mesh.userData = { 
            type: 'obstacle',
            hitboxRadius: 1.4, 
            active: true 
        };

        this.scene.add(mesh);
        this.items.push(mesh);
    }

    update(speed, dt) {
        // Спавн новых препятствий (каждые 1-3 секунды в зависимости от скорости)
        // Чем быстрее едем, тем чаще спавн
        const spawnRate = Math.max(0.5, 2.0 - (speed / 100));
        this.spawnTimer += dt;
        
        if (this.spawnTimer > spawnRate) {
            this.spawn();
            this.spawnTimer = 0;
        }

        // Двигаем препятствия
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.position.z += speed * dt;

            // Удаляем, если ушли за спину
            if (item.position.z > 20) {
                this.scene.remove(item);
                this.items.splice(i, 1);
            }
        }
    }
}
