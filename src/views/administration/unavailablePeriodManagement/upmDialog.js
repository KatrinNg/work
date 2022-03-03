import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import _ from 'lodash';
import memoize from 'memoize-one';
import {
    updateState,
    resetAll,
    createUpm,
    resetDialogInfo,
    updateUpm
} from '../../../store/actions/administration/unavailablePeriodManagement/index';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import { Grid, FormControlLabel } from '@material-ui/core';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import FastTimePicker from '../../../components/DatePicker/FastTimePicker';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import Enum from '../../../enums/enum';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import { CommonUtil, EnctrAndRmUtil } from '../../../utilities';
import { auditAction } from '../../../store/actions/als/logAction';
import { isClinicalAdminSetting } from '../../../utilities/userUtilities';

const styles = theme => ({
    createForm: {
        width: 1000,
        paddingTop: 20,
        overflow: 'hidden'
    },
    form_input: {
        width: '100%'
    },
    roomInput: {
        display: 'flex',
        fontSize: props => props.isSmallSize ? '10pt' : '12pt',
        height: 'auto'
    }
});

class UpmDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isOpenAssignedRoomDialog: false
        };
    }

    componentDidMount() {
        if (this.props.isAssignRoom) {
            this.props.updateState({ autofocus: true });
        }
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.autofocus !== this.props.autofocus) && this.props.autofocus === true) {
            this.assginRoomRef.focus();
            this.props.updateState({ autofocus: false });
        }
    }

    handleClose = () => {
        this.props.updateState({ dialogOpen: false, dialogName: '', isAssignRoom: false, autofocus: false });
        this.props.resetDialogInfo();
    }

    handleChange = (value, name) => {
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        if (name === 'dialogAssginedRoomList') {
            let _dialogAssginedRoomList = [];
            if (value) {
                value.forEach(item => {
                    _dialogAssginedRoomList.push(item.value);
                });
            } else {
                _dialogAssginedRoomList = [];
            }
            dialogInfo[name] = _dialogAssginedRoomList;
        } else if (name === 'dialogIsWholeService' || name === 'dialogIsWholeClinic') {
            if (value === 1) {
                dialogInfo['dialogAssginedRoomList'] = [];
                if (name === 'dialogIsWholeService') {
                    dialogInfo['dialogSiteId'] = '*All';
                    dialogInfo['dialogIsWholeClinic'] = 0;
                }
            } else {
                if (name === 'dialogIsWholeService') {
                    dialogInfo['dialogSiteId'] = '';
                }
            }
            dialogInfo[name] = value;
        } else if (name === 'dialogIsWholeDay') {
            if (value === 1) {
                dialogInfo['dialogStartTime'] = null;
                dialogInfo['dialogEndTime'] = null;
            }
            dialogInfo[name] = value;
        } else if (name === 'dialogSiteId') {
            if (value === '*All') {
                dialogInfo['dialogIsWholeService'] = 1;
                dialogInfo['dialogIsWholeClinic'] = 0;
            }
            dialogInfo['dialogAssginedRoomList'] = [];
            dialogInfo[name] = value;
        } else if (name === 'dialogStartDate') {
            if (moment(value).isAfter(moment(dialogInfo.dialogEndDate))) {
                dialogInfo['dialogEndDate'] = null;
                this.edateInputRef.focus();
            }
            dialogInfo[name] = value;
        } else if (name === 'dialogEndDate') {
            if (moment(value).isBefore(moment(dialogInfo.dialogStartDate))) {
                dialogInfo['dialogStartDate'] = null;
                this.sdateInputRef.focus();
            }
            dialogInfo[name] = value;
        } else {
            dialogInfo[name] = value;
        }
        this.props.updateState({ dialogInfo: dialogInfo });
    }

    handleTimeChange = (e, name) => {
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        dialogInfo[name] = e;
        this.props.updateState({ dialogInfo: dialogInfo });
    }

    handleSubmit = () => {
        this.refs.form.submit();
    }

    handleSave = () => {
        const { dialogInfo, clinicList, serviceCd, currentSelectedId } = this.props;
        const _clinicList = CommonUtil.getClinicListByServiceCode(clinicList, serviceCd);
        let siteIdList = _clinicList.map(item => item.siteId);
        if (this.props.dialogName === 'Update Unavailable Period') {
            // update upm
            let params = {
                unavailPerdId: currentSelectedId,
                svcCd: dialogInfo.currentSelectedSvcCd,
                isWhl: dialogInfo.dialogIsWholeClinic,
                isWhlDay: dialogInfo.dialogIsWholeDay,
                sdt: moment(moment(dialogInfo.dialogStartDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) + (dialogInfo.dialogIsWholeDay ? '' : (' ' + moment(dialogInfo.dialogStartTime).format('HH:mm:ss')))).format(Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK),
                edt: moment(moment(dialogInfo.dialogEndDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) + (dialogInfo.dialogIsWholeDay ? '' : (' ' + moment(dialogInfo.dialogEndTime).format('HH:mm:ss')))).format(Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK),
                assignedRoomIds: (dialogInfo.dialogIsWholeService || dialogInfo.dialogIsWholeClinic) ? [] : dialogInfo.dialogAssginedRoomList,
                unavailPerdRsnId: dialogInfo.dialogReason,
                remark: dialogInfo.dialogRemark,
                status: dialogInfo.status,
                version: dialogInfo.version
            };
            this.props.auditAction('Save Unavailable Period Update', null, null, false);
            this.props.updateUpm(currentSelectedId, params, () => {
                this.handleClose();
                this.props.updateState({ currentSelectedIsWholeClinic: params.isWhl });
                this.props.listUpmList();
            });
        } else {
            // create upm
            let params = {
                svcCd: this.props.serviceCd,
                siteIds: (dialogInfo.dialogSiteId === '*All') ? siteIdList : [dialogInfo.dialogSiteId],
                wholeServiceFlag: dialogInfo.dialogIsWholeService,
                wholeDayFlag: dialogInfo.dialogIsWholeDay,
                wholeClinicFlag: dialogInfo.dialogIsWholeClinic,
                startDate: moment(dialogInfo.dialogStartDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                endDate: moment(dialogInfo.dialogEndDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                startTime: dialogInfo.dialogStartTime && moment(dialogInfo.dialogStartTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                endTime: dialogInfo.dialogStartTime && moment(dialogInfo.dialogEndTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                assignedRoomIds: (dialogInfo.dialogIsWholeService || dialogInfo.dialogIsWholeClinic) ? [] : dialogInfo.dialogAssginedRoomList,
                unavailPerdRsnId: dialogInfo.dialogReason,
                remark: dialogInfo.dialogRemark
            };
            this.props.auditAction('Create Unavailable Period', null, null, false);
            this.props.createUpm(params, () => {
                this.handleClose();
                this.props.deselectAllFnc();
                this.props.listUpmList();
            });
        }
    }

    isDateValid = () => {
        const { dialogStartDate, dialogEndDate } = this.props.dialogInfo;
        if (moment(dialogStartDate).isValid()
            && moment(dialogEndDate).isValid()
            && !CommonUtil.isToDateBefore(dialogStartDate, dialogEndDate)) {
            return true;
        }
        return false;
    }

    timeValid = (val, name) => {
        const { dialogStartTime, dialogEndTime } = this.props.dialogInfo;
        let sTime = dialogStartTime, eTime = dialogEndTime;
        if (name === 'dialogStartTime') {
            sTime = val;
        } else {
            eTime = val;
        }
        if (moment(sTime || null).isValid() && moment(eTime || null).isValid()) {
            let sm = moment().set({
                hours: moment(sTime).get('hours'),
                minutes: moment(sTime).get('minutes'),
                seconds: 0
            });
            let em = moment().set({
                hours: moment(eTime).get('hours'),
                minutes: moment(eTime).get('minutes'),
                seconds: 0
            });
            // return !CommonUtil.isSameTime(sm, em) && !CommonUtil.isFromDateAfter(sm, em);
            return moment(sm).isBefore(moment(em));
        }
        return true;
    }

    loadAvailSiteOpts = (clinicList, serviceCd, isClinicalAdmin, clinic) => {
        let _clinicList = [];
        if (isClinicalAdminSetting()) {
            let curClinic = clinicList.find(item => item.siteId === clinic.siteId);
            _clinicList.push(curClinic);
        } else {
            _clinicList = CommonUtil.getClinicListByServiceCode(clinicList, serviceCd);
            _clinicList.sort((a, b) => {
                return a.clinicName.localeCompare(b.clinicName);
            });
        }
        let siteOptions = _clinicList && _clinicList.map(item => (
            { value: item.siteId, label: item.clinicName }
        ));
        siteOptions == siteOptions && siteOptions.unshift({
            label: 'For All Clinic',
            value: '*All'
        });
        return siteOptions;
    }

    getFilterRooms = memoize((rooms, siteId) => {
        let _rooms = _.cloneDeep(rooms);
        if (siteId) {
            if (siteId !== '*All') {
                _rooms = rooms.filter(item => item.siteId === siteId && EnctrAndRmUtil.isActiveRoom(item));
            } else {
                _rooms = rooms.filter(item => EnctrAndRmUtil.isActiveRoom(item));
            }
        } else {
            _rooms = [];
        }
        return _rooms;
    })

    checkAssignedRoomBeforeSubmit = () => {
        const {
            dialogIsWholeClinic,
            dialogIsWholeService,
            dialogAssginedRoomList
        } = this.props.dialogInfo;

        if (dialogIsWholeClinic === 0 && dialogIsWholeService === 0 && _.isEmpty(dialogAssginedRoomList)) {
            this.setState({
                ...this.state,
                isOpenAssignedRoomDialog: true
            });
        } else {
            this.handleSubmit();
        }
    }

    render() {
        const {
            isOpenAssignedRoomDialog
        } = this.state;

        const {
            classes,
            open,
            rooms,
            dialogInfo,
            dialogName,
            clinicList,
            serviceCd,
            unavailableReasons,
            isClinicalAdmin,
            clinic,
            viewOnly
        } = this.props;
        const siteOptions = this.loadAvailSiteOpts(clinicList, serviceCd, isClinicalAdmin, clinic);
        const _rooms = this.getFilterRooms(rooms, dialogInfo.dialogSiteId);
        const disableSite = (dialogName === 'Update Unavailable Period') || (dialogInfo.dialogIsWholeService === 1) || isClinicalAdminSetting();
        return (
            <>
                <CIMSPromptDialog
                    id={'assignedRoom_dialog'}
                    dialogTitle={'Warning'}
                    open={isOpenAssignedRoomDialog}
                    dialogContentText={
                        <>Assigned Room is blank. Confirm to proceed?</>
                    }
                    buttonConfig={
                        [
                            {
                                id: 'assignedRoom_dialog_save',
                                name: 'Yes',
                                onClick: () => {
                                    this.setState({
                                        ...this.state,
                                        isOpenAssignedRoomDialog: false
                                    }, this.handleSubmit);
                                },
                                disabled: viewOnly
                            },
                            {
                                id: 'assignedRoom_dialog_cancel',
                                name: 'No',
                                onClick: () => {
                                    this.setState({
                                        ...this.state,
                                        isOpenAssignedRoomDialog: false
                                    });
                                }
                            }
                        ]
                    }
                />

                <CIMSPromptDialog
                    id={'unavailablePeriodManagement_dialog'}
                    dialogTitle={dialogName}
                    open={open}
                    dialogContentText={
                        <ValidatorForm
                            ref="form"
                            onSubmit={this.handleSave}
                            className={classes.createForm}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <SelectFieldValidator
                                        options={siteOptions}
                                        id={'unavailablePeriodManagement_dialogSiteId'}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Site{disableSite ? null : <RequiredIcon/>}</>
                                        }}
                                        value={dialogInfo.dialogSiteId}
                                        onChange={e => this.handleChange(e.value, 'dialogSiteId')}
                                        validators={!disableSite ? [ValidatorEnum.required] : []}
                                        isDisabled={disableSite}
                                        errorMessages={!disableSite ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControlLabel
                                        className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={'unavailablePeriodManagement_dialogIsWholeClinic'}
                                                onChange={e => this.handleChange(e.target.checked ? 1 : 0, 'dialogIsWholeClinic')}
                                                value={dialogInfo.dialogIsWholeClinic}
                                            />
                                        }
                                        checked={dialogInfo.dialogIsWholeClinic === 1}// eslint-disable-line
                                        label={'Whole Clinic'}
                                        disabled={dialogInfo.dialogIsWholeService === 1}
                                    />
                                </Grid>
                                {
                                    dialogName !== 'Update Unavailable Period' ?
                                        <Grid item xs={2}>
                                            <FormControlLabel
                                                className={classes.form_input}
                                                control={
                                                    <CIMSCheckBox
                                                        id={'unavailablePeriodManagement_dialogIsWholeService'}
                                                        onChange={e => this.handleChange(e.target.checked ? 1 : 0, 'dialogIsWholeService')}
                                                        value={dialogInfo.dialogIsWholeService}
                                                    />
                                                }
                                                checked={dialogInfo.dialogIsWholeService === 1}// eslint-disable-line
                                                label={'Whole Service'}
                                                disabled={isClinicalAdminSetting()}
                                            />
                                        </Grid> : null
                                }
                            </Grid>

                            <Grid container spacing={2} style={{marginTop: 20}}>
                                <Grid item xs={12}>
                                    <SelectFieldValidator
                                        options={_rooms && _rooms.map((item) => ({
                                            value: item.rmId,
                                            label: item.rmDesc
                                        }))}
                                        id={'unavailablePeriodManagement_dialogAssginedRoomList'}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Assigned Room</>
                                        }}
                                        innerProps={{
                                            className: classes.roomInput
                                        }}
                                        ref={ref => this.assginRoomRef = ref}
                                        isMulti
                                        fullWidth
                                        sortBy="label"
                                        value={dialogInfo.dialogAssginedRoomList}
                                        onChange={e => this.handleChange(e, 'dialogAssginedRoomList')}
                                        isDisabled={(dialogInfo.dialogIsWholeClinic === 1 || dialogInfo.dialogIsWholeService === 1)}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} style={{marginTop: 20}}>
                                <Grid item xs={4}>
                                    <DateFieldValidator
                                        id={'unavailablePeriodManagement_dialogStartDate'}
                                        label={<>Start Date<RequiredIcon/></>}
                                        value={dialogInfo.dialogStartDate}
                                        inputVariant="outlined"
                                        onChange={e => this.handleChange(e, 'dialogStartDate')}
                                        disabled={dialogName === 'Update Unavailable Period'}
                                        inputRef={ref => this.sdateInputRef = ref}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <DateFieldValidator
                                        id={'unavailablePeriodManagement_dialogEndDate'}
                                        label={<>End Date<RequiredIcon/></>}
                                        value={dialogInfo.dialogEndDate}
                                        inputVariant="outlined"
                                        onChange={e => this.handleChange(e, 'dialogEndDate')}
                                        disabled={dialogName === 'Update Unavailable Period'}
                                        inputRef={ref => this.edateInputRef = ref}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} style={{marginTop: 20}}>
                                <Grid item xs={4}>
                                    <FastTimePicker
                                        id={'unavailablePeriodManagement_dialogStartTime'}
                                        component={TimeFieldValidator}
                                        isRequired={dialogInfo.dialogIsWholeDay !== 1}
                                        label={(dialogInfo.dialogIsWholeDay !== 1) ? <>Start
                                            Time<RequiredIcon/></> : 'Start Time'}
                                        value={dialogInfo.dialogStartTime}
                                        onBlur={e => this.handleTimeChange(e, 'dialogStartTime')}
                                        onAccept={e => this.handleTimeChange(e, 'dialogStartTime')}
                                        disabled={dialogInfo.dialogIsWholeDay === 1}
                                        validators={[(val) => this.timeValid(val, 'dialogStartTime')]}
                                        errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FastTimePicker
                                        id={'unavailablePeriodManagement_dialogEndTime'}
                                        component={TimeFieldValidator}
                                        isRequired={dialogInfo.dialogIsWholeDay !== 1}
                                        label={(dialogInfo.dialogIsWholeDay !== 1) ? <>End
                                            Time<RequiredIcon/></> : 'End Time'}
                                        value={dialogInfo.dialogEndTime}
                                        onBlur={e => this.handleTimeChange(e, 'dialogEndTime')}
                                        onAccept={e => this.handleTimeChange(e, 'dialogEndTime')}
                                        disabled={dialogInfo.dialogIsWholeDay === 1}
                                        validators={[(val) => this.timeValid(val, 'dialogEndTime')]}
                                        errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={2} style={{justifyContent: 'flex-end'}}>
                                    <FormControlLabel
                                        className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={'unavailablePeriodManagement_dialogIsWholeDay'}
                                                onChange={e => this.handleChange(e.target.checked ? 1 : 0, 'dialogIsWholeDay')}
                                                value={dialogInfo.dialogIsWholeDay}
                                            />
                                        }
                                        checked={dialogInfo.dialogIsWholeDay === 1}// eslint-disable-line
                                        label={'Whole Day'}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} style={{marginTop: 20}}>
                                <SelectFieldValidator
                                    options={unavailableReasons && unavailableReasons.map((item) => ({
                                        value: item.unavailPerdRsnId,
                                        label: item.rsnDesc
                                    }))}
                                    id={'unavailablePeriodManagement_dialogReason'}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Unavailable Reason<RequiredIcon/></>
                                    }}
                                    sortBy="label"
                                    value={dialogInfo.dialogReason}
                                    onChange={e => this.handleChange(e.value, 'dialogReason')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                            <Grid container item xs={12} style={{marginTop: 20}}>
                                <FastTextFieldValidator
                                    id={'unavailablePeriodManagement_dialogRemark'}
                                    name="dialogRemark"
                                    label="Remark"
                                    variant="outlined"
                                    inputProps={{maxLength: 500}}
                                    noChinese
                                    value={dialogInfo.dialogRemark}
                                    onBlur={e => this.handleChange(e.target.value, 'dialogRemark')}
                                />
                            </Grid>

                        </ValidatorForm>
                    }
                    buttonConfig={
                        [
                            {
                                id: 'unavailablePeriodManagement_dialog_save',
                                name: 'Save',
                                onClick: this.checkAssignedRoomBeforeSubmit,
                                disabled: viewOnly
                            },
                            {
                                id: 'unavailablePeriodManagement_dialog_cancel',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Click Unavailable Period Dialog Cancel Button', null, null, false, 'ana');
                                    this.handleClose();
                                }
                            }
                        ]
                    }
                />
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        rooms: state.common.rooms,
        quotaConfig: state.common.quotaConfig,
        sessionsConfig: state.common.sessionsConfig,
        loginInfo: state.login.loginInfo,
        dialogInfo: state.unavailablePeriodManagement.dialogInfo,
        currentSelectedId: state.unavailablePeriodManagement.currentSelectedId,
        dialogName: state.unavailablePeriodManagement.dialogName,
        clinicList: state.common.clinicList || null,
        serviceCd: state.login.service.serviceCd,
        isAssignRoom: state.unavailablePeriodManagement.isAssignRoom,
        autofocus: state.unavailablePeriodManagement.autofocus,
        unavailableReasons: state.unavailablePeriodManagement.unavailableReasons,
        upmSiteId: state.unavailablePeriodManagement.upmSiteId,
        clinic: state.login.clinic
    };
}

const mapDispatchToProps = {
    updateState,
    createUpm,
    resetAll,
    updateUpm,
    resetDialogInfo,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UpmDialog));