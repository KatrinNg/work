import API from './index';

const api = {
    getSceneData(data) {
        console.log(data)
        return API.authAPI({
            url: '/getAllCurrentTreatmentInGymRoom',
            method: 'POST',
            data,
        });
    }
};

export default api;
