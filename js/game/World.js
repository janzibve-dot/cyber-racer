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
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        // Туман
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 100, 300);

        // 2. Рендер
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // 3. ОРТОГОНАЛЬНАЯ КАМЕРА
        const aspect = this.width / this.height;
        const s = CONFIG.camera.viewSize;

        this.camera = new THREE.OrthographicCamera(
            -s * aspect, // left
            s * aspect,  // right
            s,           // top
            -s,          // bottom
            1,           // near
            1000         // far
        );

        this.camera.position.set(20, 20, 20); 
        this.camera.lookAt(0, 0, 0);

        // 4. Свет
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(CONFIG.colors.neonCyan, 0.8);
        dirLight.position.set(10, 50, 20);
        this.scene.add(dirLight);
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
        
        // Плавный разгон
        this.currentSpeed = this.lerp(this.currentSpeed, this.targetSpeed, dt * CONFIG.speed.acceleration);

        // Обновляем город
        if (this.city) this.city.update(this.currentSpeed, dt);

        this.renderer.render(this.scene, this.camera);
    }
}
