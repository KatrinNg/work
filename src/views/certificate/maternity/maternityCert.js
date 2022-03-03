import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import MaternityCertForm from './maternityCertForm';
import HistoryList from '../component/historyList';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import {
    updateField,
    getMaternityCert,
    listMaternityCert,
    resetAll,
    deleteMaternityCert,
    updateMaternityCert
} from '../../../store/actions/certificate/maternity/maternityAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { INITAL_STATE } from '../../../store/reducers/certificate/maternity/maternityReducer';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import moment from 'moment';
import Enum from '../../../enums/enum';
import _ from 'lodash';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import accessRightEnum from '../../../enums/accessRightEnum';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';

const styles = theme => ({
    container: {
        height: '100%',
        overflow: 'hidden',
        padding: theme.spacing(1) / 2
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
class MaternityCert extends Component {
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
            selCert: { certInfo: '', copyPage: 1 },
            serviceArr: [],
            hasEditRight: true
        };
    }

    componentDidMount() {
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditMaternityCert);
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.maternityCertificate, () => this.checkCertIsDirty(hasEditRight), this.handleSaveprint);
        this.setState({ hasEditRight });
        this.props.updateCurTab(accessRightEnum.maternityCertificate, this.doClose);
        INITAL_STATE.newLeaveInfo.dpk_CertDate=moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_MATERNITY_SICK_LEAVE_CERT);
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
        this.props.updateField({ maternityCertList: rows });
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
                this.props.listMaternityCert({
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

    getCertDto = (opType) => {
        const {
            newLeaveInfo,
            service,
            clinic,
            copyPage,
            patientInfo,
            caseNoInfo,
            encounterInfo
        } = this.props;

        let certDto = {
            svcCd: service.serviceCd,
            siteId: clinic.siteId,
            patientKey: patientInfo.patientKey,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            encntrId: encounterInfo && encounterInfo.encounterId,
            certTo: newLeaveInfo.txt_To,
            issueDate: moment(newLeaveInfo.dpk_CertDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            isPregnant: newLeaveInfo.rdo_MaternityStatus === 'pregnant' ? '1' : '0',
            deliverDate: newLeaveInfo.dpk_MaternityDelivered ? moment(newLeaveInfo.dpk_MaternityDelivered).format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
            confinementDate: newLeaveInfo.dpk_DateOfConfinement ? moment(newLeaveInfo.dpk_DateOfConfinement).format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
            leaveStart: newLeaveInfo.dpk_LeaveFrom ? moment(newLeaveInfo.dpk_LeaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
            leaveEnd: newLeaveInfo.dpk_LeaveTo ? moment(newLeaveInfo.dpk_LeaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
            remarkType: newLeaveInfo.rdo_Disease,
            remark: newLeaveInfo.txt_DiseaseRemark,
            noOfCopy: copyPage
        };
        const { pageStatus, certId, certVer } = this.state;

        if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') || opType === 'RP') {
            certDto = {
                ...certDto,
                id: certId,
                version: certVer
                // printType
            };
        }

        return certDto;
    }

    handlePrint = (opType) => {
        const {
            handlingPrint,
            copyPage
        } = this.props;

        const { pageStatus, history } = this.state;

        if (handlingPrint) {
            return;
        }
        let params = this.getCertDto(opType);
        params = {
            ...params,
            opType: opType
        };
        this.props.updateField({ handlingPrint: true });
        this.props.getMaternityCert(
            params,
            (printSuccess) => {
                this.props.updateField({ handlingPrint: false });
                if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') || opType === 'RP') {
                    this.setState({
                        isEdit: false,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                    }, () => {
                        this.updateHistoryList((rows) => {
                            // if (opType === 'SP') {
                            this.svcOptsFiltering(rows,true);

                            this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);

                            // }
                        }, true);
                    });
                } else {

                    if (opType === 'SP') {
                        let { history } = this.state;
                        history.selectedIndex = '0';
                        this.setState({
                            isEdit: false,
                            history,
                            pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                        }, () => {
                            this.updateHistoryList((rows) => {
                                // if (opType === 'SP') {
                                this.svcOptsFiltering(rows,true);

                                this.handleHistoryListItemClick('0', rows && rows[0]);

                                // }
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
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
                // const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.serviceCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_MATERNITY_SICK_LEAVE_CERT);
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
                            const { maternityCertList } = this.props;
                            rows = CertUtil.getShareSvcCertList(maternityCertList || [], serviceArr, sortFunc);
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
        history.selectedIndex = value;
        let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
        let noOfCopy = 1;
        let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
        let certId = '';
        let printType = '';
        let certCdtm = '';
        let certVer = '';
        if (rowData) {
            newLeaveInfo.txt_To = rowData.certTo || '';
            newLeaveInfo.dpk_CertDate = rowData.issueDate || null;
            newLeaveInfo.rdo_MaternityStatus = rowData.isPregnant.toString() === '1' ? 'pregnant' : 'delivered';
            newLeaveInfo.dpk_MaternityDelivered = rowData.deliverDate || null;
            newLeaveInfo.cbo_DateOfConfinement = rowData.confinementDate ? true : false;
            newLeaveInfo.dpk_DateOfConfinement = rowData.confinementDate || null;
            newLeaveInfo.cbo_Disease = rowData.remarkType ? true : false;
            newLeaveInfo.rdo_Disease = rowData.remarkType || '';
            newLeaveInfo.txt_DiseaseRemark = rowData.remark || '';
            newLeaveInfo.cbo_LeaveDate = rowData.leaveStart || rowData.leaveEnd ? true : false;
            newLeaveInfo.dpk_LeaveFrom = rowData.leaveStart || null;
            newLeaveInfo.dpk_LeaveTo = rowData.leaveEnd || null;
            noOfCopy = rowData.noOfCopy || 1;
            selCert.copyPage = noOfCopy;
            certId = rowData.id;
            printType = rowData.printType;
            certCdtm = moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            certVer = rowData.version;
        } else {
            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
        }
        selCert.certInfo = newLeaveInfo;
        this.setState({
            pageStatus,
            certId,
            printType,
            history,
            certCdtm,
            certVer,
            selCert
        });
        this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
    }

    handleSaveprint = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const formValid = this.refs.maternityCertForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                this.handlePrint('SP');
            } else {
                this.refs.maternityCertForm.focusFail();
            }
        });
    }

    handleReprint = () => {
        const formValid = this.refs.maternityCertForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.handlePrint('RP');
            } else {
                this.refs.maternityCertForm.focusFail();
            }
        });
    }

    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        const { maternityCertList } = this.props;
        let { serviceArr } = this.state;
        const sharedList = CertUtil.getShareSvcCertList(maternityCertList || [], serviceArr, sortFunc);
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
                            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
                            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
                            selCert.certInfo = newLeaveInfo;
                            this.setState({
                                pageStatus,
                                certId,
                                printType,
                                history,
                                certCdtm,
                                certVer,
                                selCert
                            });
                            this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteMaternityCert(cert.id, callback);
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
        const { maternityCertList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(maternityCertList || [], serviceArr, sortFunc);
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
            let newLeaveInfo = _.cloneDeep(this.props.newLeaveInfo);
            let noOfCopy = 1;
            let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
            let certId = '';
            let printType = '';
            let certCdtm = '';
            let certVer = '';
            newLeaveInfo = _.cloneDeep(INITAL_STATE.newLeaveInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
            selCert.certInfo = newLeaveInfo;
            this.setState({
                pageStatus,
                certId,
                printType,
                history,
                certCdtm,
                certVer,
                selCert
            });
            this.props.updateField({ newLeaveInfo, copyPage: noOfCopy });
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.maternityCertificate);
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
        if (selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        }
        cmpInfo = {
            ...cmpInfo,
            dpk_CertDate: cmpInfo.dpk_CertDate && moment(cmpInfo.dpk_CertDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_DateOfConfinement: cmpInfo.dpk_DateOfConfinement && moment(cmpInfo.dpk_DateOfConfinement).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_LeaveFrom: cmpInfo.dpk_LeaveFrom && moment(cmpInfo.dpk_LeaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_LeaveTo: cmpInfo.dpk_LeaveTo && moment(cmpInfo.dpk_LeaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_MaternityDelivered: cmpInfo.dpk_MaternityDelivered && moment(cmpInfo.dpk_MaternityDelivered).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        sourceInfo = {
            ...sourceInfo,
            dpk_CertDate: sourceInfo.dpk_CertDate && moment(sourceInfo.dpk_CertDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_DateOfConfinement: sourceInfo.dpk_DateOfConfinement && moment(sourceInfo.dpk_DateOfConfinement).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_LeaveFrom: sourceInfo.dpk_LeaveFrom && moment(sourceInfo.dpk_LeaveFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_LeaveTo: sourceInfo.dpk_LeaveTo && moment(sourceInfo.dpk_LeaveTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dpk_MaternityDelivered: sourceInfo.dpk_MaternityDelivered && moment(sourceInfo.dpk_MaternityDelivered).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        if (this.state.certId) {
            const letterDto = this.props.maternityCertList.find(x => x.id == this.state.certId);
            copyPage1 = (letterDto && letterDto.noOfCopy) || 1;
        }
        return hasEditRight ? !CommonUtilities.isEqualObj(cmpInfo, sourceInfo) || parseInt(copyPage1) !== parseInt(copyPage2) : false;
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditMaternityCert);
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
        }else{
            this.handleHistoryListItemClick(value, rowData);
        }
    }

    render() {
        const {
            classes,
            maternityCertList,
            allowCopyList,
            copyPage,
            clinicList
        } = this.props;

        const {
            history,
            pageStatus,
            // filterSvc,
            serviceArr,
            hasEditRight
        } = this.state;

        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;

        const sharedList = CertUtil.getShareSvcCertList(maternityCertList || [], serviceArr, sortFunc);
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
                        id="maternityCert"
                        ref="historyListRef"
                        // data={maternityCertList}
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
                        id="maternityCert_form"
                        ref={'maternityCertForm'}
                    >
                        <MaternityCertForm
                            id={'maternityCert_formInformation'}
                            allowCopyList={allowCopyList}
                            copyPage={copyPage}
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
                                        id: 'generalLetter_btnEdit',
                                        name: 'Edit',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'maternityCert_btnReprint',
                                        name: 'Reprint',
                                        style: { display: (isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: () => {
                                            this.props.auditAction(AlsDesc.CERT_RE_PRINT);
                                            this.handleReprint();
                                        }
                                    },
                                    {
                                        id: 'maternityCert_btnDelete',
                                        name: 'Delete',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'maternityCert_btnClose',
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
                                        id: 'maternityCert_btnSaveAndPrint',
                                        name: 'Save & Print',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => { this.handleSaveprint(); }
                                    },
                                    {
                                        id: 'maternityCert_btnCancel',
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
        allowCopyList: state.maternity.allowCopyList,
        copyPage: state.maternity.copyPage,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        maternityCertList: state.maternity.maternityCertList,
        handlingPrint: state.maternity.handlingPrint,
        newLeaveInfo: state.maternity.newLeaveInfo,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms
    };
};

const dispatchToProps = {
    updateField,
    resetAll,
    updateCurTab,
    getMaternityCert,
    listMaternityCert,
    deleteMaternityCert,
    openCommonMessage,
    updateMaternityCert,
    auditAction
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(MaternityCert));