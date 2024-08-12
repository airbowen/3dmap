export const OSS_URL = 'https://three-statices.oss-cn-hangzhou.aliyuncs.com'

export enum PROMOSE_RESPONSE {
    "PROMOSE_ERROR_MSG" = '操作失败',
    "PROMOSE_SUCCESS_MSG" = '操作成功',
    "PROMOSE_ERROR_DELEETE_MSG" = '操作成功',
    "PROMOSE_ERROR_GETBYID_MSG" = '标识不存在',
    "PROMOSE_ERROR_ISHAVE_MSG" = '数据不存在'
}

export const STORE_TYPE_MAP = new Map([
    ['floor', '餐饮'],
    ['game', '娱乐'],
    ['clothing', '服装'],
    ['education', '教育'],
    ['algo', '人工智能'],
    ['other', '其他'],
])

export const STORE_ATTRIBUTE_MAP = new Map([
    ['fire', '消防'],
    ['wc', '卫生间'],
    ['shops', '商铺'],
    ['rest', '休息区'],
    ['visitorCenter', '游客中心'],
    ['parking', '停车场'],
    ['myposition', '我的位置'],
])
export const STORE_ATTRIBUTE_ICON_MAP = new Map([
    ['fire', '/floor-map/icon/xiaofangshuan.png'],
    ['wc', '/floor-map/icon/ziyuan.png'],
    ['shops', '/floor-map/icon/shangpuzhuanrang-.png'],
    ['rest', '/floor-map/icon/xiuxiqu2.png'],
    ['visitorCenter', '/floor-map/icon/kefu.png'],
    ['parking', '/floor-map/icon/tingchechang.png'],
])

export const FLOOR_MAP_URL = [{
    name: '闲林埠',
    url: '/floor-map/%E8%A5%BF%E5%8D%95%E5%A4%A7%E6%82%A6%E5%9F%8E/F1-01.svg',
}
]


export const rulesRequired = {
    rules: [{
        required: true,
        message: '${label}必填'
    }]
}
export const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 }
}

export const MouseState = {
    effective: true,
}