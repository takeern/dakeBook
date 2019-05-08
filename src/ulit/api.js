const develement = 'uat';
const host = develement === 'dev' ? 'https://www.ijosser.com/' : '/api/';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + 'getBookData',
    searchBook: host + 'getBookNumber?bookName=',
    downloadBook: 'www.ijosser.com/ws',
};