import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import ToolTip from '@material-ui/core/Tooltip';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import DatePicker from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import { updateState } from '../../../../store/actions/administration/enctManagement';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Enum from '../../../../enums/enum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { PAGE_STATUS } from '../../../../enums/administration/enctManagement';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';

let fieldValids = {
    validators: {
        encounterTypeCd: [ValidatorEnum.required],
        minInterval: [ValidatorEnum.required],
        maxTmslt: [ValidatorEnum.required],
        drtn: [ValidatorEnum.required],
        apptRmndDay: [ValidatorEnum.required]
    },
    errorMessages: {
        encounterTypeCd: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        minInterval: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        maxTmslt: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        drtn: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        apptRmndDay: [CommonMessage.VALIDATION_NOTE_REQUIRED()]
    }
};

const id = 'enctGeneral';
const EnctGeneral = (props) => {
    const {
        classes,
        pageStatus,
        clinicList,
        selectedList,
        changingInfo = {},
        enctDetailGeneral,
        isClinicalAdmin
    } = props;
    const { validators, errorMessages } = fieldValids;

    const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE;

    const onChange = (obj) => {
        props.updateState({
            enctDetailGeneral: {
                ...enctDetailGeneral,
                changingInfo: {
                    ...changingInfo,
                    ...obj
                }
            }
        });
    };

    const shouldDisableDate = (date) => {
        if(pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING) {
            if (moment(changingInfo.efftDate).isValid()) {
                return moment(date).isBefore(moment(changingInfo.efftDate), 'days');
            } else {
                return false;
            }
        }
        return false;
    };

    return (
        <Grid container justify="center">
            <Grid container className={classes.root} spacing={3}>
                <Grid item xs={6}>
                    <Select
                        id={`${id}_siteToApply`}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Site/Clinic to be applied{isClinicalAdminSetting()?null:<RequiredIcon />}</>
                        }}
                        isDisabled={isNonEdit || pageStatus === PAGE_STATUS.EDITING || selectedList.length > 0||isClinicalAdminSetting()}
                        options={clinicList}
                        value={changingInfo.siteId}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage={!isClinicalAdminSetting()}
                        onChange={e => onChange({ siteId: e.value })}
                    />
                </Grid>

                <Grid item xs={6}></Grid>

                <Grid item xs={3}>
                    <FastTextFieldValidator
                        id={`${id}_encounterTypeCd`}
                        label={<>Encounter Type Code<RequiredIcon /></>}
                        variant="outlined"
                        absoluteMessage
                        calActualLength
                        disabled={isNonEdit || pageStatus === PAGE_STATUS.EDITING}
                        value={changingInfo.encntrTypeCd}
                        inputProps={{ maxLength: 20 }}
                        onBlur={e => onChange({ encntrTypeCd: e.target.value })}
                        validators={validators.encounterTypeCd}
                        errorMessages={errorMessages.encounterTypeCd}
                    />
                </Grid>

                <Grid item xs={9}>
                    <FastTextFieldValidator
                        id={`${id}_encounterTypeDesc`}
                        label={<>Encounter Type Description<RequiredIcon /></>}
                        variant="outlined"
                        calActualLength
                        absoluteMessage
                        disabled={isNonEdit || pageStatus === PAGE_STATUS.EDITING}
                        value={changingInfo.encntrTypeDesc}
                        inputProps={{ maxLength: 100 }}
                        onBlur={e => onChange({ encntrTypeDesc: e.target.value })}
                        validators={validators.encounterTypeCd}
                        errorMessages={errorMessages.encounterTypeCd}
                    />
                </Grid>

                <Grid item container xs={3} className={classes.paddingGrid}>
                    <Grid item xs={6}>
                        <ToolTip title={CommonMessage.ENCTMAN_MINIMUM_INTERVAL()}>
                            <FastTextFieldValidator
                                id={`${id}_miniIntervalNumber`}
                                label={<>Minimum Interval<RequiredIcon /></>}
                                variant="outlined"
                                absoluteMessage
                                type="number"
                                disabled={isNonEdit}
                                value={_.toString(changingInfo.minInterval)}
                                inputProps={{ maxLength: 3 }}
                                onBlur={e => onChange({ minInterval: e.target.value ? _.parseInt(e.target.value) : null })}
                                validators={validators.minInterval}
                                errorMessages={errorMessages.minInterval}
                            />
                        </ToolTip>
                    </Grid>
                    <Grid item xs={6}>
                        <Select
                            id={`${id}_miniIntervalUnit`}
                            options={Enum.ENCTYPE_INTERVAL_UNIT.map(item => ({
                                value: item.code, label: item.engDesc
                            }))}
                            value={changingInfo.minIntervalUnit}
                            absoluteMessage
                            isDisabled={isNonEdit}
                            onChange={e => onChange({ minIntervalUnit: e.value })}
                            validators={validators.minInterval}
                            errorMessages={errorMessages.minInterval}
                        />
                    </Grid>
                </Grid>

                <Grid item xs={3}>
                    <ToolTip title={CommonMessage.ENCTMAN_MAXIMUM_TIMESLOT()}>
                        <FastTextFieldValidator
                            id={`${id}_maxTimeslot`}
                            label={<>Maximum Timeslot<RequiredIcon /></>}
                            variant="outlined"
                            absoluteMessage
                            type="number"
                            disabled={isNonEdit}
                            value={_.toString(changingInfo.maxTmslt)}
                            inputProps={{ maxLength: 3 }}
                            onBlur={e => onChange({ maxTmslt: e.target.value ? _.parseInt(e.target.value) : null })}
                            validators={validators.maxTmslt}
                            errorMessages={errorMessages.maxTmslt}
                        />
                    </ToolTip>
                </Grid>

                <Grid item xs={3}>
                    <FastTextFieldValidator
                        id={`${id}_drtn`}
                        label={<>Recommended Duration(min)<RequiredIcon /></>}
                        variant="outlined"
                        absoluteMessage
                        type="number"
                        disabled={isNonEdit}
                        value={_.toString(changingInfo.drtn)}
                        inputProps={{ maxLength: 3 }}
                        onBlur={e => onChange({ drtn: e.target.value ? _.parseInt(e.target.value) : null })}
                        validators={validators.drtn}
                        errorMessages={errorMessages.drtn}
                    />
                </Grid>

                <Grid item xs={3}>
                    <FastTextFieldValidator
                        id={`${id}_apptRmndDay`}
                        label={<>Appointment Reminder Day<RequiredIcon /></>}
                        variant="outlined"
                        absoluteMessage
                        type="number"
                        disabled={isNonEdit}
                        value={_.toString(changingInfo.apptRmndDay)}
                        inputProps={{ maxLength: 2 }}
                        onBlur={e => onChange({ apptRmndDay: e.target.value ? _.parseInt(e.target.value) : null })}
                        validators={validators.apptRmndDay}
                        errorMessages={errorMessages.apptRmndDay}
                    />
                </Grid>

                <Grid item xs={3}>
                    <Select
                        id={`${id}_chargeable`}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Chargeable<RequiredIcon /></>
                        }}
                        options={Enum.COMMON_YES_NO_LIST.map(item => ({
                            value: item.code, label: item.engDesc
                        }))}
                        isDisabled={isNonEdit}
                        value={_.toString(changingInfo.isCharge)}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                        onChange={e => onChange({ isCharge: _.parseInt(e.value) })}
                    />
                </Grid>

                <Grid item xs={3}>
                    <Select
                        id={`${id}_alloUseIntBooking`}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Internet Booking<RequiredIcon /></>
                        }}
                        options={Enum.COMMON_YES_NO_LIST.map(item => ({
                            value: item.code, label: item.engDesc
                        }))}
                        isDisabled={isNonEdit}
                        value={_.toString(changingInfo.isInternet)}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                        onChange={e => onChange({ isInternet: _.parseInt(e.value) })}
                    />
                </Grid>

                <Grid item xs={3}>
                    <Select
                        id={`${id}_isEHR`}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Is eHR<RequiredIcon /></>
                        }}
                        options={Enum.COMMON_YES_NO_LIST.map(item => ({
                            value: item.code, label: item.engDesc
                        }))}
                        isDisabled={isNonEdit}
                        value={_.toString(changingInfo.isEhr)}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                        onChange={e => onChange({ isEhr: _.parseInt(e.value) })}
                    />
                </Grid>

                <Grid item xs={3}></Grid>

                <Grid item xs={3}>
                    <DatePicker
                        id={`${id}_effStartDtm`}
                        inputVariant="outlined"
                        isRequired
                        clearable
                        absoluteMessage
                        disabled={isNonEdit || pageStatus === PAGE_STATUS.EDITING}
                        disablePast={pageStatus === PAGE_STATUS.ADDING}
                        label={<>Effective Start Date<RequiredIcon /></>}
                        value={changingInfo.efftDate}
                        onChange={e => onChange({ efftDate: e })}
                    />
                </Grid>

                <Grid item xs={3}>
                    <DatePicker
                        id={`${id}_effEndDtm`}
                        inputVariant="outlined"
                        clearable
                        absoluteMessage
                        disabled={isNonEdit}
                        disablePast={pageStatus === PAGE_STATUS.ADDING}
                        shouldDisableDate={shouldDisableDate}
                        shouldDisableDateMessage={CommonMessage.ENCTMAN_MINIMUM_DATE()}
                        label={<>Effective End Date</>}
                        value={changingInfo.expyDate}
                        onChange={e => onChange({ expyDate: e })}
                    />
                </Grid>

                <Grid item xs={3}>
                    <FormControlLabel
                        id={`${id}_isActive`}
                        label="Is Active"
                        disabled={isNonEdit}
                        control={
                            <CheckBox
                                checked={changingInfo.status === Enum.COMMON_STATUS_ACTIVE}
                                onChange={e => onChange({ status: e.target.checked ? Enum.COMMON_STATUS_ACTIVE : Enum.COMMON_STATUS_INACTIVE })}
                                color="primary"
                            />
                        }
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

const styles = theme => ({
    root: {
        width: '80%',
        paddingTop: 10
    },
    paddingGrid: {
        padding: '0px !important',
        '& > div': {
            padding: theme.spacing(3) / 2
        }
    }
});

const mapState = state => ({
    pageStatus: state.enctManagement.pageStatus,
    enctDetailGeneral: state.enctManagement.enctDetailGeneral,
    originalInfo: state.enctManagement.enctDetailGeneral.originalInfo,
    changingInfo: state.enctManagement.enctDetailGeneral.changingInfo,
    selectedList: state.enctManagement.enctDetailRoom.selectedList
});

const mapDispatch = {
    updateState,
    openCommonMessage
};

export default connect(mapState, mapDispatch)(withStyles(styles)(EnctGeneral));