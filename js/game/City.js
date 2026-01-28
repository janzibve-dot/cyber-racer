// js/game/City.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        
        // Создаем текстуру дороги программно (без картинок)
        this.roadTexture = this.createProceduralRoadTexture();
        this.roadTexture.wrapS = THREE.RepeatWrapping;
        this.roadTexture.wrapT = THREE.RepeatWrapping;
        // Повторяем текстуру 1 раз по ширине и 20 раз по длине
        this.roadTexture.repeat.set(1, 20); 
        // Важно для пиксель-арт стиля или четкости линий
        this.roadTexture.anisotropy = 16; 

        this.initRoad();
    }

    // Магия: Рисуем текстуру асфальта прямо в памяти браузера
    createProceduralRoadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // 1. Черный фон (Асфальт)
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 512, 512);

        // 2. Шум (зернистость асфальта)
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 5000; i++) {
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // 3. Неоновые полосы по бокам
        ctx.fillStyle = '#00f3ff'; // Cyan
        ctx.fillRect(0, 0, 10, 512); // Левая
        ctx.fillRect(502, 0, 10, 512); // Правая

        // 4. Центральная прерывистая линия
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(250, 0, 12, 512);

        return new THREE.CanvasTexture(canvas);
    }

    initRoad() {
        // Создаем плоскость дороги
        const geometry = new THREE.PlaneGeometry(CONFIG.road.width, CONFIG.road.length);
        
        // Material с Emissive (свечением)
        const material = new THREE.MeshStandardMaterial({
            map: this.roadTexture,       // Наша нарисованная текстура
            roughness: 0.8,              // Асфальт шершавый
            metalness: 0.2,
            emissive: CONFIG.colors.neonCyan, // Свечение
            emissiveMap: this.roadTexture,    // Карта свечения (светится то, что яркое на текстуре)
            emissiveIntensity: 0.5            // Сила свечения
        });

        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2; // Кладем на пол
        road.position.z = -100; // Сдвигаем чуть вперед, чтобы не видеть начала
        this.scene.add(road);
        
        this.roadMesh = road;
    }

    update(speed, dt) {
        // Двигаем текстуру, а не сам объект! 
        // Это самый производительный способ имитации движения.
        // speed * dt * коэффициент масштаба
        this.roadTexture.offset.y -= speed * dt * 0.05;
    }
}
