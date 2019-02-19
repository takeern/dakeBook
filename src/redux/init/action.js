import { localStorageGet } from '../../ulit/ulit';
const setLocalProps = () => {
    return JSON.parse(localStorageGet('localBooks'));
};
export {
    setLocalProps,
};