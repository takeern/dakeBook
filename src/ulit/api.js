const develement = 'dev';
const host = develement === 'dev' ? 'http://47.103.12.134:8083/' : 'http://127.0.0.1:8083/';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + 'getBookData',
    searchBook: host + 'getBookNumber?bookName=',
    downloadBook: '47.103.12.134:4536/',
};