import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from './Config.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = [];
        
        // Физические параметры
        this.sideSpeed = 0.25; 
        this.targetX = 0;
        this.tilt = 0;
        
        this.initCar();
        this.initControls();
        
        this.mesh.position.set(0, 0.5, -5); 
        this.scene.add(this.mesh);
    }

    initCar() {
        // Корпус (Cyber-Chassis)
        const bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 4.5);
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        
        // Неоновая обводка корпуса
        const bodyEdges = new THREE.EdgesGeometry(bodyGeo);
        const bodyLines = new THREE.LineSegments(bodyEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonCyan }));
        body.add(bodyLines);
        this.mesh.add(body);

        // Кабина с розовым неоном
        const cabinGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
        const cabin = new THREE.Mesh(cabinGeo, bodyMat);
        cabin.position.set(0, 0.6, -0.2);
        const cabinEdges = new THREE.EdgesGeometry(cabinGeo);
        const cabinLines = new THREE.LineSegments(cabinEdges, new THREE.LineBasicMaterial({ color: CONFIG.colors.neonPink }));
        cabin.add(cabinLines);
        this.mesh.add(cabin);

        // Колеса
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const wheelLineMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.neonYellow });
        
        const positions = [{ x: -1.2, z: 1.5 }, { x: 1.2, z: 1.5 }, { x: -1.2, z: -1.5 }, { x: 1.2, z: -1.5 }];
        positions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            const wEdges = new THREE.EdgesGeometry(wheelGeo);
            wheel.add(new THREE.LineSegments(wEdges, wheelLineMat));
            wheelGroup.add(wheel);
            wheelGroup.position.set(pos.x, 0, pos.z);
            this.mesh.add(wheelGroup);
            this.wheels.push(wheel);
        });
    }

    initControls() {
        this.keys = { a: false, d: false, left: false, right: false };
        
        // Клавиатура
        window.addEventListener('keydown', (e) => this.handleKeys(e.code, true));
        window.addEventListener('keyup', (e) => this.handleKeys(e.code, false));

        // Мышь и Тач (Движение за курсором/пальцем)
        window.addEventListener('mousemove', (e) => this.handlePointer(e.clientX));
        window.addEventListener('touchmove', (e) => this.handlePointer(e.touches[0].clientX));
    }

    handleKeys(code, isPressed) {
        if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = isPressed;
        if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = isPressed;
    }

    handlePointer(clientX) {
        // Переводим координаты экрана в диапазон от -18 до 18 (ширина трассы)
        const percent = clientX / window.innerWidth;
        this.targetX = (percent - 0.5) * CONFIG.road.width * 0.8;
    }

    update(speed, dt) {
        // Управление клавиатурой
        if (this.keys.left) this.targetX -= this.sideSpeed * 60 * dt;
        if (this.keys.right) this.targetX += this.sideSpeed * 60 * dt;

        // Ограничение по границам трассы
        const limit = (CONFIG.road.width / 2) - 2;
        this.targetX = Math.max(-limit, Math.min(limit, this.targetX));

        // Плавное движение к цели (Lerp)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.1;

        // Эффект наклона при повороте
        const tiltTarget = (this.mesh.position.x - this.targetX) * 0.5;
        this.mesh.rotation.z += (tiltTarget - this.mesh.rotation.z) * 0.1;
        this.mesh.rotation.y = -(this.mesh.position.x - this.targetX) * 0.1;

        // Вращение колес
        const rotationSpeed = speed * dt * 0.5;
        this.wheels.forEach(w => w.rotation.x += rotationSpeed);

        // Левитация (эффект киберпанка)
        this.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
    }
}
