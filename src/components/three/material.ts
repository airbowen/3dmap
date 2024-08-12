import * as THREE from 'three'


// 选中店铺
export const chooseStoreMaterial = new THREE.MeshLambertMaterial({
    color: 0xe4a360
});

// 绑定过的店铺
export const bindStoreMaterial = new THREE.MeshLambertMaterial({
    color: 0xff8790
});

// 没绑定的店铺
export const unBindStoreMaterial = new THREE.MeshLambertMaterial({
    color: 0xc2c2c4
});

// 卫生间
export const toiletMaterial = new THREE.MeshLambertMaterial({
    color: 0xd58261
});

// 电梯
export const liftMaterial = new THREE.MeshLambertMaterial({
    color: 0x92657b
});

// 地面
export const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x85888c
});

export enum DEFAULT_MATERIAL {
    chooseStoreMaterial,
    bindStoreMaterial,
    unBindStoreMaterial,
    toiletMaterial,
    liftMaterial,
    floorMaterial

}
