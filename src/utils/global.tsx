import React from 'react'
import Logo2d, { CallBackTypes } from '@/components/logo2d';
import { bindStoreMaterial, chooseStoreMaterial, floorMaterial, liftMaterial, toiletMaterial, unBindStoreMaterial } from '@/components/three/material';
import { scene } from '@/components/three/scene';
import { getBox3Info } from '@/components/three/utils';
import { OSS_URL, STORE_ATTRIBUTE_ICON_MAP } from '@/dictionary';
import { createPointInfoParams } from '@/request/point';
import { createStoreInfoParams } from '@/request/store';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import ReactDOM from 'react-dom';
import { camera } from '@/pages/AMAP/ts/AMAPScene';

export const bindMaterialById = (storeList: createStoreInfoParams[],
    group: THREE.Group,
    mapScene = scene,
) => {
    group.traverse((mesh: THREE.Mesh & any) => {
        if (mesh) {
            const name = mesh.name.split('_')[0]
            mesh.material = mapMaterial(name)
        }
    })
    const storeNameGroup = new THREE.Group();
    mapScene.add(storeNameGroup)

    storeList.forEach((data: createStoreInfoParams) => {
        const storeId = data.storeId

        if (storeId) {
            const thatMesh = mapScene.getObjectByProperty('storeId', storeId);
            if (thatMesh) {
                thatMesh.material = bindStoreMaterial.clone();
                thatMesh.storeType = 'bind'
                thatMesh.userData.storeInfo = data

            }

        }
    })

}
export const createPointTypesMesh = (pointList: createPointInfoParams[], mapScene = scene, offset = new THREE.Vector3()) => {
    pointList.forEach((data: createPointInfoParams) => {
        const storeNameObject = createPoint(data)
        storeNameObject.position.add(offset)
        mapScene.add(storeNameObject);
    })

}

export const mapMaterial = (type: 'bind' | 'unBind' | 'floor' | 'choose' | 'toilet' | 'lift' | 'Escalator') => {
    switch (type) {
        case 'bind':
            return bindStoreMaterial.clone();
        case 'unBind':
            return unBindStoreMaterial.clone();
        case 'toilet':
            return toiletMaterial.clone();
        case 'lift':
            return liftMaterial.clone();
        case 'Escalator':
            return liftMaterial.clone();
        case 'choose':
            return chooseStoreMaterial.clone();
        case 'floor':
            return floorMaterial.clone();
        default:
            return unBindStoreMaterial.clone()

    }
}

export function getElementLeft(el) {
    var left = 0;
    let top = 0
    while (el && !isNaN(el.offsetLeft)) {
        left += el.offsetLeft - el.scrollLeft;
        top += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        left, top
    };
}

export const createStoreName = (data: createStoreInfoParams,
    pos: THREE.Vector3,
    markData: any,
    setStoreName?: (value: string) => void

): CSS2DObject => {
    const element = document.createElement('div');

    const root = ReactDOM.createRoot(element);
    root.render(<Logo2d logo={data?.logo || `${OSS_URL}${STORE_ATTRIBUTE_ICON_MAP.get('shops')}`} name={data.name} markData={markData} callback={setStoreName} />,);

    const tag = new CSS2DObject(element);
    tag.position.copy(pos)
    return tag
}

export const createPoint = (data: createPointInfoParams) => {
    const element = document.createElement('div');

    const root = ReactDOM.createRoot(element);
    root.render(<Logo2d logo={`${OSS_URL}${STORE_ATTRIBUTE_ICON_MAP.get(data.attribute)}`} />,);

    const tag = new CSS2DObject(element);
    const pos = new THREE.Vector3().fromArray(data.position);

    tag.position.copy(pos)
    return tag
}

// 世界坐标转屏幕坐标
export const getViewCp = (v3: THREE.Vector3, v2: THREE.Vector2, camera: THREE.Camera) => {
    var worldVector = v3.clone();
    var standardVector = worldVector.project(camera); //世界坐标转标准设备坐标
    var a = window.innerWidth / 2;
    var b = window.innerHeight / 2;
    var vx = Math.round(standardVector.x * a + a); //标准设备坐标转屏幕坐标
    var vy = Math.round(-standardVector.y * b + b); //标准设备坐标转屏幕坐标
    const p = new THREE.Vector2(vx, vy)

    v2.copy(p)
    return p
}

// 屏幕坐标转经纬度
export const coordsToLngLats = (point: THREE.Vector2, AMap: any, map: any, targetV2?: THREE.Vector2) => {
    const { x, y } = point
    var pixel = new AMap.Pixel(x, y);

    var lnglat = map.containerToLngLat(pixel);
    const v2 = new THREE.Vector2()
    v2.set(lnglat.lng, lnglat.lat)
    if (targetV2?.isVector2) {
        targetV2.copy(v2)
    }
    return v2

}
