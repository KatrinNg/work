import * as manageTagaNoteTemplateActionType from './manageTagaNoteTemplateActionType';

export const requestData = ({params={}}) => {
    return {
        type: manageTagaNoteTemplateActionType.REQUEST_DATA,
        params
    };
};
