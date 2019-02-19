export default class LocalDb {
    constructor() {
        // this.init();
        this.db = null;
    }

    async init() {
        this.db = await this.getLocalDb();
        return this;
    }

    getLocalDb() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('dakebook');
            request.onerror = function (err) {
                reject(err);
            };
            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('books')) {
                    db.createObjectStore('books', { keyPath: 'tableNumber' });
                }
                resolve(db);
            };
            request.onsuccess = function () {
                const db = request.result;
                resolve(db);
            };
        });
    }

    setTable(item) {
        return new Promise((resolve, reject) => {
            if (!this.checkSetData(item)) {
                resolve({
                    code: -1,
                    msg: 'item error',
                });
            }
            const request = this.db.transaction([ 'books' ], 'readwrite')
                .objectStore('books')
                .add(item);
            request.onsuccess = function () {
                resolve({
                    code: 1,
                    msg: 'success',
                });
            };
            request.onerror = function (event) {
                reject({
                    code: -2,
                    data: event,
                });
            };
        });
    }

    setTables(items) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([ 'books' ], 'readwrite');
            const tsStore = request.objectStore('books');
            items.map(item => { // eslint-disable-line
                tsStore.add(item);
                request.onerror(() => {
                    reject({
                        code: -3,
                        msg: 'setTables error',
                    });
                });
            });
        });
    }

    checkSetData(item) {
        if (Object.prototype.toString.apply(item.tableNumber) !== '[object Number]') {
            return false;
        }
        if (Object.prototype.toString.apply(item.tableData) !== '[object String]') {
            return false;
        }
        return true;
    }

    getTable(tableNumber) {
        return new Promise((reslove, reject) => {
            const transaction = this.db.transaction([ 'books' ], 'readonly');
            const objectStore = transaction.objectStore('books');
            const request = objectStore.get(tableNumber);
            request.onerror = () => {
                reject({
                    code: -4,
                    msg: 'getTable error',
                });
            };
            
            request.onsuccess = () => {
                reslove(request.result);
            };
        });
    }

    getTables(a, b) {
        return new Promise((reslove, reject) => {
            try {
                const t = this.db.transaction([ 'books' ], 'readonly');
                const store = t.objectStore('books');
                const request = store.index('tableNumber');
                const range = IDBKeyRange.bound(a, b);
                const resluts = [];
                request.openCursor(range).onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        resluts.push(cursor.value);
                        cursor.continue();
                    } else {
                        reslove(resluts);
                    }
                };
            } catch(e) {
                reject(e);
            }
        });
    }
}