import {  STORE_TYPE_MAP, formLayout, rulesRequired } from '@/dictionary';
import { FloorList, getAllData } from '@/request/floor';
import { createStoreInfo, createStoreInfoParams, getStoreInfoByStoreId, setStoreByStoreId } from '@/request/store';
import { useRequest, useSetState } from 'ahooks'
import { Button, Form, Input, Modal, Select, SelectProps, message } from 'antd'
import { useEffect, useState } from 'react';

interface IProps {
    floorId: string;
    storeId?: string;
    open: boolean;
    floorList?: FloorList;
    setOpen: (open: boolean) => void
    addId?: string;
    refreshStore?: (floorId: string) => void
    lnglat: number[]
}
const StoreEditModal = (props: IProps) => {
    const { floorId, storeId, open, setOpen, floorList,lnglat } = props
    useEffect(() => {
        if (storeId) {
            getStoreInfo(storeId)
            setStoreState({
                storeId,
                title: '编辑店铺',
                isEdit: true,
            })
        } else {
            setStoreState({
                storeId,
                title: '新增店铺',
                isEdit: false,
            })
            form.resetFields()
        }
        setStoreState({
            open
        })
    }, [open])


    const { run: getStoreInfo } = useRequest(getStoreInfoByStoreId, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                form.setFieldsValue(res.data)
            }
        }
    })

    // 数据状态
    const [storeState, setStoreState] = useSetState<{
        open?: boolean;
        title?: '新增店铺' | '编辑店铺',
        isEdit?: boolean,
        storeInfo?: createStoreInfoParams,
        storeId?: string
    }>({
        open: false,
        title: '新增店铺',
        isEdit: false,
    })
    // 表单
    const [form] = Form.useForm();

    // 添加接口
    const { run: addStore } = useRequest(createStoreInfo, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                props?.refreshStore && props?.refreshStore(floorId)
                form.resetFields()
                message.success(res.msg)
                cancel()
            }
        }
    })

    const { run: editStore } = useRequest(setStoreByStoreId, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                props?.refreshStore && props?.refreshStore(floorId)
                message.success(res.msg);
                cancel()
            } else {
                message.error(res.msg)
            }
        }
    })
    // 弹窗确定按钮
    const add = () => {
        form.validateFields().then((values) => {
            if (storeState.isEdit) {
                editStore(storeState.storeId || '', values)
            } else {
                if (props.addId) {
                    addStore({
                        ...values,
                        lnglat,
                        storeId: props.addId
                    })
                }
            }
        })
    }
    const cancel = () => {
        setOpen(false);
        form.resetFields();
        props?.refreshStore && props?.refreshStore(floorId)
    }
    return <Modal open={storeState.open}
        onOk={add}
        title={storeState.title}
        onCancel={cancel}
        maskClosable={false}
    >
        <Form form={form}
            {...formLayout}>
            <Form.Item label="名称" {...rulesRequired} name="name">
                <Input />
            </Form.Item>
            <Form.Item label="所属景区" {...rulesRequired} name="floorId" initialValue={floorId}>
                <Select
                    disabled
                    fieldNames={{ label: 'name', value: 'floorId' }}
                    options={floorList} />
            </Form.Item>
            <Form.Item label="业态" name="type" >
                <Select options={Array.from(STORE_TYPE_MAP).map((item: string[]) => ({ label: item[1], value: item[0] }))} />
            </Form.Item>
            <Form.Item label="编号" name="no" >
                <Input />
            </Form.Item>
            <Form.Item label="logo" name="logo" >
                <Input />
            </Form.Item>
        </Form>

    </Modal>
}
export default StoreEditModal