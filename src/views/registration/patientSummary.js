import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Grid, Link, Typography, Box, FormControlLabel, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CIMSTextField from '../../components/TextField/CIMSTextField';
import CIMSMultiTextField from '../../components/TextField/CIMSMultiTextField';
import CIMSButton from '../../components/Buttons/CIMSButton';
import AutoScrollTable from '../../components/Table/AutoScrollTable';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import _ from 'lodash';
import Enum, { EHS_CONSTANT, SERVICE_CODE } from '../../enums/enum';
import memoize from 'memoize-one';
import * as commonUtilities from '../../utilities/commonUtilities';
import { AppointmentUtil, RegistrationUtil } from '../../utilities';
import ContactInformationEnum from '../../enums/registration/contactInformationEnum';
import accessRightEnum from '../../enums/accessRightEnum';
import PatientSummaryShortcutPanel from './patientSummaryShortcutPanel';

import { openCaseNoDialog, updateState as updateCaseNoState } from '../../store/actions/caseNo/caseNoAction';
import {
    getPatientById as getPatientPanelPatientById,
    resetAll,
    printPatientGumLabel,
    listAppointmentHistory,
    updateState,
    getViewLogList,
    refreshPatient,
    printPatientSpecimenLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    getPatientBannerData
} from '../../store/actions/patient/patientAction';
import DtsEncounterHistoryDialog from '../dts/pmi/components/DtsEncounterHistoryDialog'; //DH Anthony
import DtsPrintChangeFormDialog from '../dts/pmi/components/DtsPrintChangeFormDialog'; //DH Miki
import DtsPrintPmiAddressFormDialog from '../dts/pmi/components/forms/DtsPatientInformationForm'; //DH Miki
import { patientSummaryEditPatient } from '../../store/actions/registration/registrationAction';
import { skipTab, addTabs, deleteSubTabs, updateField as updateMainFrame, changeTabsActive } from '../../store/actions/mainFrame/mainFrameAction'; // DH Anthony
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';
import ApptDetails from './component/apptDetails';
import { Build, ContactMail, ContactPhone, ExpandMore, FolderShared, History, HorizontalSplit, MeetingRoom, Print } from '@material-ui/icons';
import { getAppointmentReport, getSppApptSlipReport, checkApptWithEncntrCaseStatus } from '../../store/actions/appointment/booking/bookingAction';
// import * as AppointmentUtil from '../../utilities/appointmentUtilities';
import * as CaseNoUtil from '../../utilities/caseNoUtilities';
import { SiteParamsUtil } from '../../utilities';
import moment from 'moment';

import { getCodeList } from '../../store/actions/common/commonAction';
import { codeList } from '../../constants/codeList';

import { ecsSelector, ocsssSelector, mwecsSelector, patientInfoSelector, patientKeySelector } from '../../store/selectors/ecsSelectors';
import {
    refreshServiceStatus,
    openMwecsDialog,
    checkMwecs,
    checkEcs,
    openEcsDialog,
    openOcsssDialog,
    setMwecsPatientStatus,
    checkOcsss,
    setOcsssPatientStatus,
    setEcsPatientStatus
} from '../../store/actions/ECS/ecsAction';
import * as EcsUtilities from '../../utilities/ecsUtilities';
import EcsResultTextField from 'components/ECS/Ecs/EcsResultTextField';
import OcsssResultTextField from 'components/ECS/Ocsss/OcsssResultTextField';
import MwecsResultTextField from 'components/ECS/Mwecs/MwecsResultTextField';
import MwecsMessageIdTextField from 'components/ECS/Mwecs/MwecsMessageIdTextField';

import ApptAssociationConfirmDialog from './apptAssociationConfirmDialog';
import { updatePmiData, anonymousAppointmentPmiLinkage, logShsEncntrCase } from '../../store/actions/appointment/booking/bookingAction';

import ClinicalDoc from './component/miscellaneous/clinicalDoc';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { REDIRECT_ACTION_TYPE } from '../../enums/dts/patient/DtsPatientSummaryEnum'; //DH Anthony
import { setRedirect, dtsGetPmiLabel, dtsUpdateState, dtsOpenPreviewWindow, dtsSetAddressLabel, dtsGetDH65Label, dtsGetEncounterHistory } from '../../store/actions/dts/patient/DtsPatientSummaryAction'; //DH Anthony
import DtsPrintPmiBarcodeDialog from '../dts/pmi/components/DtsPrintPmiBarcodeDialog'; //DH Anthony
import DtsPrintDH65LabelDialog from '../dts/pmi/components/DtsPrintDH65LabelDialog'; //DH Miki

import ViewLogDialog from './component/viewLogDialog';

import * as ecsActionType from '../../store/actions/ECS/ecsActionType';
import * as PatientUtil from '../../utilities/patientUtilities';
import { auditAction } from '../../store/actions/als/logAction';
import doCloseFuncSrc from '../../constants/doCloseFuncSrc';
import {
    checkPatientSvcExist
} from '../../store/actions/appointment/booking/bookingAction';
import { checkAppEncntrCaseStatusBeforeBook } from '../../utilities/appointmentUtilities';
import { getCodeDescriptionByCategory, getCodeDescriptionByCodeId } from '../../utilities/dtsUtilities';
import { getDeliveryHospital, getCaseStsChangeRsns } from '../../store/actions/anServiceID/anServiceID';
import { pageSts as antSvcInfoPageSts } from '../../enums/anSvcID/anSvcIDEnum';
import CIMSPdfViewer from '../../components/PDF/CIMSPdfViewer';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import { print } from '../../utilities/printUtilities';
import AnServiceIDDialog from '../../views/compontent/anServiceIDDialog';
import OtherAppointmentDetails from './component/otherApptDetails/otherApptDetails';
import OtherAppointmentDetailsLog from './component/otherApptDetails/otherApptDetailsLogDialog';
import EditAppointmentDetailsDialog from './component/otherApptDetails/editOtherApptDetailsDialog';
import SelectEncntrGrpDialog from '../../views/compontent/selectEncntrGrpDialog';
import UnexpectedEnctrApprlDialog from '../../views/appointment/booking/component/bookDialog/unexpectedEnctrApprlDialog';
import { curANSvcIdIsActive } from '../../utilities/anSvcIdUtilities';
import { listOtherAppointmentDetail, listOtherAppointmentDetailLog } from '../../store/actions/appointment/otherAppointmentDetails/otherAppointmentDetails';
import { caseSts } from '../../enums/anSvcID/anSvcIDEnum';
import { UNEXPECTED_ACTION_TYPE } from '../../enums/appointment/booking/bookingEnum';
import { dispatch } from '../../store/util';
import * as patientActionType from '../../store/actions/patient/patientActionType';
import LabelButton from '../compontent/labelButton';
import MenuButton from '../../components/Buttons/MenuButton';
import ScreeningInfoDialog from './component/ScreeningInfoDialog';
import { fetchScreeningInfo } from '../../store/actions/registration/registrationAction';



const useStyles1 = makeStyles(theme => ({
    titleContainer: {
        height: 20
    },
    title: {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        fontFamily: 'Arial,MingLiU,Helvertica,Sans-serif,Arial Unicode MS',
        fontSize: '1rem'
    },
    container: {
        border: `1px solid ${theme.palette.grey[500]}`
    },
    tableContainer: {
        height: 'unset',
        minHeight: 70
        // maxHeight: 100
    },
    tableRowRoot: {
        height: 'unset'
    },
    headerTop: {
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
    },
    formControlLabelRoot: {
        marginLeft: 11,
        marginBottom: 0
    },
    formControlLabelLabel: {
        color: theme.palette.primary.main,
        fontWeight: 'bold'
    },
    checkBox: {
        padding: 4
    },
    headButton: {
        fontSize: 16
    },
    dialogPaper: {
        width: '80%'
    }
}));

const BlockInfo = props => {
    const classes = useStyles1();
    const { title, id, children, noBorder, handleOnEdit,showLog,handleOpenLog,comDisable, isReadOnly } = props;
    return (
        <Grid container>
            <Grid item container justify="space-between" className={classes.titleContainer}>
                <Grid item className={classes.title}>
                    {title}
                </Grid>
                <Grid item container xs={6} justify={'flex-end'}>
                    <Grid item>
                        {showLog ?
                            <Link
                                id={`${id}_logLink`}
                                component="button"
                                variant="body2"
                                className={classes.headButton}
                                onClick={handleOpenLog}
                                style={{
                                    color: comDisable ? 'gray' : '#0579c8',
                                    cursor: comDisable ? 'default' : 'pointer'
                                }}
                                underline={comDisable ? 'none' : 'hover'}
                            >
                                Log
                        </Link>
                            : null}
                        {showLog && !isReadOnly ?
                            <Typography component="span" variant="body2">
                                {' '}|{' '}
                            </Typography>
                            : null}
                        {!isReadOnly ?
                            <Link
                                id={`${id}_editLink`}
                                component="button"
                                variant="body2"
                                className={classes.headButton}
                                onClick={handleOnEdit}
                                style={{
                                    color: comDisable ? 'gray' : '#0579c8',
                                    cursor: comDisable ? 'default' : 'pointer'
                                }}
                                underline={comDisable ? 'none' : 'hover'}
                            >
                                Edit
                        </Link>
                        : null}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item container className={`${noBorder ? '' : classes.container}`}>
                {children}
            </Grid>
        </Grid>
    );
};

const CaseNoBlock = props => {
    const classes = useStyles1();
    const [caseState, setCaseState] = useState({
        isShowClosedCase: false,
        selectIndex: [],
        selectedCaseNo: '',
        alias: '',
        selectedSts:''
    });
    const {
        patientInfo,
        caseNoInfo,
        getPatientPanelPatientById,
        openCaseNoDialog,
        id,
        openCommonMessage,
        antSvcInfo,
        encntrGrpList,
        aliasRule,
        isReadOnly
    } = props;//NOSONAR
    const genCaseNoAction = CaseNoUtil.genPMICaseNoAction(patientInfo);
    const isPmiCaseWithEnctrGp= CaseNoUtil.pmiCaseWithEnctrGrpVal();
    const isPMICaseNoAliasGen = CaseNoUtil.pmiCaseNoAliasGenSiteVal();
    const activeCaseList=patientInfo&&patientInfo.caseList?patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE):[];

    const handleTableRowClick = (e, row, index) => {
        if (caseState.selectIndex.indexOf(index) > -1) {
            setCaseState({
                ...caseState,
                selectIndex: [],
                selectedCaseNo: '',
                selectAlias: '',
                selectEncntrGrpCd:'',
                selectedSts:''
            });
        } else {
            setCaseState({
                ...caseState,
                selectIndex: [index],
                selectedCaseNo: row.caseNo,
                selectAlias: row.alias || '',
                selectEncntrGrpCd: row.encntrGrpCd || '',
                selectedSts: row.statusCd
            });
        }
    };


    let columns = [
        {
            label: 'Case Status',
            name: 'statusCd',
            width: '20%',
            customBodyRender: (value,rowData) => {
                //return CaseNoUtil.getCaseNoStatus(value);
                return CaseNoUtil.getCaseAliasSts(rowData);
            }
        },
        {
            label: 'Case No.',
            name: 'caseNo',
            width: '30%',
            customBodyRender: (value, rowData) => {
                return CaseNoUtil.getCaseAlias(rowData);
            }
        },
        { label: 'Case Reference', name: 'caseReference', width: '50%' }
    ];
    let hasActiveAnSvcIdInfo = antSvcInfo && antSvcInfo.clcAntFullList && antSvcInfo.clcAntFullList.some(x => x.sts === caseSts.ACTIVE);

    return (
        <Grid item container>
            <Grid item container className={classes.headerTop}>
                <Box display="flex" alignItems="center">
                    <Grid className={classes.title}>Case</Grid>
                    <FormControlLabel
                        id={`${id}_showClosedLabel`}
                        value={caseState.isShowClosedCase}
                        label="Show Closed Case"
                        classes={{
                            root: classes.formControlLabelRoot,
                            label: classes.formControlLabelLabel
                        }}
                        onChange={e => setCaseState({ ...caseState, isShowClosedCase: e.target.checked })}
                        control={<CIMSCheckBox color="primary" id={`${id}_showClosed`} classes={{ root: classes.checkBox }} />}
                    />
                </Box>
                <Grid item container xs={6} justify={'flex-end'}>
                    {
                        genCaseNoAction === Enum.CASE_NO_GEN_ACTION.NOT_GEN || isReadOnly
                            ? null
                            : <Grid item>
                                {activeCaseList.length > 0 ?
                                    <Link
                                        id={`${id}_selectBtn`}
                                        component="button"
                                        variant="body2"
                                        onClick={() => {
                                            if (caseState.selectedSts === 'A' && caseState.selectedCaseNo !== caseNoInfo.caseNo) {
                                                if (caseState.selectedCaseNo) {
                                                    props.auditAction('Click Select Case', null, null, false, 'patient');
                                                    const {selectedCaseNo}=caseState;
                                                    const { subTabs, deleteSubTabs, changeTabsActive, updateMainFrame } = props;
                                                    let tabList = _.cloneDeep(subTabs);
                                                    let delFunc = (deep, name) => {
                                                        if (parseInt(deep) === 2) {
                                                            if (name !== accessRightEnum.patientSummary) {
                                                                deleteSubTabs(name);
                                                            }
                                                        }
                                                    };
                                                    updateMainFrame({
                                                        curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON
                                                    });
                                                    commonUtilities.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON).then(result => {
                                                        if (result) {
                                                            props.refreshPatient({ isRefreshCaseNo: true, caseNo: selectedCaseNo });
                                                            setCaseState({
                                                                ...caseState,
                                                                selectIndex: [],
                                                                selectedCaseNo: '',
                                                                selectAlias: '',
                                                                selectEncntrGrpCd: '',
                                                                selectedSts: ''
                                                            });
                                                            props.setAntSvcInfoDialogSts({
                                                                open: false,
                                                                pageSts: antSvcInfoPageSts.DEFAULT,
                                                                alias: '',
                                                                callback: null,
                                                                encntrGrpCd: ''
                                                            });
                                                        }
                                                        updateMainFrame({
                                                            curCloseTabMethodType: null
                                                        });
                                                    });
                                                }
                                            }
                                        }}
                                        className={classes.headButton}
                                        style={{
                                            color: (!caseState.selectedCaseNo || caseState.selectedSts !== 'A' || caseState.selectedCaseNo === caseNoInfo.caseNo) ? 'gray' : '#0579c8',
                                            cursor: !caseState.selectedCaseNo || caseState.selectedSts !== 'A' || caseState.selectedCaseNo === caseNoInfo.caseNo ? 'default' : 'pointer'
                                        }}
                                        underline={!caseState.selectedCaseNo || caseState.selectedSts !== 'A' || caseState.selectedCaseNo === caseNoInfo.caseNo ? 'none' : 'hover'}
                                    >
                                        Select Case
                                    </Link>
                                    : null}
                                {activeCaseList.length > 0 ?
                                    <Typography component="span" variant="body2">
                                        {' '}|{' '}
                                    </Typography>
                                    : null}

                                <Link
                                    id={`${id}_createBtn`}
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        props.auditAction('Click Create Case', null, null, false, 'patient');
                                        //if (props.svcCd === 'ANT') {
                                        if (genCaseNoAction === Enum.CASE_NO_GEN_ACTION.FHS_GEN_CASE) {
                                            if (isPmiCaseWithEnctrGp) {
                                                if (encntrGrpList.length === 0) {
                                                    props.openCommonMessage({
                                                        msgCode:'110163'
                                                    });
                                                } else if (encntrGrpList.length > 1) {
                                                    props.setSelectEncntrGrpDialogProps({
                                                        confirmCallback: () => {
                                                            props.setAntSvcInfoDialogSts({ open: true, pageSts: antSvcInfoPageSts.CREATE, alias: '', encntrGrpCd: '' });
                                                            props.openSelectEncntrGrpDialog(false);
                                                        }
                                                    });
                                                    props.openSelectEncntrGrpDialog(true);
                                                } else {
                                                    if (hasActiveAnSvcIdInfo) {
                                                        props.openCommonMessage({
                                                            msgCode: '110157'
                                                        });
                                                    } else {
                                                        props.updateCaseNoState({ encntrGrp: encntrGrpList[0] });
                                                        props.setAntSvcInfoDialogSts({ open: true, pageSts: antSvcInfoPageSts.CREATE, alias: '', encntrGrpCd:'' });
                                                    }
                                                }
                                            } else {
                                                if (hasActiveAnSvcIdInfo) {
                                                    props.openCommonMessage({
                                                        msgCode: '110157'
                                                    });
                                                } else {
                                                    props.setAntSvcInfoDialogSts({ open: true, pageSts: antSvcInfoPageSts.CREATE, alias: '', encntrGrpCd:'' });
                                                }
                                            }
                                        } else {
                                            if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
                                                if (genCaseNoAction === Enum.CASE_NO_GEN_ACTION.GEN_WITH_ALIAS && isPmiCaseWithEnctrGp) {
                                                    if (encntrGrpList.length === 0) {
                                                        props.openCommonMessage({
                                                            msgCode: '110163'
                                                        });
                                                    } else if (encntrGrpList.length > 1) {
                                                        props.setSelectEncntrGrpDialogProps({
                                                            confirmCallback: () => {
                                                                let params = {
                                                                    caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
                                                                    caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
                                                                    caseCallBack: () => {
                                                                        if (caseNoInfo && caseNoInfo.caseNo) {
                                                                            getPatientPanelPatientById({ patientKey: patientInfo.patientKey, caseNo: caseNoInfo.caseNo });
                                                                        } else {
                                                                            getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
                                                                        }
                                                                        setCaseState({
                                                                            ...caseState,
                                                                            selectIndex: [],
                                                                            selectedCaseNo: '',
                                                                            selectAlias: '',
                                                                            selectEncntrGrpCd: '',
                                                                            selectedSts: ''
                                                                        });
                                                                    }
                                                                };
                                                                openCaseNoDialog(params);
                                                                props.openSelectEncntrGrpDialog(false);
                                                            }
                                                        });
                                                        props.openSelectEncntrGrpDialog(true);
                                                    } else {
                                                        let params = {
                                                            caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
                                                            caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
                                                            caseCallBack: () => {
                                                                if (caseNoInfo && caseNoInfo.caseNo) {
                                                                    getPatientPanelPatientById({ patientKey: patientInfo.patientKey, caseNo: caseNoInfo.caseNo });
                                                                } else {
                                                                    getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
                                                                }
                                                                setCaseState({
                                                                    ...caseState,
                                                                    selectIndex: [],
                                                                    selectedCaseNo: '',
                                                                    selectAlias: '',
                                                                    selectEncntrGrpCd: '',
                                                                    selectedSts: ''
                                                                });
                                                            }
                                                        };
                                                        openCaseNoDialog(params);
                                                    }
                                                 } else {
                                                    let params = {
                                                        caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
                                                        caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
                                                        caseCallBack: () => {
                                                            if (caseNoInfo && caseNoInfo.caseNo) {
                                                                getPatientPanelPatientById({ patientKey: patientInfo.patientKey, caseNo: caseNoInfo.caseNo });
                                                            } else {
                                                                getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
                                                            }
                                                            setCaseState({
                                                                ...caseState,
                                                                selectIndex: [],
                                                                selectedCaseNo: '',
                                                                selectAlias: '',
                                                                selectEncntrGrpCd: '',
                                                                selectedSts: ''
                                                            });
                                                        }
                                                    };
                                                    openCaseNoDialog(params);
                                                }
                                            } else {
                                                openCommonMessage({
                                                    msgCode: '115571',
                                                    variant: 'error'
                                                });
                                            }
                                        }
                                    }}
                                    className={classes.headButton}
                                >
                                    Create Case
                                </Link>
                                <Typography component="span" variant="body2">
                                    {' '}|{' '}
                                </Typography>
                                <Link
                                    id={`${id}_editBtn`}
                                    component="button"
                                    variant="body2"
                                    underline={!caseState.selectedCaseNo ? 'none' : 'hover'}
                                    style={{
                                        color: !caseState.selectedCaseNo ? 'gray' : '#0579c8'
                                    }}
                                    onClick={() => {
                                        props.auditAction('Click Edit Case', null, null, false, 'patient');
                                        //if (props.svcCd === 'ANT') {
                                        if (genCaseNoAction === Enum.CASE_NO_GEN_ACTION.FHS_GEN_CASE) {
                                            // if (hasActiveAnSvcIdInfo) {
                                            if (caseState.selectAlias) {
                                                props.setAntSvcInfoDialogSts({
                                                    open: true,
                                                    pageSts: antSvcInfoPageSts.EDIT,
                                                    alias: caseState.selectAlias,
                                                    encntrGrpCd:caseState.selectEncntrGrpCd||'',
                                                    callback: () => {
                                                        setCaseState({
                                                            ...caseState,
                                                            selectIndex: [],
                                                            selectedCaseNo: '',
                                                            selectAlias: '',
                                                            selectEncntrGrpCd:'',
                                                            selectedSts: ''
                                                        });
                                                    }
                                                });
                                            }
                                            // }
                                        } else {
                                            if (caseState.selectedCaseNo) {
                                                let caseNoForm = _.cloneDeep(patientInfo.caseList.find(item => item.caseNo === caseState.selectedCaseNo));
                                                caseNoForm.patientKey = patientInfo.patientKey;
                                                caseNoForm.casePrefixCd = caseNoForm.caseNo.substr(0, 4);
                                                let params = {
                                                    caseDialogStatus: Enum.CASE_DIALOG_STATUS.EDIT,
                                                    caseNoForm: caseNoForm,
                                                    caseCallBack: newCaseNoInfo => {
                                                        setCaseState({
                                                            ...caseState,
                                                            selectIndex: [],
                                                            selectedCaseNo: '',
                                                            selectAlias: '',
                                                            selectEncntrGrpCd:'',
                                                            selectedSts: ''
                                                        });
                                                        if (caseNoInfo && caseNoInfo.caseNo) {
                                                            if (newCaseNoInfo && newCaseNoInfo.caseNo === caseNoInfo.caseNo && newCaseNoInfo.statusCd !== 'A') {
                                                                getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
                                                            } else {
                                                                getPatientPanelPatientById({ patientKey: patientInfo.patientKey, caseNo: caseNoInfo.caseNo });
                                                            }
                                                        } else {
                                                            getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
                                                        }
                                                    }
                                                };
                                                if (isPmiCaseWithEnctrGp) {
                                                    const encntrGrpCd = caseNoForm.encntrGrpCd;
                                                    const encntrGrp = encntrGrpList.find(x => x.encntrGrpCd === encntrGrpCd);
                                                    props.updateCaseNoState({ encntrGrp: encntrGrp });
                                                } else {
                                                    if (isPMICaseNoAliasGen) {
                                                        if (aliasRule) {
                                                            const rule = aliasRule.find(x => x.casePrefix === caseNoForm.casePrefixCd);
                                                            const encounterGroupDtos = rule ? rule.encounterGroupDtos : [];
                                                            props.updateCaseNoState({ encounterGroupDtos: encounterGroupDtos });
                                                        }
                                                    }
                                                }
                                                openCaseNoDialog(params);
                                            }
                                        }
                                    }}
                                    className={classes.headButton}
                                >
                                    Edit
                                </Link>
                            </Grid>
                    }

                    {/* <Typography component="span" variant="body2"> | </Typography> */}
                    {/* <Link
                        id={`${id}_printBtn`}
                        component="button"
                        variant="body2"
                        underline={!caseState.selectedCaseNo ? 'none' : 'hover'}
                        style={{ color: !caseState.selectedCaseNo ? 'gray' : '#0579c8' }}
                        onClick={() => {
                        }}
                    >Print Label</Link> */}
                </Grid>
            </Grid>
            <Grid item container>
                <AutoScrollTable
                    id={`${id}_scrollTable`}
                    columns={columns}
                    store={
                        caseState.isShowClosedCase
                            ? patientInfo.caseList
                            : patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)
                    }
                    classes={{
                        container: classes.tableContainer,
                        tableRowRoot: classes.tableRowRoot
                    }}
                    selectIndex={caseState.selectIndex}
                    handleRowClick={handleTableRowClick}
                />
            </Grid>
        </Grid>
    );
};

const useStyles2 = makeStyles(theme => ({
    root: {
        // padding: theme.spacing(2)
        padding: theme.spacing(1)
    },
    padding10Grid: {
        padding: '10px 0px'
    },
    container: {
        padding: theme.spacing(2),
        alignItems: 'center'
    },
    tableContainer: {
        height: 'unset',
        minHeight: 70
        // maxHeight: 100
    },
    cgsTableContainer: {
        height: 'unset',
        minHeight: 65
    },
    tableRowRoot: {
        height: 'unset'
    },
    cgsTableRowRoot: {
        height: 'unset',
        minHeight: 65
    },
    rightIcon: {
        marginRight: theme.spacing(2)
    },
    printGumLbl: {
        margin: '-3px 10px 0px 0px',
        padding: '4px 20px'
    },
    screeningInfo: {
        margin: '-3px 10px 0px 15px',
        padding: '4px 20px'
    },
    printSpecimenbl: {
        margin: '-3px 10px 0px 0px',
        padding: '4px 20px',
        left: 7
    },
    buttonContainer: {
        padding: `0px ${theme.spacing(2)}px`
    },
    spacing1Grid: {
        padding: theme.spacing(1)
    },
    rotate90deg: {
        '-webkit-transform': 'rotate(90deg)',
        '-moz-transform': 'rotate(90deg)',
        '-ms-transform': 'rotate(90deg)',
        '-o-transform': 'rotate(90deg)',
        transform: 'rotate(90deg)'
    },
    expansionPanelRoot: {
        marginTop: 10,
        marginBottom: 10
    },
    expansionPanelSummaryRoot: {
        backgroundColor: theme.palette.primaryColor,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 10
    },
    expansionPanelSummaryIcon: {
        padding: '6px 12px',
        color: '#ffffff',
        marginRight: -19
    },
    expansionPanelSummaryLabel: {
        fontWeight: 'bold',
        color: '#ffffff'
    },
    expansionPanelDetails: {
        backgroundColor: theme.palette.white
    }
}));

const GumLabelPreview = props => {
    const { id, openGumLabel, previewData, closePreviewDialog } = props;
    const classes = useStyles1();
    //const classes2=useStyles2();
    return (
        <CIMSPromptDialog
            open={openGumLabel}
            dialogTitle={'Preview'}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <CIMSPdfViewer
                    id={'gumLabel_pdfViewer'}
                    position={'vertical'}
                    previewData={previewData ? previewData.base64 : null}
                />
            }
            buttonConfig={
                [
                    {
                        id: `${id}_print`,
                        name: 'Print',
                        disabled: !previewData,
                        onClick: () => {
                            // if (this.handlingPreviewAndPrint) {
                            //     return;
                            // }
                            // this.handlingPreviewAndPrint = true;
                            // props.auditAction('Print Gum Label');
                            // print({
                            //     base64: previewData,
                            //     //copies: copyNo,
                            //     callback: () => {
                            //         this.handlingPreviewAndPrint = false;
                            //         //this.setState({ previewDialogOpen: false });
                            //         closePreviewDialog();
                            //     }
                            // });
                            const printParam = {
                                ...previewData,
                                callback: () => {
                                    closePreviewDialog();
                                }
                            };
                            print(printParam);
                        }
                    },
                    {
                        id: `${id}_close`,
                        name: 'Close',
                        onClick: () => {
                            //this.props.auditAction('Close Preview gum label dialog', null, null, false, 'clinical-doc');
                            //this.setState({ previewDialogOpen: false });
                            closePreviewDialog();
                        }
                    }
                ]
            }
        />
    );
};

const EhsServiceSpecificBlock = (props) => {
    const { classes, handleOnEdit, patientInfo, commonCodeList } = props;

    const id = 'patientSummary_ehs_service_specific_block';

    return (
        <BlockInfo id={id} title="Service Specific" handleOnEdit={handleOnEdit}>
            <Grid item container spacing={2} className={classes.container}>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_memberId`}
                        label="Member ID"
                        variant="outlined"
                        disabled
                        value={patientInfo?.patientEhsDto?.memberId}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_memberStatus`}
                        label="Status"
                        variant="outlined"
                        disabled
                        value={PatientUtil.getEhsMemberStatusDesc(
                            patientInfo?.ehsMbrSts,
                            patientInfo?.patientEhsDto?.siteId,
                            patientInfo?.patientEhsDto?.isFrozen
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField id={`${id}_memberSince`} label="Member Since" variant="outlined" disabled value={patientInfo?.patientEhsDto?.firstHlthAsmtDate && moment(patientInfo?.patientEhsDto?.firstHlthAsmtDate).isValid()
                                ? moment(patientInfo?.patientEhsDto?.firstHlthAsmtDate).format(Enum.DATE_FORMAT_EDMY_VALUE)
                                : ''}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_applicationDate`}
                        label="Application Date"
                        variant="outlined"
                        disabled
                        value={
                            patientInfo?.patientEhsDto?.appDate && moment(patientInfo?.patientEhsDto?.appDate).isValid()
                                ? moment(patientInfo?.patientEhsDto?.appDate).format(Enum.DATE_FORMAT_EDMY_VALUE)
                                : ''
                        }
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_lastAssessmentDate`}
                        label="Last Assessment Date"
                        variant="outlined"
                        disabled
                        value={
                            patientInfo?.patientEhsDto?.lastHlthAsmtDate && moment(patientInfo?.patientEhsDto?.lastHlthAsmtDate).isValid()
                                ? moment(patientInfo?.patientEhsDto?.lastHlthAsmtDate).format(Enum.DATE_FORMAT_EDMY_VALUE)
                                : ''
                        }
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_nextAssessmentDate`}
                        label="Next Assessment Date"
                        variant="outlined"
                        disabled
                        value={
                            patientInfo?.patientEhsDto?.nextHlthAsmtDate && moment(patientInfo?.patientEhsDto?.nextHlthAsmtDate).isValid()
                                ? moment(patientInfo?.patientEhsDto?.nextHlthAsmtDate).format(Enum.DATE_FORMAT_EDMY_VALUE)
                                : ''
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <CIMSMultiTextField
                        id={`${id}_remark`}
                        label="Remark"
                        rows={3}
                        disabled
                        value={patientInfo?.pmiPersRemarkList?.map((x) => {
                            if (x.serviceCd === SERVICE_CODE.EHS && x.scope === 'S') {
                                return x.remark + '\n';
                            }
                        })}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_telSms`}
                        label="Tel (SMS)"
                        variant="outlined"
                        disabled
                        value={`${
                            patientInfo?.patientEhsDto?.phnSmsDialingCd && patientInfo?.patientEhsDto?.phnSmsDialingCd !== '852'
                                ? `+${patientInfo?.patientEhsDto?.phnSmsDialingCd} `
                                : ''
                        }${
                            patientInfo?.patientEhsDto?.phnSmsAreaCd && patientInfo?.patientEhsDto?.phnSmsAreaCd !== ''
                                ? `${patientInfo?.patientEhsDto?.phnSmsAreaCd} `
                                : ''
                        }${patientInfo?.patientEhsDto?.phnSms || ''}`}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField id={`${id}_telSmsOption`} label="SMS Option" variant="outlined" disabled value={EHS_CONSTANT.SMS_OPTIONS.find((x) => x.value === patientInfo?.patientEhsDto?.smsOpt)?.label || ''} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <CIMSTextField
                        id={`${id}_ngoReferral`}
                        label="NGO Referral?"
                        disabled
                        value={patientInfo?.patientEhsDto?.isNgoReferral === 1 ? 'YES' : patientInfo?.patientEhsDto?.isNgoReferral === 0 ? 'NO' : ''}
                    />
                </Grid>
                {patientInfo?.patientEhsDto?.phnDflt && patientInfo?.patientEhsDto?.phnDflt !== 0 && patientInfo?.patientEhsDto[`phn${patientInfo?.patientEhsDto?.phnDflt}`]?.length > 0 &&
                (
                    <>
                        <Grid item xs={12} md={4}>
                            <CIMSTextField id={`${id}_contactName`} label="Contact Name" variant="outlined" disabled value={patientInfo?.patientEhsDto?.contactName} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <CIMSTextField id={`${id}_contactRelation`} label="Contact Relationship" variant="outlined" disabled value={patientInfo?.patientEhsDto?.contactRelationship} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <CIMSTextField id={`${id}_preferredPhone`} label="Preferred Phone" variant="outlined" disabled value={patientInfo?.patientEhsDto[`phn${patientInfo?.patientEhsDto?.phnDflt}`] || ''} />
                        </Grid>
                    </>
                )}
                <Grid item xs={12} md={4}>
                    <CIMSTextField id={`${id}_waiverCategory`} label="Waiver Category" variant="outlined" disabled value={commonCodeList?.ehs_waiver_catgry?.find((x) => x.code === patientInfo?.patientEhsDto?.ehsWaiverCatgryCd)?.engDesc || patientInfo?.patientEhsDto?.ehsWaiverCatgryCd || ''} />
                </Grid>
            </Grid>
        </BlockInfo>
    );
};

const PatientSummary = React.forwardRef((props, ref) => {
    const classes = useStyles2();
    const theme = useTheme();
    let leftGridRef = React.useRef(null);
    // let rightGridRef = React.useRef(null);
    const [rightGridMaxHeight, setRightGridMaxHeight] = React.useState(null);
    //DH Miki - Start
    const [openDtsEncounterHistoryDialog, setOpenDtsEncounterHistoryDialog] = useState(false);
    const [openDtsPrintChangeFormDialog, setOpenDtsPrintChangeFormDialog] = useState(false);
    const [openDtsPrintPmiBarcodeDialog, setOpenDtsPrintPmiBarcodeDialog] = useState(false);
    const [openDtsPrintPmiAddressDialog, setOpenDtsPrintPmiAddressDialog] = useState(false);
    const [openDtsPrintDH65LabelDialog, setOpenDtsPrintDH65LabelDialog] = useState(false);
    const [openGumLabel, setOpenGumLabel] = useState(false);
    const [antSvcInfoDialogSts, setAntSvcInfoDialogSts] = useState(() => {
        return {
            open: false,
            pageSts: antSvcInfoPageSts.DEFAULT,
            alias: '',
            callback: null,
            encntrGrpCd:''
        };
    });
    const [openOtherApptDetailsLog, setOpenOtherApptDetailsLog] = useState(false);
    const [openEditOtherApptDetailsDialog, setOpenEditOtherApptDetailsDialog] = useState(false);
    const [otherAppointmentDetailsList, setOtherAppointmentDetailsList] = useState(() => { return []; });
    const [otherAppointmentDetailLog, setOtherAppointmentDetailLog] = useState(() => { return []; });
    const [openSelectEncntrGrpDialog,setOpenSelectEncntrGrpDialog]=useState(false);
    const [selectEncntrGrpDialogProps, setSelectEncntrGrpDialogProps] = useState(() => {
        return {
            confirmCallback: null
        };
    });

    //DH Miki - End
    const [allServiceCheck, setAllServiceCheck] = useState(false);
    const [approvalDialogParams, setApprovalDialogParams] = useState(() => {
        return {
            isOpen: false,
            staffId: '',
            rsnCd: null,
            rsnTxt: ''
        };
    });
    const {
        patientInfo,
        getPatientPanelPatientById,
        openCaseNoDialog, //NOSONAR
        commonCodeList,
        countryList,
        clinicList,
        caseNoInfo, //NOSONAR
        skipTab,
        isAutoGen,
        openCommonCircular, //NOSONAR
        ecs,
        ecsResult,
        ocsss,
        ocsssResult,
        mwecs,
        mwecsResult,
        refreshServiceStatus, //NOSONAR
        checkEcs,
        checkMwecs,
        checkOcsss,
        openOcsssDialog, //NOSONAR
        serviceList,
        listAppointmentHistory,
        appointmentHistory,
        closeCommonCircular, //NOSONAR,
        getAppointmentReport,
        getSppApptSlipReport,
        printPatientGumLabel,
        printPatientSpecimenLabel,
        patientSummaryEditPatient, //NOSONAR,
        updatePmiData,
        anonymousAppointmentPmiLinkage,
        svcCd,
        openCommonMessage,
        siteId, //NOSONAR
        openEcsDialog,
        viewLogState,
        subTabsActiveKey,
        deleteReasonsList,
        clinic,
        getCodeList,
        tabsActiveKey, //NOSONAR
        //DH Miki - Start
        setRedirect,
        dtsGetPmiLabel,
        dtsPmiBarcodeData,
        dtsUpdateState,
        dtsGetDH65Label,
        dtsDH65LabelData,
        defaultRoomId,
        accessRights, // DH Anthony
        addTabs, // DH Anthony,
        rooms,
        //DH Miki - End
        curCloseTabMethodType,
        subTabs,
        patientSvcExist,
        patientStatusList,
        quotaConfig,
        cncPreloadData,
        dtsGetEncounterHistory,
        gumLabelPrintReqParams,
        siteParams,
        antSvcInfo,
        encntrGrpList,
        aliasRule,
        dcbMachineNum,
        isClinicalBaseRole
    } = props;

    const [summarySectionsExpanded, setSummarySectionsExpanded] = useState((svcCd === 'CGS' && !isClinicalBaseRole) ? true : false);
    const [isScreeningInfoDialogOpen, setIsScreeningInfoDialogOpen] = useState(false);

    useEffect(() => {
        const { clinicConfig } = props;
        let where = { serviceCd: svcCd, clinicCd: clinic.clinicCd };
        const crossBookConfig = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ENABLE_CROSS_BOOK_CLINIC, clinicConfig, where);

        props.updateState({
            isEnableCrossBookClinic: crossBookConfig.configValue === 'Y'
        });

        let getCodeListParams = [codeList.exact_date_of_birth];

        getCodeList({
            params: getCodeListParams,
            actionType: [ecsActionType.PUT_GET_CODE_LIST]
        });
        // const caseActiveDtos = (patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)) || [];
        // const isExistCaseNo = caseNoInfo && caseNoInfo.caseNo && caseNoInfo.statusCd === 'A';
        if (patientInfo.deadInd !== '1') {
            // let isUseCaseNo = commonUtilities.isUseCaseNo();
            // if (isAutoGen === 'Y' && isUseCaseNo && caseActiveDtos.length == 0 && !isExistCaseNo) {
            //     openCaseNoDialog({
            //         caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
            //         isNoPopup: true, // auto gen without prompt confirmation message
            //         caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
            //         caseCallBack: () => {
            //             getPatientPanelPatientById({ patientKey: patientInfo.patientKey });
            //         }
            //     });
            // }
            refreshServiceStatus();
            return () => {
                //component unmount
            };
        }

    }, []);

    const listApptHistory = () => {
        let params = {
            patientKey: patientInfo.patientKey,
            allService: allServiceCheck,
            svcCd: svcCd,
            siteId: siteId,
            startDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        listAppointmentHistory(params, (data) => {
            let process_data = AppointmentUtil.processAppointmentData(data);
            if (svcCd === 'DTS') {
                dispatch({
                    type: patientActionType.PUT_LIST_APPOINTMENT_HISTORY,
                    appointmentHistory: process_data
                });
            } else {
                process_data = AppointmentUtil.processAppointmentData(data);
                dispatch({
                    type: patientActionType.PUT_LIST_APPOINTMENT_HISTORY,
                    appointmentHistory: process_data
                });
            }
        });
    };

    const checkPatientSvcExits = () => {
        let checkPatientSvcExistParams = {
            patientKey: props.patientInfo.patientKey,
            svcCd: props.serviceCd
        };
        props.checkPatientSvcExist(checkPatientSvcExistParams, (data) => {
            props.updateState({ patientSvcExist: data });
        });
    };

    const listOthApptDtl=()=>{
        if (props.serviceCd === 'ANT') {
            const clcAntIdSrc = antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.clcAntIdSrc;
            if (clcAntIdSrc) {
                props.listOtherAppointmentDetail(clcAntIdSrc, (data) => {
                    setOtherAppointmentDetailsList(data);
                });
            }
        }
    };

    const listOthApptDtlLog = () => {
        if (props.serviceCd === 'ANT') {
            const clcAntIdSrc = antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.clcAntIdSrc;
            if (clcAntIdSrc) {
                props.listOtherAppointmentDetailLog(clcAntIdSrc, (data) => {
                    setOtherAppointmentDetailLog(data);
                });
            }
        }
    };

    useEffect(() => {
        listApptHistory();
        checkPatientSvcExits();
        setRightGridMaxHeight(leftGridRef.offsetHeight);
        props.getPatientBannerData();
    }, []);

    useEffect(() => {
        if (props.serviceCd === 'DTS') {
            setOpenDtsPrintPmiBarcodeDialog(props.openDtsPrintPmiBarcodeDialog);
        }
    }, [props.openDtsPrintPmiBarcodeDialog]); //DH Miki

    useEffect(() => {
        if (props.serviceCd === 'DTS') {
            setOpenDtsPrintDH65LabelDialog(props.openDtsPrintDH65LabelDialog);
        }
    }, [props.openDtsPrintDH65LabelDialog]); //DH Miki

    useEffect(() => {
        if (subTabsActiveKey === accessRightEnum.patientSummary || subTabsActiveKey === accessRightEnum.patientSummaryReadOnly) {
            if (curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT) {
                listApptHistory();
                checkPatientSvcExits();
                props.refreshPatient({ isRefreshCaseNo: true });
            }
        }
    }, [subTabsActiveKey]);

    useEffect(() => {
        if (tabsActiveKey === accessRightEnum.patientSpec && (subTabsActiveKey === accessRightEnum.patientSummary || subTabsActiveKey === accessRightEnum.patientSummaryReadOnly)) {
            if (curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT && curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_HANDLE_BEFORE_OPEN_PATIENT_PANEL) {
                listApptHistory();
                checkPatientSvcExits();
                props.refreshPatient({ isRefreshCaseNo: true });
            }
        }
    }, [tabsActiveKey]);

    useEffect(() => {
        listApptHistory();
        checkPatientSvcExits();
    }, [allServiceCheck]);
    //DH Tony - Start
    useEffect(() => {
        if (props.serviceCd === 'DTS') {
            const { state } = props.location;
            if (state && state.redirectFrom === 'DTSBooking') {
                switch (state.action) {
                    case 'execCallBack': {
                        if (state.callBack) {
                            state.callBack();
                        }
                    }
                }
            }
        }
    }, []);
    //DH Tony - End
    useEffect(() => {
        if (props.serviceCd === 'DTS') {
            const flwupPara = {
                patientKey: patientInfo.patientKey,
                svcCd: 'DTS',
                sortByEncounterDate: 'D',
                siteId: siteId
            };
            dtsGetEncounterHistory(flwupPara);
        }
    }, []);

    useEffect(() => {
        listOthApptDtl();
    }, [antSvcInfo]);

    useEffect(() => {
        if (openOtherApptDetailsLog === true) {
            listOthApptDtlLog();
        }
    }, [openOtherApptDetailsLog]);


    const getContactPersonList = memoize(() => {
        const _contactPer = patientInfo.contactPersonList || [];
        let contactPersons = [];
        for (let i = 0; i < _contactPer.length; i++) {
            const engName = commonUtilities.getFullName(_contactPer[i]['engSurname'], _contactPer[i]['engGivename']);
            const _cplist = _contactPer[i]['contactPhoneList'] || [];
            const phoneNo1 = commonUtilities.getFormatPhone(countryList, _cplist[0]);
            const phoneNo2 = commonUtilities.getFormatPhone(countryList, _cplist[1]);
            const relationship = commonCodeList.relationship && commonCodeList.relationship.find(item => item.code === _contactPer[i]['relationshipCd']);
            contactPersons.push({
                engName,
                phoneNo: phoneNo1 || phoneNo2,
                relationshipCd: relationship && relationship['engDesc']
            });
        }
        return contactPersons;
    });

    const getPatientPhone = memoize(index => {
        const patiPhones = patientInfo.phoneList || [];
        // patiPhones.sort((a,b)=>{return b.phonePriority-a.phonePriority;});
        const _phone = patiPhones[index] || {};
        return commonUtilities.getFormatPhone(countryList, _phone);
    });

    const getPatientPhoneTypeName = memoize(phone => {
        const phoneTypeNameObj = Enum.PHONE_DROPDOWN_LIST.find(item => item.value === phone.phoneTypeCd);
        if (phoneTypeNameObj.value === Enum.PHONE_TYPE_MOBILE_PHONE && phone.smsPhoneInd === '1') {
            return 'Mobile SMS';
        }
        return phoneTypeNameObj && phoneTypeNameObj.label;
    });

    const getPatientBirthPlace = memoize(() => {
        const _birthPlace = countryList.find(item => item.countryCd === patientInfo.birthPlaceCd);
        return _birthPlace && _birthPlace.countryName;
    });

    const getPatientAddress = memoize(type => {
        const _addressList = patientInfo.addressList || [];
        const _address = _addressList.find(item => item.addressTypeCd === type);
        function getFreetextDesc(str) {
            return { code: str, engDesc: str, chiDesc: str };
        }
        if (_address) {
            const region = getFreetextDesc(_address.region);
            const district = getFreetextDesc(_address.districtCd);
            const subDistrict = getFreetextDesc(_address.subDistrictCd);
            const addrType = _address.addressLanguageCd;
            let value;
            let addressArr = [];
            switch (_address.addressFormat) {
                case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
                    addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                    if (_address.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                        if (addressArr.length > 0) {
                            value = addressArr.join(', ');
                            value = value.toUpperCase();
                        }
                    } else {
                        if (addressArr.length > 0) {
                            addressArr = addressArr.reverse();
                            value = addressArr.join('');
                        }
                    }
                    break;
                }
                case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
                    value = _address.addrTxt || '';
                    break;
                }
                case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
                    addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                    if (addressArr.length > 0) {
                        if (addrType === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                            value = `Postal Box ${addressArr.join(', ')}`;
                        } else {
                            value = `${ContactInformationEnum.FIELD_CHI_LABEL.CONTACT_POSTOFFICE_BOXNO} ${addressArr.join(', ')}`;
                        }
                        // value = addressArr.join(', ');
                    }
                    break;
                }
                default: {
                    value = '';
                    break;
                }
            }
            return value;
        }
        return '';
    });

    const getPaperBaseRecord = memoize(() => {
        const _recordList = (patientInfo.pmiPersPaperBasedList || []).filter(x => RegistrationUtil.isPmiPaperBasedActive(x, svcCd));
        let newRecordList = [];
        for (let i = 0; i < _recordList.length; i++) {
            if (_recordList[i]['statusCd'] === 'A') {
                // fixing find clinic by serviceCd && clinicCd, as clinicCd is not unique across services
                const clinic = clinicList.find(item => item.serviceCd === _recordList[i]['serviceCd'] && item.clinicCd === _recordList[i]['clinicCd']);
                newRecordList.push({
                    clinicCd: clinic && clinic.clinicName,
                    recId: _recordList[i]['recId']
                });
            }
        }
        return newRecordList;
    });

    const relationshipDataRecord = memoize(() => PatientUtil.relationshipDataRecordGenerator(patientInfo.cgsSpecOut));

    const referralDataRecord = memoize(() => {
        const { rfrName, rfrDate } = patientInfo.cgsSpecOut;
        if (rfrName || rfrDate) return [{ name: rfrName?.toUpperCase() || '', date: rfrDate }];
        else return [];
    });

    // const getPatientReminder = memoize(() => {
    //     const _remarkList = patientInfo.pmiPersRemarkList || [];
    //     let newRemarkList = [];
    //     for (let i = 0; i < _remarkList.length; i++) {
    //         if (_remarkList[i]['statusCd'] === 'A') {
    //             const remark = Enum.SHARE_WITH_LIST.find(item => item.code === _remarkList[i]['scope']);
    //             newRemarkList.push({
    //                 scope: remark && remark.label,
    //                 remark: _remarkList[i]['remark']
    //             });
    //         }
    //     }
    //     return newRemarkList;
    // });

    // const getWaiverInfo = memoize(() => {
    //     const _waiverList = patientInfo.pmiPersWaiverList || [];
    //     let newRemarkList = [];
    //     for (let i = 0; i < _waiverList.length; i++) {
    //         if (_waiverList[i]['useSts'] !== 'D') {
    //             const waiverType = commonCodeList.waiver && commonCodeList.waiver.find(item => item.code === _waiverList[i]['waiverTypeCd']);
    //             const waiverStatus = Enum.WAIVER_STATUS_CODELIST.find(item => item.code === _waiverList[i]['useSts']);
    //             newRemarkList.push({
    //                 waiverTypeCd: waiverType && waiverType.engDesc,
    //                 waiverNum: _waiverList[i]['waiverNum'],
    //                 isOneoff: _waiverList[i]['isOneoff'] ? 'Yes' : 'No',
    //                 waivePrcnt: _waiverList[i]['waivePrcnt'],
    //                 useSts: waiverStatus && waiverStatus.engDesc
    //             });
    //         }
    //     }
    //     return newRemarkList;
    // });

    // const handleSkipToBooking = () => {
    //     CaseNoUtil.caseNoHandleProcess(patientInfo, () => {
    //         skipTab(accessRightEnum.booking, null, true);
    //         deleteSubTabs(accessRightEnum.patientSummary);
    //     });
    // };

    // const handleSkipToWalkIn = () => {
    //     updateBookingState({ isWalkIn: true, showMakeAppointmentView: true });
    //     handleSkipToBooking();
    // };

    const handleOnEdit = (e, index) => {
        let specify = '';
        switch (index) {
            case 0: {
                specify = 'Update Personal Data';
                break;
            }
            case 1: {
                specify = 'Update Contact Information';
                break;
            }
            case 2: {
                specify = 'Update Contact Person';
                break;
            }
            case 4: {
                specify = 'Updete Paper Based Record';
                break;
            }
            default: {
                specify = '';
                break;
            }
        }
        if (specify !== '') {
            let tab = subTabs.find(item => item.name === subTabsActiveKey);
            props.auditAction(specify, tab.label, accessRightEnum.patientSummary, false, 'patient');
        }

        patientSummaryEditPatient({ index, patientKey: patientInfo.patientKey, pucChecking: _.cloneDeep(props.pucChecking) });
    };

    const getClinicConfig = memoize((configName, configs, _where) => {
        let config = commonUtilities.getPriorityConfig(configName, configs, _where);
        return config;
    });

    const handleSkipTab = (action, apptInfo, target) => {
        openCommonCircular();
        // deleteSubTabs(accessRightEnum.patientSummary);
        // resetAll();
        setTimeout(() => {
            skipTab(
                target,
                {
                    // stepIndex: index,
                    patientKey: patientInfo.patientKey,
                    redirectFrom: accessRightEnum.patientSummary,
                    action: action,
                    apptInfo: apptInfo || null
                },
                true
            );
        }, 10);
        closeCommonCircular();
        // skipTab(accessRightEnum.booking, { patientKey: patientInfo.patientKey, action: action, apptInfo: apptInfo || null });
    };

    // dental Anthony sprint 9 2020/09/16 - Start
    const handleAddTab = target => {
        let tab = accessRights.find(item => item.name === target);
        addTabs(tab);
    };
    // dental Anthony sprint 8 2020/09/19 - End

    // dental Edwin sprint 11 2020/11/06 - Start
    const handleSkipTabForDts = (target, params) => {
        skipTab(target, params);
    };
    // dental Edwin sprint 11 2020/11/06 - End

    const refreshApptList = () => {
        listApptHistory();
    };

    const handlePrintGumLabel = () => {
        let isPreview = true;
        const { clinicConfig, svcCd, clinic, siteId } = props;
        let where = { serviceCd: svcCd, clinicCd: clinic.clinicCd };
        const workstationIsPrev = commonUtilities.getWorkStationParam(Enum.WORKSTATION_PARAM_NAME.IS_PMI_GUM_LABEL_PREVIEW);
        const siteParamIsPrev = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_PMI_GUM_LABEL_PREVIEW, clinicConfig, where);
        if (workstationIsPrev !== null) {
            if (workstationIsPrev === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        } else {
            if (siteParamIsPrev && siteParamIsPrev.configValue === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        }
        const callback = () => {
            if (isPreview) {
                setOpenGumLabel(true);
            }
        };
        printPatientGumLabel(svcCd, siteId, patientInfo.patientKey, caseNoInfo.caseNo, isPreview, callback);
    };

    const handlePrintSpecimenLabel = () => {
        let isPreview = true;
        const { clinicConfig, svcCd, clinic, siteId } = props;
        let where = { serviceCd: svcCd, clinicCd: clinic.clinicCd };
        const workstationIsPrev = commonUtilities.getWorkStationParam(Enum.WORKSTATION_PARAM_NAME.IS_PMI_SPECIMEN_LABEL_PREVIEW);
        const siteParamIsPrev = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_PMI_SPECIMEN_LABEL_PREVIEW, clinicConfig, where);
        if (workstationIsPrev !== null) {
            if (workstationIsPrev === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        } else {
            if (siteParamIsPrev && siteParamIsPrev.configValue === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        }
        const callback = () => {
            if (isPreview) {
                setOpenGumLabel(true);
            }
        };
        props.auditAction('Print Specimen Label');
        printPatientSpecimenLabel(svcCd, siteId, patientInfo.patientKey, isPreview, callback);
    };

    const handlePrintSPPGumLabel = (selectedCategory) => {
        let isPreview = true;
        const { clinicConfig, svcCd, clinic, siteId } = props;
        let where = { serviceCd: svcCd, clinicCd: clinic.clinicCd };
        const workstationIsPrev = commonUtilities.getWorkStationParam(selectedCategory ? Enum.WORKSTATION_PARAM_NAME.IS_PMI_GUM_LABEL_PREVIEW : Enum.WORKSTATION_PARAM_NAME.IS_SPP_PMI_SMALL_LABEL_PREVIEW);
        const siteParamIsPrev = commonUtilities.getPriorityConfig(selectedCategory ? Enum.CLINIC_CONFIGNAME.IS_PMI_GUM_LABEL_PREVIEW : Enum.CLINIC_CONFIGNAME.IS_SPP_PMI_SMALL_LABEL_PREVIEW, clinicConfig, where);
        if (workstationIsPrev !== null) {
            if (workstationIsPrev === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        } else {
            if (siteParamIsPrev && siteParamIsPrev.configValue === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        }
        const callback = () => {
            if (isPreview) {
                setOpenGumLabel(true);
            }
        };
        let params = {
            siteId: siteId,
            patientKey: props.patientInfo.patientKey,
            smcNo: 'KB4000'
        };
        if (!selectedCategory) {
            params.labelType = 'SMALL';
        } else {
            params.isPrintChiName = selectedCategory && selectedCategory.isPrintChiName ? 1 : 0;
            params.isPrintTeam = selectedCategory && selectedCategory.isPrintTeam ? 1 : 0;
            params.isPrintPmiBar = selectedCategory && selectedCategory.isPrintPmiBar ? 1 : 0;
        }
        props.printSPPGumLabel(params, isPreview, callback);
    };

    const handlePrintEHSGumLabel = (confirmationForm) => {
        let isPreview = true;
        const { clinicConfig, svcCd, clinic, siteId } = props;
        let where = { serviceCd: svcCd, clinicCd: clinic.clinicCd };
        const workstationIsPrev = commonUtilities.getWorkStationParam(Enum.WORKSTATION_PARAM_NAME.IS_PMI_GUM_LABEL_PREVIEW);
        const siteParamIsPrev = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_PMI_GUM_LABEL_PREVIEW, clinicConfig, where);
        if (workstationIsPrev !== null) {
            if (workstationIsPrev === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        } else {
            if (siteParamIsPrev && siteParamIsPrev.configValue === '1') {
                isPreview = true;
            } else {
                isPreview = false;
            }
        }
        const callback = () => {
            if (isPreview) {
                setOpenGumLabel(true);
            }
        };
        let params = {
            siteId: siteId,
            patientKey: props.patientInfo.patientKey,
            topMargin: confirmationForm.topMarginAdjustment,
            labelStyle: confirmationForm.size
        };
        if (confirmationForm.size === 33) {
            params = {
                ...params,
                labFormNum: confirmationForm.labelFormLabel,
                redBookNum: confirmationForm.redBookLabel,
                covMedNum: confirmationForm.coverofTheMedicalRecord,
                corMedNum: confirmationForm.cornerOfTheMedicalRecord
            };
        }
        props.printEHSGumLabel(params, isPreview, callback);
    };

    const openScreeningInfoDialog = () => {
        setIsScreeningInfoDialogOpen(true);
    };

    const handleScreeningInfo = () => {
        props.auditAction('Click handle screening info button', null, null, false, 'patient');

        if (props.docId) {
            props.fetchScreeningInfo(props.docId, openScreeningInfoDialog);
        } else {
            props.openCommonMessage({
                msgCode: '110183'
            });
        }
    };

    const closeScreeningInfoDialog = () => {
        props.auditAction('Click close button in screening info dialog', null, null, false, 'patient');
        setIsScreeningInfoDialogOpen(false);
    };

    const handleClinicalDoc = () => { };

    const openEncounterHistoryDialog = () => {
        setRedirect({ action: REDIRECT_ACTION_TYPE.ENCOUNTER_HISTORY });
        setOpenDtsEncounterHistoryDialog(true);
    }; //DH Miki

    const closeEncounterHistoryDialog = () => {
        setOpenDtsEncounterHistoryDialog(false);
    }; //DH Miki

    const openPrintChangeFormDialog = () => {
        setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_CHANGE_FORM });
        setOpenDtsPrintChangeFormDialog(true);
    }; //DH Miki

    const closePrintChangeFormDialog = useCallback(() => {
        setOpenDtsPrintChangeFormDialog(false);
    }, []); //DH Miki

    const openPrintPmiAddressDialog = () => {
        setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_ADDRESS_LABEL });
        setOpenDtsPrintPmiAddressDialog(true);
    }; //DH Miki

    const closePrintPmiAddressDialog = useCallback(() => {
        setOpenDtsPrintPmiAddressDialog(false);
    }, []); //DH Miki

    const openPrintDH65LabelDialog = () => {
        //        console.log('===> openPrintDH65LabelDialog ==>');
        setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_DH65_LABEL });
        dtsGetDH65Label({
            patientInfo: patientInfo,
            defaultRoomId: defaultRoomId,
            rooms: rooms,
            commonCodeList: commonCodeList,
            address: getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)
        });
        // setOpenDtsPrintDH65LabelDialog(true);
    }; //DH Miki

    const closePrintDH65LabelDialog = useCallback(() => {
        dtsUpdateState({ openDtsPrintDH65LabelDialog: false });
        // setOpenDtsPrintDH65LabelDialog(false);
    }, []); //DH Miki

    const openPrintPmiBarcodeDialog = () => {
        setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_PMI_BARCODE });
        dtsGetPmiLabel({ patientInfo: patientInfo, doc_type: commonCodeList.doc_type });
        // setOpenDtsPrintPmiBarcodeDialog(true);
    }; //DH Miki

    const closePrintPmiBarcodeDialog = useCallback(() => {
        dtsUpdateState({ openDtsPrintPmiBarcodeDialog: false });
    }, []); //DH Miki

    const linkPmiData = props.linkPmiData;
    const curSelEnct = props.encounterTypes.find(enct => enct.encntrTypeCd === linkPmiData.enCounter);
    const curSelRoom = props.rooms.find(room => room.rmCd === linkPmiData.room);

    let apptAssociationConfirmDialogConfig = {
        isOpen: false,
        apptData: {
            enCounter: {
                name: 'Encounter',
                // value: linkPmiData.enCounter
                value: curSelEnct && curSelEnct.encntrTypeDesc
            },
            room: {
                name: 'Room',
                // value: linkPmiData.room
                value: curSelRoom && curSelRoom.rmDesc
            },
            apptTime: {
                name: 'Appointment Time',
                value: linkPmiData.apptTime
            }
        }
    };

    const handleUpdateApprovalDialogParams = (name, value) => {
        let params = _.cloneDeep(approvalDialogParams);
        params[name] = value;
        if (name === 'rsnCd') {
            params = {
                ...params,
                rsnTxt: ''
            };
        } else if (name === 'rsnTxt') {
            params = {
                ...params,
                rsnCd: ''
            };
        }
       setApprovalDialogParams(params);
    };

    const resetApprovalDialogParams = (callback) => {
        let params = {
            isOpen: false,
            staffId: '',
            rsnCd: null,
            rsnTxt: ''
        };
        setApprovalDialogParams(params);
        callback && callback();
        // this.setState({
        //     approvalDialogParams: {
        //         isOpen: false,
        //         staffId: '',
        //         rsnCd: null,
        //         rsnTxt: ''
        //     }
        // }, () => { callback && callback(); });
    };

    const fetchLogShsEncntrCaseDto = (params) => {
        if (approvalDialogParams.staffId) {
            if (params && Array.isArray(params.appointmentId) && params.appointmentId.length > 0) {
                props.logShsEncntrCase({
                    'actionType': 'A',
                    'approvalRsnCd': approvalDialogParams.rsnCd,
                    'approvalRsnTxt': approvalDialogParams.rsnTxt,
                    'approverId': approvalDialogParams.staffId,
                    'apptIds': params.appointmentId,
                    'patientKey': patientInfo.patientKey
                });
            }
        }
    };

    const confirmPmiLinkage = () => {
        const params = {
            anonymousPatientKey: linkPmiData.anonymousPatientKey,
            appointmentId: linkPmiData.appointmentId,
            logAppointmentId: [],
            logWaitingLisId: [],
            patientKey: linkPmiData.patientKey,
            waitingLisId: []
        };

        anonymousAppointmentPmiLinkage(params, () => {
            listApptHistory();
            updatePmiData('linkPmiData', {});
            apptAssociationConfirmDialogConfig.isOpen = false;
            fetchLogShsEncntrCaseDto(params);
        });
    };

    const apptAssociationConfirmDialogBtnClick = action => {
        // const params = {
        //     anonymousPatientKey: linkPmiData.anonymousPatientKey,
        //     appointmentId: linkPmiData.appointmentId,
        //     logAppointmentId: [],
        //     logWaitingLisId: [],
        //     patientKey: linkPmiData.patientKey,
        //     waitingLisId: []
        // };

        switch (action) {
            case 'confirm':
                // anonymousAppointmentPmiLinkage(params, () => {
                //     listApptHistory();
                //     updatePmiData('linkPmiData', {});
                //     apptAssociationConfirmDialogConfig.isOpen = false;
                // });
                if (props.serviceCd === 'SHS') {
                    const bookingFunc = () => {
                        //should call check api here
                        const params = {
                            patientKey: linkPmiData.patientKey,
                            encntrTypeId: linkPmiData.encntrTypeId
                        };
                        props.checkApptWithEncntrCaseStatus(params, (action) => {
                            if (action === UNEXPECTED_ACTION_TYPE.APPROVAL) {
                                setApprovalDialogParams({
                                    ...approvalDialogParams,
                                    isOpen: true
                                });
                            } else if (action === UNEXPECTED_ACTION_TYPE.BLOCK) {
                                props.openCommonMessage({
                                    msgCode: '110201',
                                    btnActions: {
                                        btn1Click: () => {
                                            updatePmiData('linkPmiData', {});
                                            apptAssociationConfirmDialogConfig.isOpen = false;
                                        }
                                    }
                                });
                            } else {
                                confirmPmiLinkage();
                            }
                        });
                    };
                    resetApprovalDialogParams(() => {
                        checkAppEncntrCaseStatusBeforeBook(bookingFunc);
                    });
                } else {
                    confirmPmiLinkage();
                }
                break;

            case 'cancel':
                updatePmiData('linkPmiData', {});
                apptAssociationConfirmDialogConfig.isOpen = false;
                break;

            default:
                break;
        }
    };

    const updateViewLog = obj => {
        props.updateState({
            patientSummaryViewLog: {
                ...viewLogState,
                ...obj
            }
        });
    };

    const getReminderMeans = () => {
        let meansList = Enum.CONTACT_MEAN_LIST.map(item => ({ label: item.engDesc, value: item.code, spec: item.spec }));
        meansList = meansList.filter(item => (patientInfo.pmiPatientCommMeanList && patientInfo.pmiPatientCommMeanList.findIndex(commMean => commMean.commMeanCd === item.value && commMean.status === 'A')) > -1);
        meansList = meansList.map(item => item.label);
        return meansList.join(', ');
    };

    const getConsentStatus = () => {
        return patientInfo.dtsElctrncCommCnsntSts && (patientInfo.dtsElctrncCommCnsntSts === 'Y' ? 'Yes' : 'No') + (patientInfo.dtsElctrncCommCnsntUpdDtm && (' (' + moment(patientInfo.dtsElctrncCommCnsntUpdDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) + ')'));
    };

    const getRelationshipWithAssPerson = () => {
        let relationshipDescObj = Enum.RELATIONSHIP_WITH_ASSOCIATED_PERSON.find(item => item.code === patientInfo.assoPersRlatSts);
        let hkidDesc = PatientUtil.getHkidFormat(patientInfo.assoPersHkid);
        return `${(relationshipDescObj && relationshipDescObj.engDesc) || ''}${(hkidDesc && (' (HKID: ' + hkidDesc + ')')) || ''}`;
    };

    const getNameOfAssPerson = () => {
        return patientInfo.assoPersName || '';
    };

    const getPaitentStatus = () => {
        let patientStsObj = patientStatusList.find(item => item.code === patientInfo.patientSts);
        return patientStsObj && patientStsObj.superCode;
    };

    const getSpecialNeedsCategory = () => {
        let specialNeedsCategoryCodeList = getCodeDescriptionByCategory(['SPECIAL NEEDS CATEGORY'], cncPreloadData, 'cnc');
        let specialNeedsCategoryList = getCodeDescriptionByCodeId([patientInfo.dtsSpecNeedCatgryId], specialNeedsCategoryCodeList, 'cnc');
        return specialNeedsCategoryList.length > 0 ? specialNeedsCategoryList[0].code : '';
    };

    const getSpecialNeedsSubCategory = () => {
        let specialNeedSubCategoryCodeList = getCodeDescriptionByCategory(['SPECIAL NEEDS SUB-CATEGORY'], cncPreloadData, 'cnc');
        let specialNeedsSubCategoryList = getCodeDescriptionByCodeId([patientInfo.dtsSpecNeedScatgryId], specialNeedSubCategoryCodeList, 'cnc');
        return specialNeedsSubCategoryList.length > 0 ? specialNeedsSubCategoryList[0].code : '';
    };

    if (linkPmiData.anonymousPatientKey && linkPmiData.appointmentId[0] && linkPmiData.patientKey) {
        apptAssociationConfirmDialogConfig.isOpen = true;
    }

    const where = { serviceCd: props.serviceCd };
    const fmcbConfig = getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_FM_CB, props.clinicConfig, where);
    const pensionerConfig = getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_PENSIONER_CB, props.clinicConfig, where);
    const specialNeedsConfig = getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_SPECIAL_NEEDS, props.clinicConfig, where);

    const _patientPhones = patientInfo.phoneList || [];

    const useCaseNo = commonUtilities.isUseCaseNo();

    const anSvcIdIsActive=curANSvcIdIsActive(antSvcInfo);

    const closePreviewDialog = () => {
        setOpenGumLabel(false);
    };

    const closeAntSvcInfoDialog = () => {
        antSvcInfoDialogSts.callback && antSvcInfoDialogSts.callback();
        setAntSvcInfoDialogSts({
            open: false,
            pageSts: antSvcInfoPageSts.DEFAULT,
            alias: '',
            callback: null,
            encntrGrpCd:''
        });
    };

    const summarySections = (
        <>
            <Grid item container xs={6} ref={ref => (leftGridRef = ref)}>
                <Grid item container className={classes.spacing1Grid}>
                    <BlockInfo id="patientSummary_contactInfo" title="Contact Information" isReadOnly={props.isPmiSummaryReadOnly} handleOnEdit={e => handleOnEdit(e, 1)}>
                        <Grid item container spacing={2} className={classes.container}>
                            <Grid item container xs={12} spacing={2}>
                                {_patientPhones.length > 0
                                    ? _patientPhones.map((item, index) => {
                                        if (index < 4) {
                                            return (
                                                <Grid item xs={3} key={index}>
                                                    <CIMSTextField
                                                        id={`patientSummary_contactInfo_phone_${index + 1}`}
                                                        key={index}
                                                        label={getPatientPhoneTypeName(item)}
                                                        variant="outlined"
                                                        disabled
                                                        value={getPatientPhone(index)}
                                                    />
                                                </Grid>
                                            );
                                        }
                                    })
                                    : null}
                                {/* {
                                    getPatientPhoneTypeName(0) ? <Grid item xs={3}>
                                        <CIMSTextField
                                            id="patientSummary_contactInfo_phone1"
                                            label={getPatientPhoneTypeName(0)}
                                            variant="outlined"
                                            disabled
                                            value={getPatientPhone(0)}
                                        />
                                    </Grid> : null
                                }
                                {
                                    getPatientPhoneTypeName(1) ? <Grid item xs={3}>
                                        <CIMSTextField
                                            id="patientSummary_contactInfo_phone2"
                                            label={getPatientPhoneTypeName(1)}
                                            variant="outlined"
                                            disabled
                                            value={getPatientPhone(1)}
                                        />
                                    </Grid> : null
                                }
                                {
                                    getPatientPhoneTypeName(2) ? <Grid item xs={3}>
                                        <CIMSTextField
                                            id="patientSummary_contactInfo_phone3"
                                            label={getPatientPhoneTypeName(2)}
                                            variant="outlined"
                                            disabled
                                            value={getPatientPhone(2)}
                                        />
                                    </Grid> : null
                                }
                                {
                                    getPatientPhoneTypeName(3) ? <Grid item xs={3}>
                                        <CIMSTextField
                                            id="patientSummary_contactInfo_phone4"
                                            label={getPatientPhoneTypeName(3)}
                                            variant="outlined"
                                            disabled
                                            value={getPatientPhone(3)}
                                        />
                                    </Grid> : null
                                } */}
                            </Grid>
                            <Grid item container xs={9} spacing={1}>
                                <Grid item xs={7}>
                                    <CIMSTextField
                                        id="patientSummary_contactInfo_email"
                                        label="Email"
                                        variant="outlined"
                                        disabled value={patientInfo.emailAddress || ''}
                                    />
                                </Grid>
                                {
                                    svcCd === 'DTS' ?
                                        <Grid item xs={5}>
                                            <CIMSTextField
                                                id="patientSummary_contactInfo_reminderMeans"
                                                label="Reminder Means"
                                                variant="outlined"
                                                disabled value={getReminderMeans()}
                                            />
                                        </Grid> : null
                                }
                                {svcCd === SERVICE_CODE.EHS && (
                                    <Grid item xs={5}>
                                        <CIMSTextField
                                            id={'patientSummary_contactInfo_district'}
                                            label={'District'}
                                            variant="outlined"
                                            disabled
                                            // value="Central and Western District"
                                        />
                                    </Grid>
                                )}

                            </Grid>
                            {
                                svcCd === 'DTS' ?
                                    <Grid item container xs={3} style={{ padding: 0 }}>
                                        <CIMSTextField id="patientSummary_contactInfo_consentStatus" label="Consent Status" variant="outlined" disabled value={getConsentStatus()} />
                                    </Grid> : null
                            }
                            {svcCd === 'EHS' && (
                                <Grid item xs={3}>
                                    <CIMSTextField id={'patientSummary_contactInfo_near_ehc'} label={'Near EHC?'} variant="outlined" disabled value={patientInfo?.patientEhsDto?.isNearEhc === 1 ? 'YES' : patientInfo?.patientEhsDto?.isNearEhc === 0 ? 'NO' : ''} />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                {svcCd === 'EHS' ? (
                                    <CIMSMultiTextField
                                        id="patientSummary_contactInfo_resiAddress"
                                        label="Residential Address"
                                        variant="outlined"
                                        disabled
                                        rows="2"
                                        value={getPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE)}
                                    />
                                ) : (
                                    <CIMSMultiTextField
                                        id="patientSummary_contactInfo_corrAddress"
                                        label="Correspondence Address"
                                        variant="outlined"
                                        disabled
                                        rows="2"
                                        value={getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </BlockInfo>
                </Grid>
                <Grid item container className={classes.spacing1Grid}>
                    <BlockInfo id="patientSummary_personalData" title="Personal Data" isReadOnly={props.isPmiSummaryReadOnly} handleOnEdit={e => handleOnEdit(e, 0)}>
                        <Grid item container spacing={2} className={classes.container}>
                            <Grid item container xs={10} spacing={1}>
                                <Grid item xs={9}>
                                    <CIMSTextField
                                        id="patientSummary_contactInfo_birthPlace"
                                        label="Birth Place"
                                        variant="outlined"
                                        disabled value={getPatientBirthPlace()}
                                    />
                                </Grid>
                                {svcCd === 'DTS' ?
                                    <Grid item xs={3}>
                                        <CIMSTextField
                                            label="Patient Status"
                                            variant="outlined"
                                            value={getPaitentStatus()}
                                            disabled
                                        />
                                    </Grid> : null
                                }

                            </Grid>
                            {pensionerConfig.configValue && pensionerConfig.configValue === 'Y' ? (
                                <Grid item container xs={2} style={{ padding: 0 }}>
                                    <CIMSTextField label="Pensioner" variant="outlined" value={patientInfo.isPnsn == 1 ? 'Y' : 'N'} disabled></CIMSTextField>
                                </Grid>
                            ) : null}
                            <Grid item container xs={7} wrap="nowrap" alignItems="center">
                                <Box display="flex" width={1} >
                                    <Box pr={1}>
                                        <CIMSButton
                                            id={'patientSummary_ecsBtn'}
                                            disabled={
                                                !EcsUtilities.isEcsEnable(
                                                    ecs.accessRights,
                                                    ecs.docTypeCds,
                                                    ecs.ecsUserId,
                                                    ecs.ecsLocCode,
                                                    false,
                                                    ecs.ecsServiceStatus,
                                                    ecs.hkicForEcs
                                                )
                                            }
                                            style={EcsUtilities.getEcsBtnStyle()}
                                            onClick={e => {
                                                checkEcs(
                                                    EcsUtilities.getEcsParamsForDirectCall(
                                                        ecs.ecsUserId,
                                                        ecs.dob,
                                                        ecs.exactDobCd,
                                                        ecs.hkicForEcs,
                                                        ecs.ecsLocCode,
                                                        ecs.patientKey,
                                                        null
                                                    ),
                                                    ecs.hkicForEcs,
                                                    null,
                                                    setEcsPatientStatus
                                                );
                                            }}
                                        >
                                            {EcsUtilities.getEcsBtnName()}
                                        </CIMSButton>
                                    </Box>
                                    <Box pr={1}>
                                        <CIMSButton
                                            id={'patientSummary_ecsAssocBtn'}
                                            disabled={
                                                !EcsUtilities.isEcsEnable(
                                                    ecs.accessRights,
                                                    ecs.docTypeCds,
                                                    ecs.ecsUserId,
                                                    ecs.ecsLocCode,
                                                    false,
                                                    ecs.ecsServiceStatus,
                                                    ecs.hkicForEcs,
                                                    true
                                                )
                                            }
                                            style={EcsUtilities.getEcsAssocBtnStyle()}
                                            onClick={e => {
                                                openEcsDialog(
                                                    {
                                                        docTypeCd: ecs.docTypeCd,
                                                        disableMajorKeys: true,
                                                        engSurname: ecs.engSurname,
                                                        engGivename: ecs.engGivename,
                                                        chineseName: ecs.chineseName,
                                                        cimsUser: ecs.ecsUserId,
                                                        locationCode: ecs.ecsLocCode,
                                                        patientKey: ecs.patientKey,
                                                        hkid: ecs.hkicForEcs,
                                                        dob: ecs.dob,
                                                        exactDob: ecs.exactDobCd,
                                                        mustBeAssociated: true,
                                                        associatedHkic: ecs.assoPersHkid
                                                    },
                                                    null,
                                                    setEcsPatientStatus
                                                );
                                            }}
                                        >
                                            {EcsUtilities.getEcsAssoBtnName()}
                                        </CIMSButton>
                                    </Box>
                                    <Box flexGrow={1}>
                                        <EcsResultTextField id={'patientSummary_ecsResultTxt'} ecsStore={ecsResult}></EcsResultTextField>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item container xs={5} wrap="nowrap" alignItems="center" >
                                <Box display="flex" width={1} >
                                    <Box>
                                        <CIMSButton
                                            id={'patientSummary' + '_ocsssBtn'}
                                            style={{ padding: '0px', margin: '0px' }}
                                            disabled={!EcsUtilities.isOcsssEnable(ocsss.accessRights, ocsss.docTypeCds, ocsss.ocsssServiceStatus, ocsss.hkicForEcs, ocsss.ecsUserId, ocsss.ecsLocId) || ocsssResult.isValid}
                                            onClick={e => {
                                                openOcsssDialog(
                                                    {
                                                        hkid: ocsss.hkicForEcs,
                                                        patientKey: ocsss.patientKey,
                                                        ecsUserName: ocsss.ecsUserId,
                                                        ecsLocationId: ocsss.ecsLocId
                                                    },
                                                    null,
                                                    setOcsssPatientStatus,
                                                    checkOcsss
                                                );
                                            }}
                                        >
                                            OCSSS
                                        </CIMSButton>
                                    </Box>
                                    <Box flexGrow={1} pr={2}>
                                        <OcsssResultTextField
                                            id={'patientSummary_ocsssResultTxt'}
                                            style={{ marginLeft: theme.spacing(2) }}
                                            ocsssStore={ocsssResult}
                                            fullWidth
                                        >
                                        </OcsssResultTextField>
                                    </Box>
                                </Box>
                            </Grid>
                            {svcCd === 'DTS' ?
                                <>
                                    <Grid item xs={6}>
                                        <CIMSTextField label="Relationship with Associated Person" variant="outlined" value={getRelationshipWithAssPerson()} disabled></CIMSTextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <CIMSTextField label="Name of Associated Person" variant="outlined" value={getNameOfAssPerson()} disabled></CIMSTextField>
                                    </Grid>
                                </> : null
                            }
                            <Grid item container xs={6} wrap="nowrap" alignItems="center">
                                <CIMSButton
                                    id={'patientSummary_mwecsBtn'}
                                    disabled={!EcsUtilities.isMwecsEnable(mwecs.accessRights, mwecs.serviceStatus, mwecs.ecsUserId, mwecs.ecsLocId)}
                                    style={{ padding: '0px', margin: '0px' }}
                                    onClick={e => {
                                        checkMwecs(EcsUtilities.getMwecsParamsForDirectCall(mwecs.idType, mwecs.idNum, mwecs.patientKey, null, mwecs.ecsUserId, mwecs.ecsLocId), null, setMwecsPatientStatus);
                                    }}
                                >
                                    MWECS
                                </CIMSButton>
                                <MwecsResultTextField
                                    id={'patientSummary_mwecsResultTxt'}
                                    mwecsStore={mwecsResult}
                                    style={{ marginLeft: theme.spacing(2) }}
                                ></MwecsResultTextField>
                            </Grid>
                            <Grid item xs={4}>
                                <MwecsMessageIdTextField id={'patientSummary_mwecsMessageTxt'} mwecsStore={mwecsResult} fullWidth></MwecsMessageIdTextField>
                            </Grid>
                            {fmcbConfig.configValue && fmcbConfig.configValue === 'Y' ? (
                                <Grid item xs={2}>
                                    <CIMSTextField
                                        label="Eligible for NTKFMTC"
                                        variant="outlined"
                                        value={patientInfo.isFm == 1 ? 'Y' : 'N'}
                                        disabled
                                    ></CIMSTextField>
                                </Grid>
                            ) : null}
                            {svcCd === SERVICE_CODE.TBC ? (
                                <Grid item xs={2}>
                                    <CIMSTextField
                                        label="PMCO Compensated"
                                        variant="outlined"
                                        InputLabelProps={{
                                            style: {
                                                fontSize: '11px'
                                            }
                                        }}
                                        value={patientInfo.tbcPcfbDate ? 'Y' : 'N'}
                                        disabled
                                    ></CIMSTextField>
                                </Grid>
                            ) : null}
                        </Grid>
                    </BlockInfo>
                </Grid>
                <Grid item container spacing={2} className={classes.spacing1Grid}>
                    {specialNeedsConfig.configValue && specialNeedsConfig.configValue === 'Y' ? (
                        <Grid item xs={6}>
                            <CIMSTextField label="Special Needs(Category)" variant="outlined" value={getSpecialNeedsCategory()} disabled></CIMSTextField>
                        </Grid>
                    ) : null}
                    {specialNeedsConfig.configValue && specialNeedsConfig.configValue === 'Y' ? (
                        <Grid item xs={6}>
                            <CIMSTextField
                                label="Special Needs(Sub-category)"
                                variant="outlined"
                                disabled
                                InputLabelProps={{
                                    style: {
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        width: '80%'
                                    }
                                }}
                                value={getSpecialNeedsSubCategory()}
                            ></CIMSTextField>
                        </Grid>
                    ) : null}
                </Grid>
            </Grid>
            <Grid item container xs={6} style={{ maxHeight: rightGridMaxHeight - 16, overflow: 'auto' }}>
                {svcCd === SERVICE_CODE.EHS && (
                    <>
                        <Grid item container className={classes.spacing1Grid}>
                            <EhsServiceSpecificBlock classes={classes} handleOnEdit={(e) => handleOnEdit(e, 5)} patientInfo={patientInfo} commonCodeList={props.commonCodeList} />
                        </Grid>
                    </>
                )}
                <Grid item container className={classes.spacing1Grid}>
                    <BlockInfo id="patientSummary_contactPer" title="Contact Person" noBorder isReadOnly={props.isPmiSummaryReadOnly} handleOnEdit={e => handleOnEdit(e, 2)}>
                        <AutoScrollTable
                            id="patientSummary_contactPer_scrollTable"
                            columns={[
                                { label: 'Name', name: 'engName', width: '50%' },
                                { label: 'Phone', name: 'phoneNo', width: '20%' },
                                { label: 'Relationship', name: 'relationshipCd', width: '30%' }
                            ]}
                            store={getContactPersonList()}
                            classes={{
                                container: classes.tableContainer,
                                tableRowRoot: classes.tableRowRoot
                            }}
                        />
                    </BlockInfo>
                </Grid>
               {/* NOTE CGS Service Specific Only */}
               {svcCd === 'CGS' && (
                    <>
                    <Grid item container className={classes.spacing1Grid}>
                        <BlockInfo
                            id="patientSummary_relationshipData"
                            title="Relationship Data"
                            noBorder
                            isReadOnly={props.isPmiSummaryReadOnly}
                            handleOnEdit={(e) => handleOnEdit(e, 5)}
                        >
                                <AutoScrollTable
                                    id="patientSummary_relationshipData_scrollTable"
                                    columns={[
                                        { label: 'Name', name: 'name', width: '70%'},
                                        { label: 'Relationship', name: 'relationship', width: '30%' }
                                    ]}
                                    store={patientInfo?.cgsSpecOut ? relationshipDataRecord() : []}
                                    classes={{
                                        container: classes.cgsTableContainer,
                                        tableRowRoot: classes.cgsTableRowRoot
                                    }}
                                />
                        </BlockInfo>
                    </Grid>

                    <Grid item container className={classes.spacing1Grid}>
                        <BlockInfo
                            id="patientSummary_referralData"
                            title="Referral Data"
                            noBorder
                            isReadOnly={props.isPmiSummaryReadOnly}
                            handleOnEdit={(e) => handleOnEdit(e, 5)}
                        >
                                <AutoScrollTable
                                    id="patientSummary_referralData_scrollTable"
                                    columns={[
                                        { label: 'Referral Name', name: 'name', width: '70%'},
                                        { label: 'Referral Date', name: 'date', width: '30%' }
                                    ]}
                                    store={patientInfo?.cgsSpecOut?.pmiGrpName ? referralDataRecord() : []}
                                    classes={{
                                        container: classes.cgsTableContainer,
                                        tableRowRoot: classes.cgsTableRowRoot
                                    }}
                                />
                        </BlockInfo>
                    </Grid>
                    </>
                )}
                <Grid item container className={classes.spacing1Grid}>
                    <BlockInfo id="patientSummary_paperBase" title="Paper-Based Record" noBorder isReadOnly={props.isPmiSummaryReadOnly} handleOnEdit={e => handleOnEdit(e, 4)}>
                        <AutoScrollTable
                            id="patientSummary_paperBase_scrollTable"
                            columns={[
                                { label: 'Clinic', name: 'clinicCd', width: '40%' },
                                { label: 'Record ID', name: 'recId', width: '60%' }
                            ]}
                            store={getPaperBaseRecord()}
                            classes={{
                                container: classes.tableContainer,
                                tableRowRoot: classes.tableRowRoot
                            }}
                        />
                    </BlockInfo>
                </Grid>
                {useCaseNo ?
                    <Grid item container className={classes.spacing1Grid}>
                        <CaseNoBlock
                            id="patientSummary_caseNo"
                            patientInfo={patientInfo}
                            caseNoInfo={caseNoInfo}
                            getPatientPanelPatientById={getPatientPanelPatientById}
                            openCaseNoDialog={openCaseNoDialog}
                            openCommonMessage={openCommonMessage}
                            auditAction={props.auditAction}
                            setAntSvcInfoDialogSts={setAntSvcInfoDialogSts}
                            caseStsChangeRsns={props.caseStsChangeRsns}
                            updateCaseNoState={props.updateCaseNoState}
                            openSelectEncntrGrpDialog={setOpenSelectEncntrGrpDialog}
                            clinicList={clinicList}
                            antSvcInfo={props.antSvcInfo}
                            encntrGrpList={encntrGrpList}
                            deleteSubTabs={props.deleteSubTabs}
                            subTabs={props.subTabs}
                            changeTabsActive={props.changeTabsActive}
                            skipTab={props.skipTab}
                            updateMainFrame={props.updateMainFrame}
                            refreshPatient={props.refreshPatient}
                            updateState={props.updateState}
                            setSelectEncntrGrpDialogProps={setSelectEncntrGrpDialogProps}
                            aliasRule={aliasRule}
                            isReadOnly={props.isPmiSummaryReadOnly}
                        />
                    </Grid>
                    : null
                }
            </Grid>
        </>
    );

    return (
        <Grid container className={classes.root} spacing={2} alignItems="baseline">
            <Grid container style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <div className={classes.buttonContainer}>
                        <Typography style={{ fontWeight: 'bold' }}>Last Update Date:</Typography>
                        <Typography>{moment(patientInfo.updateDtm, Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK).format(Enum.DATE_FORMAT_24_HOUR)}</Typography>
                    </div>
                    <div className={classes.buttonContainer}>
                        {props.isPmiSummaryReadOnly ? null :
                            <>
                                {props.serviceCd === 'DTS' ? (
                                    <>
                                        <CIMSButton
                                            id={'patientSummary_print_change_form_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={openPrintChangeFormDialog}
                                        >
                                            <ContactPhone className={classes.rightIcon} />
                                            Print Change Form
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_print_pmi_barcode_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={openPrintPmiBarcodeDialog}
                                        >
                                            <HorizontalSplit className={[classes.rightIcon, classes.rotate90deg]} />
                                            Print PMI Barcode
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_print_address_label_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={openPrintPmiAddressDialog}
                                        >
                                            <ContactMail className={classes.rightIcon} />
                                            Print Address label
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_print_dh65_label_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={openPrintDH65LabelDialog}
                                        >
                                            <FolderShared className={classes.rightIcon} />
                                            Print DH65 label
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_manage_default_room_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={() => {
                                                handleAddTab(accessRightEnum.DtsPatientDefaultRoom); //DH Anthony
                                            }}
                                        >
                                            <MeetingRoom className={classes.rightIcon} />
                                            Default Room
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_laboratory_work_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={() => {
                                                handleAddTab(accessRightEnum.DtsLaboratoryWork); //DH Anthony
                                            }}
                                        >
                                            <Build className={classes.rightIcon} />
                                            Laboratory Work
                                        </CIMSButton>
                                        <CIMSButton
                                            id={'patientSummary_encounter_history_button'}
                                            classes={{ sizeSmall: classes.printGumLbl }}
                                            onClick={openEncounterHistoryDialog}
                                        >
                                            <History className={classes.rightIcon} />
                                            Encounter History
                                        </CIMSButton>
                                    </>
                                ) : (
                                    <>
                                        <LabelButton
                                            id={'patientSummary_print_gum_lable_button'}
                                            handlePrintGumLabel={handlePrintGumLabel}
                                            handlePrintSPPGumLabel={handlePrintSPPGumLabel}
                                            handlePrintEHSGumLabel={handlePrintEHSGumLabel}
                                            svcCd={svcCd}
                                            classes={{ sizeSmall: classes.printSpecimenbl }}
                                            children={
                                                <>
                                                    <Print className={classes.rightIcon} />
                                                    {svcCd === 'SHS' ? 'Registration Label' : 'Label'}
                                                </>
                                            }
                                            auditAction={props.auditAction}
                                        />
                                        {svcCd === 'SHS' ? (
                                            <CIMSButton
                                                id={'patientSummary_print_specimen_label_button'}
                                                classes={{ sizeSmall: classes.printSpecimenbl }}
                                                onClick={handlePrintSpecimenLabel}
                                                children={
                                                    <>
                                                        <Print className={classes.rightIcon} />
                                                        Specimen Label
                                                    </>
                                                }
                                            />
                                        ) : null}
                                        {svcCd === SERVICE_CODE.EHS && (
                                            <>
                                                <MenuButton
                                                    style={{ margin: '-3px 10px 0px 15px', padding: '4px 20px' }}
                                                    label="More"
                                                    menuItems={[
                                                        {
                                                            label: 'Reprint Acknowledgement Letter',
                                                            id: 'reprint_ack_letter_btn',
                                                            onClick: () => {
                                                                if (commonUtilities.getEhsSharedComponentsStore()) {
                                                                    const { openPrintAcknowledgeLetterDialog } = commonUtilities
                                                                        .getEhsSharedComponentsStore()
                                                                        .getState().sharedComponents;
                                                                    commonUtilities
                                                                        .getEhsSharedComponentsStore()
                                                                        .dispatch(openPrintAcknowledgeLetterDialog(patientInfo, true));
                                                                }
                                                            },
                                                            visible: patientInfo?.ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_WAITING
                                                        }
                                                    ]}
                                                />
                                            </>
                                        )}
                                        <ClinicalDoc displayName="Document" />
                                        {svcCd === 'CGS' && (
                                            <CIMSButton
                                                id={'patientSummary_screening_info'}
                                                classes={{ sizeSmall: classes.screeningInfo }}
                                                onClick={handleScreeningInfo}
                                                disabled={props.docId === ''}
                                            >
                                                Screening Info
                                            </CIMSButton>
                                        )}
                                    </>
                                )}
                            </>
                        }
                    </div>
                </div>
                {svcCd === 'SHS' && dcbMachineNum ?
                    <div className={classes.buttonContainer} style={{ fontWeight: 'bold' }}>
                        {`This is a cashier. The machine number is ${dcbMachineNum}`}
                    </div> : null}
            </Grid>
            <Grid item container>
                {svcCd === 'SHS' || svcCd === 'CGS' ?
                    <ExpansionPanel
                        className={classes.expansionPanelRoot}
                        expanded={summarySectionsExpanded}
                        onChange={() => {
                            setSummarySectionsExpanded(!summarySectionsExpanded);
                        }}
                    >
                        <ExpansionPanelSummary
                            id={'patientSummary_summarySections_summary'}
                            classes={{
                                root: classes.expansionPanelSummaryRoot,
                                expandIcon: classes.expansionPanelSummaryIcon
                            }}
                            expandIcon={<ExpandMore id={'patientSummary_summarySections_expandIcon'} />}
                        >
                            <label className={classes.expansionPanelSummaryLabel}>{'PMI Details'}</label>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails
                            className={classes.expansionPanelDetails}
                        >
                            <Grid item container alignItems="baseline">
                                {summarySections}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                :
                    <Grid item container alignItems="baseline">
                        {summarySections}
                    </Grid>
                }
            </Grid>
            {svcCd === 'SHS' || (svcCd === 'CGS' && isClinicalBaseRole) ?
                <Grid item container>
                    <PatientSummaryShortcutPanel />
                </Grid>
            : null}
            <Grid item container>
                <ApptDetails
                    serviceList={serviceList}
                    handleSkipTab={handleSkipTab}
                    handleSkipTabForDts={handleSkipTabForDts}   //DH Edwin
                    handleAddTab={handleAddTab} // DH Anthony
                    getAppointmentReport={getAppointmentReport}
                    getSppApptSlipReport={getSppApptSlipReport}
                    refreshApptList={refreshApptList}
                    checkPatientSvcExits={checkPatientSvcExits}
                    clinicConfig={props.clinicConfig}
                    openCommonMessage={openCommonMessage}
                    openViewLog={() => updateViewLog({ open: true })}
                    allServiceCheck={allServiceCheck}
                    setAllServiceCheck={setAllServiceCheck}
                    address={getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
                    patientSvcExist={patientSvcExist}
                    isReadOnly={props.isPmiSummaryReadOnly}
                />
            </Grid>
            <ApptAssociationConfirmDialog
                isOpen={apptAssociationConfirmDialogConfig.isOpen}
                apptData={apptAssociationConfirmDialogConfig.apptData}
                btnClick={apptAssociationConfirmDialogBtnClick}
            />

            {/* DH Miki */}
            {openDtsEncounterHistoryDialog && (
                <DtsEncounterHistoryDialog
                    id={'DtsEncounterHistoryDialog'}
                    openConfirmDialog={openDtsEncounterHistoryDialog}
                    closeConfirmDialog={closeEncounterHistoryDialog}
                />
            )}
            {openDtsPrintChangeFormDialog && (
                <DtsPrintChangeFormDialog
                    id={'DtsPrintChangeFormDialog'}
                    address={getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
                    openConfirmDialog={openDtsPrintChangeFormDialog}
                    patientPhoneCallBack={getPatientPhone}
                    closeConfirmDialog={closePrintChangeFormDialog}
                />
            )}
            {openDtsPrintPmiBarcodeDialog && (
                <DtsPrintPmiBarcodeDialog
                    id={'DtsPrintPmiBarcodeDialog'}
                    openConfirmDialog={openDtsPrintPmiBarcodeDialog}
                    closeConfirmDialog={closePrintPmiBarcodeDialog}
                    pmiBarcodeData={dtsPmiBarcodeData}
                />
            )}
            {openDtsPrintPmiAddressDialog && (
                <DtsPrintPmiAddressFormDialog id={'DtsPrintPmiAddressDialog'} openConfirmDialog={openDtsPrintPmiAddressDialog} closeConfirmDialog={closePrintPmiAddressDialog} />
            )}
            {openDtsPrintDH65LabelDialog && (
                <DtsPrintDH65LabelDialog
                    id={'DtsPrintDH65LabelDialog'}
                    openConfirmDialog={openDtsPrintDH65LabelDialog}
                    closeConfirmDialog={closePrintDH65LabelDialog}
                    dh65LabelData={dtsDH65LabelData}
                    address={getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
                />
            )}
            {/* DH Miki */}
            <ViewLogDialog
                open={viewLogState.open}
                rowData={viewLogState.apptList}
                getViewLogList={props.getViewLogList}
                onClose={() => {
                    props.auditAction('Close Appointment Detail View Log', null, null, false, 'ana');
                    updateViewLog({ open: false, apptList: null });
                }}
                deleteReasonsList={deleteReasonsList}
                quotaConfig={quotaConfig}
                svcCd={svcCd}
            />
            <GumLabelPreview
                id={'gum_label_preview_dialog'}
                previewData={gumLabelPrintReqParams}
                openGumLabel={openGumLabel}
                closePreviewDialog={closePreviewDialog}
            />
            <ScreeningInfoDialog
                id={'screening_info_dialog'}
                isScreeningInfoDialogOpen={isScreeningInfoDialogOpen}
                closeScreeningInfoDialog={closeScreeningInfoDialog}
            />
            {antSvcInfoDialogSts.open ?
                <AnServiceIDDialog
                    open={antSvcInfoDialogSts.open}
                    pageSts={antSvcInfoDialogSts.pageSts}
                    alias={antSvcInfoDialogSts.alias}
                    encntrGrpCd={antSvcInfoDialogSts.encntrGrpCd}
                    closeAntSvcInfoDialog={closeAntSvcInfoDialog}
                />
                : null}
            {svcCd === 'ANT' ?
                <Grid item container className={classes.spacing1Grid}>
                    <BlockInfo
                        id={'patientSummary_other_appointment'}
                        title={'Other Appointment Details'}
                        isReadOnly={props.isPmiSummaryReadOnly}
                        noBorder
                        handleOnEdit={() => {
                            if (anSvcIdIsActive) {
                                props.auditAction('click eidt other appointment details hyper link', null, null, false, 'ana');
                                setOpenEditOtherApptDetailsDialog(true);
                            }
                        }}
                        showLog
                        handleOpenLog={() => {
                            if (anSvcIdIsActive) {
                                props.auditAction('click other appointment details log hyper link', null, null, false, 'ana');
                                setOpenOtherApptDetailsLog(true);
                            }
                        }}
                        comDisable={anSvcIdIsActive === false}
                    >
                        <OtherAppointmentDetails
                            id={'patientSummary_other_appointment_details'}
                            otherApptDetails={otherAppointmentDetailsList}
                            antSvcInfo={antSvcInfo}
                        />
                    </BlockInfo>
                </Grid>
                : null}
            {svcCd === 'ANT' && openOtherApptDetailsLog ?
                <OtherAppointmentDetailsLog
                    id={'patientSummary_other_appointment_detail_log'}
                    open={openOtherApptDetailsLog}
                    otherAppointmentDetailLog={otherAppointmentDetailLog}
                    auditAction={props.auditAction}
                    closeDialog={() => {
                        setOpenOtherApptDetailsLog(false);
                        listOthApptDtl();
                    }}
                />
                : null}
            {svcCd === 'ANT' && openEditOtherApptDetailsDialog ?
                <EditAppointmentDetailsDialog
                    id={'patientSummary_edit_other_appointment_detail_dialog'}
                    open={openEditOtherApptDetailsDialog}
                    otherApptDetails={otherAppointmentDetailsList}
                    closeDialog={() => {
                        setOpenEditOtherApptDetailsDialog(false);
                        listOthApptDtl();
                    }}
                    openOtherApptDetailsLog={setOpenOtherApptDetailsLog}
                />
                : null}
            {openSelectEncntrGrpDialog ?
                <SelectEncntrGrpDialog
                    open={openSelectEncntrGrpDialog}
                    closeDialog={()=>{
                        setOpenSelectEncntrGrpDialog(false);
                    }}
                    confirmCallback={selectEncntrGrpDialogProps.confirmCallback}
                /> : null}
            {
                svcCd === 'SHS' ?
                    approvalDialogParams.isOpen ?
                        <UnexpectedEnctrApprlDialog
                            appointment={linkPmiData}
                            approvalDialogParams={approvalDialogParams}
                            confirmCallback={confirmPmiLinkage}
                            handleUpdateApprovalDialogParams={handleUpdateApprovalDialogParams}
                        /> : null
                    : null
            }
        </Grid>
    );
});

const mapStateToProps = state => {
    return {
        patientInfo: state.patient.patientInfo,
        caseNoInfo: state.patient.caseNoInfo,
        commonCodeList: state.common.commonCodeList,
        countryList: state.patient.countryList,
        clinicList: state.common.clinicList,
        isAutoGen: state.caseNo.isAutoGen,
        serviceCd: state.login.service.serviceCd,
        clinicConfig: state.common.clinicConfig,
        ecs: ecsSelector(state, patientInfoSelector, patientKeySelector),
        ocsss: ocsssSelector(state, patientInfoSelector, patientKeySelector),
        mwecs: mwecsSelector(state, patientInfoSelector, patientKeySelector),
        ecsResult: state.ecs.selectedPatientEcsStatus,
        ocsssResult: state.ecs.selectedPatientOcsssStatus,
        mwecsResult: state.ecs.selectedPatientMwecsStatus,
        serviceList: state.common.serviceList,
        siteId: state.login.clinic.siteId,
        linkPmiData: state.bookingInformation.linkPmiData,
        svcCd: state.login.service.svcCd,
        appointmentHistory: state.patient.appointmentHistory,
        openDtsPrintPmiBarcodeDialog: state.dtsPatientSummary.openDtsPrintPmiBarcodeDialog, //DH Anthony
        dtsPmiBarcodeData: state.dtsPatientSummary.pmiBarcodeData, //DH Anthony
        openDtsPrintDH65LabelDialog: state.dtsPatientSummary.openDtsPrintDH65LabelDialog, // DH Miki
        dtsDH65LabelData: state.dtsPatientSummary.dh65LabelData, // DH Miki
        defaultRoomId: state.patient.defaultRoomId, //DH Anthony
        rooms: state.common.rooms, //DH Anthony
        viewLogState: state.patient.patientSummaryViewLog,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        deleteReasonsList: state.common.deleteReasonsList,
        clinic: state.login.clinic,
        accessRights: state.login.accessRights, //DH Anthony
        subTabs: state.mainFrame.subTabs,
        curCloseTabMethodType: state.mainFrame.curCloseTabMethodType,
        patientSvcExist: state.patient.patientSvcExist,
        patientStatusList: state.common.commonCodeList.patient_status,
        encounterTypes: state.common.encounterTypes,
        quotaConfig: state.common.quotaConfig,
        cncPreloadData: state.dtsPreloadData.cncCodeList,
        encounterHistory: state.dtsPatientSummary.encounterHistory,
        caseStsChangeRsns: state.anSvcId.caseStsChangeRsns,
        antSvcInfo: state.patient.patientInfo.antSvcInfo,
        gumLabelPrintReqParams: state.patient.gumLabelPrintReqParams,
        siteParams: state.common.siteParams,
        encntrGrpList:state.caseNo.encntrGrpList,
        loginUserRoleList: state.common.loginUserRoleList,
        aliasRule:state.caseNo.aliasRule,
        isPmiSummaryReadOnly: (state.mainFrame.subTabsActiveKey === accessRightEnum.patientSummaryReadOnly),  //CIMST-3088 add new module PMI Summary (Read Only)
        pucChecking: state.patient.pucChecking,
        dcbMachineNum: state.common.spaRcp && state.common.spaRcp.rcpMachine && state.common.spaRcp.rcpMachine.dcbMachineNum || '',
        isClinicalBaseRole: state.login.loginInfo.isClinicalBaseRole,
        docId: state.registration.docId
    };
};

const mapDispatchToProps = {
    getPatientPanelPatientById,
    openCaseNoDialog,
    skipTab,
    resetAll,
    openCommonCircular,
    closeCommonCircular,
    openMwecsDialog,
    openEcsDialog,
    openOcsssDialog,
    checkOcsss,
    checkMwecs,
    checkEcs,
    refreshServiceStatus,
    listAppointmentHistory,
    getAppointmentReport,
    getSppApptSlipReport,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    patientSummaryEditPatient,
    updatePmiData,
    anonymousAppointmentPmiLinkage,
    dtsOpenPreviewWindow, //DH Anthony
    dtsUpdateState, //DH Anthony
    openCommonMessage,
    setRedirect, //DH Anthony
    dtsGetPmiLabel, //DH Anthony
    dtsSetAddressLabel, // DH Miki
    dtsGetDH65Label, // DH Miki
    updateState,
    getViewLogList,
    getCodeList,
    addTabs, // //DH Anthony
    refreshPatient,
    auditAction,
    checkPatientSvcExist,
    dtsGetEncounterHistory,
    getDeliveryHospital,
    getCaseStsChangeRsns,
    listOtherAppointmentDetail,
    listOtherAppointmentDetailLog,
    updateCaseNoState,
    deleteSubTabs,
    updateMainFrame,
    changeTabsActive,
    printPatientSpecimenLabel,
    checkApptWithEncntrCaseStatus,
    logShsEncntrCase,
    fetchScreeningInfo,
    getPatientBannerData
};

export default connect(mapStateToProps, mapDispatchToProps)(PatientSummary);
