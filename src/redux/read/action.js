import api from '../../ulit/api';
import { tfetch } from '../../ulit/ulit';

const getInitData = (bookNumber) => {
    return tfetch(`${api.getBookInitData}${bookNumber}`, {
        mode: 'cors',
    }, 5000).then(res => res.json());
};

const getBookData = (bookNumber, bookHref) => {
    return tfetch(`${api.getBookData}?bookNumber=${bookNumber}&bookHref=${bookHref}`, {
        mode: 'cors',
    }, 10000).then(res => {
        if (res.json) return res.json();
        return res;
    });
};
export {
    getInitData,
    getBookData,
};