import '../static/iconfont';

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

const createSignal = () => {
    if (window.AbortController) {
        const controller = new window.AbortController();
        return controller;
    }
    return {};
};

const toast = (msg) => {
    const div = document.createElement('div');
    div.className = 'message';
    div.style = `
        white-space: nowrap;
        font-size: 10px;
        position: absolute;
        height: 5vh;
        line-height: 5vh;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;
        opacity: 0.85;
        width: 65vw;
        bottom: 0;
        right: 0;
        left: 0;
        top: 0;
        margin: auto;
    `;
    div.innerText = msg;
    
    document.body.appendChild(div);
    div.addEventListener('animationend', () => {
        div.parentElement.removeChild(div);
    });
};

export {
    localStorageGet,
    localStorageSet,
    tfetch,
    createSignal,
    toast,
};