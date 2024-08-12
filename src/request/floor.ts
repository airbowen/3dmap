import { DataBase } from "@/utils/indexedDB";

const dataBase = new DataBase('floorData', 'floorId');
import { v4 as uuidv4 } from 'uuid';
import { ResponseType, theError, theSuccess } from ".";
import { PROMOSE_RESPONSE } from "@/dictionary";

// 查找景区
export type getFloorInfoByFloorIdParams = {
    floorId: string
}
// 通过景区id获取景区信息
export const getFloorInfoByFloorId = (params: getFloorInfoByFloorIdParams): Promise<ResponseType & { data?: FloorList[0] }> => {
    return new Promise((res, reg) => {
        if (params.floorId) {
            dataBase.getDataByKeyPath(params.floorId).then((data) => {
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

export type createFloorInfoParams = {
    name: string;
    floorIndex: number;
    url: string;
    position: string
}

// 新建景区
export const createFloorInfo = (params: createFloorInfoParams): Promise<ResponseType & { data?: { floorId?: string } }> => {
    return new Promise((res, reg) => {
        const key = uuidv4()
        if (params.name !== undefined && params.floorIndex !== undefined && params.url !== undefined) {
            dataBase.saveDataByKeyPath(key, {
                ...params,
                floorId: key
            })
            res(theSuccess({ floorId: key }, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))

        } else {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

// 修改景区信息
export type setFloorInfoParams = {
    name?: string;
    floorIndex?: number;
    url?: string;
}
export const setFloorInfoByFloorId = async (floorId: string, params: setFloorInfoParams): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        try {
            dataBase.getDataByKeyPath(floorId).then((oldData) => {
                dataBase.saveDataByKeyPath(floorId, { ...JSON.parse(oldData.data), ...params,  })
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            })
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

// 删除景区
export const removeFloor = (floorId: string): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        if (floorId) {
            dataBase.removeDataByKeyPath(floorId).then(() => {
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            }).catch((error) => {
                res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_DELEETE_MSG))
            })
        } else {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_ISHAVE_MSG))
        }

    })
}


export type FloorList = {
    name?: string;
    floorId?: string;
    floorIndex?: number;
    url?: string;
    storeCount?: number
}[]
// 获取所有数据
export const getAllData = (): Promise<ResponseType & { data?: FloorList }> => {
    return new Promise(async (res, reg) => {
        try {
            const allDataList = await dataBase.getAllData()
            res(theSuccess(allDataList))
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}