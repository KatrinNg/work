import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import { fade } from '@material-ui/core/styles/colorManipulator';
import withWidth from '@material-ui/core/withWidth';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';
import CIMSCommonDatePicker from '../../../components/DatePicker/CIMSCommonDatePicker';
import CIMSCommonTextField from '../../../components/TextField/CIMSCommonTextField';
import CIMSCommonButton from '../../../components/Buttons/CIMSCommonButton';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, FastField, ErrorMessage } from 'formik';
import * as yup from 'yup';

import {
    updateState,
    getTimeslotPlan,
    createTimeslotPlanHdr,
    updateTimeslotPlanHdr,
    closeTimeslotPlanHdrDialog
} from '../../../store/actions/appointment/timeslotPlan/timeslotPlanAction';

import {auditAction} from '../../../store/actions/als/logAction';
import { isDateDiffInRange } from '../../../utilities/dateUtilities';
import { getSiteParamsValueByName } from '../../../utilities/commonUtilities';
import Enum from '../../../enums/enum';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CommonMessage from '../../../constants/commonMessage';

const styles = theme => ({
    gridRow: {
        minHeight: '80px'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    selectRoot: {
        color: fade(Colors.common.black, 1) + ' !important',
        '&$shrink': {
            transform: 'translate(14px, -10px) scale(0.75)',
            borderRadius: '4px',
            backgroundColor: Colors.common.white,
            padding: '2px 4px 2px 4px'
        }
    },
    datePickerRoot: {
        '&$disabled $notchedOutline': {
            backgroundColor: Colors.grey[400]
        }
    },
    datePickerInput: {
        color: fade(Colors.green[500], 1) + ' !important',
        zIndex: 1
    },
    disabled: {},
    notchedOutline: {},
    shrink: {},
    error: {
        color: 'red',
        fontSize: '0.75rem'
    }
});

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

class TimeslotPlanDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fontsLoaded: false,
            sites: props.clinicList.filter(x => x.serviceCd === props.serviceCd)
            .map(x => ({
                value: x.siteId,
                label: x.siteName,
                item: x
            })),
            sessions: [],
            rooms: []
        };

        this.refForm = React.createRef();

        // window.test = { ...window.test, rf: this.refForm };
    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
            .then(() => {
                this.setFontsLoaded(true);
            });
        }

        if (this.props.tmsltPlanHdrId)
            this.props.getTimeslotPlan(this.props.tmsltPlanHdrId);

        if (this.props.tmsltPlanHdr)
            this.updateLocalState(this.props.tmsltPlanHdr);

        if (this.props.tmsltPlanHdrId === 0) {
            // Delay for waiting refForm ready
            setTimeout(() => {
                let selectedSite = this.state.sites.find(x => x.value === this.props.siteId);
                this.handleSiteChange(selectedSite);
            }, 0);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tmsltPlanHdr !== this.props.tmsltPlanHdr)
            this.updateLocalState(this.props.tmsltPlanHdr);
    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    getForm = () => {
        if (this.refForm.current) {
            let form = this.refForm.current;
            return form;
        }
        return null;
    }

    updateLocalState = (data) => {
        let value;
        let selectedSite = (value = this.state.sites.find(x => x.value === data.siteId), value);
        this.handleSiteChange(selectedSite, () => {
            let selectedSession = (value = this.state.sessions.find(x => x.value === data.sessId), value);
            let startDate = (value = moment(data.sdate), value.isValid() ? value : null);
            let endDate = (value = moment(data.edate), value.isValid() ? value : null);
            let reserveQuota = (value = data.resvQt, value !== null ? value : undefined);
            let selectedRooms = (value = data.rmIds && data.rmIds.map(x => this.state.rooms.find(y => y.value === x)), value);

            const form = this.getForm();
            if (form) {
                // form.setFieldValue('selectedSite', selectedSite);
                form.setFieldValue('selectedSession', selectedSession);
                form.setFieldValue('startDate', startDate);
                form.setFieldValue('endDate', endDate);
                form.setFieldValue('tempEndDate', endDate);
                form.setFieldValue('reserveQuota', reserveQuota);
                form.setFieldValue('selectedRooms', selectedRooms);
            }
        });
    }

    handleClose = () => {
        this.props.auditAction('Close TimeSlot Plan Dialog', null, null, false);
        this.props.closeTimeslotPlanHdrDialog();
    }

    handleSiteChange = (site, callback) => {
        const form = this.getForm();
        form.setFieldValue('selectedSite', site);

        let sessions = site ? this.props.serviceSessionsConfig.filter(x => x.siteId === site.value)
        .map(x => ({
            value: x.sessId,
            label: x.sessDesc,
            item: x
        })) : [];
        let rooms = site ? this.props.rooms.filter(x => x.siteId === site.value)
        .map(x => ({
            value: x.rmId,
            label: x.rmDesc,
            item: x
        })) : [];
        this.setState({ sessions, rooms }, callback ? callback : () => {});
    }

    handleSessionChange = (session) => {
        const form = this.getForm();
        form.setFieldValue('selectedSession', session);
    }

    handleRoomsChange = (rooms) => {
        const form = this.getForm();
        form.setFieldValue('selectedRooms', rooms);
    }

    handleSave = (values) => {
        const { dialogAction } = this.props;
        if (dialogAction === 'create') {
            let params = {
                siteId: values.selectedSite.value,
                sessId: values.selectedSession.value,
                sdate: values.startDate.format('YYYY-MM-DD'),
                edate: values.endDate.format('YYYY-MM-DD'),
                resvQt: values.reserveQuota,
                rmIds: values.selectedRooms.map(x => x.value)
            };

            this.props.auditAction('Click Save to create a new timeSlot plan');
            this.props.createTimeslotPlanHdr(params, { serviceCd: this.props.serviceCd, siteId: this.props.siteId });
        } else if (dialogAction === 'update') {
            const params = {
                ...this.props.tmsltPlanHdr,
                edate: values.endDate.format('YYYY-MM-DD'),
                resvQt: values.reserveQuota
            };

            this.props.auditAction('Click Save to update timeSlot plan');
            this.props.updateTimeslotPlanHdr(params, { serviceCd: this.props.serviceCd, siteId: this.props.siteId });
        }
    }

    handleReset = () => {
        const { tmsltPlanHdr } = this.props;
        const form = this.getForm();
        if (form && tmsltPlanHdr) {
            form.setFieldValue('endDate', moment(tmsltPlanHdr.edate).isValid() ? moment(tmsltPlanHdr.edate) : null);
            form.setFieldValue('reserveQuota', tmsltPlanHdr.resvQt);
            setTimeout(() => {form.setFieldTouched('endDate', true); form.setFieldTouched('reserveQuota', true);});
            this.props.openCommonMessage({
                msgCode: '130301',
                params: [
                    {
                        name: 'MESSAGE',
                        value: CommonMessage.TIMESLOT_PLAN_RESET_APPLIED
                    }
                ],
                showSnackbar: true
            });
        }
    };

    render() {
        const { classes, dialogAction, open, isClinicalAdminOnly } = this.props;

        const maxModifiableYears = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.TIMESLOT_PLAN_MAX_MODIFIABLE_YEARS);

        switch (dialogAction) {
            case 'create':
            case 'update': {
                const idConstant = this.props.id + '_' + dialogAction;
                return (
                    <Dialog
                        id={idConstant}
                        open={open}
                        fullWidth
                        maxWidth="lg"
                    >
                        <DialogTitle>Detail</DialogTitle>
                        <DialogContent dividers>
                            <Formik
                                innerRef={this.refForm}
                                // enableReinitialize
                                initialValues={{
                                    selectedSite: null,
                                    selectedSession: null,
                                    startDate: null,
                                    endDate: null,
                                    tempEndDate: null,
                                    reserveQuota: undefined,
                                    selectedRooms: null
                                }}
                                validationSchema={yup.object().shape({
                                    selectedSite: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        ,
                                    selectedSession: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        ,
                                    startDate: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        .test('isDate', 'Invalid Date Format', function(date) {
                                            return date && date.isValid();
                                        })
                                        ,
                                    endDate: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        .test('isDate', 'Invalid Date Format', function(date) {
                                            return date && date.isValid();
                                        })
                                        .test('isEndDateAfterStartDate', 'Cannot earlier than Start Date', function(endDate) {
                                            const { startDate } = this.parent;
                                            const _sdate = moment(startDate);
                                            const _edate = moment(endDate);
                                            if (_sdate.isValid() && _edate.isValid())
                                                return _edate.isSameOrAfter(_sdate, 'date');
                                            return true;
                                        })
                                        .test('isEndDateDeltaValid', `Cannot ${dialogAction} Timeslot Plan for more than ${maxModifiableYears} years`, function(endDate) {
                                            if (maxModifiableYears) {
                                                if (dialogAction === 'create') {
                                                    const { startDate } = this.parent;
                                                    if (startDate && moment(startDate).isValid()) {
                                                        return isDateDiffInRange(startDate, endDate, Number(maxModifiableYears), 'year');
                                                    }
                                                }
                                                if (dialogAction === 'update') {
                                                    const {tempEndDate} = this.parent;
                                                    if (tempEndDate && moment(tempEndDate).isValid()) {
                                                        return isDateDiffInRange(endDate, tempEndDate, Number(maxModifiableYears), 'year');
                                                    }
                                                }
                                            }
                                            return true;
                                        })
                                        ,
                                        reserveQuota: yup
                                        .number()
                                        .nullable()
                                        .required('Required')
                                        .min(1, 'Must be greater than 0')
                                        .max(9999, 'Must be <= 9999')
                                        ,
                                    selectedRooms: yup
                                        .array()
                                        .nullable()
                                        .required('Required')
                                })}
                                onSubmit={(values, actions) => {
                                    this.handleSave(values);
                                    setTimeout(() => {
                                        actions.setSubmitting(false);
                                    }, 3000);
                                }}
                            >
                            {props => (
                                <Form>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6} className={classes.gridRow}>
                                            <Field name="selectedSite">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_site'}
                                                    label="* Site English Name"
                                                    options={this.state.sites}
                                                    value={field.value}
                                                    inputProps={{
                                                        isDisabled: dialogAction !== 'create' || isClinicalAdminOnly ,
                                                        filterOption: {
                                                            matchFrom: 'start'
                                                        }
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => {
                                                        this.handleSiteChange(value);
                                                        form.setFieldValue('selectedSession', null);
                                                        form.setFieldValue('selectedRooms', null);
                                                    }}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedSite" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={6} className={classes.gridRow} />
                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="selectedSession">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_session'}
                                                    label="* Session"
                                                    options={this.state.sessions}
                                                    value={field.value}
                                                    inputProps={{
                                                        isDisabled: dialogAction !== 'create'
                                                        // styles: {
                                                        //     control: (provided, state) => ({
                                                        //         background: state.isDisabled ? 'linear-gradient(white 0%, 5%, #e0e0e0 20%)' : provided.background
                                                        //     })
                                                        // }
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => this.handleSessionChange(value)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedSession" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="startDate">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonDatePicker
                                                    id={idConstant + '_startDate_picker'}
                                                    label="* Start Date"
                                                    disabled={dialogAction !== 'create'}
                                                    value={field.value}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: classes.datePickerRoot,
                                                    //         disabled: classes.disabled,
                                                    //         notchedOutline: classes.notchedOutline,
                                                    //         input: classes.datePickerInput
                                                    //     }
                                                    // }}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change start date'
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={value => form.setFieldValue(field.name, value)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="startDate" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="endDate">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonDatePicker
                                                    id={idConstant + '_endDate_picker'}
                                                    label="* End Date"
                                                    value={field.value}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change end date'
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={value => form.setFieldValue(field.name, value)}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="endDate" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="reserveQuota">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonTextField
                                                    id={idConstant + '_reserveQuota_textField'}
                                                    label="* Reserve Quota"
                                                    type="number"
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={value => form.setFieldValue(field.name, value)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="reserveQuota" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={12} className={classes.gridRow}>
                                            <Field name="selectedRooms">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_room'}
                                                    label="* Available Room"
                                                    options={this.state.rooms}
                                                    value={field.value}
                                                    // labelProps={{
                                                    //     classes: {
                                                    //         root: classes.selectRoot,
                                                    //         shrink: classes.shrink
                                                    //     }
                                                    // }}
                                                    inputProps={{
                                                        isDisabled: dialogAction !== 'create',
                                                        isMulti: true,
                                                        hideSelectedOptions: false,
                                                        closeMenuOnSelect: false,
                                                        sortFunc: sortFunc,
                                                        selectAll: '[ Select All ]'
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => this.handleRoomsChange(value)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedRooms" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item container xs={12}>
                                            <Grid item xs={1}>
                                                <CIMSCommonButton
                                                    id={idConstant + '_save'}
                                                    type="submit"
                                                    disabled={props.isSubmitting}
                                                >
                                                    Save
                                                </CIMSCommonButton>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <CIMSCommonButton
                                                    id={idConstant + '_cancel'}
                                                    onClick={this.handleClose}
                                                >
                                                    Cancel
                                                </CIMSCommonButton>
                                            </Grid>
                                            {dialogAction === 'update' && (
                                                <Grid item xs={1}>
                                                    <CIMSCommonButton
                                                        id={idConstant + '_reset'}
                                                        onClick={this.handleReset}
                                                    >
                                                        Reset
                                                    </CIMSCommonButton>
                                                </Grid>
                                            )}
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
            default: return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        dialogAction: state.timeslotPlan.dialogAction,
        tmsltPlanHdrId: state.timeslotPlan.tmsltPlanHdrId,
        tmsltPlanHdr: state.timeslotPlan.tmsltPlanHdr,
        clinicList: state.common.clinicList,
        rooms: state.common.rooms,
        serviceSessionsConfig: state.common.serviceSessionsConfig,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId
    };
}

const mapDispatchToProps = {
    updateState,
    getTimeslotPlan,
    createTimeslotPlanHdr,
    updateTimeslotPlanHdr,
    closeTimeslotPlanHdrDialog,
    auditAction,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(TimeslotPlanDialog)));