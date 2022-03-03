import API from './index';

const api = {
    getEVitalRecord(data) {
        console.log(data)
        return API.authAPI({
            url: 'getEVitalRecord',
            method: 'POST',
            data,
        });
    },
    getPatientPrescription(data) {
        //console.log(data)
        return API.authAPI({
            url: '/queryPatientPrescription',
            method: 'POST',
            data,
        });
    },
    getPrecautionsIconList(data) {
        //console.log(data)
        return API.authAPI({
            url: '/getMasterPatientDetail',
            method: 'POST',
            data,
        });
    },
    setTreatmentDetail(data) {
        //console.log(data)
        return API.authAPI({
            url: '/setTreatmentDetails',
            method: 'POST',
            data,
        });
    },
    getTreatmentRecord(data) {
        // console.log(data)
        return API.authAPI({
            url: '/getTreatmentRecordForPatient',
            method: 'POST',
            data,
        });
    },
    getCurrentTreatmentInGymRoomForPatient(data) {
        return API.authAPI({
            url: '/getCurrentTreatmentInGymRoomForPatient',
            method: 'POST',
            data,
        });
    },
    updateTreatmentRemarks(data) {
        return API.authAPI({
            url: '/updateTreatmentHandheldRemarks',
            method: 'POST',
            data,
        });
    },
    updateEVitalRecord(data) {
        return API.authAPI({
            url:'/setEVitalRecord',
            method:'POST',
            data,
        })
    }
    
};

export default api;
