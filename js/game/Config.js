export const CONFIG = {
    colors: {
        sky: 0x000000,      // Черный фон
        fog: 0x000000,      // Черный туман
        neonCyan: 0x00f3ff, // Неон
        neonPink: 0xff00ff, // Неон
        road: 0x111111      // Асфальт
    },
    camera: {
        type: 'orthographic',
        viewSize: 50,       // Размер кадра
        // ВАЖНО: Опустили камеру (y: 10) и отодвинули назад (z: 50)
        // Это даст вид "в спину", а не сверху.
        position: { x: 0, y: 10, z: 50 } 
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
