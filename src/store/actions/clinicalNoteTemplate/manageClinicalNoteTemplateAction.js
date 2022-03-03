import * as manageClinicalNoteTemplateActionType from './manageClinicalNoteTemplateActionType';

export const requestData = ({params={}}) => {
    return {
        type: manageClinicalNoteTemplateActionType.REQUEST_DATA,
        params
    };
};

