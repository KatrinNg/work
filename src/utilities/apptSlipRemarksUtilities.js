/**
 * get userList for apptSlipRemarks table
 * @param {List} dataList the apptSlipRemarks data
 */
export function getApptSlipRemarksGroupList(dataList = [], clinicList = [], encounterTypeList = []) {
    let apptSlipRemarksList = [];
    if (dataList && dataList.length > 0) {
        apptSlipRemarksList = dataList.map((i) => {
            let clinic = clinicList.find(element => element.siteId === i.siteId);
            // let encounter = encounterTypeList.find(element => element.encntrTypeId === i.encntrTypeId);
            let newItem = {
                ...i,
                siteEngName: (clinic && clinic.siteEngName) || ''
                // encntrTypeDesc: (encounter && encounter.encntrTypeDesc) || ''
            };
            return newItem;
        });
    }
    apptSlipRemarksList.sort((a, b) => {
        let siteEngOrder = (a.siteEngName).localeCompare(b.siteEngName);
        if (siteEngOrder === 0) {
            let encntrTypeDescA = (a.encntrTypeDesc || '');
            let encntrTypeDescB = (b.encntrTypeDesc || '');
            let encntrDescOrder = encntrTypeDescA.localeCompare(encntrTypeDescB);
            return encntrDescOrder;
        } else {
            return siteEngOrder;
        }
    });
    return apptSlipRemarksList;
}
