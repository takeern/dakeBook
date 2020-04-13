const develement = 'prod';
const host = develement === 'dev' ? 'http://112.74.110.72:8083/' : 'http://127.0.0.1:8083/api/';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + 'getBookData',
    searchBook: host + 'getBookNumber?bookName=',
    downloadBook: '112.74.110.72:4536/',
};