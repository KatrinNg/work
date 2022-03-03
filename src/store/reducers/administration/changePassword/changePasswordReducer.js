import * as changePasswordActionTypes from '../../../actions/administration/changePassword/changePasswordActionType';

const inital_state = {
    changePasswordDTO: {
        curPwd: '',
        newPwd: '',
        confirmNewPwd: ''
    },
    errorData: [],
    isCorrectCurPwd: true,
    isCorrectNewPwd: true
};

export default (state = inital_state, action = {}) => {
    switch (action.type) {
        case changePasswordActionTypes.RESET_ALL:
            return inital_state;
        case changePasswordActionTypes.UPDATE_FIELD: {
            let changePasswordDTO = { ...state.changePasswordDTO };
            let { name, value } = action;
            changePasswordDTO[name] = value;
            return {
                ...state,
                changePasswordDTO,
                errorData: [],
                isCorrectCurPwd: true,
                isCorrectNewPwd: true
            };
        }
        case changePasswordActionTypes.UPDATE_CANCEL: {
            return inital_state;
        }
        case changePasswordActionTypes.UPDATE_PASSWORD_ERROR: {
            let error = action.data;
            let curPwd = true, newPwd = true;
            for (let i = 0; i < error.length; i++) {
                if (error[i].fieldName === 'currentPassword')
                    curPwd = false;
                if (error[i].fieldName === 'newPassword')
                    newPwd = false;

            }
            return {
                ...state,
                errorData: action.data,
                isCorrectCurPwd: curPwd,
                isCorrectNewPwd: newPwd
            };
        }
        case changePasswordActionTypes.UPDATE_PASSWORD_SUCCESS:{
            return{
                ...state,
                changePasswordDTO: {
                    curPwd: '',
                    newPwd: '',
                    confirmNewPwd: ''
                }
            };
        }
        default:
            return state;
    }
};