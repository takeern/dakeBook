import { SET_LOCALDB, CHANGE_LOADING_STATE } from './constans';

const initState = {
    isLoading: false,
};

export default (state = initState, action) => {
    switch(action.type) {
        case(SET_LOCALDB): {
            return {
                ...state,
                localDb: action.payload.db,
                storageProps: action.payload.localProps,
            };
        }
        case(CHANGE_LOADING_STATE): {
            return {
                ...state,
                isLoading: action.payload,
            };
        }
        default: return state;
    }
};