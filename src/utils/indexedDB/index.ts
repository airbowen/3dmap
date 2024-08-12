/* eslint-disable prettier/prettier */
// import {EventTarget} from 
export class DataBase {
    databaseName: string;
    db: IDBOpenDBRequest['result'];
    isOpen = false
    keyPath: string
    constructor(databaseName: string, keyPath = 'id') {
        this.databaseName = databaseName
        this.keyPath = keyPath
        const request: IDBOpenDBRequest = window.indexedDB.open(this.databaseName);
        request.onerror = () => {
            console.log('数据库打开报错');
            this.isOpen = false
        };
        request.onsuccess = () => {
            this.db = request.result;
            console.log('数据库打开成功');
            this.isOpen = true
        }
        request.onupgradeneeded = (event: any) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.databaseName)) {
                this.db.createObjectStore(this.databaseName, {
                    keyPath: this.keyPath
                }); // 主键自增
            }
        };
    }
    async saveDataByKeyPath(kp: string, data: any): Promise<void> {
        // this.name = name;
        const strScene: string = JSON.stringify(data);
        const object = {
            data: strScene
        };
        object[this.keyPath] = kp
        const isHave = await this.isHave(kp)

        const store = this.db
            .transaction([this.databaseName], "readwrite")
            .objectStore(this.databaseName)

        console.log('store', store,object);

        if (isHave) {
            store.put(object);
        } else {
            store.add(object);
        }

    }
    isHave(kp: string): Promise<boolean> {
        return new Promise((resolve) => {
            const objectStore = this.db.transaction(this.databaseName).objectStore(this.databaseName);
            objectStore.openCursor().onsuccess = (event: any) => {
                const cursor = event.target.result;
                console.log('cursor', cursor, kp);

                resolve(cursor && cursor?.primaryKey === kp)
            }
        })
    }
    getAllData(key?: string, value?: any) {
        return new Promise((resolve) => {
            const dataList: any[] = []
            const objectStore = this.db.transaction(this.databaseName).objectStore(this.databaseName);
            objectStore.openCursor().onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    // 获取当前记录
                    const record = cursor.value;
                    const data = JSON.parse(record.data)
                    if (key && value !== undefined) {
                        if (data[key] === value) {
                            dataList.push(data)
                        }
                    } else {
                        dataList.push(data)
                    }

                    // 继续遍历下一个记录
                    cursor.continue();
                } else {
                    // 游标遍历完毕
                    resolve(dataList)
                }
            }
        })
    }
    getDataByKeyPath(kp: string): Promise<any> {
        return new Promise((resolve) => {
            const request = this.db
                .transaction([this.databaseName])
                .objectStore(this.databaseName)
                .get(kp);

            request.onsuccess = function () {
                if (request?.result) {
                    resolve(request?.result)
                } else {
                    resolve(null)

                }
            };

        })
    }
    removeDataByKeyPath(kp: string) {
        return new Promise((resolve) => {
            const request = this.db
                .transaction([this.databaseName], "readwrite")
                .objectStore(this.databaseName)
                .delete(kp);

            request.onsuccess = function () {
                resolve(true)
            }
        })
    }

}
