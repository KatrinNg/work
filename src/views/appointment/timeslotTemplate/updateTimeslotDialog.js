import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogContent,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Grid,
    TextField,
    FormHelperText,
    Typography,
    FormControl
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSLoadingButton from '../../../components/Buttons/CIMSLoadingButton';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import {
    updateField,
    saveTemplate,
    updateTemplate
} from '../../../store/actions/appointment/timeslotTemplate/timeslotTemplateAction';
import { StatusEnum } from '../../../enums/appointment/timeslot/timeslotTemplateEnum';
import moment from 'moment';
import MaskedInput from 'react-text-mask';
import PropTypes from 'prop-types';
import CommonRegex from '../../../constants/commonRegex';
import * as messageUtilities from '../../../utilities/messageUtilities';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import NewOldQuotaPublic from '../../compontent/newOldQuotaPublic';
import * as AppointmentUtil from '../../../utilities/appointmentUtilities';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

const style = theme => ({
    paper: {
        // minWidth: 300,
        // maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    paperScrollPaper: {
        display: 'flex',
        maxHeight: 'calc(100% - 20px)',
        flexDirection: 'column'
    },
    comFullWidth: {
        width: '100%'
    },
    comNewWidth: {
        width: '70%'
    },
    selectSpacing: {
        marginBottom: 10,
        marginTop: 5
    },
    textSpacing: {
        margin: '5px 0px'
    },
    newEncounterWidth: {
        width: '50%'
    },
    textQuota: {
        width: '90%'
    },
    formControlCss: {
        backgroundColor: theme.palette.dialogBackground,
        padding: '10px 10px 10px 10px'
    },
    dialogTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    }
});

function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={ref => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[/[0-2]/, /\d/, ':', /[0-6]/, /\d/]}
            placeholderChar={'\u2000'}
            showMask
        />
    );
}

TextMaskCustom.propTypes = {
    inputRef: PropTypes.func.isRequired
};

class UpdateTimeslotDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            weekdayErrorMessage: '',
            defaultQuotaDescValue: null
        };
        this.handleChange = this.handleChange.bind();
        this.handleSelectChange = this.handleSelectChange.bind();
        this.handleCbWeekChange = this.handleCbWeekChange.bind();
        this.handleSave = this.handleSave.bind();
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }
    UNSAFE_componentWillMount() {
        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        // const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where);

        // const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;
        // let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        let newQuotaArr=this.loadQuotaType(where);

        this.setState({ defaultQuotaDescValue: newQuotaArr });
    }

    componentDidMount = () => {
        this.msg110211 = messageUtilities.getMessageDescriptionByMsgCode('110931');
    }

    loadQuotaType=(where)=>{
        let newQuotaArr = AppointmentUtil.loadQuotaType(where, this.props.clinicConfig);
        return newQuotaArr;
    }
    handleSlotProfileCodeBlur = (e) => {
        let name = e.target.name;
        let value = e.target.value.toUpperCase();
        this.props.updateField(name, value, null);
    }
    handleChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        let reg = '';

        if (name !== 'description') {
            reg = new RegExp(CommonRegex.VALIDATION_REGEX_NOT_NUMBER);
        }

        if (reg !== '' && reg.test(value)) {
            return;
        }


        this.props.updateField(name, value, null);
    }
    handleCodeChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        let inputProps = this.refs.code.props.inputProps;

        if (reg.test(value)) {
            return;
        }

        if (inputProps.maxLength && value.length > inputProps.maxLength) {
            value = value.slice(0, inputProps.maxLength);
        }

        this.props.updateField(name, value, null);
    }

    handleQuotaBlur = (e, newValue) => {
        let name = e.target.name;
        let value = e.target.value;
        if (!value || value === '') {
            this.props.updateField(name, newValue, null);
        }
    }
    handleSelectChange = (e, name) => {
        let value = e.value;
        this.props.updateField(name, value, null);
    }
    handleTimeChange = (event, name) => {
        let valArr = event.target.value.split(':');
        let hour = valArr[0];
        let min = valArr[1];
        if (parseInt(hour) && parseInt(hour) > 23) {
            hour = 23;
        }
        if (parseInt(min) && parseInt(min) > 59) {
            min = 59;
        }
        this.props.updateField(name, `${hour}:${min}`, null);
    }
    handleTimeOnBlur = (event, name) => {
        let valArr = event.target.value.split(':');
        let hour = valArr[0];
        let min = valArr[1];
        let val = event.target.value;
        if (isNaN(parseInt(hour)) || isNaN(parseInt(min))) {
            val = moment().format('HH:mm');
        } else {
            if (min.trim().length === 1) {
                val = `${hour}:${'0' + min}`;
            }
        }
        this.props.updateField(name, val, null);
    }
    handleCbWeekChange = (e, checked) => {
        let value;
        let name = e.target.name;
        if (checked) {
            value = 1 + '';
            this.setState({ weekdayErrorMessage: '' });
        } else {
            value = 0 + '';
        }
        this.props.updateField('week', value, name);
    }
    handleSave = () => {
        if (!this.validateWeekday())
            return;
        let { overallQuota, startTime } = this.props;
        let params = {
            description: this.props.description,
            encounterTypeCd: this.props.encounterTypeCd,
            overallQuota: overallQuota,
            slotProfileCode: this.props.slotProfileCode,
            slotTemplateId: this.props.slotTemplateId,
            startTime: startTime,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            version: this.props.version,
            week: this.props.week
        };
        this.state.defaultQuotaDescValue.forEach((item) => {
            params['new' + item.engDesc] = this.props['new' + item.engDesc];
            params['old' + item.engDesc] = this.props['old' + item.engDesc];
        });
        if (this.props.status === StatusEnum.NEW) {
            this.props.saveTemplate(params);
        } else if (this.props.status === StatusEnum.EDIT) {
            this.props.updateTemplate(params);
        }
    }
    handleFormError = (error) => {
        console.log('form error', error);
    }
    handleWeekdayBlur = () => {
        this.validateWeekday();
    }
    validateWeekday = () => {
        if (this.props.week === '0000000') {
            this.setState({ weekdayErrorMessage: this.msg110211 });
            return false;
        } else {
            this.setState({ weekdayErrorMessage: '' });
            return true;
        }
    }
    handleSubmit = () => {
        this.validateWeekday();
        this.refs.updateForm.submit();
    }
    render() {
        const { classes, fieldsValidator, fieldsErrorMessage, week, quotaOption } = this.props;
        // const { quotaOption } = this.state;
        // quotaOption = { ...this.props };
        let sunVal = week.substring(0, 1),
            monVal = week.substring(1, 2),
            tueVal = week.substring(2, 3),
            wedVal = week.substring(3, 4),
            thurVal = week.substring(4, 5),
            friVal = week.substring(5, 6),
            satVal = week.substring(6, 7);
        let filterEnCounterCodeList = this.props.enCounterCodeList.find(item => item.encounterTypeCd === this.props.encounterTypeCd);
        const subEnCounterList = filterEnCounterCodeList ? filterEnCounterCodeList.subEncounterTypeList : [];
        return (
            <Dialog
                classes={{
                    paper: classes.paper,
                    paperScrollPaper: classes.paperScrollPaper
                }}
                style={this.props.dialogStyle}
                open={this.props.open}
                aria-labelledby="form-dialog-title"
                maxWidth={'md'}
                fullWidth
                // PaperProps={{
                //     style: {
                //         backgroundColor: '#CCC'
                //     }
                // }}
                id={'updateDialog'}
            >
                <FormControl className={classes.formControlCss}>
                    <Typography variant="subtitle2" className={classes.dialogTitle} id={'form-dialog-title'}>{this.props.title}</Typography>
                    <DialogContent style={{ border: '1px solid #999', backgroundColor: '#ffffff' }}>
                        <ValidatorForm ref={'updateForm'} onSubmit={this.handleSave}
                            onError={this.handleFormError}
                            style={{ backgroundColor: '#ffffff', width: '100%', paddingTop: 10 }}
                        >
                            <Grid container spacing={2}>
                                <Grid container item>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            isRequired
                                            name={'timeslot_Template_Update_EncounterType'}
                                            options={this.props.enCounterCodeList &&
                                                this.props.enCounterCodeList.map((item) => (
                                                    { value: item.encounterTypeCd, label: item.encounterTypeCd }
                                                ))}
                                            value={this.props.encounterTypeCd}
                                            onChange={(...arg) => this.handleSelectChange(...arg, 'encounterTypeCd')}
                                            labelText={'Encounter'}
                                            id={'encounterType'}
                                            validators={fieldsValidator.encounterType}
                                            errorMessages={fieldsErrorMessage.encounterType}
                                            className={`${classes.comFullWidth} ${classes.selectSpacing}`}
                                        />
                                    </Grid>
                                    <Grid item xs={8} style={{ paddingLeft: 16 }}>
                                        <SelectFieldValidator
                                            isRequired
                                            options={subEnCounterList &&
                                                subEnCounterList.map((item) => (
                                                    { value: item.subEncounterTypeCd, label: item.subEncounterTypeCd }
                                                ))}
                                            labelText={'Sub-encounter'}
                                            id={'timeslot_Template_Update_SubEncounterType'}
                                            onChange={(...arg) => this.handleSelectChange(...arg, 'subEncounterTypeCd')}
                                            value={this.props.subEncounterTypeCd}
                                            validators={fieldsValidator.subEncounterType}
                                            errorMessages={fieldsErrorMessage.subEncounterType}
                                            className={`${classes.newEncounterWidth} ${classes.selectSpacing}`}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container item>
                                    <Grid item xs={4}>
                                        <TextFieldValidator
                                            //isRequired
                                            id={'slotProfileCode'}
                                            labelText={'Code'}
                                            value={this.props.slotProfileCode}
                                            name={'slotProfileCode'}
                                            inputProps={{
                                                maxLength: 6
                                            }}
                                            ref={'code'}
                                            onChange={this.handleCodeChange}
                                            onBlur={this.handleSlotProfileCodeBlur}
                                            className={`${classes.comFullWidth} ${classes.textSpacing}`}
                                            validators={fieldsValidator.slotProfileCode}
                                            errorMessages={fieldsErrorMessage.slotProfileCode}
                                            validByBlur
                                        />
                                    </Grid>
                                    <Grid item xs={8} style={{ paddingLeft: 16 }}>
                                        <TextFieldValidator
                                            inputProps={{
                                                maxLength: 130
                                            }}
                                            name={'description'}
                                            id={'description'}
                                            onChange={this.handleChange}
                                            labelText={'Description'}
                                            value={this.props.description || ''}
                                            className={`${classes.comFullWidth} ${classes.textSpacing}`}
                                        //className={`${classes.newEncounterWidth} ${classes.selectSpacing}`}
                                        // validators={fieldsValidator.description}
                                        // errorMessages={fieldsErrorMessage.description}
                                        />
                                    </Grid>
                                </Grid>


                                <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
                                    <Grid item container xs={12} alignItems="baseline">
                                        <Grid item><Typography>Weekday<RequiredIcon /></Typography></Grid>
                                        <Grid item><FormHelperText error style={{ paddingLeft: 5 }}>{this.state.weekdayErrorMessage}</FormHelperText></Grid>
                                    </Grid>
                                    <FormGroup row style={{ clear: 'both' }} onBlur={this.handleWeekdayBlur} id={'checkBoxGroup'}>
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'sun'} id={'sun'} />}
                                            label={'Sun'}
                                            checked={sunVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'sunLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'mon'} id={'mon'} />}
                                            label={'Mon'}
                                            checked={monVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'monLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'tue'} id={'tue'} />}
                                            label={'Tue'}
                                            checked={tueVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'tueLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'wed'} id={'wed'} />}
                                            label={'Wed'}
                                            checked={wedVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'wedLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'thur'} id={'thur'} />}
                                            label={'Thur'}
                                            checked={thurVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'thurLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'fri'} id={'fri'} />}
                                            label={'Fri'}
                                            checked={friVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'friLabel'}
                                        />
                                        <FormControlLabel
                                            control={<CIMSCheckBox value={'1'} name={'sat'} id={'sat'} />}
                                            label={'Sat'}
                                            checked={satVal == 1}// eslint-disable-line
                                            onChange={this.handleCbWeekChange}
                                            id={'satLabel'}
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item container xs={4} direction="column" justify="space-between">
                                    <Grid item container>
                                        <CIMSInputLabel className={'titleFront'}>Time Block<RequiredIcon /></CIMSInputLabel>
                                        <TextField
                                            fullWidth
                                            variant={'outlined'}
                                            value={this.props.startTime}
                                            onChange={e => this.handleTimeChange(e, 'startTime')}
                                            onBlur={e => this.handleTimeOnBlur(e, 'startTime')}
                                            id={'startTime'}
                                            InputProps={{
                                                inputComponent: TextMaskCustom
                                            }}
                                            className={classes.textSpacing}
                                        //className={`${classes.comNewWidth} ${classes.textSpacing}`}
                                        />
                                    </Grid>
                                    <Grid item container>
                                        <TextFieldValidator
                                            isRequired
                                            id={'overallQuota'}
                                            value={this.props.overallQuota}
                                            labelText={'Overall Quota'}
                                            onChange={this.handleChange}
                                            inputProps={{
                                                maxLength: 4
                                            }}
                                            onBlur={(...arg) => this.handleQuotaBlur(...arg, 9999)}
                                            name={'overallQuota'}
                                            className={`${classes.comFullWidth} ${classes.textSpacing}`}
                                            //className={`${classes.comNewWidth} ${classes.textSpacing}`}
                                            validators={fieldsValidator.overallQuota}
                                            errorMessages={fieldsErrorMessage.overallQuota}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={1}></Grid>
                                <Grid item xs={6} container alignContent={'center'} className={classes.textSpacing}>
                                    <NewOldQuotaPublic
                                        id={'newOldQuota'}
                                        validators={fieldsValidator.newOldQuota}
                                        errorMessages={fieldsErrorMessage.newOldQuota}
                                        quotaOption={quotaOption}
                                        onChange={this.handleChange}
                                        encounterTypeCd={this.props.encounterTypeCd}
                                        subEncounterTypeCd={this.props.subEncounterTypeCd}
                                        blur={(...arg) => this.handleQuotaBlur(...arg, 0)}
                                        loadQuotaType={this.loadQuotaType}
                                    />
                                </Grid>
                                <Grid item xs={1}></Grid>
                            </Grid>
                            <DialogActions>
                                <CIMSLoadingButton
                                    id={'timeslot_Template_btn_saveUpdateDialog'}
                                    onClick={this.handleSubmit}
                                >Save</CIMSLoadingButton>
                                <CIMSButton
                                    id={'timeslot_Template_btn_closeUpdateDialog'}
                                    onClick={this.props.handleClose}
                                >Close</CIMSButton>
                            </DialogActions>
                        </ValidatorForm>
                    </DialogContent>
                </FormControl>
            </Dialog>
        );
    }
}
function mapStateToProps(state) {
    return {
        status: state.timeslotTemplate.status,
        enCounterCodeList: state.timeslotTemplate.enCounterCodeList,
        //subEnCounterCodeList: state.timeslotTemplate.subEnCounterCodeList,
        searchDTO: state.timeslotTemplate.searchDTO,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        ...state.timeslotTemplate.timeslotTemplateDTO,
        quotaOption: { ...state.timeslotTemplate.timeslotTemplateDTO }
    };
}
const dispatchProps = {
    updateField,
    saveTemplate,
    updateTemplate
};
export default connect(mapStateToProps, dispatchProps)(withStyles(style)(UpdateTimeslotDialog));