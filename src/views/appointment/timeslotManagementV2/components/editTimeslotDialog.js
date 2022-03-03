import { Button, Checkbox, FormControlLabel, Grid, TextField, Typography, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CIMSCommonSelect from '../../../../components/Select/CIMSCommonSelect';
import CustomPaper from '../../../compontent/CustomPaper';
import * as moment from 'moment';
import { getSiteParamsValueByName } from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';
import Alert from '@material-ui/lab/Alert';

const EditTimeslotDialog = (props) => {
    const {
        classes,
        id,
        open,
        handleOnClose,
        timeslotPlanHdr,
        encounterTypes,
        handleCreateTimeslotPlan,
        timeslotPlans,
        loadingPredefinedTimeslots,
        predefinedTimeslots,
        qtTypes,
        sessionsConfig
    } = props;

    const MAX_HANDLE_NO = Number(getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.TIMESLOT_PLAN_MAX_HANDLEABLE_SLOTS)) || 5000;

    const [selectedEncounterType, setSelectedEncounterType] = useState(null);
    const [timeslotOptions, setTimeslotOptions] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    // const [quota, setQuota] = useState('0');
    const [quota, setQuota] = useState({
        qt1: '0',
        qt2: '0',
        qt3: '0',
        qt4: '0',
        qt5: '0',
        qt6: '0',
        qt7: '0',
        qt8: '0'
    });
    const [noOfDataToBeProcessed, setNoOfDataToBeProcessed] = useState(0);

    useEffect(() => {
        console.log(timeslotPlanHdr);
        console.log(sessionsConfig);
    }, [timeslotPlanHdr]);

    // const handleQuotaOnChange = (e) => {
    //     let newValue = e.target.value;
    //     newValue = newValue.replace(/[^0-9]/g, '');
    //     if (newValue.indexOf('0') === 0 && newValue.length > 1) {
    //         newValue = newValue.substring(1);
    //     } else if (newValue.length === 0) {
    //         newValue = '0';
    //     }
    //     setQuota(newValue);
    // };

    const handleQuotaOnChange = (e, qt) => {
        let newValue = e.target.value;
        newValue = newValue.replace(/[^0-9]/g, '');
        if (newValue.indexOf('0') === 0 && newValue.length > 1) {
            newValue = newValue.substring(1);
        } else if (newValue.length === 0) {
            newValue = '0';
        }
        setQuota({ ...quota, [qt]: newValue });
    };

    useEffect(() => {
        let noOfDataToBeProcessed = 0;
        if (selectedEncounterType && timeslots?.length > 0) {
            for (let startDate = moment(timeslotPlanHdr.sdate); startDate.isSameOrBefore(timeslotPlanHdr.edate); startDate = startDate.add(1, 'd')) {
                if (timeslotPlanHdr.weekday[startDate.day()] === '1') {
                    noOfDataToBeProcessed += timeslots.length;
                }
            }
        }
        setNoOfDataToBeProcessed(noOfDataToBeProcessed);
    }, [selectedEncounterType, timeslots]);

    useEffect(() => {
        const newTimeslotOptions = [];
        // console.log('selectedEncounterType: ', selectedEncounterType);
        if (predefinedTimeslots && timeslotPlans && encounterTypes && selectedEncounterType) {
            predefinedTimeslots
                .filter(
                    (timeslot) =>
                        timeslot.encntrTypeId === selectedEncounterType.value &&
                        !timeslotPlans.find(
                            (timeslotPlan) => timeslotPlan.stime === timeslot.stime && timeslotPlan.encntrTypeIdDefault === selectedEncounterType.value
                        )
                )
                .filter((timeslot) => {
                    const session = sessionsConfig.find((s) => s.sessId === timeslotPlanHdr?.sessId);
                    if (session) {
                        return (
                            moment(timeslot.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK).isSameOrAfter(moment(session.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK)) &&
                            moment(timeslot.etime, Enum.TIME_FORMAT_24_HOUR_CLOCK).isSameOrBefore(moment(session.etime, Enum.TIME_FORMAT_24_HOUR_CLOCK))
                        );
                    } else {
                        return true;
                    }
                })
                .sort((a, b) => (moment(a.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK).isBefore(moment(b.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK)) ? -1 : 1))
                .map((timeslot) => {
                    newTimeslotOptions.push({ label: timeslot.stime, value: timeslot.stime, item: timeslot });
                });
        }
        setTimeslots([]);
        setTimeslotOptions(newTimeslotOptions);
    }, [timeslotPlans, selectedEncounterType, predefinedTimeslots]);

    const handleOkButtonClick = () => {
        const params = [];
        let i = 1;

        // selectedEncounterType.map((encounterType) => {
        //     timeslots.map((timeslot) => {
        //         const times = timeslot.value.split('-');
        //         params.push({
        //             rowId: i,
        //             tmsltPlanHdrId: timeslotPlanHdr.tmsltPlanHdrId,
        //             stime: times && times[0],
        //             etime: times && times[1],
        //             qt1: Number(quota),
        //             action: 'insert',
        //             timeChanged: true,
        //             encntrTypeIdDefault: encounterType.value
        //         });
        //         i += 1;
        //     });
        // });

        timeslots.map((timeslot) => {
            params.push({
                rowId: i,
                tmsltPlanHdrId: timeslotPlanHdr.tmsltPlanHdrId,
                stime: timeslot?.item?.stime,
                etime: timeslot?.item?.etime,
                qt1: Number(quota.qt1),
                qt2: Number(quota.qt2),
                qt3: Number(quota.qt3),
                qt4: Number(quota.qt4),
                qt5: Number(quota.qt5),
                qt6: Number(quota.qt6),
                qt7: Number(quota.qt7),
                qt8: Number(quota.qt8),
                action: 'insert',
                timeChanged: true,
                encntrTypeIdDefault: selectedEncounterType.value
            });
            i += 1;
        });

        handleCreateTimeslotPlan(params);
    };

    return (
        <CIMSPromptDialog
            disableEnforceFocus
            open={open}
            id={id}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogTitle={'New Timeslot'}
            dialogContentText={
                <Grid container spacing={2} style={{ width: '100%', margin: 0, padding: '20px 10px' }}>
                    {noOfDataToBeProcessed > MAX_HANDLE_NO && (
                        <Grid item xs={12}>
                            <Alert severity="error" style={{ margin: '5px 0px', fontSize: '16px' }}>
                                {`No. of timeslots to be processed (${noOfDataToBeProcessed}) > ${MAX_HANDLE_NO}. Please modify your planning.`}
                            </Alert>
                        </Grid>
                    )}
                    <Grid item xs={12} container spacing={0} style={{ alignItems: 'center' }}>
                        <CIMSCommonSelect
                            id={id + 'encounterTypes'}
                            label={
                                <>
                                    Encounter Type
                                    <RequiredIcon />
                                </>
                            }
                            options={
                                encounterTypes?.map((encounterType) => ({
                                    label: encounterType.encntrTypeDesc,
                                    value: encounterType.encntrTypeId
                                })) || []
                            }
                            value={selectedEncounterType}
                            // onBlur={() => form.setFieldTouched(field.name, true)}
                            onChange={(value) => {
                                setSelectedEncounterType(value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CIMSCommonSelect
                            id={id + 'startTimes'}
                            label={
                                <>
                                    Start Time
                                    <RequiredIcon />
                                </>
                            }
                            options={timeslotOptions}
                            value={timeslots}
                            inputProps={{
                                // isDisabled: dialogAction !== 'create',
                                isMulti: true,
                                hideSelectedOptions: false,
                                closeMenuOnSelect: false,
                                // sortFunc: sortFunc,
                                selectAll: '[ Select All ]'
                            }}
                            // onBlur={() => form.setFieldTouched(field.name, true)}
                            onChange={(value, params) => {
                                setTimeslots(value);
                            }}
                        />
                    </Grid>
                    {qtTypes?.map((qt) => (
                        <Grid item xs={12} md={3} key={qt.code}>
                            <TextField
                                id={id + '_' + qt.code}
                                label={
                                    <>
                                        {qt.engDesc}
                                        <RequiredIcon />
                                    </>
                                }
                                variant="outlined"
                                fullWidth
                                inputProps={{ style: { padding: '0px 10px' }, maxLength: 4 }}
                                value={quota[qt.code?.toLowerCase()]}
                                onChange={(e) => handleQuotaOnChange(e, qt.code?.toLowerCase())}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Typography>
                            {`No. of timeslots to be processed (Max: ${MAX_HANDLE_NO}): `}
                            <span style={noOfDataToBeProcessed > MAX_HANDLE_NO ? { color: 'red' } : { color: 'black' }}>{noOfDataToBeProcessed}</span>
                        </Typography>
                    </Grid>
                </Grid>
            }
            dialogActions={
                <>
                    <Button
                        id={`${id}_submit_btn`}
                        color="primary"
                        variant="contained"
                        style={{ textTransform: 'unset', fontSize: '16px', margin: '8px' }}
                        onClick={() => handleOkButtonClick()}
                        disabled={!timeslots || timeslots?.length === 0 || !selectedEncounterType || noOfDataToBeProcessed > MAX_HANDLE_NO}
                    >
                        OK
                    </Button>
                    <Button
                        id={`${id}_close_btn`}
                        color="primary"
                        variant="contained"
                        style={{ textTransform: 'unset', fontSize: '16px', margin: '8px' }}
                        onClick={() => handleOnClose()}
                    >
                        Cancel
                    </Button>
                </>
            }
        />
    );
};

const styles = (theme) => ({
    dialogPaper: {
        width: '40%'
    }
});

export default withStyles(styles)(EditTimeslotDialog);
