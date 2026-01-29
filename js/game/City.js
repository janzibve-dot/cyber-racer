import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; 
        this.barriers = [];  
        this.colors = CONFIG.colors.palette;
        
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
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        const mat = new THREE.MeshBasicMaterial({ color: 0x050505 });
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
        
        ctx.fillStyle = 'rgba(0,0,0,0)'; 
        ctx.fillRect(0,0,64,512);
        
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
        const createBarrierSide = (xPos, color) => {
            const geo = new THREE.BoxGeometry(1, 2, 2000);
            const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            const mesh = new THREE.Mesh(geo, mat);
            
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
            mesh.add(line);

            mesh.position.set(xPos, 1, -500);
            this.cityGroup.add(mesh);
            return mesh;
        };

        this.leftBarrier = createBarrierSide(-(CONFIG.road.width / 2) - 2, CONFIG.colors.neonPink);
        this.rightBarrier = createBarrierSide((CONFIG.road.width / 2) + 2, CONFIG.colors.neonCyan);
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

    createComplexBuilding(isLeft, z) {
        const xOffset = isLeft ? -Math.random() * 40 - 45 : Math.random() * 40 + 45;
        
        // ВОЗВРАЩЕНА ЛОГИКА ЦВЕТОВ ИЗ ТВОЕГО КОДА
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const baseColorHex = this.colors[colorIndex];
        const baseColor = new THREE.Color(baseColorHex).multiplyScalar(0.2); // Затемненная основа
        let outlineColorHex = baseColorHex;
        // Ищем контрастный цвет для обводки
        while (outlineColorHex === baseColorHex && this.colors.length > 1) { 
            outlineColorHex = this.colors[Math.floor(Math.random() * this.colors.length)]; 
        }

        const width = 15 + Math.random() * 20;
        const depth = 15 + Math.random() * 20;
        const height = 50 + Math.random() * 150; 
        
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xOffset, 0, z);

        // Основное тело с твоей цветовой схемой
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshBasicMaterial({ color: baseColor });
        const core = new THREE.Mesh(geo, mat);
        core.position.y = height / 2;
        buildingGroup.add(core);

        // Обводка с контрастным цветом
        const edges = new THREE.EdgesGeometry(geo);
        const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: outlineColorHex }));
        core.add(lines);

        // Детали (второй этаж)
        if (Math.random() > 0.7) {
            const topW = width * 0.5;
            const topH = height * 0.3;
            const topGeo = new THREE.BoxGeometry(topW, topH, depth * 0.5);
            const topMesh = new THREE.Mesh(topGeo, mat); // Используем тот же материал основы
            
            const topEdges = new THREE.EdgesGeometry(topGeo);
            const topLines = new THREE.LineSegments(topEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonYellow }));
            topMesh.add(topLines);

            topMesh.position.y = height + (topH / 2);
            buildingGroup.add(topMesh);
        }

        // Окна
        const windowGeo = new THREE.PlaneGeometry(2, height * 0.8);
        const windowMat = new THREE.MeshBasicMaterial({ color: outlineColorHex, side: THREE.DoubleSide });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, height/2, depth/2 + 0.1); 
        if (Math.random() > 0.5) windowMesh.rotation.y = Math.PI; 
        buildingGroup.add(windowMesh);

        this.cityGroup.add(buildingGroup);
        this.buildings.push(buildingGroup);
    }

    update(speed, dt) {
        const moveDistance = speed * dt;

        this.centerLine.material.map.offset.y -= moveDistance * 0.02;
        
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
