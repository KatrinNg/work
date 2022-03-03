import moment from 'moment';

export const initReminderRec = {
    // sentDtm: '',
    // isAdHoc: 'N',
    // status: ''
    apptRmndId: null,
    commMeansCd: '',
    schDtm: moment(),
    subj: '',
    msg: '',
    remark: '',
    isAdHoc: 0,
    isEng: ''
};

// export const emailExtra={
//     tmplCd:'',
//     // subject:'',
//     content:'',
//     //
//     // subj:''
// };

export const language = [
    { name: 'English', value: '1' },
    { name: '中文', value: '0' }
];

export const status = [
    { name: 'Pending', value: 'P' },
    { name: 'Sent Fail', value: 'E' },
    { name: 'Complete', value: 'C' }
];


export const reminderResultCd = [
    { name: 'Delivered', value: 'S' },
    { name: 'Pending', value: 'P' },
    { name: 'Sent Fail', value: 'F' }
];

export const smsResults = [
    {
        name: 'Delivered', value: 'DELIVRD'
    },
    {
        name: 'Expired', value: 'EXPIRED'
    }
];