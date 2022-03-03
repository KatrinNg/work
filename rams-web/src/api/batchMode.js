import API from './index';

const api = {
    getBatchPatientList(data) {
        return API.authAPI({
            url: 'getBatchOperationPatientList',
            method: 'POST',
            data,
        });
    },
    getBatchRoomList(data) {
        return API.authAPI({
            url: 'getMasterRoomList',
            method: 'POST',
            data,
        });
    },
    getTherapistList(data) {
        return API.authAPI({
            url: 'getTherapistList',
            method: 'POST',
            data,
        });
    },
    saveBatchPatientList(data) {
        return API.authAPI({
            url: 'setBatchOperation',
            method: 'POST',
            data,
        });
    }
};

export default api;
