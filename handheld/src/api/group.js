import API from './index';

const api = {
    getTherapeuticGroupList(data) {
        console.log(data)
        return API.authAPI({
            url: '/getTherapeuticGroupCalendarList',
            method: 'POST',
            data,
        });
    },

    setTherapeuticGroup(data) {
            console.log(data)
            return API.authAPI({
                url: '/setTherapeuticGroup',
                method: 'POST',
                data,
            });
    },

    getTherapeuticGroupDetail(data) {
            console.log(data)
            return API.authAPI({
                url: '/getTherapeuticGroupPatientListForHandheld',
                method: 'POST',
                data,
            });
    },
};

export default api;
