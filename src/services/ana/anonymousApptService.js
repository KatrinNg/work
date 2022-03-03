import { maskAxios } from '../axiosInstance';


const url = {
    anonymousAppt: '/ana/anonymousAppointments',
    reAnonymousAppt:'/ana/reAnonymousAppointment'
};

export function updateAnonymousAppt(params) {
    return maskAxios.put(url.anonymousAppt, params);
}

export function reAnonymousAppt(params){
    return maskAxios.put(url.reAnonymousAppt,params);
}