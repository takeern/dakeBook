import { SET_LOCALDB } from './constans';

const initState = {
    
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
        default: return state;
    }
};