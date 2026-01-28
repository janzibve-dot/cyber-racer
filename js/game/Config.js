export const CONFIG = {
    colors: {
        sky: 0x000000,      // ТЕПЕРЬ ЧЕРНЫЙ ФОН (Проверка обновления)
        fog: 0x000000,      // Черный туман
        neonCyan: 0x00f3ff, 
        neonPink: 0xff00ff, 
        road: 0x111111      
    },
    camera: {
        type: 'orthographic',
        viewSize: 60,       // Увеличил масштаб, чтобы видеть больше (было 40)
        position: { x: 0, y: 30, z: 30 }
    },
    speed: {
        start: 0,
        max: 80,            
        acceleration: 0.8   
    },
    road: {
        width: 40,          // Сделал дорогу шире
        length: 200         
    }
};
