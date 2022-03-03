import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import NewYellowFever from './newYellowFever';
import {
    resetAll,
    updateField,
    saveAndPrintYellowFeverLetter,
    listYellowFeverExemptCertificates,
    updateYellowFeverExemptCertificate,
    deleteYellowFeverExemptCertificate
} from '../../../store/actions/certificate/yellowFever/yellowFeverAction';
import {
    getLetterDefaultValue
} from '../../../store/actions/common/commonAction';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';
import {
    updateCurTab
} from '../../../store/actions/mainFrame/mainFrameAction';
import moment from 'moment';
import _ from 'lodash';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import Enum from '../../../enums/enum';
import accessRightEnum from '../../../enums/accessRightEnum';
import { INITAL_STATE } from '../../../store/reducers/certificate/yellowFever/yellowFeverReducer';

import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import HistoryList from '../component/historyList';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';

const styles = theme => ({
    container: {
        height: '100%',
        padding: theme.spacing(1) / 2,
        overflow: 'hidden'
    },
    enctRoom: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
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
class YellowFeverLetter extends Component {
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
        serviceArr: [],
        hasEditRight: true
    }

    componentDidMount() {
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
            if (!CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate) && rows && rows[0]) {
                this.backUpData = {
                    ...this.props.newYellowFeverInfo,
                    patientName: this.getInitPatientName()
                };
                this.props.updateField({ newYellowFeverInfo: _.cloneDeep(this.backUpData) });
            }
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditYellowFeverExemptionLetter);
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.yellowFeverLetter, () => this.checkCertIsDirty(hasEditRight), this.handleSaveprint);
        this.props.updateCurTab(accessRightEnum.yellowFeverLetter, this.doClose);
        this.setState({ hasEditRight });
        this.getLetterDefaultValue();
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    getLetterDefaultValue = () => {
        this.props.getLetterDefaultValue({ svcCd: this.props.service.svcCd, siteId: this.props.clinic.siteId, certType: 'YellowFeverExemptionLetter', userId: this.props.userId }, (data) => {
            let currentFieldList = [
                {
                    label: 'Exemption Notes',
                    fieldName: 'exemptionReason'
                }
            ];
            this.backUpData = {
                ...this.props.newYellowFeverInfo,
                patientName: this.getInitPatientName()
            };
            currentFieldList.forEach(field => {
                let fieldIndex = data.findIndex(item => item.fieldName === field.fieldName);
                if (fieldIndex >= 0) {
                    this.backUpData[field.fieldName] = data[fieldIndex].defaultValue;
                    INITAL_STATE.newYellowFeverInfo[field.fieldName] = data[fieldIndex].defaultValue;
                } else {
                    this.backUpData[field.fieldName] = '';
                    INITAL_STATE.newYellowFeverInfo[field.fieldName] = '';
                }
            });
            this.props.updateField({ newYellowFeverInfo: _.cloneDeep(this.backUpData) });
        });
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const history = _.cloneDeep(this.state.history);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_YELLOW_FEVER_EXEMPTION_LETTER);
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
        this.props.updateField({ letterList: rows });
    }

    getInitPatientName = () => {
        return (this.props.patientInfo.engSurname ? (this.props.patientInfo.engSurname + ' ') : '') + this.props.patientInfo.engGivename;
    }

    checkCertIsDirty = (hasEditRight) => {
        let compare1 = _.cloneDeep(this.backUpData);
        let compare2 = _.cloneDeep(this.props.newYellowFeverInfo);
        let copyPage1 = INITAL_STATE.copyPage;
        let copyPage2 = this.props.copyPage;
        if (this.state.certId) {
            const letterDto = this.props.letterList.find(x => x.id == this.state.certId);
            copyPage1 = (letterDto && letterDto.noOfCopy) || 1;
        }
        return hasEditRight ? !CommonUtilities.isEqualObj(compare1, compare2) || parseInt(copyPage1) !== parseInt(copyPage2) : false;
    }

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
                this.props.listYellowFeverExemptCertificates({
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

    getCertDto = () => {
        const {
            newYellowFeverInfo,
            // handlingPrint,
            copyPage,
            patientInfo,
            caseNoInfo,
            encounterInfo,
            service,
            clinic
        } = this.props;

        let certDto = {
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            svcCd: service && service.serviceCd,
            siteId: clinic && clinic.siteId,
            patientKey: patientInfo.patientKey,
            encntrId: encounterInfo && encounterInfo.encounterId,
            noOfCopy: copyPage,
            nationalityCd: newYellowFeverInfo.nationality,
            issuedCountryCd: newYellowFeverInfo.issuedCountry,
            passportNo: newYellowFeverInfo.passportNumber,
            exemptReason: newYellowFeverInfo.exemptionReason,
            patientName: newYellowFeverInfo.patientName
        };
        return certDto;
    }

    handlePrint = (opType) => {
        const {
            newYellowFeverInfo,
            handlingPrint,
            copyPage,
            patientInfo
        } = this.props;
        const { pageStatus, certId, certVer, history } = this.state;

        if (handlingPrint) {
            return;
        }

        let params = {
            opType: opType,
            patientKey: patientInfo.patientKey,
            nationality: newYellowFeverInfo.nationality,
            issuedCountry: `${newYellowFeverInfo.issuedCountry} PASSPORT NUMBER`,
            passportNumber: newYellowFeverInfo.passportNumber,
            exemptionReason: newYellowFeverInfo.exemptionReason,
            patientName: newYellowFeverInfo.patientName
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
            params.yellowFeverExemptCertificateDto = certDto;
        }

        if (opType === 'RP') {
            let certDto = this.getCertDto();
            certDto = {
                ...certDto,
                id: certId,
                version: certVer
            };
            params.yellowFeverExemptCertificateDto = certDto;
        }

        this.props.updateField({ handlingPrint: true });
        this.props.saveAndPrintYellowFeverLetter(
            params,
            (printSuccess) => {
                this.props.updateField({ handlingPrint: false });
                if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') || opType === 'RP') {
                    this.setState({ isEdit: false });
                    this.updateHistoryList((rows) => {
                        this.svcOptsFiltering(rows, true);
                        this.setState({
                            pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                        });
                        this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);
                    }, true);
                } else {
                    this.setState({ isEdit: false });
                    this.updateHistoryList((rows) => {
                        this.svcOptsFiltering(rows, true);
                        if (opType === 'SP') {
                            let { history } = this.state;
                            history.selectedIndex = '0';
                            this.setState({
                                history,
                                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                            });
                            this.handleHistoryListItemClick('0', rows && rows[0]);
                        }
                    }, true);
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
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
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
                this.updateHistoryList((rows) => {
                    if (serviceArr.length > 0) {
                        if (history.serviceCd === '*All' && history.siteId === '*All'){
                            const { letterList } = this.props;
                            rows = CertUtil.getShareSvcCertList(letterList || [], serviceArr, sortFunc);
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
        let { history } = this.state;
        history.selectedIndex = value;
        let newYellowFeverInfo = _.cloneDeep(this.props.newYellowFeverInfo);
        let noOfCopy = 1;
        let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
        let certId = '';
        let printType = '';
        let certCdtm = '';
        let certVer = '';
        if (rowData) {
            newYellowFeverInfo.nationality = rowData.nationalityCd;
            newYellowFeverInfo.issuedCountry = rowData.issuedCountryCd;
            newYellowFeverInfo.passportNumber = rowData.passportNo;
            newYellowFeverInfo.exemptionReason = rowData.exemptReason;
            newYellowFeverInfo.patientName = rowData.patientName;
            noOfCopy = rowData.noOfCopy || 1;
            certId = rowData.id;
            printType = rowData.printType;
            certCdtm = moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            certVer = rowData.version;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                history,
                certVer
            });
            this.props.updateField({ newYellowFeverInfo, copyPage: noOfCopy });
            this.backUpData = _.cloneDeep(newYellowFeverInfo);

        } else {
            newYellowFeverInfo = _.cloneDeep(INITAL_STATE.newYellowFeverInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                history,
                certVer
            });
            newYellowFeverInfo.patientName = this.getInitPatientName();
            this.props.updateField({ newYellowFeverInfo, copyPage: noOfCopy });
            this.backUpData = _.cloneDeep(newYellowFeverInfo);
        }
    }

    handleSaveprint = (closeTabFunc) => {
        this.props.updateField({ closeTabFunc: closeTabFunc || null });
        const { pageStatus } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.yellowFeverLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                }
            });
        } else {
            const formValid = this.refs.yellowFeverLetterForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                } else {
                    this.refs.yellowFeverLetterForm.focusFail();
                }
            });
        }
    }

    handleReprint = () => {
        const formValid = this.refs.yellowFeverLetterForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.handlePrint('RP');
            } else {
                this.refs.yellowFeverLetterForm.focusFail();
            }
        });
    }


    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        const { letterList } = this.props;
        let { serviceArr } = this.state;
        const sharedList = CertUtil.getShareSvcCertList(letterList || [], serviceArr, sortFunc);
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
                            let { history } = this.state;
                            history.selectedIndex = '';
                            let newYellowFeverInfo = _.cloneDeep(this.props.newYellowFeverInfo);
                            let noOfCopy = 1;
                            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
                            let certId = '';
                            let printType = '';
                            let certCdtm = '';
                            let certVer = '';
                            newYellowFeverInfo = _.cloneDeep(INITAL_STATE.newYellowFeverInfo);
                            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
                            this.setState({
                                pageStatus,
                                certId,
                                printType,
                                certCdtm,
                                history,
                                certVer
                            });
                            newYellowFeverInfo.patientName = this.getInitPatientName();
                            this.props.updateField({ newYellowFeverInfo, copyPage: noOfCopy });
                            this.backUpData = _.cloneDeep(newYellowFeverInfo);
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteYellowFeverExemptCertificate({
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
        const { pageStatus, history, hasEditRight, serviceArr } = this.state;
        const { letterList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(letterList || [], serviceArr, sortFunc);
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
            let { history } = this.state;
            history.selectedIndex = '';
            let newYellowFeverInfo = _.cloneDeep(this.props.newYellowFeverInfo);
            let noOfCopy = 1;
            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
            let certId = '';
            let printType = '';
            let certCdtm = '';
            let certVer = '';
            newYellowFeverInfo = _.cloneDeep(INITAL_STATE.newYellowFeverInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            this.setState({
                pageStatus,
                certId,
                printType,
                certCdtm,
                history,
                certVer
            });
            newYellowFeverInfo.patientName = this.getInitPatientName();
            this.props.updateField({ newYellowFeverInfo, copyPage: noOfCopy });
            this.backUpData = _.cloneDeep(newYellowFeverInfo);
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.yellowFeverLetter);
        }
    }

    handleEditCert = () => {
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'clinical-doc');
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditYellowFeverExemptionLetter);
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
        const { classes, letterList, clinicList } = this.props;
        const {
            history,
            pageStatus,
            serviceArr,
            hasEditRight
        } = this.state;
        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;
        const sharedList = CertUtil.getShareSvcCertList(letterList || [], serviceArr, sortFunc);
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
                        id="yellowFeverLetter"
                        ref="historyListRef"
                        // data={letterList}
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
                        id="yellowFeverLetter_form"
                        ref={'yellowFeverLetterForm'}
                    >
                        <NewYellowFever
                            id={'yellowFeverNewYellowFever'}
                            allowCopyList={this.props.allowCopyList}
                            copyPage={this.props.copyPage}
                            handleOnChange={this.handleOnChange}
                            handlePrint={this.handlePrint}
                            isSelected={isSelected}
                        />
                    </ValidatorForm>
                </Grid>
                {
                    isSelected ?
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'yellowFeverLetter_btnEdit',
                                        name: 'Edit',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'yellowFeverLetter_btnReprint',
                                        name: 'Reprint',
                                        style: { display: (isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: () => {
                                            this.props.auditAction(AlsDesc.CERT_RE_PRINT);
                                            this.handleReprint();
                                        }
                                    },
                                    {
                                        id: 'yellowFeverLetter_btnDelete',
                                        name: 'Delete',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'yellowFeverLetter_btnClose',
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
                                        id: 'yellowFeverLetter_btnSaveAndPrint',
                                        name: 'Save & Print',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => { this.handleSaveprint(); }
                                    },
                                    {
                                        id: 'yellowFeverLetter_btnCancel',
                                        name: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING ? 'Cancel' : 'Close',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        />
                }
            </Grid>
        );
    }
}

const stateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        allowCopyList: state.yellowFever.allowCopyList,
        copyPage: state.yellowFever.copyPage,
        letterList: state.yellowFever.letterList,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        handlingPrint: state.sickLeave.handlingPrint,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        newYellowFeverInfo: state.yellowFever.newYellowFeverInfo,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        userId: state.login.loginInfo.userDto.userId
    };
};

const dispatchToProps = {
    resetAll,
    updateField,
    saveAndPrintYellowFeverLetter,
    listYellowFeverExemptCertificates,
    updateYellowFeverExemptCertificate,
    openCommonMessage,
    updateCurTab,
    deleteYellowFeverExemptCertificate,
    auditAction,
    getLetterDefaultValue
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(YellowFeverLetter));