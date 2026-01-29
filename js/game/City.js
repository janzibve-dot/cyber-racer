import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; 
        this.colors = CONFIG.colors.palette;
        
        // Кэши
        this.windowTextures = []; 
        this.holoTextures = [];   
        this.normalMap = null; 
        
        this.spawnCounter = 0; 
        this.hitTimerLeft = 0;
        this.hitTimerRight = 0;
        this.barrierMatLeft = null;
        this.barrierMatRight = null;

        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.initResources(); 
        this.initEnvironment();
        this.initRoad();
        this.initBarriers(); 
        this.initBuildings();
    }

    initResources() {
        // 1. Normal Map (Шум для бетона)
        const canvasNorm = document.createElement('canvas');
        canvasNorm.width = 256; canvasNorm.height = 256;
        const ctxNorm = canvasNorm.getContext('2d');
        const imgData = ctxNorm.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const val = 128 + Math.random() * 127; // Светлый шум
            imgData.data[i] = val;
            imgData.data[i+1] = val;
            imgData.data[i+2] = val;
            imgData.data[i+3] = 255;
        }
        ctxNorm.putImageData(imgData, 0, 0);
        this.normalMap = new THREE.CanvasTexture(canvasNorm);
        this.normalMap.wrapS = THREE.RepeatWrapping;
        this.normalMap.wrapT = THREE.RepeatWrapping;

        // 2. Текстуры окон (ЯРКИЕ)
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Фон посветлее (темно-серый, не черный)
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, 128, 256);

            const baseColor = new THREE.Color(this.colors[Math.floor(Math.random() * this.colors.length)]);
            const altColor = new THREE.Color(0xff4400); // Ярко-оранжевый

            for (let y = 10; y < 250; y += 15) {
                for (let x = 5; x < 120; x += 10) {
                    if (Math.random() > 0.3) { // Больше окон горит (70%)
                        const isAlt = Math.random() < 0.05; // 5% других
                        ctx.fillStyle = '#' + (isAlt ? altColor.getHexString() : baseColor.getHexString());
                        ctx.fillRect(x, y, 6, 10);
                    }
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            this.windowTextures.push(tex);
        }

        // 3. Голограммы
        for (let i = 0; i < 10; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const colorStr = '#' + new THREE.Color(color).getHexString();

            ctx.clearRect(0, 0, 256, 128);
            ctx.shadowColor = colorStr;
            ctx.shadowBlur = 20; // Сильное свечение
            ctx.strokeStyle = colorStr;
            ctx.lineWidth = 6;
            ctx.strokeRect(10, 10, 236, 108);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 45px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const words = ["NEO", "CORP", "DATA", "SOUL", "VIVE", "TECH", "OMNI", "ZION"];
            ctx.fillText(words[Math.floor(Math.random() * words.length)], 128, 64);
            
            const tex = new THREE.CanvasTexture(canvas);
            this.holoTextures.push(tex);
        }
    }

    initEnvironment() {
        // Подсветка снизу
        const gridHelper = new THREE.GridHelper(2000, 100, 0x222222, 0x000000);
        gridHelper.position.y = -10;
        gridHelper.position.z = -500;
        this.cityGroup.add(gridHelper);
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, // Светлее асфальт
            roughness: 0.3, 
            metalness: 0.7,
            normalMap: this.normalMap,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -500;
        this.cityGroup.add(this.road);

        const grid = new THREE.GridHelper(CONFIG.road.width, 4, CONFIG.colors.neonCyan, CONFIG.colors.neonCyan);
        grid.position.y = 0.1;
        grid.position.z = -500;
        grid.scale.z = 10;
        this.cityGroup.add(grid);
        this.roadGrid = grid;

        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,64,512);
        ctx.fillStyle = '#ffea00'; 
        ctx.fillRect(24, 50, 16, 120);
        ctx.fillRect(24, 300, 16, 120);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 20); 

        const lineGeo = new THREE.PlaneGeometry(4, 2000);
        const lineMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        this.centerLine = new THREE.Mesh(lineGeo, lineMat);
        this.centerLine.rotation.x = -Math.PI / 2;
        this.centerLine.position.y = 0.15;
        this.centerLine.position.z = -500;
        this.cityGroup.add(this.centerLine);
    }

    initBarriers() {
        this.barrierMatLeft = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonPink });
        this.barrierMatRight = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan });

        const createBarrierSide = (xPos, mat) => {
            const geo = new THREE.BoxGeometry(1, 2, 2000);
            const baseMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            const mesh = new THREE.Mesh(geo, baseMat);
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, mat);
            mesh.add(line);
            mesh.position.set(xPos, 1, -500);
            this.cityGroup.add(mesh);
            return mesh;
        };

        this.leftBarrier = createBarrierSide(-(CONFIG.road.width / 2) - 2, this.barrierMatLeft);
        this.rightBarrier = createBarrierSide((CONFIG.road.width / 2) + 2, this.barrierMatRight);
    }

    initBuildings() {
        // УВЕЛИЧЕНА ПЛОТНОСТЬ: Шаг 30 вместо 50 (вплотную)
        // Больше зданий (60 пар), чтобы перекрыть дистанцию
        for (let i = 0; i < 60; i++) {
            this.spawnBuildingPair(-i * 30); 
        }
    }

    spawnBuildingPair(z) {
        this.spawnCounter++;
        const isMega = (this.spawnCounter % 50 === 0); 
        
        if (isMega) {
             this.createRealisticBuilding(true, z, true);
             this.createRealisticBuilding(false, z, true);
             this.createBridge(z, 70, 200); 
        } else {
             this.createRealisticBuilding(true, z, false);
             this.createRealisticBuilding(false, z, false);
             
             if (Math.random() > 0.85) {
                 this.createBridge(z, 25 + Math.random() * 30, 100); 
             }
        }
    }

    createBridge(z, height, width) {
        const geo = new THREE.CylinderGeometry(3, 3, width, 8);
        geo.rotateZ(Math.PI / 2);
        // Светлый материал
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, height, z);
        
        const ringGeo = new THREE.TorusGeometry(3.5, 0.3, 8, 16);
        ringGeo.rotateY(Math.PI / 2);
        
        const neonColor = CONFIG.colors.palette[Math.floor(Math.random()*CONFIG.colors.palette.length)];
        const ringMat = new THREE.MeshBasicMaterial({ color: neonColor });
        
        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.position.x = -width/3;
        ring1.rotateY(Math.PI/2);
        mesh.add(ring1);
        
        const ring2 = new THREE.Mesh(ringGeo, ringMat);
        ring2.position.x = width/3;
        ring2.rotateY(Math.PI/2);
        mesh.add(ring2);

        this.cityGroup.add(mesh);
        this.buildings.push(mesh);
    }

    createRealisticBuilding(isLeft, z, isMega) {
        // ВПЛОТНУЮ К ДОРОГЕ:
        // Дорога ширина 40. Край = 20. Ставим здание на 20 + половина ширины.
        // xOffset стал меньше, чтобы здания нависали.
        const gap = isMega ? 40 : 25; 
        const xOffset = isLeft ? -gap - (Math.random() * 5) : gap + (Math.random() * 5);
        
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xOffset, 0, z);

        const baseWidth = (isMega ? 50 : 25) + Math.random() * 10;
        const baseDepth = 28 + Math.random() * 5; // Глубина почти равна шагу (30), чтобы не было дыр
        const totalHeight = (isMega ? 350 : 90) + Math.random() * 150;

        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        const currentTex = tex.clone(); 
        currentTex.needsUpdate = true;
        currentTex.repeat.set(isMega ? 3 : 1, totalHeight / 50);

        // ЯРКИЙ МАТЕРИАЛ
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x666666, // Серый, не черный
            map: currentTex,
            emissive: 0xffffff,
            emissiveMap: currentTex,
            emissiveIntensity: 1.2, // ОЧЕНЬ ЯРКИЕ ОКНА
            roughness: 0.6,
            metalness: 0.3,
            normalMap: this.normalMap,
            normalScale: new THREE.Vector2(1, 1)
        });

        const neonColorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        const neonMat = new THREE.MeshBasicMaterial({ color: neonColorHex });

        let currentY = 0;
        let currentW = baseWidth;
        let currentD = baseDepth;

        const sections = Math.floor(Math.random() * 3) + 1; 

        for(let i = 0; i < sections; i++) {
            const sectionH = (totalHeight / sections) * (0.8 + Math.random() * 0.4);
            const geo = new THREE.BoxGeometry(currentW, sectionH, currentD);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.y = currentY + sectionH / 2;
            buildingGroup.add(mesh);

            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: neonColorHex }));
            mesh.add(line);
            
            // ТРУБЫ И ВЕНТИЛЯЦИЯ
            if (Math.random() > 0.4) {
                const pipeH = sectionH * 0.9;
                const pipeGeo = new THREE.CylinderGeometry(2, 2, pipeH, 12);
                const pipeMesh = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({
                    color: 0x444444, roughness: 0.5, metalness: 0.8
                }));
                
                const side = Math.floor(Math.random()*4);
                // Прижимаем трубы к стенам
                if(side === 0) pipeMesh.position.set(currentW/2 + 2, currentY + pipeH/2, 0); 
                else if(side === 1) pipeMesh.position.set(-currentW/2 - 2, currentY + pipeH/2, 0);
                else if(side === 2) pipeMesh.position.set(0, currentY + pipeH/2, currentD/2 + 2);
                else pipeMesh.position.set(0, currentY + pipeH/2, -currentD/2 - 2);
                
                buildingGroup.add(pipeMesh);
            }

            currentY += sectionH;
            currentW *= (0.65 + Math.random() * 0.2); // Чуть меньше сужение
            currentD *= (0.65 + Math.random() * 0.2);
        }

        // Антенна
        const antH = 15 + Math.random() * 40;
        const antGeo = new THREE.CylinderGeometry(0.8, 0.8, antH, 8);
        const antMesh = new THREE.Mesh(antGeo, neonMat);
        antMesh.position.y = currentY + antH / 2;
        buildingGroup.add(antMesh);

        // МАЯЧОК
        const beaconGeo = new THREE.SphereGeometry(2, 8, 8); // Побольше
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.y = antH / 2; 
        antMesh.add(beaconMesh);

        // Свет маячка
        const light = new THREE.PointLight(0xff0000, 3, 150); 
        light.position.set(0, 0, 0);
        beaconMesh.add(light);

        // Реклама (побольше шанс)
        if (Math.random() > 0.4) {
            const holoW = baseWidth;
            const holoH = 20;
            const holoGeo = new THREE.PlaneGeometry(holoW, holoH);
            const holoTex = this.holoTextures[Math.floor(Math.random() * this.holoTextures.length)];
            const holoMat = new THREE.MeshBasicMaterial({ 
                map: holoTex, transparent: true, opacity: 1.0, 
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending 
            });
            const holoMesh = new THREE.Mesh(holoGeo, holoMat);
            holoMesh.position.set(0, totalHeight * 0.5, (baseDepth/2) + 1);
            if(Math.random() > 0.5) holoMesh.rotation.y = Math.PI; 
            buildingGroup.add(holoMesh);
        }

        this.cityGroup.add(buildingGroup);
        this.buildings.push(buildingGroup);
        return buildingGroup;
    }

    triggerBarrierHit(side) {
        if (side === 'left') this.hitTimerLeft = 1.0;
        if (side === 'right') this.hitTimerRight = 1.0;
    }

    update(speed, dt) {
        const moveDistance = speed * dt;
        this.centerLine.material.map.offset.y -= moveDistance * 0.02;

        const time = Date.now() * 0.005 * (speed / 50); 
        const basePulse = 0.5 + Math.sin(time) * 0.5; 

        if (this.hitTimerLeft > 0) {
            this.hitTimerLeft -= dt * 2;
            this.barrierMatLeft.color.setHex(0xff0000);
            this.barrierMatLeft.opacity = Math.random();
        } else {
            this.barrierMatLeft.color.setHex(CONFIG.colors.neonPink);
            this.barrierMatLeft.opacity = basePulse;
        }

        if (this.hitTimerRight > 0) {
            this.hitTimerRight -= dt * 2;
            this.barrierMatRight.color.setHex(0xff0000);
            this.barrierMatRight.opacity = Math.random();
        } else {
            this.barrierMatRight.color.setHex(CONFIG.colors.neonCyan);
            this.barrierMatRight.opacity = 1.5 - basePulse; 
        }

        this.buildings.forEach(b => {
            b.position.z += moveDistance;
            // Условие респауна: так как плотность выше, зданий больше.
            // 60 пар * 30 дистанция = 1800. Респаун на > 50 переносим на -1750.
            if (b.position.z > 50) {
                b.position.z = -1750; 
                
                // Простая перегенерация формы (Скейл)
                // Для Мега-Башен это может выглядеть странно при ресайзе,
                // но так как они редкие, шанс попадания мал.
                // Лучше просто рандомить высоту.
                b.scale.set(1, 0.5 + Math.random(), 1); 
            }
        });

        this.roadGrid.position.z += moveDistance;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -500;
    }
}
