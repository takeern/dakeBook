import React, { Component } from 'react';
import { withRouter, Route } from 'react-router';
import { matchRoutes } from 'react-router-config';

import { setLocalProps } from './redux/init/action';
import { SET_LOCALDB } from './redux/init/constans';
import LocalDb from './ulit/LocalDb';

const loadAllData = (store, routes, location) => {
    const components = matchRoutes(routes, location.pathname);
    const pros = components.map(({ route, match }) => {
        const { loadData } = route.component; 
        return loadData
            ? loadData(store, match, location)
            : Promise.resolve(null);
    });
    return Promise.all(pros);
};

class AsyncRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showChildren: false,
            firstGetInfo : true,
            lastPath: null,
            hasSetInit: false,
        };
    }
    
    componentWillReceiveProps (nextprops) {
        const { routes, store, location, children } = this.props; // eslint-disable-line
        if(nextprops.location !== this.props.location) {
            
            loadAllData(store, routes, nextprops.location).then(() => {
                this.setState({
                    nextlocation: nextprops.location,
                });
            });
        }
    }
    componentDidMount () {
        const { store } = this.props;
        const { hasSetInit } = this.state;
        if (!hasSetInit) {
            let db = new LocalDb();
            db.init().then(() => {
                store.dispatch({
                    type: SET_LOCALDB,
                    payload: {
                        db,
                        localProps: setLocalProps(),
                    },
                });
                this.setState({
                    hasSetInit: true,
                });
            });
        }
    }
    render () {
        const { routes, store, location, children } = this.props;
        if (this.state.firstGetInfo) {
            if (!this.props.initState) {
                
                loadAllData(store, routes, location).then(() => {
                    this.setState({
                        showChildren: true,
                        firstGetInfo: false,
                        nextlocation: location,
                    });
                });
            } else {
                this.setState({
                    showChildren: true,
                    firstGetInfo: false,
                    nextlocation: location,
                });
            }

        }

        const showChildren = this.state.showChildren && this.state.hasSetInit && this.state.nextlocation === this.props.location ;

        return (
            <Route
                location={location}
                render={() => showChildren? children : null}
                local={{}}
            />    
        );
    }
}
export default withRouter(AsyncRouter);
