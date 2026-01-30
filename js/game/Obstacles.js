import * as THREE from 'three';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.poolSize = 30; // Увеличил пул до 30, чтобы хватало на высокой скорости
        this.pool = [];     
        this.spawnTimer = 0;

        // Создаем материалы один раз (Оптимизация)
        this.matBox = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            roughness: 0.4, 
            metalness: 0.6,
            emissive: 0x330000 
        });
        
        this.matBarrier = new THREE.MeshStandardMaterial({ 
            color: 0xffaa00, 
            roughness: 0.1, 
            metalness: 0.8,
            emissive: 0xff4400,
            emissiveIntensity: 0.5
        }); 

        this.matMine = new THREE.MeshStandardMaterial({ 
            color: 0xff00ff, 
            emissive: 0xff00ff, 
            emissiveIntensity: 2.0,
            wireframe: true // Стиль "голограммы" для мины
        });

        // Базовая геометрия (Куб) - будем её трансформировать
        this.geometry = new THREE.BoxGeometry(1, 1, 1);

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const mesh = new THREE.Mesh(this.geometry, this.matBox);
            
            // Скрываем и прячем под карту
            mesh.visible = false; 
            mesh.position.set(0, -100, 0); 
            
            // Данные объекта
            mesh.userData = { 
                active: false, 
                type: 'none',
                hitboxRadius: 1.0 
            };

            this.scene.add(mesh);
            this.pool.push(mesh);
        }
    }

    spawn() {
        // 1. Ищем первый свободный объект в пуле
        const item = this.pool.find(p => !p.userData.active);
        if (!item) return; // Пул исчерпан, пропускаем кадр

        // 2. Выбираем тип препятствия
        const rand = Math.random();
        let type = 'box';

        if (rand > 0.6) type = 'barrier'; // 30% шанс барьера
        if (rand > 0.9) type = 'mine';    // 10% шанс мины

        // 3. Настраиваем объект под тип
        this.configureItem(item, type);

        // 4. Позиция X
        // Барьеры ставим аккуратнее, чтобы не застревали в стенах
        const limit = type === 'barrier' ? 8 : 14; 
        const xPos = (Math.random() * (limit * 2)) - limit;

        // 5. Активация
        item.position.set(xPos, item.scale.y / 2, -100); // Z = -100 (вдали)
        item.visible = true;
        item.userData.active = true;
    }

    configureItem(mesh, type) {
        mesh.userData.type = type;
        
        // Сбрасываем вращение
        mesh.rotation.set(0, 0, 0);

        if (type === 'box') {
            // Обычный ящик
            mesh.scale.set(1.5, 1.5, 1.5);
            mesh.material = this.matBox;
            mesh.userData.hitboxRadius = 1.0; 
        } 
        else if (type === 'barrier') {
            // Широкий низкий блок (нужно перепрыгнуть или объехать)
            mesh.scale.set(10, 1.2, 1); 
            mesh.material = this.matBarrier;
            mesh.userData.hitboxRadius = 2.0; 
        } 
        else if (type === 'mine') {
            // Маленькая вращающаяся мина
            mesh.scale.set(1, 1, 1);
            mesh.material = this.matMine;
            mesh.userData.hitboxRadius = 0.6;
        }
    }

    update(speed, dt) {
        // Частота спавна зависит от скорости
        // При 0 скорости - не спавним. При макс - каждые 0.4 сек.
        if (speed > 10) {
            const spawnRate = Math.max(0.4, 2.0 - (speed / 100)); 
            this.spawnTimer += dt;
            if (this.spawnTimer > spawnRate) {
                this.spawn();
                this.spawnTimer = 0;
            }
        }

        // Движение активных объектов
        this.pool.forEach(item => {
            if (!item.userData.active) return;

            item.position.z += speed * dt;

            // Вращаем мину
            if (item.userData.type === 'mine') {
                item.rotation.x += dt * 3;
                item.rotation.y += dt * 3;
            }

            // Ушел за спину (Z > 20) -> Деактивируем
            if (item.position.z > 20) {
                item.visible = false;
                item.userData.active = false;
                item.position.y = -100;
            }
        });
    }
}
