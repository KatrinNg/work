import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import GeneralCertForm from './generalLetterForm';
import HistoryList from '../component/historyList';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import {
    updateField,
    getGeneralLetter,
    listGeneralLetter,
    resetAll,
    deleteGeneralLetter,
    updateGeneralLetter
} from '../../../store/actions/certificate/generalLetter/generalLetterAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { INITAL_STATE } from '../../../store/reducers/certificate/generalLetter/generalLetterReducer';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import moment from 'moment';
import Enum from '../../../enums/enum';
import _ from 'lodash';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import accessRightEnum from '../../../enums/accessRightEnum';
import AlsDesc from '../../../constants/ALS/alsDesc';
import { auditAction } from '../../../store/actions/als/logAction';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../../components/PDF/CIMSPdfViewer';
import { print } from '../../../utilities/printUtilities';

const styles = theme => ({
    container: {
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: theme.spacing(1) / 2
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
class GeneralLetter extends Component {
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
            filterSvc: [],
            serviceArr: [],
            previewDialogOpen: false,
            previewData: null
        };
        this.handlingPreviewAndPrint = false;
    }

    componentDidMount() {
        // this.props.ensureDidMount();
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
        }, false);
        this.props.resetAll();
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.generalLetter, this.checkCertIsDirty, this.handleSaveprint);
        this.props.updateCurTab(accessRightEnum.generalLetter, this.doClose);
        INITAL_STATE.newLetterInfo.letterDate=moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, clinicList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_GENERAL_LETTER);
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
            }else {
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
        this.props.updateField({ generalLetterList: rows });
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
                this.props.listGeneralLetter({
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
            newLetterInfo,
            service,
            clinic,
            patientInfo,
            caseNoInfo,
            encounterInfo,
            copyPage
        } = this.props;

        let certDto = {
            svcCd: service.serviceCd,
            siteId: clinic.siteId,
            patientKey: patientInfo.patientKey,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            encntrId: encounterInfo && encounterInfo.encounterId,
            letterTo: newLetterInfo.letterTo,
            hcinstId: newLetterInfo.attnGroup.hosptialClinicName,
            letterAttn: newLetterInfo.attnGroup.desc,
            groupCd: newLetterInfo.attnGroup.groupCd,
            letterDate: moment(newLetterInfo.letterDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            subject: newLetterInfo.subject,
            content: newLetterInfo.content,
            yourRef1: newLetterInfo.yourRef1,
            yourRef2: newLetterInfo.yourRef2,
            noOfCopy: copyPage
        };
        const { pageStatus, certId, printType, certVer } = this.state;

        if ((pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && opType === 'SP') || opType === 'RP') {
            certDto = {
                ...certDto,
                id: certId,
                version: certVer,
                printType
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
        this.props.getGeneralLetter(
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
                                this.svcOptsFiltering(rows,true);
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
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
                // const serviceArr = CertUtil.getAccessedServices(filterSvc, this.props.service.svcCd, Enum.CLINIC_CONFIGNAME.IS_SHARE_GENERAL_LETTER);
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
                            const { generalLetterList } = this.props;
                            rows = CertUtil.getShareSvcCertList(generalLetterList || [], serviceArr, sortFunc);
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
                this.updateHistoryList((rows) => {
                    if (serviceArr.length > 0) {
                        if (history.serviceCd === '*All' && history.siteId === '*All'){
                            const { generalLetterList } = this.props;
                            rows = CertUtil.getShareSvcCertList(generalLetterList || [], serviceArr, sortFunc);
                        }
                        if (history.serviceCd !== '*All') {
                            rows = rows.filter(item => item.svcCd === history.serviceCd);
                        }
                        if (history.siteId !== '*All') {
                            rows = rows.filter(item => item.siteId === history.siteId);
                        }
                        this.handleHistoryListItemClick('0', rows && rows[0]);
                    }
                });
            }, false);
        }
    }

    handleHistoryListItemClick = (value, rowData) => {
        let { history, selCert } = this.state;
        history.selectedIndex = value;
        let newLetterInfo = _.cloneDeep(this.props.newLetterInfo);
        let noOfCopy = 1;
        let pageStatus = CertEnum.PAGESTATUS.CERT_SELECTED;
        let certId = '';
        let printType = '';
        let certCdtm = '';
        let certVer = '';
        if (rowData) {
            newLetterInfo.letterTo = rowData.letterTo || '';
            newLetterInfo.letterDate = rowData.letterDate || null;
            newLetterInfo.subject = rowData.subject || '';
            newLetterInfo.content = rowData.content || '';
            newLetterInfo.yourRef1 = rowData.yourRef1 || '';
            newLetterInfo.yourRef2 = rowData.yourRef2 || '';
            newLetterInfo.attnGroup.hosptialClinicName = rowData.hcinstId || '';
            newLetterInfo.attnGroup.groupCd = rowData.groupCd || '';
            newLetterInfo.attnGroup.desc = rowData.letterAttn || '';
            noOfCopy = rowData.noOfCopy || 1;
            selCert.copyPage = noOfCopy;
            certId = rowData.id;
            printType = rowData.printType;
            certCdtm = moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            certVer = rowData.version;
        } else {
            newLetterInfo = _.cloneDeep(INITAL_STATE.newLetterInfo);
            pageStatus = CertEnum.PAGESTATUS.CERT_VIEWING;
        }
        selCert.certInfo = newLetterInfo;
        this.setState({
            pageStatus,
            certId,
            printType,
            history,
            certCdtm,
            certVer,
            selCert
        });
        this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
    }

    handleSaveprint = (closeTabFunc) => {
        this.props.updateField({ closeTabFunc: closeTabFunc || null });
        const formValid = this.refs.generalLetterForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                this.handlePrint('SP');
            } else {
                this.refs.generalLetterForm.focusFail();
            }
        });
    }

    handleSaveAndPreview = (closeTabFunc) => {
        this.props.updateField({ closeTabFunc: closeTabFunc || null });
        const formValid = this.refs.generalLetterForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                this.handlePreview('SP');
            } else {
                this.refs.generalLetterForm.focusFail();
            }
        });
    }

    handlePreview = (opType) => {
        const {
            copyPage
        } = this.props;
        const { pageStatus, history } = this.state;
        let params = this.getCertDto(opType);
        params = {
            ...params,
            opType: opType
        };

        this.props.getGeneralLetter(
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
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);
                        }, true);
                    });
                } else {
                    let { history } = this.state;
                    history.selectedIndex = '0';
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
        const formValid = this.refs.generalLetterForm.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.auditAction(AlsDesc.CERT_RE_PRINT);
                this.handlePrint('RP');
            } else {
                this.refs.generalLetterForm.focusFail();
            }
        });
    }

    handleDelete = () => {
        const { selectedIndex } = this.state.history;
        let { serviceArr } = this.state;
        const { generalLetterList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(generalLetterList || [], serviceArr, sortFunc);
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'ana');
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
                                history,
                                certCdtm,
                                certVer,
                                selCert
                            });
                            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
                        };
                        this.props.auditAction('Confirm Delete');
                        this.props.deleteGeneralLetter(cert.id, callback);
                    }
                }
            });
        }
    }

    handleClose = () => {
        const { pageStatus, history, selCert, serviceArr } = this.state;
        const { generalLetterList } = this.props;
        const sharedList = CertUtil.getShareSvcCertList(generalLetterList || [], serviceArr, sortFunc);
        const isDirty = this.checkCertIsDirty();
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            if (isDirty) {
                this.props.openCommonMessage({
                    msgCode: '110054',
                    btnActions: {
                        btn1Click: () => {
                            this.props.auditAction('Discard Changes', null, null, false, 'ana');
                            this.handleHistoryListItemClick(history.selectedIndex, sharedList[history.selectedIndex]);
                            this.setState({
                                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                            });
                        }
                    }
                });
            } else {
                this.setState({
                    pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                });
            }
        } else if (pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED) {
            this.props.auditAction('Cancel Certificate Selection', null, null, false, 'ana');
            history.selectedIndex = '';
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
                history,
                certCdtm,
                certVer,
                selCert
            });
            this.props.updateField({ newLetterInfo, copyPage: noOfCopy });
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'ana');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.generalLetter);
        }
    }

    // getAccessedServices = memoize((svcCd) => {
    //     let { clinicConfig, serviceList } = this.props;
    //     let targetArr = clinicConfig[Enum.CLINIC_CONFIGNAME.IS_SHARE_GENERAL_LETTER];
    //     let accessedServices = [];
    //     serviceList.forEach(service => {
    //         if (service.svcCd === svcCd) {
    //             accessedServices.push(service);
    //         } else {
    //             let shareFlag = targetArr.find(item => item.svcCd === service.svcCd);
    //             if (shareFlag && shareFlag.paramValue === '1') {
    //                 accessedServices.push(service);
    //             }
    //         }
    //     });
    //     return accessedServices;
    // });

    handleEditCert = () => {
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'ana');
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }

    checkCertIsDirty = () => {
        const { selCert } = this.state;
        let cmpInfo = _.cloneDeep(INITAL_STATE.newLetterInfo);
        let sourceInfo = _.cloneDeep(this.props.newLetterInfo);
        let copyPage1 = INITAL_STATE.copyPage;
        let copyPage2 = this.props.copyPage;
        if (selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        }
        cmpInfo = {
            ...cmpInfo,
            letterDate: cmpInfo.letterDate && moment(cmpInfo.letterDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        sourceInfo = {
            ...sourceInfo,
            letterDate: sourceInfo.letterDate && moment(sourceInfo.letterDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        if (this.state.certId) {
            const letterDto = this.props.generalLetterList.find(x => x.id == this.state.certId);
            copyPage1 = (letterDto && letterDto.noOfCopy) || 1;
        }
        return !CommonUtilities.isEqualObj(cmpInfo, sourceInfo) || parseInt(copyPage1) !== parseInt(copyPage2);
    }

    onListItemClickListener = (value, rowData) => {
        let certIsDirty = this.checkCertIsDirty();
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
            generalLetterList,
            allowCopyList,
            copyPage,
            clinicList
        } = this.props;

        const {
            history, pageStatus, serviceArr, previewDialogOpen, previewData
        } = this.state;

        const sharedList = CertUtil.getShareSvcCertList(generalLetterList || [], serviceArr, sortFunc);
        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;
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
                        id="generalLetter"
                        ref="historyListRef"
                        // data={generalLetterList}
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
                                                <Typography variant="body1">{`${item.encntrTypeDesc} / ${item.rmDesc}`}</Typography> : null
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
                        id="generalLetter_form"
                        ref={'generalLetterForm'}
                    >
                        <GeneralCertForm
                            id={'generalLetter_formInformation'}
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
                                        style: { display: isOtherServiceAndSite ? 'none' : '' },
                                        onClick: this.handleEditCert
                                    },
                                    {
                                        id: 'generalLetter_btnReprint',
                                        name: 'Reprint',
                                        style: { display: isOtherServiceAndSite ? 'none' : '' },
                                        onClick: this.handleReprint
                                    },
                                    {
                                        id: 'generalLetter_btnDelete',
                                        name: 'Delete',
                                        style: { display: isOtherServiceAndSite ? 'none' : '' },
                                        // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate)) ? 'none' : '' },
                                        onClick: this.handleDelete
                                    },
                                    {
                                        id: 'generalLetter_btnClose',
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
                                        id: 'generalLetter_btnSaveAndPreview',
                                        // name: 'Save & Print',
                                        name: 'Save & Preview',
                                        // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate)) ? 'none' : '' },
                                        onClick: () => { this.handleSaveAndPreview(); }
                                    },
                                    {
                                        id: 'generalLetter_btnSaveAndPrint',
                                        // name: 'Save & Print',
                                        name: 'Save & Print',
                                        // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate)) ? 'none' : '' },
                                        onClick: () => { this.handleSaveprint(); }
                                    },
                                    {
                                        id: 'generalLetter_btnCancel',
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
                            id={'generalLetter_pdfViewer'}
                            position={'vertical'}
                            previewData={previewData}
                        />
                    }
                    buttonConfig={
                        [
                            {
                                id: 'generalLetter_print',
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
                                id: 'generalLetter_close',
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
        allowCopyList: state.generalLetter.allowCopyList,
        copyPage: state.generalLetter.copyPage,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        generalLetterList: state.generalLetter.generalLetterList,
        handlingPrint: state.generalLetter.handlingPrint,
        newLetterInfo: state.generalLetter.newLetterInfo,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        clinicConfig: state.common.clinicConfig,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms
    };
};

const dispatchToProps = {
    updateField,
    resetAll,
    updateCurTab,
    getGeneralLetter,
    listGeneralLetter,
    deleteGeneralLetter,
    openCommonMessage,
    updateGeneralLetter,
    auditAction
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(GeneralLetter));