import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.colors = CONFIG.colors.palette;

        this.initRoad();
        this.initSky();
        this.initBuildings();
    }

    initRoad() {
        // Асфальт
        const geo = new THREE.PlaneGeometry(CONFIG.road.width, 1000);
        const mat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        this.road = new THREE.Mesh(geo, mat);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -200;
        this.scene.add(this.road);

        // Боковая сетка (синяя)
        const grid = new THREE.GridHelper(CONFIG.road.width, 4, 0x00f3ff, 0x00f3ff);
        grid.position.y = 0.05;
        grid.position.z = -200;
        grid.scale.z = 5;
        this.scene.add(grid);
        this.roadGrid = grid;

        // ЦЕНТРАЛЬНАЯ РАЗМЕТКА (Желтая, прерывистая)
        // Создаем текстуру через Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        // Прозрачный фон
        ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,64,512);
        // Желтая полоса
        ctx.fillStyle = '#ffea00'; 
        // Рисуем пунктир (3 полоски на текстуру)
        ctx.fillRect(28, 50, 8, 100);
        ctx.fillRect(28, 250, 8, 100);
        ctx.fillRect(28, 450, 8, 100);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 10); // Повторяем вдоль дороги

        const lineGeo = new THREE.PlaneGeometry(2, 1000); // Ширина полосы 2м
        const lineMat = new THREE.MeshBasicMaterial({ 
            map: tex, 
            transparent: true,
            color: 0xffffff 
        });
        
        this.centerLine = new THREE.Mesh(lineGeo, lineMat);
        this.centerLine.rotation.x = -Math.PI / 2;
        this.centerLine.position.y = 0.06; // Чуть выше асфальта
        this.centerLine.position.z = -200;
        this.scene.add(this.centerLine);
    }

    initSky() {
        const grid = new THREE.GridHelper(600, 40, 0x111133, 0x111133);
        grid.position.y = 80;
        this.scene.add(grid);
    }

    initBuildings() {
        for (let i = 0; i < 40; i++) {
            this.spawnPair(-i * 25); // Чуть увеличили дистанцию между домами
        }
    }

    spawnPair(z) {
        // Хаотичный отступ (Depth)
        // Левая сторона: от -35 до -55
        const xLeft = -35 - Math.random() * 20; 
        // Правая сторона: от 35 до 55
        const xRight = 35 + Math.random() * 20;

        this.createBuilding(xLeft, z);
        this.createBuilding(xRight, z);
    }

    createBuilding(x, z) {
        // Разнообразные размеры
        const h = 30 + Math.random() * 90; // Высота от 30 до 120
        const w = 10 + Math.random() * 20; // Ширина
        const d = 10 + Math.random() * 20; // Глубина

        // 1. Выбираем цвета
        // Цвет дома (приглушаем его, умножая на 0.3, чтобы не был "вырвиглаз")
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const baseColorHex = this.colors[colorIndex];
        const baseColor = new THREE.Color(baseColorHex).multiplyScalar(0.2); // Темный вариант
        
        // Цвет обводки (должен отличаться от цвета дома)
        let outlineColorHex = baseColorHex;
        // Крутим цикл, пока не найдем другой цвет
        while (outlineColorHex === baseColorHex) {
            outlineColorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        }

        // 2. Тело здания
        const geo = new THREE.BoxGeometry(w, h, d);
        const matBody = new THREE.MeshBasicMaterial({ color: baseColor });
        const mesh = new THREE.Mesh(geo, matBody);

        // 3. Неоновая обводка
        const edges = new THREE.EdgesGeometry(geo);
        const matLine = new THREE.LineBasicMaterial({ color: outlineColorHex, linewidth: 2 });
        const wires = new THREE.LineSegments(edges, matLine);
        mesh.add(wires);

        // 4. Детали (горизонтальные полоски)
        if (Math.random() > 0.3) {
            const dGeo = new THREE.BoxGeometry(w+0.2, h, d+0.2, 1, Math.floor(h/5), 1);
            const dEdges = new THREE.EdgesGeometry(dGeo);
            // Детали того же цвета, что и обводка, но прозрачнее (опционально)
            const dWires = new THREE.LineSegments(dEdges, matLine);
            mesh.add(dWires);
        }

        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;
        
        // 1. Двигаем пол и разметку
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;

        // Двигаем текстуру разметки (эффект езды)
        this.centerLine.material.map.offset.y -= dist * 0.05;

        // 2. Двигаем здания
        this.buildings.forEach(b => {
            b.position.z += dist;
            if (b.position.z > 20) {
                b.position.z = -800; // Отправляем далеко назад
                
                // ПОЛНАЯ РЕГЕНЕРАЦИЯ (Хаос) при возврате
                // Меняем позицию X (глубина)
                const isRight = b.position.x > 0;
                b.position.x = isRight ? (35 + Math.random()*20) : (-35 - Math.random()*20);
                
                // Меняем высоту
                const newH = 30 + Math.random() * 90;
                b.scale.y = newH / b.geometry.parameters.height;
                b.position.y = newH / 2;
                
                // Примечание: цвет поменять сложнее без пересоздания материала, 
                // оставим старый цвет для оптимизации.
            }
        });
    }
}
