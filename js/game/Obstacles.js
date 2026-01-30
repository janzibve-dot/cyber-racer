import * as THREE from 'three';
import { CONFIG } from './Config.js';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.spawnZ = -150; 
        this.lastSpawnZ = 0;
    }

    spawn(currentDistance) {
        if (currentDistance - this.lastSpawnZ > 40) {
            this.createObstacle();
            this.lastSpawnZ = currentDistance;
        }
    }

    createObstacle() {
        const group = new THREE.Group();
        const xPos = (Math.random() - 0.5) * CONFIG.road.width * 0.7;
        const geo = new THREE.BoxGeometry(6, 2, 1);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffea00 })));
        group.add(mesh);
        group.position.set(xPos, 1, this.spawnZ);
        this.scene.add(group);
        this.items.push(group);
    }

    update(speed, dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.position.z += speed * dt;
            if (item.position.z > 20) {
                this.scene.remove(item);
                this.items.splice(i, 1);
            }
        }
    }
}
