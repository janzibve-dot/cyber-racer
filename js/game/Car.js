import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        
        // Настройки размеров машины
        this.width = 2.2;
        this.height = 1.0;
        this.length = 4.5;

        this.initCar();
        
        // Начальная позиция (по центру дороги)
        this.mesh.position.set(0, 0.5, -5); 
        this.scene.add(this.mesh);
    }

    initCar() {
        // 1. КОРПУС (Основа)
        const bodyGeo = new THREE.BoxGeometry(this.width, this.height, this.length);
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Черное нутро
        const body = new THREE.Mesh(bodyGeo, bodyMat);

        // Неоновая обводка корпуса
        const bodyEdges = new THREE.EdgesGeometry(bodyGeo);
        const bodyLines = new THREE.LineSegments(bodyEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan, linewidth: 2 }));
        body.add(bodyLines);

        // Смещение корпуса чуть вверх
        body.position.y = 0.5;
        this.mesh.add(body);

        // 2. КАБИНА (Верх)
        const cabinGeo = new THREE.BoxGeometry(this.width * 0.8, 0.6, this.length * 0.5);
        const cabin = new THREE.Mesh(cabinGeo, bodyMat);
        cabin.position.set(0, 1.3, -0.5);
        
        const cabinEdges = new THREE.EdgesGeometry(cabinGeo);
        const cabinLines = new THREE.LineSegments(cabinEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonPink, linewidth: 2 }));
        cabin.add(cabinLines);
        this.mesh.add(cabin);

        // 3. КОЛЕСА (4 штуки)
        this.wheels = [];
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
        wheelGeo.rotateZ(Math.PI / 2); // Поворачиваем цилиндр на бок
        const wheelMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const wheelEdges = new THREE.EdgesGeometry(wheelGeo);
        const wheelLineMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonYellow });

        const positions = [
            { x: -1.2, z: 1.5 },  // Переднее левое
            { x: 1.2, z: 1.5 },   // Переднее правое
            { x: -1.2, z: -1.5 }, // Заднее левое
            { x: 1.2, z: -1.5 }   // Заднее правое
        ];

        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            const wLines = new THREE.LineSegments(wheelEdges, wheelLineMat);
            wheel.add(wLines);
            
            wheel.position.set(pos.x, 0.4, pos.z);
            this.mesh.add(wheel);
            this.wheels.push(wheel);
        });

        // 4. ФАРЫ (Свет)
        // Задние габариты (Красные точки)
        const tailGeo = new THREE.PlaneGeometry(0.5, 0.2);
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        
        const tailL = new THREE.Mesh(tailGeo, tailMat);
        tailL.position.set(-0.8, 0.8, 2.26); // Сзади слева
        tailL.rotation.y = Math.PI;
        this.mesh.add(tailL);

        const tailR = new THREE.Mesh(tailGeo, tailMat);
        tailR.position.set(0.8, 0.8, 2.26); // Сзади справа
        tailR.rotation.y = Math.PI;
        this.mesh.add(tailR);

        // Передние фары (Спотлайты)
        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0.5, -20);
        this.mesh.add(lightTarget);

        const spotL = new THREE.SpotLight(0xffffff, 2.0, 50, 0.5, 0.5, 1);
        spotL.position.set(-0.8, 0.8, -2);
        spotL.target = lightTarget;
        this.mesh.add(spotL);

        const spotR = new THREE.SpotLight(0xffffff, 2.0, 50, 0.5, 0.5, 1);
        spotR.position.set(0.8, 0.8, -2);
        spotR.target = lightTarget;
        this.mesh.add(spotR);
    }

    update(speed, dt) {
        // Анимация вращения колес (чем быстрее скорость, тем быстрее крутятся)
        const rotationSpeed = speed * dt * 0.5;
        this.wheels.forEach(wheel => {
            wheel.rotation.x += rotationSpeed;
        });

        // Легкая вибрация корпуса (имитация двигателя)
        this.mesh.position.y = 0.5 + Math.random() * 0.02;
    }
}
