import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _, { stubTrue } from 'lodash';
import {
    Grid,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    Typography,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Box,
    IconButton,
    Tooltip
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ExpandMore, Autorenew } from '@material-ui/icons';
import HistoryList from '../../certificate/component/historyList';
import ReissueCertBtn from './component/reIssueCertBtn';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import Notes from './component/notes';
import Enum from '../../../enums/enum';
import ClientServiceViewEnum from '../../../enums/payment/clientServiceView/clientServiceViewEnum';
import accessRightEnum from '../../../enums/accessRightEnum';
import CIMSSelect from '../../../components/Select/CIMSSelect';
import ClientServiceViewRemark from './component/remarkDialog';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import {
    listCsnHistory,
    getRcpCsnItem,
    updateRcpCsnRemark,
    submitRcpCsn,
    resetAll,
    updateField,
    printCSV
} from '../../../store/actions/payment/clientServiceView/clientServiceViewAction';
import { deleteSubTabs, updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';
import { hasSpecificRole } from '../../../utilities/userUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as ClientServiceViewUtil from '../../../utilities/clientServiceViewUtilities';
import * as CommonUtil from '../../../utilities/commonUtilities';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import AlsDesc from '../../../constants/ALS/alsDesc';
import { auditAction } from '../../../store/actions/als/logAction';
import { isClinicalBaseRole, getBaseRole } from '../../../utilities/userUtilities';

const styles = (theme) => ({
    expansionPanelRoot: {
        marginTop: 0,
        marginBottom: 10,
        backgroundColor: '#ccc'
    },
    expansionPanelSummaryRoot: {
        backgroundColor: '#0579c8',
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
        backgroundColor: theme.palette.cimsBackgroundColor
    },
    total: {
        fontSize: '1rem',
        fontWeight: 'bold',
        marginTop: 8
    }
});

function hasTargetRole(loginInfo, roleName) {
    let hasRole = hasSpecificRole(loginInfo.userDto, roleName);
    return hasRole;
}

class ClientServiceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notesBk: null,
            renderFlag: true,
            saveType: 'S'
        };
    }

    componentDidMount() {
        this.listCsnHistory();
        this.props.updateField({ selectedSite: '*All' });
        this.isUseCaseNo = CommonUtil.isUseCaseNo();
        this.checkValidCaseNo();
        this.props.updateCurTab(accessRightEnum.clientServiceView, this.doClose);
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    listCsnHistory = () => {
        const patientKey = this.props.patientInfo.patientKey;
        // this.props.listCsnHistory(patientKey, (noteData) => {
        //     this.setState({ notesBk: noteData });
        // });
        this.props.listCsnHistory(patientKey);
    }

    doClose = (callback, doCloseParams) => {
        const { noteData, noteDataBk } = this.props;
        // const { notesBk } = this.state;
        let menuName = CommonUtil.getMenuLabel(accessRightEnum.clientServiceView);
        let isDirty = true;
        if (noteDataBk) {
            isDirty = ClientServiceViewUtil.checkItemIsDirty(noteData, noteDataBk);
        }
        if (isDirty) {
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                    this.props.openCommonMessage({
                        msgCode: '110033',
                        params: [{ name: 'PAGENAME', value: menuName }],
                        btnActions: {
                            btn1Click: () => {
                                this.refs.noteFormRef.submit(null, () => {
                                    this.listCsnHistory();
                                    this.props.updateField({ totalAmount: 0 });
                                    setTimeout(() => {
                                        this.inCompleteChecking(() => {
                                            callback && callback(true);
                                        });
                                    }, 500);

                                });
                            },
                            btn2Click: () => {
                                setTimeout(() => {
                                    this.inCompleteChecking(() => { callback && callback(true); });
                                }, 200);
                            }
                        }
                    });
                    break;
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    this.refs.noteFormRef.submit(null, callback);
                    break;
            }
        }
        else {
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                    this.inCompleteChecking(() => { callback && callback(true); });
                    break;
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    callback && callback(true);
                    break;
            }
        }
    }

    inCompleteChecking = (func) => {
        const { noteDataBk, loginInfo } = this.props;
        const hasBaseNurseRole = hasTargetRole(loginInfo, 'CIMS-NURSE');
        if (hasBaseNurseRole) {
            const hasInCompleteNote = ClientServiceViewUtil.checkHasIncompleteItem(noteDataBk);
            if (hasInCompleteNote) {
                this.props.openCommonMessage({
                    msgCode: '111407',
                    btnActions: {
                        btn1Click: () => {
                            func && func();
                        }
                    }
                });
            } else {
                func && func();
            }
        } else {
            func && func();
        }
    }

    checkValidCaseNo = () => {
        if (this.isUseCaseNo) {
            const { caseNoInfo } = this.props;
            if (!caseNoInfo || !caseNoInfo.caseNo) {
                this.props.openCommonMessage({
                    msgCode: '111223',
                    btnActions: {
                        btn1Click: () => { this.props.deleteSubTabs(accessRightEnum.clientServiceView); }
                    }
                });
            }
        }
    }

    handleAddRemark = (remark) => {
        this.props.updateField({ remark, openRemarkFlag: false });
    }

    handleCloseRemarkDialog = () => {
        this.props.auditAction('Close Client Service View Remarks Dialog');
        this.props.updateField({ openRemarkFlag: false });
    }

    prepareNoteData = (note) => {
        if (typeof note.unitCharge === 'string') {
            note.unitCharge = parseInt(note.unitCharge);
        }

        if (typeof note.totalCharge === 'string') {
            note.totalCharge = parseInt(note.totalCharge);
        }

        if (note.isChangeChargeCd !== undefined) {
            delete note.isChangeChargeCd;
        }

        note.treatmentDtm = moment(note.treatmentDtm).isValid() ? moment(note.treatmentDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        return note;
    }

    handleSubmitRcpCsn = (e, closeTab) => {
        const { noteData, noteDataBk, curCsn, caseNoInfo, patientInfo, clinic, remark, loginInfo } = this.props;
        const { saveType } = this.state;
        let _noteData = _.cloneDeep(noteData);
        let rcpThsCsnItemDtoList = [];
        const hasDoctorBaseRole = hasTargetRole(loginInfo, 'CIMS-DOCTOR');
        for (let i = 0; i < _noteData.length; i++) {
            let note = _noteData[i];
            let noteBk = noteDataBk[i];

            if (hasDoctorBaseRole) {
                if (note.catgryCd !== ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation &&
                    note.catgryCd !== ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate) {
                    let _note = this.prepareNoteData(note);
                    rcpThsCsnItemDtoList.push(_note);
                } else {
                    if (ClientServiceViewUtil.checkItemIsDirty(note, noteBk)) {
                        let _note = this.prepareNoteData(note);
                        rcpThsCsnItemDtoList.push(_note);
                    }
                }
            } else {
                if (ClientServiceViewUtil.checkItemIsDirty(note, noteBk)) {
                    let _note = this.prepareNoteData(note);
                    rcpThsCsnItemDtoList.push(_note);
                }
            }

        }

        let csnItem = null;
        if (!curCsn) {
            // init a new csn item.
            csnItem = {
                // csnId: csnItem.csnId,
                caseNo: caseNoInfo.caseNo,
                patientKey: patientInfo.patientKey,
                remark: remark,
                svcCd: clinic.svcCd,
                siteId: clinic.siteId
            };
        }
        else {
            csnItem = {
                csnId: curCsn.csnId,
                caseNo: curCsn.caseNo,
                patientKey: curCsn.patientKey,
                remark: remark,
                svcCd: clinic.svcCd,
                siteId: clinic.siteId,
                version: curCsn.version
            };
        }
        let submitRcpCsnParams = {
            ...csnItem,
            rcpThsCsnItemDtoList
        };
        const callback = (data) => {
            if (closeTab) {
                closeTab(true);
            } else {
                if (saveType === 'SP') {
                    const printCSVParam = {
                        patientKey: patientInfo.patientKey,
                        csnId: data,
                        age: patientInfo.age + patientInfo.ageUnit[0],
                        caseNo: caseNoInfo.caseNo
                    };
                    // console.log('watch save and print',printCSVParam);
                    this.props.printCSV(printCSVParam);
                    this.setState({ saveType: 'S' });
                }
                this.listCsnHistory();
                this.props.updateField({ totalAmount: 0 });
            }
        };

        // console.log('watch submit', rcpThsCsnItemDtoList);
        this.props.submitRcpCsn(submitRcpCsnParams, callback);
    }

    handleHistoryListItemClick = (value, rowData) => {
        if (rowData) {
            const callback = (noteData) => {
                this.props.updateField({
                    selectedHistoryIdx: value,
                    curCsn: rowData,
                    waiveAllType: '',
                    remark: rowData.remark || null,
                    noteDataBk: noteData,
                    remarkBk: rowData.remark || null
                });
                // this.setState({ notesBk: noteData });
                // this.props.updateField({ noteDataBk: noteData, remarkBk: rowData.remark });
            };

            const params = {
                caseNo: rowData.caseNo,
                patientKey: rowData.patientKey

            };
            this.props.getRcpCsnItem(params, callback);
        } else {
            this.props.updateField({
                selectedHistoryIdx: value,
                curCsn: null,
                noteData: null,
                waiveAllType: '',
                isPaidAll: false,
                remarkBk: null
            });
        }
    }

    handleHistoryChange = (value, name) => {
        let updateData = { [name]: value };
        if (name === 'selectedSite') {
            updateData = {
                selectedHistoryIdx: '',
                curCsn: null,
                noteData: null,
                waiveAllType: '',
                isPaidAll: false,
                ...updateData
            };
        }
        this.props.updateField(updateData);
    }

    handleWaiveAll = (value) => {
        const { waiveAllType, noteDataBk } = this.props;
        let _noteData = _.cloneDeep(this.props.noteData);
        let newWaiveAllType = waiveAllType;
        // const { notesBk } = this.state;
        if (value !== waiveAllType || value === '') {
            newWaiveAllType = value;
            _noteData.forEach((note, idx) => {
                let isDirty = true;
                if (noteDataBk) {
                    const bk = noteDataBk[idx];
                    isDirty = ClientServiceViewUtil.checkItemIsDirty(note, bk);
                }
                const noteIsPaid = ClientServiceViewUtil.itemIsPaid(note, isDirty);
                if (!noteIsPaid) {
                    if (note.isComplete !== 1) {
                        note.waiveType = value;
                        if (value !== '') {
                            note.totalCharge = '0';
                        } else {
                            note.totalCharge = ClientServiceViewUtil.countItemAmount(note);
                        }
                    }
                }
            });
        }
        this.props.updateField({ noteData: _noteData, waiveAllType: newWaiveAllType });
    }

    handlePaidAll = (e) => {
        const checked = e.target.checked;
        let _noteData = _.cloneDeep(this.props.noteData);
        let isPaidAll = checked;
        // const { notesBk } = this.state;
        const { noteDataBk } = this.props;

        _noteData.forEach((note, idx) => {
            let isDirty = true;
            if (noteDataBk) {
                const bk = noteDataBk[idx];
                isDirty = ClientServiceViewUtil.checkItemIsDirty(note, bk);
            }
            if (note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate) {
                if (note.isComplete !== 1) {
                    note.isPaid = checked ? 1 : '';
                    note.paidDtm = checked ? moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK) : '';
                }
            } else {
                const noteIsPaid = ClientServiceViewUtil.itemIsPaid(note, isDirty);
                if (!noteIsPaid) {
                    if (note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation) {
                        const noteIsCompleted = ClientServiceViewUtil.itemIsCompleted(note, isDirty);
                        if (!noteIsCompleted) {
                            note.isComplete = checked ? 1 : '';
                            note.completeDtm = checked ? moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK) : '';
                            note.isPaid = checked ? 1 : '';
                            note.paidDtm = checked ? moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK) : '';
                        }
                    } else {
                        note.isPaid = checked ? 1 : '';
                        note.paidDtm = checked ? moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK) : '';
                    }
                }
            }

        });
        this.props.updateField({ noteData: _noteData, isPaidAll });
    }

    handleRefresh = () => {
        this.listCsnHistory();
    }

    reItemOnClick = (item) => {
        const { thsCharges, encounterInfo } = this.props;
        this.props.auditAction('Click ' + item.chargeDesc + ' Button');
        let _noteData = _.cloneDeep(this.props.noteData);
        _noteData = ClientServiceViewUtil.loadReissueItem(_noteData, item.chargeCd, thsCharges, encounterInfo);
        let isPaidAll = ClientServiceViewUtil.checkPaidAll(_noteData);
        let autoFocusIdx = _noteData.length - 1;
        this.props.updateField({ noteData: _noteData, isPaidAll, autoFocusIdx });
    }

    render() {
        const {
            classes,
            serviceList,
            clinicList,
            openRemarkFlag,
            curCsn,
            rcpCsnHistoryList,
            selectedHistoryIdx,
            selectedSite,
            noteData,
            noteDataBk,
            loginInfo,
            open,
            waiveAllType,
            isPaidAll,
            caseNoInfo,
            totalAmount,
            remark,
            remarkBk,
            encounterInfo
        } = this.props;
        const thsSite = clinicList.filter(item => item.svcCd === 'THS');
        const thsSvc = serviceList.filter(item => item.svcCd === 'THS');
        let historyList = rcpCsnHistoryList && rcpCsnHistoryList.filter(item => item.siteId === selectedSite);
        if (selectedSite === '*All') {
            historyList = rcpCsnHistoryList;
        }
        const noItemData = noteData ? noteData.length === 0 : true;
        const notesIsDirty = ClientServiceViewUtil.checkItemIsDirty(noteData, noteDataBk);
        const remarkIsDirty = ClientServiceViewUtil.checkItemIsDirty(remark, remarkBk);
        const isCurrentCaseNo = curCsn && caseNoInfo ? curCsn.caseNo === caseNoInfo.caseNo : stubTrue;
        const baseRole = getBaseRole(loginInfo.userDto);
        const isClinicalUser = (isClinicalBaseRole(loginInfo.userDto) || !baseRole) ? 'Y' : 'N';
        const hasDoctorBaseRole = hasTargetRole(loginInfo, 'CIMS-DOCTOR');
        const canSaveCSV = isCurrentCaseNo ? (hasDoctorBaseRole ? !noItemData : (notesIsDirty || remarkIsDirty) ? !noItemData : false) : false;

        let latestUpdateDtm = '';
        if (rcpCsnHistoryList && rcpCsnHistoryList[parseInt(selectedHistoryIdx)]) {
            let selected = rcpCsnHistoryList[parseInt(selectedHistoryIdx)];
            latestUpdateDtm = selected.updateDtm ? moment(selected.updateDtm).format(Enum.DATE_FORMAT_24) : '';
        }
        return (
            <Grid container alignItems="flex-start" wrap="nowrap" spacing={4} >
                <Grid item xs>
                    <HistoryList
                        open={open}
                        serviceCd={'THS'}
                        siteId={selectedSite}
                        selectedIndex={selectedHistoryIdx}
                        serviceList={thsSvc}
                        clinicList={thsSite}
                        data={historyList}
                        onListItemClick={this.handleHistoryListItemClick}
                        onChange={this.handleHistoryChange}
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
                                    <Grid item container justify="space-between">
                                        {
                                            item.encounterTypeCd && item.subEncounterTypeCd ?
                                                <Typography variant="body1">{`${item.encounterTypeCd} - ${item.subEncounterTypeCd}`}</Typography> : null
                                        }

                                    </Grid>
                                </Grid>
                            );
                        }}
                        disableSvc
                    />
                </Grid>
                <Grid item container style={{ width: '95%' }}>
                    <Grid item container>
                        <Grid item container xs={8}>
                            <Box display="flex" alignItems="baseline" id={'client_service_view_update_date'}>
                                <Box
                                    component="div"
                                    fontWeight="bold"
                                    fontSize="1.4rem"
                                    id={'client_service_view_update_date_title'}
                                >
                                    {'Update Date:'}&nbsp;&nbsp;
                                    </Box>
                                <Box
                                    component="div"
                                    fontWeight="bold"
                                    fontSize="1.1rem"
                                    id={'client_service_view_update_date_content'}
                                >
                                    {latestUpdateDtm ? moment(latestUpdateDtm).format(Enum.DATE_FORMAT_24_HOUR) : null}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item container xs={1} justify={'flex-end'}>
                            <Tooltip
                                title={
                                    <Typography>
                                        Refresh
                                    </Typography>
                                }
                                placement={'bottom'}
                            >
                                <IconButton
                                    color={'primary'}
                                    onClick={this.handleRefresh}
                                >
                                    <Autorenew />
                                </IconButton>
                            </Tooltip>

                        </Grid>
                        <Grid item container xs={3} spacing={2} alignContent={'center'}>
                            <Grid item xs={7}>
                                <CIMSSelect
                                    id={'client_service_view_waive'}
                                    options={ClientServiceViewEnum.WAIVE_TYPE.map(item => ({
                                        value: item.value, label: item.label
                                    }))}
                                    value={waiveAllType}
                                    TextFieldProps={{
                                        label: 'Waive All',
                                        variant: 'outlined'
                                    }}
                                    onChange={(e) => this.handleWaiveAll(e.value)}
                                    addNullOption
                                    isDisabled={!isCurrentCaseNo || noItemData}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <FormControl>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox color={'primary'}
                                                    checked={isPaidAll}
                                                    disabled={isClinicalUser === 'Y' || !isCurrentCaseNo || noItemData}
                                                    onClick={this.handlePaidAll}
                                                />
                                            }
                                            label={'Pay All'}
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                    <ExpansionPanel
                        square
                        defaultExpanded
                        className={classes.expansionPanelRoot}
                    >
                        <ExpansionPanelSummary
                            id={'client_service_view_note'}
                            classes={{
                                root: classes.expansionPanelSummaryRoot,
                                expandIcon: classes.expansionPanelSummaryIcon
                            }}
                            expandIcon={<ExpandMore id={'client_service_view_note_expandIcon'} />}
                        >
                            <label className={classes.expansionPanelSummaryLabel}>Client Service View</label>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails
                            className={classes.expansionPanelDetails}
                        >
                            <Grid container>
                                <ValidatorForm
                                    id={'client_service_view_form'}
                                    style={{ width: '100%' }}
                                    ref={'noteFormRef'}
                                    focusFail
                                    onSubmit={this.handleSubmitRcpCsn}
                                >
                                    <Notes
                                        id={'client_service_view_note'}
                                        isCurrentCaseNo={isCurrentCaseNo}
                                        notesBk={noteDataBk}
                                        isClinicalUser={isClinicalUser}
                                    />
                                </ValidatorForm>
                            </Grid>
                        </ExpansionPanelDetails>

                    </ExpansionPanel>
                    <Grid item container justify={'flex-end'}>
                        <Grid item container xs={5} justify={'flex-end'}>
                            <Grid item container xs={3} alignItems="center" justify="flex-end">
                                <Box className={classes.total}>Total:</Box>
                            </Grid>
                            <Grid item container alignItems="center" justify="center" style={{ width: open ? '7.25vw' : '7.75vw' }} id={'client_service_view_note_total_amount'}>
                                <Box className={classes.total}>{totalAmount}</Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            <ReissueCertBtn
                                id={'client_service_view_reissue_certificate_button'}
                                key={'client_service_view_reissue_certificate_button'}
                                disabled={!isCurrentCaseNo || JSON.stringify(encounterInfo) === '{}' || !noteData}
                                reItemOnClick={this.reItemOnClick}
                            />,
                            {
                                id: 'client_service_view_remarks_button',
                                name: 'Remarks ',
                                onClick: () => {
                                    this.props.auditAction('Click Remarks Button');
                                    this.props.updateField({ openRemarkFlag: true });
                                },
                                disabled: noItemData
                            },
                            {
                                id: 'client_service_view_save_button',
                                name: 'Save',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.SAVE);
                                    this.refs.noteFormRef.submit();
                                },
                                disabled: !canSaveCSV
                            },
                            {
                                id: 'client_service_view_save_and_print_button',
                                name: 'Save & Print',
                                onClick: () => {
                                    this.props.auditAction('Click Save And Print Button');
                                    this.setState({
                                        saveType: 'SP'
                                    });
                                    this.refs.noteFormRef.submit();
                                },
                                disabled: !canSaveCSV
                            },
                            {
                                id: 'client_service_view_cancel_button',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.CANCEL);
                                    this.props.deleteSubTabs(accessRightEnum.clientServiceView);
                                }
                            }
                        ]
                    }
                />
                <ClientServiceViewRemark
                    id={'client_service_view'}
                    openRemarkFlag={openRemarkFlag}
                    dialogTitle={'Client Service View Remarks'}
                    // remarkValue={curCsn ? curCsn.remark : ''}
                    remarkValue={remark}
                    isCurrentCaseNo={isCurrentCaseNo}
                    inputRow={6}
                    // handleRemarkChange={(e) => { this.handleRemarkChange(e); }}
                    // handleSaveRemark={this.handleUpdateRemark}
                    handleAddRemark={this.handleAddRemark}
                    handleCloseRemarkDialog={this.handleCloseRemarkDialog}
                />
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        caseNoInfo: state.patient.caseNoInfo,
        patientInfo: state.patient.patientInfo,
        clinic: state.login.clinic,
        loginInfo: state.login.loginInfo,
        accessRights: state.login.accessRights,
        encounterInfo: state.patient.encounterInfo,
        ...state.clientSvcView
    };
};

const dispatch = {
    listCsnHistory,
    getRcpCsnItem,
    updateRcpCsnRemark,
    submitRcpCsn,
    resetAll,
    updateField,
    deleteSubTabs,
    openCommonMessage,
    updateCurTab,
    auditAction,
    printCSV
};

export default connect(mapState, dispatch)(withStyles(styles)(ClientServiceView));