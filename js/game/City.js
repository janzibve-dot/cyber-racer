import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.colors = CONFIG.colors.palette;

        // Кэшируем текстуры окон (чтобы не тормозило)
        this.windowTextures = [];
        this.initResources();

        this.initRoad();
        this.initEnvironment(); // Вернул небо/пол
        this.initBuildings();
    }

    initResources() {
        // Генерируем текстуры окон 1 раз
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            // Темный фон здания
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, 64, 128);

            // Окна (яркие, чтобы было видно)
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            ctx.fillStyle = '#' + new THREE.Color(color).getHexString();

            for (let y = 10; y < 120; y += 12) {
                for (let x = 8; x < 56; x += 10) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(x, y, 6, 8);
                    }
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            // NearestFilter делает пиксели четкими (ретро стиль)
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

        // Разметка
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

    initEnvironment() {
        // Сетка снизу и сверху для атмосферы
        const gridBottom = new THREE.GridHelper(1000, 50, 0x1a1a20, 0x000000);
        gridBottom.position.y = -10;
        this.scene.add(gridBottom);

        const gridTop = new THREE.GridHelper(1000, 50, CONFIG.colors.neonPink, 0x000000);
        gridTop.position.y = 100;
        gridTop.material.opacity = 0.2;
        gridTop.material.transparent = true;
        this.scene.add(gridTop);
    }

    initBuildings() {
        // ПЛОТНОСТЬ: Генерируем 40 пар, шаг 50 (равен глубине здания)
        for (let i = 0; i < 40; i++) {
            this.spawnPair(-i * 50);
        }
    }

    spawnPair(z) {
        // ВПЛОТНУЮ: Дорога ширина ~40. Центр дороги 0. Край 20.
        // Ставим здания на 25 + половина ширины.
        // Фиксируем X, чтобы была стена.
        this.createBuilding(-45, z); // Слева
        this.createBuilding(45, z);  // Справа
    }

    createBuilding(x, z) {
        const h = 60 + Math.random() * 120; // Высокие
        const w = 40; // Широкие, чтобы закрыть фон
        const d = 50; // Глубина совпадает с шагом спавна -> нет щелей

        // Используем MeshBasicMaterial + Текстуру (ОН ВСЕГДА ВИДЕН)
        const tex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
        // Клонируем текстуру, чтобы настроить повторение под высоту
        const currentTex = tex.clone();
        currentTex.needsUpdate = true;
        currentTex.wrapS = THREE.RepeatWrapping;
        currentTex.wrapT = THREE.RepeatWrapping;
        currentTex.repeat.set(1, h / 64);

        const geo = new THREE.BoxGeometry(w, h, d);
        const matBody = new THREE.MeshBasicMaterial({ 
            map: currentTex, 
            color: 0xffffff // Белый, чтобы не тонировать текстуру
        });
        const mesh = new THREE.Mesh(geo, matBody);

        // Обводка (Неон)
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const neonColor = this.colors[colorIndex];
        
        const edges = new THREE.EdgesGeometry(geo);
        const matLine = new THREE.LineBasicMaterial({ color: neonColor, linewidth: 2 });
        const wires = new THREE.LineSegments(edges, matLine);
        mesh.add(wires);

        // Антенна на крыше (простая, чтобы не грузить)
        const antH = 20;
        const antGeo = new THREE.CylinderGeometry(0.5, 0.5, antH, 6);
        const antMat = new THREE.MeshBasicMaterial({ color: neonColor });
        const ant = new THREE.Mesh(antGeo, antMat);
        ant.position.y = h / 2 + antH / 2;
        mesh.add(ant);

        // Труба сбоку (для детализации)
        if (Math.random() > 0.5) {
            const pipeGeo = new THREE.CylinderGeometry(2, 2, h * 0.8, 8);
            const pipeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            // Прижимаем к стороне, обращенной к дороге
            const xShift = x > 0 ? -w/2 - 2 : w/2 + 2; 
            pipe.position.set(xShift, 0, 0); 
            mesh.add(pipe);
        }

        mesh.position.set(x, h/2, z);
        this.scene.add(mesh);
        this.buildings.push(mesh);
    }

    update(speed, dt) {
        const dist = speed * dt;
        this.roadGrid.position.z += dist;
        if (this.roadGrid.position.z > 0) this.roadGrid.position.z = -200;
        this.centerLine.material.map.offset.y -= dist * 0.05;

        this.buildings.forEach(b => {
            b.position.z += dist;
            // Респаун: 40 зданий * 50 глубина = 2000
            if (b.position.z > 50) {
                b.position.z = -1950;
                
                // Меняем высоту и текстуру при респауне для разнообразия
                const newH = 60 + Math.random() * 120;
                // Масштабируем по Y
                const scaleFactor = newH / b.geometry.parameters.height;
                b.scale.y = scaleFactor;
                b.position.y = newH / 2;
            }
        });
    }
}
