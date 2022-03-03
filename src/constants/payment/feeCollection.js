export const ReportType = {
    DAY_END_RPT: 'DAY_END_RPT',
    GFMIS_DCB_DETAIL_CONTROL_RPT: 'GFMIS_DCB_DETAIL_CONTROL_RPT'
};

export const sessInfoBasic = {
    dayBeginCash: 0,
    dayBeginChequeAmt: 0,
    dayBeginConfirmIndt: 'N',
    dayBeginReceiptNum: '0',
    dayBeginShroffCash: 0,
    dayBeginShroffChequeAmt: 0,
    dayBeginTime: null,
    dayEndCash: null,
    dayEndChequeAmt: null,
    dayEndConfirmIndt: 'N',
    dayEndConfirmTime: null,
    dayEndReceiptNum: null,
    dayEndTime: null,
    daySessNum: 0,
    dbUpdateBy: null,
    gfmisClctCod: null,
    gfmisClctDesc: null,
    gfmisDeptCod: null,
    gfmisFileIndt: 'N',
    gfmisPhnNum: null,
    noTransactionIndt: null,
    rcpDaySessId: 0,
    rcpGfmisRoleAprv: null,
    rcpGfmisRoleAprvStr: null,
    rcpGfmisRolePreparer: null,
    rcpGfmisRolePreparerStr: null,
    rcpMachineId: 0,
    rptConfirmIndt: 'N'
};

export const shroffInfoBasic = {
    closeShroffCash: 0,
    closeShroffChequeAmt: 0,
    closeShroffConfirmIndt: 'N',
    closeShroffReceiptNum: '0',
    closeShroffTime: null,
    dbUpdateBy: null,
    openShroffCash: 0,
    openShroffChequeAmt: 0,
    openShroffConfirmIndt: 'N',
    openShroffReceiptNum: '0',
    openShroffTime: null,
    rcpShroffSessId: 0,
    shroffSessNum: 0
};

export const gfmisRoleBasic = {
    efftDate: null,
    expyDate: null,
    gfmisCntctNum: '',
    gfmisRole: '',
    gfmisTranId: '',
    gfmisUser: '',
    rcpGfmisClctCodId: '',
    rcpGfmisRoleId: 0,
    recSts: 'I',
    remark: '',
    siteId: 0,
    svcCd: ''
};

export const feeCodeBasic = {
    efftDate: null,
    expyDate: null,
    feeCod: '',
    feeCodEng: '',
    feeCodTcn: '',
    waiverIndt: '',
    rcpFeeCodId: 0,
    rcpFeeCodIdWaiver: '',
    nepIndt: '',
    feeTypeIndt: '',
    unitAmt: null,
    remark: '',
    recSts: 'I',
    siteId: 0,
    svcCd: ''
};

export const allocationCodeBasic = {
    efftDate: null,
    expyDate: null,
    rcpGfmisClctCodId: '',
    alctCod: '',
    rcpAlctCodId: 0,
    rcpFeeCodId: '',
    remark: '',
    recSts: 'I',
    siteId: 0,
    svcCd: ''
};