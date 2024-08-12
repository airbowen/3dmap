import { DataBase } from "@/utils/indexedDB";
import { ResponseType, theError, theSuccess } from ".";

import { PROMOSE_RESPONSE } from "@/dictionary";

const dataBase = new DataBase('storeData', 'storeId');


export type createStoreInfoParams = {
    name: string; // 店铺名称
    floorId: string; // 所属景区
    storeId: string;
    type?: string; // 业态
    no?: string; // 编号
    logo?: string // logo
}

// 新建景区
export const createStoreInfo = (params: createStoreInfoParams): Promise<ResponseType & { data?: { id?: string } }> => {
    return new Promise((res, reg) => {
        dataBase.saveDataByKeyPath(params.storeId, params)
        res(theSuccess({ storeId: params.storeId }, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
    })
}



// 通过店铺id获取店铺信息
export const getStoreInfoByStoreId = (storeId: string): Promise<ResponseType & { data?: createStoreInfoParams }> => {
    return new Promise((res, reg) => {
        if (storeId) {
            dataBase.getDataByKeyPath(storeId).then((data) => {
                
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


export const setStoreByStoreId = async (storeId: string, params: createStoreInfoParams): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        try {
            dataBase.getDataByKeyPath(storeId).then((oldData) => {
                console.log('oldData',oldData);
                
                dataBase.saveDataByKeyPath(storeId, { ...JSON.parse((oldData?.data||"{}")), ...params, storeId })
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            })
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

// 删除店铺
export const removeStoreByStoreId = (storeId: string): Promise<ResponseType> => {
    return new Promise(async (res, reg) => {
        if (storeId) {
            dataBase.removeDataByKeyPath(storeId).then(() => {
                res(theSuccess(undefined, PROMOSE_RESPONSE.PROMOSE_SUCCESS_MSG))
            }).catch((error) => {
                res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_DELEETE_MSG))
            })
        } else {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_ISHAVE_MSG))
        }

    })
}

type StoreList = createStoreInfoParams[]
// 获取所有数据
export const getAllStoreList = (): Promise<ResponseType & { data?: StoreList }> => {
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
export const getStoreListByFloorId = (floorId: string): Promise<ResponseType & { data?: StoreList }> => {
    return new Promise(async (res, reg) => {
        try {
            const allDataList = await dataBase.getAllData('floorId', floorId)
            res(theSuccess(allDataList))
        } catch (error) {
            res(theError(PROMOSE_RESPONSE.PROMOSE_ERROR_MSG))
        }
    })
}

