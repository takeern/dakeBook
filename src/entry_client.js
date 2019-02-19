import React from 'react';
import ReactDOM from 'react-dom';
import { renderRoutes }from 'react-router-config';
import { Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import createStore from './redux/store';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';

import routes from './route';
import AsyncRouter from './asyncRouter.jsx';

const creatApp = (initState) => {
    const history = createBrowserHistory();
    const store = createStore(history, initState);
    return (
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<Switch>
					<AsyncRouter routes={routes} store={store} initState={initState}>
						{renderRoutes(routes)}
					</AsyncRouter>
				</Switch>
			</ConnectedRouter>
		</Provider>
    );
};

if(window.__initState__) {
    ReactDOM.hydrate(creatApp(window.__initState__), document.querySelector('.server-app'));
} else {
    ReactDOM.render(creatApp(), document.querySelector('.server-app'));
}