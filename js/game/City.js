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
        const canvasNorm = document.createElement('canvas');
        canvasNorm.width = 256; canvasNorm.height = 256;
        const ctxNorm = canvasNorm.getContext('2d');
        const imgData = ctxNorm.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const val = 100 + Math.random() * 155; 
            imgData.data[i] = val; imgData.data[i+1] = val; imgData.data[i+2] = val; imgData.data[i+3] = 255;
        }
        ctxNorm.putImageData(imgData, 0, 0);
        this.normalMap = new THREE.CanvasTexture(canvasNorm);
        this.normalMap.wrapS = THREE.RepeatWrapping; 
        this.normalMap.wrapT = THREE.RepeatWrapping;

        const canvasRough = document.createElement('canvas');
        canvasRough.width = 256; canvasRough.height = 256;
        const ctxRough = canvasRough.getContext('2d');
        for(let i=0; i<500; i++) {
            const gray = Math.floor(Math.random() * 255);
            ctxRough.fillStyle = `rgb(${gray},${gray},${gray})`;
            const size = Math.random() * 50 + 10;
            ctxRough.fillRect(Math.random()*256, Math.random()*256, size, size);
        }
        ctxRough.filter = 'blur(4px)';
        ctxRough.drawImage(canvasRough, 0, 0); 
        this.roughnessMap = new THREE.CanvasTexture(canvasRough);
        this.roughnessMap.wrapS = THREE.RepeatWrapping;
        this.roughnessMap.wrapT = THREE.RepeatWrapping;

        this.windowTextures = [];
        this.holoTextures = []; 
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 64, 128);
            const baseColor = new THREE.Color(this.colors[Math.floor(Math.random() * this.colors.length)]);
            for (let y = 10; y < 120; y += 12) {
                for (let x = 8; x < 56; x += 10) {
                    if (Math.random() > 0.3) {
                        ctx.fillStyle = '#' + baseColor.getHexString();
                        ctx.fillRect(x, y, 6, 8);
                    }
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            this.windowTextures.push(tex);
        }

        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const color = '#' + new THREE.Color(this.colors[Math.floor(Math.random()*this.colors.length)]).getHexString();
            ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(2,2,124,60);
            ctx.fillStyle = color; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            ctx.fillText(["NEON", "RACE", "BUY", "CYBER"][i%4], 64, 40);
            this.holoTextures.push(new THREE.CanvasTexture(canvas));
        }
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 1000);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughnessMap: this.roughnessMap, 
            roughness: 0.5, 
            metalness: 0.6, 
            normalMap: this.normalMap 
        });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -200;
        this.normalMap.repeat.set(5, 50);
        this.roughnessMap.repeat.set(5, 50);
        this.scene.add(this.road);

        this.roadGrid = new THREE.GridHelper(CONFIG.road.width, 4, 0x00f3ff, 0x00f3ff);
        this.roadGrid.position.y = 0.05;
        this.roadGrid.position.z = -200;
        this.roadGrid.scale.z = 5;
        this.scene.add(this.roadGrid);

        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffea00'; 
        ctx.fillRect(28, 50, 8, 100); ctx.fillRect(28, 250, 8, 100); ctx.fillRect(28, 450, 8, 100);
        const lineTex = new THREE.CanvasTexture(canvas);
        lineTex.wrapT = THREE.RepeatWrapping; lineTex.repeat.set(1, 10);
        this.centerLine = new THREE.Mesh(new THREE.PlaneGeometry(2, 1000), new THREE.MeshBasicMaterial({ map: lineTex, transparent: true }));
        this.centerLine.rotation.x = -Math.PI / 2;
        this.centerLine.position.y = 0.06;
        this.centerLine.position.z = -200;
        this.scene.add(this.centerLine);
    }

    initSky() {
        const grid = new THREE.GridHelper(600, 40, 0x111133, 0x111133);
        grid.position.y = 80;
        this.scene.add(grid);
    }

    initBuildings() {
        for (let i = 0; i < this.chunkCount; i++) {
            this.spawnPair(-i * this.chunkSize);
        }
    }

    spawnPair(z) {
        this.spawnCounter++;
        if ((this.spawnCounter % 20) < 15) {
            this.createBuilding(-45 - Math.random()*5, z, (this.spawnCounter % 50 === 0));
            this.createBuilding(45 + Math.random()*5, z, (this.spawnCounter % 50 === 0));
        } else {
            this.createRoadProp(-45, z); this.createRoadProp(45, z);
        }
    }

    createRoadProp(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.userData = { type: 'prop' };
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 25, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        pole.position.y = 12.5;
        group.add(pole);
        this.scene.add(group);
        this.buildings.push(group);
    }

    createBuilding(x, z, isMega) {
        const h = (isMega ? 150 : 50) + Math.random() * 100;
        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)].clone();
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, h / 30);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(40, h, 50), new THREE.MeshStandardMaterial({ 
            color: 0x888888, map: tex, emissive: 0xffffff, emissiveMap: tex, 
            emissiveIntensity: 0.4 // СНИЖЕНО: Было 1.5, теперь 0.4
        }));
        mesh.userData = { type: 'building' };
        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;
        this.centerLine.material.map.offset.y -= dist * 0.05;
        this.buildings.forEach(b => {
            b.position.z += dist;
            if (b.position.z > 50) b.position.z -= this.worldLength;
        });
    }
}
