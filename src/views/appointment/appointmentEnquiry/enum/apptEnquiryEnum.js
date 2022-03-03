export default {
    APPT_TYPE_LIST: [
        {
            type: 'Appointment List',
            value: 'A'
        },
        {
            type: 'Defaulter Tracing Report',
            value: 'D'
        }
    ],
    APPT_TYPE: {
        /**
        * Appointment List report
        */
        APPT_LIST: 'A',
        /**
         * Defaulter Tracing report
         */
        DEFAULTER_TRACING: 'D'
    },
    APPT_LIST_HEADER: [
        {
            labelCd: 'encounter',
            labelName: 'Encounter',
            labelLength: 100
        },
        {
            labelCd: 'subEncounter',
            labelName: 'Sub-encounter',
            labelLength: 120
        },
        {
            labelCd: 'appointmentTime',
            labelName: 'Date/Time',
            labelLength: 105
        },
        {
            labelCd: 'patientName',
            labelName: 'Name',
            labelLength: 100
        },
        {
            labelCd: 'caseNo',
            labelName: 'Case No.',
            labelLength: 100
        },
        {
            labelCd: 'hkid',
            labelLength: 100,
            labelName: 'HKIC/Doc. No.'
        },
        {
            labelCd: 'genderCd',
            labelName: 'Sex',
            labelLength: 70
        },
        {
            labelCd: 'age',
            labelName: 'Age',
            labelLength: 50
        },
        {
            labelCd: 'phoneNo',
            labelName: 'Mobile No.',
            labelLength: 100
        },
        {
            labelCd: 'attnStatusCd',
            labelName: 'Attn.',
            labelLength: 50
        },
        {
            labelCd: 'caseTypeCd',
            labelName: 'Type',
            labelLength: 50
        },

        {
            labelCd: 'remarkAndMemo',
            labelName: 'Remark/Memo',
            labelLength: 220
        }
    ],
    DEFAULTER_TRANCING_HEADER: [
        {
            labelCd: 'encounter',
            labelName: 'Encounter',
            labelLength: 100
        },
        {
            labelCd: 'subEncounter',
            labelName: 'Sub-encounter',
            labelLength: 120
        },
        {
            labelCd: 'patientName',
            labelName: 'Name',
            labelLength: 100
        },
        {
            labelCd: 'caseNo',
            labelName: 'Case No.',
            labelLength: 100
        },
        {
            labelCd: 'hkid',
            labelLength: 100,
            labelName: 'HKIC/Doc. No.'
        },
        {
            labelCd: 'genderCd',
            labelName: 'Sex',
            labelLength: 70
        },
        {
            labelCd: 'age',
            labelName: 'Age',
            labelLength: 50
        },
        {
            labelCd: 'phoneNo',
            labelName: 'Mobile No.',
            labelLength: 100
        },
        {
            labelCd: 'defaulterNumber',
            labelName: 'Defaulter Number',
            labelLength: 50
        }
    ]

};