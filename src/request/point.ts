import { DataBase } from "@/utils/indexedDB";
import { ResponseType, theError, theSuccess } from ".";

import { PROMOSE_RESPONSE } from "@/dictionary";
import { Vector3, Vector3Tuple } from "three";

const dataBase = new DataBase('pointData', 'pointId');

export type createPointInfoParams = {
    floorId: string; // 所属景区
    pointId: string;
    attribute: string // logo
    position:Vector3Tuple
}

// 新建点位
export const createPointInfo = (params: createPointInfoParams): Promise<ResponseType & { data?: { id?: string } }> => {
    return new Promise((res, reg) => {
        dataBase.saveDataByKeyPath(params.pointId, params)
        res(theSuccess({ id: params.pointId }, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
    })
}



// 通过店铺id获取店铺信息
export const getPointInfoByPointId = (pointId: string): Promise<ResponseType & { data?: createPointInfoParams }> => {
    return new Promise((res, reg) => {
        if (pointId) {
            dataBase.getDataByKeyPath(pointId).then((data) => {
                if (data) {
                    res(theSuccess(JSON.parse(data.data)))
                } else {
                    res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_GETBYID_MSG))
                }
            })
        } else {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_GETBYID_MSG))
        }
    })
}


export const setPointByPointId = async (pointId: string, params: createPointInfoParams): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        try {
            dataBase.getDataByKeyPath(pointId).then((oldData) => {
                dataBase.saveDataByKeyPath(pointId, { ...JSON.parse((oldData?.data||"{}")), ...params, pointId })
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            })
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

// 删除店铺
export const removePointByStoreId = (pointId: string): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        if (pointId) {
            dataBase.removeDataByKeyPath(pointId).then(() => {
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            }).catch((error) => {
                res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_DELEETE_MSG))
            })
        } else {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_ISHAVE_MSG))
        }

    })
}

type StoreList = createPointInfoParams[]
// 获取所有数据
export const getAllPointList = (): Promise<ResponseType & { data?: StoreList }> => {
    return new Promise(async (res, reg) => {
        try {
            const allDataList = await dataBase.getAllData()
            res(theSuccess(allDataList))
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

// 根据景区id获取景区下所有的店铺
export const getPointListByFloorId = (floorId: string): Promise<ResponseType & { data?: StoreList }> => {
    return new Promise(async (res, reg) => {
        try {
            const allDataList = await dataBase.getAllData('floorId', floorId)
            res(theSuccess(allDataList))
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

