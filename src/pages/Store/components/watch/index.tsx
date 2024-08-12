import {  STORE_TYPE_MAP } from "@/dictionary";
import { FloorList } from "@/request/floor";
import { createStoreInfoParams, getStoreInfoByStoreId } from "@/request/store";
import { useRequest } from "ahooks";
import { Button, Col, Drawer, Popconfirm, Row } from "antd"
import { useEffect, useState } from "react";

interface IProps {
    open: boolean;
    setOpen?: (value: boolean) => void;
    storeId?: string;
    floorList?: FloorList;
    editBtnCallback?: () => void
    delBtnCallback?: () => void
}
const WatchStoreInfo = (props: IProps) => {
    const { open, setOpen, storeId, floorList, editBtnCallback, delBtnCallback } = props

    const [storeInfo, setStoreInfo] = useState<createStoreInfoParams>()
    const { run: getStoreInfo } = useRequest(getStoreInfoByStoreId, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setStoreInfo(res.data)
            }
        }
    })
    useEffect(() => {
        if (open) {
            getStoreInfo(storeId || '')
        }
    }, [open])
    return <Drawer
        title={storeInfo?.name}
        onClose={() => setOpen && setOpen(false)}
        open={open}
        extra={
            <>
                {editBtnCallback && <Button type='link' onClick={() => editBtnCallback && editBtnCallback()}>编辑</Button>}
                {delBtnCallback && <Popconfirm
                    title="删除店铺"
                    description="是否删除店铺"
                    onConfirm={() => delBtnCallback && delBtnCallback()}
                    okText="是"
                    cancelText="否"
                >
                    <Button type='link' danger>删除</Button>

                </Popconfirm>}
            </>
        }>
        <Row>
            <Col span={6}><h3>名称</h3></Col><Col span={18}><p>{storeInfo?.name || '-'}</p></Col>
            <Col span={6}><h3>所属景区</h3></Col><Col span={18}><p>{floorList?.find((floorInfo) => floorInfo.floorId === storeInfo?.floorId)?.name || '-'}</p></Col>
            <Col span={6}><h3>业态</h3></Col><Col span={18}><p>{STORE_TYPE_MAP.get(storeInfo?.type||'')||'-'}</p></Col>
            <Col span={6}><h3>编号</h3></Col><Col span={18}><p>{storeInfo?.no || '-'}</p></Col>
            <Col span={6}><h3>logo</h3></Col><Col span={18}>
                {storeInfo?.logo ? <img style={{ width: 64, height: 64 }} src={storeInfo?.logo} alt="" /> : '-'}</Col>
        </Row>
    </Drawer >
}
export default WatchStoreInfo