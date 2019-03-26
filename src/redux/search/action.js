import api from '../../ulit/api';
import { tfetch } from '../../ulit/ulit';

const searchBook = (bookName) => {
    return tfetch(`${api.searchBook}${bookName}`, {
        mode: 'cors',
    }, 10000).then(res => {
        if(res.json) return res.json();
        return res;
    });
};

export {
    searchBook,
};