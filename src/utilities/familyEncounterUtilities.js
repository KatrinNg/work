import { getFullName } from './commonUtilities';
import moment from 'moment';

export const familyEncounterColumns = [
    { field: 'encounterStartDate', headerName: 'Encounter Date', flex: 0.85 },
    { field: 'encounterStartTime', headerName: 'Encounter Time', flex: 0.85 },
    { field: 'encntrTypeDesc', headerName: 'Encounter Type', flex: 1.5 },
    { field: 'patientKey', headerName: 'PMI', flex: 0.8 },
    {
        field: 'engSurname',
        headerName: 'Name',
        valueFormatter: (params) => {
            return getFullName(params.data.engSurname, params.data.engGivename);
        },
        flex: 1.7
    },
    {
        field: 'dob',
        headerName: 'DOB',
        valueFormatter: (params) => {
            return moment(params.data.dob).format('DD-MM-YYYY');
        },
        flex: 0.8
    },
    { field: 'hkid', headerName: 'HKID', flex: 1 },
    { field: 'genderCd', headerName: 'Sex', flex: 0.5 }
];
