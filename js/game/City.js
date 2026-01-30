import * as THREE from 'three';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.colors = CONFIG.colors.palette;
        this.spawnCounter = 0;
        this.chunkSize = 50;  
        this.chunkCount = 60; 
        this.worldLength = this.chunkSize * this.chunkCount; 

        this.initResources();
        this.initRoad();
        this.initSky();
        this.initBuildings();
    }

    initResources() {
        // Создаем текстуры для окон и голограмм
        this.windowTextures = [];
        this.holoTextures = []; 
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,64,128);
            const color = new THREE.Color(this.colors[Math.floor(Math.random()*this.colors.length)]);
            for(let y=10; y<120; y+=12) {
                for(let x=8; x<56; x+=10) {
                    if(Math.random()>0.3) { ctx.fillStyle='#'+color.getHexString(); ctx.fillRect(x,y,6,8); }
                }
            }
            this.windowTextures.push(new THREE.CanvasTexture(canvas));
        }
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 4; ctx.strokeRect(2,2,124,60);
            ctx.fillStyle = '#00f3ff'; ctx.font = '20px Orbitron'; ctx.textAlign='center';
            ctx.fillText(["NEON", "CYBER", "RACE", "CITY"][i], 64, 40);
            this.holoTextures.push(new THREE.CanvasTexture(canvas));
        }
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 1000);
        const mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.scene.add(this.road);

        this.roadGrid = new THREE.GridHelper(CONFIG.road.width, 4, 0x00f3ff, 0x00f3ff);
        this.roadGrid.position.y = 0.05;
        this.scene.add(this.roadGrid);
    }

    initSky() {
        this.scene.add(new THREE.GridHelper(600, 40, 0x111133, 0x111133));
    }

    initBuildings() {
        for (let i = 0; i < this.chunkCount; i++) this.spawnPair(-i * this.chunkSize);
    }

    spawnPair(z) {
        this.spawnCounter++;
        // Создаем здания
        this.createBuilding(-45, z, (this.spawnCounter % 50 === 0));
        this.createBuilding(45, z, (this.spawnCounter % 50 === 0));
        
        // ВОЗВРАТ ФОНАРЕЙ И ЩИТОВ
        if (this.spawnCounter % 5 === 0) {
            this.createRoadProp(-22, z); 
            this.createRoadProp(22, z);
        }
    }

    createRoadProp(x, z) {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 15), new THREE.MeshStandardMaterial({color: 0x333333}));
        pole.position.y = 7.5;
        group.add(pole);

        const lamp = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 1), new THREE.MeshBasicMaterial({color: 0x00f3ff}));
        lamp.position.set(x < 0 ? 1 : -1, 15, 0);
        group.add(lamp);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.buildings.push(group);
    }

    createBuilding(x, z, isMega) {
        const h = (isMega ? 150 : 50) + Math.random() * 80;
        const tex = this.windowTextures[Math.floor(Math.random()*this.windowTextures.length)];
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(30, h, 40), new THREE.MeshStandardMaterial({ 
            color: 0x222222, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4 
        }));
        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 50) this.roadGrid.position.z = 0;
        this.buildings.forEach(b => {
            b.position.z += dist;
            if (b.position.z > 50) b.position.z -= this.worldLength;
        });
    }
}
