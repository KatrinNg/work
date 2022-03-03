import API from './index';

const api = {
    patientCheckInAndOut(data) {
        console.log(data)
        return API.authAPI({
            url: '/patientCheckInAndOut',
            method: 'POST',
            data,
        });
    }
};

export default api;
