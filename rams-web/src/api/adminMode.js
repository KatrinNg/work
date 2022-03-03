import API from './index';

const api = {
    getGroupList(data) {
        return API.authAPI({
            url: 'getTherapeuticGroupCategoryAndGroupName',
            method: 'POST',
            data,
        });
    },
    updateGroupList(data) {
        return API.authAPI({
            url: 'setTherapeuticGroupCategoryAndGroupName',
            method: 'POST',
            data,
        });
    },
    getProtocolList(data) {
        return API.authAPI({
            url: 'getProtocolAndSetOfActivities',
            method: 'POST',
            data,
        });
    },
    updateProtocolList(data) {
        return API.authAPI({
            url: 'setProtocolAndSetOfActivities',
            method: 'POST',
            data,
        });
    },
    getRoomListInActivity(data) {
        return API.authAPI({
            url: 'getMasterRoomList',
            method: 'POST',
            data,
        });
    },
    getActivityListByRoom(data) {
        return API.authAPI({
            url: 'getTreatmentMasterListByRoom',
            method: 'POST',
            data,
        });
    },
    saveActivityList(data) {
        return API.authAPI({
            url: 'updateTreatmentMasterListByRoom',
            method: 'POST',
            data,
        });
    },
    getHotList(data) {
        return API.authAPI({
            url: 'getHotItemsInGymRoom',
            method: 'POST',
            data,
        });
    },
    updateHotList(data) {
        return API.authAPI({
            url: 'setHotItemsInHymRoom',
            method: 'POST',
            data,
        });
    },
    getVitalSignTypeList(data){
        return API.authAPI({
            url: 'getEVitalDefaultList',
            method: 'POST',
            data,
        });
    },
    updateVitalSignTypeList(data){
        return API.authAPI({
            url: 'updateEVitalDefaultList',
            method: 'POST',
            data,
        });
    },
    getCategoryList(data){
        return API.authAPI({
            url: 'getCategoryMasterListByHosp',
            method: 'POST',
            data,
        });
    },
    updateCategoryList(data){
        return API.authAPI({
            url: 'updateCategoryMasterListByHosp',
            method: 'POST',
            data,
        });
    },
    getSideList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList', 
            method: 'POST',
            data,
        });
    },
    updateSideList(data){
        return API.authAPI({
            url: 'updateTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    getPositionList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updatePositionList(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getAssistanceList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateAssistanceList(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getWalkingAidsList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateWalkingAidsList(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getAssistiveDevice1List(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateAssistiveDevice1List(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getAssistiveDevice2List(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateAssistiveDevice2List(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getWeightBearingStatus1List(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateWeightBearingStatus1List(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getWeightBearingStatus2List(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    updateWeightBearingStatus2List(data){
        return API.authAPI({
            url: '',
            method: 'POST',
            data,
        });
    },
    getCategoryGroupList(data){
        return API.authAPI({
            url: 'getTherapeuticGroupCategoryByHosp',
            method: 'POST',
            data,
        });
    },
    updateCategoryGroupList(data){
        return API.authAPI({
            url: 'updateTherapeuticGroupCategoryByHosp',
            method: 'POST',
            data,
        });
    },
    getDurationList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    getSetList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    getRepetitionList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    getResistanceList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    getResistanceUnitList(data){
        return API.authAPI({
            url: 'getTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        });
    },
    saveTreatmentProperties(data){
        return API.authAPI({
            url: 'updateTreatmentPropertiesMasterList',
            method: 'POST',
            data,
        }); 
    },
    getTreatmentList(data){
        return API.authAPI({
            url: 'getMasterListStaticItemForPrescription',
            method: 'POST',
            data,
        });
    }
};

export default api;
