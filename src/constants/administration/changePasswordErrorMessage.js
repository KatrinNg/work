import * as messageUtilities from '../../utilities/messageUtilities';

export const pwdFormatMsg = (params) => 'New Password does not fulfill password policy:<br/>' +
    '&nbsp;&nbsp;-Password length within ' + (params.passwordMinLength ? params.passwordMinLength : '8') + '-' + (params.passwordMaxLength ? params.passwordMaxLength : '32') + ' charcters<br/>' +
    '&nbsp;&nbsp;-Contains at least Mixed-Case alphabetic (Upper case and Lower case) characters<br/>' +
    '&nbsp;&nbsp;-Contains at least two numeric characters(0-9)<br/>' +
    '&nbsp;&nbsp;-Contains at least six alphanumeric characters<br/>'+
    '&nbsp;&nbsp;-New password cannot be the same as current password';

export const curPwdError = () => messageUtilities.getMessageDescriptionByMsgCode('110307');
export const curPwdRequired = () => messageUtilities.getMessageDescriptionByMsgCode('110308');
export const newPwdRequired = () => messageUtilities.getMessageDescriptionByMsgCode('110309');
export const confirmNewPwdRequired = () => messageUtilities.getMessageDescriptionByMsgCode('110310');
export const noMatchPwd = () => messageUtilities.getMessageDescriptionByMsgCode('110311');