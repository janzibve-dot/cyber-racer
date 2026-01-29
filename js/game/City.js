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

    initSky() {
        const grid = new THREE.GridHelper(600, 40, 0x111133, 0x111133);
        grid.position.y = 80;
        this.scene.add(grid);
    }

    initBuildings() {
        for (let i = 0; i < 40; i++) {
            this.spawnPair(-i * 25);
        }
    }

    spawnPair(z) {
        const xLeft = -35 - Math.random() * 20; 
        const xRight = 35 + Math.random() * 20;
        this.createBuilding(xLeft, z);
        this.createBuilding(xRight, z);
    }

    createBuilding(x, z) {
        const h = 30 + Math.random() * 90;
        const w = 10 + Math.random() * 20;
        const d = 10 + Math.random() * 20;

        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const baseColorHex = this.colors[colorIndex];
        const baseColor = new THREE.Color(baseColorHex).multiplyScalar(0.2);
        
        let outlineColorHex = baseColorHex;
        while (outlineColorHex === baseColorHex) {
            outlineColorHex = this.colors[Math.floor(Math.random() * this.colors.length)];
        }

        const geo = new THREE.BoxGeometry(w, h, d);
        const matBody = new THREE.MeshBasicMaterial({ color: baseColor });
        const mesh = new THREE.Mesh(geo, matBody);

        const edges = new THREE.EdgesGeometry(geo);
        const matLine = new THREE.LineBasicMaterial({ color: outlineColorHex, linewidth: 2 });
        const wires = new THREE.LineSegments(edges, matLine);
        mesh.add(wires);

        if (Math.random() > 0.3) {
            const dGeo = new THREE.BoxGeometry(w+0.2, h, d+0.2, 1, Math.floor(h/5), 1);
            const dEdges = new THREE.EdgesGeometry(dGeo);
            const dWires = new THREE.LineSegments(dEdges, matLine);
            mesh.add(dWires);
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
            if (b.position.z > 20) {
                b.position.z = -800;
                const isRight = b.position.x > 0;
                b.position.x = isRight ? (35 + Math.random()*20) : (-35 - Math.random()*20);
                const newH = 30 + Math.random() * 90;
                b.scale.y = newH / b.geometry.parameters.height;
                b.position.y = newH / 2;
            }
        });
    }
}
