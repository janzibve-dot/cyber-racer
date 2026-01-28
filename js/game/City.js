import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        
        // Материалы (создаем один раз для оптимизации)
        this.matWireCyan = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan });
        this.matWirePink = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonPink });
        this.matDark = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.initRoad();
        this.initBuildings();
    }

    initRoad() {
        // Создаем текстуру дороги через Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Черный асфальт
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,128,512);
        // Циановые бордюры
        ctx.fillStyle = '#00f3ff'; 
        ctx.fillRect(0,0,4,512); ctx.fillRect(124,0,4,512);
        // Полосы
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(40, 0, 2, 512); ctx.fillRect(80, 0, 2, 512);

        this.roadTex = new THREE.CanvasTexture(canvas);
        this.roadTex.wrapT = THREE.RepeatWrapping;
        this.roadTex.repeat.set(1, 10);
        this.roadTex.magFilter = THREE.NearestFilter; 

        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 400);
        const mat = new THREE.MeshBasicMaterial({ map: this.roadTex });
        
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -50;
        this.scene.add(this.road);
    }

    initBuildings() {
        // Создаем 30 пар зданий
        for(let i=0; i<30; i++) {
            this.spawnBuildingPair(-100 + i * 15);
        }
    }

    spawnBuildingPair(z) {
        this.createBuilding(-25, z, true); // Слева
        this.createBuilding(25, z, false); // Справа
    }

    createBuilding(x, z, isLeft) {
        const h = 10 + Math.random() * 30;
        const w = 5 + Math.random() * 5;
        
        // Геометрия
        const geo = new THREE.BoxGeometry(w, h, w);
        const mesh = new THREE.Mesh(geo, this.matDark);
        
        // Wireframe (сетка)
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = isLeft ? this.matWireCyan : this.matWirePink;
        const wires = new THREE.LineSegments(edges, lineMat);
        
        mesh.add(wires);
        
        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;

        // 1. Двигаем текстуру дороги
        this.roadTex.offset.y -= dist * 0.01;

        // 2. Двигаем здания
        this.buildings.forEach(b => {
            b.position.z += dist;
            
            // Зацикливание зданий
            if(b.position.z > 50) {
                b.position.z = -200; 
                const newH = 10 + Math.random() * 30;
                b.scale.y = newH / (b.geometry.parameters.height); 
                b.position.y = newH / 2;
            }
        });
    }
}
