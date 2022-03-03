import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AttendanceCertNew from './attendanceCertNew';
import moment from 'moment';
import _ from 'lodash';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import {
    getAttendanceCert,
    updateField,
    listAttendanceCertificates,
    updateAttendanceCertificate,
    deleteAttndCert,
    resetAll
} from '../../../store/actions/certificate/attendanceCertificate/attendanceCertAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import HistoryList from '../component/historyList';
import Enum from '../../../enums/enum';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import accessRightEnum from '../../../enums/accessRightEnum';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';
import { print } from '../../../utilities/printUtilities';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../../components/PDF/CIMSPdfViewer';
import { getUseDH65PrinterValue, getUseCustAtndCertSess } from '../../../utilities/siteParamsUtilities';

const styles = theme => ({
    container: {
        height: '100%',
        padding: theme.spacing(1) / 2,
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    enctRoom: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    dialogPaper: {
        width: '80%'
    }
});

const sortFunc = (list) => {
    list.sort((a, b) => {
        if (moment(a.createDtm).isBefore(moment(b.createDtm))) {
            return 1;
        } else if (moment(a.createDtm).isSame(moment(b.createDtm))) {
            return 0;
        } else {
            return -1;
        }
    });
};

class AttendanceCert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attendanceTo: '',
            attendanceDate: '',
            attendanceSection: '',
            attendanceSectionFrom: '',
            attendanceSectionTo: '',
            attendanceFor: '',
            attendanceForOthers: '',
            attendanceRemark: '',
            attendanceIssueDate: '',
            copyNo: 1,
            allowCopyList: [1, 2, 3, 4, 5],
            history: {
                open: true,
                // serviceCd: this.props.service && this.props.service.serviceCd,
                serviceCd: '*All',
                dateFrom: moment().subtract(1, 'years'),
                dateTo: moment(),
                selectedIndex: '',
                selectedSite: '',
                // siteId: this.props.clinic.siteId,
                siteId: '*All',
                clinicList: CommonUtilities.getClinicListByServiceCode(this.props.clinicList, this.props.service && this.props.service.serviceCd)
            },
            pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING,
            certCdtm: '',
            certVer: '',
            selCert: { certInfo: null, copyPage: 1, svcCd: null },
            serviceArr: [],
            hasEditRight: true,
            previewDialogOpen: false,
            previewData: null,
            handlingPrint: false,
            handlingCopyToNew: false,
            codSppSiteAlterCd: null
        };
        this.state = Object.assign({}, this.state, this.initState());
        this.handlingPreviewAndPrint = false;
    }

    componentDidMount() {
        this.updateAttendanceHistoryList((rows) => {
            this.svcOptsFiltering(rows);
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditAttendanceCert);
        this.setState({ hasEditRight, selCert: { ...this.state.selCert, svcCd: this.props.service.svcCd } });
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.attendanceCert, () => this.checkCertIsDirty(hasEditRight), this.handleSubmit);
        this.props.updateCurTab(accessRightEnum.attendanceCert, this.doClose);
    }

    componentWillUnmount = () => {
        this.props.resetAll();
        this.setState = () => false;
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_ATND_CERT);
        const history = _.cloneDeep(this.state.history);
        if (serviceArr.findIndex(x => x.svcCd === service.svcCd) === -1) {
            history.serviceCd = '*All';
            history.siteId = '*All';
            if (serviceArr.length === 0) {
                history.clinicList = [];
            } else {
                let siteOpts = [];
                serviceArr.forEach(svc => {
                    let filterSite = CommonUtilities.getClinicListByServiceCode(clinicList, svc.svcCd);
                    siteOpts = siteOpts.concat(filterSite);
                });
                history.clinicList = siteOpts;
            }
        } else {
            if (!isSave) {
                history.serviceCd = service.svcCd;
                history.siteId = clinic.siteId;
            }
            if (history.serviceCd === '*All') {
                let siteOpts = [];
                serviceArr.forEach(svc => {
                    let filterSite = CommonUtilities.getClinicListByServiceCode(clinicList, svc.svcCd);
                    siteOpts = siteOpts.concat(filterSite);
                });
                history.clinicList = siteOpts;
            } else {
                history.clinicList = CommonUtilities.getClinicListByServiceCode(clinicList, history.serviceCd);
            }
        }

        if (history.serviceCd !== '*All') {
            rows = rows.filter(item => item.svcCd === history.serviceCd);
        }
        if (history.siteId !== '*All') {
            rows = rows.filter(item => item.siteId === history.siteId);
        }
        this.setState({ serviceArr, history: history }, ()=>{
            if (CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate) && rows && rows[0]) {
                if (this.state.serviceArr.length > 0) {
                    this.handleHistoryListItemClick('0', rows && rows[0]);
                }
            }
        });
        this.props.updateField({ attendanceCertList: rows });
    }

    handleSubmit = (closeTabFunc) => {
        this.props.updateField({ closeTabFunc: closeTabFunc || null });
        this.attendanceCertNewRef.refs.attendanceCertNewForm.submit();
    }

    initState = () => {
        const { attendance,encounterInfo, service, clinic, clinicConfig,siteParams } = this.props;
        const attendanceTime = attendance && attendance.arrivalTime;
        const _attendanceTime = attendanceTime ? moment(attendanceTime) : moment();
        const where = { serviceCd: service.svcCd, clinicCd: clinic.clinicCd };
        const siteParamIsPrev = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.CLC_ATND_CERT_RSN_DEFAULT, clinicConfig, where);
        let attendanceSection = CertUtil.getAttendanceCertSessionValue(CommonUtilities.matchSection(moment(), 'H', false));

        let attnDate='';
        if(encounterInfo&&encounterInfo.encounterDate){
            attnDate=moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        }

        const custAtndCertSess = getUseCustAtndCertSess(siteParams, service.svcCd, clinic.siteId);
        if (custAtndCertSess) {
            const custAtndCertSessAm = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, service.svcCd, clinic.siteId, 'USE_CUST_ATND_CERT_SESS_AM');
            const custAtndCertSessPm = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, service.svcCd, clinic.siteId, 'USE_CUST_ATND_CERT_SESS_PM');
            attendanceSection = CertUtil.getAttendanceCertSessionValue(CertUtil.getAttendanceCertSessLabelBySiteParams(custAtndCertSessAm, custAtndCertSessPm));
        }

        return {
            attendanceTo: 'Whom it may concern',
            // attendanceDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceDate:attnDate,
            attendanceSection: attendanceSection || '',
            attendanceSectionFrom: moment(_attendanceTime).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceSectionTo: _attendanceTime.isAfter(moment()) ? moment(_attendanceTime).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceFor: siteParamIsPrev?.configValue?? '',
            attendanceForOthers: '',
            attendanceRemark: '',
            attendanceIssueDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            copyNo: 1,
            pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING,
            certId: '',
            printType: '',
            certCdtm: '',
            handlingCopyToNew: false
        };
    }

    updateAttendanceHistoryList = (callback, isDel) => {
        const { patientInfo } = this.props;
        const { dateFrom, dateTo, serviceCd, siteId } = this.state.history;
        const isHistoryValid = this.refs.historyListRef.isFormValid();
        isHistoryValid.then(result => {
            if (result) {
                const params = {
                    patientKey: patientInfo && patientInfo.patientKey,
                    // serviceCd: serviceCd === '*All' ? '' : serviceCd,
                    svcCd: serviceCd === '*All' ? '' : serviceCd,
                    from: dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    to: dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    siteId: siteId === '*All' ? '' : siteId
                };
                // if (serviceCd !== '*All') {
                //     params.svcCd = serviceCd;
                // }
                if (isDel) {
                    params.svcCd = '';
                    params.siteId = '';
                }
                this.props.listAttendanceCertificates(params, (data) => {
                    if (typeof callback === 'function') {
                        data = data && data.filter(item => item.status === 'A');
                        callback(data);
                    } else {
                        return;
                    }
                });
            }
        });
    }

    handleOnChange = (value, name) => {
        // if (name === 'attendanceTo' || name === 'attendanceRemark' || name === 'attendanceForOthers') {
        //     const reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        //     if (reg.test(value)) {
        //         return;
        //     }
        // }
        this.setState({ [name]: value });
    }

    getSiteAlterOpts = (params) => {
        const { service } = this.props;
        const { codSppSiteAlterCd } = this.state;
        if (service.svcCd === 'SPP') {
            params.codSppSiteAlterCd = codSppSiteAlterCd;
            params.attendanceCertificateDto.codSppSiteAlterCd = codSppSiteAlterCd;
        }
        return params;
    }

    handlePrint = (params) => {
        this.props.updateField({ handlingPrint: true });
        let copyNo = this.state.copyNo;
        const { pageStatus, certId, certVer, history } = this.state;
        const { siteParams, service, clinic } = this.props;
        if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && params.opType === 'SP') || params.opType === 'RP') {
            params.attendanceCertificateDto.id = certId;
            // params.attendanceCertificateDto.printType = printType;
            params.attendanceCertificateDto.version = certVer;
        }
        // const isUseDH65Printer = getUseDH65PrinterValue(siteParams, service.svcCd, clinic.siteId);
        let isFitPage = false;
        let printQue = '';
        const dh65PrinterVal = getUseDH65PrinterValue(siteParams, service.svcCd, clinic.siteId);
        if (dh65PrinterVal) {
            isFitPage = true;
            printQue = dh65PrinterVal;
        }
        let desc = '';
        if (params.opType === 'SP') {
            desc = AlsDesc.CERT_SAVE_AND_PRINT;
        } else {
            desc = AlsDesc.CERT_RE_PRINT;
        }
        this.props.auditAction(desc);
        params = this.getSiteAlterOpts(params);
        this.props.getAttendanceCert(
            params,
            copyNo,
            isFitPage,
            printQue,
            (printSuccess) => {
                this.props.updateField({ handlingPrint: false });
                if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && params.opType === 'SP') || params.opType === 'RP') {
                    this.setState({
                        history,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                    }, () => {
                        this.updateAttendanceHistoryList((rows) => {
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, this.props.attendanceCertList && this.props.attendanceCertList[history.selectedIndex]);
                        }, true);
                    });
                } else {

                    if (params.opType === 'SP') {
                        let { history } = this.state;
                        history.selectedIndex = '0';
                        this.setState({
                            history,
                            pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                        }, () => {
                            this.updateAttendanceHistoryList((rows) => {
                                this.svcOptsFiltering(rows, true);
                                this.handleHistoryListItemClick('0', rows && rows[0]);
                            }, true);
                        });
                    }
                }
                // });
                if (printSuccess) {
                    // eslint-disable-next-line

                }
            });
    }

    handleSaveAndPreview = (params) => {
        let copyNo = this.state.copyNo;
        const { pageStatus, certId, certVer, history } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && params.opType === 'SP') {
            params.attendanceCertificateDto.id = certId;
            // params.attendanceCertificateDto.printType = printType;
            params.attendanceCertificateDto.version = certVer;
        }
        let desc = AlsDesc.CERT_SAVE_AND_PREVIEW;
        params=this.getSiteAlterOpts(params);
        this.props.auditAction(desc);
        this.props.getAttendanceCert(
            params,
            copyNo,
            false,
            '',
            (base64) => {
                if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && params.opType === 'SP') {
                    this.setState({
                        history,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                        previewDialogOpen: true,
                        previewData: base64
                    }, () => {
                        this.updateAttendanceHistoryList((rows) => {
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, this.props.attendanceCertList && this.props.attendanceCertList[history.selectedIndex]);
                        }, true);
                    });
                } else {
                    let { history } = this.state;
                    history.selectedIndex = '0';
                    this.setState({
                        history,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                        previewDialogOpen: true,
                        previewData: base64
                    }, () => {
                        this.updateAttendanceHistoryList((rows) => {
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick('0', rows && rows[0]);
                        }, true);
                    });
                }
            }, true);
    }

    handleHistoryChange = (value, name) => {
        let { history, serviceArr } = this.state;
        if (name === 'selectedSite') {
            history.siteId = value;
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
                // const serviceArr = CertUtil.getAccessedServices(this.state.filterSvc, this.props.service.serviceCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_ATND_CERT);
                history.clinicList = this.props.clinicList.filter((item) => {
                    const obj = serviceArr.find(i => i.svcCd === item.svcCd);
                    return obj !== undefined;
                });
            } else {
                history.clinicList = CommonUtilities.getClinicListByServiceCode(this.props.clinicList, value);
            }
            history.siteId = '*All';
        } else {
            history[name] = value;
        }
        this.setState({ history }, () => {
            if (name !== 'dateFrom' && name !== 'dateTo' && name !== 'open') {
                this.updateAttendanceHistoryList((rows) => {
                    if (serviceArr.length > 0) {
                        if (history.serviceCd === '*All' && history.siteId === '*All'){
                            let { attendanceCertList } = this.props;
                            rows = CertUtil.getShareSvcCertList(attendanceCertList || [], serviceArr, sortFunc);
                        }
                        if (history.serviceCd !== '*All') {
                            rows = rows.filter(item => item.svcCd === history.serviceCd);
                        }
                        if (history.siteId !== '*All') {
                            rows = rows.filter(item => item.siteId === history.siteId);
                        }
                        this.handleHistoryListItemClick('0', rows && rows[0]);
                    }
                }, false);
            }
        });
    }

    handleHistoryBlur = (value, name) => {
        let { history, serviceArr } = this.state;
        if (name === 'dateFrom' || name === 'dateTo') {
            if (name === 'dateFrom' && moment(value).isAfter(history.dateTo)) {
                history.dateTo = value;
            } else if (name === 'dateTo' && moment(value).isBefore(history.dateFrom)) {
                history.dateFrom = value;
            }
            this.setState({ history }, () => {
                if (serviceArr.length > 0) {
                    this.updateAttendanceHistoryList();
                }
            });
        }
    }

    loadDfltSiteAlter = (letterInfo) => {
        let _letterInfo = _.cloneDeep(letterInfo);
        if (this.props.service.svcCd === 'SPP') {
            if (this.attendanceCertNewRef.siteAlterOptsRef) {
                const dfltSiteAlter = this.attendanceCertNewRef.siteAlterOptsRef.getDfltSiteAlter();
                _letterInfo.codSppSiteAlterCd = dfltSiteAlter ? dfltSiteAlter.codSppSiteAlterCd || null : null;
            }
        };
        return _letterInfo;
    }

    handleHistoryListItemClick = (value, rowData) => {
        let { history, selCert } = this.state;
        history.selectedIndex = value;
        this.setState({ history });
        if (rowData) {
            selCert.certInfo = {
                attendanceTo: rowData.certTo || 'Whom it may concern',
                attendanceDate: moment(rowData.attenDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                attendanceSection: rowData.attenSessionCd,
                attendanceSectionFrom: rowData.attenStartTime ? CommonUtilities.getTimeMoment(rowData.attenStartTime) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                attendanceSectionTo: rowData.attenEndTime ? CommonUtilities.getTimeMoment(rowData.attenEndTime) : moment(),
                attendanceFor: rowData.attenForCd,
                attendanceForOthers: rowData.attenForOther,
                attendanceRemark: rowData.remark,
                attendanceIssueDate: rowData.issueDate,
                copyNo: rowData.noOfCopy
            };
            selCert.copyPage = rowData.noOfCopy;
            selCert.svcCd = rowData.svcCd;
            if (this.props.service.svcCd === 'SPP') {
                selCert.certInfo.codSppSiteAlterCd = rowData.codSppSiteAlterCd;
            };
            this.setState({
                ...selCert.certInfo,
                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                // copyNo: rowData.noOfCopy,
                certId: rowData.id,
                printType: rowData.printType,
                certVer: rowData.version,
                certCdtm: moment(rowData.createDtm).format(Enum.DATE_FORMAT_EYMD_VALUE),
                selCert,
                handlingCopyToNew: false
            });
        } else {
            let initState = this.initState();
            initState = this.loadDfltSiteAlter(initState);
            selCert.certInfo = initState;
            // initState.selCert = selCert;
            selCert = { certInfo: '', copyPage: 1, svcCd: this.props.service.svcCd };
            this.setState({ ...initState, selCert });

        }
    }

    handleCopyToNew = () => {
        this.props.auditAction(AlsDesc.CERT_COPY_TO_NEW, null, null, false, 'clinical-doc');
        let { history } = this.state;
        const {encounterInfo}=this.props;
        history.selectedIndex = '';
        this.setState({
            history,
            pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING
        });

        let initObj = this.initState();
        initObj.attendanceFor = this.state.attendanceFor;
        initObj.attendanceForOthers = this.state.attendanceForOthers;
        initObj.attendanceSectionFrom = this.state.attendanceSectionFrom;
        initObj.attendanceSectionTo = this.state.attendanceSectionTo;
        initObj.attendanceRemark = this.state.attendanceRemark;
        //initObj.attendanceIssueDate = this.state.attendanceIssueDate;
        initObj.attendanceIssueDate=moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        if(encounterInfo&&encounterInfo.encounterDate){
            initObj.attendanceDate=moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        }
        initObj = this.loadDfltSiteAlter(initObj);

        initObj.handlingCopyToNew = true;

        this.setState(initObj);
    }

    handleReprint = () => {
        if (this.props.handlingPrint) {
            return;
        }
        if (this.attendanceCertNewRef.refs && this.attendanceCertNewRef.refs.attendanceCertNewForm) {
            const asyncValid = this.attendanceCertNewRef.refs.attendanceCertNewForm.isFormValid(false);
            asyncValid.then(result => {
                if (result) {
                    const {
                        attendanceDate,
                        attendanceSection,
                        attendanceSectionFrom,
                        attendanceSectionTo,
                        attendanceFor,
                        attendanceForOthers,
                        attendanceRemark,
                        attendanceTo,
                        attendanceIssueDate,
                        copyNo
                    } = this.state;

                    const {
                        patientInfo,
                        caseNoInfo,
                        encounterInfo,
                        service,
                        clinic

                    } = this.props;

                    let attnCertDto = {
                        attenDate: moment(attendanceDate, Enum.DATE_FORMAT_EYMD_VALUE).format(),
                        attenEndTime: attendanceSection === 'R' ? moment(attendanceSectionTo).format('HH:mm') : '',
                        attenForCd: attendanceFor,
                        attenForOther: attendanceForOthers,
                        attenSessionCd: attendanceSection,
                        attenStartTime: attendanceSection === 'R' ? moment(attendanceSectionFrom).format('HH:mm') : '',
                        caseNo: caseNoInfo && caseNoInfo.caseNo,
                        certTo: attendanceTo,
                        // clinicCd: clinic && clinic.clinicCd,
                        siteId: clinic && clinic.siteId,
                        encntrId: encounterInfo && encounterInfo.encounterId,
                        noOfCopy: copyNo,
                        patientKey: patientInfo && patientInfo.patientKey,
                        remark: attendanceRemark,
                        issueDate: attendanceIssueDate,
                        // serviceCd: service && service.serviceCd,
                        svcCd: service && service.serviceCd
                    };

                    let params = {
                        opType: 'RP',
                        attDate: attendanceDate,
                        attTime: attendanceSection === 'R' ?
                            `${attendanceSectionFrom.format('HH:mm')}-${attendanceSectionTo.format('HH:mm')}` : '',
                        attendanceFor: attendanceFor === 'O' ? attendanceForOthers : CertUtil.getAttendanceCertForLabel(attendanceFor),
                        patientKey: patientInfo && patientInfo.patientKey,
                        period: attendanceSection === 'R' ? '' : CertUtil.getAttendanceCertSessionLabel(attendanceSection),
                        remark: attendanceRemark,
                        toValue: attendanceTo,
                        siteId: clinic && clinic.siteId,
                        issueDate: attendanceIssueDate,
                        attendanceCertificateDto: attnCertDto
                    };
                    this.handlePrint(params);
                } else {
                    this.attendanceCertNewRef.refs.attendanceCertNewForm.focusFail();
                }
            });
        }
    }

    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        let { serviceArr } = this.state;
        let { attendanceCertList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(attendanceCertList || [], serviceArr, sortFunc);
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'clinical-doc');
        if (selectedIndex && sharedList) {
            this.props.openCommonMessage({
                msgCode: '110601',
                btnActions: {
                    btn1Click: () => {
                        const attn = sharedList[parseInt(selectedIndex)];
                        const callBack = () => {
                            this.updateAttendanceHistoryList((rows) => {
                                this.svcOptsFiltering(rows);
                            }, true);
                            let { history, selCert } = this.state;
                            history.selectedIndex = '';
                            this.setState({ history });
                            let initState = this.initState();
                            initState = this.loadDfltSiteAlter(initState);
                            selCert.certInfo = initState;
                            this.setState(initState);
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteAttndCert({
                            id: attn.id
                            // statusCd: 'D'
                        }, callBack);
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel Delete', null, null, false, 'clinical-doc');
                    }
                }
            });
        }
    }

    handleClose = () => {
        const { pageStatus, history, hasEditRight, serviceArr } = this.state;
        const isDirty = this.checkCertIsDirty(hasEditRight);
        let { attendanceCertList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(attendanceCertList || [], serviceArr, sortFunc);
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'clinical-doc');
            if (isDirty) {
                this.props.openCommonMessage({
                    msgCode: '110054',
                    btnActions: {
                        btn1Click: () => {
                            this.props.auditAction('Discard Changes', null, null, false, 'clinical-doc');
                            this.handleHistoryListItemClick(history.selectedIndex, sharedList[history.selectedIndex]);
                            this.setState({
                                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                            });
                        },
                        btn2Click: () => {
                            this.props.auditAction('Keep Editing', null, null, false, 'clinical-doc');
                        }
                    }
                });
            } else {
                this.setState({
                    pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                });
            }
        } else if (pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED) {
            this.props.auditAction('Cancel Certificate Selection', null, null, false, 'clinical-doc');
            let { history, selCert } = this.state;
            history.selectedIndex = '';
            this.setState({ history });
            let initState = this.initState();
            initState = this.loadDfltSiteAlter(initState);
            selCert.certInfo = initState;
            this.setState(initState);
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.attendanceCert);
        }
    }

    handleEditCert = () => {
        // let { history } = this.state;
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'clinical-doc');
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }


    checkCertIsDirty = (hasEditRight) => {
        const { selCert } = this.state;
        let initState = this.initState();
        delete initState.certCdtm;
        delete initState.certId;
        delete initState.printType;
        delete initState.pageStatus;
        let cmpInfo = _.cloneDeep(initState);
        let letterInfo = _.cloneDeep(initState);
        for (let p in cmpInfo) {
            letterInfo[p] = this.state[p];
        }
        if (this.props.service.svcCd === 'SPP') {
            letterInfo.codSppSiteAlterCd = this.state.codSppSiteAlterCd;
        }
        if (selCert && selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        } else {
            cmpInfo = this.loadDfltSiteAlter(cmpInfo);
        }
        delete cmpInfo.certCdtm;
        delete cmpInfo.certId;
        delete cmpInfo.printType;
        delete cmpInfo.pageStatus;
        delete cmpInfo.handlingCopyToNew;
        delete letterInfo.certCdtm;
        delete letterInfo.certId;
        delete letterInfo.printType;
        delete letterInfo.pageStatus;
        delete letterInfo.handlingCopyToNew;
        cmpInfo = {
            ...cmpInfo,
            attendanceDate: cmpInfo.attendanceDate && moment(cmpInfo.attendanceDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceIssueDate: cmpInfo.attendanceIssueDate && moment(cmpInfo.attendanceIssueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceSectionFrom: cmpInfo.attendanceSectionFrom && moment(cmpInfo.attendanceSectionFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceSectionTo: cmpInfo.attendanceSectionTo && moment(cmpInfo.attendanceSectionTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        letterInfo = {
            ...letterInfo,
            attendanceDate: letterInfo.attendanceDate && moment(letterInfo.attendanceDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceIssueDate: letterInfo.attendanceIssueDate && moment(letterInfo.attendanceIssueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceSectionFrom: letterInfo.attendanceSectionFrom && moment(letterInfo.attendanceSectionFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            attendanceSectionTo: letterInfo.attendanceSectionTo && moment(letterInfo.attendanceSectionTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };

        return hasEditRight ? !CommonUtilities.isEqualObj(cmpInfo, letterInfo) : false;
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditAttendanceCert);
        let certIsDirty = this.checkCertIsDirty(hasEditRight);
        if (this.state.handlingCopyToNew) {
            this.props.openCommonMessage({
                msgCode: '110072',
                btnActions: {
                    btn1Click: () => {
                        this.props.auditAction('Confirm select history');
                        this.handleHistoryListItemClick(value, rowData);
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel select history');
                    }
                }
            });
        } else {
            if (certIsDirty) {
                this.props.openCommonMessage({
                    msgCode: '110072',
                    btnActions: {
                        btn1Click: () => {
                            this.props.auditAction('Confirm select history');
                            this.handleHistoryListItemClick(value, rowData);
                        },
                        btn2Click: () => {
                            this.props.auditAction('Cancel select history');
                        }
                    }
                });
            } else {
                this.handleHistoryListItemClick(value, rowData);
            }
        }
    }

    render() {
        const { classes, attendanceCertList, clinicList,siteParams,service,clinic } = this.props;
        //this.matchCurrentSection();
        const {
            attendanceTo,
            attendanceDate,
            attendanceSection,
            attendanceSectionFrom,
            attendanceSectionTo,
            attendanceFor,
            attendanceForOthers,
            attendanceRemark,
            attendanceIssueDate,
            copyNo,
            allowCopyList,
            history,
            pageStatus,
            certId,
            printType,
            // certCdtm,
            certVer,
            serviceArr,
            hasEditRight,
            previewDialogOpen,
            previewData,
            codSppSiteAlterCd,
            selCert
        } = this.state;
        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;
        const sharedList = CertUtil.getShareSvcCertList(attendanceCertList || [], serviceArr, sortFunc);
        const isOtherServiceAndSite = (history.selectedIndex !== '' && sharedList[history.selectedIndex] && (sharedList[history.selectedIndex].svcCd !== this.props.service.serviceCd))
            || (history.selectedIndex !== '' && sharedList[history.selectedIndex] && (sharedList[history.selectedIndex].siteId !== this.props.clinic.siteId));
            return (
            <Grid
                container
                alignItems="flex-start"
                className={classes.container}
                wrap="nowrap"
                spacing={4}
            >
                <Grid item xs>
                    <HistoryList
                        {...history}
                        id="attendanceCert"
                        ref="historyListRef"
                        // data={attendanceCertList}
                        data={sharedList}
                        // serviceList={serviceList}
                        serviceList={serviceArr}
                        onChange={this.handleHistoryChange}
                        onBlur={this.handleHistoryBlur}
                        onListItemClick={this.onListItemClickListener}
                        renderChild={(item, index) => {

                            const site = clinicList.find(siteItem => siteItem.siteId === item.siteId);
                            const serviceClinc = site ? `${item.svcCd} - ${site.siteCd || ''}` : `${item.svcCd}`;
                            return (
                                <Grid container key={index}>
                                    <Grid item container justify="space-between">
                                        <Typography variant="body1">{serviceClinc}</Typography>
                                        <Typography variant="body1">{item.createDtm && moment(item.createDtm).format(Enum.DATE_FORMAT_24_HOUR)}</Typography>
                                    </Grid>
                                    <Grid item container justify="space-between">
                                        {/* <Typography variant="body1">{CaseNoUtil.getFormatCaseNo(item.caseNo)}</Typography> */}

                                        <Typography variant="body1">{CaseNoUtil.getCaseAlias(item)}</Typography>
                                        <Typography variant="body1">{item.createBy}</Typography>
                                    </Grid>
                                    <Grid item container justify="space-between" style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>
                                        {
                                            (item.encntrTypeDesc) && (item.rmDesc) ?
                                                <CIMSLightToolTip
                                                    title={`${item.encntrTypeDesc} / ${item.rmDesc}`}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        // style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}
                                                        className={classes.enctRoom}
                                                    >
                                                        {`${item.encntrTypeDesc} / ${item.rmDesc}`}
                                                    </Typography>
                                                </CIMSLightToolTip>
                                                : null
                                        }

                                    </Grid>
                                </Grid>
                            );
                        }}
                        disabled={pageStatus === CertEnum.PAGESTATUS.CERT_EDITING}
                    />
                </Grid>
                <Grid item container>
                    <AttendanceCertNew
                        innerRef={ref => this.attendanceCertNewRef = ref}
                        attendanceTo={attendanceTo}
                        attendanceDate={attendanceDate}
                        attendanceSection={attendanceSection}
                        attendanceSectionFrom={attendanceSectionFrom}
                        attendanceSectionTo={attendanceSectionTo}
                        attendanceFor={attendanceFor}
                        attendanceForOthers={attendanceForOthers}
                        attendanceRemark={attendanceRemark}
                        attendanceIssueDate={attendanceIssueDate}
                        isOtherServiceAndSite={isOtherServiceAndSite}
                        copyNo={copyNo}
                        certId={certId}
                        printType={printType}
                        allowCopyList={allowCopyList}
                        certVer={certVer}
                        handleOnChange={(value, name) => this.handleOnChange(value, name)}
                        handlePrint={this.handlePrint}
                        handleSaveAndPreview={this.handleSaveAndPreview}
                        isSelected={isSelected}
                        handleClose={this.handleClose}
                        pageStatus={pageStatus}
                        codSppSiteAlterCd={codSppSiteAlterCd}
                        selCert={selCert}
                    />
                </Grid>
                {
                    isSelected ?
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'attendanceCert_btnEdit',
                                        name: 'Edit',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        // style: { display: (hasEditRight || CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? true : isPastCert) ? 'none' : '' },
                                        disabled: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING,
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'attendanceCert_btnCopyToNew',
                                        name: 'Copy to New',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        disabled: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING,
                                        onClick: this.handleCopyToNew
                                    },
                                    {
                                        id: 'attendanceCert_btnReprint',
                                        name: 'Reprint',
                                        disabled: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING,
                                        style: { display: (isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleReprint
                                    },
                                    {
                                        id: 'attendanceCert_btnDelete',
                                        name: 'Delete',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        disabled: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING,
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'attendanceCert_btnClose',
                                        name: 'Cancel',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        /> : null
                }
                < CIMSPromptDialog
                    open={previewDialogOpen}
                    dialogTitle={'Preview'}
                    classes={{
                        paper: classes.dialogPaper
                    }
                    }
                    dialogContentText={
                        <CIMSPdfViewer
                            id={'attendanceCert_pdfViewer'}
                            position={'vertical'}
                            previewData={previewData}
                        />
                    }
                    buttonConfig={
                        [
                            {
                                id: 'attendanceCert_print',
                                name: 'Print',
                                onClick: () => {
                                    if (this.handlingPreviewAndPrint) {
                                        return;
                                    }
                                    // const isUseDH65Printer = getUseDH65PrinterValue(siteParams, service.svcCd, clinic.siteId);
                                    // let isFitPage = false;
                                    // isFitPage = isUseDH65Printer;
                                    let isFitPage = false;
                                    let printQue = '';
                                    const dh65PrinterVal = getUseDH65PrinterValue(siteParams, service.svcCd, clinic.siteId);
                                    if (dh65PrinterVal) {
                                        isFitPage = true;
                                        printQue = dh65PrinterVal;
                                    }
                                    this.handlingPreviewAndPrint = true;
                                    this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
                                    print({
                                        base64: previewData,
                                        copies: copyNo,
                                        isFitPage: isFitPage,
                                        printQueue: printQue,
                                        callback: () => {
                                            this.handlingPreviewAndPrint = false;
                                            this.setState({ previewDialogOpen: false });
                                        }
                                    });
                                }
                            },
                            {
                                id: 'attendanceCert_close',
                                name: 'Close',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
                                    this.setState({ previewDialogOpen: false });
                                }
                            }
                        ]
                    }
                />
            </Grid>
        );
    }
}

const stateToProps = (state) => {
    return {
        //allowCopyList: state.yellowFever.allowCopyList,
        //copyPage: state.yellowFever.copyPage
        handingPrint: state.attendanceCert.handlingPrint,
        serviceList: state.common.serviceList,
        patientInfo: state.patient.patientInfo,
        service: state.login.service,
        attendanceCertList: state.attendanceCert.attendanceCertList,
        appointmentInfo: state.patient.appointmentInfo,
        clinic: state.login.clinic,
        encounterInfo: state.patient.encounterInfo,
        attendance: state.patient.attendance,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        caseNoInfo: state.patient.caseNoInfo,
        siteParams: state.common.siteParams,
        clinicConfig: state.common.clinicConfig
    };
};

const dispatchToProps = {
    getAttendanceCert,
    updateField,
    listAttendanceCertificates,
    openCommonMessage,
    updateAttendanceCertificate,
    deleteAttndCert,
    updateCurTab,
    resetAll,
    auditAction
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(AttendanceCert));