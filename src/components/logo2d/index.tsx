import { STORE_ATTRIBUTE_MAP } from "@/dictionary";
import { IRoute } from "@umijs/max";
import { Button, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export type CallBackTypes = {
    type: 'name' | 'nav', value: any
}

export type IProps = {
    logo?: string;
    name?: string;
    markData: { [key: string]: any }
    callback?: (value: CallBackTypes) => void
    map?: any;
    AMap?: any
    onClick?:(data: IProps['markData'])=>void
}

const iconStype = {
    width: 48,
    height: 48
}
const Logo2d = (props: IProps) => {
    const map = props.map
    const AMap = props.AMap
    const logo = props?.logo
    const name = props?.name
    const markData = props?.markData
    const callback = props?.callback
    const onClick = props?.onClick

    const checkMark = () => {
        console.log(markData);
        message.success(markData.name || STORE_ATTRIBUTE_MAP.get(markData.attribute))
        onClick&&onClick(markData)
    }

    useEffect(() => {
        if (AMap && map && markData && markData?.lnglat && markData?.lnglat?.length !== 0) {
            const position = new AMap.LngLat(markData?.lnglat?.[0], markData?.lnglat?.[1]); //Marker 经纬度
            const element = document.createElement('div');
            const root = ReactDOM.createRoot(element);
            root.render(getComponent());

            const marker = new AMap.Marker({
                position: position,
                content: element, //将 html 传给 content
                offset: new AMap.Pixel(-iconStype.width / 2, -iconStype.height / 2), //以 icon 的 [center bottom] 为原点
            });

            map.add(marker);

        }

    }, [])

    const getComponent = ()=>{
        return <div className="bind-store" style={{ ...iconStype }} onClick={checkMark} >
        <div className="img-main"><img src={logo} alt="" /></div>
        <p>{name}</p>
    </div>
    }
    return null
}
export default Logo2d