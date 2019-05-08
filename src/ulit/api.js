const develement = 'uat';
const host = develement === 'dev' ? 'https://www.ijosser.com/api/' : '/api/';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + 'getBookData',
    searchBook: host + 'getBookNumber?bookName=',
    downloadBook: '//47.103.12.134:4536',
};