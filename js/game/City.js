import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; 
        this.colors = CONFIG.colors.palette; // Используем яркую палитру

        // Материалы отбойников
        this.barrierMatLeft = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonPink });
        this.barrierMatRight = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan });
        // Состояние удара
        this.hitTimerLeft = 0;
        this.hitTimerRight = 0;

        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.initEnvironment();
        this.initRoad();
        this.initBarriers(); 
        this.initBuildings();
    }

    initEnvironment() {
        // Сетка снизу
        const gridHelper = new THREE.GridHelper(2000, 100, 0x333333, 0x000000);
        gridHelper.position.y = -10;
        gridHelper.position.z = -500;
        this.cityGroup.add(gridHelper);
    }

    initRoad() {
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        // Простой материал, чтобы дорогу было видно
        const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
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
        const createBarrierSide = (xPos, mat) => {
            const geo = new THREE.BoxGeometry(1, 2, 2000);
            const baseMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
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
        // ОЧЕНЬ ПЛОТНО: Шаг равен глубине здания (50)
        for (let i = 0; i < 40; i++) {
            this.spawnBuildingPair(-i * 50); 
        }
    }

    spawnBuildingPair(z) {
        this.createSolidBuilding(true, z);  
        this.createSolidBuilding(false, z); 
    }

    createSolidBuilding(isLeft, z) {
        // Фиксированная ширина и глубина для плотности
        const width = 50;
        const depth = 50; 
        const height = 100 + Math.random() * 200; // Разная высота

        // Позиция: Дорога (40) + Барьер (2) + Половина здания (25) = 47.
        // Ставим вплотную.
        const xPos = isLeft ? -47 : 47;

        // Яркий цвет из палитры
        const colorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // MeshBasicMaterial - СВЕТИТСЯ САМ, не нужен свет в сцене
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshBasicMaterial({ 
            color: colorHex,
            wireframe: false // Делаем сплошным
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, height / 2, z);
        
        // Добавляем обводку для стиля
        const edges = new THREE.EdgesGeometry(geo);
        // Контрастный цвет обводки (инверсия или белый)
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.LineSegments(edges, lineMat);
        mesh.add(line);

        this.cityGroup.add(mesh);
        this.buildings.push(mesh);
    }

    triggerBarrierHit(side) {
        if (side === 'left') this.hitTimerLeft = 1.0;
        if (side === 'right') this.hitTimerRight = 1.0;
    }

    update(speed, dt) {
        const moveDistance = speed * dt;
        this.centerLine.material.map.offset.y -= moveDistance * 0.02;

        // Анимация барьеров (оставил, чтобы было видно динамику)
        const time = Date.now() * 0.005 * (speed / 50); 
        const basePulse = 0.5 + Math.sin(time) * 0.5; 

        if (this.hitTimerLeft > 0) {
            this.hitTimerLeft -= dt * 2;
            this.barrierMatLeft.color.setHex(0xff0000);
        } else {
            this.barrierMatLeft.color.setHex(CONFIG.colors.neonPink);
            this.barrierMatLeft.opacity = basePulse;
        }
        if (this.hitTimerRight > 0) {
            this.hitTimerRight -= dt * 2;
            this.barrierMatRight.color.setHex(0xff0000);
        } else {
            this.barrierMatRight.color.setHex(CONFIG.colors.neonCyan);
            this.barrierMatRight.opacity = 1.5 - basePulse; 
        }

        this.buildings.forEach(b => {
            b.position.z += moveDistance;
            // Респаун: 40 зданий * 50 глубина = 2000.
            if (b.position.z > 50) {
                b.position.z = -1950; 
                // Просто меняем высоту для разнообразия
                const newH = 100 + Math.random() * 200;
                b.scale.y = newH / 100; 
                b.position.y = newH / 2;
            }
        });

        this.roadGrid.position.z += moveDistance;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -500;
    }
}
