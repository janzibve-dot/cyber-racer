import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; 
        this.colors = CONFIG.colors.palette;
        
        // Материалы для отбойников (храним ссылки для анимации)
        this.barrierMatLeft = null;
        this.barrierMatRight = null;

        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.initEnvironment();
        this.initRoad();
        this.initBarriers(); 
        this.initBuildings();
    }

    initEnvironment() {
        const gridHelper = new THREE.GridHelper(2000, 100, 0x1a1a20, 0x000000);
        gridHelper.position.y = -10;
        gridHelper.position.z = -500;
        this.cityGroup.add(gridHelper);

        const skyGrid = new THREE.GridHelper(2000, 40, CONFIG.colors.neonPink, 0x000000);
        skyGrid.position.y = 150;
        skyGrid.position.z = -500;
        skyGrid.material.transparent = true;
        skyGrid.material.opacity = 0.15;
        this.cityGroup.add(skyGrid);
    }

    initRoad() {
        // УЛУЧШЕНИЕ: MeshStandardMaterial для отражений
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.4, 
            metalness: 0.8 
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
        // УЛУЧШЕНИЕ: Сохраняем материалы для пульсации
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
            this.spawnBuildingPair(-i * 40); 
        }
    }

    spawnBuildingPair(z) {
        this.createComplexBuilding(true, z);  
        this.createComplexBuilding(false, z); 
    }

    // УЛУЧШЕНИЕ: Создание текстуры для "голограммы" (код иероглифов)
    createHoloTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = colorHex;
        ctx.font = 'bold 20px Arial';
        // Имитация кибер-текста
        const text = Math.random() > 0.5 ? "SYSTEM" : "CORP";
        const num = Math.floor(Math.random() * 99);
        ctx.fillText(`${text}-${num}`, 10, 40);
        ctx.fillRect(10, 50, Math.random()*100, 4);
        
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }

    createComplexBuilding(isLeft, z) {
        const xOffset = isLeft ? -Math.random() * 40 - 45 : Math.random() * 40 + 45;
        
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const baseColorHex = this.colors[colorIndex];
        const baseColor = new THREE.Color(baseColorHex).multiplyScalar(0.2);
        let outlineColorHex = baseColorHex;
        while (outlineColorHex === baseColorHex && this.colors.length > 1) { 
            outlineColorHex = this.colors[Math.floor(Math.random() * this.colors.length)]; 
        }

        const width = 15 + Math.random() * 20;
        const depth = 15 + Math.random() * 20;
        const height = 50 + Math.random() * 150; 
        
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xOffset, 0, z);

        // УЛУЧШЕНИЕ: Разнообразие форм (Куб или Цилиндр)
        const isCylinder = Math.random() > 0.7; 
        let geo, edges;

        if (isCylinder) {
            geo = new THREE.CylinderGeometry(width/2, width/2, height, 8);
            edges = new THREE.EdgesGeometry(geo);
        } else {
            geo = new THREE.BoxGeometry(width, height, depth);
            edges = new THREE.EdgesGeometry(geo);
        }

        const mat = new THREE.MeshBasicMaterial({ color: baseColor });
        const core = new THREE.Mesh(geo, mat);
        core.position.y = height / 2;
        buildingGroup.add(core);

        const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: outlineColorHex }));
        core.add(lines);

        // УЛУЧШЕНИЕ: Рекламный щит (Голограмма)
        if (Math.random() > 0.6) {
            const holoW = width * 0.8;
            const holoH = 10;
            const holoGeo = new THREE.PlaneGeometry(holoW, holoH);
            const holoTex = this.createHoloTexture(outlineColorHex);
            const holoMat = new THREE.MeshBasicMaterial({ 
                map: holoTex, 
                transparent: true, 
                opacity: 0.8,
                side: THREE.DoubleSide,
                color: 0xffffff
            });
            const holoMesh = new THREE.Mesh(holoGeo, holoMat);
            // Выносим чуть вперед от здания
            const zShift = isLeft ? (depth/2 + 2) : -(depth/2 + 2); // С разных сторон
            holoMesh.position.set(0, height * 0.7, depth/2 + 1);
            if (Math.random() > 0.5) holoMesh.rotation.y = Math.PI; // Разворот
            buildingGroup.add(holoMesh);
        }

        // Окна
        if (!isCylinder) { // Окна только на кубах пока
            const windowGeo = new THREE.PlaneGeometry(2, height * 0.8);
            const windowMat = new THREE.MeshBasicMaterial({ color: outlineColorHex, side: THREE.DoubleSide });
            const windowMesh = new THREE.Mesh(windowGeo, windowMat);
            windowMesh.position.set(0, height/2, depth/2 + 0.1); 
            if (Math.random() > 0.5) windowMesh.rotation.y = Math.PI; 
            buildingGroup.add(windowMesh);
        }

        this.cityGroup.add(buildingGroup);
        this.buildings.push(buildingGroup);
    }

    update(speed, dt) {
        const moveDistance = speed * dt;

        this.centerLine.material.map.offset.y -= moveDistance * 0.02;
        
        // УЛУЧШЕНИЕ: Пульсация отбойников от скорости
        // Чем быстрее едем, тем быстрее мигает
        const time = Date.now() * 0.005 * (speed / 50); 
        const pulse = 0.5 + Math.sin(time) * 0.5; // от 0.5 до 1.0
        
        if (this.barrierMatLeft) this.barrierMatLeft.opacity = pulse;
        // Правый мигает в противофазе
        if (this.barrierMatRight) this.barrierMatRight.opacity = 1.5 - pulse; 

        this.buildings.forEach(b => {
            b.position.z += moveDistance;

            if (b.position.z > 50) {
                b.position.z = -1150; 
                
                const isLeft = b.position.x < 0;
                b.position.x = isLeft ? (-Math.random() * 40 - 45) : (Math.random() * 40 + 45);
                
                const scaleY = 0.5 + Math.random() * 1.5;
                b.scale.set(1, scaleY, 1);
            }
        });

        this.roadGrid.position.z += moveDistance;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -500;
    }
}
