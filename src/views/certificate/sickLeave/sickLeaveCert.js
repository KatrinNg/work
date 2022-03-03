import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import NewSickLeave from './newSickLeave';
import HistoryList from '../component/historyList';
import * as CaseNoUtil from 'utilities/caseNoUtilities';
import {
    updateField,
    getSickLeaveCert,
    listLeaveCertificates,
    resetAll,
    updateLeaveCertificate,
    deleteLeaveCert
} from 'store/actions/certificate/sickLeave/sickLeaveAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { INITAL_STATE } from '../../../store/reducers/certificate/sickLeave/sickLeaveReducer';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import moment from 'moment';
import Enum from '../../../enums/enum';
import CIMSButtonGroup from 'components/Buttons/CIMSButtonGroup';
import accessRightEnum from '../../../enums/accessRightEnum';
import _ from 'lodash';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import { calcPeriod } from './component/leaveDateRange';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../../components/PDF/CIMSPdfViewer';
import { print } from '../../../utilities/printUtilities';
import { getUseDH65PrinterValue } from '../../../utilities/siteParamsUtilities';

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
class SickLeaveCert extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            selCert: { certInfo: '', copyPage: 1, svcCd: null },
            attnDate: moment(),
            serviceArr: [],
            hasEditRight: true,
            previewDialogOpen: false,
            previewData: null
        };
        this.handlingPreviewAndPrint = false;
    }

    componentDidMount() {
        let { encounterInfo, service } = this.props;
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
            // const serviceArr = CertUtil.getAccessedServices(this.state.filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_SICK_LEAVE_CERT);
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditSickLeaveCert);
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.sickLeaveCertificate, () => this.checkCertIsDirty(hasEditRight), this.handleSaveprint);
        this.props.updateCurTab(accessRightEnum.sickLeaveCertificate, this.doClose);
        this.setState({ attnDate: moment(encounterInfo.encounterDate), hasEditRight, selCert: { ...this.state.selCert, svcCd: service.svcCd } });
        INITAL_STATE.newLeaveInfo.attnDate = moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        INITAL_STATE.newLeaveInfo.issueDate=moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        INITAL_STATE.newLeaveInfo.dateRange.leaveFrom=moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_SICK_LEAVE_CERT);
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
        this.props.updateField({ sickLeaveCertList: rows });
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
                this.props.listLeaveCertificates({
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

    getSiteAlterOpts = (params) => {
        const { service,newLeaveInfo } = this.props;
        if (service.svcCd === 'SPP') {
            params.codSppSiteAlterCd = newLeaveInfo.codSppSiteAlterCd;
            params.sickLeaveCertificateDto.codSppSiteAlterCd = newLeaveInfo.codSppSiteAlterCd;
        }
        return params;
    }

    handleOnChange = (changes) => {
        this.props.updateField(changes);
        this.setState({ isEdit: true });
    }

    getCertDto = () => {
        const {
            newLeaveInfo,
            caseNoInfo,
            encounterInfo,
            service,
            clinic,
            copyPage,
            patientInfo
        } = this.props;

        let certDto = {
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            certTo: newLeaveInfo.to,
            svcCd: service && service.serviceCd,
            siteId: clinic && clinic.siteId,
            encntrId: encounterInfo && encounterInfo.encounterId,
            startDate: moment(newLeaveInfo.dateRange.leaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            endDate: moment(newLeaveInfo.dateRange.leaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            noOfCopy: copyPage,
            patientKey: patientInfo && patientInfo.patientKey,
            remark: newLeaveInfo.remark,
            sessionCd: newLeaveInfo.dateRange.leaveFromSection,
            startSessionCd: newLeaveInfo.dateRange.leaveFromSection,
            endSessionCd: newLeaveInfo.dateRange.leaveToSection,
            sufferFrom: newLeaveInfo.sufferFrom,
            issueDate: newLeaveInfo.issueDate,
            attnDate: moment(this.state.attnDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            isMaskHKID: newLeaveInfo.isMaskHKID
        };
        return certDto;
    }

    handlePrint = (opType) => {
        const {
            newLeaveInfo,
            handlingPrint,
            copyPage,
            patientInfo,
            siteParams,
            service,
            clinic
        } = this.props;
        const { pageStatus, certId, printType, certVer, history } = this.state;
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

        if (handlingPrint) {
            return;
        }


        let params = {
            opType: opType,
            toValue: newLeaveInfo.to,
            diseaseName: newLeaveInfo.sufferFrom,
            dateFrom: moment(newLeaveInfo.dateRange.leaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(newLeaveInfo.dateRange.leaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateFromFlag: newLeaveInfo.dateRange.leaveFromSection,
            dateToFlag: newLeaveInfo.dateRange.leaveToSection,
            dayNum: newLeaveInfo.dateRange.period,
            issueDate: newLeaveInfo.issueDate,
            patientKey: patientInfo && patientInfo.patientKey,
            attnDate: moment(this.state.attnDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            isMaskHKID: newLeaveInfo.isMaskHKID
        };
        if (opType === 'SP') {
            let certDto = this.getCertDto();
            if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
                certDto = {
                    ...certDto,
                    id: certId,
                    version: certVer,
                    printType
                };
            }
            params.sickLeaveCertificateDto = certDto;
        }

        if (opType === 'RP') {
            let certDto = this.getCertDto();
            certDto = {
                ...certDto,
                id: certId,
                version: certVer,
                printType
            };
            params.sickLeaveCertificateDto = certDto;
        }

        this.props.updateField({ handlingPrint: true });

        params = this.getSiteAlterOpts(params);
        this.props.getSickLeaveCert(
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
                            this.handleHistoryListItemClick(history.selectedIndex, this.props.sickLeaveCertList && this.props.sickLeaveCertList[history.selectedIndex]);
                        }, true);
                    });
                } else {

                    if (opType === 'SP') {
                        let { history } = this.state;
                        history.selectedIndex = '0';
                        // this.setState({ isEdit: false });
                        this.setState({
                            isEdit: false,
                            pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                            history
                        }, () => {
                            this.updateHistoryList((rows) => {
                                // if (opType === 'SP') {
                                this.svcOptsFiltering(rows, true);
                                this.handleHistoryListItemClick('0', rows && rows[0]);
                                // }
                            }, true);
                        });
                    }
                }
                if (printSuccess) {
                    console.log('Print Success');
                }
            }, copyPage, false, isFitPage, printQue);
    }

    handleSaveAndPreview = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const { pageStatus } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.sickLeaveForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePreview('SP');
                }
            });
        } else {
            const formValid = this.refs.sickLeaveForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePreview('SP');
                } else {
                    this.refs.sickLeaveForm.focusFail();
                }
            });
        }
    }

    handlePreview = (opType) => {
        const {
            newLeaveInfo,
            copyPage,
            patientInfo
        } = this.props;
        const { pageStatus, certId, printType, certVer, history } = this.state;

        let params = {
            opType: opType,
            toValue: newLeaveInfo.to,
            diseaseName: newLeaveInfo.sufferFrom,
            dateFrom: moment(newLeaveInfo.dateRange.leaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(newLeaveInfo.dateRange.leaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateFromFlag: newLeaveInfo.dateRange.leaveFromSection,
            dateToFlag: newLeaveInfo.dateRange.leaveToSection,
            dayNum: newLeaveInfo.dateRange.period,
            issueDate: newLeaveInfo.issueDate,
            patientKey: patientInfo && patientInfo.patientKey,
            attnDate: moment(this.state.attnDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            isMaskHKID: newLeaveInfo.isMaskHKID
        };
        let certDto = this.getCertDto();
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            certDto = {
                ...certDto,
                id: certId,
                version: certVer,
                printType
            };
        }
        params.sickLeaveCertificateDto = certDto;
        params = this.getSiteAlterOpts(params);
        this.props.getSickLeaveCert(
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
                            this.handleHistoryListItemClick(history.selectedIndex, this.props.sickLeaveCertList && this.props.sickLeaveCertList[history.selectedIndex]);
                        }, true);
                    });
                } else {
                    let { history } = this.state;
                    history.selectedIndex = '0';
                    this.setState({
                        isEdit: false,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                        history,
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

    handleHistoryChange = (value, name) => {
        let { history, serviceArr } = this.state;
        if (name === 'selectedSite') {
            history.siteId = value;
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
                // const serviceArr = CertUtil.getAccessedServices(this.state.filterSvc, this.props.service.serviceCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_SICK_LEAVE_CERT);
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
        this.setState({
            history
            //pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
        }, () => {
            if (name !== 'dateFrom' && name !== 'dateTo' && name !== 'open') {
                this.updateHistoryList((rows) => {
                    if (serviceArr.length > 0) {
                        if (history.serviceCd === '*All' && history.siteId === '*All'){
                            const { sickLeaveCertList } = this.props;
                            rows = CertUtil.getShareSvcCertList(sickLeaveCertList || [], serviceArr, sortFunc);
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

    loadDfltSiteAlter = (letterInfo) => {
        let _letterInfo = _.cloneDeep(letterInfo);
        if (this.props.service.svcCd === 'SPP') {
            if (this.newSickLfRef.siteAlterOptsRef) {
                const dfltSiteAlter = this.newSickLfRef.siteAlterOptsRef.getDfltSiteAlter();
                _letterInfo.codSppSiteAlterCd = dfltSiteAlter ? dfltSiteAlter.codSppSiteAlterCd || null : null;
            }
        };
        return _letterInfo;
    }

    handleHistoryListItemClick = (value, rowData) => {
        let { history, selCert } = this.state;
        history.selectedIndex = value;
        let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
        let noOfCopy = 1;
        let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
        let certId = '';
        let printType = '';
        let certCdtm = '';
        let certVer = '';
        let attnDate = null;
        if (rowData) {
            newLeaveInfo.to = rowData.certTo;
            newLeaveInfo.sufferFrom = rowData.sufferFrom;
            newLeaveInfo.remark = rowData.remark;
            newLeaveInfo.dateRange.leaveFrom = rowData.startDate;
            newLeaveInfo.dateRange.leaveTo = rowData.endDate;
            newLeaveInfo.dateRange.leaveFromSection = rowData.startSessionCd;
            newLeaveInfo.dateRange.leaveToSection = rowData.endSessionCd;
            const period = calcPeriod(rowData.startDate, rowData.startSessionCd, rowData.endDate, rowData.endSessionCd);
            newLeaveInfo.dateRange.period = period;
            newLeaveInfo.issueDate = rowData.issueDate;
            attnDate = rowData.attnDate || moment(this.props.encounterInfo.encounterDate);
            newLeaveInfo.isMaskHKID = rowData.isMaskHKID || '1';
            // if (rowData.startDate && rowData.endDate) {
            //     newLeaveInfo.dateRange.period = moment(rowData.endDate).diff(moment(rowData.startDate), 'day');
            //     if (rowData.sessionCd === Enum.SECTION_TYPE.NOTSPECIFY) {
            //         newLeaveInfo.dateRange.period += 1;
            //     } else {
            //         if (newLeaveInfo.dateRange.period > 0) {
            //             newLeaveInfo.dateRange.period += 1;
            //         }
            //     }
            //     newLeaveInfo.dateRange.period = _.toString(newLeaveInfo.dateRange.period);
            // }
            noOfCopy = rowData.noOfCopy || 1;
            selCert.copyPage = noOfCopy;
            // this.setState({
            //     pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
            // });
            certId = rowData.id;
            printType = rowData.printType;
            certVer = rowData.version;
            certCdtm = moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            selCert.svcCd = rowData.svcCd;
            if (this.props.service.svcCd === 'SPP') {
                newLeaveInfo.codSppSiteAlterCd = rowData.codSppSiteAlterCd;
            };
            selCert.certInfo = newLeaveInfo;
        } else {
            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            attnDate = moment(this.props.encounterInfo.encounterDate);
            newLeaveInfo = this.loadDfltSiteAlter(newLeaveInfo);
            selCert = { certInfo: '', copyPage: 1, svcCd: this.props.service.svcCd };
        }
        this.setState({
            pageStatus,
            certId,
            printType,
            certVer,
            history,
            certCdtm,
            selCert,
            attnDate
        });
        this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
    }

    handleSaveprint = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const { pageStatus } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.sickLeaveForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                }
            });
        } else {
            const formValid = this.refs.sickLeaveForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                } else {
                    this.refs.sickLeaveForm.focusFail();
                }
            });
        }
    }

    handleReprint = () => {
        const formValid = this.refs.sickLeaveForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.handlePrint('RP');
            } else {
                this.refs.sickLeaveForm.focusFail();
            }
        });
    }

    handleCopyToNew = () => {
        this.props.auditAction(AlsDesc.CERT_COPY_TO_NEW, null, null, false, 'clinical-doc');
        let { history } = this.state;
        let attnDate='';
        history.selectedIndex = '';
        let tempLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
        let { encounterInfo } = this.props;
        tempLeaveInfo.sufferFrom = this.props.newLeaveInfo.sufferFrom;
        tempLeaveInfo.remark = this.props.newLeaveInfo.remark;
        if (encounterInfo && encounterInfo.encounterDate) {
            tempLeaveInfo.attnDate = moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
            attnDate=moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        }
        tempLeaveInfo = this.loadDfltSiteAlter(tempLeaveInfo);

        this.props.updateField({
            newLeaveInfo: tempLeaveInfo,
            copyPage: 1
        });
        this.setState({
            history,
            pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING,
            attnDate
        });
    }


    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        let { serviceArr } = this.state;
        const { sickLeaveCertList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(sickLeaveCertList || [], serviceArr, sortFunc);
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
                            let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
                            let noOfCopy = 1;
                            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
                            let certId = '';
                            let printType = '';
                            let certCdtm = '';
                            let certVer = '';
                            let attnDate = null;
                            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
                            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
                            attnDate = moment(this.props.encounterInfo.encounterDate);
                            newLeaveInfo = this.loadDfltSiteAlter(newLeaveInfo);
                            selCert.certInfo = newLeaveInfo;
                            this.setState({
                                pageStatus,
                                certId,
                                printType,
                                certVer,
                                history,
                                certCdtm,
                                selCert,
                                attnDate
                            });
                            this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteLeaveCert({
                            id: cert.id,
                            status: 'D'
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
        const { sickLeaveCertList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(sickLeaveCertList || [], serviceArr, sortFunc);
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
        }
        else if (pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED) {
            this.props.auditAction('Cancel Certificate Selection', null, null, false, 'clinical-doc');
            history.selectedIndex = '';
            let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
            let noOfCopy = 1;
            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
            let certId = '';
            let printType = '';
            let certCdtm = '';
            let certVer = '';
            let attnDate = null;
            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            attnDate = moment(this.props.encounterInfo.encounterDate);
            selCert.certInfo = newLeaveInfo;
            this.setState({
                pageStatus,
                certId,
                printType,
                certVer,
                history,
                certCdtm,
                selCert,
                attnDate
            });
            newLeaveInfo = this.loadDfltSiteAlter(newLeaveInfo);
            this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.sickLeaveCertificate);
        }
    }

    handleEditCert = () => {
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'clinical-doc');
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }

    checkCertIsDirty = (hasEditRight) => {
        const { selCert } = this.state;
        let cmpInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
        let sourceInfo = _.cloneDeep(this.props.newLeaveInfo);
        let copyPage1 = INITAL_STATE.copyPage;
        let copyPage2 = this.props.copyPage;
        if (selCert && selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        }

        cmpInfo = {
            ...cmpInfo,
            dateRange: {
                ...cmpInfo.dateRange,
                leaveFrom: cmpInfo.dateRange.leaveFrom && moment(cmpInfo.dateRange.leaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                leaveTo: cmpInfo.dateRange.leaveTo && moment(cmpInfo.dateRange.leaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
            },
            issueDate: cmpInfo.issueDate && moment(cmpInfo.issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        sourceInfo = {
            ...sourceInfo,
            dateRange: {
                ...sourceInfo.dateRange,
                leaveFrom: sourceInfo.dateRange.leaveFrom && moment(sourceInfo.dateRange.leaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                leaveTo: sourceInfo.dateRange.leaveTo && moment(sourceInfo.dateRange.leaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
            },
            issueDate: sourceInfo.issueDate && moment(sourceInfo.issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        if (this.state.certId) {
            const letterDto = this.props.sickLeaveCertList.find(x => x.id == this.state.certId);
            copyPage1 = (letterDto && letterDto.noOfCopy) || 1;
        } else {
            cmpInfo = this.loadDfltSiteAlter(cmpInfo);
        }
        return hasEditRight ? !CommonUtilities.isEqualObj(cmpInfo, sourceInfo) || parseInt(copyPage1) !== parseInt(copyPage2) : false;
    }

    updateAttnDate = (date) => {
        this.setState({ attnDate: date });
        let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
        newLeaveInfo.attnDate = moment(date).format(Enum.DATE_FORMAT_EYMD_VALUE);
        this.props.updateField({ newLeaveInfo });
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditSickLeaveCert);
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
        const {
            classes,
            sickLeaveCertList,
            allowCopyList,
            copyPage,
            clinicList,
            service,
            clinic,
            siteParams
        } = this.props;

        const {
            history,
            pageStatus,
            attnDate,
            serviceArr,
            hasEditRight,
            previewDialogOpen,
            previewData,
            selCert
        } = this.state;

        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;
        const sharedList = CertUtil.getShareSvcCertList(sickLeaveCertList || [], serviceArr, sortFunc);
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
                        id="sickLeaveCert"
                        ref="historyListRef"
                        // data={sickLeaveCertList}
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
                        id="sickLeaveCert_form"
                        ref={'sickLeaveForm'}
                    >
                        <NewSickLeave
                            id={'sickLeaveCertNewSickLeave'}
                            allowCopyList={allowCopyList}
                            copyPage={copyPage}
                            handleOnChange={this.handleOnChange}
                            handlePrint={this.handlePrint}
                            isSelected={isSelected}
                            attnDate={attnDate}
                            updateAttnDate={this.updateAttnDate}
                            selCert={selCert}
                            innerRef={inner => this.newSickLfRef = inner}
                        />
                    </ValidatorForm>
                </Grid>
                {
                    isSelected ?
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'sickLeaveCert_btnEdit',
                                        name: 'Edit',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? true : isPastCert) ? 'none' : '' },
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'sickLeaveCert_btnCopyToNew',
                                        name: 'Copy to New',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleCopyToNew
                                    },
                                    {
                                        id: 'sickLeaveCert_btnReprint',
                                        name: 'Reprint',
                                        style: { display: (isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: () => {
                                            this.props.auditAction(AlsDesc.CERT_RE_PRINT);
                                            this.handleReprint();
                                        }
                                    },
                                    {
                                        id: 'sickLeaveCert_btnDelete',
                                        name: 'Delete',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'sickLeaveCert_btnClose',
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
                                        id: 'sickLeaveCert_btnSaveAndPreview',
                                        name: 'Save & Preview',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => {
                                            this.handleSaveAndPreview();
                                        }
                                    },
                                    {
                                        id: 'sickLeaveCert_btnSaveAndPrint',
                                        name: 'Save & Print',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => {
                                            this.handleSaveprint();
                                        }
                                    },
                                    {
                                        id: 'sickLeaveCert_btnCancel',
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
                            id={'sickLeaveCert_pdfViewer'}
                            position={'vertical'}
                            previewData={previewData}
                        />
                    }
                    buttonConfig={
                        [
                            {
                                id: 'sickLeaveCert_print',
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
                                        copies: copyPage,
                                        isFitPage: isFitPage,
                                        printQueue:printQue,
                                        callback: () => {
                                            this.handlingPreviewAndPrint = false;
                                            this.setState({ previewDialogOpen: false });
                                        }
                                    });
                                }
                            },
                            {
                                id: 'sickLeaveCert_close',
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
        patientInfo: state.patient.patientInfo,
        reportData: state.attendanceCert.reportData,
        allowCopyList: state.sickLeave.allowCopyList,
        copyPage: state.sickLeave.copyPage,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        sickLeaveCertList: state.sickLeave.sickLeaveCertList,
        handlingPrint: state.sickLeave.handlingPrint,
        newLeaveInfo: state.sickLeave.newLeaveInfo,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        siteParams:state.common.siteParams
    };
};

const dispatchToProps = {
    updateField,
    getSickLeaveCert,
    listLeaveCertificates,
    resetAll,
    updateCurTab,
    updateLeaveCertificate,
    openCommonMessage,
    deleteLeaveCert,
    auditAction
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(SickLeaveCert));