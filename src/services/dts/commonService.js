import { maskAxios, axios} from '../axiosInstance';
// import moment from 'moment';
// import Enum from '../../enums/enum';


const url = {
    listPatientByIds: '/patient/listPatientByIds'
};

export function listPatientByIds(params, maskMode) {
    if(maskMode)
        return maskAxios.post(url.listPatientByIds, [params.patientKey] );
    else
        return axios.post(url.listPatientByIds, [params.patientKey] );
}

export function getPatient(params, maskMode ){
    if(maskMode)
        return maskAxios.get(`/patient/patients?docType=${params.docType}&searchString=${params.searchStr}`);
    else
        return axios.get(`/patient/patients?docType=${params.docType}&searchString=${params.searchStr}`);
}

