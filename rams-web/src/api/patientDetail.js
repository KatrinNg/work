import API from './index';

const api = {
    getPatientPrescription(data) {
        console.log(data)
        return API.authAPI({
            url: '/queryPatientPrescription',
            method: 'POST',
            data,
        });
    },
    getRoomList(data) {
        return API.authAPI({
            url: '/getMasterRoomList',
            method: 'POST',
            data,
        });
    },
    getPatientMasterList(data) {
        console.log(data,"data")
        return API.authAPI({
            url: '/getMasterPatientDetail',
            method: 'POST',
            data,
        });
    },
    getMasterListStatic(data) {
        return API.authAPI({
            url: '/getMasterListStaticItemForPrescription',
            method: 'POST',
            data,
        });
    },
    getProtocolList(data) {
        return API.authAPI({
            url: '/getProtocolAndSetOfActivities',
            method: 'POST',
            data,
        });
    },
    savePrecautions(data) {
        return API.authAPI({
            url: '/savePatientPrescription',
            method: 'POST',
            data,
        });
    },
    getTherapeuticGroupCalendarList(data) {
        return API.authAPI({
            url: '/getTherapeuticGroupCalendarList',
            method: 'POST',
            data,
        });
    },
    getTherapeuticGroupPatientList(data) {
        return API.authAPI({
            url: '/getTherapeuticGroupPatientList',
            method: 'POST',
            data,
        });
    },
    getTherapeuticGroupPatientData(data) {
        return API.authAPI({
            url: '/getTherapeuticGroupPatient',
            method: 'POST',
            data,
        });
    }
};

export default api;
