import * as changePasscodeActionTypes from '../../../actions/administration/changePasscode/changePasscodeActionType';

const inital_state = {
    changePasscodeDTO: {
        oldPasscode: '',
        newPasscode: '',
        confirmnewPasscode: '',
        version: '',
        loginName: ''
    }
};

export default (state = inital_state, action = {}) => {
    switch (action.type) {
        case changePasscodeActionTypes.RESET_ALL:
            return inital_state;
        case changePasscodeActionTypes.UPDATE_FIELD: {
            let changePasscodeDTO = { ...state.changePasscodeDTO };
            let { name, value } = action;
            changePasscodeDTO[name] = value;
            return {
                ...state,
                changePasscodeDTO
            };
        }
        case changePasscodeActionTypes.UPDATE_CANCEL: {
            return {
                ...state,
                changePasscodeDTO: {
                    ...state.changePasscodeDTO,
                    oldPasscode: '',
                    newPasscode: '',
                    confirmnewPasscode: ''
                }
            };
        }

        case changePasscodeActionTypes.UPDATE_PASSCODE_SUCCESS: {
            return {
                ...state,
                changePasscodeDTO: {
                    ...state.changePasscodeDTO,
                    oldPasscode: '',
                    newPasscode: '',
                    confirmnewPasscode: ''
                }
            };
        }
        default:
            return state;
    }
};