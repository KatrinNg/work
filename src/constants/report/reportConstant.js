// Report Status options
// ---------------------------------------------------

export const REPORT_STATUS_CODE = {
    COMPLETE: 'C',
    PENDING: 'P',
    FAILURE: 'F'
};

export const REPORT_STATUS_LABEL = {
    COMPLETE: 'Completed',
    PENDING: 'Pending',
    FAILURE: 'Failed'
};

export const REPORT_STATUS_SET = [
    {
        code: REPORT_STATUS_CODE.COMPLETE,
        label: REPORT_STATUS_LABEL.COMPLETE
    },
    {
        code: REPORT_STATUS_CODE.PENDING,
        label: REPORT_STATUS_LABEL.PENDING
    },
    {
        code: REPORT_STATUS_CODE.FAILURE,
        label: REPORT_STATUS_LABEL.FAILURE
    }
];

export const JOB_PERIOD_TYPE_CODE = [
    {
        code: 'D',
        engDesc: 'DAY END'
    },
    {
        code: 'W',
        engDesc: 'WEEK END'
    },
    {
        code: 'M',
        engDesc: 'MONTH END'
    },
    {
        code: 'Y',
        engDesc: 'YEAR END'
    }
];

export const PERIOD_TYPE_CODE = [
    {
        code: 'D',
        cycle: 'Daily',
        cycleEnd: 'DAY END'
    },
    {
        code: 'W',
        cycle: 'Weekly',
        cycleEnd: 'WEEK END'
    },
    {
        code: 'M',
        cycle: 'Monthly',
        cycleEnd: 'MONTH END'
    },
    {
        code: 'Y',
        cycle: 'Annually',
        cycleEnd: 'YEAR END'
    },
    {
        code: 'Q',
        cycle: 'Quarterly',
        cycleEnd: 'QUARTERLY END'
    }
];

export const RPT_COD_ACCESS_RIGHT = {
    STAT_REPORT_CRON_JOB_COD: 'B900',
    STAT_REPORT_SVC_SITES_COD: 'B901',
    STAT_REPORT_SVC_USERS_COD: 'B902',
    STAT_REPORT_SITE_USERS_COD: 'B903',
    STAT_REPORT_INSTANT_GEN_COD: 'B904'
};

export const ALL_SITE_ID = [
    //EA3
    {
        RPT_NAME : 'RPT-ANT-SYS-0002'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0003'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0024'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0026'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0027'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0037'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0041'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0043'
    },
    {
        RPT_NAME : 'RPT-ANT-USR-0034A'
    },
    {
        RPT_NAME : 'RPT-ANT-USR-0034B'
    },
    //CDE4
    {
        RPT_NAME : 'RPT-ANT-SYS-0040'
    },
    {
        RPT_NAME : 'RPT-ANT-SYS-0042'
    }
];
export const RPT_ADMIN_TYPE = {
    RPT_SVC_N_SITE_ADMIN : 'A',
    RPT_SVC_ADMIN : 'S',
    RPT_SITE_ADMIN : 'C',
    RPT_NAN_ADMIN : 'N'
};

// ---------------------------------------------------


export const VALIDATION_MSG = {
    isEndDateAfterStartDate: 'The End Date cannot be earlier than the Start Date.',
    isIntervalLongerThan100Days: 'The Period must not be longer than a year.',
    isIntervalLongerThan7Days: 'Date range should be within one week.',
    isDateFromLongerThanOneYear: 'Date From should be within one year.',
    isValidDate: 'Invalid Date Format',
    isValidMonth: 'Please input a valid month number.',
    isNumberBetween1and52: 'Please enter a valid week range between 1 and 52.',
    isValidMonthByANT: 'Enter exactly 2 characters. Month should be in range of [ 01 - 12 ].',
    isYearBetween1900and2200: 'A valid year ranges between 1900 and 2200.'
};

export const mimeTypeList = [
    {
        name: 'pdf',
        ext: '.pdf',
        desc: 'Adobe Portable Document Format (PDF)',
        mimeType: 'application/pdf'
    },
    {
        name: 'csv',
        ext: '.csv',
        desc: 'Comma-separated values (CSV)',
        mimeType: 'text/csv'
    },
    {
        name: 'excel',
        ext: '.xlsx',
        desc: 'Microsoft Excel (OpenXML)',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
        name: 'xml',
        ext: '.xml',
        desc: 'XML',
        mimeType: 'application/xml'
    }
];

export const periodTypeList = [
    {
        value: 'Y',
        label: 'Year',
        item: 1
    },
    {
        value: 'M',
        label: 'Month',
        item: 2
    },
    {
        value: 'W',
        label: 'Week',
        item: 3
    },
    {
        value: 'D',
        label: 'Day',
        item: 4
    }
];

export const RPT_TMPL_PARAM_NAME_CODE = {
    siteId: 'SITE_ID' ,
    dtsSiteId: 'DTS_SITE_ID' ,
    rptPeriodStart: 'RPT_PERIOD_START',
    rptPeriodEnd: 'RPT_PERIOD_END',
    userId: 'USER_ID',
    doctorUserId: 'DOCTOR_USER_ID',
    nurseUserId: 'NURSE_USER_ID',
    dtsUserId: 'DTS_USER_ID',
    encounterTypeId: 'ENCOUNTER_TYPE_ID',
    encounterTypeDesc: 'ENCOUNTER_TYPE_DESC',
    monthNo: 'MONTH_NO',
    yearNo: 'YEAR_NO',
    // rptMode: 'SHS_0032_RPT_MODE',
    rptRoom: 'RM_ID_LIST',
    rptRoomOverbook: 'RSV_RM_ID_LIST',
    rptNumberOfWeek: 'NO_OF_WEEK',
    rpt34Room: 'RM_ID',
    rptRoomName: 'RM_NAME',
    rptRoomNameOverbook: 'RSV_RM_NAME',
    rptMode: {
        'SHS_0032_RPT_MODE': [
            { label: 'Simple', value: 'S', isDefault: true },
            { label: 'Full', value: 'F' }
        ],
        'SHS_0024_RPT_MODE': [
            { label: 'Total', value: 'T', isDefault: true },
            { label: 'Detail', value: 'D' }
        ]
    }
};

export const DEFAULT_FILE_TYPE = {
    pdf: 'P',
    excel: 'E',
    csv: 'C'
};

export const exportTypeList = [
    {
        value: 'pdf',
        label: 'PDF',
        isOpen: 'Y',
        fileType: DEFAULT_FILE_TYPE.pdf,
        item: 0
    },
    {
        value: 'excel',
        label: 'EXCEL',
        isOpen: 'Y',
        fileType: DEFAULT_FILE_TYPE.excel,
        item: 1
    },
    {
        value: 'csv',
        label: 'CSV',
        isOpen: 'Y',
        fileType: DEFAULT_FILE_TYPE.csv,
        item: 2
    }
];

export const RPT_TMPL_PARAM_CATEGORY_CODE = {
    // All means show the param in both instant gen page and config page
    all: 'A',
    instantGen: 'I',
    config: 'C',
    function: 'F'
};

export const IS_ALL_SITE = {
    ture :'Y' ,
    false :'N'
};

export const SELECT_ALL_OPTIONS = '-';
export const SELECT_ALL_LABEL = '* ALL';
export const SELECT_ALL_USER_DOCTOR_ROLE_LABEL = '* ALL Doctor Role';
export const SELECT_ALL_USER_NURSE_ROLE_LABEL = '* ALL Nurse Role';
export const SELECT_ALL_LABEL_WITHOUT_STAR = 'ALL';

export const DEFAULT_MAX_RETRY_COUNT = 3;
export const MAX_WEEK_COUNT = 15000;
export const YEAR_MONTH_WEEK = ['year', 'y', 'month', 'm', 'week', 'w'];
export const DAY = ['day', 'd'];
