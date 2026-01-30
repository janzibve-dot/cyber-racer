import * as THREE from 'three';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; // Хранит здания, фонари и щиты
        this.colors = CONFIG.colors.palette;

        this.spawnCounter = 0;
        
        // НАСТРОЙКИ ЦИКЛИЧНОСТИ
        this.chunkSize = 50;  // Шаг между объектами
        this.chunkCount = 60; // Количество пар объектов (60 * 50 = 3000 метров)
        this.worldLength = this.chunkSize * this.chunkCount; // Полная длина круга

        this.initResources();
        this.initRoad();
        this.initSky();
        this.initBuildings();
    }

    initResources() {
        // 1. Normal Map (Генерация шума для рельефа стен)
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

        // 2. Текстуры окон
        this.windowTextures = [];
        this.holoTextures = []; 

        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 64, 128);
            
            const baseColor = new THREE.Color(this.colors[Math.floor(Math.random() * this.colors.length)]);
            const altColor = new THREE.Color(0xff4400); 

            for (let y = 10; y < 120; y += 12) {
                for (let x = 8; x < 56; x += 10) {
                    if (Math.random() > 0.3) {
                        const isAlt = Math.random() < 0.05; 
                        ctx.fillStyle = '#' + (isAlt ? altColor.getHexString() : baseColor.getHexString());
                        ctx.fillRect(x, y, 6, 8);
                    }
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            this.windowTextures.push(tex);
        }

        // 3. Текстуры рекламы (для столбов)
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const c = this.colors[Math.floor(Math.random()*this.colors.length)];
            const color = '#' + new THREE.Color(c).getHexString();
            
            ctx.clearRect(0,0,128,64);
            ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(2,2,124,60);
            ctx.fillStyle = color; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            const words = ["NEON", "RACE", "BUY", "CYBER"];
            ctx.fillText(words[i%4], 64, 40);

            const tex = new THREE.CanvasTexture(canvas);
            this.holoTextures.push(tex);
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
        grid.position.y = 0.05;
        grid.position.z = -200;
        grid.scale.z = 5;
        this.scene.add(grid);
        this.roadGrid = grid;

        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,64,512);
        ctx.fillStyle = '#ffea00'; 
        ctx.fillRect(28, 50, 8, 100);
        ctx.fillRect(28, 250, 8, 100);
        ctx.fillRect(28, 450, 8, 100);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 10);

        const lineGeo = new THREE.PlaneGeometry(2, 1000);
        const lineMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: 0xffffff });
        
        this.centerLine = new THREE.Mesh(lineGeo, lineMat);
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
        // Создаем 60 пар объектов (3000 метров трассы)
        for (let i = 0; i < this.chunkCount; i++) {
            this.spawnPair(-i * this.chunkSize);
        }
    }

    spawnPair(z) {
        this.spawnCounter++;
        
        // ЦИКЛ: 15 Город -> 5 Пустошь (Фонари)
        const cyclePos = this.spawnCounter % 20; 
        const isCity = cyclePos < 15;

        if (isCity) {
            // --- ГОРОД ---
            const isMega = (this.spawnCounter % 50 === 0);
            const xLeft = -45 - Math.random() * 5; 
            const xRight = 45 + Math.random() * 5;
            
            const b1 = this.createBuilding(xLeft, z, isMega);
            const b2 = this.createBuilding(xRight, z, isMega);

            if (!isMega && Math.random() > 0.5) { 
                 this.createBridge(b1, b2);
            }
        } else {
            // --- ПУСТОШЬ (ФОНАРИ И ЩИТЫ) ---
            this.createRoadProp(-45, z);
            this.createRoadProp(45, z);
        }
    }

    createRoadProp(x, z) {
        const isLight = Math.random() > 0.4; // 60% Фонари, 40% Щиты
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // Помечаем тип, чтобы в update не менять их размер
        group.userData = { type: 'prop' };

        if (isLight) {
            // Фонарь
            const poleH = 25;
            const poleGeo = new THREE.CylinderGeometry(0.5, 0.8, poleH, 6);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = poleH / 2;
            group.add(pole);

            const armGeo = new THREE.BoxGeometry(10, 0.5, 0.5);
            const arm = new THREE.Mesh(armGeo, poleMat);
            arm.position.set(x > 0 ? -5 : 5, poleH, 0); 
            group.add(arm);

            const lightColor = 0x00f3ff; 
            const lightGeo = new THREE.BoxGeometry(2, 0.5, 4);
            const lightMat = new THREE.MeshBasicMaterial({ color: lightColor });
            const lamp = new THREE.Mesh(lightGeo, lightMat);
            lamp.position.set(x > 0 ? -9 : 9, poleH - 0.5, 0); 
            group.add(lamp);

            // Реальный свет
            const pl = new THREE.PointLight(lightColor, 2, 40);
            pl.position.set(0, -2, 0);
            lamp.add(pl);
        } else {
            // Рекламный столб
            const poleH = 15;
            const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, poleH, 6);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = poleH / 2;
            group.add(pole);

            const w = 15; const h = 8;
            const screenGeo = new THREE.PlaneGeometry(w, h);
            const tex = this.holoTextures[Math.floor(Math.random() * this.holoTextures.length)];
            const screenMat = new THREE.MeshBasicMaterial({ 
                map: tex, side: THREE.DoubleSide, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
            });
            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.y = poleH + h/2;
            screen.rotation.y = x > 0 ? -Math.PI / 4 : Math.PI / 4;
            group.add(screen);
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
        
        const bridgeColors = [0x555555, 0x334455, 0x554433, 0x444444, 0x223322];
        const color = bridgeColors[Math.floor(Math.random() * bridgeColors.length)];
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set((b1.position.x + b2.position.x)/2, h, b1.position.z);
        mesh.userData = { type: 'bridge' };
        
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    createBuilding(x, z, isMega) {
        const h = (isMega ? 150 : 50) + Math.random() * 100;
        const w = 40; 
        const d = 50; 

        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        const currentTex = tex.clone();
        currentTex.needsUpdate = true;
        currentTex.wrapS = THREE.RepeatWrapping; 
        currentTex.wrapT = THREE.RepeatWrapping;
        currentTex.repeat.set(1, h / 30);

        const geo = new THREE.BoxGeometry(w, h, d);
        
        const matBody = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            map: currentTex,
            emissive: 0xffffff,
            emissiveMap: currentTex,
            emissiveIntensity: 1.5,
            normalMap: this.normalMap,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geo, matBody);
        mesh.userData = { type: 'building', baseH: h };

        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const baseColorHex = this.colors[colorIndex];
        const edges = new THREE.EdgesGeometry(geo);
        const matLine = new THREE.LineBasicMaterial({ color: baseColorHex, linewidth: 2 });
        const wires = new THREE.LineSegments(edges, matLine);
        mesh.add(wires);

        if (Math.random() > 0.3) {
            const dGeo = new THREE.BoxGeometry(w+0.2, h, d+0.2, 1, Math.floor(h/5), 1);
            const dEdges = new THREE.EdgesGeometry(dGeo);
            const dWires = new THREE.LineSegments(dEdges, matLine);
            mesh.add(dWires);
        }

        if (Math.random() > 0.5) {
            const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, h * 0.9, 8);
            const pipeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.position.set(w/2 + 1, 0, 0); 
            mesh.add(pipe);
        }

        const beaconGeo = new THREE.SphereGeometry(1, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = h/2;
        mesh.add(beacon);

        const light = new THREE.PointLight(0xff0000, 2, 50);
        light.position.set(0, 0, 0);
        beacon.add(light);

        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
        
        return mesh;
    }

    update(speed, dt) {
        const dist = speed * dt;
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;
        this.centerLine.material.map.offset.y -= dist * 0.05;

        // ПРАВИЛЬНЫЙ ЦИКЛИЧНЫЙ РЕСПАУН
        this.buildings.forEach(b => {
            b.position.z += dist;
            
            // Если объект ушел за спину (Z > 50)
            if (b.position.z > 50) {
                // Переносим его ровно в хвост очереди
                // Вычитаем длину мира (3000), чтобы сохранить смещение
                b.position.z -= this.worldLength;
                
                // Если это здание, немного меняем его вид для разнообразия
                if (b.userData.type === 'building') {
                    const newH = 50 + Math.random() * 100;
                    b.scale.y = newH / b.geometry.parameters.height;
                    b.position.y = newH / 2;
                }
            }
        });
    }
}
