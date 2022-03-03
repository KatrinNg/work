import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import PatientPanel from '../views/compontent/patientPanel';
import PatientPanel2 from '../views/compontent/patientPanel2';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import {
    resetAll,
    getPatientCaseNo,
    listMajorKeyHistory,
    updatePatientEncntrCase
} from '../store/actions/patient/patientAction';
import {
    addTabs,
    refreshSubTabs,
    cleanSubTabs,
    changeTabsActive,
    deleteSubTabs,
    deleteTabs,
    cleanTabParams,
    updateTabs,
    updateField
} from '../store/actions/mainFrame/mainFrameAction';
import { selectCaseTrigger } from '../store/actions/caseNo/caseNoAction';
import CIMSMultiTabs from '../components/Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../components/Tabs/CIMSMultiTab';
import CIMSButton from '../components/Buttons/CIMSButton';
import CIMSeHRButton from '../components/EHR/CIMSeHRButton';
import CIMSeHRDialog from '../components/EHR/CIMSeHRDialog';
import * as CommonUtilities from '../utilities/commonUtilities';
import { CommonUtil, RegistrationUtil } from '../utilities';
import * as EHRUtilities from '../utilities/eHRUtilities';
// import PatientList from '../views/patientSpecificFunction/patientList';
import PatientList2 from '../views/patientSpecificFunction/patientList2';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { resetCondition, updatePatientListField } from '../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import Loadable from 'react-loadable';
import Loading from './component/loading';
import NotFound from './component/notfound';
import MaskContainer from './component/maskContainer';
import NotLiveRoute from 'react-live-route';
import ErrorBoundary from 'components/JErrorBoundary';
import Enum from '../enums/enum';
import accessRightEnum from '../enums/accessRightEnum';
import { getEHRIdentity, eHRIdentityOpenDialog } from '../store/actions/EHR/eHRAction';
import CIMSeHRIdentityButton from '../components/EHR/CIMSeHRIdentityButton';
import CIMSPromptDialog from '../components/Dialog/CIMSPromptDialog';
import CIMSTable from '../components/Table/CIMSTable';
import moment from 'moment';
import * as PatientUtil from '../utilities/patientUtilities';
import * as RegUtil from '../utilities/registrationUtilities';
import * as singleSpa from 'single-spa';
import doCloseFuncSrc from '../constants/doCloseFuncSrc';
import palette from '../theme/palette';
import CIMSDataGrid from '../components/Grid/CIMSDataGrid';
// import '../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import { resetAll as resetAnSvcIdInfo } from '../store/actions/anServiceID/anServiceID';
import * as UserUtilities from '../utilities/userUtilities';
import SupervisorsApprovalDialog from '../views/compontent/supervisorsApprovalDialog';
import { SHS_APPOINTMENT_GROUP } from '../enums/appointment/booking/bookingEnum';
import { goPrint } from '.././store/actions/common/commonAction';
import FamilyEncounterSearchDialog from '../views/patientSpecificFunction/component/familyMemberEncounter/FamilyEncounterSearchDialog';
import { auditAction } from '../store/actions/als/logAction';


const LiveRoute = withRouter(NotLiveRoute);

const styles = () => ({
    root: {
        height: '100%'
    },
    patientPanelRoot: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexFlow: 'column'
    },
    subTabRoot: {
        minHeight: 0,
        flexFlow: 'column nowrap',
        flexBasis: '100%',
        WebkitFlexBasis: '100%'
    },
    subContainerRoot: {
        flexBasis: '100%',
        WebkitFlexBasis: '100%',
        justifyContent: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 0
    },
    customTableBodyCell: {
        padding: 8,
        '&:last-child': {
            padding: 8
        }
    },
    updateIndentifierBtn: {
        margin: '-3px 0px 0px',
        padding: '4px 30px'
    },
    customSecondaryBtn: {
        color: palette.white,
        backgroundColor: '#c51162',
        border: 'solid 1px #e0417e',
        boxShadow: '2px 2px 2px #6e6e6e',
        '&:disabled': {
            border: 'solid 1px #e0e0e0'
        }
    }
});

class PMIRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return 'PMI';
    }
}

class DateRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { value } = this.props;
        return moment(value).format(Enum.DATE_FORMAT_24);
    }
}

class IndexPatient extends Component {
    constructor(props) {
        super(props);
        this.componentList = [];
        const { accessRights } = this.props;
        if (accessRights) {
            accessRights
                .filter(item => (
                    item.type === Enum.ACCESS_RIGHT_TYPE.FUNCTION
                    || item.type === Enum.ACCESS_RIGHT_TYPE.CODE_ACCESS
                )
                    && item.isPatRequired === 'Y')
                .forEach(right => {
                    this.componentList.push({
                        name: right.name,
                        path: right.path,
                        componentParams: right.componentParams,
                        component: ErrorBoundary(Loadable({
                            // loader: () => import(/* webpackChunkName: "[request]" */`../views${accessRightList[i].componentPath}`),
                            loader: () => import(`../views${right.path}`),
                            loading: Loading
                        }))
                    });
                });
        }

        this.eHRButtonInfo = {
            label: 'eHRSS Registered',
            name: accessRightEnum.eHRRegistered,
            path: '/eHR/eHRRegistration',
            isPatRequired: 'Y'
        };
        this.componentList.push({
            name: accessRightEnum.eHRRegistered,
            path: '/eHR/eHRRegistration',
            component: Loadable({
                // loader: () => import(/* webpackChunkName: "[request]" */`../views${accessRightList[i].componentPath}`),
                loader: () => import(`../views${'/eHR/eHRRegistration'}`),
                loading: Loading
            })
        });

        this.state = {
            messageDialogIndex: 0,
            ViewLogOpenFlag: false,
            ReminderOpenFlag: false,
            viewLogTableRows: [
                { name: 'engSurname', label: 'Surname', width: 100 },
                { name: 'engGivename', label: 'Given Name', width: 100 },
                { name: 'nameChi', label: 'Chinese Name', width: 100 },
                { name: 'genderCd', label: 'Sex', width: 80 },
                {
                    name: 'dob', label: 'D.O.B.', width: 100, customBodyRender: (value, rowData) => {
                        return RegUtil.getDobDateByFormat(rowData.exactDobCd, value);
                    }
                },
                {
                    name: 'docTypeCd', label: 'Document Type', width: 150, customBodyRender: (value) => {
                        let documentObj = this.props.codeList && this.props.codeList.doc_type && this.props.codeList.doc_type.filter(item => item.code == value);
                        let docTypeName = documentObj && documentObj[0] && documentObj[0].engDesc;
                        return docTypeName;
                    }
                },
                {
                    name: 'docNo', label: 'Document No.', width: 150, customBodyRender: (value, rowData) => {
                        let docNo = value;
                        if (PatientUtil.isHKIDFormat(rowData.docTypeCd)) {
                            docNo = RegUtil.hkidFormat(docNo);
                        }
                        return docNo;
                    }
                },
                { name: 'updatedDtm', label: 'Created / Updated On', width: 100, customBodyRender: (value) => { return moment(value, Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK).format(Enum.DATE_FORMAT_24_HOUR); } },
                {
                    name: 'updatedClinicCd', label: 'Clinic', width: 200, customBodyRender: (value, rowData) => {
                        let clinicObj = this.props.clinicList && this.props.clinicList.filter(item => item.clinicCd == value);
                        let clinicName = (clinicObj && clinicObj[0] && clinicObj[0].clinicName) || '';
                        // hardcode 'HITO' to 'Data Migration from CIMS-1'
                        if ('HITO' === value && (rowData.cims1ActionType > '')) {
                            clinicName = 'Data Migration from CIMS-1';
                        } else if ('HITO' === value){
                            clinicName = 'HITO';
                        } else if ('IRS' === value) {
                            clinicName = 'System';
                        }
                        return clinicName;
                    }
                }
            ],
            viewLogTableOptions: {
                rowExpand: true,
                rowHover: true,
                bodyCellStyle: this.props.classes.customTableBodyCell,
                rowsPerPage: 10,
                rowsPerPageOptions: [10, 15, 20]
            },
            approvalDialogParams:{
                isOpen:false,
                staffId:''
            }
        };

        this.isUseCaseNo = CommonUtilities.isUseCaseNo();
    }

    componentDidUpdate(prevProps) {
        // this.caseNoWork();
        this.majorKeyWork(prevProps);
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.props.resetAnSvcIdInfo();
    }

    // caseNoWork = () => {
    //     const { patientInfo, caseNoInfo, openSelectCase } = this.props;
    //     if (patientInfo) {
    //         if (!caseNoInfo.caseNo && openSelectCase === Enum.CASE_SELECTOR_STATUS.CLOSE) {
    //             let activeCaseList = (patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)) || [];
    //             if (activeCaseList.length === 1) {
    //                 this.props.getPatientCaseNo(patientInfo.caseList, activeCaseList[0]['caseNo']);
    //             } else if (activeCaseList.length > 1) {
    //                 this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.OPEN, selectCaseList: activeCaseList });
    //             }
    //         }
    //     } else {
    //         this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.CLOSE });
    //     }
    // }

    majorKeyWork = (prevProps) => {
        const { patientInfo } = this.props;
        if (patientInfo) {
            let prePatientKey = prevProps.patientInfo && prevProps.patientInfo.patientKey;
            let nextPatientKey = patientInfo.patientKey;
            if (nextPatientKey && (prePatientKey !== nextPatientKey)) {
                this.props.listMajorKeyHistory(nextPatientKey);
            }
        }
    }

    handleChangeTab = (e, newValue) => {
        this.props.changeTabsActive(2, newValue);
    };

    handleDeleteTab = (e, item) => {
        let unmountSubTabSpa = () => {
            const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired === 'Y' && spa.accessRightCd === item.name; });
            if (spaList) {
                const spaId = CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath);
                if (singleSpa.getAppStatus(spaId) === 'MOUNTED')
                    singleSpa.unloadApplication(spaId);
            }
        };
        if (typeof item.doCloseFunc === 'function') {
            let doCloseParams = { ...item.doCloseParams, src: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON };
            this.props.updateTabs({ [item.name]: { doCloseParams: doCloseParams } });
            let colseTabsAction = (success) => {
                if (success) {
                    this.props.deleteSubTabs(item.name);
                    unmountSubTabSpa();
                }
            };
            item.doCloseFunc(colseTabsAction, doCloseParams);
        }
        else {
            this.props.deleteSubTabs(item.name);
            unmountSubTabSpa();
        }
    };

    nextPatientCallback() {
        this.props.resetAll();
        this.props.resetAnSvcIdInfo();
        this.handleDefaultAttnStatus();
    }

    isValidShsPeriodByParams = (siteParams, encounterDate) => {
        if (!siteParams) return;
        const arr = siteParams.split(';');
        if (_.isEmpty(arr) || arr.length < 3) return;
        let year = arr[0][0];
        let month = arr[1][0];
        let day = arr[2][0];
        const validDate = moment().add({ years: -year, months: -month, days: -day }).format(Enum.DATE_FORMAT_EYMD_VALUE);
        let result = 'Active';
        if (moment(moment(encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE)).isBefore(moment(validDate))) result = 'Inactive';
        return result;
    };

    getCaseStatus = (encounterInfo) => {
        // const { siteParams = {} } = this.props.siteParams;
        const shsSkinSiteParams = this.props.siteParams['SHS_SKIN_ENCNTR_CASE_VALID_PERIOD'];
        const latestEntInfo = encounterInfo;
        let caseStatus;
        if (!latestEntInfo) return null;
        if (latestEntInfo.isClose) {
            caseStatus = 'Close';
            return caseStatus;
        } else {
            let shsSkinSiteParamValue = '1Y;0M;1D';
            if(shsSkinSiteParams && shsSkinSiteParams[0]){
                shsSkinSiteParamValue = shsSkinSiteParams[0].paramValue;
            }
            caseStatus = this.isValidShsPeriodByParams(shsSkinSiteParamValue, latestEntInfo.sdt);
            return caseStatus;
        }
    };
    //get case status end

    goAction() {
        const goActionCallback = () => {
            this.nextPatientCallback();
        };
        const goEsPrint = this.props.goEsPrint;
        const goPrint = this.props.goPrint;
        const openCommonMessage = this.props.openCommonMessage;
        if (!goEsPrint) {
            this.nextPatientCallback();
        } else {
            const { esGetPreviewfunction, paperSizeValue } = goEsPrint;
            let encounterInfo = this.props.patient.encounterInfo;

            let shsInfo = this.props.shsInfo;
            if(shsInfo && shsInfo.skinLatestEncounterInfo && encounterInfo.encounterId === shsInfo.skinLatestEncounterInfo.encntrId){
                goEsPrint.caseSts = this.getCaseStatus(shsInfo.skinLatestEncounterInfo);
            }else {
                goEsPrint.caseSts = this.getCaseStatus(encounterInfo);
            }

            if (esGetPreviewfunction) {
                delete goEsPrint.esGetPreviewfunction;
            }
            delete goEsPrint.paperSizeValue;
            if (!goEsPrint.encounterId) {
                goActionCallback();
            } else {
                new Promise((res, rej) => {
                    esGetPreviewfunction(goEsPrint, res, rej, true);
                }).then(resData => {
                    let windowPrint = () => {
                        CommonUtil.windowPrint(resData.reportBase64);
                    };
                    resData.windowPrint = windowPrint;
                    let printParams = {
                        base64: resData.reportBase64,
                        isFitPage: true,
                        paperSize: paperSizeValue === 'A4' ? '-1' : '-2',
                        isShrinkPage: true,
                        windowPrint: windowPrint
                    };
                    printParams.windowPrint = resData.windowPrint;
                    const disCcpList = this.props.siteParams.DISABLE_ENCOUNTER_SUMMARY_CCP;
                    if (disCcpList && disCcpList.length > 0) {
                        for (let i = 0; i < disCcpList.length; i++) {
                            if (this.props.login.loginForm.siteId === disCcpList[i].siteId && disCcpList[i].paramValue === 'Y') {
                                windowPrint();
                                return;
                            }
                        }
                    }
                    goPrint(printParams, goActionCallback);
                }, rejData => {
                    openCommonMessage({
                        msgCode: '115030',
                        params: [
                            {
                                name: 'CAUSE',
                                value: rejData.errorMsg
                            }
                        ]
                    });
                });
            };
        }
        // to-do GO button action, after finished call nextPatientCallback
        // ...
        // goActionCallback();
    }

    handleNextPatient = (isGO = false) => {
        const { subTabs, deleteTabs, deleteSubTabs, changeTabsActive } = this.props;//NOSONAR
        let tabList = _.cloneDeep(subTabs);
        let delFunc = (deep, name) => {
            if (parseInt(deep) === 2) {
                deleteSubTabs(name);
            } else if (parseInt(deep) === 1) {
                deleteTabs(name);
            }
        };
        this.props.updateField({
            curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
        });
        CommonUtilities.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON).then(result => {
            if (result) {
                if (isGO)
                    this.goAction();
                else
                    this.nextPatientCallback();
            }
            this.props.updateField({
                curCloseTabMethodType: null
            });
        });
    };

    handleViewLogOpen = () => {
        this.setState({
            ViewLogOpenFlag: true
        });
    }

    handleReminderOpen = () => {
        this.setState({
            ReminderOpenFlag: true
        });
    }

    getReminderRecords = (pmiPersRemarkList) => {
        let reminderRecords = [];
        if (pmiPersRemarkList) {
            reminderRecords = pmiPersRemarkList.filter(item => RegistrationUtil.isPmiPersRemarkActive(item, this.props.serviceCd, this.props.clinicCd));
            reminderRecords = reminderRecords.sort((a, b) => moment(b.createDtm).diff(moment(a.createDtm)));
        }
        return reminderRecords;
    }

    handleDefaultAttnStatus = () => {
        let filterCondition = {
            encounterTypeCd: '',
            subEncounterTypeCd: '',
            patientKey: ''
        };
        let defaultAttnStatusCd = CommonUtil.getDefaultAttnStatusCd();
        filterCondition.attnStatusCd = defaultAttnStatusCd;
        this.props.updatePatientListField({ filterCondition: filterCondition });
    }

    handleUpdateApprovalDialogParams = (name, value) => {
        let params = _.cloneDeep(this.state.approvalDialogParams);
        params[name] = value;
        this.setState({
            approvalDialogParams: params
        });

    }

    resetApprovalDialogParams = () => {
        this.setState({
            approvalDialogParams: {
                isOpen: false,
                staffId: ''
            }
        });
    }

    handleCloseEncounterInfo = () => {
        const { patientInfo } = this.props;
        const { approvalDialogParams } = this.state;
        const params = {
            patientKey: patientInfo.patientKey,
            sspecId: SHS_APPOINTMENT_GROUP.SKIN_GRP,
            isClose: true,
            approverId: approvalDialogParams.staffId
        };
        this.props.updatePatientEncntrCase(params,()=>{
            this.resetApprovalDialogParams();
        });
    }

    render() {
        const {
            classes, serviceCd, patientInfo, subTabs, getEHRIdentity, eHRIdentityOpenDialog, //NOSONAR
            eHRId, maskFunctions, loginName, pcName, ipAddr, correlationId, clinicConfig, //NOSONAR
            patientEncounterId
        } = this.props;

        const { approvalDialogParams } = this.state;

        let isOpenPanel = false;
        if (patientInfo && patientInfo.patientKey) {
            // if (caseNoInfo.caseNo || (patientInfo.caseList||[]).filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE).length === 0) {
            //     isOpenPanel = true;
            //     this.props.updatePatientListField({ isFocusSearchInput: true });
            // }
            isOpenPanel = true;
        }

        let isEHRSSRegistered = EHRUtilities.isEHRSSRegistered(patientInfo);

        // // TODO : Add the ehruId check in accessRights
        let isEHRAccessRight = EHRUtilities.isEHRAccessRight(eHRId);

        let isIdentityPatient = EHRUtilities.isIdentityPatient(patientInfo);

        // eHR Patient isMatch == '3'
        let isIdentityPatientInCIMS = EHRUtilities.isIdentityPatientInCIMS(patientInfo);

        let hkid = EHRUtilities.getPatientHkidPair(patientInfo);

        let documentPair = EHRUtilities.getPatientNonHkicPair(patientInfo);

        let reminderRecords = this.getReminderRecords((patientInfo && patientInfo.pmiPersRemarkList) || []);
        let eHRInputParams = {
            als: {
                clientIp: ipAddr,
                correlationId: correlationId,
                userId: loginName,
                workstationId: pcName
            },
            identityList: [
                {
                    ehrNo: patientInfo && patientInfo.patientEhr ? patientInfo.patientEhr.ehrNo : '',
                    hkId: hkid ? hkid : '',
                    identityDocumentNo: documentPair.docNo,
                    typeOfIdentityDocument: documentPair.docTypeCd
                }
            ],
            serviceId: serviceCd
        };

        return (
            <Grid className={classes.root}>
                {
                    isOpenPanel ?
                        <Grid className={classes.patientPanelRoot}>
                            {!(clinicConfig.PATIENT_BANNER_TYPE && clinicConfig.PATIENT_BANNER_TYPE[0]) || clinicConfig.PATIENT_BANNER_TYPE[0].paramValue === '1' ?
                                (
                                    <PatientPanel>
                                        <CIMSButton
                                            id="indexPatient_patientPanel_reminder"
                                            onClick={this.handleReminderOpen}
                                            color={'secondary'}
                                            disabled={(this.getReminderRecords((patientInfo && patientInfo.pmiPersRemarkList) || [])).length === 0}
                                            classes={{ sizeSmall: classes.updateIndentifierBtn }}
                                            className={classes.customSecondaryBtn}
                                        >{'REMINDER'}</CIMSButton>
                                        <CIMSButton
                                            id="indexPatient_patientPanel_viewlog"
                                            onClick={this.handleViewLogOpen}
                                        >{'View Log'}</CIMSButton>
                                        {// If Check db ACCESS_RIGHT [eHRSS Registered button(B150)] for use userRoleStatus.menuBK
                                            this.eHRButtonInfo && isEHRSSRegistered && isIdentityPatient && isIdentityPatientInCIMS ? (
                                                <CIMSeHRIdentityButton
                                                    key={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                                    label={(this.eHRButtonInfo && this.eHRButtonInfo.label ? this.eHRButtonInfo.label : '')}
                                                    name={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                                    eHRTabInfo={this.eHRButtonInfo}
                                                    onClick={getEHRIdentity}
                                                    inputParams={{
                                                        als: {
                                                            clientIp: ipAddr,
                                                            correlationId: correlationId,
                                                            userId: loginName,
                                                            workstationId: pcName
                                                        },
                                                        identityList: [
                                                            {
                                                                ehrNo: patientInfo.patientEhr.ehrNo,
                                                                hkId: hkid ? hkid : '',
                                                                identityDocumentNo: documentPair.docNo,
                                                                typeOfIdentityDocument: documentPair.docTypeCd
                                                            }
                                                        ],
                                                        serviceId: serviceCd
                                                    }}
                                                    isEHRSSRegistered={isEHRSSRegistered}
                                                    isEHRAccessRight={isEHRAccessRight}
                                                />
                                            ) : (
                                                <CIMSeHRButton
                                                    key={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                                    label={(this.eHRButtonInfo && this.eHRButtonInfo.label ? this.eHRButtonInfo.label : '')}
                                                    name={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                                    eHRTabInfo={this.eHRButtonInfo}
                                                    subTabs={subTabs}
                                                    onClick={this.props.addTabs}
                                                    refreshSubTabs={this.props.refreshSubTabs}
                                                    cleanSubTabs={this.props.cleanSubTabs}
                                                    isEHRSSRegistered={isEHRSSRegistered}
                                                    isEHRAccessRight={isEHRAccessRight}
                                                />
                                            )
                                        }
                                        <CIMSButton
                                            id="indexPatient_patientPanel_nextPatient"
                                            onClick={this.handleNextPatient}
                                        >{`Next ${CommonUtilities.getPatientCall()}`}</CIMSButton>
                                    </PatientPanel>
                                ) : (
                                    <PatientPanel2
                                        onNextPatient={this.handleNextPatient}
                                        onViewLogOpen={this.handleViewLogOpen}
                                        onReminderOpen={this.handleReminderOpen}
                                        onCloseCaseClick={()=>this.handleUpdateApprovalDialogParams('isOpen', true)}
                                    />
                                )}
                            <Grid container className={classes.subTabRoot}>
                                <Grid item container>
                                    <CIMSMultiTabs
                                        value={this.props.subTabsActiveKey}
                                        onChange={this.handleChangeTab}
                                    >
                                        {subTabs.map((item) => (
                                            <CIMSMultiTab
                                                disabled={this.props.isOpenReview}
                                                key={item.name}
                                                label={item.label}
                                                value={item.name}
                                                onClear={e => this.handleDeleteTab(e, item)}
                                            />
                                        ))}
                                    </CIMSMultiTabs>
                                </Grid>
                                <Grid item container className={classes.subContainerRoot}>
                                    <LiveRoute path={`/index/${accessRightEnum.patientSpec}`}>
                                        <Grid style={{ textAlign: 'center', fontSize: '16pt', padding: 41, display: this.props.subTabs.length > 0 ? 'none' : null }}>
                                            {`Please select a ${CommonUtilities.getPatientCall()}-specific function.`}
                                        </Grid>
                                    </LiveRoute>
                                    {
                                        subTabs.map(item => {
                                            const asyncComp = this.componentList.find(i => i.name === item.name);
                                            const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired === 'Y' && spa.accessRightCd === item.name; });
                                            if (spaList) {
                                                const spaId = CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaEntryPath);
                                                return <Grid item container key={spaId} id={spaId} style={{ 'display': this.props.subTabsActiveKey === item.name ? 'block' : 'none', 'height': '100%' }}></Grid>;
                                            }
                                            return asyncComp ?
                                                <MaskContainer
                                                    key={asyncComp.name}
                                                    loading={maskFunctions.findIndex(i => i === asyncComp.name) > -1}
                                                    functionCd={asyncComp.name}
                                                    activeFuncCd={this.props.subTabsActiveKey}
                                                >
                                                    <LiveRoute
                                                        exact
                                                        alwaysLive
                                                        key={asyncComp.name}
                                                        path={`/index/${accessRightEnum.patientSpec}/${asyncComp.name}`}
                                                        children={(props) => <asyncComp.component {...props} functionCd={asyncComp.name} />}
                                                    />
                                                </MaskContainer>
                                                :
                                                <LiveRoute
                                                    exact
                                                    alwaysLive
                                                    key={item.name}
                                                    path={`/index/${accessRightEnum.patientSpec}/${item.name}`}
                                                    component={NotFound}
                                                />;
                                        })
                                    }
                                </Grid>
                            </Grid>
                        </Grid> : <PatientList2 functionCd={this.props.functionCd} />
                }
                <CIMSeHRDialog
                    isOpenEHRIdentityDialog={this.props.openEHRIdentityDialog && isIdentityPatient}
                    existingInformation={patientInfo}
                    getEHRIdentity={getEHRIdentity}
                    eHRInputParams={eHRInputParams}
                />
                <CIMSPromptDialog
                    open={this.state.ViewLogOpenFlag}
                    id={'ViewLog'}
                    dialogTitle={'View Log'}
                    paperStyl={this.props.classes.paper}
                    dialogContentText={
                        <Grid container className={classes.marginTop20}>
                            <CIMSTable
                                id={'viewLog_table'}
                                innerRef={ref => this.tableRef = ref}
                                rows={this.state.viewLogTableRows}
                                options={this.state.viewLogTableOptions}
                                data={this.props.majorKeyChangeHistoryList}
                                tableStyles={{
                                    height: 540
                                }}
                                splitGridStyles={{
                                    height: 560
                                }}
                            />
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: 'viewLog_close',
                                name: 'Close',
                                onClick: () => {
                                    this.props.auditAction('Close view log dialog', null, null, false);
                                    this.setState({ ViewLogOpenFlag: false });
                                }
                            }
                        ]
                    }
                />
                <CIMSPromptDialog
                    open={this.state.ReminderOpenFlag}
                    id={'Reminder'}
                    dialogTitle={'Reminder'}
                    dialogContentText={
                        <Grid container>
                            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                                <CIMSDataGrid
                                    ref={ref => this.refGrid = ref}
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '1320px',
                                        height: '200px',
                                        display: 'block'
                                    }}
                                    gridOptions={{
                                        columnDefs: [
                                            { headerName: 'Message Type', field: 'msgType', minWidth: 140, cellRenderer: 'PMIRender' },
                                            { headerName: 'Message Content', field: 'remark', minWidth: 480 },
                                            { headerName: 'Updated User', field: 'updateBy', minWidth: 150, width: 300 },
                                            { headerName: 'Updated Date', field: 'updateDtm', minWidth: 150, cellRenderer: 'DateRender' },
                                            { headerName: 'Created User', field: 'createBy', minWidth: 150, width: 300 },
                                            { headerName: 'Created Date', field: 'createDtm', minWidth: 150, cellRenderer: 'DateRender' }
                                        ],
                                        rowData: reminderRecords,
                                        getRowNodeId: data => data.id,
                                        getRowHeight: params => 50,
                                        frameworkComponents: {
                                            PMIRender: PMIRender,
                                            DateRender: DateRender
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: 'reminder_close',
                                name: 'Close',
                                onClick: () => {
                                    this.props.auditAction('Close reminder dialog', null, null, false);
                                    this.setState({ ReminderOpenFlag: false });
                                }
                            }
                        ]
                    }
                />
                <FamilyEncounterSearchDialog encounterId={patientEncounterId} />
                {
                    serviceCd === 'SHS' ?
                        approvalDialogParams.isOpen ?
                            <SupervisorsApprovalDialog
                                //searchString={this.props.supervisorsApprovalDialogInfo.searchString}
                                title={'The case will be closed.'}
                                confirm={this.handleCloseEncounterInfo}
                                handleCancel={() => this.handleUpdateApprovalDialogParams('isOpen', false)}
                                handleChange={(value) => this.handleUpdateApprovalDialogParams('staffId', value)}
                                resetApprovalDialog={this.resetApprovalDialogParams}
                                supervisorsApprovalDialogInfo={approvalDialogParams}
                            /> : null
                        : null
                }
            </Grid >
        );
    }
}

function mapStateToProps(state) {
    return {
        patient: state.patient,
        patientInfo: state.patient.patientInfo,
        caseNoInfo: state.patient.caseNoInfo,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        subTabs: state.mainFrame.subTabs,
        accessRights: state.login.accessRights,
        loginName: state.login.loginInfo.loginName,
        correlationId: state.login.loginInfo.correlationId,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        //list spa function start
        common: state.common,
        spaList: state.common.spaList,
        //list spa function end
        tabs: state.mainFrame.tabs,
        maskFunctions: state.mainFrame.maskFunctions,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        openSelectCase: state.caseNo.openSelectCase,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        isOpenReview: state.registration.isOpenReview,
        openEHRIdentityDialog: state.ehr.openEHRIdentityDialog,
        ehr: state.ehr,
        eHRId: state.login.loginInfo && state.login.loginInfo.eHRId,
        majorKeyChangeHistoryList: state.patient.majorKeyChangeHistoryList,
        clinicList: state.common.clinicList,
        codeList: state.common.commonCodeList,
        clinicConfig: state.common.clinicConfig,
        siteId: state.login.clinic.siteId,
        loginInfo: state.login.loginInfo,
        shsInfo:state.patient.shsInfo,
        goEsPrint: state.mainFrame.goEsPrint,
        siteParams: state.common.siteParams,
        login: state.login,
        patientEncounterId: state.patient.encounterInfo.encounterId
    };
}

const dispatchProps = {
    addTabs,
    refreshSubTabs,
    cleanSubTabs,
    changeTabsActive,
    deleteSubTabs,
    resetAll,
    openCommonMessage,
    resetCondition,
    deleteTabs,
    cleanTabParams,
    updatePatientListField,
    selectCaseTrigger,
    getPatientCaseNo,
    getEHRIdentity,
    listMajorKeyHistory,
    eHRIdentityOpenDialog,
    updateTabs,
    updateField,
    resetAnSvcIdInfo,
    updatePatientEncntrCase,
    goPrint,
    auditAction
};

export default withRouter(connect(mapStateToProps, dispatchProps)(withStyles(styles)(IndexPatient)));
