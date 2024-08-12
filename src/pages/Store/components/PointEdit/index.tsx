import { STORE_ATTRIBUTE_MAP, formLayout, rulesRequired } from "@/dictionary";
import { Form, Input, Modal, Select, message } from "antd"
import { FloorList, getAllData } from '@/request/floor';
import { useEffect } from "react";
import { createPointInfo,createPointInfoParams } from "@/request/point";
import { Vector3, Vector3Tuple } from "three";


export type IProps = {
    open: boolean,
    setOpen: (open: boolean) => void
    floorId: string
    pointId?: string;
    pointV3?:Vector3Tuple
    floorList?: FloorList
    refreshPoint?: (floorId: string) => void
    lnglat: number[]
}
/**
 * 
 * @param props 
 * -
 * @returns 
 */
const PointEditModal = (props: IProps) => {
    const { open, setOpen, floorId, pointId, floorList,refreshPoint,lnglat } = props
    const pointV3 = props?.pointV3

    const [form] = Form.useForm()
    const cancel = () => {
        setOpen(false)
    }
    const save = () => {
        form.validateFields().then(async (values) => {
          
            const params:createPointInfoParams = {
                pointId: pointId,
                position:pointV3,
                ...values,
                lnglat
            }
           const res = await createPointInfo(params)
           if(res.success) {
            message.success(res.msg)
            refreshPoint&& refreshPoint(floorId)
            cancel()
           }

        })
    }
    return <Modal open={open}
        onCancel={cancel}
        onOk={save}
        title="点位设施"
    >
        <Form form={form}   {...formLayout}>
            <Form.Item label="所属景区" {...rulesRequired} name="floorId" initialValue={floorId}>
                <Select
                    disabled
                    fieldNames={{ label: 'name', value: 'floorId' }}
                    options={floorList} />
            </Form.Item>
            <Form.Item label="类型" {...rulesRequired} name='attribute'>
                <Select options={Array.from(STORE_ATTRIBUTE_MAP).map((item: string[]) => ({ label: item[1], value: item[0] }))} />
            </Form.Item>
        </Form>
    </Modal>
}
export default PointEditModal