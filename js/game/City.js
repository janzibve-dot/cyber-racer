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

        // Таймер для анимации окон
        this.windowTimer = 0;
        this.currentTexIndex = 0; // Индекс текущей обновляемой текстуры

        this.initResources();
        this.initSharedGeometry();
        this.initRoad();
        this.initSky();
        this.initBuildings();
    }

    initSharedGeometry() {
        this.poleGeo = new THREE.CylinderGeometry(0.5, 0.8, 25, 6);
        this.poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        this.armGeo = new THREE.BoxGeometry(10, 0.5, 0.5);
        this.lampGeo = new THREE.BoxGeometry(2, 0.5, 4);
        this.lampMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    }

    initResources() {
        // 1. Normal Map
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

        // 2. Текстуры окон
        this.windowTextures = [];
        this.windowContexts = []; 
        this.holoTextures = []; 

        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            this.windowContexts.push(ctx); 
            this.drawWindows(ctx); 

            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            this.windowTextures.push(tex);
        }

        // 3. Реклама
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const c = this.colors[Math.floor(Math.random()*this.colors.length)];
            const color = '#' + new THREE.Color(c).getHexString();
            ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(2,2,124,60);
            ctx.fillStyle = color; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            ctx.fillText(["NEON", "RACE", "BUY", "CYBER"][i%4], 64, 40);
            this.holoTextures.push(new THREE.CanvasTexture(canvas));
        }
    }

    drawWindows(ctx) {
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 64, 128);
        const baseColor = new THREE.Color(this.colors[Math.floor(Math.random() * this.colors.length)]);
        const altColor = new THREE.Color(0xff4400); 

        for (let y = 10; y < 120; y += 12) {
            for (let x = 8; x < 56; x += 10) {
                if (Math.random() > 0.4) {
                    const isAlt = Math.random() < 0.05; 
                    ctx.fillStyle = '#' + (isAlt ? altColor.getHexString() : baseColor.getHexString());
                    ctx.fillRect(x, y, 6, 8);
                }
            }
        }
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 1000);
        const mat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -200;
        this.scene.add(this.road);
        
        const grid = new THREE.GridHelper(CONFIG.road.width, 4, 0x00f3ff, 0x00f3ff);
        grid.position.y = 0.05; grid.position.z = -200; grid.scale.z = 5;
        this.scene.add(grid);
        this.roadGrid = grid;
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
        const isCity = (this.spawnCounter % 20) < 15;

        if (isCity) {
            const isMega = (this.spawnCounter % 50 === 0);
            let xLeft = -45 - Math.random() * 20; 
            let xRight = 45 + Math.random() * 20;

            if (xLeft > -25) xLeft = -30;
            if (xRight < 25) xRight = 30;
            
            const b1 = this.createBuilding(xLeft, z, isMega);
            const b2 = this.createBuilding(xRight, z, isMega);
            if (!isMega && Math.random() > 0.5) this.createBridge(b1, b2);
        } else {
            this.createRoadProp(-30, z);
            this.createRoadProp(30, z);
        }
    }

    createRoadProp(x, z) {
        const isLight = Math.random() > 0.4; 
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.userData = { type: 'prop' };

        if (isLight) {
            const pole = new THREE.Mesh(this.poleGeo, this.poleMat);
            pole.position.y = 12.5;
            group.add(pole);

            const arm = new THREE.Mesh(this.armGeo, this.poleMat);
            arm.position.set(x > 0 ? -5 : 5, 25, 0); 
            group.add(arm);

            const lamp = new THREE.Mesh(this.lampGeo, this.lampMat);
            lamp.position.set(x > 0 ? -9 : 9, 24.5, 0); 
            group.add(lamp);

            const pl = new THREE.PointLight(0x00f3ff, 2, 40);
            pl.position.set(0, -2, 0);
            lamp.add(pl);
        } else {
            const pole = new THREE.Mesh(this.poleGeo, this.poleMat);
            pole.position.y = 7.5;
            pole.scale.y = 0.6;
            group.add(pole);
        }
        this.scene.add(group);
        this.buildings.push(group);
    }

    createBridge(b1, b2) {
        const dx = b2.position.x - b1.position.x;
        const dist = Math.sqrt(dx*dx);
        const h = Math.min(b1.position.y, b2.position.y) + 5; 
        const geo = new THREE.CylinderGeometry(1, 1, dist, 8);
        geo.rotateZ(Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((b1.position.x + b2.position.x)/2, h, b1.position.z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    createBuilding(x, z, isMega) {
        const h = (isMega ? 150 : 50) + Math.random() * 100;
        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        const geo = new THREE.BoxGeometry(40, h, 50);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x888888, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.5,
            roughness: 0.8, metalness: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { type: 'building' };
        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
        return mesh;
    }

    update(speed, dt) {
        const dist = speed * dt;
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;

        // ПРАВКА: Оптимизированное обновление окон
        // Обновляем только ОДНУ текстуру каждые 0.2 секунды
        this.windowTimer += dt;
        if (this.windowTimer > 0.2) { 
            this.windowTimer = 0;
            
            // Берем текущий индекс
            const idx = this.currentTexIndex;
            
            // Перерисовываем только один контекст
            this.drawWindows(this.windowContexts[idx]);
            this.windowTextures[idx].needsUpdate = true;
            
            // Переключаемся на следующую текстуру (циклично 0 -> 1 -> 2 -> 3 -> 0)
            this.currentTexIndex = (this.currentTexIndex + 1) % this.windowTextures.length;
        }

        this.buildings.forEach(b => {
            b.position.z += dist;
            if (b.position.z > 50) {
                b.position.z -= this.worldLength;
                if (b.userData.type === 'building') {
                    const newH = 50 + Math.random() * 100;
                    b.scale.y = newH / b.geometry.parameters.height;
                    b.position.y = newH / 2;
                }
            }
        });
    }
}
