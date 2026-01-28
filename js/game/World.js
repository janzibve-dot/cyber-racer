import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { City } from './City.js';
import { CONFIG } from './Config.js';

export class World {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.currentSpeed = CONFIG.speed.start;
        this.targetSpeed = CONFIG.speed.max;

        this.initScene();
        this.city = new City(this.scene);
        
        this.clock = new THREE.Clock();
        window.addEventListener('resize', () => this.onResize());
        this.animate();
    }

    initScene() {
        // 1. Сцена
        this.scene = new THREE.Scene();
        // Используем цвет из конфига. Если экран черный - значит конфиг обновился!
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 50, 200);

        // 2. Рендер
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // 3. КАМЕРА (ИСПРАВЛЕНА ПОЗИЦИЯ)
        const aspect = this.width / this.height;
        const s = CONFIG.camera.viewSize;

        this.camera = new THREE.OrthographicCamera(
            -s * aspect, s * aspect, 
            s, -s, 
            1, 1000
        );

        // Ставим камеру ровно сзади и сверху (Classic Arcade View)
        // x=0 (центр), y=30 (высота), z=30 (дистанция)
        this.camera.position.set(0, 30, 30); 
        // Смотрим чуть вперед по дороге
        this.camera.lookAt(0, 0, -20);

        // 4. Свет
        const ambient = new THREE.AmbientLight(0xffffff, 1.0); // Яркий общий свет
        this.scene.add(ambient);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const aspect = this.width / this.height;
        const s = CONFIG.camera.viewSize;
        
        this.camera.left = -s * aspect;
        this.camera.right = s * aspect;
        this.camera.top = s;
        this.camera.bottom = -s;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        
        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        if (this.city) this.city.update(this.currentSpeed, dt);

        this.renderer.render(this.scene, this.camera);
    }
}
