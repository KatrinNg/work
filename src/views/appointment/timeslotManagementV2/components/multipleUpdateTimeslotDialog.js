import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Radio,
    TextField,
    withStyles
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CIMSCommonDatePicker from '../../../../components/DatePicker/CIMSCommonDatePicker';
import CIMSCommonTimePicker from '../../../../components/DatePicker/CIMSCommonTimePicker';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CustomPaper from '../../../compontent/CustomPaper';
import * as moment from 'moment';
import CIMSCommonSelect from '../../../../components/Select/CIMSCommonSelect';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import TimeslotPlanTable from './timeslotPlanTable';
import Enum from '../../../../enums/enum';
import { ORDINAL_VALUES } from '../../../../constants/appointment/editTimeSlot';
import { DISPLAY_TYPE_PLAN } from '..';

const MultipleUpdateTimeslotDialog = (props) => {
    const {
        classes,
        id,
        open,
        handleOnClose,
        site,
        svcCd,
        room,
        sessions,
        timeslotPlans,
        isAHPRoom,
        handleMultipleUpdateTimeslot,
        qtTypes,
        dateRangeLimit,
        passDateRangeLimit
    } = props;

    const UPDATE_MODE_TIME_RANGE = 0;
    const UPDATE_MODE_TEMPLATE = 1;

    const RECURRENCE_MODE_DAILY = 'D';
    const RECURRENCE_MODE_WEEKLY = 'W';
    const RECURRENCE_MODE_MONTHLY = 'M';

    const OrdinalList = [
        { label: 'First', value: ORDINAL_VALUES.First },
        { label: 'Second', value: ORDINAL_VALUES.Second },
        { label: 'Third', value: ORDINAL_VALUES.Third },
        { label: 'Fourth', value: ORDINAL_VALUES.Fourth },
        { label: 'Last', value: ORDINAL_VALUES.Last }
    ];

    const WeekDayList = [
        { label: 'Sunday', value: 0 },
        { label: 'Monday', value: 1 },
        { label: 'Tuesday', value: 2 },
        { label: 'Wednesday', value: 3 },
        { label: 'Thursday', value: 4 },
        { label: 'Friday', value: 5 },
        { label: 'Saturday', value: 6 }
    ];

    const [multipleUpdateCriteria, setMultipleUpdateCriteria] = useState({
        sdate: null,
        edate: null,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
        updateMode: UPDATE_MODE_TIME_RANGE,
        stime: null,
        etime: null,
        isWholeDay: false,
        encounterTypes: [],
        qt1: null,
        qt2: null,
        qt3: null,
        qt4: null,
        qt5: null,
        qt6: null,
        qt7: null,
        qt8: null,
        recurrenceMode: RECURRENCE_MODE_DAILY,
        repeatEvery: '1',
        isMonthlyRepeatOn: true,
        isMonthlyOrdinal: false,
        monthlyRepeatOn: '',
        monthlyWeekday: null,
        monthlyOrdinal: null
    });

    const [encounterTypes, setEncounterTypes] = useState([]);

    const [touchedAndBlured, setTouchedAndBlured] = useState({
        sdate: false,
        edate: false,
        stime: false,
        etime: false,
        encounterTypes: false,
        qt: false,
        weekday: false,
        monthlyRepeatOn: false,
        monthlyOrdinal: false,
        monthlyWeekday: false,
        repeatEvery: false
    });

    useEffect(() => {
        console.log(room);

        const encounterTypes =
            room?.encntrTypeList?.map((encntrType) => ({
                value: encntrType.encntrTypeId,
                label: encntrType.encntrTypeDesc,
                item: encntrType
            })) || [];

        setEncounterTypes(encounterTypes);
    }, [room]);

    const handleQuotaOnChange = (e, qt) => {
        let newValue = e.target.value;
        newValue = newValue.replace(/[^0-9]/g, '');
        // if (newValue.indexOf('0') === 0 && newValue.length > 1) {
        //     newValue = newValue.substring(1);
        // }
        //  else if (newValue.length === 0) {
        //     newValue = '0';
        // }
        setMultipleUpdateCriteria({ ...multipleUpdateCriteria, [qt]: newValue });
    };

    const handeRepeatEveryOnChange = (e) => {
        let newValue = e.target.value;
        newValue = newValue.replace(/[^0-9]/g, '');
        // if (newValue.indexOf('0') === 0 && newValue.length > 1) {
        //     newValue = newValue.substring(1);
        // } else if (newValue.length === 0) {
        //     newValue = '0';
        // }
        setMultipleUpdateCriteria({ ...multipleUpdateCriteria, repeatEvery: newValue });
    };

    const performValidation = () => {
        return !(
            !multipleUpdateCriteria.sdate ||
            !moment(multipleUpdateCriteria.sdate).isValid() ||
            !multipleUpdateCriteria.edate ||
            !moment(multipleUpdateCriteria.edate).isValid() ||
            moment(multipleUpdateCriteria.edate).isBefore(moment(multipleUpdateCriteria.sdate)) ||
            !passDateRangeLimit(multipleUpdateCriteria.sdate, multipleUpdateCriteria.edate) ||
            (multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE && !multipleUpdateCriteria.encounterTypes?.length > 0) ||
            (multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE &&
                !multipleUpdateCriteria.isWholeDay &&
                (!multipleUpdateCriteria.stime || !moment(multipleUpdateCriteria.stime).isValid())) ||
            (multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE &&
                !multipleUpdateCriteria.isWholeDay &&
                (!multipleUpdateCriteria.etime ||
                    !moment(multipleUpdateCriteria.etime).isValid() ||
                    moment(multipleUpdateCriteria.etime).isBefore(moment(multipleUpdateCriteria.stime)))) ||
            (multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE &&
                !multipleUpdateCriteria.qt1 &&
                !multipleUpdateCriteria.qt2 &&
                !multipleUpdateCriteria.qt3 &&
                !multipleUpdateCriteria.qt4 &&
                !multipleUpdateCriteria.qt5 &&
                !multipleUpdateCriteria.qt6 &&
                !multipleUpdateCriteria.qt7 &&
                !multipleUpdateCriteria.qt8) ||
            (multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY &&
                !multipleUpdateCriteria.mon &&
                !multipleUpdateCriteria.tue &&
                !multipleUpdateCriteria.wed &&
                !multipleUpdateCriteria.thu &&
                !multipleUpdateCriteria.fri &&
                !multipleUpdateCriteria.sat &&
                !multipleUpdateCriteria.sun) ||
            (multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY &&
                !multipleUpdateCriteria.isMonthlyRepeatOn &&
                !multipleUpdateCriteria.isMonthlyOrdinal) ||
            (multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY &&
                multipleUpdateCriteria.isMonthlyRepeatOn &&
                !multipleUpdateCriteria.monthlyRepeatOn) ||
            (multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY &&
                multipleUpdateCriteria.isMonthlyOrdinal &&
                (!multipleUpdateCriteria.monthlyOrdinal || !multipleUpdateCriteria.monthlyWeekday)) ||
            !multipleUpdateCriteria.repeatEvery ||
            !Number(multipleUpdateCriteria.repeatEvery) > 0
        );
    };

    const handleOkButtonClick = () => {
        let newTouchedAndBlured = {};
        Object.keys(touchedAndBlured).map((o) => {
            newTouchedAndBlured = { ...newTouchedAndBlured, [o]: true };
        });
        setTouchedAndBlured(newTouchedAndBlured);
        if (performValidation()) {
            const param = {
                actionOptType: 'U',
                actionType: 'slot',
                startDate: moment(multipleUpdateCriteria.sdate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                endDate: moment(multipleUpdateCriteria.edate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                startTime:
                    (moment(multipleUpdateCriteria.stime).isValid() && moment(multipleUpdateCriteria.stime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)) || null,
                endTime:
                    (moment(multipleUpdateCriteria.etime).isValid() && moment(multipleUpdateCriteria.etime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)) || null,
                isWholeDay: multipleUpdateCriteria.isWholeDay ? 1 : 0,
                qt1: multipleUpdateCriteria.qt1 || null,
                qt2: multipleUpdateCriteria.qt2 || null,
                qt3: multipleUpdateCriteria.qt3 || null,
                qt4: multipleUpdateCriteria.qt4 || null,
                qt5: multipleUpdateCriteria.qt5 || null,
                qt6: multipleUpdateCriteria.qt6 || null,
                qt7: multipleUpdateCriteria.qt7 || null,
                qt8: multipleUpdateCriteria.qt8 || null,
                recurrenceRepeatEvery: Number(multipleUpdateCriteria.repeatEvery),
                recurrenceType: multipleUpdateCriteria.recurrenceMode,
                roomId: room?.rmId,
                siteId: site?.siteId,
                svcCd: svcCd,
                monthlyRepeatOn:
                    multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY && multipleUpdateCriteria.isMonthlyRepeatOn
                        ? multipleUpdateCriteria.monthlyRepeatOn
                        : '',
                monthlyWeekday:
                    multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY && multipleUpdateCriteria.isMonthlyOrdinal
                        ? multipleUpdateCriteria.monthlyWeekday
                        : '',
                monthlyOrdinal:
                    multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY && multipleUpdateCriteria.isMonthlyOrdinal
                        ? multipleUpdateCriteria.monthlyOrdinal
                        : '',
                weekly:
                    multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY
                        ? `${Number(multipleUpdateCriteria.sun)}${Number(multipleUpdateCriteria.mon)}${Number(multipleUpdateCriteria.tue)}${Number(
                              multipleUpdateCriteria.wed
                          )}${Number(multipleUpdateCriteria.thu)}${Number(multipleUpdateCriteria.fri)}${Number(multipleUpdateCriteria.sat)}`
                        : '0000000',
                encntrTypeIdsDefault: multipleUpdateCriteria.encounterTypes.map((encounterType) => encounterType.value)
            };
            handleMultipleUpdateTimeslot(param);
        }
    };

    return (
        <CIMSPromptDialog
            disableEnforceFocus
            open={open}
            id={id}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogTitle={'Multiple Update'}
            dialogContentText={
                <Grid container spacing={2} style={{ width: '100%', margin: 0, padding: '20px 10px' }}>
                    <Grid item xs={12} container spacing={1}>
                        <Grid item xs={12} lg={6}>
                            <TextField id={`${id}_site_textField_readonly`} variant="outlined" fullWidth disabled label="Site" value={site?.siteDesc} />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField id={`${id}_room_textField_readonly`} variant="outlined" fullWidth disabled label="Room" value={room?.rmDesc} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container spacing={1}>
                        <Grid item xs={12} lg={6}>
                            <CIMSCommonDatePicker
                                id={`${id}_startDate_datePicker`}
                                InputProps={{
                                    classes: {
                                        input: classes.datePickerInput
                                    }
                                }}
                                label={
                                    <span>
                                        Start Date
                                        <RequiredIcon />
                                    </span>
                                }
                                // minDate={moment()}
                                value={multipleUpdateCriteria.sdate}
                                onChange={(value) => {
                                    if (multipleUpdateCriteria.edate && moment(value).isAfter(moment(multipleUpdateCriteria.edate))) {
                                        setMultipleUpdateCriteria({ ...multipleUpdateCriteria, sdate: value, edate: value });
                                    } else {
                                        setMultipleUpdateCriteria({ ...multipleUpdateCriteria, sdate: value });
                                    }
                                }}
                                onBlur={() => {
                                    if (!touchedAndBlured.sdate) setTouchedAndBlured({ ...touchedAndBlured, sdate: true });
                                }}
                                error={
                                    touchedAndBlured.sdate &&
                                    (!multipleUpdateCriteria.sdate ||
                                        !moment(multipleUpdateCriteria.sdate).isValid() ||
                                        !passDateRangeLimit(multipleUpdateCriteria.sdate, multipleUpdateCriteria.edate))
                                }
                            />
                            {touchedAndBlured.sdate &&
                                (!multipleUpdateCriteria.sdate ? (
                                    <small style={{ color: 'red' }}>This field is required!</small>
                                ) : !moment(multipleUpdateCriteria.sdate).isValid() ? (
                                    <small style={{ color: 'red' }}>Please input valid date format: DD-MM-YYYY</small>
                                ) : !passDateRangeLimit(multipleUpdateCriteria.sdate, multipleUpdateCriteria.edate) ? (
                                    <small style={{ color: 'red' }}>Please select the date range within {dateRangeLimit} days.</small>
                                ) : null)}
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <CIMSCommonDatePicker
                                id={`${id}_endDate_datePicker`}
                                InputProps={{
                                    classes: {
                                        input: classes.datePickerInput
                                    }
                                }}
                                label={
                                    <span>
                                        End Date
                                        <RequiredIcon />
                                    </span>
                                }
                                value={multipleUpdateCriteria.edate}
                                onChange={(value) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, edate: value })}
                                minDate={moment(multipleUpdateCriteria.sdate).isValid() ? multipleUpdateCriteria.sdate : undefined}
                                maxDate={
                                    moment(multipleUpdateCriteria.sdate).isValid() ? moment(multipleUpdateCriteria.sdate).add(dateRangeLimit, 'd') : undefined
                                }
                                onBlur={() => {
                                    if (!touchedAndBlured.edate) setTouchedAndBlured({ ...touchedAndBlured, edate: true });
                                }}
                                error={
                                    touchedAndBlured.edate &&
                                    (!multipleUpdateCriteria.edate ||
                                        !moment(multipleUpdateCriteria.edate).isValid() ||
                                        moment(multipleUpdateCriteria.edate).isBefore(moment(multipleUpdateCriteria.sdate)) ||
                                        !passDateRangeLimit(multipleUpdateCriteria.sdate, multipleUpdateCriteria.edate))
                                }
                            />
                            {touchedAndBlured.edate &&
                                (!multipleUpdateCriteria.edate ? (
                                    <small style={{ color: 'red' }}>This field is required!</small>
                                ) : !moment(multipleUpdateCriteria.edate).isValid() ? (
                                    <small style={{ color: 'red' }}>Please input valid date format: DD-MM-YYYY</small>
                                ) : moment(multipleUpdateCriteria.edate).isBefore(moment(multipleUpdateCriteria.sdate)) ? (
                                    <small style={{ color: 'red' }}>End Date cannot before Start Date!</small>
                                ) : !passDateRangeLimit(multipleUpdateCriteria.sdate, multipleUpdateCriteria.edate) ? (
                                    <small style={{ color: 'red' }}>Please select the date range within {dateRangeLimit} days.</small>
                                ) : null)}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container spacing={1}>
                        <CIMSFormLabel labelText={<>Update{isAHPRoom && ' Mode'}</>} className={classes.formLabel}>
                            <Grid container spacing={2} style={{ padding: 5 }}>
                                {isAHPRoom && (
                                    <Grid item xs={12} container spacing={0}>
                                        <Grid item xs>
                                            <Button
                                                id={`${id}_updateMode_timeRange_btn`}
                                                fullWidth
                                                className={
                                                    multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE ? classes.selectedButton : classes.buttonRoot
                                                }
                                                color="primary"
                                                size="small"
                                                style={{ borderRadius: 0 }}
                                                onClick={() => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, updateMode: UPDATE_MODE_TIME_RANGE })}
                                            >
                                                Time Range
                                            </Button>
                                        </Grid>
                                        <Grid item xs>
                                            <Button
                                                id={`${id}_updateMode_template_btn`}
                                                fullWidth
                                                className={
                                                    multipleUpdateCriteria.updateMode === UPDATE_MODE_TEMPLATE ? classes.selectedButton : classes.buttonRoot
                                                }
                                                color="primary"
                                                size="small"
                                                style={{ borderRadius: 0 }}
                                                onClick={() => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, updateMode: UPDATE_MODE_TEMPLATE })}
                                            >
                                                Template
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}

                                {multipleUpdateCriteria.updateMode === UPDATE_MODE_TIME_RANGE ? (
                                    <>
                                        <Grid item xs={12} container spacing={1}>
                                            <Grid item xs={12} lg={4}>
                                                <CIMSCommonTimePicker
                                                    id={`${id}_startTime_timePicker`}
                                                    InputProps={{
                                                        classes: {
                                                            input: classes.datePickerInput
                                                        }
                                                    }}
                                                    label={
                                                        <span>
                                                            Start Time
                                                            {!multipleUpdateCriteria.isWholeDay && <RequiredIcon />}
                                                        </span>
                                                    }
                                                    value={multipleUpdateCriteria.stime}
                                                    onChange={(value) => {
                                                        setMultipleUpdateCriteria({ ...multipleUpdateCriteria, stime: value });
                                                    }}
                                                    disabled={multipleUpdateCriteria.isWholeDay}
                                                    onBlur={() => {
                                                        if (!touchedAndBlured.stime) setTouchedAndBlured({ ...touchedAndBlured, stime: true });
                                                    }}
                                                    error={
                                                        touchedAndBlured.stime &&
                                                        !multipleUpdateCriteria.isWholeDay &&
                                                        (!multipleUpdateCriteria.stime || !moment(multipleUpdateCriteria.stime).isValid())
                                                    }
                                                />
                                                {touchedAndBlured.stime &&
                                                    !multipleUpdateCriteria.isWholeDay &&
                                                    (!multipleUpdateCriteria.stime ? (
                                                        <small style={{ color: 'red' }}>This field is required!</small>
                                                    ) : !moment(multipleUpdateCriteria.stime).isValid() ? (
                                                        <small style={{ color: 'red' }}>Please input valid time format: HH:mm</small>
                                                    ) : null)}
                                            </Grid>
                                            <Grid item xs={12} lg={4}>
                                                <CIMSCommonTimePicker
                                                    id={`${id}_endTime_timePicker`}
                                                    InputProps={{
                                                        classes: {
                                                            input: classes.datePickerInput
                                                        }
                                                    }}
                                                    label={
                                                        <span>
                                                            End Time
                                                            {!multipleUpdateCriteria.isWholeDay && <RequiredIcon />}
                                                        </span>
                                                    }
                                                    value={multipleUpdateCriteria.etime}
                                                    onChange={(value) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, etime: value })}
                                                    disabled={multipleUpdateCriteria.isWholeDay}
                                                    onBlur={() => {
                                                        if (!touchedAndBlured.etime) setTouchedAndBlured({ ...touchedAndBlured, etime: true });
                                                    }}
                                                    error={
                                                        touchedAndBlured.etime &&
                                                        !multipleUpdateCriteria.isWholeDay &&
                                                        (!multipleUpdateCriteria.etime ||
                                                            !moment(multipleUpdateCriteria.etime).isValid() ||
                                                            moment(multipleUpdateCriteria.etime).isBefore(moment(multipleUpdateCriteria.stime)))
                                                    }
                                                />
                                                {touchedAndBlured.etime &&
                                                    !multipleUpdateCriteria.isWholeDay &&
                                                    (!multipleUpdateCriteria.etime ? (
                                                        <small style={{ color: 'red' }}>This field is required!</small>
                                                    ) : !moment(multipleUpdateCriteria.etime).isValid() ? (
                                                        <small style={{ color: 'red' }}>Please input valid time format: HH:mm</small>
                                                    ) : moment(multipleUpdateCriteria.etime).isBefore(moment(multipleUpdateCriteria.stime)) ? (
                                                        <small style={{ color: 'red' }}>End Time cannot before Start Time!</small>
                                                    ) : null)}
                                            </Grid>
                                            <Grid item xs={12} lg={4} style={{ alignSelf: 'center' }}>
                                                <FormControlLabel
                                                    id={`${id}_wholeDay_checkbox`}
                                                    control={<Checkbox color="primary" />}
                                                    label="Whole Day"
                                                    checked={multipleUpdateCriteria.isWholeDay}
                                                    onChange={(e) =>
                                                        setMultipleUpdateCriteria({
                                                            ...multipleUpdateCriteria,
                                                            isWholeDay: e.target.checked,
                                                            stime: null,
                                                            etime: null
                                                        })
                                                    }
                                                />
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <CIMSCommonSelect
                                                id={`${id}_encounterType_multipleSelect`}
                                                options={encounterTypes}
                                                value={multipleUpdateCriteria.encounterTypes}
                                                inputProps={{
                                                    // isDisabled: dialogAction !== 'create',
                                                    isMulti: true,
                                                    hideSelectedOptions: false,
                                                    closeMenuOnSelect: false,
                                                    // sortFunc: sortFunc,
                                                    selectAll: '[ Select All ]'
                                                }}
                                                onChange={(value, params) => {
                                                    console.log(value);
                                                    setMultipleUpdateCriteria({ ...multipleUpdateCriteria, encounterTypes: value });
                                                }}
                                                label={
                                                    <>
                                                        Encounter Type
                                                        <RequiredIcon />
                                                    </>
                                                }
                                                controlProps={{ margin: 'none' }}
                                                onBlur={() => {
                                                    if (!touchedAndBlured.encounterTypes) setTouchedAndBlured({ ...touchedAndBlured, encounterTypes: true });
                                                }}
                                                error={touchedAndBlured.encounterTypes && !multipleUpdateCriteria.encounterTypes?.length > 0}
                                            />
                                            {touchedAndBlured.encounterTypes &&
                                                (!multipleUpdateCriteria.encounterTypes?.length > 0 ? (
                                                    <small style={{ color: 'red' }}>This field is required!</small>
                                                ) : null)}
                                        </Grid>
                                        {qtTypes?.map((qt) => (
                                            <Grid item xs={12} md={3} key={qt.code}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`${id}_${qt.code}_textField`}
                                                        label={
                                                            <>
                                                                {qt.engDesc}
                                                                {!multipleUpdateCriteria.qt1 &&
                                                                    !multipleUpdateCriteria.qt2 &&
                                                                    !multipleUpdateCriteria.qt3 &&
                                                                    !multipleUpdateCriteria.qt4 &&
                                                                    !multipleUpdateCriteria.qt5 &&
                                                                    !multipleUpdateCriteria.qt6 &&
                                                                    !multipleUpdateCriteria.qt7 &&
                                                                    !multipleUpdateCriteria.qt8 && <RequiredIcon />}
                                                            </>
                                                        }
                                                        variant="outlined"
                                                        fullWidth
                                                        inputProps={{ style: { padding: '0px 10px' }, maxLength: 4 }}
                                                        value={multipleUpdateCriteria[qt.code]}
                                                        onChange={(e) => handleQuotaOnChange(e, qt.code)}
                                                        onBlur={() => {
                                                            if (!touchedAndBlured.qt) setTouchedAndBlured({ ...touchedAndBlured, qt: true });
                                                        }}
                                                        error={
                                                            touchedAndBlured.qt &&
                                                            !multipleUpdateCriteria.qt1 &&
                                                            !multipleUpdateCriteria.qt2 &&
                                                            !multipleUpdateCriteria.qt3 &&
                                                            !multipleUpdateCriteria.qt4 &&
                                                            !multipleUpdateCriteria.qt5 &&
                                                            !multipleUpdateCriteria.qt6 &&
                                                            !multipleUpdateCriteria.qt7 &&
                                                            !multipleUpdateCriteria.qt8
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        ))}
                                        {touchedAndBlured.qt &&
                                            !multipleUpdateCriteria.qt1 &&
                                            !multipleUpdateCriteria.qt2 &&
                                            !multipleUpdateCriteria.qt3 &&
                                            !multipleUpdateCriteria.qt4 &&
                                            !multipleUpdateCriteria.qt5 &&
                                            !multipleUpdateCriteria.qt6 &&
                                            !multipleUpdateCriteria.qt7 &&
                                            !multipleUpdateCriteria.qt8 && (
                                                <Grid item xs={12}>
                                                    <small style={{ color: 'red' }}>Please at least update one of the quota type!</small>
                                                </Grid>
                                            )}
                                    </>
                                ) : null}

                                {multipleUpdateCriteria.updateMode === UPDATE_MODE_TEMPLATE ? (
                                    <>
                                        <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                                            <Grid item xs={12} lg={2}>
                                                <b>Template</b>
                                            </Grid>
                                            <Grid item xs={12} lg={10} container spacing={2}>
                                                <Grid item xs={12} md="auto">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ minWidth: 'unset', height: 'auto', padding: '8px 10px' }}
                                                    >
                                                        A
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} md="auto">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ minWidth: 'unset', height: 'auto', padding: '8px 10px' }}
                                                    >
                                                        B
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} md="auto">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ minWidth: 'unset', height: 'auto', padding: '8px 10px' }}
                                                    >
                                                        C
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} md="auto">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ minWidth: 'unset', height: 'auto', padding: '8px 10px' }}
                                                    >
                                                        D
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} md="auto">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ minWidth: 'unset', height: 'auto', padding: '8px 10px' }}
                                                    >
                                                        X
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} container spacing={1} style={{ alignItems: 'center', width: '100%', margin: 0 }}>
                                            <CustomPaper style={{ maxHeight: 300, borderRadius: '0px' }}>
                                                <TimeslotPlanTable
                                                    room={room}
                                                    timeslotPlans={timeslotPlans}
                                                    editQuota
                                                    maxHeight={280}
                                                    qtTypes={qtTypes}
                                                    displayType={DISPLAY_TYPE_PLAN}
                                                />
                                            </CustomPaper>
                                        </Grid>
                                    </>
                                ) : null}
                            </Grid>
                        </CIMSFormLabel>
                    </Grid>

                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center', marginTop: '5px' }}>
                        <CIMSFormLabel labelText={<>Recurrence</>} className={classes.formLabel}>
                            <Grid container spacing={2} style={{ padding: 5 }}>
                                <Grid item xs={12} container spacing={0}>
                                    <Grid item xs>
                                        <Button
                                            id={`${id}_recurrenceMode_daily_btn`}
                                            fullWidth
                                            className={
                                                multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_DAILY ? classes.selectedButton : classes.buttonRoot
                                            }
                                            color="primary"
                                            size="small"
                                            style={{ borderRadius: 0 }}
                                            onClick={() => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, recurrenceMode: RECURRENCE_MODE_DAILY })}
                                        >
                                            Daily
                                        </Button>
                                    </Grid>
                                    <Grid item xs>
                                        <Button
                                            id={`${id}_recurrenceMode_weekly_btn`}
                                            fullWidth
                                            className={
                                                multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY ? classes.selectedButton : classes.buttonRoot
                                            }
                                            color="primary"
                                            size="small"
                                            style={{ borderRadius: 0 }}
                                            onClick={() => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, recurrenceMode: RECURRENCE_MODE_WEEKLY })}
                                        >
                                            Weekly
                                        </Button>
                                    </Grid>
                                    <Grid item xs>
                                        <Button
                                            id={`${id}_recurrenceMode_monthly_btn`}
                                            fullWidth
                                            className={
                                                multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY ? classes.selectedButton : classes.buttonRoot
                                            }
                                            color="primary"
                                            size="small"
                                            style={{ borderRadius: 0 }}
                                            onClick={() => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, recurrenceMode: RECURRENCE_MODE_MONTHLY })}
                                        >
                                            Monthly
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} container spacing={2}>
                                    {multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY && (
                                        <Grid item xs={12} container spacing={0}>
                                            <Grid item xs={12}>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_allWeekdays_checkbox`} color="primary" />}
                                                    label="All Weekdays"
                                                    checked={
                                                        multipleUpdateCriteria.sun &&
                                                        multipleUpdateCriteria.mon &&
                                                        multipleUpdateCriteria.tue &&
                                                        multipleUpdateCriteria.wed &&
                                                        multipleUpdateCriteria.thu &&
                                                        multipleUpdateCriteria.fri &&
                                                        multipleUpdateCriteria.sat
                                                    }
                                                    onChange={(e) =>
                                                        setMultipleUpdateCriteria({
                                                            ...multipleUpdateCriteria,
                                                            sun: e.target.checked,
                                                            mon: e.target.checked,
                                                            tue: e.target.checked,
                                                            wed: e.target.checked,
                                                            thu: e.target.checked,
                                                            fri: e.target.checked,
                                                            sat: e.target.checked
                                                        })
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_sunday_checkbox`} color="primary" />}
                                                    label="Sun"
                                                    checked={multipleUpdateCriteria.sun}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, sun: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_monday_checkbox`} color="primary" />}
                                                    label="Mon"
                                                    checked={multipleUpdateCriteria.mon}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, mon: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_tuesday_checkbox`} color="primary" />}
                                                    label="Tue"
                                                    checked={multipleUpdateCriteria.tue}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, tue: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_wednesday_checkbox`} color="primary" />}
                                                    label="Wed"
                                                    checked={multipleUpdateCriteria.wed}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, wed: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_thursday_checkbox`} color="primary" />}
                                                    label="Thu"
                                                    checked={multipleUpdateCriteria.thu}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, thu: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_friday_checkbox`} color="primary" />}
                                                    label="Fri"
                                                    checked={multipleUpdateCriteria.fri}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, fri: e.target.checked })}
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    control={<Checkbox id={`${id}_saturday_checkbox`} color="primary" />}
                                                    label="Sat"
                                                    checked={multipleUpdateCriteria.sat}
                                                    onChange={(e) => setMultipleUpdateCriteria({ ...multipleUpdateCriteria, sat: e.target.checked })}
                                                />
                                            </Grid>
                                            {touchedAndBlured.weekday &&
                                                multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY &&
                                                !multipleUpdateCriteria.mon &&
                                                !multipleUpdateCriteria.tue &&
                                                !multipleUpdateCriteria.wed &&
                                                !multipleUpdateCriteria.thu &&
                                                !multipleUpdateCriteria.fri &&
                                                !multipleUpdateCriteria.sat &&
                                                !multipleUpdateCriteria.sun && (
                                                    <Grid item xs={12}>
                                                        <small style={{ color: 'red' }}>Please at least select one weekday!</small>
                                                    </Grid>
                                                )}
                                        </Grid>
                                    )}
                                    {multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY && (
                                        <Grid item xs={12} container spacing={1}>
                                            <Grid item xs={12} lg={6} container spacing={1}>
                                                <Grid item xs="auto">
                                                    <Radio
                                                        id={`${id}_isMonthlyRepeatOn_radioBtn`}
                                                        color="primary"
                                                        checked={multipleUpdateCriteria.isMonthlyRepeatOn}
                                                        onChange={(e) => {
                                                            setMultipleUpdateCriteria({
                                                                ...multipleUpdateCriteria,
                                                                isMonthlyRepeatOn: e.target.checked,
                                                                isMonthlyOrdinal: false,
                                                                monthlyOrdinal: null,
                                                                monthlyWeekday: null
                                                            });
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs lg={8}>
                                                    <FormControl fullWidth className={classes.margin} variant="outlined">
                                                        <InputLabel htmlFor={`${id}_monthlyRepeatOn_textField`}>
                                                            <span>
                                                                Repeat On
                                                                {(multipleUpdateCriteria.isMonthlyRepeatOn ||
                                                                    (!multipleUpdateCriteria.isMonthlyRepeatOn &&
                                                                        !multipleUpdateCriteria.isMonthlyOrdinal)) && <RequiredIcon />}
                                                            </span>
                                                        </InputLabel>
                                                        <OutlinedInput
                                                            id={`${id}_monthlyRepeatOn_textField`}
                                                            fullWidth
                                                            inputProps={{
                                                                style: {
                                                                    padding: '0px 10px'
                                                                },
                                                                maxLength: 2
                                                            }}
                                                            autoFocus={multipleUpdateCriteria.isMonthlyRepeatOn}
                                                            value={multipleUpdateCriteria.monthlyRepeatOn}
                                                            onChange={(e) =>
                                                                setMultipleUpdateCriteria({ ...multipleUpdateCriteria, monthlyRepeatOn: e.target.value })
                                                            }
                                                            startAdornment={<InputAdornment position="start">Day</InputAdornment>}
                                                            endAdornment={
                                                                <InputAdornment position="end" style={{ whiteSpace: 'nowrap' }}>
                                                                    Of Month
                                                                </InputAdornment>
                                                            }
                                                            labelWidth={60}
                                                            disabled={!multipleUpdateCriteria.isMonthlyRepeatOn}
                                                            onBlur={() => {
                                                                if (!touchedAndBlured.monthlyRepeatOn)
                                                                    setTouchedAndBlured({ ...touchedAndBlured, monthlyRepeatOn: true });
                                                            }}
                                                            error={
                                                                touchedAndBlured.monthlyRepeatOn &&
                                                                multipleUpdateCriteria.isMonthlyRepeatOn &&
                                                                (!multipleUpdateCriteria.monthlyRepeatOn ||
                                                                    !Number(multipleUpdateCriteria.monthlyRepeatOn) > 0 ||
                                                                    Number(multipleUpdateCriteria.monthlyRepeatOn) > 31)
                                                            }
                                                        />
                                                    </FormControl>
                                                    {touchedAndBlured.monthlyRepeatOn &&
                                                    multipleUpdateCriteria.isMonthlyRepeatOn &&
                                                    (!multipleUpdateCriteria.monthlyRepeatOn ? (
                                                        <small style={{ color: 'red' }}>This field is required!</small>
                                                    ) : (
                                                        !Number(multipleUpdateCriteria.monthlyRepeatOn) > 0 ||
                                                        Number(multipleUpdateCriteria.monthlyRepeatOn) > 31
                                                    )) ? (
                                                        <small style={{ color: 'red' }}>Please input a number between 1 and 31!</small>
                                                    ) : null}
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} lg={6} container spacing={1}>
                                                <Grid item xs="auto">
                                                    <Radio
                                                        id={`${id}_isMonthlyOrdinal_radioBtn`}
                                                        color="primary"
                                                        checked={multipleUpdateCriteria.isMonthlyOrdinal}
                                                        onChange={(e) => {
                                                            setMultipleUpdateCriteria({
                                                                ...multipleUpdateCriteria,
                                                                isMonthlyOrdinal: e.target.checked,
                                                                isMonthlyRepeatOn: false,
                                                                monthlyRepeatOn: ''
                                                            });
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md>
                                                    <CIMSCommonSelect
                                                        id={`${id}_monthlyOrdinal_select`}
                                                        label={
                                                            <span>
                                                                Ordinal
                                                                {(multipleUpdateCriteria.isMonthlyOrdinal ||
                                                                    (!multipleUpdateCriteria.isMonthlyRepeatOn &&
                                                                        !multipleUpdateCriteria.isMonthlyOrdinal)) && <RequiredIcon />}
                                                            </span>
                                                        }
                                                        inputProps={{
                                                            isClearable: false
                                                        }}
                                                        disabled={!multipleUpdateCriteria.isMonthlyOrdinal}
                                                        options={OrdinalList.map((x) => ({ label: x.label, value: x.value }))}
                                                        value={OrdinalList.find((x) => x.value === multipleUpdateCriteria.monthlyOrdinal)}
                                                        onChange={(v) => {
                                                            setMultipleUpdateCriteria({
                                                                ...multipleUpdateCriteria,
                                                                monthlyOrdinal: v.value
                                                            });
                                                        }}
                                                        controlProps={{ margin: 'none' }}
                                                        onBlur={() => {
                                                            if (!touchedAndBlured.monthlyOrdinal)
                                                                setTouchedAndBlured({ ...touchedAndBlured, monthlyOrdinal: true });
                                                        }}
                                                        error={
                                                            touchedAndBlured.monthlyOrdinal &&
                                                            multipleUpdateCriteria.isMonthlyOrdinal &&
                                                            !multipleUpdateCriteria.monthlyOrdinal
                                                        }
                                                    />
                                                    {touchedAndBlured.monthlyOrdinal &&
                                                        multipleUpdateCriteria.isMonthlyOrdinal &&
                                                        (!multipleUpdateCriteria.monthlyOrdinal ? (
                                                            <small style={{ color: 'red' }}>This field is required!</small>
                                                        ) : null)}
                                                </Grid>
                                                <Grid item xs={12} md>
                                                    <CIMSCommonSelect
                                                        id={`${id}_monthlyWeekday_select`}
                                                        label={
                                                            <span>
                                                                Weekday
                                                                {(multipleUpdateCriteria.isMonthlyOrdinal ||
                                                                    (!multipleUpdateCriteria.isMonthlyRepeatOn &&
                                                                        !multipleUpdateCriteria.isMonthlyOrdinal)) && <RequiredIcon />}
                                                            </span>
                                                        }
                                                        inputProps={{
                                                            isClearable: false
                                                        }}
                                                        disabled={!multipleUpdateCriteria.isMonthlyOrdinal}
                                                        options={WeekDayList.map((x) => ({ label: x.label, value: x.value }))}
                                                        value={WeekDayList.find((x) => x.value === multipleUpdateCriteria.monthlyWeekday)}
                                                        onChange={(v) => {
                                                            setMultipleUpdateCriteria({
                                                                ...multipleUpdateCriteria,
                                                                monthlyWeekday: v.value
                                                            });
                                                        }}
                                                        controlProps={{ margin: 'none' }}
                                                        onBlur={() => {
                                                            if (!touchedAndBlured.monthlyWeekday)
                                                                setTouchedAndBlured({ ...touchedAndBlured, monthlyWeekday: true });
                                                        }}
                                                        error={
                                                            touchedAndBlured.monthlyWeekday &&
                                                            multipleUpdateCriteria.isMonthlyOrdinal &&
                                                            !multipleUpdateCriteria.monthlyWeekday
                                                        }
                                                    />
                                                    {touchedAndBlured.monthlyWeekday &&
                                                        multipleUpdateCriteria.isMonthlyOrdinal &&
                                                        (!multipleUpdateCriteria.monthlyWeekday ? (
                                                            <small style={{ color: 'red' }}>This field is required!</small>
                                                        ) : null)}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} container spacing={1}>
                                        <Grid item xs={12} lg={4}>
                                            <FormControl fullWidth className={classes.margin} variant="outlined">
                                                <InputLabel>
                                                    Repeat Every
                                                    <RequiredIcon />
                                                </InputLabel>
                                                <OutlinedInput
                                                    id={`${id}_repeatEvery_textField`}
                                                    fullWidth
                                                    labelWidth={60}
                                                    inputProps={{ style: { padding: '0px 10px' }, maxLength: 3 }}
                                                    value={multipleUpdateCriteria.repeatEvery}
                                                    onChange={(e) => handeRepeatEveryOnChange(e)}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            {multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_DAILY
                                                                ? 'Day(s)'
                                                                : multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_WEEKLY
                                                                ? 'Week(s)'
                                                                : multipleUpdateCriteria.recurrenceMode === RECURRENCE_MODE_MONTHLY
                                                                ? 'Month(s)'
                                                                : ''}
                                                        </InputAdornment>
                                                    }
                                                    onBlur={() => {
                                                        if (!touchedAndBlured.repeatEvery) setTouchedAndBlured({ ...touchedAndBlured, repeatEvery: true });
                                                    }}
                                                    error={
                                                        touchedAndBlured.repeatEvery &&
                                                        (!multipleUpdateCriteria.repeatEvery || !Number(multipleUpdateCriteria.repeatEvery) > 0)
                                                    }
                                                />
                                            </FormControl>
                                            {touchedAndBlured.repeatEvery &&
                                                (!multipleUpdateCriteria.repeatEvery ? (
                                                    <small style={{ color: 'red' }}>This field is required!</small>
                                                ) : !Number(multipleUpdateCriteria.repeatEvery) > 0 ? (
                                                    <small style={{ color: 'red' }}>Please input a value that is {'>'} 0</small>
                                                ) : null)}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CIMSFormLabel>
                    </Grid>
                </Grid>
            }
            buttonConfig={[
                {
                    id: `${id}_submit_btn`,
                    name: 'OK',
                    onClick: () => {
                        handleOkButtonClick();
                    }
                },
                {
                    id: `${id}_cancel_btn`,
                    name: 'Cancel',
                    onClick: () => {
                        handleOnClose();
                    }
                }
            ]}
        />
    );
};

const styles = (theme) => ({
    dialogPaper: {
        width: '50%'
    },
    formLabel: {
        padding: theme.spacing(2),
        width: '100%'
    },
    datePickerInput: {
        height: '20px'
    },
    buttonRoot: {
        textTransform: 'unset',
        background: 'white',
        color: '#0579c8',
        border: '1px solid #0579c8',
        height: '35px',
        '&:hover': {
            background: 'white',
            color: '#0579c8',
            border: '1px solid #0579c8'
        }
    },
    selectedButton: {
        textTransform: 'unset',
        background: '#0579c8',
        color: 'white',
        border: '1px solid #046aaf',
        // borderLeftColor: '#046aaf',
        // borderRightColor: '#046aaf',
        height: '35px',
        '&:hover': {
            // background: 'white',
            // color: '#0579c8',
            // border: '1px solid #0579c8'
            background: '#0579c8',
            color: 'white'
        }
    }
});

export default withStyles(styles)(MultipleUpdateTimeslotDialog);
