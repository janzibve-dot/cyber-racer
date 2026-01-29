export const CONFIG = {
    colors: {
        sky: 0x020205,
        fog: 0x020205,
        // Палитра для домов (Желтый, Красный, Салатовый, Фиолетовый, Синий, Голубой)
        palette: [0xffea00, 0xff0055, 0x33ff00, 0x9900ff, 0x0000ff, 0x00f3ff],
        roadLine: 0xffea00 // Желтая разметка
    },
    camera: {
        type: 'perspective',
        fov: 75,
        near: 0.1,
        far: 1000,
        // Базовая высота камеры
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
