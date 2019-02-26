const develement = 'dev';
const host = develement === 'dev' ? '//localhost:4000/' : '//10.23.35.125:4000';
export default {
    getBookInitData: host + 'getBookInitData?bookNumber=',
    getBookData: host + '/getBookData',
};