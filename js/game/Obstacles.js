import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.spawnZ = -150; // Дистанция появления
        this.lastSpawnZ = 0;
    }

    spawn(currentDistance) {
        // Спавним новое препятствие каждые 40 метров пути
        if (currentDistance - this.lastSpawnZ > 40) {
            this.createObstacle();
            this.lastSpawnZ = currentDistance;
        }
    }

    createObstacle() {
        const types = ['barricade', 'laser_gate'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const group = new THREE.Group();
        const xPos = (Math.random() - 0.5) * CONFIG.road.width * 0.7;
        
        if (type === 'barricade') {
            const geo = new THREE.BoxGeometry(6, 2, 1);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const mesh = new THREE.Mesh(geo, mat);
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffea00 }));
            mesh.add(line);
            group.add(mesh);
        } else {
            // Лазерные ворота (высокие, можно проехать под ними или сбоку)
            const pillarGeo = new THREE.BoxGeometry(1, 8, 1);
            const pillarMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
            const p1 = new THREE.Mesh(pillarGeo, pillarMat);
            const p2 = new THREE.Mesh(pillarGeo, pillarMat);
            p1.position.x = -4; p2.position.x = 4;
            
            const beamGeo = new THREE.BoxGeometry(8, 0.2, 0.2);
            const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.y = 3; 
            
            group.add(p1, p2, beam);
        }

        group.position.set(xPos, 1, this.spawnZ);
        this.scene.add(group);
        this.items.push(group);
    }

    update(speed, dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.position.z += speed * dt; // Движутся навстречу игроку

            // Удаляем, если улетело далеко за спину
            if (item.position.z > 20) {
                this.scene.remove(item);
                this.items.splice(i, 1);
            }
        }
    }
}
