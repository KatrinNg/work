const ClientServiceViewEnum = {
    NOTE_TYPE: {
        CONS: 'Consultation',
        MOE: 'Medication',
        VAC: 'Vaccine',
        IOE: 'Investigation',
        REISSUE:'Re-issue Certificate'
    },
    NOTES_CATEGORY_CD: {
        Consultation: 'CONS',
        Medication: 'MOE',
        Vaccine: 'VAC',
        Investigation: 'IOE',
        ReissueCertificate:'REISSUE'
    },
    NOTE_STATUS: {
        WAIVE:'W',
        PAID: 'P',
        REFUND: 'R',
        COMPLETED: 'C'
    },
    WAIVE_TYPE: [
        { value: 'EP', label: 'EP' },
        { value: 'DV', label: 'DV' },
        { value: 'O', label: 'O' }
    ]
};

export default ClientServiceViewEnum;
