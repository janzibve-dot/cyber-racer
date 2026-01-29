import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; 
        this.colors = CONFIG.colors.palette;
        
        // Кэши ресурсов
        this.windowTextures = []; // Текстуры фасадов
        this.holoTextures = [];   // Текстуры рекламы
        
        // Состояние удара
        this.hitTimerLeft = 0;
        this.hitTimerRight = 0;

        // Материалы отбойников
        this.barrierMatLeft = null;
        this.barrierMatRight = null;

        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.initResources(); // Генерация всех текстур
        this.initEnvironment();
        this.initRoad();
        this.initBarriers(); 
        this.initBuildings();
    }

    initResources() {
        // 1. Генерация текстур окон (Фасады)
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Фон (темный бетон/стекло)
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, 128, 256);

            // Окна
            const windowColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            ctx.fillStyle = '#' + new THREE.Color(windowColor).getHexString();
            
            // Рисуем сетку окон
            for (let y = 10; y < 250; y += 15) {
                for (let x = 5; x < 120; x += 10) {
                    if (Math.random() > 0.4) { // Не все окна горят
                        ctx.fillRect(x, y, 6, 10);
                    }
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            this.windowTextures.push(tex);
        }

        // 2. Генерация текстур голограмм (Реклама)
        for (let i = 0; i < 10; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const colorStr = '#' + new THREE.Color(color).getHexString();

            ctx.clearRect(0, 0, 256, 128);
            ctx.shadowColor = colorStr;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = colorStr;
            ctx.lineWidth = 5;
            ctx.strokeRect(10, 10, 236, 108);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const words = ["NEO", "CORP", "DATA", "SOUL", "VIVE", "TECH", "OMNI", "ZION"];
            const text = words[Math.floor(Math.random() * words.length)];
            
            ctx.fillText(text, 128, 64);
            
            const tex = new THREE.CanvasTexture(canvas);
            this.holoTextures.push(tex);
        }
    }

    initEnvironment() {
        const gridHelper = new THREE.GridHelper(2000, 100, 0x1a1a20, 0x000000);
        gridHelper.position.y = -10;
        gridHelper.position.z = -500;
        this.cityGroup.add(gridHelper);
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.2, 
            metalness: 0.9 
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
            const baseMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
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
        for (let i = 0; i < 30; i++) {
            this.spawnBuildingPair(-i * 45); // Чуть больше расстояние для массивных зданий
        }
    }

    spawnBuildingPair(z) {
        this.createRealisticBuilding(true, z);  
        this.createRealisticBuilding(false, z); 
    }

    createRealisticBuilding(isLeft, z) {
        // Случайный сдвиг и размеры
        const xOffset = isLeft ? -Math.random() * 50 - 50 : Math.random() * 50 + 50;
        
        // Главная группа здания
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xOffset, 0, z);

        // Параметры
        const baseWidth = 20 + Math.random() * 25;
        const baseDepth = 20 + Math.random() * 25;
        const totalHeight = 80 + Math.random() * 200;

        // Выбираем текстуру
        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        // Настройка повторения текстуры под размер здания
        const currentTex = tex.clone(); 
        currentTex.needsUpdate = true;
        currentTex.repeat.set(1, totalHeight / 60); // Растягиваем текстуру вертикально

        // Материал здания (реагирует на свет + светится сам)
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            map: currentTex,
            emissive: 0xffffff,
            emissiveMap: currentTex,
            emissiveIntensity: 0.8, // Яркость окон
            roughness: 0.3,
            metalness: 0.6
        });

        // ЦВЕТОВАЯ СХЕМА: Неон на крыше и гранях
        const neonColorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        const neonMat = new THREE.MeshBasicMaterial({ color: neonColorHex });

        // --- ГЕНЕРАЦИЯ ФОРМЫ (Секции) ---
        // Строим здание из 3 секций ("свадебный торт")
        let currentY = 0;
        let currentW = baseWidth;
        let currentD = baseDepth;

        const sections = Math.floor(Math.random() * 3) + 1; // 1-3 секции

        for(let i = 0; i < sections; i++) {
            const sectionH = (totalHeight / sections) * (0.8 + Math.random() * 0.4);
            
            const geo = new THREE.BoxGeometry(currentW, sectionH, currentD);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.y = currentY + sectionH / 2;
            buildingGroup.add(mesh);

            // Неоновая полоса по углам
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: neonColorHex }));
            mesh.add(line);

            currentY += sectionH;
            // Уменьшаем следующий этаж
            currentW *= (0.6 + Math.random() * 0.3);
            currentD *= (0.6 + Math.random() * 0.3);
        }

        // --- ДЕТАЛИ ---
        // 1. Антенна на крыше
        const antH = 10 + Math.random() * 30;
        const antGeo = new THREE.CylinderGeometry(0.5, 0.5, antH, 8);
        const antMesh = new THREE.Mesh(antGeo, neonMat);
        antMesh.position.y = currentY + antH / 2;
        buildingGroup.add(antMesh);

        // 2. Рекламный щит
        if (Math.random() > 0.5) {
            const holoW = baseWidth * 0.9;
            const holoH = 15;
            const holoGeo = new THREE.PlaneGeometry(holoW, holoH);
            const holoTex = this.holoTextures[Math.floor(Math.random() * this.holoTextures.length)];
            const holoMat = new THREE.MeshBasicMaterial({ 
                map: holoTex, 
                transparent: true, 
                opacity: 0.9, 
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending 
            });
            const holoMesh = new THREE.Mesh(holoGeo, holoMat);
            // Приклеиваем к фасаду первой секции
            holoMesh.position.set(0, totalHeight * 0.4, (baseDepth/2) + 0.5);
            // Разворот в случайную сторону (перед или зад)
            if(Math.random() > 0.5) holoMesh.rotation.y = Math.PI; 
            
            buildingGroup.add(holoMesh);
        }

        this.cityGroup.add(buildingGroup);
        this.buildings.push(buildingGroup);
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
            if (b.position.z > 50) {
                b.position.z = -1300; // Дальше, чтобы не видеть спавна
                const isLeft = b.position.x < 0;
                b.position.x = isLeft ? (-Math.random() * 50 - 50) : (Math.random() * 50 + 50);
                
                // Чтобы изменить высоту, нужно пересоздавать геометрию или скейлить.
                // Скейл всей группы работает лучше.
                b.scale.set(1, 0.5 + Math.random(), 1); 
            }
        });

        this.roadGrid.position.z += moveDistance;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -500;
    }
}
