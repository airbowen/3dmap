import * as THREE from 'three';

export type Box3Info = {
    size: THREE.Vector3;
    center: THREE.Vector3;
    box3: THREE.Box3;
}

export const getBox3Info = (mesh: THREE.Object3D): Box3Info => {
    if (mesh.isObject3D) {
        const box3 = new THREE.Box3();
        box3.setFromObject(mesh);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box3.getSize(size)
        box3.getCenter(center);
        return {
            size,
            center,
            box3
        }
    } else {
        throw new Error('对象错误');
    }
}
export function getRandomInt(min: number, max: number): number {  
    // 确保min小于max  
    if (min >= max) {  
      throw new Error('min must be less than max');  
    }  
    // Math.random() 生成 [0, 1) 范围内的浮点数  
    // 乘以 (max - min + 1) 并向下取整，以生成从 0 到 (max - min) 的整数  
    // 然后加上 min，得到 min 到 max 的整数  
    return Math.floor(Math.random() * (max - min + 1)) + min;  
  }  