import API from './index';

const api = {
    getDashBoardList(data) {
        return API.authAPI({
            url: 'getAllCurrentTreatmentInGymRoom',
            method: 'POST',
            data,
        });
    },
    getDashBoardPatientInfo(data) {
        return API.authAPI({
            url: 'getEVitalRecordForDashboard',
            method: 'POST',
            data,
        });
    },
    getHotTimesList(data) {
        return API.authAPI({
            url: 'getHotItemsInGymRoom',
            method: 'POST',
            data,
        });
    },
};

export default api;
