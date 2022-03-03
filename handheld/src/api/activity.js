import API from './index';

const api = {
    setTreatmentDetails(data) {
        console.log(data)
        return API.authAPI({
            url: '/setTreatmentDetails',
            method: 'POST',
            data,
        });
    }

};

export default api;
