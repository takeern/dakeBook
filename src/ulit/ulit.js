const localStorageGet = (key, type) => {
    switch (type) {
        case ('table'): 
            key = `${key}-table`;
            break;
        case ('history'):
            key = `${key}-history`;
            break;
        default:
            break;
    }
    return localStorage.getItem(key);
};

const localStorageSet = (key, item) => {
    return localStorage.setItem(key, item);
};

const tfetch = (url, option, timeout = 10000) => {
    return Promise.race([
        fetch(url, option),
        new Promise((reslove) => {
            setTimeout(() => {
                reslove('time out'+timeout);
            }, timeout);
        }),
    ]);
};

export {
    localStorageGet,
    localStorageSet,
    tfetch,
};