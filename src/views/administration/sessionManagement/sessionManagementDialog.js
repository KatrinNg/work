import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    TextField
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import {
    KeyboardDatePicker,
    KeyboardTimePicker
} from '@material-ui/pickers';
import withWidth from '@material-ui/core/withWidth';
import ReactSelect from '../../../components/Select/ReactSelect';
import Enum from '../../../enums/enum';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

import _ from 'lodash';
import moment, { months } from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

import {
    listSingleSessionById,
    updateState,
    createSession,
    updateSession
} from '../../../store/actions/administration/sessionManagement/sessionManagementAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import * as messageUtilities from '../../../utilities/messageUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';

const styles = theme => ({
    gridRow: {
        minHeight: '80px'
    },
    fieldMargin: {
        marginRight: '25px'
    },
    card: {
        width: '100%',
        marginTop: 8
    },
    cardHeaderRoot: {
        background: theme.palette.text.primary,
        padding: '8px'
    },
    cardHeaderTitle: {
        fontSize: theme.palette.textSize,
        color: theme.palette.background.default,
        fontWeight: 'bold'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    buttonRoot: {
        minWidth: '150px'
    },
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    },
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    multipleTipRoot: {
        color: theme.palette.primary.main
    },
    disableChangeTimeFromHelper: {
        paddingLeft: 5,
        color: theme.palette.primary.main
    },
    multipleUpdateForm: {
        width: 800,
        height: 550,
        paddingTop: 20
    },
    labelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    },
    inputLabel: {
        //zIndex: 1
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    }
});

class SessionManagementDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fontsLoaded: false,
            sites: props.clinicList.filter(x => x.svcCd === props.login.service.svcCd).map(x => ({
                value: x.siteId,
                label: x.siteName,
                item: x
            })),
            sessions: null,
            selectedSite: null,
            siteMenuOpen: false,
            siteInput: '',
            selectedSession: null,
            sessionMenuOpen: false,
            sessionInput: '',
            startTime: null,
            endTime: null,
            efftDate: moment(new Date()),
            expyDate: null,
            isActive: true
        };
    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
                .then(() => {
                    this.setFontsLoaded(true);
                });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sessionManagement.updatingRecords != this.props.sessionManagement.updatingRecords) {
            this.updateLocalState(this.props.sessionManagement.updatingRecords);
        }
    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    updateLocalState = (updatingRecords) => {
        if (updatingRecords.sessId) {
            const getSelectedSite = this.props.clinicList.find(x => x.siteId === updatingRecords.siteId.siteId);

            this.setState({
                ...this.state,
                selectedSite: getSelectedSite ? {
                    value: getSelectedSite.siteId,
                    label: getSelectedSite.siteName,
                    item: getSelectedSite
                } : null,
                selectedSession: updatingRecords.sessDesc,
                startTime: moment(updatingRecords.stime, 'HH:mm'),
                endTime: moment(updatingRecords.etime, 'HH:mm'),
                efftDate: moment(updatingRecords.efftDate),
                expyDate: updatingRecords.expyDate !== null ? moment(updatingRecords.expyDate) : null,
                isActive: updatingRecords.status === 'A' ? true : false
            });
        }
    }

    handleClose = () => {
        this.props.auditAction(AlsDesc.CANCEL,null,null,false,'cmn');
        this.props.updateState({dialogOpen: false, dialogAction: '', updatingRecords: []});

        this.props.clearRowSelected();
    }

    handleSubmit = () => {
        this.refs.form.submit();
    }

    handleSave = (values) => {
        const {sessionManagement, isServiceAdmin} = this.props;

        const formattedDateOrTime = (data, isTime = false) => {
            return moment(data, isTime ? 'HH:mm' : 'YYYY-MM-DD');
        };

        if (sessionManagement.dialogAction === 'create') {
            const sessionRecords = sessionManagement.records;

            const params = {
                siteId: values.selectedSite.value,
                sessDesc: values.selectedSession,
                stime: values.startTime.format('HH:mm'),
                etime: values.endTime.format('HH:mm'),
                efftDate: values.efftDate.format('YYYY-MM-DD'),
                expyDate: values.expyDate === null ? null : values.expyDate.format('YYYY-MM-DD'),
                status: values.isActive ? 'A' : 'I'
            };

            this.props.auditAction('Create Session');
            this.props.createSession(params, params.siteId, isServiceAdmin);
        } else if (sessionManagement.dialogAction === 'update') {
            const sessionRecords = sessionManagement.records;
            const updatingSessionId = sessionManagement.updatingRecords.sessId;

            const params = {
                sessId: updatingSessionId,
                siteId: values.selectedSite.value,
                sessDesc: values.selectedSession,
                stime: values.startTime.format('HH:mm'),
                etime: values.endTime.format('HH:mm'),
                efftDate: values.efftDate.format('YYYY-MM-DD'),
                expyDate: values.expyDate === null ? null : values.expyDate.format('YYYY-MM-DD'),
                status: values.isActive ? 'A' : 'I',
                version: sessionManagement.updatingRecords.version
            };

            this.props.auditAction('Save Session Update');
            this.props.updateSession(params, updatingSessionId, isServiceAdmin);
        }
    }

    getSearchParams = () => {
        return {
            encounterTypeCd: this.props.encounterTypeCd,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            page: this.props.page,
            pageSize: this.props.pageSize
        };
    }

    render() {
        const {classes, sessionManagement, open, isServiceAdmin, clinicList, login} = this.props;
        const {defaultQuotaDescValue} = this.state;
        let quotaOption = {};
        defaultQuotaDescValue && defaultQuotaDescValue.forEach((item) => {
            quotaOption['new' + item.engDesc] = this.state['new' + item.engDesc];
            quotaOption['old' + item.engDesc] = this.state['old' + item.engDesc];
        });

        const idConstant = 'sessionManagementDialog' + '_' + sessionManagement.dialogAction;

        const getSelectedSite = clinicList.find(x => x.siteId === login.clinic.siteId);



        return (
            <Dialog
                id={idConstant}
                open={open}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>Detail</DialogTitle>
                <DialogContent>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            selectedSite: this.state.selectedSite ? this.state.selectedSite : getSelectedSite ? {
                                value: getSelectedSite.siteId,
                                label: getSelectedSite.siteName,
                                item: getSelectedSite
                            } : null,
                            selectedSession: this.state.selectedSession,
                            startTime: this.state.startTime,
                            endTime: this.state.endTime,
                            efftDate: this.state.efftDate,
                            expyDate: this.state.expyDate,
                            isActive: this.state.isActive
                        }}
                        validationSchema={yup.object({
                            selectedSite: yup.string()
                                .nullable()
                                .required('Required'),
                            selectedSession: yup.string()
                                .nullable()
                                .required('Required'),
                            startTime: yup.date()
                                .nullable()
                                .test('isStartTimeBeforeEndTime', 'Start time must be earlier than end time', function (startTime) {
                                    const {endTime} = this.parent;
                                    const stime = moment(startTime);
                                    const etime = moment(endTime);
                                    if (stime.isValid() && etime.isValid())
                                        return stime.isBefore(etime);
                                    return true;
                                })
                                .required('Required'),
                            endTime: yup.date()
                                .nullable()
                                .test('isEndTimeAfterStartTime', 'End time must be later than start time', function (endTime) {
                                    const {startTime} = this.parent;
                                    const stime = moment(startTime);
                                    const etime = moment(endTime);
                                    if (stime.isValid() && etime.isValid())
                                        return etime.isAfter(stime);
                                    return true;
                                })
                                .required('Required'),
                            efftDate: yup.date()
                                .nullable()
                                .required('Required'),
                            expyDate: yup.date()
                                .nullable()
                                .test('isExpiryDateAfterEfftDate', 'Cannot earlier than Effective Date', function (expyDate) {
                                    const {efftDate} = this.parent;
                                    const sDate = moment(efftDate).startOf('day');
                                    const eDate = moment(expyDate).startOf('day');
                                    if (sDate.isValid() && eDate.isValid())
                                        return eDate.isSameOrAfter(sDate);
                                    return true;
                                })
                            // .required('Required')
                        })}
                        onSubmit={(values, actions) => {
                            this.handleSave(values);
                            setTimeout(() => {
                                actions.setSubmitting(false);
                            }, 3000);
                        }}
                    >
                        {({isSubmitting}) => (
                            <Form>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} className={classes.gridRow}>
                                        <Field name="selectedSite">
                                            {({ field, form, meta }) => (
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    <InputLabel
                                                        ref={ref => this.refSiteLabel = ref}
                                                        margin="dense"
                                                        className={classes.inputLabel}
                                                        shrink={field.value != null || this.state.siteMenuOpen}
                                                        id={idConstant + '_site_label'}
                                                    >
                                                        <RequiredIcon/> Site English Name
                                                    </InputLabel>
                                                    <OutlinedInput
                                                        labelWidth={this.state.fontsLoaded ? this.refSiteLabel.offsetWidth : 0}
                                                        margin="dense"
                                                        id={idConstant + '_site_select'}
                                                        notched={field.value != null || this.state.siteMenuOpen}
                                                        inputComponent={ReactSelect}
                                                        inputProps={{
                                                            isClearable: true,
                                                            isDisabled: !this.props.isServiceAdmin || sessionManagement.dialogAction !== 'create',
                                                            isLoading: false,
                                                            isRtl: false,
                                                            isSearchable: true,
                                                            filterOption: {
                                                                matchFrom: 'start'
                                                            },
                                                            placeholder: '',
                                                            menuPlacement: 'auto',
                                                            maxMenuHeight: 500,
                                                            menuPortalTarget: document.body,
                                                            isMulti: false,
                                                            options: this.state.sites,
                                                            onMenuOpen: () => this.setState({ siteMenuOpen: true }),
                                                            onMenuClose: () => this.setState({ siteMenuOpen: false }),
                                                            value: field.value,
                                                            inputValue: this.state.siteInput,
                                                            onChange: (value, params) => form.setFieldValue(field.name, value),
                                                            onInputChange: (value, params) => this.setState({ siteInput: value }),
                                                            onBlur: () => form.setFieldTouched(field.name, true)
                                                        }}
                                                    />
                                                </FormControl>
                                            )}
                                        </Field>
                                        <ErrorMessage name="selectedSite" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <Field name="selectedSession">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <TextField
                                                    {...field}
                                                    id={idConstant + '_session_textField'}
                                                    label={<><RequiredIcon/> Session</>}
                                                    margin="dense"
                                                    variant="outlined"
                                                    fullWidth
                                                    inputProps={{
                                                        // min: 1
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="selectedSession" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={3} className={classes.gridRow}/>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <Field name="startTime">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <KeyboardTimePicker
                                                    id={idConstant + '_startTime_picker'}
                                                    label={<><RequiredIcon/> Start Time</>}
                                                    margin="dense"
                                                    inputVariant="outlined"
                                                    fullWidth
                                                    format="HH:mm"
                                                    autoOk
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={time => form.setFieldValue(field.name, (time && time.isValid()) ? time : null)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change start time'
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="startTime" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <Field name="endTime">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <KeyboardTimePicker
                                                    id={idConstant + '_endTime_picker'}
                                                    label={<><RequiredIcon/> End Time</>}
                                                    margin="dense"
                                                    inputVariant="outlined"
                                                    fullWidth
                                                    format="HH:mm"
                                                    autoOk
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={time => form.setFieldValue(field.name, (time && time.isValid()) ? time : null)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change end time'
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="endTime" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <Field name="efftDate">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <KeyboardDatePicker
                                                    id={idConstant + '_efftDate_picker'}
                                                    label={<><RequiredIcon/> Effective Date</>}
                                                    margin="dense"
                                                    inputVariant="outlined"
                                                    fullWidth
                                                    format="DD-MM-YYYY"
                                                    autoOk
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={efftDate => form.setFieldValue(field.name, (efftDate && efftDate.isValid()) ? efftDate : null)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change effective date'
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="efftDate" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <Field name="expyDate">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <KeyboardDatePicker
                                                    id={idConstant + '_expiryDate_picker'}
                                                    label="Expiry Date"
                                                    margin="dense"
                                                    inputVariant="outlined"
                                                    fullWidth
                                                    format="DD-MM-YYYY"
                                                    autoOk
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={expyDate => form.setFieldValue(field.name, (expyDate && expyDate.isValid()) ? expyDate : null)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change expiry date'
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="expyDate" component="div"
                                            className={classes.error}
                                        />
                                    </Grid>
                                    <Grid item xs={12} className={classes.gridRow}>
                                        <Field name="isActive">
                                            {({
                                                   field,
                                                   form,
                                                   meta
                                               }) => (
                                                <FormControlLabel
                                                    control={<Checkbox
                                                        checked={field.value}
                                                        onChange={isActive => form.setFieldValue(field.name, isActive.target.checked)}
                                                        name="isActive"
                                                        color="primary"
                                                             />}
                                                    label="Is Active"
                                                    labelPlacement="start"
                                                />
                                            )}
                                        </Field>
                                    </Grid>
                                    <Grid item container xs={12}>
                                        <Grid item xs={1}>
                                            <Button type="submit" className={classes.actionButtonRoot}
                                                variant="contained" color="primary"
                                                disabled={isSubmitting}
                                                id={idConstant + '_save'}
                                            >Save</Button>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Button className={classes.actionButtonRoot} variant="contained"
                                                color="primary" onClick={this.handleClose}
                                                id={idConstant + '_cancel'}
                                            >Cancel</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        sessionManagement: state.sessionManagement,
        tmsltPlanHdrId: state.sessionManagement.tmsltPlanHdrId,
        tmsltPlanHdr: state.sessionManagement.tmsltPlanHdr,
        clinicList: state.common.clinicList,
        rooms: state.common.rooms,
        sessionsConfig: state.common.sessionsConfig,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        commonMessageDetail: state.message.commonMessageDetail,
        login: state.login
    };
}

const mapDispatchToProps = {
    listSingleSessionById,
    updateState,
    createSession,
    updateSession,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(SessionManagementDialog)));
