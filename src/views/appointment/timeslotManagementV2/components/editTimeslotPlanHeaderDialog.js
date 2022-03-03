import { Grid, Checkbox, FormControlLabel, withStyles, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CIMSCommonDatePicker from '../../../../components/DatePicker/CIMSCommonDatePicker';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import * as moment from 'moment';
import CIMSCommonSelect from '../../../../components/Select/CIMSCommonSelect';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import Alert from '@material-ui/lab/Alert';
import { getSiteParamsValueByName } from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';
import { isDateDiffInRange } from '../../../../utilities/dateUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { connect } from 'react-redux';
import CommonMessage from '../../../../constants/commonMessage';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';

const EditTimeslotPlanHeaderDialog = (props) => {
    const {
        classes,
        id,
        open,
        handleOnClose,
        timeslotPlanHdr,
        site,
        room,
        sessions,
        handleCreateTimeslotPlanHdr,
        handleUpdateTimeslotPlanHdr,
        openCommonMessage
    } = props;

    const maxModifiableYears = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.TIMESLOT_PLAN_MAX_MODIFIABLE_YEARS);

    const [errorMessages, setErrorMessages] = useState([]);

    const [isStartDateError, setIsStartDateError] = useState(false);
    const [isEndDateError, setIsEndDateError] = useState(false);

    const [newTimeslotPlanHeader, setNewTimeslotPlanHeader] = useState({
        sdate: moment(),
        edate: moment().add(1, 'd'),
        sessId: null,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false
    });

    useEffect(() => {
        if (timeslotPlanHdr) {
            const newTimeslotPlanHeader = {
                sdate: timeslotPlanHdr.sdate,
                edate: timeslotPlanHdr.edate,
                sessId: timeslotPlanHdr.sessId,
                sun: timeslotPlanHdr?.weekday[0] === '1',
                mon: timeslotPlanHdr?.weekday[1] === '1',
                tue: timeslotPlanHdr?.weekday[2] === '1',
                wed: timeslotPlanHdr?.weekday[3] === '1',
                thu: timeslotPlanHdr?.weekday[4] === '1',
                fri: timeslotPlanHdr?.weekday[5] === '1',
                sat: timeslotPlanHdr?.weekday[6] === '1'
            };
            setNewTimeslotPlanHeader(newTimeslotPlanHeader);
        }
    }, [timeslotPlanHdr]);

    const handleOkButtonClick = () => {
        console.log(timeslotPlanHdr);
        const param = {
            siteId: site.siteId,
            sessId: newTimeslotPlanHeader.sessId,
            sdate: moment(newTimeslotPlanHeader.sdate).format('YYYY-MM-DD'),
            edate: moment(newTimeslotPlanHeader.edate).format('YYYY-MM-DD'),
            rmIds: [room.rmId],
            weekday: `${+newTimeslotPlanHeader.sun}${+newTimeslotPlanHeader.mon}${+newTimeslotPlanHeader.tue}${+newTimeslotPlanHeader.wed}${+newTimeslotPlanHeader.thu}${+newTimeslotPlanHeader.fri}${+newTimeslotPlanHeader.sat}`
        };
        if (!timeslotPlanHdr) {
            handleCreateTimeslotPlanHdr(param);
        } else {
            handleUpdateTimeslotPlanHdr({ ...param, groupId: timeslotPlanHdr.groupId });
        }
    };

    const performValidation = () => {
        const newErrorMessages = [];
        let startDateError = false,
            endDateError = false;
        if (!timeslotPlanHdr) {
            if (!newTimeslotPlanHeader.sdate) {
                newErrorMessages.push('Start Date is Required!');
                startDateError = true;
            } else if (!moment(newTimeslotPlanHeader.sdate).isValid()) {
                newErrorMessages.push('Start Date is invalid! (DD-MM-YYYY)');
                startDateError = true;
            } else if (moment(newTimeslotPlanHeader.sdate).isSameOrBefore(moment().add(-1, 'd'))) {
                newErrorMessages.push(`Start Date is before Today! (${moment().format('DD-MM-YYYY')})`);
                startDateError = true;
            }
        }

        if (!newTimeslotPlanHeader.edate) {
            newErrorMessages.push('End Date is Required!');
            endDateError = true;
        } else if (!moment(newTimeslotPlanHeader.edate).isValid()) {
            newErrorMessages.push('End Date is invalid! (DD-MM-YYYY)');
            endDateError = true;
        } else if (moment(newTimeslotPlanHeader.edate).isSameOrBefore(moment(newTimeslotPlanHeader.sdate).add(-1, 'd'))) {
            newErrorMessages.push(`End Date is before Start Date! (${moment(newTimeslotPlanHeader.sdate).format('DD-MM-YYYY')})`);
            endDateError = true;
        }

        if (!timeslotPlanHdr) {
            if (
                moment(newTimeslotPlanHeader.sdate).isValid() &&
                moment(newTimeslotPlanHeader.edate).isValid() &&
                !isDateDiffInRange(newTimeslotPlanHeader.sdate, newTimeslotPlanHeader.edate, Number(maxModifiableYears), 'year')
            ) {
                newErrorMessages.push(`Cannot create Timeslot Period for more than ${maxModifiableYears} years`);
                endDateError = true;
            }
        } else {
            if (
                moment(timeslotPlanHdr.edate).isValid() &&
                moment(newTimeslotPlanHeader.edate).isValid() &&
                !isDateDiffInRange(timeslotPlanHdr.edate, newTimeslotPlanHeader.edate, Number(maxModifiableYears), 'year')
            ) {
                newErrorMessages.push(`Cannot update Timeslot Period for more than ${maxModifiableYears} years`);
                endDateError = true;
            }
        }
        setErrorMessages(newErrorMessages);
        setIsStartDateError(startDateError);
        setIsEndDateError(endDateError);
    };

    useEffect(() => {
        performValidation();
    }, [newTimeslotPlanHeader.sdate, newTimeslotPlanHeader.edate]);

    return (
        <CIMSPromptDialog
            disableEnforceFocus
            open={open}
            id={id}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogTitle={`${!timeslotPlanHdr ? 'New' : 'Edit'} Timeslot Period`}
            dialogContentText={
                <Grid container spacing={2} style={{ width: '100%', margin: 0, padding: '20px 10px' }}>
                    {errorMessages.length > 0 && (
                        <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                            <Grid item xs={12}>
                                {errorMessages.map((errorMessage, i) => (
                                    <Alert severity="error" key={`errorMessage-${i}`} style={{ margin: '5px 0px' }}>
                                        {errorMessage}
                                    </Alert>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                    {timeslotPlanHdr && (
                        <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                            {((moment(newTimeslotPlanHeader.edate).isValid() && moment(newTimeslotPlanHeader.edate).isBefore(moment(timeslotPlanHdr.edate))) ||
                                (timeslotPlanHdr.weekday[0] === '1' && !newTimeslotPlanHeader.sun) ||
                                (timeslotPlanHdr.weekday[1] === '1' && !newTimeslotPlanHeader.mon) ||
                                (timeslotPlanHdr.weekday[2] === '1' && !newTimeslotPlanHeader.tue) ||
                                (timeslotPlanHdr.weekday[3] === '1' && !newTimeslotPlanHeader.wed) ||
                                (timeslotPlanHdr.weekday[4] === '1' && !newTimeslotPlanHeader.thu) ||
                                (timeslotPlanHdr.weekday[5] === '1' && !newTimeslotPlanHeader.fri) ||
                                (timeslotPlanHdr.weekday[6] === '1' && !newTimeslotPlanHeader.sat)) && (
                                <Grid item xs={12}>
                                    <Alert severity="error" style={{ margin: '5px 0px' }}>
                                        Note: All timeslots out of the range will be deleted
                                    </Alert>
                                </Grid>
                            )}
                            {((moment(newTimeslotPlanHeader.edate).isValid() && moment(newTimeslotPlanHeader.edate).isAfter(moment(timeslotPlanHdr.edate))) ||
                                (timeslotPlanHdr.weekday[0] === '0' && newTimeslotPlanHeader.sun) ||
                                (timeslotPlanHdr.weekday[1] === '0' && newTimeslotPlanHeader.mon) ||
                                (timeslotPlanHdr.weekday[2] === '0' && newTimeslotPlanHeader.tue) ||
                                (timeslotPlanHdr.weekday[3] === '0' && newTimeslotPlanHeader.wed) ||
                                (timeslotPlanHdr.weekday[4] === '0' && newTimeslotPlanHeader.thu) ||
                                (timeslotPlanHdr.weekday[5] === '0' && newTimeslotPlanHeader.fri) ||
                                (timeslotPlanHdr.weekday[6] === '0' && newTimeslotPlanHeader.sat)) && (
                                <Grid item xs={12}>
                                    <Alert severity="info" style={{ margin: '5px 0px' }}>
                                        Note: Timeslots will be created within the range
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    )}
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <Grid item xs={12} lg={6}>
                            <TextField variant="outlined" fullWidth disabled label="Site" value={site?.siteDesc} />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField variant="outlined" fullWidth disabled label="Room" value={room?.rmDesc} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <Grid item xs={12} lg={4}>
                            <CIMSCommonDatePicker
                                id={`${id}_start_date_datePicker`}
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
                                value={newTimeslotPlanHeader.sdate}
                                onChange={(value) => {
                                    if (newTimeslotPlanHeader.edate && moment(value).isAfter(moment(newTimeslotPlanHeader.edate))) {
                                        setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, sdate: value, edate: value });
                                    } else {
                                        setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, sdate: value });
                                    }
                                }}
                                minDate={moment()}
                                error={isStartDateError}
                                disabled={timeslotPlanHdr}
                            />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <CIMSCommonDatePicker
                                id={`${id}_end_date_datePicker`}
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
                                value={newTimeslotPlanHeader.edate}
                                onChange={(value) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, edate: value })}
                                minDate={moment(newTimeslotPlanHeader.sdate).isValid() ? newTimeslotPlanHeader.sdate : undefined}
                                error={isEndDateError}
                            />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <CIMSCommonSelect
                                id={`${id}_session_select`}
                                options={sessions}
                                label={
                                    <span>
                                        Session
                                        <RequiredIcon />
                                    </span>
                                }
                                inputProps={{
                                    isClearable: false
                                }}
                                value={sessions.find((session) => session.value === newTimeslotPlanHeader.sessId) || null}
                                onChange={(value) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, sessId: value.value })}
                                disabled={timeslotPlanHdr}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <CIMSFormLabel fullWidth labelText="Weekday" style={{ padding: 10, paddingTop: 20 }}>
                            <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_sunday_checkBox`} color="primary" />}
                                        label="Sun"
                                        checked={newTimeslotPlanHeader.sun}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, sun: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_monday_checkBox`} color="primary" />}
                                        label="Mon"
                                        checked={newTimeslotPlanHeader.mon}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, mon: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_tuesday_checkBox`} color="primary" />}
                                        label="Tue"
                                        checked={newTimeslotPlanHeader.tue}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, tue: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_wednesday_checkBox`} color="primary" />}
                                        label="Wed"
                                        checked={newTimeslotPlanHeader.wed}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, wed: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_thursday_checkBox`} color="primary" />}
                                        label="Thu"
                                        checked={newTimeslotPlanHeader.thu}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, thu: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_friday_checkBox`} color="primary" />}
                                        label="Fri"
                                        checked={newTimeslotPlanHeader.fri}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, fri: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        control={<Checkbox id={`${id}_weekday_Saturday_checkBox`} color="primary" />}
                                        label="Sat"
                                        checked={newTimeslotPlanHeader.sat}
                                        onChange={(e) => setNewTimeslotPlanHeader({ ...newTimeslotPlanHeader, sat: e.target.checked })}
                                    />
                                </Grid>
                            </Grid>
                        </CIMSFormLabel>
                    </Grid>
                    {timeslotPlanHdr && (
                        <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                            <Grid item xs={12} lg={6}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    label="Last Appointment Booking On"
                                    value={
                                        timeslotPlanHdr.lastApptDate &&
                                        moment(timeslotPlanHdr.lastApptDate).isValid() &&
                                        moment(timeslotPlanHdr.lastApptDate).format(Enum.DATE_FORMAT_DMY)
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    label="Updated On"
                                    value={
                                        timeslotPlanHdr.updateDtm &&
                                        moment(timeslotPlanHdr.updateDtm).isValid() &&
                                        moment(timeslotPlanHdr.updateDtm).format(Enum.DATE_FORMAT_DMY)
                                    }
                                />
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            }
            buttonConfig={[
                {
                    id: `${id}_reset_btn`,
                    name: 'Reset',
                    onClick: () => {
                        const newTimeslotPlanHeader = {
                            sdate: timeslotPlanHdr.sdate,
                            edate: timeslotPlanHdr.edate,
                            sessId: timeslotPlanHdr.sessId,
                            sun: timeslotPlanHdr?.weekday[0] === '1',
                            mon: timeslotPlanHdr?.weekday[1] === '1',
                            tue: timeslotPlanHdr?.weekday[2] === '1',
                            wed: timeslotPlanHdr?.weekday[3] === '1',
                            thu: timeslotPlanHdr?.weekday[4] === '1',
                            fri: timeslotPlanHdr?.weekday[5] === '1',
                            sat: timeslotPlanHdr?.weekday[6] === '1'
                        };
                        setNewTimeslotPlanHeader(newTimeslotPlanHeader);
                        openCommonMessage({
                            msgCode: '130301',
                            params: [
                                {
                                    name: 'MESSAGE',
                                    value: CommonMessage.TIMESLOT_PLAN_RESET_APPLIED
                                }
                            ],
                            showSnackbar: true
                        });
                    },
                    display: timeslotPlanHdr !== null
                },
                {
                    id: `${id}_submit_btn`,
                    name: 'OK',
                    onClick: () => {
                        handleOkButtonClick();
                    },
                    disabled:
                        !newTimeslotPlanHeader.sdate ||
                        !newTimeslotPlanHeader.edate ||
                        !newTimeslotPlanHeader.sessId ||
                        moment(newTimeslotPlanHeader.edate).isBefore(moment(newTimeslotPlanHeader.sdate)) ||
                        (!newTimeslotPlanHeader.mon &&
                            !newTimeslotPlanHeader.tue &&
                            !newTimeslotPlanHeader.wed &&
                            !newTimeslotPlanHeader.thu &&
                            !newTimeslotPlanHeader.fri &&
                            !newTimeslotPlanHeader.sat &&
                            !newTimeslotPlanHeader.sun) ||
                        (timeslotPlanHdr === null
                            ? !isDateDiffInRange(newTimeslotPlanHeader.sdate, newTimeslotPlanHeader.edate, Number(maxModifiableYears), 'year')
                            : !isDateDiffInRange(timeslotPlanHdr.edate, newTimeslotPlanHeader.edate, Number(maxModifiableYears), 'year'))
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
    datePickerInput: {
        height: '20px'
    }
});

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditTimeslotPlanHeaderDialog));
