import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import { Button, Card, Descriptions, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Tooltip, message } from 'antd'
import { FloorList, createFloorInfo, createFloorInfoParams, getAllData, removeFloor, setFloorInfoByFloorId } from '@/request/floor';
import { useState } from 'react';
import { DeleteFilled, EditFilled, LinkOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { history } from 'umi';
import { FLOOR_MAP_URL, formLayout, rulesRequired } from '@/dictionary';

const HomePage: React.FC = () => {

  const [newFloorId, setNewFloorId] = useState<string>('');

  const add = async (foorInfo: createFloorInfoParams) => {
    const res = await createFloorInfo(foorInfo)
    if (res.success) {
      message.success(res.msg)
      getAll()

    } else {
      message.error(res.msg)
    }
  }

  // 获取所有数据 延迟300毫秒请求，防止读写冲突
  const { run: getAll } = useRequest(getAllData, {
    manual: false,
    debounceWait: 300,
    onSuccess: (res) => {
      if (res.success) {
        setFloorList(res.data);
      }
    }
  })

  // 删除景区
  const { run: del } = useRequest(removeFloor, {
    manual: true,
    onSuccess: (res) => {
      if (res.success) {
        getAll()
        message.success(res.msg)
      } else {
        message.error(res.msg)
      }
    }
  })

  const { run: edit } = useRequest(setFloorInfoByFloorId, {
    manual: true,
    onSuccess: (res) => {
      if (res.success) {
        message.success(res.msg);
        setFloorState({
          open: false,
          isEdit: false
        })
        getAll()

      } else {
        message.error(res.msg)
      }
    }
  })

  const [floorList, setFloorList] = useState<FloorList>([])

  const [addFloorState, setFloorState] = useState<{
    open?: boolean;
    title?: '新增景区' | '编辑景区';
    floorData?: FloorList[0]
    editFloorId?: string
    isEdit?: boolean
  }>({
    open: false,
    title: '新增景区',
    floorData: {}
  })
  const [form] = Form.useForm();
  const openModal = () => {
    setFloorState({ open: true, title: '新增景区', isEdit: false, })
  }
  const checkForm = () => {
    form.validateFields().then(async (values) => {
      if (addFloorState.isEdit) {
        await edit(addFloorState.editFloorId || '', values)
      } else {
        await add(values)
      }
      cancel()
    })
  }
  const cancel = () => {
    form.resetFields();
    setFloorState({ open: false })
  }



  const editFloor = (floorData: FloorList[0]) => {
    console.log('编辑景区');
    
    setFloorState({
      open: true,
      isEdit: true,
      editFloorId: floorData.floorId || '',
      title: '编辑景区'
    })
    form.setFieldsValue(floorData)

  }
  const toModel = (floorId: string) => {
    history.push(`/amap/${floorId}`)
  }

  return (
    <PageContainer ghost>
     
      <Modal title={addFloorState.title}
        open={addFloorState.open}
        onOk={checkForm}
        onCancel={cancel}>
        <Form form={form}
          {...formLayout}
          
        >
          <Form.Item {...rulesRequired} label="景区名称" name="name">
            <Input></Input>
          </Form.Item>
          <Form.Item {...rulesRequired}  label="起始位置" initialValue="119.985163,30.221529" name="position">
            <Input ></Input>
          </Form.Item>
          <Form.Item {...rulesRequired} label="景区索引" name="floorIndex">
            <InputNumber step="1" precision={0} min={1}></InputNumber>
          </Form.Item>
          <Form.Item {...rulesRequired} {...rulesRequired} label="模型路径" name="url">
            <Select options={FLOOR_MAP_URL} fieldNames={{
              label: 'name',
              value: 'url'
            }}></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Space>
        <Button type={"primary"} onClick={openModal}>新增景区</Button>
      </Space>
      <div className={styles.floorList}>
        {floorList.length !== 0 ? floorList.map((floorItem: FloorList[0]) => {
          return <Card key={floorItem.floorId}
            size="small"
            title={floorItem.name}
            extra={<>
              <Popconfirm
                title="删除景区"
                description="是否删除景区"
                onConfirm={() => del(floorItem?.floorId || '')}
                okText="是"
                cancelText="否"
              >
                <Tooltip title="删除">
                  <Button danger icon={<DeleteFilled />} type={"link"} />
                </Tooltip>

              </Popconfirm>
              <Tooltip title="编辑">
                <Button icon={<EditFilled />} onClick={() => editFloor(floorItem)} type={"link"} />
              </Tooltip>
              <Tooltip title="查看">
                <Button icon={<LinkOutlined />} onClick={() => toModel(floorItem.floorId || '')} type={"link"} />
              </Tooltip>
            </>}
            style={{ width: 300 }}>
            <Descriptions items={[{
              key: 'Descriptions' + floorItem.floorIndex,
              label: '景区索引',
              children: <p>{floorItem.floorIndex}</p>
            }, {
              key: 'Descriptions' + floorItem.storeCount,
              label: '商铺数量',
              children: <p>{floorItem.storeCount || 0}</p>
            }]} />
          </Card>
        }) : <Empty />}
      </div>

    </PageContainer >
  );
};

export default HomePage;
