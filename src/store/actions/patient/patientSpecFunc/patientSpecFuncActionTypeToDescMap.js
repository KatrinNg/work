import * as patientSpecFuncActionType from './patientSpecFuncActionType';
import {buildActionTypeDetail} from '../../../alsMiddleware/actionToAlsActionDescMiddleware';
import { TrendingUpOutlined } from '@material-ui/icons';

const patientSpecFuncActionTypeToDescMap = {
    //[patientSpecFuncActionType.SEARCH_IN_PATIENT_QUEUE]: buildActionTypeDetail('Search patient/customer in the patient list', null, 'Patient List', true)
};

export default patientSpecFuncActionTypeToDescMap;