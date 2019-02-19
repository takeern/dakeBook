const develement = 'dev';
export default {
    getBookInitData: develement === 'dev'? '//localhost:4000/getBookInitData?bookNumber=' : '',
    getBookData: develement === 'dev'? '//localhost:4000/getBookData' : '',
};