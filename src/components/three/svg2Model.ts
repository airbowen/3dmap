import { loadSVG } from "./loader";
import { ShapePath } from "three";
import * as THREE from 'three';
import { scene } from "./scene";
import { getBox3Info, getRandomInt } from "./utils";
import { floorMaterial, unBindStoreMaterial } from "./material";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export const getSVG2Model = async (url: string,back=false): Promise<THREE.Group> => {
    const svgPaths = await loadSVG(url) as { paths: ShapePath[] }

    const floorGroup = new THREE.Group()
    for (const path of svgPaths.paths) {
        const shapes = SVGLoader.createShapes(path);
        for (const shape of shapes) {
            const logoShape = new THREE.Shape()

            for (const curve of shape.curves) {

                const length = curve.getLength();

                const points = curve.getPoints(Math.floor(length / 20));
                for (let i = 0; i < points.length - 1; i++) {
                    const v2 = points[i]
                    if (v2.x !== 0 && v2.x && v2.y !== 0 && v2.y) {
                        // v2.divideScalar(10)
                        const v3 = new THREE.Vector3(v2.x, 0, v2.y)
                        if (i === 0) {
                            logoShape.moveTo(v2.x, v2.y)
                        } else {
                            logoShape.lineTo(v2.x, v2.y)
                        }
                    }
                }

            }

            const mesh = paths2Mesh(shape, path.userData.node.id)
            // mesh.rotation.copy(new THREE.Euler(Math.PI * 0.5, 0, 0))
            console.log(mesh.name);
            
            if (mesh.name === 'floor' && mesh.isMesh) {
                mesh.position.z =back?8: -8;
                mesh.material = floorMaterial
            } else {
                const center = mesh.userData.box3Info?.center
                console.log('center',center);
                
                mesh.storeId = `${center.x}_${center.y}`
            }
            floorGroup.add(mesh)
        }
    }


    return floorGroup

}

// 路径挤压为模型
const paths2Mesh = (shape: THREE.Shape | THREE.Shape[], name: string): THREE.Mesh => {
    const extrudeSettings = {
        depth: name==='floor'?8:getRandomInt(6,60),
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, unBindStoreMaterial.clone());
    if(name === 'floor') {
        mesh.receiveShadow = true
    } else {
        mesh.castShadow = true
    }
     
    mesh.name = name
    const box3Info = getBox3Info(mesh);
    mesh.userData.box3Info = box3Info
    return mesh
}