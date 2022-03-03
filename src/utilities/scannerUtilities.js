import Enum from '../enums/enum';
import * as CommonUtil from './commonUtilities';
import { getState } from '../store/util';

export function getScannerLicenseKey() {
    let where = {
        serviceCd: null,
        clinicCd: null
    };
    const clinicConfig = getState(state=>state.common.clinicConfig);
    const siteParam = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.DYNAMSOFT_SCANNING_LICENSE_KEY, clinicConfig, where);

    if (siteParam && siteParam.configValue) {
        return siteParam.configValue;
    }
    return '';
}

