import { MouseState } from '@/dictionary';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

const cameraPos = new THREE.Vector3( 4.422351251620849,  -305.6440071261069,  645.7196773323486)
export let scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    css2dRenderer: CSS2DRenderer,
    css3dRenderer: CSS3DRenderer,
    controls: OrbitControls,
    ambientLight: THREE.AmbientLight,
    light: THREE.DirectionalLight,
    camera: THREE.PerspectiveCamera,
    labelRenderer: CSS2DRenderer

export const init = async (canvas: HTMLCanvasElement, css2dRenderDom: HTMLDivElement) => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#e4e4e4')
    if (canvas) {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // alpha: true,
            antialias: true,
            powerPreference: 'high-performance', // 高性能
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.needsUpdate = true
        renderer.shadowMap.autoUpdate = true
    }

    css3dRenderer = new CSS3DRenderer();
    css3dRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    css3dRenderer.domElement.classList.add('css3d')
    // document.body.appendChild(css3dRenderer.domElement);


    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    css2dRenderDom && css2dRenderDom.appendChild(labelRenderer.domElement);


    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.2, 2000000);
    camera.position.copy(cameraPos)

    // 控制器
    let controlsStartPos = new THREE.Vector3()

    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('start', () => {
        controlsStartPos.copy(camera.position)
    })

    controls.addEventListener('end', () => {
        MouseState.effective = controlsStartPos.distanceToSquared(camera.position) === 0
    })
    controls.addEventListener('change', () => {
        console.log(camera.position);

    })

    initLight()

}
const initLight = () => {
    ambientLight = new THREE.AmbientLight(0x707070, 3);

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1181.4843537287065, 1580.039682987524, 1809.053759094986);
    light.castShadow = true;
    const d = 140;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 10;

    light.shadow.mapSize.x = 102;
    light.shadow.mapSize.y = 102;

    scene.add(light)
    scene.add(ambientLight)
}
