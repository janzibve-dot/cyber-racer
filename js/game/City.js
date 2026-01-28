// js/game/City.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        
        // Материалы для линий (Неон)
        this.matCyan = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan, linewidth: 2 });
        this.matYellow = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonYellow, linewidth: 2 });
        this.matRed = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonRed, linewidth: 2 });
        
        // Материал для "тела" здания (черный, закрывает звезды за собой)
        this.matBody = new THREE.MeshBasicMaterial({ color: CONFIG.colors.buildingBody });

        this.initRoad();
        this.initSkyGrid(); // Сетка в небе как на фото
        this.initBuildings();
    }

    initRoad() {
        // Простая черная дорога с синими краями
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 1000);
        const mat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -200; // Уходит вдаль
        this.scene.add(this.road);

        // Линии разметки (Грид на полу)
        const grid = new THREE.GridHelper(CONFIG.road.width, 4, CONFIG.colors.neonCyan, CONFIG.colors.neonCyan);
        grid.position.y = 0.1;
        grid.position.z = -200;
        grid.scale.z = 5; // Растягиваем вдоль
        this.scene.add(grid);
        this.roadGrid = grid;
    }

    initSkyGrid() {
        // Создаем "цифровое небо" (сетка сверху)
        const grid = new THREE.GridHelper(600, 40, 0x111133, 0x111133);
        grid.position.y = 80; // Высоко в небе
        this.scene.add(grid);
    }

    initBuildings() {
        // Генерируем плотную застройку
        for (let i = 0; i < 40; i++) {
            // z от -10 (близко) до -400 (далеко)
            this.spawnBuildingPair(-i * 20); 
        }
    }

    spawnBuildingPair(z) {
        // Левое здание
        this.createWireframeBuilding(-35, z);
        // Правое здание
        this.createWireframeBuilding(35, z);
    }

    createWireframeBuilding(x, z) {
        // Случайная высота (от 40 до 120 метров - небоскребы)
        const h = 40 + Math.random() * 80;
        const w = 15 + Math.random() * 10; // Ширина
        const d = 15 + Math.random() * 10; // Глубина

        // 1. Черное тело (чтобы не было видно сквозь него)
        const geometry = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geometry, this.matBody);
        
        // 2. Светящийся каркас (EdgesGeometry)
        const edges = new THREE.EdgesGeometry(geometry);
        
        // Выбираем цвет случайно (70% синий, 20% желтый, 10% красный)
        const rand = Math.random();
        let lineMat = this.matCyan;
        if (rand > 0.7) lineMat = this.matYellow;
        if (rand > 0.9) lineMat = this.matRed;

        const wireframe = new THREE.LineSegments(edges, lineMat);
        mesh.add(wireframe); // Добавляем линии к кубу

        // Добавляем "окна" или поперечные линии для детализации (как на фото)
        if (Math.random() > 0.5) {
            const linesGeo = new THREE.BoxGeometry(w + 0.2, h, d + 0.2, 1, 10, 1); // 10 сегментов по высоте
            const linesEdges = new THREE.EdgesGeometry(linesGeo);
            // Удаляем вертикальные линии, оставляем горизонтальные (хак через масштабирование или просто второй wireframe)
            const details = new THREE.LineSegments(linesEdges, lineMat);
            details.scale.set(1.01, 1, 1.01);
            mesh.add(details);
        }

        mesh.position.set(x, h / 2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;

        // Двигаем дорогу (эффект движения)
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;

        // Двигаем здания навстречу
        this.buildings.forEach(b => {
            b.position.z += dist;

            // Если здание улетело за спину (z > 10)
            if (b.position.z > 20) {
                b.position.z = -700; // Отправляем далеко вперед (цикл)
                
                // Перегенерируем высоту для разнообразия
                const newH = 40 + Math.random() * 80;
                b.scale.y = newH / b.geometry.parameters.height;
                b.position.y = newH / 2;
            }
        });
    }
}
