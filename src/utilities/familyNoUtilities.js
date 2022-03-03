import * as yup from 'yup';
import moment from 'moment';
import { getFullName, getPatientCall } from './commonUtilities';
import { dispatch } from '../store/util';
import { OPEN_COMMON_MESSAGE } from '../store/actions/message/messageActionType';
import { isTempPatient } from './patientUtilities';

export const familyNocolumns = [
    { field: 'pmiGrpId', headerName: 'Family ID', flex: 1, hide: true },
    { field: 'pmiGrpName', headerName: 'Family No.', flex: 1 },
    {
        field: 'sdt',
        headerName: 'Last Encounter',
        flex: 1,
        valueFormatter: (params) => {
            return params.data.sdt ? moment(params.data.sdt).format('DD-MM-YYYY') : '';
        }
    },
    { field: 'patientKey', headerName: 'PMI', cellRenderer: 'PmiComponent', flex: 1 },
    {
        field: 'engSurname',
        headerName: 'Name',
        valueFormatter: (params) => {
            return getFullName(params.data.engSurname, params.data.engGivename);
        },
        flex: 1
    },
    {
        field: 'dob',
        headerName: 'DOB',
        valueFormatter: (params) => {
            return moment(params.data.dob).format('DD-MM-YYYY');
        },
        flex: 1
    },
    { field: 'hkid', headerName: 'HKID', flex: 1 },
    { field: 'genderCd', headerName: 'Sex', flex: 1 }
];

export const initialSearchFormValues = { familyNo: '' };

export const searchFormValidationSchema = yup.object({
    familyNo: yup.string().required()
});

export const initialExportFormValues = { pass: '', reConfirmPass: '' };

// mixed.oneOf(arrayOfValues: Array<any>, message?: string | function): Schema Alias: equals
export const ExportFormValidationSchema = yup.object({
    pass: yup.string().required('Required'),
    reConfirmPass: yup
        .string()
        .oneOf([yup.ref('pass')], 'Password does not match')
        .required('Required')
});

export const pad = (num, size) => {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
};

export const familyMemberNumberGenerator = (selectedFamilyMember, familyMemberData) => {
    if (selectedFamilyMember.length > 0 && familyMemberData.length > 0)
        return `${selectedFamilyMember.length + 1}/${familyMemberData.length}`;
    else return `1/${familyMemberData.length > 0 ? familyMemberData.length : 1}`;
};

export const isTempMemberExist = (memberList = []) => {
    const patientLabel = getPatientCall();

    const noTempMember = memberList.every((member) => member.idSts !== 'T');

    if (!noTempMember)
        dispatch({
            type: OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130209',
                params: [
                    { name: 'PATIENT_LABEL', value: patientLabel },
                    { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                ]
            }
        });

    return noTempMember ? false : true;
};

export const patientKeyFormatter = (patient) => {
    return `${isTempPatient(patient.idSts) ? 'T' : ''}${pad(patient.patientKey, 10)}`;
};