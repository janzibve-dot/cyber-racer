import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.speed = 30; // Скорость игры (метров в секунду)
        
        // Цвета из твоего CSS
        this.colors = {
            cyan: 0x00f3ff,
            pink: 0xff00ff,
            road: 0x1a1a20
        };

        this.initRoad();
    }

    initRoad() {
        // Создаем "пол" - бесконечную сетку
        // GridHelper(размер, кол-во делений, цвет центра, цвет клетки)
        const gridHelper = new THREE.GridHelper(400, 100, this.colors.pink, this.colors.cyan);
        gridHelper.position.y = -0.5; // Чуть ниже колес
        this.scene.add(gridHelper);
        this.grid = gridHelper;

        // Добавим простую плоскость под сеткой, чтобы снизу было темно
        const planeGeo = new THREE.PlaneGeometry(400, 400);
        const planeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2; // Поворачиваем горизонтально
        plane.position.y = -0.6;
        this.scene.add(plane);
    }

    update(dt) {
        // Эффект бесконечного движения
        // Двигаем сетку по оси Z навстречу камере
        const moveDistance = this.speed * dt;
        
        this.grid.position.z += moveDistance;

        // Если сетка сместилась на размер одной клетки (4 метра), сбрасываем её назад
        // 400 размер / 100 делений = 4
        if (this.grid.position.z >= 4) {
            this.grid.position.z = 0;
        }
    }
}
