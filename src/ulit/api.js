const develement = 'uat';
const host = develement === 'dev' ? '//localhost:4000/' : 'http://47.103.12.134:4000/';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + 'getBookData',
    searchBook: host + 'getBookNumber?bookName=',
};