import React, { Component } from 'react';

import { renderRoutes } from 'react-router-config';
import Loading from './Loading';

export default class NavSider extends Component {
    render() {
        const { route } = this.props;
        return (
            <div>
                <div className='content'>
                    {renderRoutes(route.routes)}
                </div>
                <Loading />
            </div>
        );
    }
}