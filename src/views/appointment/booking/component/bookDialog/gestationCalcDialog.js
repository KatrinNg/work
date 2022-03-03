import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import moment from 'moment';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { DateUtil, AppointmentUtil } from '../../../../../utilities';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import FastDatePicker from '../../../../../components/DatePicker/FastDatePicker';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import SimpleTable from '../../../../../components/Table/SimpleTable';
import { auditAction } from '../../../../../store/actions/als/logAction';
import { dispatch } from '../../../../../store/util';
import Enum from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import { openCommonCircular, closeCommonCircular } from '../../../../../store/actions/common/commonAction';

const DATE_MEANS = {
    LMP: 'LMP',
    EDC: 'EDC'
};

const getStyle = makeStyles(theme => ({
    gestInput: {
        width: 60
    },
    gestDate: {
        width: 180
    }
}));

function formatterData(gcform, setState, errorList, setErrorList) {
    const classes = getStyle();

    const updateField = (value, name) => {
        let obj = {
            [name]: value
        };
        setState(obj);
    };
    
    const handleOnChange = (value, name) =>{
        let obj = {
            [name]: value
        };
        if(name === 'gestWeekStart' || name === 'gestWeekEnd' || name === 'gestDayStart' || name === 'gestDayEnd') {
            if(value && value !== gcform[name]) {
                obj.gestStartDate = null;
                obj.gestEndDate = null;
            }
        } else if (name === 'gestStartDate' || name === 'gestEndDate') {
            if(name === 'gestStartDate') {
                if ((moment(value).isValid() && moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) !== moment(gcform[name]).format(Enum.DATE_FORMAT_EDMY_VALUE)) || 
                    (!moment(value).isValid() && moment(gcform.gestEndDate).isValid())) {
                    obj = {
                        ...obj,
                        gestWeekStart: '',
                        gestWeekEnd: '',
                        gestDayStart: '',
                        gestDayEnd: ''
                    };
                }
            } else if(name === 'gestEndDate') {
                if ((moment(value).isValid() && moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) !==moment(gcform[name]).format(Enum.DATE_FORMAT_EDMY_VALUE)) || 
                    (!moment(value).isValid() && moment(gcform.gestStartDate).isValid())) {
                    obj = {
                        ...obj,
                        gestWeekStart: '',
                        gestWeekEnd: '',
                        gestDayStart: '',
                        gestDayEnd: ''
                    };
                }
            }
        }
        setState(obj);
    };

    const updateDayField = (e) => {
        if(parseInt(e.target.value) > 7) {
            e.target.value = '';
        }
    };

    const getValidation = (name) => {
        let validators = [], errorMessages = [];

        //week date input must be positive integer with zero
        if(name === 'gestWeekStart' || name === 'gestWeekEnd' || name === 'gestDayStart' || name === 'gestDayEnd') {
            validators.push(ValidatorEnum.isPositiveIntegerWithZero);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITH_ZERO());
        }

        //gest date must greater than lmp date
        if (name === 'gestStartDate' || name === 'gestEndDate') {
            if(moment(gcform.lmpDate).isValid()) {
                validators.push(ValidatorEnum.minDate(gcform.lmpDate));
                errorMessages.push(CommonMessage.VALIDATION_NOTE_MIN_DATE(moment(gcform.lmpDate).format(Enum.DATE_FORMAT_EDMY_VALUE)));
            } else if(moment(gcform.edcDate).isValid()) {
                const lmpDate = AppointmentUtil.getLmpDateByEdc(gcform.edcDate);
                validators.push(ValidatorEnum.minDate(lmpDate));
                errorMessages.push(CommonMessage.VALIDATION_NOTE_MIN_DATE(moment(lmpDate).format(Enum.DATE_FORMAT_EDMY_VALUE)));
            }
        }

        //required all situation
        if(!gcform.gestWeekStart && !gcform.gestWeekEnd && !gcform.gestDayStart && !gcform.gestDayEnd && !gcform.gestStartDate && !gcform.gestEndDate) {
            validators.push(ValidatorEnum.required);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        } else {
            if (gcform.gestWeekStart || gcform.gestWeekEnd || gcform.gestDayStart || gcform.gestDayEnd) {
                if (name === 'gestWeekStart' || name === 'gestWeekEnd' || name === 'gestDayStart' || name === 'gestDayEnd') {
                    validators.push(ValidatorEnum.required);
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
                }
            } else {
                if (name === 'gestStartDate' || name === 'gestEndDate') {
                    validators.push(ValidatorEnum.required);
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
                }
            }

            //start gest is greater than end gest
            if (gcform.gestWeekStart && gcform.gestWeekEnd && gcform.gestDayStart && gcform.gestDayEnd) {
                if ((parseInt(gcform.gestWeekStart) * 7 + parseInt(gcform.gestDayStart)) > (parseInt(gcform.gestWeekEnd) * 7 + parseInt(gcform.gestDayEnd))) {
                    if (name === 'gestWeekEnd' || name === 'gestDayEnd') {
                        validators.push(ValidatorEnum.minNumber(100));
                        errorMessages.push(CommonMessage.VALIDATION_GEST_DIFF_ERROR());
                    }
                }
            }

            //gest start date is greater than gest end date
            if(moment(gcform.gestStartDate).isValid() && moment(gcform.gestEndDate).isValid()) {
                if (name === 'gestEndDate') {
                    validators.push(ValidatorEnum.minDate(gcform.gestStartDate));
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_MIN_DATE(moment(gcform.gestStartDate).format(Enum.DATE_FORMAT_EDMY_VALUE)));
                }
            }
        }
        return { validators, errorMessages };
    };

    const onValidator = (isValid, error, name) => {
        let _errorList = _.cloneDeep(errorList);
        if(!isValid) {
            const index = _errorList.findIndex(x => x.name === name);
            if (index === -1) {
                _errorList.push({ name: name, error: error });
            } else {
                _errorList[index].error = error;
            }
        } else {
            _errorList = _errorList.filter(x => x.name !== name);
        }
        setErrorList(_errorList);
    };

    const isEnableInput = moment(gcform.lmpDate).isValid() || moment(gcform.edcDate).isValid();

    const wkStartValidation = getValidation('gestWeekStart');
    const wkEndValidation = getValidation('gestWeekEnd');
    const dayStartValidation = getValidation('gestDayStart');
    const dayEndValidation = getValidation('gestDayEnd');
    const gestStartDateValidation = getValidation('gestStartDate');
    const gestEndDateValidation = getValidation('gestEndDate');

    let form = [
        {
            title: 'Gest Week(Wk-d):',
            content: _.toString(gcform.currentGestWeek) && _.toString(gcform.currentGestDay) ? `${gcform.currentGestWeek}-${gcform.currentGestDay}` : ''
        },
        {
            title: 'EDC:',
            content: gcform.gestEdc && moment(gcform.gestEdc).isValid() && DateUtil.getFormatDate(gcform.gestEdc)
        },
        {
            title:
                <Grid item container wrap="nowrap" alignItems="center" spacing={1}>
                    <Grid item className={classes.gestInput}>
                        <FastTextFieldValidator
                            id="gestationCalcDialog_start_week_input"
                            inputProps={{ maxLength: 2 }}
                            type="number"
                            value={gcform.gestWeekStart}
                            validators={wkStartValidation.validators}
                            errorMessages={wkStartValidation.errorMessages}
                            validatorListener={(isValid, message) => onValidator(isValid, message, 'Week Start')}
                            notShowMsg
                            disabled={!isEnableInput}
                            onBlur={e => updateField(e.target.value, 'gestWeekStart')}
                            onChange={e => handleOnChange(e.target.value, 'gestWeekStart')}
                        />
                    </Grid>
                    <Grid item>
                        <Typography>Week(s)</Typography>
                    </Grid>
                    <Grid item className={classes.gestInput}>
                        <FastTextFieldValidator
                            id="gestationCalcDialog_start_day_input"
                            inputProps={{ maxLength: 1 }}
                            type="number"
                            value={gcform.gestDayStart}
                            validators={dayStartValidation.validators}
                            errorMessages={dayStartValidation.errorMessages}
                            validatorListener={(isValid, message) => onValidator(isValid, message, 'Day Start')}
                            notShowMsg
                            disabled={!isEnableInput}
                            onBlur={e => updateField(e.target.value, 'gestDayStart')}
                            onChange={e => handleOnChange(e.target.value, 'gestDayStart')}
                        />
                    </Grid>
                    <Grid item>
                        <Typography>Day(s):</Typography>
                    </Grid>
                </Grid>,
            content:
                <Grid className={classes.gestDate}>
                    <FastDatePicker
                        id="getstationCalcDialog_gestStartDate"
                        value={gcform.gestStartDate}
                        component={DateFieldValidator}
                        notShowMsg
                        disabled={!isEnableInput}
                        validators={gestStartDateValidation.validators}
                        errorMessages={gestStartDateValidation.errorMessages}
                        validatorListener={(isValid, message) => onValidator(isValid, message, 'Gest Start Date')}
                        onAccept={e => handleOnChange(e, 'gestStartDate')}
                        onBlur={e => updateField(e, 'gestStartDate')}
                        onChange={e => handleOnChange(e, 'gestStartDate')}
                    />
                </Grid>
        },
        {
            title:
                <Grid container wrap="nowrap" alignItems="center" spacing={1}>
                    <Grid item className={classes.gestInput}>
                        <FastTextFieldValidator
                            id="gestationCalcDialog_end_week_input"
                            inputProps={{ maxLength: 2 }}
                            type="number"
                            value={gcform.gestWeekEnd}
                            validators={wkEndValidation.validators}
                            errorMessages={wkEndValidation.errorMessages}
                            validatorListener={(isValid, message) => onValidator(isValid, message, 'Week End')}
                            notShowMsg
                            disabled={!isEnableInput}
                            onBlur={e => updateField(e.target.value, 'gestWeekEnd')}
                            onChange={e => handleOnChange(e.target.value, 'gestWeekEnd')}
                        />
                    </Grid>
                    <Grid item>
                        <Typography>Week(s)</Typography>
                    </Grid>
                    <Grid item className={classes.gestInput}>
                        <FastTextFieldValidator
                            id="gestationCalcDialog_end_day_input"
                            inputProps={{ maxLength: 1 }}
                            type="number"
                            value={gcform.gestDayEnd}
                            validators={dayEndValidation.validators}
                            errorMessages={dayEndValidation.errorMessages}
                            validatorListener={(isValid, message) => onValidator(isValid, message, 'Day End')}
                            notShowMsg
                            disabled={!isEnableInput}
                            onBlur={e => updateField(e.target.value, 'gestDayEnd')}
                            onChange={e => handleOnChange(e.target.value, 'gestDayEnd')}
                        />
                    </Grid>
                    <Grid item>
                        <Typography>Day(s):</Typography>
                    </Grid>
                </Grid>,
            content:
                <Grid className={classes.gestDate}>
                    <FastDatePicker
                        id="getstationCalcDialog_gestEndDate"
                        value={gcform.gestEndDate}
                        component={DateFieldValidator}
                        notShowMsg
                        disabled={!isEnableInput}
                        validators={gestEndDateValidation.validators}
                        errorMessages={gestEndDateValidation.errorMessages}
                        validatorListener={(isValid, message) => onValidator(isValid, message, 'Gest End Date')}
                        onAccept={e => handleOnChange(e, 'gestEndDate')}
                        onBlur={e => updateField(e, 'gestEndDate')}
                        onChange={e => handleOnChange(e, 'gestEndDate')}
                    />
                </Grid>
        }
    ];

    if (errorList && errorList.length > 0) {
        form.push({
            title:
                <>
                    {errorList.map(x => (<FormHelperText error key={x.name}>{`${x.name}: ${x.error}`}</FormHelperText>))}
                </>,
            content: null
        });
    }
    return form;
}

const GestationCalcDialog = React.forwardRef((props, ref) => {
    const {
        classes,
        handleClose,
        handleConfirm
    } = props;

    const calcConfig = props.calcConfig || {};

    const [gcform, setGCForm] = React.useState({
        dateType: DATE_MEANS.LMP,
        lmpDate: null,
        edcDate: null,
        currentGestWeek: null,
        currentGestDay: null,
        gestEdc: null,
        gestStartDate: null,
        gestEndDate: null,
        gestWeekStart: calcConfig.wkStart || '0',
        gestDayStart: calcConfig.dayStart || '0',
        gestWeekEnd: calcConfig.wkEnd || '0',
        gestDayEnd: calcConfig.dayEnd || '0'
    });
    const [errorMessage, setErrorMessage] = React.useState([]);
    const formRef = React.useRef(null);

    const setState = (obj) => {
        setGCForm({ ...gcform, ...obj });
    };

    const getDefaultForm = () => {
        return {
            lmpDate: null,
            edcDate: null,
            currentGestWeek: null,
            currentGestDay: null,
            gestEdc: null,
            gestStartDate: null,
            gestEndDate: null,
            gestWeekStart: calcConfig.wkStart || '0',
            gestDayStart: calcConfig.dayStart || '0',
            gestWeekEnd: calcConfig.wkEnd || '0',
            gestDayEnd: calcConfig.dayEnd || '0'
        };
    };

    const handleCalculate = React.useCallback(() => {
        dispatch(auditAction('Calculate Gestation'));
        const valid = formRef && formRef.current && formRef.current.isFormValid(false);
        props.openCommonCircular();
        valid.then(result => {
            if(result) {
                let updateData = {};
                if (gcform.dateType === DATE_MEANS.LMP) {
                    const edcDate = AppointmentUtil.getEdcDateByLmp(gcform.lmpDate);
                    const gestEdc = edcDate;
                    const { currentGestWeek, currentGestDay } = AppointmentUtil.getGestWeekByLmp(gcform.lmpDate);
                    updateData = { edcDate, currentGestWeek, currentGestDay, gestEdc };
                    if (gcform.gestStartDate && gcform.gestEndDate) {
                        const startDate = AppointmentUtil.calcGestWeekByGestDateAndLmp(gcform.gestStartDate, gcform.lmpDate);
                        const endDate = AppointmentUtil.calcGestWeekByGestDateAndLmp(gcform.gestEndDate, gcform.lmpDate);
                        if(startDate) {
                            updateData = { ...updateData, gestWeekStart: startDate.week, gestDayStart: startDate.day };
                        }
                        if(endDate) {
                            updateData = { ...updateData, gestWeekEnd: endDate.week, gestDayEnd: endDate.day };
                        }
                    } else if (_.toString(gcform.gestWeekStart) && _.toString(gcform.gestDayStart) && _.toString(gcform.gestWeekEnd) && _.toString(gcform.gestDayEnd)) {
                        const gestStartDate = AppointmentUtil.getGestDateByLmp(gcform.lmpDate, gcform.gestWeekStart, gcform.gestDayStart);
                        const gestEndDate = AppointmentUtil.getGestDateByLmp(gcform.lmpDate, gcform.gestWeekEnd, gcform.gestDayEnd);
                        updateData = { ...updateData, gestStartDate, gestEndDate };
                    }
                } else if (gcform.dateType === DATE_MEANS.EDC) {
                    const lmpDate = AppointmentUtil.getLmpDateByEdc(gcform.edcDate);
                    const gestEdc = gcform.edcDate;
                    const { currentGestWeek, currentGestDay } = AppointmentUtil.getGestWeekByEdc(gcform.edcDate);
                    updateData = { lmpDate, currentGestWeek, currentGestDay, gestEdc };
                    if (gcform.gestStartDate && gcform.gestEndDate) {
                        const startDate = AppointmentUtil.calcGestWeekByGestDateAndLmp(gcform.gestStartDate, lmpDate);
                        const endDate = AppointmentUtil.calcGestWeekByGestDateAndLmp(gcform.gestEndDate, lmpDate);
                        if (startDate) {
                            updateData = { ...updateData, gestWeekStart: startDate.week, gestDayStart: startDate.day };
                        }
                        if (endDate) {
                            updateData = { ...updateData, gestWeekEnd: endDate.week, gestDayEnd: endDate.day };
                        }
                    } else if (_.toString(gcform.gestWeekStart) && _.toString(gcform.gestDayStart) && _.toString(gcform.gestWeekEnd) && _.toString(gcform.gestDayEnd)) {
                        const gestStartDate = AppointmentUtil.getGestDateByLmp(lmpDate, gcform.gestWeekStart, gcform.gestDayStart);
                        const gestEndDate = AppointmentUtil.getGestDateByLmp(lmpDate, gcform.gestWeekEnd, gcform.gestDayEnd);
                        updateData = { ...updateData, gestStartDate, gestEndDate };
                    }
                }
                setState(updateData);
            } else {
                formRef.current.focusFail();
            }
        }).then(() => {
            props.closeCommonCircular();
        });
    }, [gcform]);

    const data = formatterData(gcform, setState, errorMessage, setErrorMessage);

    return (
        <CIMSPromptDialog
            open
            id="gestationCalcDialog"
            dialogTitle="Gestation Calculator"
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <ValidatorForm
                    className={classes.form}
                    ref={formRef}
                >
                    <Grid container spacing={2}>
                        <Grid item container spacing={2}>
                            <Grid item container>
                                <Grid item>
                                    <FormControlLabel
                                        id={'gestationCalcDialog_lmp_radio'}
                                        checked={gcform.dateType === DATE_MEANS.LMP}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                const _default = getDefaultForm();
                                                setState({
                                                    ..._default,
                                                    dateType: DATE_MEANS.LMP
                                                });
                                            }
                                        }}
                                        control={<Radio />}
                                        label="LMP"
                                        labelPlacement="end"
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <DateFieldValidator
                                        id="gestationCalcDialog_lmpDate"
                                        disableFuture
                                        value={gcform.lmpDate}
                                        onChange={e => {
                                            const _default = getDefaultForm();
                                            setState({
                                                ..._default,
                                                lmpDate: e
                                            });
                                        }}
                                        isRequired={gcform.dateType === DATE_MEANS.LMP}
                                        disabled={gcform.dateType !== DATE_MEANS.LMP}
                                        absoluteMessage
                                        placeholder=""
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container>
                                <Grid item>
                                    <FormControlLabel
                                        id={'gestationCalcDialog_edc_radio'}
                                        checked={gcform.dateType === DATE_MEANS.EDC}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                const _default = getDefaultForm();
                                                setState({
                                                    ..._default,
                                                    dateType: DATE_MEANS.EDC
                                                });
                                            }
                                        }}
                                        control={<Radio />}
                                        label="EDC"
                                        labelPlacement="end"
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <DateFieldValidator
                                        id="gestationCalcDialog_edcDate"
                                        disablePast
                                        value={gcform.edcDate}
                                        onChange={e => {
                                            const _default = getDefaultForm();
                                            setState({
                                                ..._default,
                                                edcDate: e
                                            });
                                        }}
                                        isRequired={gcform.dateType === DATE_MEANS.EDC}
                                        disabled={gcform.dateType !== DATE_MEANS.EDC}
                                        absoluteMessage
                                        placeholder=""
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item container><Divider className={classes.divider} /></Grid>
                        <Grid item container>
                            <SimpleTable
                                id="gestationCalcDialog_gestInfo"
                                rows={data}
                                columns={[{ name: 'title' }, { name: 'content' }]}
                                hiddenHead
                                classes={{
                                    table: classes.table,
                                    bodyRow: classes.bodyRow,
                                    bodyRowCell: classes.bodyRowCell
                                }}
                            />
                        </Grid>
                    </Grid>
                </ValidatorForm>
            }
            buttonConfig={[
                {
                    id: 'gestationCalcDialog_calculateBtn',
                    name: 'Calculate',
                    onClick: handleCalculate
                },
                {
                    id: 'gestationCalcDialog_okBtn',
                    name: 'OK',
                    onClick: () => {
                        dispatch(auditAction('Confirm Gestation Date'));
                        handleConfirm(gcform);
                    }
                },
                {
                    id: 'gestationCalcDialog_closeBtn',
                    name: 'Close',
                    onClick: () => {
                        dispatch(auditAction('Close Gestation Calculator Dialog'));
                        handleClose(gcform);
                    }
                }
            ]}
        />
    );
});


const styles = theme =>({
    form: {
        width: '100%'
    },
    dialogPaper: {
        width: '42%'
    },
    table: {
        width: 'auto'
    },
    bodyRow: {
        height: theme.spacing(6)
    },
    bodyRowCell: {
        borderColor: '#00000000',
        borderBottom: '#00000000',
        ...theme.typography.body1
    },
    divider: {
        marginTop: theme.spacing(2),
        width: '100%',
        backgroundColor: theme.palette.grey[500]
    }
});

const mapState = () => ({});
const mapDispatch = {
    openCommonCircular,
    closeCommonCircular
};

export default connect(mapState, mapDispatch)(withStyles(styles)(GestationCalcDialog));