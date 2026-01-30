import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.colors = CONFIG.colors.palette;

        this.spawnCounter = 0;

        this.initResources();
        this.initRoad();
        this.initSky();
        this.initBuildings();
    }

    initResources() {
        // 1. Normal Map
        const canvasNorm = document.createElement('canvas');
        canvasNorm.width = 128; canvasNorm.height = 128; // Оптимизация размера
        const ctxNorm = canvasNorm.getContext('2d');
        const imgData = ctxNorm.createImageData(128, 128);
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
        // ИЗМЕНЕНИЕ: Шаг 1 метр. Всего 2000 метров.
        for (let i = 0; i < 2000; i++) {
            this.spawnPair(-i * 1);
        }
    }

    spawnPair(z) {
        this.spawnCounter++;
        const isMega = (this.spawnCounter % 200 === 0); // Реже, так как шаг 1

        const xLeft = -45 - Math.random() * 2; // Меньше дрожания для ровной стены
        const xRight = 45 + Math.random() * 2;
        
        const b1 = this.createBuilding(xLeft, z, isMega);
        const b2 = this.createBuilding(xRight, z, isMega);

        // ИЗМЕНЕНИЕ: Мосты.
        // Так как вызывается каждый метр, шанс должен быть маленьким (0.02),
        // но чтобы в итоге их было "почаще", подберем значение.
        // 0.02 * 100 метров = 2 моста на 100 метров.
        if (!isMega && Math.random() < 0.03) { 
             this.createBridge(b1, b2);
        }
    }

    createBridge(b1, b2) {
        const dx = b2.position.x - b1.position.x;
        const dist = Math.sqrt(dx*dx);
        const h = Math.min(b1.position.y, b2.position.y) + 5; 

        const geo = new THREE.CylinderGeometry(1, 1, dist, 6); // Меньше полигонов (6 граней)
        geo.rotateZ(Math.PI / 2);
        
        // ИЗМЕНЕНИЕ: Цвета разные, но не яркие
        const bridgeColors = [0x555555, 0x334455, 0x554433, 0x444444, 0x223322];
        const color = bridgeColors[Math.floor(Math.random() * bridgeColors.length)];
        
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set((b1.position.x + b2.position.x)/2, h, b1.position.z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    createBuilding(x, z, isMega) {
        const h = (isMega ? 150 : 50) + Math.random() * 100;
        const w = 40; 
        const d = 1; // ИЗМЕНЕНИЕ: Глубина 1 метр (под шаг)

        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        // Не клонируем текстуру каждый раз для оптимизации 4000 объектов
        // Используем одну из общих
        
        const geo = new THREE.BoxGeometry(w, h, d);
        
        const matBody = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            map: tex,
            emissive: 0xffffff,
            emissiveMap: tex,
            emissiveIntensity: 1.5,
            normalMap: this.normalMap,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geo, matBody);

        // Оптимизация: Обводку делаем реже, иначе 8000 draw calls убьют FPS
        // Делаем обводку только каждому 10-му метру
        if (this.spawnCounter % 10 === 0) {
            const colorIndex = Math.floor(Math.random() * this.colors.length);
            const baseColorHex = this.colors[colorIndex];
            const edges = new THREE.EdgesGeometry(geo);
            const matLine = new THREE.LineBasicMaterial({ color: baseColorHex, linewidth: 2 });
            const wires = new THREE.LineSegments(edges, matLine);
            mesh.add(wires);
        }

        // Оптимизация: Детали (трубы, маячки) только иногда
        if (Math.random() < 0.05) { // 5% шанс на метр
            const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, h * 0.9, 6);
            const pipeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.position.set(w/2 + 1, 0, 0); 
            mesh.add(pipe);
        }

        if (Math.random() < 0.05) { // 5% шанс на маячок
            const beaconGeo = new THREE.SphereGeometry(1, 4, 4); // Low poly
            const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.y = h/2;
            mesh.add(beacon);
            // Light убираем для массовости, оставим emissive точки
        }

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

        // Оптимизация цикла обновления для 4000 объектов
        const count = this.buildings.length;
        for(let i=0; i<count; i++) {
            const b = this.buildings[i];
            b.position.z += dist;
            if (b.position.z > 50) {
                b.position.z = -1950;
                // Меняем скейл для разнообразия "на лету"
                b.scale.y = 0.5 + Math.random(); 
                b.position.y = (b.geometry.parameters.height * b.scale.y) / 2;
            }
        }
    }
}
