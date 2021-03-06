import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import home from './home/reducers';
import init from './init/reducers';
import read from './read/reducers';

const rootReducer = combineReducers({
    home,
    init,
    read,
    //...
});



export default (history, preloadedState) => {
    return createStore(
		connectRouter(history)(rootReducer),
			preloadedState,
			applyMiddleware(
			thunkMiddleware,
			routerMiddleware(history),
		)
	);
};
