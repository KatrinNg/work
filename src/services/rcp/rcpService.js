import { maskAxios } from '../axiosInstance';

const url={
    encounter:'/rcp/encounter'
};

export function listEncntrByCaseNo(params){
    return maskAxios.get(`${url.encounter}/${params}`);
}