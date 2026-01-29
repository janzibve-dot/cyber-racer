import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = []; // Массив активных зданий
        this.barriers = [];  // Массив ограждений
        this.colors = CONFIG.colors.palette;
        
        // Группы для порядка в сцене
        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.initEnvironment();
        this.initRoad();
        this.initBarriers(); // Новые неоновые отбойники
        this.initBuildings();
    }

    initEnvironment() {
        // "Кибер-пол" (Сетка снизу для глубины)
        const gridHelper = new THREE.GridHelper(2000, 100, 0x1a1a20, 0x000000);
        gridHelper.position.y = -10;
        gridHelper.position.z = -500;
        this.cityGroup.add(gridHelper);

        // "Неоновый потолок" (Сетка сверху для атмосферы)
        const skyGrid = new THREE.GridHelper(2000, 40, CONFIG.colors.neonPink, 0x000000);
        skyGrid.position.y = 150;
        skyGrid.position.z = -500;
        skyGrid.material.transparent = true;
        skyGrid.material.opacity = 0.15;
        this.cityGroup.add(skyGrid);
    }

    initRoad() {
        // Основное полотно дороги
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 2000);
        const mat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -500;
        this.cityGroup.add(this.road);

        // Светящаяся сетка на дороге
        const grid = new THREE.GridHelper(CONFIG.road.width, 4, CONFIG.colors.neonCyan, CONFIG.colors.neonCyan);
        grid.position.y = 0.1;
        grid.position.z = -500;
        grid.scale.z = 10;
        this.cityGroup.add(grid);
        this.roadGrid = grid;

        // Центральная разметка (анимированная текстура)
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Прозрачный фон
        ctx.fillStyle = 'rgba(0,0,0,0)'; 
        ctx.fillRect(0,0,64,512);
        
        // Желтые полосы (стрелки)
        ctx.fillStyle = '#ffea00'; 
        // Рисуем стилизованную стрелку или прерывистую линию
        ctx.fillRect(24, 50, 16, 120);
        ctx.fillRect(24, 300, 16, 120);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 20); // Чаще повторяем

        const lineGeo = new THREE.PlaneGeometry(4, 2000);
        const lineMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        this.centerLine = new THREE.Mesh(lineGeo, lineMat);
        this.centerLine.rotation.x = -Math.PI / 2;
        this.centerLine.position.y = 0.15;
        this.centerLine.position.z = -500;
        this.cityGroup.add(this.centerLine);
    }

    initBarriers() {
        // Создаем неоновые отбойники по краям дороги
        const createBarrierSide = (xPos, color) => {
            const geo = new THREE.BoxGeometry(1, 2, 2000);
            const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            const mesh = new THREE.Mesh(geo, mat);
            
            // Неоновая полоса на отбойнике
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
        // Генерируем 30 пар зданий уходящих вдаль
        for (let i = 0; i < 30; i++) {
            this.spawnBuildingPair(-i * 40); // Расстояние между зданиями 40 единиц
        }
    }

    spawnBuildingPair(z) {
        // Спавним слева и справа
        this.createComplexBuilding(true, z);  // Left
        this.createComplexBuilding(false, z); // Right
    }

    createComplexBuilding(isLeft, z) {
        const xOffset = isLeft ? -Math.random() * 40 - 45 : Math.random() * 40 + 45;
        
        // Случайные параметры здания
        const width = 15 + Math.random() * 20;
        const depth = 15 + Math.random() * 20;
        const height = 50 + Math.random() * 150; // Высокие небоскребы
        
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xOffset, 0, z);

        // Основное тело (Темное)
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshBasicMaterial({ color: 0x0a0a10 });
        const core = new THREE.Mesh(geo, mat);
        core.position.y = height / 2;
        buildingGroup.add(core);

        // Неоновая обводка (Wireframe)
        const colorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        const edges = new THREE.EdgesGeometry(geo);
        const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: colorHex }));
        core.add(lines);

        // Детали: Антенна или второй этаж сверху (30% шанс)
        if (Math.random() > 0.7) {
            const topW = width * 0.5;
            const topH = height * 0.3;
            const topGeo = new THREE.BoxGeometry(topW, topH, depth * 0.5);
            const topMesh = new THREE.Mesh(topGeo, mat);
            
            const topEdges = new THREE.EdgesGeometry(topGeo);
            const topLines = new THREE.LineSegments(topEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonYellow }));
            topMesh.add(topLines);

            topMesh.position.y = height + (topH / 2);
            buildingGroup.add(topMesh);
        }

        // Детали: Случайные "светящиеся окна" (PlaneGeometry)
        const windowGeo = new THREE.PlaneGeometry(2, height * 0.8);
        const windowMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        // Смещаем окно на грань здания
        windowMesh.position.set(0, height/2, depth/2 + 0.1); 
        if (Math.random() > 0.5) windowMesh.rotation.y = Math.PI; // Иногда с другой стороны
        buildingGroup.add(windowMesh);

        this.cityGroup.add(buildingGroup);
        this.buildings.push(buildingGroup);
    }

    update(speed, dt) {
        const moveDistance = speed * dt;

        // 1. Двигаем дорогу и текстуру (Эффект скорости)
        // Сбрасываем текстуру, чтобы она не "уползала" бесконечно
        this.centerLine.material.map.offset.y -= moveDistance * 0.02;

        // 2. Эффект бесконечного движения для объектов окружения
        // Мы не двигаем каждый объект отдельно (это дорого).
        // Мы двигаем всю группу города назад, а когда она уходит слишком далеко — возвращаем объекты.
        
        // НО, так как у нас процедурная генерация, проще двигать объекты к камере:
        
        this.buildings.forEach(b => {
            b.position.z += moveDistance;

            // Если здание ушло за спину игрока (z > 20), переносим его в конец очереди
            if (b.position.z > 50) {
                b.position.z = -1150; // Перемещаем далеко вперед (30 пар * 40 dist)
                
                // Перегенерируем высоту и цвет для разнообразия
                // (В упрощенной версии просто меняем позицию X для эффекта нового города)
                const isLeft = b.position.x < 0;
                b.position.x = isLeft ? (-Math.random() * 40 - 45) : (Math.random() * 40 + 45);
                
                // Масштабируем по Y, чтобы изменить высоту здания динамически
                const scaleY = 0.5 + Math.random() * 1.5;
                b.scale.set(1, scaleY, 1);
            }
        });

        // Анимация пола и потолка (бесконечный скролл)
        const gridSpeed = moveDistance * 0.5; // Синхронизация с сеткой
        // Сдвиг UV координат или позиции не всегда работает с GridHelper идеально,
        // поэтому просто переносим их, если ушли за камеру.
        // Но GridHelper в Three.js не имеет текстуры offset.
        // Оставим их статичными для фона, или будем двигать всю группу roadGrid.
        
        this.roadGrid.position.z += moveDistance;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -500;
    }
}
