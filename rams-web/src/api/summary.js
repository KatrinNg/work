import API from './index';

const api = {
    getPatientSummaryList(data) {
        return API.authAPI({
            url: 'getPatientSummaryList',
            method: 'POST',
            data,
        });
    },
};

export default api;
