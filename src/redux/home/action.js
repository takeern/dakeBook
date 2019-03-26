import { SHOW_MESSAGE } from './constans';

const getLogoSrc = () => {
    return fetch('http://127.0.0.1:2323/testRedux', {
        method: 'POST',
    });
};

const showMsg = (data) => {
    return {
        type: SHOW_MESSAGE,
        payload: data,
    }
}
export {
    getLogoSrc,
    showMsg,
};