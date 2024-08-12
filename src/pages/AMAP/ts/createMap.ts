import AMapLoader from '@amap/amap-jsapi-loader';
import { Vector2 } from 'three';
export const CreateAMap = () => {
    return new Promise((resolve, reject) => {
        AMapLoader.load({
            "key": "e4837115d42c13263434bcfd48074dcc",              // 申请好的Web端开发者Key，首次调用 load 时必填
            "version": "2.0",
            "plugins": ["AMap.Walking", "AMap.Driving"],           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
            "Loca": {
                version: '2.0.0'
            },
          
        }).then(async (res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })

}

export const ClearBuildPoint =  [
    [119.986343,30.22536],[119.98631,30.225325],[119.986263,30.224848],[119.98609,30.224193],[119.985871,30.223613],[119.985542,30.222954],[119.985286,30.222578],[119.985049,30.222334],[119.985156,30.222196],[119.985207,30.222107],[119.985924,30.221664],[119.986602,30.22148],[119.987217,30.221367],[119.98743,30.222036],[119.987565,30.22294],[119.987497,30.22345],[119.987778,30.223592],[119.988224,30.224764],[119.988403,30.225153],[119.988277,30.22522],[119.986408,30.225395],[119.986343,30.22536],
]

export const cleanBuild = (AMap: any,map: any)=>{
       // 底图楼块扣除
       var building = new AMap.Buildings({
        zIndex: 10,
    });
    map.on('click', async (e: any) => {
      

    })
    building.setStyle({
        hideWithoutStyle: false,//是否隐藏设定区域外的楼块
        areas: [{
            visible: false,//是否可见
            rejectTexture: false,//是否屏蔽自定义地图的纹理
            color1: '00000000',//楼顶颜色
            color2: '00000000',//楼面颜色
            path: [ClearBuildPoint]
        }]
    });
    map.add(building);

}


/**
 * 
 * @param AMap 地图api构造函数
 * @param map 地图实例
 * @param start 起始经纬坐标
 * @param end 结束经纬坐标
 * @returns 路径
 */
export const getSearchTrailsLngLat = (AMap: any, map: any, start: Vector2, end: Vector2) => {
    // 构造路线导航类
    var driving = new AMap.Walking({
        map: map,
        showTraffic: true,
        hideMarkers: true,
        isOutline: false,
        autoFitView: false,
    });
    return new Promise((resolve, reject) => {
        driving.search(new AMap.LngLat(start.x, start.y), new AMap.LngLat(end.x, end.y), function (status: string, result: any) {
            if (status === 'complete') {
                resolve(result)
                driving.clear()
            } else {
                reject(result)
            }
        })
    })
}