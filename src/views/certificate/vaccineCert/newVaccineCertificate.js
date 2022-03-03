import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, FormControl } from '@material-ui/core';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import CommonMessage from '../../../constants/commonMessage';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import moment from 'moment';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import Enum from '../../../enums/enum';
import AttnDate from '../component/attnDate';

const styles = () => ({
    root: {
        width: '95%'
    },
    grid: {
        paddingTop: 4,
        paddingBottom: 4,
        //padding: 20,
        justifyContent: 'center'
    },
    form_input: {
        width: '100%'
    }
});

const maxCharacterLength = 18;

const textSize = (text) => {
    let span = document.createElement('span');
    let result = {};
    result.width = span.getBoundingClientRect().width;
    result.height = span.getBoundingClientRect().height;
    span.style.visibility = 'hidden';
    document.body.appendChild(span);
    if (typeof span.textContent != 'undefined')
        span.textContent = text;
    else span.innerText = text;
    result.width = span.getBoundingClientRect().width - result.width;
    result.height = span.getBoundingClientRect().height - result.height;
    span.parentNode.removeChild(span);
    return result;
};



const getWordBreakText = (textWidth, text) => {
    if (text) {
        let textList = text.split('\n');
        for (let i = 0; i < textList.length; i++) {
            let str = _.clone(textList[i]);
            if (textSize(str).width > textWidth) {
                let strList = [];
                do {
                    for (let j = 10; j < str.length; j++) {
                        const curStr = str.substr(0, j);
                        let strWidth = textSize(curStr).width;
                        if (strWidth > textWidth) {
                            let lastStr = str.substr(0, j - 1);
                            strList.push(lastStr);
                            str = str.substr(j - 1);
                            break;
                        }
                        if (j === str.length - 1) {
                            strList.push(str);
                            str = '';
                        }
                    }
                } while (str.length >= 10);
                textList[i] = strList.join('\n');
            }
        }
        return textList.join('\n');
    } else {
        return text;
    }
};

class NewVaccineCertificate extends Component {
    constructor(props) {
        super(props);

        this.textSizeWidth = maxCharacterLength * textSize('W').width;

    }

    componentDidUpdate(preProps) {
        if ((preProps.vaccineType !== this.props.vaccineType) && this.props.vaccineType === 'OTHER') {
            if (this.vaccineNameRef) {
                this.vaccineNameRef.focus();
            }
        }
    }

    handleUpdate = (value, name) => {
        if (name === 'vaccineType') {
            if (value === 'PO') {
                this.props.handleOnChange(value, name);
                let newValidDate = moment(this.props.issueDate);
                this.props.handleOnChange(newValidDate, 'validDate');
                this.props.handleOnChange('', 'vaccineName');
            } else if (value === 'YF') {
                this.props.handleOnChange(value, name);
                let newValidDate = moment(this.props.issueDate).add('days', 10);
                this.props.handleOnChange(newValidDate, 'validDate');
                this.props.handleOnChange('', 'vaccineName');
            } else {
                if (this.props.vaccineType === 'OTHER') {
                    this.vaccineNameRef.focus();
                }
                this.props.handleOnChange(null, 'validDate');
                this.props.handleOnChange(value, name);
            }
        } else {
            this.props.handleOnChange(value, name);
        }
    }

    handleDateAccept = (date, name) => {
        if (date && moment(date).isValid()) {
            const { validDate, issueDate } = this.props;
            if (name === 'issueDate' && moment(validDate).isValid() && moment(date).isAfter(moment(validDate))) {
                this.props.handleOnChange(date, 'validDate');
            } else if (name === 'validDate' && moment(issueDate).isValid() && moment(date).isBefore(moment(issueDate))) {
                this.props.handleOnChange(date, 'issueDate');
            }
            this.props.handleOnChange(date, name);
        }
    }

    render() {
        const {
            classes,
            nationalityList,
            name,
            nationality,
            otherDocNo,
            issueDate,
            doctorName,
            doctorPost,
            manufacturer,
            batchNo,
            validDate,
            certNo,
            isSelected,
            vaccineType,
            vaccineName
        } = this.props;


        const isThsService = (this.props.service && this.props.service.serviceCd) === 'THS';
        return (
            <Grid item container className={classes.root} spacing={4}>
                <Grid item container><AttnDate id="vaccineCert" /></Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Cert No:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_Cert No`}
                                disabled={isSelected}
                                value={certNo}
                                onBlur={e => this.handleUpdate(e.target.value, 'certNo')}
                                inputProps={{ maxLength: 30 }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={isThsService ? 3 : 6} className={classes.grid}>
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Vaccine Type:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <SelectFieldValidator
                                id={`${this.props.id}_vaccineTypeSelectField`}
                                options={
                                    isThsService ?
                                        [
                                            ...Enum.VACCINE_TYPE.map((item) => (
                                                { value: item.code, label: item.label })), { value: 'OTHER', label: 'Others' }] :
                                        Enum.VACCINE_TYPE.map((item) => (
                                            { value: item.code, label: item.label }))
                                }
                                value={vaccineType}
                                isDisabled={isSelected}
                                onChange={e => this.handleUpdate(e.value, 'vaccineType')}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                TextFieldProps={{
                                    variant: 'outlined'
                                }}
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                {/* <Grid item container xs={6} className={classes.grid} > */}
                {isThsService && vaccineType === 'OTHER' ? <Grid item container xs={3} className={classes.grid}>
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Vaccine Name:{vaccineType === 'OTHER' ? <RequiredIcon /> : ''}</CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_vaccineName`}
                                value={vaccineName}
                                inputRef={ref => this.vaccineNameRef = ref}
                                onBlur={e => this.handleUpdate(e.target.value, 'vaccineName')}
                                disabled={isSelected}
                                inputProps={{ maxLength: 100 }}
                                validators={vaccineType !== 'OTHER' ? [] : [ValidatorEnum.required]}
                                errorMessages={vaccineType !== 'OTHER' ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid> : null}
                {/* </Grid> */}
                <Grid item container xs={6} className={classes.grid}>
                    <FormControl className={classes.form_input}>
                        <Grid item><CIMSInputLabel>Name:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item>
                            <FastTextFieldValidator
                                id={`${this.props.id}_name`}
                                multiline
                                trim="none"
                                rows="4"
                                value={name}
                                onBlur={e => {
                                    const str = getWordBreakText(this.textSizeWidth, e.target.value);
                                    this.handleUpdate(str, 'name');
                                }}
                                onChange={e => {
                                    while (this.nameRef.scrollHeight - this.nameRef.clientHeight > 0) {
                                        let _val = _.clone(e.target.value);
                                        e.target.value = _val.substr(0, _val.length - 1);
                                    }
                                }}
                                disabled={isSelected}
                                inputProps={{
                                    ref: (ref) => { this.nameRef = ref; },
                                    maxLength: 500,
                                    style: {
                                        overflow: 'hidden',
                                        height: 85,
                                        width: this.textSizeWidth
                                    }
                                }}
                                validators={[
                                    ValidatorEnum.required
                                ]}
                                errorMessages={[
                                    CommonMessage.VALIDATION_NOTE_REQUIRED()
                                ]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>

                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid}>
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Nationality:{isThsService ? null : <RequiredIcon />}</CIMSInputLabel></Grid>
                        <Grid item >
                            <SelectFieldValidator
                                id={`${this.props.id}_nationalitySelectField`}
                                options={nationalityList.map((item) => (
                                    { value: item, label: item }))
                                }
                                value={nationality}
                                isDisabled={isSelected}
                                onChange={e => this.handleUpdate(e.value, 'nationality')}
                                validators={isThsService ? [] : [ValidatorEnum.required]}
                                errorMessages={isThsService ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                TextFieldProps={{
                                    variant: 'outlined'
                                }}
                                addNullOption={isThsService ? true : false}
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Doctor's Name:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_doctorName`}
                                value={doctorName}
                                onBlur={e => this.handleUpdate(e.target.value, 'doctorName')}
                                onlyOneSpace
                                upperCase
                                disabled={isSelected}
                                inputProps={{ maxLength: 40 }}
                                validators={[
                                    ValidatorEnum.required,
                                    ValidatorEnum.isSpecialEnglish
                                ]}
                                errorMessages={[
                                    CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                    CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                                ]}
                                warning={[
                                    ValidatorEnum.isEnglishWarningChar
                                ]}
                                warningMessages={[
                                    CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                                ]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Doctor's Post:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_doctorPost`}
                                disabled={isSelected}
                                value={doctorPost}
                                onBlur={e => this.handleUpdate(e.target.value, 'doctorPost')}
                                inputProps={{ maxLength: 60 }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Manufacturer:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_manufacturer`}
                                disabled={isSelected}
                                value={manufacturer}
                                onBlur={e => this.handleUpdate(e.target.value, 'manufacturer')}
                                inputProps={{ maxLength: 45 }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Batch No:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_batchNo`}
                                disabled={isSelected}
                                value={batchNo}
                                onBlur={e => this.handleUpdate(e.target.value, 'batchNo')}
                                inputProps={{ maxLength: 40 }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Issue Date:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <DateFieldValidator
                                id={`${this.props.id}_issueDate`}
                                isRequired
                                validByBlur
                                disabled={isSelected}
                                value={issueDate}
                                onChange={(date) => { this.handleUpdate(date, 'issueDate'); }}
                                onBlur={date => { this.handleDateAccept(date, 'issueDate'); }}
                                onAccept={date => { this.handleDateAccept(date, 'issueDate'); }}
                                inputVariant={'outlined'}
                            />
                        </Grid>
                    </FormControl>

                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Valid Date Of Certificate:<RequiredIcon /></CIMSInputLabel></Grid>
                        <Grid item >
                            <DateFieldValidator
                                id={`${this.props.id}_validDate`}
                                isRequired
                                validByBlur
                                disabled={isSelected}
                                value={validDate}
                                onChange={(date) => { this.handleUpdate(date, 'validDate'); }}
                                onBlur={date => { this.handleDateAccept(date, 'validDate'); }}
                                onAccept={date => { this.handleDateAccept(date, 'validDate'); }}
                                inputVariant={'outlined'}
                            />
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item container xs={6} className={classes.grid} >
                    <FormControl className={classes.form_input}>
                        <Grid item ><CIMSInputLabel>Other Doc. Number:</CIMSInputLabel></Grid>
                        <Grid item >
                            <FastTextFieldValidator
                                id={`${this.props.id}_otherDocumentNo`}
                                value={otherDocNo}
                                onBlur={e => this.handleUpdate(e.target.value, 'otherDocNo')}
                                inputProps={{ maxLength: 20 }}
                                disabled={isSelected}
                                variant={'outlined'}
                                calActualLength
                            />
                        </Grid>
                    </FormControl>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        nationalityList: state.patient.nationalityList || [],
        service: state.login.service
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewVaccineCertificate));