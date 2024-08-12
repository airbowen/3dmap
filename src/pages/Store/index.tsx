import { FloorList, getAllData as getAllFloorData, getFloorInfoByFloorId } from "@/request/floor";
import { Group, PageContainer } from "@ant-design/pro-components"
import { useMouse, useRequest, useSetState } from "ahooks";
import { Button, message } from "antd";
import { useCallback, useEffect, useRef } from "react";
import { useParams } from 'umi'
import style from './index.less'
import { v4 as uuidv4 } from 'uuid';

import { camera, init, labelRenderer, renderer, scene } from "@/components/three/scene";
import { getSVG2Model } from "@/components/three/svg2Model";
import { MouseState, OSS_URL } from "@/dictionary";
import { getStoreListByFloorId, removeStoreByStoreId } from "@/request/store";
import StoreEditModal from "./components/editAdd";
import WatchStoreInfo from "./components/watch";
import { getBox3Info } from "@/components/three/utils";
import { ResourceTracker } from "@/utils/ResourceTracker";
import * as THREE from 'three'
import { bindMaterialById, createPointTypesMesh, getElementLeft } from "@/utils/global";
import { chooseStoreMaterial } from "@/components/three/material";
import { history } from 'umi';
import PointEditModal from "./components/PointEdit";
import type { IProps as PointEditModalProps } from './components/PointEdit'
import { getPointListByFloorId } from "@/request/point";

const FloorModel = () => {
    const floorGroupChildrenRef = useRef<THREE.Object3D<any>[]>([])

    let resMgr = new ResourceTracker();

    const handleModel = useRef<any>()
    const [rayState, setRayState] = useSetState<{
        mouse: THREE.Vector2;
        rayChildren: THREE.Object3D[],
        raycaster: THREE.Raycaster;
        floorGroup: THREE.Group
    }>({
        mouse: new THREE.Vector2(),
        rayChildren: [],
        raycaster: new THREE.Raycaster(),
        floorGroup: new THREE.Group(),
    })
    const urlParams = useParams();
    const [floorState, setFloorState] = useSetState<
        {
            floorInfo?: FloorList[0],
            floorList?: FloorList,
            floorId?: string
        }
    >({
        floorInfo: {},
        floorList: [],
        floorId: ''
    });
    const [storeState, setStoreState] = useSetState({
        thatStoreId: ''
    })

    const { run: getFloorInfo } = useRequest(getFloorInfoByFloorId, {
        manual: true,
        onSuccess: async (res) => {
            if (res.success) {
                setFloorState({
                    floorInfo: res.data
                })

                const floorGroup = await getSVG2Model(OSS_URL + res.data.url);
                handleStore(floorGroup)

            }
        }
    })


    const { run: removeStore } = useRequest(removeStoreByStoreId, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setWatchStore({
                    open: false,
                })
                message.success(res.msg)
            } else {
                message.error(res.msg)
            }
        }
    })
    useEffect(() => {
        resMgr.dispose();
        getFloorInfo({
            floorId: floorState.floorId || ''
        })
    }, [floorState.floorId])

    useRequest(getAllFloorData, {
        onSuccess: (res) => {
            if (res.success) {
                if (urlParams.id && urlParams.id !== ':id') {
                    setFloorState({
                        floorId: urlParams.id
                    })
                } else {
                    setFloorState({
                        floorId: res.data[0]?.floorId
                    })
                }
                setFloorState({
                    floorList: res.data.sort((a: FloorList[0], b: FloorList[0]) => {
                        return a.floorIndex && b.floorIndex && a.floorIndex - b.floorIndex
                    })
                })
            }
        }
    })

    const chooseFloor = (floorId?: string) => {
        if (floorId && floorState.floorId !== floorId) {
            setFloorState({
                floorId
            })
        }
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const css2dRenderRef = useRef<HTMLDivElement>(null);
    const mouseRef = useMouse(canvasRef.current);
    useEffect(() => {
        handleModel.current = resMgr.track.bind(resMgr)
        if (canvasRef.current && css2dRenderRef.current) {
            init(canvasRef.current, css2dRenderRef.current)
            renderer.setAnimationLoop(render);
            window.addEventListener('click', clickFloor)
        }
    }, [])

    const clickFloor = useCallback((event: any) => {

        if (MouseState.effective && event.target.localName === 'canvas') {

            const mouse = rayState.mouse.clone()
            const offsetPosition = getElementLeft(canvasRef.current);

            mouse.x = ((event.clientX - offsetPosition.left) / canvasRef.current?.offsetWidth) * 2 - 1;
            mouse.y = -((event.clientY - offsetPosition.top) / canvasRef.current?.offsetHeight) * 2 + 1;
            setRayState({
                mouse
            })

            rayState.raycaster.setFromCamera(mouse, camera);

            const rallyist: THREE.Intersection<THREE.Object3D<any>>[] = rayState.raycaster.intersectObjects(floorGroupChildrenRef.current);
            if (rallyist[0]?.object?.name === 'floor') {
                const pointV3 = rallyist[0].point.toArray()
                if (pointV3) {
                    setPointProps({
                        open: true,
                        pointId: uuidv4(),
                        pointV3

                    })
                }

                return
            }

            if (rallyist[0] && rallyist[0].object) {
                const mesh = rallyist[0].object;
                if (!mesh.userData?.bindInfo) {
                    const id = mesh.storeId;
                    if (id) {
                        const thatMesh = scene.getObjectByProperty('storeId', id);
                        if (thatMesh) {
                            thatMesh.material = chooseStoreMaterial.clone()
                        }

                        if (mesh.storeType === 'bind') {
                            watch(id)
                        } else {
                            addModalOpen(`${id}`)
                        }
                    }
                };

            }
        }

    }, [rayState.floorGroup])
    const render = () => {
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }

    const [storeModal, setStoreModal] = useSetState({
        open: false,
        storeId: '',
        addId: ''
    })
    const addModalOpen = (id: string, isAdd?: boolean) => {
        setStoreModal({
            open: true,
            storeId: isAdd ? '' : id,
            addId: id
        })

    }

    const [watchStore, setWatchStore] = useSetState({
        open: false,
        storeId: ''
    })

    const { run: getFLoorStore } = useRequest(getStoreListByFloorId, {
        manual: true,
        debounceWait: 300,
        onSuccess: (res) => {
            if (res.success) {
                bindMaterialById(res.data, rayState.floorGroup)
            }
        }
    })

    const { run: getPointList } = useRequest(getPointListByFloorId, {
        manual: true,
        debounceWait: 300,
        onSuccess: (res) => {
            if (res.success) {
                createPointTypesMesh(res.data)

            }
        }
    })

    const handleStore = async (floorGroup: THREE.Group) => {
        const { size, center } = getBox3Info(floorGroup);
        floorGroup.position.copy(center.clone().negate());

        setRayState({
            rayChildren: floorGroup.children,
            floorGroup,
        })
        floorGroupChildrenRef.current = [...floorGroup.children]
        handleModel.current(floorGroup)

        scene.add(floorGroup);

        await getFLoorStore(floorState.floorId || '')
        await getPointList(floorState.floorId || '')
    }

    const watch = (id: string) => {
        setWatchStore({
            open: true,
            storeId: id
        })
    }

    const editBtnCallback = () => {
        setWatchStore({
            open: false,
        })
        addModalOpen(watchStore.storeId, false)
    }
    const delBtnCallback = () => {
        // 删除回调

        removeStore(watchStore.storeId);
        console.log('删除回调');

    }

    const toAmap = () => {
        history.push({
            pathname: `/amap/${floorState.floorId}`,
        })
    }

    const pointEditModalOpen = (open: boolean) => {
        setPointProps({ open })
    }
    const [pointProps, setPointProps] = useSetState<PointEditModalProps>({
        floorId: floorState.floorId || '',
        open: false,
        setOpen: pointEditModalOpen,
        floorList: floorState.floorList,
        pointV3: [0, 0, 0]
    })
    return <PageContainer title={floorState.floorInfo?.name} ghost>
        <Button onClick={toAmap}>大屏演示</Button>
        <ul className={style.floorList}>
            {(floorState.floorList || []).map((floorInfo: FloorList[0]) => {
                return <li key={floorInfo.floorId}
                    onClick={() => chooseFloor(floorInfo.floorId)}
                    className={`${floorState.floorId === floorInfo.floorId ? style.active : ''}`}>
                    <span>{floorInfo.name}</span>
                </li>
            })}
        </ul>
        <div className={style.threeMain}>
            <canvas ref={canvasRef} />
            <div className={style.css2dRender} ref={css2dRenderRef}></div>
        </div>

        <StoreEditModal
            floorId={floorState.floorId || ''}
            storeId={storeModal.storeId}
            open={storeModal.open}
            setOpen={(value: boolean) => setStoreModal({ open: value })}
            floorList={floorState.floorList}
            addId={storeModal.addId}
            refreshStore={getFLoorStore}
        ></StoreEditModal>
        <WatchStoreInfo delBtnCallback={delBtnCallback} editBtnCallback={editBtnCallback} open={watchStore.open} floorList={floorState.floorList} setOpen={(value: boolean) => setWatchStore({ open: value })} storeId={watchStore.storeId}></WatchStoreInfo>
        <PointEditModal {...pointProps} refreshPoint={getPointList} floorId={floorState.floorId || ''} floorList={floorState.floorList} ></PointEditModal>
    </PageContainer >
}
export default FloorModel