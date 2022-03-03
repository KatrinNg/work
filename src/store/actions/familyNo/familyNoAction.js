import * as familyNoActionType from './familyNoActionType';

export const getFamilyNoData = (id) => {
    return {
        type: familyNoActionType.GET_DATA,
        payload: { id: id }
    };
};

export const exportFamilyNoData = (value) => {
    return {
        type: familyNoActionType.GET_BASE64_EXCEL_DATA,
        payload: { pass: value.pass, reConfirmPass: value.reConfirmPass }
    };
};
