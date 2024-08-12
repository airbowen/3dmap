import { useEffect, useRef, useState } from 'react';
import styles from './style.less'
import { useParams } from '@umijs/max';
import '@/utils/public'
import { CreateAMap, cleanBuild, getSearchTrailsLngLat } from './ts/createMap';
import { useAsyncEffect, useRequest, useSetState } from 'ahooks';
import { camera, createScene, customCoords, labelRenderer, object, scene, setPosition, setRotation } from './ts/AMAPScene';

import { createFloorInfoParams, FloorList, getFloorInfoByFloorId, getAllData as getAllFloorData } from '@/request/floor';
import { getSVG2Model } from '@/components/three/svg2Model';
import { OSS_URL, STORE_ATTRIBUTE_ICON_MAP, STORE_ATTRIBUTE_MAP } from '@/dictionary';
import { getStoreListByFloorId, removeStoreByStoreId } from '@/request/store';
import { bindMaterialById } from '@/utils/global';
import { AxesHelper, Group, Raycaster, Vector2, Vector3 } from 'three';
import { createPointInfoParams, getPointListByFloorId } from '@/request/point';
import { getBox3Info } from '@/components/three/utils';
import Bot from '../Bot';
import { Button, Input, Modal, message } from 'antd';
import StoreEditModal from '../Store/components/editAdd';
import WatchStoreInfo from '../Store/components/watch';
import PointEditModal from '../Store/components/PointEdit';
import type { IProps as PointEditModalProps } from '../Store/components/PointEdit'
import type { IProps as Logo2dIprops } from '@/components/logo2d'
import { v4 as uuidv4 } from 'uuid';
import Logo2d, { CallBackTypes } from '@/components/logo2d';

const AMap = () => {


    const urlParams = useParams();
    const floorGroupChildrenRef = useRef<THREE.Object3D<any>[]>([])
    const [floorData, setFloorData] = useState<createFloorInfoParams>()
    let mylnglat = [119.985955, 30.220642]
    // 获取景区详情
    const { run: getFloorInfo } = useRequest(getFloorInfoByFloorId, {
        manual: true,
        onSuccess: async (res) => {
            if (res.success) {
                setFloorData(res.data)
                const floorGroup = await getSVG2Model(OSS_URL + res.data.url, true);
                handleStore(floorGroup, res.data)
            }
        }
    })


    const { run: getPointList } = useRequest(getPointListByFloorId, {
        manual: true,
        debounceWait: 300,
        onSuccess: (res) => {
            if (res.success) {
                const floor = scene.getObjectByName('floor')
                if (floor) {
                    const worldPosition = new Vector3()
                    const center = new Vector3()
                    const floor = scene.getObjectByName('floor');
                    if (floor) {
                        floor.getWorldPosition(worldPosition)
                        const { center: c } = getBox3Info(floor);

                        center.copy(c)
                    }
                    let arr = [...markList];
                    (res.data || []).forEach((data: createPointInfoParams) => {
                        const p = new Vector3().fromArray(data.position)
                        const position = new Vector3().set(p.x, -p.y, p.z);
                        const iconUrl = `${OSS_URL}${STORE_ATTRIBUTE_ICON_MAP.get(data.attribute)}`

                        position.add(center);

                        const item: Logo2dIprops = {
                            logo: iconUrl,
                            markData: data
                        }
                        arr.push(item)
                    })
                    setMarkList(arr)


                }


            }
        }
    })

    const [storeName, setStoreName] = useState<string>('')

    const logo2dMarkCallback = async (params: CallBackTypes) => {
        if (params.type === 'name') {
            setStoreName(params.value)
        } else if (params.type === 'nav') {
            const trails = await getSearchTrailsLngLat(AMapRef.current, mapRef.current, new Vector2().fromArray(mylnglat), new Vector2().fromArray(params.value));

            let points = getPath(trails)

            playByPaths(points, 18000)


        }
    }


    const getPath = (trails: any) => {

        const paths: any[] = []
        if (trails.info === 'ok') {
            trails.routes.forEach((route: any) => {
                route.steps.forEach((step: any) => {
                    // paths.push([step.path[0].lng, step.path[0].lat])
                    // paths.push([step.path[step.path.length-1].lng, step.path[step.path.length-1].lat])
                    for (let i = 0; i < step.path.length - 1; i++) {
                        const points = step.path
                        // const p2 = step.path[i]
                        // paths.push([p2.lng, p2.lat])
                        let A = new Vector2(points[i].lng, points[i].lat);
                        let B = new Vector2(points[i + 1].lng, points[i + 1].lat);
                        var distance = B.distanceTo(A);
                        console.log('distance', distance);
                        if (distance !== 0) {
                            paths.push(B.toArray())
                        }


                    }
                })
            });
            console.log('paths', paths);

        }
        return paths
    }

    const playByPaths = (playPaths: number[][], duration: number) => {
        const AMap = AMapRef.current
        const map = mapRef.current
        const loca = locaRef.current
        if (map) {
            // 导航线
            var polyline = new AMap.Polyline({
                path: playPaths,            // 设置线覆盖物路径
                showDir: true,
                strokeColor: '#3366bb',   // 线颜色
                strokeWeight: 10,           // 线宽
                zIndex: 1
            });
            map.add(polyline)
            trailFinshed.current = false
            loca.viewControl.addTrackAnimate({
                path: playPaths, // 镜头轨迹，二维数组，支持海拔
                duration: duration, // 时长
                timing: [[0, 0.3], [1, 0.7]], // 速率控制器
                rotationSpeed: 10, // 每秒旋转多少度
            }, function () {
                console.log('完成',);
                message.success('完成')
                trailFinshed.current = true

            });

            // changeObject()
            loca.animate.start();

        }
    }

    const [markList, setMarkList] = useState<Logo2dIprops[]>([])

    // 获取景区店铺详情
    const { run: getFLoorStore } = useRequest(getStoreListByFloorId, {
        manual: true,
        debounceWait: 300,
        onSuccess: (res) => {
            if (res.success) {
                const shopUrl = `${OSS_URL}${STORE_ATTRIBUTE_ICON_MAP.get('shops')}`;

                const arr: Logo2dIprops[] = [...markList];

                (res.data || []).forEach((data: any) => {
                    const item: Logo2dIprops = {
                        name: data.name,
                        logo: data.logo || shopUrl,
                        markData: data
                    }
                    arr.push(item)

                })
                setMarkList(arr);

                bindMaterialById(
                    res.data,
                    rayState.floorGroup,
                    scene,
                )


            }
        }
    })



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


    // 页面状态
    const [rayState, setRayState] = useSetState<{
        mouse: THREE.Vector2;
        rayChildren: THREE.Object3D[],
        raycaster: THREE.Raycaster;
        floorGroup: THREE.Group
    }>({
        mouse: new Vector2(),
        rayChildren: [],
        raycaster: new Raycaster(),
        floorGroup: new Group(),
    })


    const handleStore = (floorGroup: THREE.Group, floorInfo: createFloorInfoParams) => {


        floorGroupChildrenRef.current = [...floorGroup.children]

        getFLoorStore(urlParams.id || '')
        getPointList(urlParams.id || '')
        // setRotation(new Vector3(0, -180, 180), floorGroup);


        try {
            let objPosition = floorInfo.position.split(',').map((n) => Number(n))

            const v2 = setPosition(objPosition);

            floorGroup.position.set(v2.x, v2.y, 0)

            scene.add(floorGroup);

        } catch (error) {
            console.log(error);

        }
    }



    const AMapRef = useRef<any>(null)
    const containerRef = useRef<any>(null)
    const locaRef = useRef<any>(null)

    let trailFinshed = useRef<boolean>(true)

    const mapRef = useRef()
    const createMap = async () => {
        let AMap = AMapRef.current
        // 创建地图
        var map = new AMap.Map("container", {
            resizeEnable: true,
            center: [119.986, 30.2235],//地图中心点
            zoom: 17.4, //地图显示的缩放级别
            viewMode: '3D',//开启3D视图,默认为关闭
            buildingAnimation: true,//楼块出现是否带动画
            pitch: 45,
            rotation: 45,
            features: ['bg', 'building'], // 只显示建筑、道路、区域
            // showLabel: false,  // 隐藏标注信息
            mapStyle: "amap://styles/grey",
            showIndoorMap: false,
            // rotateEnable: false,
            // pitchEnable: false,
            zIndex: 9
        });
        mapRef.current = map

        var loca = new (window as any).Loca.Container({
            map,
            zIndex: 9
        });
        locaRef.current = loca

        render()

        const item: Logo2dIprops = {
            logo: 'https://three-statices.oss-cn-hangzhou.aliyuncs.com/floor-map/icon/wodeweizhi.png',
            markData: {
                lnglat: mylnglat,
                attribute: 'myposition'
            }
        }
        setMarkList([...markList, item])

        map.on('click', async (e: any) => {
            console.log(e.lnglat.lng, e.lnglat.lat);
            const lnglat = [e.lnglat.lng, e.lnglat.lat]
            const mouse = rayState.mouse.clone()
            // 高德地图点击事件与3d模型的转换
            mouse.x = (e.originEvent.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.originEvent.clientY / window.innerHeight) * 2 + 1;

            setRayState({
                mouse
            })


            rayState.raycaster.setFromCamera(mouse, camera);

            const rallyist: THREE.Intersection<THREE.Object3D<any>>[] = rayState.raycaster.intersectObjects(floorGroupChildrenRef.current);
            if (rallyist?.[0] && rallyist[0].object) {
                message.success('点击在3d模型上')
                const mesh = rallyist[0].object
                if (mesh.name !== 'floor') {
                    if (mesh.storeType === 'bind') {
                        console.log('mesh', mesh);

                        watch(mesh.userData.
                            storeInfo
                            .storeId)
                    } else {

                        addModalOpen(`${mesh.storeId}`, true, lnglat)
                    }

                } else {
                    const pointV3 = rallyist[0].point.toArray()
                    if (pointV3) {
                        setPointProps({
                            open: true,
                            pointId: uuidv4(),
                            pointV3,
                            lnglat: lnglat

                        })
                    }
                }

            } else {
                message.success('点击在高德地图上')
                // const center = map.getCenter();


                // var position = customCoords.lngLatsToCoords([
                //     [center.lng, center.lat]
                // ])[0];
                // const v3 = new Vector3(position[0], position[1],0, )
                // console.log('v3', position,v3);
                // object.position.copy(v3)
            }
            map.render();


        })

        // 清除多余楼块
        cleanBuild(AMap, map)
        // 创建3d场景
        const res = await createScene(AMap, map, css2dRenderRef.current)
        if (res) {
            if (urlParams.id && urlParams.id !== ':id') {
                getFloorInfo({
                    floorId: urlParams.id
                })
            }
        }

    }

    const css2dRenderRef = useRef<HTMLDivElement>(null);

    useAsyncEffect(async () => {

        AMapRef.current = await CreateAMap()
        if (containerRef.current) {
            createMap()
        }
    }, [])

    const [storeModal, setStoreModal] = useSetState({
        open: false,
        storeId: '',
        addId: '',
        lnglat: [] as number[]
    })

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

    const addModalOpen = (id: string, isAdd?: boolean, lnglat?: number[]) => {
        setStoreModal({
            open: true,
            storeId: isAdd ? '' : id,
            addId: id,
            lnglat: lnglat || []
        })

    }


    const [watchStore, setWatchStore] = useSetState({
        open: false,
        storeId: ''
    })


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


    const { run: removeStore } = useRequest(removeStoreByStoreId, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setWatchStore({
                    open: false,
                })
                message.success(res.msg)
                window.location.reload()
            } else {
                message.error(res.msg)
            }
        }
    })
    const delBtnCallback = () => {
        removeStore(watchStore.storeId);
    }


    const pointEditModalOpen = (open: boolean) => {
        setPointProps({ open })
    }

    const [pointProps, setPointProps] = useSetState<PointEditModalProps>({
        floorId: floorState.floorId || '',
        open: false,
        setOpen: pointEditModalOpen,
        floorList: floorState.floorList,
        pointV3: [0, 0, 0],
        lnglat: []
    })


    const render = () => {
        requestAnimationFrame(() => {
            render()
        })
        if (!trailFinshed.current) {

            if (mapRef.current) {
                const map = mapRef.current
                if (object) {
                    const center = map.getCenter()
                    var position = customCoords.lngLatsToCoords([
                        [center.lng, center.lat]
                    ])[0];
                    const v3 = new Vector3(position[0], position[1], 10,)

                    object.position.copy(v3)

                    const rotation = map.getRotation()

                    object.rotation.y = rotation * Math.PI / 180 - 30
                }
                map.render();
            }
        }
    }

    const [markInfoState, setMarkInfoState] = useSetState<{
        open?: boolean;
        markData?: Logo2dIprops['markData'];
    }>({
        open: false,
    })

    const cancel = () => {
        setMarkInfoState({ open: false })
    }

    const onOk = () => {
        cancel()
        logo2dMarkCallback({
            type: 'nav',
            value: markInfoState.markData?.lnglat
        })
    }

    const markClick = (data: Logo2dIprops['markData']) => {
        if (data) {
            logo2dMarkCallback({
                type: 'name',
                value: data.name
            })

            setMarkInfoState({
                markData: data,
                open: true
            })

        }
    }
    return <>
        <div className={styles.container} ref={containerRef} id={"container"}>
        </div>
        {
            markList.map((data) => {
                return <Logo2d onClick={markClick} {...data} map={mapRef.current} AMap={AMapRef.current}></Logo2d>
            })
        }
        <div ref={css2dRenderRef}></div>
        <Bot answerText={storeName}></Bot>
        <StoreEditModal
            floorId={urlParams.id || ''}
            storeId={storeModal.storeId}
            open={storeModal.open}
            setOpen={(value: boolean) => setStoreModal({ open: value })}
            floorList={floorState.floorList}
            addId={storeModal.addId}
            refreshStore={getFLoorStore}
            lnglat={storeModal.lnglat}
        ></StoreEditModal>
        <WatchStoreInfo delBtnCallback={delBtnCallback} editBtnCallback={editBtnCallback} open={watchStore.open} floorList={floorState.floorList} setOpen={(value: boolean) => setWatchStore({ open: value })} storeId={watchStore.storeId}></WatchStoreInfo>
        <PointEditModal {...pointProps} refreshPoint={getPointList} floorId={urlParams.id || ''} floorList={floorState.floorList} ></PointEditModal>

        <Modal okText={'导航到这里'} onCancel={cancel} onOk={onOk} open={markInfoState.open} title={'详情'}>
            {markInfoState?.markData ?
                <>
                    <p>{`当前目标为`}
                        <span style={{ color: 'green' }}>{markInfoState.markData.name || STORE_ATTRIBUTE_MAP.get(markInfoState.markData.attribute)}</span>
                    </p>
                    <p>{`当前目标位置为`}
                        <span style={{ color: 'green' }}>{(markInfoState.markData.lnglat || []).join('，')}</span>

                    </p>
                    <p>{`可以再次连接智慧设施，比如智慧公测，智能消防，智能摄像头等监控设备`}</p>
                    <p>{`也可以从模拟的我的位置导航到这个位置：`}</p></>
                : null}

        </Modal>
    </>

}
export default AMap