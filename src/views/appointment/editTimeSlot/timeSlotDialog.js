import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import _ from 'lodash';
import {
    updateState,
    resetAll,
    insertTimeSlot,
    listTimeslot,
    updateTimeSlot
} from '../../../store/actions/appointment/editTimeSlot';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import { Grid, FormHelperText } from '@material-ui/core';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import Enum from '../../../enums/enum';
import { CommonUtil, EnctrAndRmUtil, MessageUtil } from '../../../utilities';
import memoize from 'memoize-one';
import { getSessionsConfig } from '../../../store/actions/common/commonAction';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = theme => ({
    createForm: {
        width: 800,
        paddingTop: 20,
        overflow: 'hidden'
    },
    tipRoot: {
        color: theme.palette.primary.main,
        margin: 10
    }
});

class TimeSlotDialog extends Component {
    state = {
        msg110287: '',
        msg1102112: ''
    }

    componentDidMount() {
        this.setState({
            msg110287: MessageUtil.getMessageDescriptionByMsgCode('110287'),
            msg1102112: MessageUtil.getMessageDescriptionByMsgCode('1102112')
        });
        this.props.getSessionsConfig();
    }

    handleClose = () => {
        this.props.auditAction('Close TimeSlot Dialog', null, null, false);
        this.props.updateState({ dialogOpen: false, dialogName: '' });
    }

    handleChange = (value, name) => {
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        if (name === 'sessId') {
            dialogInfo['startTime'] = null;
            dialogInfo['endTime'] = null;
            this.stimeInputRef.focus();
        }
        dialogInfo[name] = value;
        this.props.updateState({ dialogInfo: dialogInfo });
    }

    handleTimeChange = (e, name) => {
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        let timeSlotDate = moment(dialogInfo.dialogDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
        if (name === 'startTime') {
            let sTime = moment(e).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            let eTime = moment(dialogInfo.endTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            let timeSlotSDtm = `${timeSlotDate} ${sTime}`;
            let timeSlotEDtm = `${timeSlotDate} ${eTime}`;
            // if (moment(e).isAfter(moment(dialogInfo.endTime), 'minutes')) {
            if (moment(timeSlotSDtm).isAfter(moment(timeSlotEDtm), 'minutes')) {
                dialogInfo.endTime = null;
                this.etimeInputRef.focus();
            }
            // pre-fill session field
            let isWithinSessTime = false;
            for (let index = this.props.sessionsConfig.length - 1; index >= 0; index--) {
                let item = this.props.sessionsConfig[index];
                if (
                    moment(e).isBetween(moment(item && item.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK), moment(item && item.etime, Enum.TIME_FORMAT_24_HOUR_CLOCK), null, '[]')
                ) {
                    dialogInfo.sessId = item && item.sessId;
                    isWithinSessTime = true;
                }

            }
            if (!isWithinSessTime) {
                dialogInfo.sessId = '';
            }
        } else if (name === 'endTime') {
            let sTime = moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            let eTime = moment(e).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            let timeSlotSDtm = `${timeSlotDate} ${sTime}`;
            let timeSlotEDtm = `${timeSlotDate} ${eTime}`;
            // if (moment(e).isBefore(moment(dialogInfo.startTime), 'minutes')) {
            if (moment(timeSlotEDtm).isBefore(moment(timeSlotSDtm), 'minute')) {
                dialogInfo.startTime = null;
                this.stimeInputRef.focus();
                // pre-fill session field
                let isWithinSessTime = false;
                for (let index = this.props.sessionsConfig.length - 1; index >= 0; index--) {
                    let item = this.props.sessionsConfig[index];
                    if (
                        moment(e).isBetween(moment(item && item.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK), moment(item && item.etime, Enum.TIME_FORMAT_24_HOUR_CLOCK), null, '[]')
                    ) {
                        dialogInfo.sessId = item && item.sessId;
                        isWithinSessTime = true;
                    }

                }
                if (!isWithinSessTime) {
                    dialogInfo.sessId = '';
                }
            }
        }
        dialogInfo[name] = e;
        this.props.updateState({ dialogInfo: dialogInfo });
    }

    handleSubmit = () => {
        this.refs.form.submit();
    }

    getOverBookedQuota = () => {
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);
        let quotaList = list.map((item, index) => {
            return {
                [_.toLower(item)]: this.props.dialogInfo[_.toLower(item.code)],
                [_.toLower(item) + 'Booked']: this.props.dialogInfo[_.toLower(item.code) + 'Booked'],
                label: item.engDesc
            };
        });
        let overBookedQuotaList = (quotaList.length > 0) && quotaList.filter((item, index) => parseInt(item['qt' + (index + 1)] || 0) < parseInt(item['qt' + (index + 1) + 'Booked']));
        return overBookedQuotaList;
    }

    checkOverQuotaBooked = () => {
        return this.getOverBookedQuota().length > 0;
    }

    checkQuotaBooked = () => {
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);
        let quotaList = list.map((item, index) => {
            return {
                [_.toLower(item)]: this.props.dialogInfo[_.toLower(item.code)],
                [_.toLower(item) + 'Booked']: this.props.dialogInfo[_.toLower(item.code) + 'Booked'],
                label: item.engDesc
            };
        });
        let bookedQuotaList = (quotaList.length > 0) && quotaList.filter((item, index) => parseInt(item['qt' + (index + 1) + 'Booked']) > 0);
        return bookedQuotaList.length > 0;
    }

    handleSave = () => {
        const dialogStatus = _.toUpper(this.props.action);
        const { dialogInfo } = this.props;
        if (dialogStatus === 'CREATE') {
            this.props.auditAction('create timeSlot dialog', null, null, false);
            let params = {
                createBy: this.props.loginInfo.loginName,
                updateBy: this.props.loginInfo.loginName,
                createDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                updateDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                rmId: dialogInfo.dialogRoomCd,
                stime: moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                etime: moment(dialogInfo.endTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                tmsltDate: moment.utc((dialogInfo.dialogDate.format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)), Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR),
                sessId: dialogInfo.sessId,
                tmsltId: 0,
                siteId: this.props.siteId,
                overallQt: dialogInfo.overallQt || 0
            };
            let list = CommonUtil.quotaConfig(this.props.quotaConfig);
            list.forEach((item, index) => {
                params[_.toLower(item.code)] = dialogInfo[_.toLower(item.code)] || 0;
            });
            this.props.insertTimeSlot(params, () => {
                this.handleClose();
                this.props.deselectAllFnc();
                let searchParams = {
                    rmId: this.props.roomCd,
                    dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                    dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
                };
                this.props.listTimeslot(searchParams);
                this.props.handleRefreshQtCol();
            });
        } else {
            this.props.auditAction('update timeSlot dialog', null, null, false);
            let params = {
                rmId: dialogInfo.dialogRoomCd,
                stime: moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                etime: moment(dialogInfo.endTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                tmsltDate: moment.utc((dialogInfo.dialogDate.format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)), Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR),
                sessId: dialogInfo.sessId,
                id: this.props.currentSelectedId,
                overallQt: dialogInfo.overallQt || 0,
                version: dialogInfo.version,
                siteId: this.props.siteId
            };
            let list = CommonUtil.quotaConfig(this.props.quotaConfig);
            list.forEach((item, index) => {
                params[_.toLower(item.code)] = dialogInfo[_.toLower(item.code)] || 0;
            });
            this.props.updateTimeSlot(params, () => {
                if (this.checkOverQuotaBooked()) {
                    let updateDetails = '';
                    this.getOverBookedQuota().forEach((item, index) => {
                        let str = `   ${moment(dialogInfo.dialogDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} ${moment(dialogInfo.startTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)} Booked [${item['qt' + (index + 1) + 'Booked']}]/Quota [${item['qt' + (index + 1)]}] `;
                        updateDetails += `<br/>- ${item.label}: ${str}`;
                    });
                    this.props.openCommonMessage({
                        msgCode: '110917',
                        params: [{ name: 'SLOT_STR', value: updateDetails }]
                    });
                } else {
                    this.props.openCommonMessage({
                        msgCode: '110913',
                        showSnackbar: true
                    });
                }
                this.handleClose();
                this.props.deselectAllFnc();
                let searchParams = {
                    rmId: this.props.roomCd,
                    dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                    dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
                };
                this.props.listTimeslot(searchParams);
                this.props.handleRefreshQtCol();
            });
        }
    }

    getFilterRooms = memoize((rooms, siteId) => {
        return rooms && rooms.filter(x => x.siteId === siteId && EnctrAndRmUtil.isActiveRoom(x));
    })

    render() {
        const { action, classes, open, rooms, quotaConfig, sessionsConfig, dialogInfo, siteId } = this.props;
        const idConstant = this.props.id + '_createTimeSlot';
        let roomsList = this.getFilterRooms(rooms, siteId);
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);

        let stimeValid = (val) => {
            return !CommonUtil.isSameTime(moment(val), moment(dialogInfo.endTime));
        };
        let etimeValid = (val) => {
            return !CommonUtil.isSameTime(moment(dialogInfo.startTime), moment(val));
        };
        return (
            <CIMSPromptDialog
                id={idConstant}
                dialogTitle={_.toUpper(action) === 'CREATE' ? 'Create Timeslot' : 'Update Timeslot'}
                open={open}
                dialogContentText={
                    <ValidatorForm
                        ref="form"
                        onSubmit={this.handleSave}
                        className={classes.createForm}
                    >
                        <Grid container spacing={2} >
                            <Grid item xs={9} >
                                <SelectFieldValidator
                                    options={roomsList && roomsList.map((item) => ({ value: item.rmId, label: item.rmDesc }))}
                                    id={idConstant + _.toUpper(action) + 'dialogRoomCd'}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Room<RequiredIcon /></>
                                    }}
                                    value={dialogInfo.dialogRoomCd}
                                    isDisabled={_.toUpper(action) !== 'CREATE'}
                                    onChange={e => this.handleChange(e.value, 'dialogRoomCd')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                    sortBy="label"
                                />
                            </Grid>
                            <Grid item xs={3} >
                                <DateFieldValidator
                                    id={idConstant + _.toUpper(action) + 'dialogDate'}
                                    label={<>Date<RequiredIcon /></>}
                                    value={dialogInfo.dialogDate}
                                    inputVariant="outlined"
                                    disablePast
                                    disabled={(_.toUpper(action) !== 'CREATE') && this.checkQuotaBooked()}
                                    onChange={e => this.handleChange(e, 'dialogDate')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} style={{ marginTop: 20 }}>
                            <Grid item xs={3}>
                                <TimeFieldValidator
                                    id={idConstant + _.toUpper(action) + '_startTime'}
                                    isRequired
                                    label={<>Start Time<RequiredIcon /></>}
                                    inputVariant="outlined"
                                    value={dialogInfo.startTime}
                                    inputRef={ref => this.stimeInputRef = ref}
                                    disabled={(_.toUpper(action) !== 'CREATE') && this.checkQuotaBooked()}
                                    onChange={e => this.handleTimeChange(e, 'startTime')}
                                    validators={[stimeValid]}
                                    errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TimeFieldValidator
                                    id={idConstant + _.toUpper(action) + '_endTime'}
                                    isRequired
                                    label={<>End Time<RequiredIcon /></>}
                                    inputVariant="outlined"
                                    value={dialogInfo.endTime}
                                    inputRef={ref => this.etimeInputRef = ref}
                                    disabled={(_.toUpper(action) !== 'CREATE') && this.checkQuotaBooked()}
                                    onChange={e => this.handleTimeChange(e, 'endTime')}
                                    validators={[etimeValid]}
                                    errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={3} >
                                <SelectFieldValidator
                                    options={sessionsConfig && sessionsConfig.map((item) => ({ value: item.sessId, label: item.sessDesc }))}
                                    id={idConstant + _.toUpper(action) + 'sessId'}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Session<RequiredIcon /></>
                                    }}
                                    value={dialogInfo.sessId}
                                    isDisabled={(_.toUpper(action) !== 'CREATE') && this.checkQuotaBooked()}
                                    onChange={e => this.handleChange(e.value, 'sessId')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FastTextFieldValidator
                                    id={idConstant + _.toUpper(action) + '_overallQuota'}
                                    name="overallQuota"
                                    label="Overall Quota"
                                    variant="outlined"
                                    type="number"
                                    inputProps={{ maxLength: 4 }}
                                    value={dialogInfo.overallQt}
                                    onBlur={e => this.handleChange(e.target.value, 'overallQt')}
                                    validators={[ValidatorEnum.isPositiveInteger]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} style={{ marginTop: 20 }}>
                            {
                                list.map((item, index) => {
                                    return (
                                        <Grid key={idConstant + '_quota' + index} item xs={2}>
                                            <FastTextFieldValidator
                                                id={idConstant + _.toUpper(action) + '_quota' + index}
                                                name={_.toLower(item.code)}
                                                label={<Grid style={{ width: '4vw', textOverflow: 'ellipsis', overflow: 'hidden' }}>{quotaConfig[0][_.toLower(item.code) + 'Name']}</Grid>}
                                                variant="outlined"
                                                type="number"
                                                inputProps={{ maxLength: 4 }}
                                                value={dialogInfo[_.toLower(item.code)]}
                                                onBlur={e => this.handleChange(e.target.value, _.toLower(item.code))}
                                                validators={[ValidatorEnum.isPositiveInteger]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                absoluteMessage
                                            />
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>

                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: idConstant + _.toUpper(action) + '_save',
                            name: 'Save',
                            onClick: this.handleSubmit
                        },
                        {
                            id: idConstant + _.toUpper(action) + '_cancel',
                            name: 'Cancel',
                            onClick: this.handleClose
                        }
                    ]
                }
                legendText={
                    <div style={{ width: '100%' }}>
                        <FormHelperText className={classes.tipRoot}>{this.state.msg110287}</FormHelperText>
                        <FormHelperText className={classes.tipRoot}>{this.state.msg1102112}</FormHelperText>
                    </div>
                }
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        rooms: state.common.rooms,
        quotaConfig: state.common.quotaConfig,
        sessionsConfig: state.common.sessionsConfig,
        loginInfo: state.login.loginInfo,
        dialogInfo: state.editTimeSlot.dialogInfo,
        roomCd: state.editTimeSlot.roomCd,
        currentSelectedId: state.editTimeSlot.currentSelectedId,
        dateFrom: state.editTimeSlot.dateFrom,
        dateTo: state.editTimeSlot.dateTo,
        siteId: state.login.loginForm.siteId
    };
}

const mapDispatchToProps = {
    updateState,
    insertTimeSlot,
    resetAll,
    listTimeslot,
    updateTimeSlot,
    openCommonMessage,
    getSessionsConfig,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimeSlotDialog));