import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

//less
import '../static/css/home.less';

//store
import { GOT_LOGO_SRC } from '../redux/home/constans';
import { getLogoSrc } from '../redux/home/action';

// const debug = require('debug')('app:home');

const mapStateToProps = (state) => {
    const { message, poweredBy, img_src } = state.home;
    const { localDb } = state.init;
    return {
        message,
        poweredBy,
        img_src,
        localDb,
    };
};
import { localStorageGet } from '../ulit/ulit';
// const mapDispatchToProps = (dispatch) => {
//     return {
//         getLogoSrc: () => dispatch(getLogoSrc()),
//     };
// };

@connect(mapStateToProps)
export default class Home extends PureComponent {
    static loadData(store) {
        return new Promise(resolve => {
            getLogoSrc()
                .then(res => {
                    if (res.ok) return res.json();
                    
                    throw new Error('net not work');
                })
                .then (data => {
                    store.dispatch({
                        type: GOT_LOGO_SRC,
                        payload: data.img_src,
                    });
                    return resolve();
                })
                .catch (() => {
                    console.log('%c you can try npm run server', 'background:#aaa;color:#bada55');
                    store.dispatch({
                        type: GOT_LOGO_SRC,
                        payload: './src/static/img/duck.png',
                    });
                    return resolve();
                });
        });
    }
    render () {
        const { img_src } = this.props;
        return (
            <React.Fragment>
                <div className="demo">
                    <p className="message" > { this.props.message } </p>
                    <p className="footer"> { this.props.poweredBy } </p>
                    <div>
                        <img src={img_src} />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
