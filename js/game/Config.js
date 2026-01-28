// js/game/Config.js
export const CONFIG = {
    colors: {
        sky: 0x020205,      // Почти черный фон
        fog: 0x020205,      // Туман в цвет фона для глубины
        neonCyan: 0x00f3ff, // Основной цвет линий (как на фото)
        neonYellow: 0xffea00, // Желтые вывески
        neonRed: 0xff0055,    // Красные акценты
        buildingBody: 0x000000 // Сами здания черные
    },
    camera: {
        type: 'perspective', // ВЕРНУЛИ ПЕРСПЕКТИВУ для эффекта высоты
        fov: 75,             // Широкий угол обзора
        near: 0.1,
        far: 1000,
        // Позиция "глаз": высота 2 метра (как человек/машина), центр дороги
        position: { x: 0, y: 2.5, z: 0 } 
    },
    speed: {
        start: 0,
        max: 80,
        acceleration: 0.8
    },
    road: {
        width: 40,
        length: 200
    }
};
