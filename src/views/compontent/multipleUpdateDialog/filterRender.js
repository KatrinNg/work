import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import FastDatePicker from '../../../components/DatePicker/FastDatePicker';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import FastTimePicker from '../../../components/DatePicker/FastTimePicker';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import {
    Grid,
    Checkbox,
    FormControlLabel
} from '@material-ui/core';
import { ACTION_ENUM, MULTIPLE_UPDATE_TYPE } from '../../../constants/appointment/editTimeSlot';
import { EnctrAndRmUtil, DateUtil } from '../../../utilities';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import moment from 'moment';
import memoize from 'memoize-one';
import _ from 'lodash';
import { isClinicalAdminSetting } from '../../../utilities/userUtilities';

const getMaxDuration = memoize((start, end) => {
    const _start = moment(start || null);
    const _end = moment(end || null);
    let _duration = 1439;
    if (_start.isValid() && _end.isValid()) {
        _duration = moment().set({
            hours: _end.get('hours'),
            minutes: _end.get('minutes'),
            seconds: '0'
        }).diff(moment().set({
            hours: _start.get('hours'),
            minutes: _start.get('minutes'),
            seconds: '0'
        }), 'minutes', true);
        _duration = Math.ceil(_duration);
    }
    return _duration;
});

const sessionRule = (value, sessionsConfig, startTime, endTime) => {
    if (value) {
        const sessDto = sessionsConfig.find(x => x.sessId === value);
        const stimeDiff = DateUtil.timeComparator(moment(sessDto.stime, 'hh:mm'), moment(startTime));
        const etimeDiff = DateUtil.timeComparator(moment(sessDto.etime, 'hh:mm'), moment(endTime));
        return _.isNumber(stimeDiff) && _.isNumber(etimeDiff) && (stimeDiff > 0 || etimeDiff < 0) ? false : true;
    } else {
        return true;
    }
};

const FilterRender = React.forwardRef((props, refs) => {
    const {
        id,
        multipleUpdateData,
        updateData,
        clinicList,
        rooms,
        svcCd,
        sessionsConfig,
        type,
        unavailableReasons,
        dateRangeLimit
    } = props;

    const {
        clinic,
        room,
        startDate,
        endDate,
        wholeDay,
        startTime,
        endTime,
        session,
        duration,
        action,
        unavailableReasonForFilter,
        isWholeClinic,
        roomList
    } = multipleUpdateData;

    const sessionRef = React.useRef(null);
    const handleOnChange = (value, name) => {
        let obj = { [name]: value };
        if (name === 'wholeDay') {
            if (value) {
                obj.startTime = null;
                obj.endTime = null;
            }
        } else if (name === 'startTime' || name === 'endTime') {
            if (type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement) {
                sessionRef.current && sessionRef.current.validateCurrent();
            }
        } else if (name === 'roomList') {
            let _dialogAssginedRoomList = [];
            if (value) {
                value.forEach(item => {
                    _dialogAssginedRoomList.push(item.value);
                });
            } else {
                _dialogAssginedRoomList = [];
            }
            obj.roomList = _.cloneDeep(_dialogAssginedRoomList);
        } else if (name === 'isWholeClinic') {
            if (value === 1) {
                obj.roomList = null;
            }
        } else if (name === 'clinic') {
            if (type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod) {
                obj.roomList = null;
                if (value === '*All') {
                    obj.isWholeClinic = 0;
                }
            }
        }
        updateData(obj);
    };

    const maxDuration = getMaxDuration(startTime, endTime);
    const getValidation = (name) => {
        let validators = [], errorMessages = [];
        if (name === 'duration') {
            if (action === ACTION_ENUM.INSERT_UPDATE || action === ACTION_ENUM.INSERT) {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            validators.push(ValidatorEnum.maxNumber(maxDuration));
            errorMessages.push(CommonMessage.VALIDATION_MAX_NUMBER(maxDuration));
            validators.push(ValidatorEnum.minNumber(1));
            errorMessages.push(CommonMessage.VALIDATION_MIN_NUMBER(1));
        }
        return { validators, errorMessages };
    };

    const durationValidation = getValidation('duration');
    return (
        <Grid container spacing={2} alignItems="flex-start">
            {
                type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement ?
                    <>
                        <Grid item xs={4}>
                            <SelectFieldValidator
                                id={`${id}_clinic`}
                                options={clinicList.filter(x => x.svcCd === svcCd).map(x => ({ label: x.siteDesc, value: x.siteId }))}
                                isDisabled
                                value={clinic}
                                onChange={e => handleOnChange(e.value, 'clinic')}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Clinic<RequiredIcon /></>
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SelectFieldValidator
                                id={`${id}_room`}
                                options={rooms && rooms
                                    .filter(x => (x.siteId === clinic || !x.siteId) && EnctrAndRmUtil.isActiveRoom(x))
                                    .map(x => ({ label: x.rmDesc, value: x.rmId }))}
                                value={room}
                                onChange={e => handleOnChange(e.value, 'room')}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Room<RequiredIcon /></>
                                }}
                                sortBy="label"
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            />
                        </Grid>
                        <Grid item xs={4}></Grid>
                    </>
                    : null
            }
            {
                type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod ?
                    <>
                        <Grid item container xs={4}>
                            <SelectFieldValidator
                                id={`${id}_clinic`}
                                options={(clinicList || [])
                                    .filter(x => x.svcCd === svcCd)
                                    .map(x => ({ label: x.siteDesc, value: x.siteId }))}
                                value={clinic}
                                onChange={e => handleOnChange(e.value, 'clinic')}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Site{isClinicalAdminSetting() ? null : <RequiredIcon />}</>
                                }}
                                addNewOption={{ label: 'For All Clinic', value: '*All' }}
                                newOptionPosition="0"
                                sortBy="label"
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                isDisabled={isClinicalAdminSetting()}
                            />
                        </Grid>
                        <Grid item style={{ maxWidth: 160 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id={`${id}_wholeClinic`}
                                        onChange={e => handleOnChange(e.target.checked ? 1 : 0, 'isWholeClinic')}
                                    />
                                }
                                checked={isWholeClinic === 1}// eslint-disable-line
                                label={'Whole Clinic'}
                                disabled={clinic === '*All'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SelectFieldValidator
                                id={`${id}_assginedRooms`}
                                options={rooms && rooms
                                    .filter(x => (x.siteId === clinic || !x.siteId) && EnctrAndRmUtil.isActiveRoom(x))
                                    .map(x => ({ label: x.rmDesc, value: x.rmId }))}
                                value={roomList || []}
                                onChange={e => handleOnChange(e, 'roomList')}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Assigned Room<RequiredIcon /></>
                                }}
                                isMulti
                                sortBy="label"
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                isDisabled={isWholeClinic === 1 || clinic === '*All' || !clinic}
                            />
                        </Grid>
                        <Grid item xs></Grid>
                    </>
                    : null
            }
            <Grid item xs={4}>
                <FastDatePicker
                    id={`${id}_startDate`}
                    label={<>Start Date<RequiredIcon /></>}
                    component={DateFieldValidator}
                    onBlur={e => handleOnChange(e, 'startDate')}
                    onAccept={e => handleOnChange(e, 'startDate')}
                    value={startDate}
                    isRequired
                    disablePast
                    maxDate={moment(endDate || null).isValid() && moment(endDate).isSameOrAfter(moment().set({ hours: 0, minutes: 0, seconds: 0 })) ? moment(endDate).format() : undefined}
                    maxDateMessage={CommonMessage.VALIDATION_NOTE_MAX_DATE('End Date')}
                    minDate={moment(endDate || null).isValid() ? moment(endDate).add(-dateRangeLimit, 'days').format() : undefined}
                    minDateMessage={CommonMessage.VALIDATION_SESSION_MAX_DATE_RANGE(dateRangeLimit)}
                />
            </Grid>
            <Grid item xs={4}>
                <FastDatePicker
                    id={`${id}_endDate`}
                    label={<>End Date<RequiredIcon /></>}
                    component={DateFieldValidator}
                    onBlur={e => handleOnChange(e, 'endDate')}
                    onAccept={e => handleOnChange(e, 'endDate')}
                    value={endDate}
                    isRequired
                    disablePast
                    minDate={moment(startDate || null).isValid() ? moment(startDate).format() : undefined}
                    minDateMessage={CommonMessage.VALIDATION_NOTE_MIN_DATE('Start Date')}
                    maxDate={moment(startDate || null).isValid() && moment(startDate).add(dateRangeLimit, 'days').isSameOrAfter(moment().set({ hours: 0, minutes: 0, seconds: 0 })) ? moment(startDate).add(dateRangeLimit, 'days').format() : undefined}
                    maxDateMessage={CommonMessage.VALIDATION_SESSION_MAX_DATE_RANGE(dateRangeLimit)}
                />
            </Grid>
            <Grid item xs={4}>
                <FormControlLabel
                    id={`${id}_wholeDay`}
                    label="Whole Day"
                    checked={wholeDay ? true : false}
                    onChange={e => handleOnChange(e.target.checked ? true : false, 'wholeDay')}
                    control={<Checkbox id={`${id}_wholeDayCheckBox`} />}
                />
            </Grid>
            <Grid item xs={4}>
                <FastTimePicker
                    id={`${id}_startTime`}
                    label={<>Start Time<RequiredIcon /></>}
                    component={TimeFieldValidator}
                    onBlur={e => handleOnChange(e, 'startTime')}
                    onAccept={e => handleOnChange(e, 'startTime')}
                    value={startTime}
                    disabled={wholeDay}
                    validators={[ValidatorEnum.required, ValidatorEnum.maxTime(endTime)]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DATE_MUST_EARLIER('Start Time', 'End Time')]}
                />
            </Grid>
            <Grid item xs={4}>
                <FastTimePicker
                    id={`${id}_endTime`}
                    label={<>End Time<RequiredIcon /></>}
                    component={TimeFieldValidator}
                    onBlur={e => handleOnChange(e, 'endTime')}
                    onAccept={e => handleOnChange(e, 'endTime')}
                    value={endTime}
                    disabled={wholeDay}
                    validators={[ValidatorEnum.required, ValidatorEnum.minTime(startTime)]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DATE_MUST_LATER('End Time', 'Start Time')]}
                />
            </Grid>
            {
                type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement ?
                    <>
                        <Grid item xs={4}>
                            <SelectFieldValidator
                                id={`${id}_session`}
                                ref={sessionRef}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Session</>
                                }}
                                isDisabled={action === ACTION_ENUM.UPDATE || action === ACTION_ENUM.DELETE}
                                options={sessionsConfig && EnctrAndRmUtil.getActiveSessions(sessionsConfig).map((item) => ({ value: item.sessId, label: item.sessDesc }))}
                                value={session}
                                sortBy="label"
                                onChange={e => handleOnChange(e.value, 'session')}
                                validators={[(value) => sessionRule(value, sessionsConfig, startTime, endTime)]}
                                errorMessages={[CommonMessage.VALIDATION_SESSION_NOT_IN_RANGE()]}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FastTextFieldValidator
                                id={`${id}_duration`}
                                label={<>Duration (minute)<RequiredIcon /></>}
                                type="number"
                                inputProps={{ maxLength: 4 }}
                                disabled={action === ACTION_ENUM.UPDATE || action === ACTION_ENUM.DELETE}
                                value={duration}
                                onBlur={e => handleOnChange(e.target.value, 'duration')}
                                validators={durationValidation.validators}
                                errorMessages={durationValidation.errorMessages}
                            />
                        </Grid>
                    </>
                    : null
            }
            {
                type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod ?
                    <Grid item xs={4}>
                        <SelectFieldValidator
                            id={`${id}_unavailableReason`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Unavailable Reason</>
                            }}
                            options={unavailableReasons && unavailableReasons.map((item) => ({ value: item.unavailPerdRsnId, label: item.rsnDesc }))}
                            value={unavailableReasonForFilter}
                            sortBy="label"
                            onChange={e => handleOnChange(e.value, 'unavailableReasonForFilter')}
                        />
                    </Grid>
                    : null
            }
        </Grid>
    );
});

const styles = theme => ({});
const mapState = state => ({
    svcCd: state.login.service.svcCd,
    clinicList: state.common.clinicList,
    rooms: state.common.rooms,
    sessionsConfig: state.common.sessionsConfig,
    unavailableReasons: state.unavailablePeriodManagement.unavailableReasons
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(withStyles(styles)(FilterRender));