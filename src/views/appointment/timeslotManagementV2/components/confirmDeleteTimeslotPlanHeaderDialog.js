import { Checkbox, FormControlLabel, Grid, TextField, withStyles } from '@material-ui/core';
import React from 'react';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import * as moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';

const ConfirmDeleteTimeslotPlanHeaderDialog = (props) => {
    const { classes, id, open, handleOnClose, handleDeleteTimeslotPlanHdr, timeslotPlanHdr, site, room, sessions } = props;

    return (
        <CIMSPromptDialog
            disableEnforceFocus
            open={open}
            id={id}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogTitle={'Delete Timeslot Period'}
            dialogContentText={
                <Grid container spacing={2} style={{ width: '100%', margin: 0, padding: '20px 10px' }}>
                    <Grid item xs={12}>
                        <span style={{ fontWeight: 'bold' }}>Confirm to Delete the following Timeslot Period?</span>
                    </Grid>
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
                            <TextField
                                variant="outlined"
                                fullWidth
                                disabled
                                label="Start Date"
                                value={moment(timeslotPlanHdr?.sdate).isValid() && moment(timeslotPlanHdr?.sdate).format(Enum.DATE_FORMAT_DMY)}
                            />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                disabled
                                label="End Date"
                                value={moment(timeslotPlanHdr?.edate).isValid() && moment(timeslotPlanHdr?.edate).format(Enum.DATE_FORMAT_DMY)}
                            />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                disabled
                                label="Session"
                                value={sessions.find((session) => session.value === timeslotPlanHdr?.sessId)?.label || ''}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <CIMSFormLabel fullWidth labelText="Weekday" style={{ padding: 10, paddingTop: 20 }}>
                            <Grid item xs={12} md={8} lg={12} container spacing={1} style={{ alignItems: 'center' }}>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_sunday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Sun"
                                        checked={timeslotPlanHdr?.weekday[0] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_monday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Mon"
                                        checked={timeslotPlanHdr?.weekday[1] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_tuesday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Tue"
                                        checked={timeslotPlanHdr?.weekday[2] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_wednesday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Wed"
                                        checked={timeslotPlanHdr?.weekday[3] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_thursday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Thu"
                                        checked={timeslotPlanHdr?.weekday[4] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_friday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Fri"
                                        checked={timeslotPlanHdr?.weekday[5] === '1'}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        classes={{ root: classes.weekDayCheckBoxRoot }}
                                        control={
                                            <Checkbox
                                                id={`${id}_weekday_saturday`}
                                                color="primary"
                                                disableRipple
                                                classes={{ root: classes.weekDayCheckBoxRoot }}
                                            />
                                        }
                                        label="Sat"
                                        checked={timeslotPlanHdr?.weekday[6] === '1'}
                                        disabled
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
                    id: `${id}_submit_btn`,
                    name: 'Delete',
                    onClick: () => {
                        handleDeleteTimeslotPlanHdr();
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
    weekDayCheckBoxRoot: {
        cursor: 'default',
        padding: '0px 4px',
        '&:hover': {
            background: 'transparent !important'
        }
    }
});

export default withStyles(styles)(ConfirmDeleteTimeslotPlanHeaderDialog);
