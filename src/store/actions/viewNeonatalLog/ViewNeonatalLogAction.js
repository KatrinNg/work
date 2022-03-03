import * as type from './ViewNeonatalLogActionType';

export const getViewNeonatalLogLoadDrop = ({ params = {}, callback = null }) => {
    return {
        type: type.GET_VIEW_NEONTAL_LOG_LOAD_DROP,
        params,
        callback
    };
};
export const getViewNeonatalLogSearch = ({ params = {}, callback = null }) => {
    return ({
        type: type.GET_VIEW_NEONTAL_LOG_LOAD_SEARCH,
        params,
        callback
    });
};
