import { AmbientLight, AxesHelper, DirectionalLight, DirectionalLightHelper, Object3D, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
export let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, customCoords: any, css2dRenderer: CSS2DRenderer, labelRenderer: CSS2DRenderer

export let object: any
export const createScene = (AMap: any, map: any, css2dRenderDom?: any) => {
    customCoords = map.customCoords;
    const center = map.getCenter()
    customCoords.setCenter([center.lng, center.lat]);
    return new Promise((resolve, reject) => {
        var gllayer = new AMap.GLCustomLayer({
            zIndex: 110, // 图层的层级
            init: async (gl) => {
                camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 1 << 30);

                renderer = new WebGLRenderer({
                    context: gl,  // 地图的 gl 上下文
                    // alpha: true,
                    // antialias: true,
                    // canvas: gl.canvas,
                });
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.needsUpdate = true

                renderer.autoClear = false;
                scene = new Scene();

                // 环境光照和平行光
                var aLight = new AmbientLight(0xffffff, 0.3);
                scene.add(aLight);
                
                var dLight = new DirectionalLight(0xffffff, 1);
                dLight.position.set(1000, -100, 900);
                scene.add(dLight);
                const helper = new DirectionalLightHelper(dLight, 500);
                scene.add(helper);



                labelRenderer = new CSS2DRenderer();
                labelRenderer.setSize(window.innerWidth, window.innerHeight);
                labelRenderer.domElement.style.position = "absolute";
                labelRenderer.domElement.style.top = "0";
                labelRenderer.domElement.style.pointerEvents = "none";
                css2dRenderDom && css2dRenderDom.appendChild(labelRenderer.domElement);

                object = await initGltf()

                setRotation(new Vector3(90, 90, 0), object)

                const scale = 15
                object.scale.set(scale, scale, scale);

                object.name = 'duck'
                scene.add(object)




                resolve(true)
            },
            render: () => {

                // 重新设置图层的渲染中心点，将模型等物体的渲染中心点重置
                // 否则和 LOCA 可视化等多个图层能力使用的时候会出现物体位置偏移的问题
                customCoords.setCenter([116.271363, 39.992414]);
                var { near, far, fov, up, lookAt, position } = customCoords.getCameraParams();

                // 2D 地图下使用的正交相机
                // var { near, far, top, bottom, left, right, position, rotation } = customCoords.getCameraParams();

                // 这里的顺序不能颠倒，否则可能会出现绘制卡顿的效果。
                camera.near = near;
                camera.far = far;
                camera.fov = fov;
                camera.position.set(...position);
                camera.up.set(...up);
                camera.lookAt(...lookAt);
                camera.updateProjectionMatrix();

                renderer.render(scene, camera);
                labelRenderer.render(scene, camera);

                // 这里必须执行！！重新设置 three 的 gl 上下文状态。
                renderer.resetState();

            },
        })
        map.add(gllayer);
    })

}


export function setRotation(rotation: Vector3, object: Object3D) {
    var x = Math.PI / 180 * (rotation.x || 0);
    var y = Math.PI / 180 * (rotation.y || 0);
    var z = Math.PI / 180 * (rotation.z || 0);
    object.rotation.set(x, y, z);
    return new Vector3(x, y, z)
}

// 对模型的经纬度进行转换
export function setPosition(lnglat: number[], object?: Object3D) {
    var position = customCoords.lngLatsToCoords([
        lnglat
    ])[0];
    if (object) {
        object.position.setX(position[0])
        object.position.setY(position[1])
    }
    return new Vector2().fromArray(position)
}


// 初始化模型
function initGltf(): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
        var loader = new GLTFLoader();
        loader.load('https://a.amap.com/jsapi_demos/static/gltf/Duck.gltf', (gltf: any) => {
            let object = gltf.scene;
            resolve(object)
        });
    })
}