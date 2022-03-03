import API from './index';

const api = {
    getBasicInfo(data) {
        return API.authAPI({
            url: 'getMXCommonSession',
            method: 'POST',
            data,
        });
    },
};

export default api;
