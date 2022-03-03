import * as loginActionType from './loginActionType';
import {buildActionTypeDetail} from '../../alsMiddleware/actionToAlsActionDescMiddleware';
import accessRightEnum from '../../../enums/accessRightEnum';

const loginActionTypeDetails =  {
    //[loginActionType.DO_LOGIN]: (buildActionTypeDetail('Login', null, 'Auth', true)) ,
    [loginActionType.LOGOUT]: (buildActionTypeDetail(
        'Logout',
        null,
        'Auth',
        true
    ))
};

export default loginActionTypeDetails;