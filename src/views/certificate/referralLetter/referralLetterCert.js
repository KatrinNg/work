import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import _ from 'lodash';

import {
    resetAll,
    updateField,
    getReferralLetter,
    listReferralLetters,
    updateReferralLetter,
    deleteRefferalLetter,
    getProblemText,
    getClinicalNoteText,
    getDoseInstruction,
    getSaamPatientSummary
} from '../../../store/actions/certificate/referralLetter/referralLetterAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import {
    updateCurTab
} from '../../../store/actions/mainFrame/mainFrameAction';
import {
    getGroupList,
    getHospital,
    getSpecialty
} from '../../../store/actions/common/commonAction';
import { INITAL_STATE } from '../../../store/reducers/certificate/referralLetter/referralLetterReducer';

import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import * as CommonUtil from '../../../utilities/commonUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import Enum from '../../../enums/enum';
import accessRightEnum from '../../../enums/accessRightEnum';

import NewReferralLetter from './newReferralLetter';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import HistoryList from '../component/historyList';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../../components/PDF/CIMSPdfViewer';
import { print } from '../../../utilities/printUtilities';

const styles = theme => ({
    container: {
        height: '100%',
        maxHeight: '800px',
        overflow: 'hidden',
        padding: theme.spacing(1) / 2
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
class ReferralLetterCert extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        isEdit: false,
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
        certId: '',
        printType: '',
        certCdtm: '',
        certVer: '',
        selCert: { certInfo: '', copyPage: 1 },
        filterSvc: [],
        serviceArr: [],
        hasEditRight: true,
        previewDialogOpen: false,
        previewData: null
    }

    componentDidMount() {
        // this.props.ensureDidMount();
        // this.props.getGroupList();
        // this.props.getHospital();
        // this.props.getSpecialty();
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
            if (!CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate)) {
                this.getDataFromOtherModule();
            }
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditReferralLetter);
        this.doClose = CommonUtil.getDoCloseFunc_1(accessRightEnum.referralLetter, () => this.checkCertIsDirty(hasEditRight), this.handleSaveprint);
        this.setState({ hasEditRight });
        this.props.updateCurTab(accessRightEnum.referralLetter, this.doClose);
        this.backUpData = INITAL_STATE.newLetterInfo;
    }

    componentDidUpdate(preProps) {
        if (this.props.pullInitData === 4) {
            this.backUpData = _.cloneDeep(this.props.newLetterInfo);
            this.props.updateField({ pullInitData: 0 });
        }
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    handlingPreviewAndPrint = false

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_RFR_LETTER);
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
        this.setState({ serviceArr, history: history }, () => {
            if (CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate) && rows && rows[0]) {
                if (this.state.serviceArr.length > 0) {
                    this.handleHistoryListItemClick('0', rows && rows[0]);
                }
            }
        });
        this.props.updateField({ referralLetterList: rows });
    };

    updateHistoryList = (callback, isDel) => {
        const { patientInfo } = this.props;
        let { dateFrom, dateTo, serviceCd, siteId } = this.state.history;
        const isHistoryValid = this.refs.historyListRef.isFormValid();
        isHistoryValid.then(result => {
            if (result) {
                if (isDel) {
                    serviceCd = '';
                    siteId = '';
                }
                this.props.listReferralLetters({
                    patientKey: patientInfo && patientInfo.patientKey,
                    svcCd: serviceCd === '*All' ? '' : serviceCd,
                    from: dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    to: dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    siteId: siteId === '*All' ? '' : siteId
                }, (data) => {
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

    handleOnChange = (changes) => {
        this.props.updateField(changes);
        this.setState({ isEdit: true });
    }

    getDataFromOtherModule = () => {
        const { selCert } = this.state;
        this.backUpData = _.cloneDeep(INITAL_STATE.newLetterInfo);
        this.props.getProblemText((data) => {
            this.backUpData.problem = data.problem;
            selCert.certInfo = this.backUpData;
            this.setState({
                selCert
            });
        });
        this.props.getClinicalNoteText((data) => {
            this.backUpData.result = data.result;
            selCert.certInfo = this.backUpData;
            this.setState({
                selCert
            });
        });
        this.props.getSaamPatientSummary((data) => {
            this.backUpData.familyHistory = data.familyHistory;
            selCert.certInfo = this.backUpData;
            this.setState({
                selCert
            });
        });
        this.props.getDoseInstruction((data) => {
            this.backUpData.medications = data.medications;
            selCert.certInfo = this.backUpData;
            this.setState({
                selCert
            });
        });
    }

    getCertDto = () => {
        const {
            newLetterInfo,
            copyPage,
            patientInfo,
            caseNoInfo,
            encounterInfo,
            service,
            siteId
        } = this.props;

        let certDto = {
            svcCd: service && service.serviceCd,
            siteId: siteId,
            patientKey: patientInfo && patientInfo.patientKey,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            encntrId: encounterInfo && encounterInfo.encounterId,
            groupCd: newLetterInfo.referTo.groupCd,
            rfrHcinstId: newLetterInfo.referTo.rfrHcinstId,
            specialityCd: newLetterInfo.referTo.specialty,
            certTo: newLetterInfo.to,
            letterSvcCd: newLetterInfo.referTo.letterSvcCd,
            others: newLetterInfo.referTo.others,
            details: newLetterInfo.referTo.details,
            priority: newLetterInfo.appointmentType,
            allergies: newLetterInfo.familyHistory,
            problem: newLetterInfo.problem,
            result: newLetterInfo.result,
            // serviceCd: service && service.serviceCd,
            // clinicCd: clinic && clinic.clinicCd,
            // encounterId: encounterInfo && encounterInfo.encounterId,
            noOfCopy: copyPage,
            medications: newLetterInfo.medications
        };

        return certDto;
    }


    handlePrint = (opType) => {
        const {
            newLetterInfo,
            handlingPrint,
            copyPage,
            patientInfo,
            serviceList,
            hospital
        } = this.props;

        const { pageStatus, certId, certVer, history } = this.state;

        if (handlingPrint) {
            return;
        }

        let referToClinic = newLetterInfo.referTo.hosptialClinicName;


        const { referTo } = newLetterInfo;
        if (referTo.groupCd === 'HA' || referTo.groupCd === 'Private' || (referTo.groupCd === 'Others' && referToClinic === 'Occupational Health Clinic')) {
            let specialty = this.props.specialty.find(item => item.specialtyCd === newLetterInfo.referTo.specialty);
            referToClinic = referToClinic + `, ${specialty.specialtyName}`;
        }
        if (referTo.groupCd === 'DH') {
            const selService = serviceList.find(item => item.serviceCd === referTo.letterSvcCd);
            const selHospital = hospital.find(item => item.hcinstId === referToClinic);
            referToClinic = (selService && selService.serviceName || referTo.letterSvcCd) + `, ${selHospital && selHospital.name || referToClinic}`;
        }
        if (referTo.groupCd === 'Others' && referToClinic === 'Others') {
            referToClinic = referTo.others;
        }

        let appointmentType = newLetterInfo.appointmentType;
        switch (appointmentType) {
            case 'U': appointmentType = 'Urgent Appointment'; break;
            case 'E': appointmentType = 'Early Appointment'; break;
        }

        let params = {
            opType: opType,
            familyHistory: newLetterInfo.familyHistory,
            appointmentType: appointmentType,
            problem: newLetterInfo.problem,
            commenced: newLetterInfo.medications,
            results: newLetterInfo.result,
            serviceClinic: referToClinic,
            date: moment().format(Enum.DATE_FORMAT_EYMD_VALUE).toString(),
            to: newLetterInfo.to,
            patientKey: patientInfo && patientInfo.patientKey
        };

        if (opType === 'SP') {
            let certDto = this.getCertDto();
            if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
                certDto = {
                    ...certDto,
                    id: certId,
                    version: certVer
                    // printType
                };
            }
            params.referralLetterDto = certDto;
        }

        if (opType === 'RP') {
            let certDto = this.getCertDto();
            certDto = {
                ...certDto,
                id: certId,
                version: certVer
                // printType
            };
            params.referralLetterDto = certDto;
        }

        this.props.updateField({ handlingPrint: true });
        this.props.getReferralLetter(
            params,
            (printSuccess) => {
                this.props.updateField({ handlingPrint: false });
                if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') || opType === 'RP') {
                    this.setState({
                        isEdit: false,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                    }, () => {
                        this.updateHistoryList((rows) => {
                            this.setState({ pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED });
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);
                        }, true);
                    });
                } else {

                    if (opType === 'SP') {
                        let { history } = this.state;
                        history.selectedIndex = '0';
                        // history.serviceCd = service && service.serviceCd;
                        this.setState({
                            isEdit: false,
                            history,
                            pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                        }, () => {
                            this.updateHistoryList((rows) => {
                                this.svcOptsFiltering(rows, true);
                                this.handleHistoryListItemClick('0', rows && rows[0]);
                            }, true);
                        });
                    }
                }
                if (printSuccess) {
                    console.log('Print Success');
                }
            }, copyPage);
    }

    handleHistoryChange = (value, name) => {
        let { history, serviceArr } = this.state;
        if (name === 'selectedSite') {
            history.siteId = value;
        } else {
            history[name] = value;
        }
        if (name === 'serviceCd') {
            history.selectedIndex = '';
            if (value === '*All') {
                // const serviceArr = CertUtil.getAccessedServices(filterSvc,this.props.service.serviceCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_RFR_LETTER);
                history.clinicList = this.props.clinicList.filter((item) => {
                    const obj = serviceArr.find(i => i.svcCd === item.svcCd);
                    return obj !== undefined;
                });
            } else {
                history.clinicList = CommonUtilities.getClinicListByServiceCode(this.props.clinicList, value);
            }
            history.siteId = '*All';
        }
        this.setState({ history }, () => {
            if (name !== 'dateFrom' && name !== 'dateTo' && name !== 'open') {
                this.updateHistoryList((rows) => {
                    if (serviceArr.length > 0) {
                        if (history.serviceCd === '*All' && history.siteId === '*All'){
                            const { referralLetterList } = this.props;
                            rows = CertUtil.getShareSvcCertList(referralLetterList || [], serviceArr, sortFunc);
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
                    this.updateHistoryList();
                }
            });
        }
    }

    handleHistoryListItemClick = (value, rowData) => {
        let { history, selCert } = this.state;
        const { hospital } = this.props;
        history.selectedIndex = value;
        this.setState({ history });
        let newLetterInfo = _.cloneDeep(this.props.newLetterInfo);
        let noOfCopy = 1;
        let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
        let certId = '';
        let printType = '';
        let certCdtm = '';
        let certVer = '';
        if (rowData) {
            const curHospital = hospital && hospital.find(item => item.hcinstId === rowData.rfrHcinstId);

            newLetterInfo.to = rowData.certTo;
            newLetterInfo.problem = rowData.problem;
            newLetterInfo.result = rowData.result;
            newLetterInfo.appointmentType = rowData.priority;
            newLetterInfo.medications = rowData.medications;
            newLetterInfo.referTo.groupCd = rowData.groupCd;
            newLetterInfo.referTo.rfrHcinstId = rowData.rfrHcinstId;
            newLetterInfo.referTo.specialty = (rowData.specialityCd || '').toString();
            newLetterInfo.referTo.letterSvcCd = rowData.letterSvcCd || null;
            newLetterInfo.referTo.details = rowData.details || '';
            newLetterInfo.referTo.others = rowData.others || '';
            newLetterInfo.referTo.specialtyName=rowData.specialtyName||'';
            newLetterInfo.referTo.hosptialClinicName = curHospital ? curHospital.name : rowData.hcinstName||'';
            newLetterInfo.familyHistory = rowData.allergies || '';
            noOfCopy = rowData.noOfCopy || 1;
            selCert.copyPage = noOfCopy;
            certId = rowData.id;
            printType = rowData.printType;
            certCdtm = moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            certVer = rowData.version;
            selCert.certInfo = newLetterInfo;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                certVer,
                selCert
            });
            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
            this.backUpData = _.cloneDeep(newLetterInfo);
        } else {
            newLetterInfo = _.cloneDeep(INITAL_STATE.newLetterInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            selCert.certInfo = newLetterInfo;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                certVer,
                selCert
            });
            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
            this.getDataFromOtherModule();
        }
    }

    handleSaveprint = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const { pageStatus } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.referralLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                }
            });
        } else {
            const formValid = this.refs.referralLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                } else {
                    this.refs.referralLetterForm.focusFail();
                }
            });
        }
    }

    handleSaveAndPreview = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const { pageStatus } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.referralLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePreview('SP');
                }
            });
        } else {
            const formValid = this.refs.referralLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePreview('SP');
                } else {
                    this.refs.referralLetterForm.focusFail();
                }
            });
        }
    }

    handlePreview = (opType) => {
        const {
            newLetterInfo,
            copyPage,
            patientInfo,
            serviceList,
            hospital
        } = this.props;

        const { pageStatus, certId, certVer, history } = this.state;

        let referToClinic = newLetterInfo.referTo.hosptialClinicName;


        const { referTo } = newLetterInfo;
        if (referTo.groupCd === 'HA' || referTo.groupCd === 'Private' || (referTo.groupCd === 'Others' && referToClinic === 'Occupational Health Clinic')) {
            let specialty = this.props.specialty.find(item => item.specialtyCd === newLetterInfo.referTo.specialty);
            referToClinic = referToClinic + `, ${specialty.specialtyName}`;
        }
        if (referTo.groupCd === 'DH') {
            const selService = serviceList.find(item => item.serviceCd === referTo.letterSvcCd);
            const selHospital = hospital.find(item => item.hcinstId === referToClinic);
            referToClinic = (selService && selService.serviceName || referTo.letterSvcCd) + `, ${selHospital && selHospital.name || referToClinic}`;
        }
        if (referTo.groupCd === 'Others' && referToClinic === 'Others') {
            referToClinic = referTo.others;
        }

        let appointmentType = newLetterInfo.appointmentType;
        switch (appointmentType) {
            case 'U': appointmentType = 'Urgent Appointment'; break;
            case 'E': appointmentType = 'Early Appointment'; break;
        }

        let params = {
            opType: opType,
            familyHistory: newLetterInfo.familyHistory,
            appointmentType: appointmentType,
            problem: newLetterInfo.problem,
            commenced: newLetterInfo.medications,
            results: newLetterInfo.result,
            serviceClinic: referToClinic,
            date: moment().format(Enum.DATE_FORMAT_EYMD_VALUE).toString(),
            to: newLetterInfo.to,
            patientKey: patientInfo && patientInfo.patientKey
        };

        let certDto = this.getCertDto();
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            certDto = {
                ...certDto,
                id: certId,
                version: certVer
                // printType
            };
        }
        params.referralLetterDto = certDto;

        this.props.getReferralLetter(
            params,
            (base64) => {
                if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') {
                    this.setState({
                        isEdit: false,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                        previewDialogOpen: true,
                        previewData: base64
                    }, () => {
                        this.updateHistoryList((rows) => {
                            this.setState({ pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED });
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);
                        }, true);
                    });
                } else {
                    let { history } = this.state;
                    history.selectedIndex = '0';
                    // history.serviceCd = service && service.serviceCd;
                    this.setState({
                        isEdit: false,
                        history,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                        previewDialogOpen: true,
                        previewData: base64
                    }, () => {
                        this.updateHistoryList((rows) => {
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick('0', rows && rows[0]);
                        }, true);
                    });
                }
            }, copyPage, true);
    }

    handleReprint = () => {
        const formValid = this.refs.referralLetterForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.handlePrint('RP');
            } else {
                this.refs.referralLetterForm.focusFail();
            }
        });
    }

    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        let { serviceArr } = this.state;
        const { referralLetterList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(referralLetterList || [], serviceArr, sortFunc);
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'clinical-doc');
        if (selectedIndex && sharedList) {
            this.props.openCommonMessage({
                msgCode: '110601',
                btnActions: {
                    btn1Click: () => {
                        const cert = sharedList[parseInt(selectedIndex)];
                        const callback = () => {
                            this.updateHistoryList((rows) => {
                                this.svcOptsFiltering(rows);
                            }, true);
                            const { history, selCert } = this.state;
                            history.selectedIndex = '';
                            this.setState({ history });
                            let newLetterInfo = _.cloneDeep(this.props.newLetterInfo);
                            let noOfCopy = 1;
                            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
                            let certId = '';
                            let printType = '';
                            let certCdtm = '';
                            let certVer = '';
                            newLetterInfo = _.cloneDeep(INITAL_STATE.newLetterInfo);
                            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
                            selCert.certInfo = newLetterInfo;
                            this.setState({
                                pageStatus,
                                certId,
                                printType,
                                certCdtm,
                                certVer,
                                selCert
                            });
                            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
                            this.getDataFromOtherModule();
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteRefferalLetter({
                            id: cert.id,
                            statusCd: 'D'
                        }, callback);
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel Delete', null, null, false, 'clinical-doc');
                    }
                }
            });
        }
    }

    handleClose = () => {
        const { pageStatus, history, hasEditRight, selCert, serviceArr } = this.state;
        const { referralLetterList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(referralLetterList || [], serviceArr, sortFunc);
        const isDirty = this.checkCertIsDirty(hasEditRight);
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
            history.selectedIndex = '';
            this.setState({ history });
            let newLetterInfo = _.cloneDeep(this.props.newLetterInfo);
            let noOfCopy = 1;
            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
            let certId = '';
            let printType = '';
            let certCdtm = '';
            let certVer = '';
            newLetterInfo = _.cloneDeep(INITAL_STATE.newLetterInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            selCert.certInfo = newLetterInfo;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                certVer,
                selCert
            });
            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
            this.getDataFromOtherModule();
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtil.runDoClose(this.doClose, accessRightEnum.referralLetter);
        }
    }

    handleEditCert = () => {
        const { hospital, newLetterInfo ,specialtyList} = this.props;
        const { rfrHcinstId, specialtyCd} = newLetterInfo.referTo;
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'clinical-doc');
        let hp = hospital && hospital.find(h => h.hcinstId === rfrHcinstId);
        if (!hp) {
            let _letterInfo = _.cloneDeep(newLetterInfo);
            _letterInfo.referTo.rfrHcinstId = null;
            this.props.updateField({ newLetterInfo: _letterInfo });
        }
        let speciality=specialtyList&&specialtyList.find(s=>s.specialtyCd===specialtyCd);
        if (!speciality) {
            let _letterInfo = _.cloneDeep(newLetterInfo);
            _letterInfo.referTo.specialityCd = null;
            this.props.updateField({ newLetterInfo: _letterInfo });
        }
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }

    checkCertIsDirty = (hasEditRight) => {
        const { selCert } = this.state;
        let cmpInfo = _.cloneDeep(this.backUpData);
        let sourceInfo = _.cloneDeep(this.props.newLetterInfo);
        let copyPage1 = INITAL_STATE.copyPage;
        let copyPage2 = this.props.copyPage;
        if (selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        }
        if (this.state.certId) {
            const letterDto = this.props.referralLetterList.find(x => x.id == this.state.certId);
            copyPage1 = (letterDto && letterDto.noOfCopy) || 1;
        }
        return hasEditRight ? !CommonUtil.isEqualObj(cmpInfo, sourceInfo) || parseInt(copyPage1) !== parseInt(copyPage2) : false;
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditReferralLetter);
        let certIsDirty = this.checkCertIsDirty(hasEditRight);
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


    render() {
        const { classes, referralLetterList, serviceList, clinicList, copyPage } = this.props;
        const {
            history,
            pageStatus,
            serviceArr,
            hasEditRight,
            previewDialogOpen,
            previewData
        } = this.state;
        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;

        const sharedList = CertUtil.getShareSvcCertList(referralLetterList || [], serviceArr, sortFunc);
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
                        id="referralLetterCert"
                        ref="historyListRef"
                        // data={referralLetterList}
                        data={sharedList}
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
                                        {/* <Typography variant="body1">{service && service.serviceName}</Typography> */}
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
                    <ValidatorForm
                        id="referralLetterCert_form"
                        ref={'referralLetterForm'}
                    >
                        <NewReferralLetter
                            id={'referralLetterCertNewReferralLetter'}
                            allowCopyList={this.props.allowCopyList}
                            handleOnChange={this.handleOnChange}
                            copyPage={this.props.copyPage}
                            handlePrint={this.handlePrint}
                            isSelected={isSelected}
                            serviceList={serviceList}
                            clinicList={clinicList}
                        />
                    </ValidatorForm>
                </Grid>
                {
                    isSelected ?
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'referralLetterCert_btnEdit',
                                        name: 'Edit',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? true : isPastCert) ? 'none' : '' },
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'referralLetterCert_btnReprint',
                                        name: 'Reprint',
                                        style: { display: (isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: () => {
                                            this.props.auditAction(AlsDesc.CERT_RE_PRINT);
                                            this.handleReprint();
                                        }
                                    },
                                    {
                                        id: 'referralLetterCert_btnDelete',
                                        name: 'Delete',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'referralLetterCert_btnClose',
                                        name: 'Cancel',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        />
                        :
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'referralLetterCert_btnSaveAndPreview',
                                        name: 'Save & Preview',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => { this.handleSaveAndPreview(); }
                                    },
                                    {
                                        id: 'referralLetterCert_btnSaveAndPrint',
                                        name: 'Save & Print',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => { this.handleSaveprint(); }
                                    },
                                    {
                                        id: 'referralLetterCert_btnCancel',
                                        name: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING ? 'Cancel' : 'Close',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        />
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
                            id={'referralLetterCert_pdfViewer'}
                            position={'vertical'}
                            previewData={previewData}
                        />
                    }
                    buttonConfig={
                        [
                            {
                                id: 'referralLetterCert_print',
                                name: 'Print',
                                onClick: () => {
                                    if (this.handlingPreviewAndPrint) {
                                        return;
                                    }
                                    this.handlingPreviewAndPrint = true;
                                    this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
                                    print({
                                        base64: previewData,
                                        copies: copyPage,
                                        callback: () => {
                                            this.handlingPreviewAndPrint = false;
                                            this.setState({ previewDialogOpen: false });
                                        }
                                    });
                                }
                            },
                            {
                                id: 'referralLetterCert_close',
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
        newLetterInfo: state.referralLetter.newLetterInfo,
        patientInfo: state.patient.patientInfo,
        allowCopyList: state.referralLetter.allowCopyList,
        copyPage: state.referralLetter.copyPage,
        referralLetterList: state.referralLetter.referralLetterList,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        handlingPrint: state.sickLeave.handlingPrint,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        siteId: state.login.clinic.siteId,
        specialty: state.common.specialty,
        hospital: state.common.hospital,
        patientSummary: state.saamPatient.patientSummary,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        subTabs: state.mainFrame.subTabs,
        pullInitData: state.referralLetter.pullInitData,
        specialtyList: state.referralLetter.specialtyList
    };
};

const dispatchToProps = {
    resetAll,
    updateField,
    getReferralLetter,
    listReferralLetters,
    updateReferralLetter,
    updateCurTab,
    openCommonMessage,
    getGroupList,
    getHospital,
    getSpecialty,
    deleteRefferalLetter,
    getSaamPatientSummary,
    getProblemText,
    getClinicalNoteText,
    getDoseInstruction,
    auditAction
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(ReferralLetterCert));
