import API from './index';

const api = {
    getHospitalList(data) {
        console.log(data)
        return API.authAPI({
            url: '/getHospitalList',
            method: 'POST',
            data,
        });
    },
    getRoomList(data) {
       console.log(data)
        return API.authAPI({
            url: '/getMasterRoomList',
            method: 'POST',
            data,
        });
    },
    userLogin(data) {
       console.log(data)
        return API.authAPI({
            url: '/userLogin',
            method: 'POST',
            data,
        });
    }

};

export default api;
