import moment from 'moment';
// import _ from 'lodash';
import * as prescriptionUtilities from '../../utilities/prescriptionUtilities';
import * as moeUtilities from '../../utilities/moe/moeUtilities';
import Enum from '../../enums/enum';

export function getDrugHistoryListForUI(data) {
    if (!data) return null;
    let result = [];
    let hospSetting = moeUtilities.getHospSetting();
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        if (item.moeOrder && item.moeOrder.moeMedProfiles && item.moeOrder.moeMedProfiles.length > 0) {
            item.open = false;
            if (hospSetting.expandHistory) {
                item.open = true;
            }
            let moeMedProfiles = prescriptionUtilities.getDrugDataForUI(item, 'H');
            // item.moeOrder.ordDate = moment(item.moeOrder.ordDate).format('DD-MMM-YYYY');
            item.moeOrder.ordDate = moment(item.moeOrder.ordDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
            item.moeOrder.moeMedProfiles = moeMedProfiles;
            result.push(item);
        }
        //test start
        // if (result.length === 50)
        //     break;
        //test end
    }
    return result;
}