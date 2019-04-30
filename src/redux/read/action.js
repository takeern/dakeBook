import api from '../../ulit/api';
import { tfetch } from '../../ulit/ulit';
import { CHANGE_LOADING_STATE } from '../init/constans';
import { bindActionCreators } from 'redux';
const inflate = require('../../../node_modules/pako/dist/pako_inflate.min');
import { Observable } from 'rxjs/Observable';

const getInitData = (bookNumber) => {
    return tfetch(`${api.getBookInitData}${bookNumber}`, {
        mode: 'cors',
    }, 10000).then(res => {
        if (res.json) return res.json();
        return res;
    });
};

const getBookData = (bookNumber, bookHref, signal) => {
    return tfetch(`${api.getBookData}?bookNumber=${bookNumber}&bookHref=${bookHref}`, {
        mode: 'cors',
        signal: signal,
    }, 10000).then(res => {
        if (res.json) return res.json();
        return res;
    });
};

const loadingChange = (state) => ({
    type: CHANGE_LOADING_STATE,
    payload: state,
});

const mapDispatch = (dispatch) => {
    return bindActionCreators({
        loadingChange,
    }, dispatch);
};

const handleDownload = (bookNumber) => {
    const socket = new WebSocket(`ws://${api.downloadBook}`);
    return Observable.create(observer => {
        socket.onopen = () => {
            socket.send(JSON.stringify({
                event: 'downloadBook',
                data: {
                    bookNumber,
                },
            }));
            socket.onmessage = (msg) => {
                const data = msg.data;
                const fd = new FileReader();
                fd.readAsArrayBuffer(data);
                fd.onload = (res) => {
                    let ab = res.target.result;
                    if (Object.prototype.toString.apply(ab) === '[object ArrayBuffer]') {
                        try {
                            ab = inflate.inflate(ab);
                        } catch (err) {
                            console.log(err);
                        }   
                        const wsData = new TextDecoder('utf-8').decode(new Uint8Array(ab)).split('|');
                        const wsObj = JSON.parse(wsData);
                        observer.next(wsObj);
                    }
                };

            };
        };
    });
};

export {
    getInitData,
    getBookData,
    mapDispatch,
    handleDownload,
};