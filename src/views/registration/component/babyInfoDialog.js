import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import _ from 'lodash';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import { CommonUtil, RegistrationUtil } from '../../../utilities';
import RegFieldName from '../../../enums/registration/regFieldName';
// import BabyInfoChCodeField from './babyInfoChCodeField';
import RegChCodeField from './regChCodeField';
import {
    getBabyInfo
} from '../../../store/actions/registration/registrationAction';
import RegDateBirthField from './regDateBirthField';
import OutlinedRadioValidator from '../../../components/FormValidator/OutlinedRadioValidator';
import moment from 'moment';
import Enum from '../../../enums/enum';

const styles = theme => ({
    babyForm: {
        width: 1200,
        paddingTop: 20,
        overflow:'hidden'
    },
    title: {
        fontWeight: 'bold',
        color: theme.palette.primary.main
    },
    radioGroup: {
        height: theme.palette.unit * 39
    }
});

class BabyInfoDialog extends Component {

    state = {
        babyInfo: _.cloneDeep(this.props.babyInfo),
        ccCodeChiChar: []
    }

    handleClose = () => {
        this.props.handleCloseDialog();
    }

    handleSubmit = () => {
        this.refs.form.submit();
    }

    handleOnChange = (value, name) => {
        let babyInfo = _.cloneDeep(this.state.babyInfo);
        if (name === 'dob') {
            if (value) {
                babyInfo[name] = moment(value, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
            } else {
                babyInfo[name] = value;
            }
        } else {
            babyInfo[name] = value;
        }
        this.setState({ babyInfo: babyInfo });
    }

    handleSave = () => {
        let { babyInfo } = this.state;
        let params = {
            birthOrder: babyInfo.birthOrder,
            dob: babyInfo.dob,
            docNo: babyInfo.docNo,
            engGivename: babyInfo.engGivename,
            engSurname: babyInfo.engSurname,
            genderCd: babyInfo.genderCd,
            motherEpisodeNumOfBirth: babyInfo.motherEpisodeNumOfBirth,
            nameChi: babyInfo.nameChi
        };
        this.props.getBabyInfo(params, (data) => {
            this.props.handleSave({ ...data, exactDobCd: babyInfo.exactDobCd }, this.state.ccCodeChiChar);
            this.props.handleCloseDialog();
        });
    }

    resetChineseNameFieldValid = () => {
        if (this.chineseNameField) {
            this.chineseNameField.makeValid();
        }
    }

    chineseNameOnChange = (e) => {
        let babyInfo = _.cloneDeep(this.state.babyInfo);
        if (babyInfo.nameChi === e.target.value) {
            return;
        }
        babyInfo.nameChi = e.target.value;
        for (let i = 5; i >= 0; i--) {
            let name = 'ccCode' + (i + 1);
            babyInfo[name] = '';
        }
        this.setState({ babyInfo: babyInfo, ccCodeChiChar: [] });
    }

    extDobOnChange = (dobData) => {
        let babyInfo = _.cloneDeep(this.state.babyInfo);
        for (let field in dobData) {
            babyInfo[field] = dobData[field];
        }
        this.setState({ babyInfo: babyInfo });
    }

    updateChiChar = (charIndex, char, ccCodeList) => {
        let { patientInfo, ccCodeChiChar } = RegistrationUtil.setChCode(ccCodeList, this.state.babyInfo, this.state.ccCodeChiChar);
        let updateData = RegistrationUtil.setChChineseName(patientInfo, ccCodeChiChar, charIndex, char);
        this.setState({
            babyInfo: updateData.patientInfo,
            ccCodeChiChar: updateData.ccCodeChiChar
        });
    }

    getBabyInfoValidator = (name) => {
        let validators = [];
        let errorMessages = [];
        const { babyInfo } = this.state;
        //const reg='^(10|[1-9])$';
        const numOfBirthIsValidate = babyInfo.motherEpisodeNumOfBirth && _.parseInt(babyInfo.motherEpisodeNumOfBirth) <= 10&&_.parseInt(babyInfo.motherEpisodeNumOfBirth)>0;
        const birthOrderIsValid = babyInfo.birthOrder && _.parseInt(babyInfo.birthOrder) <= 10&&_.parseInt(babyInfo.birthOrder)>0;
        validators.push(ValidatorEnum.required);
        validators.push(ValidatorEnum.number1To10);
        //validators.push(ValidatorEnum.minNumber(1));
        errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        errorMessages.push(CommonMessage.VALIDATION_NUMBER_1_TO_10());
        if (name === 'order') {
            if (numOfBirthIsValidate) {
                if (birthOrderIsValid) {
                    validators.push(ValidatorEnum.maxNumber(babyInfo.motherEpisodeNumOfBirth));
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_BABYINFO_BIRTHORDER());
                }
            }
            return { validators, errorMessages };
        }
        if (name === 'total') {
            if (birthOrderIsValid) {
                if (numOfBirthIsValidate) {
                    validators.push(ValidatorEnum.minNumber(babyInfo.birthOrder));
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_BABYINFO_MOTHEREPISODENUMOFBIRTH());
                }
            }
            return { validators, errorMessages };
        }
    }

    render() {
        const { classes, id, openBabyInfoDialog, registerCodeList } = this.props;
        const { babyInfo } = this.state;
        const orderValidation=this.getBabyInfoValidator('order');
        const totalValidation=this.getBabyInfoValidator('total');
        return (
            <CIMSPromptDialog
                id={id}
                dialogTitle={'Baby Information Calculator'}
                open={openBabyInfoDialog}
                dialogContentText={
                    <ValidatorForm
                        ref="form"
                        onSubmit={this.handleSave}
                        className={classes.babyForm}
                    >
                        <Grid container spacing={2} >
                            <Grid item xs={12} className={classes.title}>{'Mother\'s Infomation:'}</Grid>
                            <Grid item xs={4}>
                                <FastTextFieldValidator
                                    id={id + '_surName'}
                                    value={babyInfo.engSurname}
                                    upperCase
                                    variant="outlined"
                                    label={<>Mother's Surname<RequiredIcon /></>}
                                    onlyOneSpace
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
                                    onBlur={e => this.handleOnChange(e.target.value, 'engSurname')}
                                    trim={'all'}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FastTextFieldValidator
                                    id={id + '_givenName'}
                                    upperCase
                                    variant="outlined"
                                    label={<>Mother's Given Name<RequiredIcon /></>}
                                    onlyOneSpace
                                    inputProps={{ maxLength: 40 }}
                                    value={babyInfo.engGivename}
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
                                    onBlur={e => this.handleOnChange(e.target.value, 'engGivename')}
                                    trim={'all'}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <FastTextFieldValidator
                                    id={id + '_docNo'}
                                    label={<>Mother's Document No.<RequiredIcon /> </>}
                                    variant="outlined"
                                    upperCase
                                    inputProps={{ maxLength: 30 }}
                                    value={babyInfo.docNo}
                                    validators={[
                                        ValidatorEnum.required
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED()
                                    ]}
                                    onBlur={e => this.handleOnChange(e.target.value, 'docNo')}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} className={classes.grid}>
                            <Grid item xs={9}>
                                <RegChCodeField
                                    id={id + '_chinaCode'}
                                    comDisabled={false}
                                    resetChineseNameFieldValid={this.resetChineseNameFieldValid}
                                    ccCode1={babyInfo.ccCode1}
                                    ccCode2={babyInfo.ccCode2}
                                    ccCode3={babyInfo.ccCode3}
                                    ccCode4={babyInfo.ccCode4}
                                    ccCode5={babyInfo.ccCode5}
                                    ccCode6={babyInfo.ccCode6}
                                    updateChiChar={this.updateChiChar}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FastTextFieldValidator
                                    ref={e => this.chineseNameField = e}
                                    id={id + '_chineseName'}
                                    variant="outlined"
                                    label="中文姓名"
                                    inputProps={{ maxLength: 20 }}
                                    value={babyInfo.nameChi}
                                    onBlur={this.chineseNameOnChange}
                                    //validators={[ValidatorEnum.isChinese]}
                                    //errorMessages={[CommonMessage.VALIDATION_NOTE_CHINESEFIELD()]}
                                    trim={'all'}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} style={{ marginTop: 30 }}>
                            <Grid item xs={12} className={classes.title}>{'Newborn Baby\'s Infomation:'}</Grid>
                            <Grid item xs={6}>
                                <RegDateBirthField
                                    id={id + '_birthField'}
                                    onChange={(value, name) => this.handleOnChange(value, name)}
                                    dobValue={babyInfo.dob}
                                    exact_dobValue={babyInfo.exactDobCd}
                                    exact_dobList={registerCodeList ? registerCodeList.exact_dob : null}
                                    comDisabled={false}
                                    handleExtDobChange={this.extDobOnChange}
                                    dobProps={
                                        { onBlur: null }
                                    }
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <OutlinedRadioValidator
                                    id={id + '_genderCd'}
                                    name="Sex"
                                    labelText="Sex"
                                    isRequired
                                    value={babyInfo.genderCd}
                                    onChange={e => this.handleOnChange(e.target.value, RegFieldName.GENDER)}
                                    list={
                                        registerCodeList &&
                                        registerCodeList.gender &&
                                        registerCodeList.gender.map(item => ({ label: item.engDesc, value: item.code }))
                                    }
                                    disabled={false}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    absoluteMessage={false}
                                />
                            </Grid>

                        </Grid>
                        <Grid container spacing={2} >
                            <Grid item xs={6}>
                                <FastTextFieldValidator
                                    id={id + '_birthOrder'}
                                    type={'number'}
                                    value={babyInfo.birthOrder}
                                    upperCase
                                    variant="outlined"
                                    label={<>Birth Order<RequiredIcon /></>}
                                    onlyOneSpace
                                    inputProps={{ maxLength: 40 }}
                                    validators={
                                        orderValidation.validators
                                    }
                                    errorMessages={
                                        orderValidation.errorMessages
                                    }
                                    onBlur={e => this.handleOnChange(e.target.value, 'birthOrder')}
                                    trim={'all'}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FastTextFieldValidator
                                    id={id + '_motherEpisodeNumOfBirth'}
                                    type={'number'}
                                    upperCase
                                    variant="outlined"
                                    label={<>Total No. of Birth(s) for this Pregnancy<RequiredIcon /></>}
                                    onlyOneSpace
                                    inputProps={{ maxLength: 40 }}
                                    value={babyInfo.motherEpisodeNumOfBirth}
                                    validators={
                                        totalValidation.validators
                                    }
                                    errorMessages={
                                        totalValidation.errorMessages
                                    }
                                    onBlur={e => this.handleOnChange(e.target.value, 'motherEpisodeNumOfBirth')}
                                    trim={'all'}
                                />
                            </Grid>
                        </Grid>


                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: id + '_save',
                            name: 'Save',
                            onClick: this.handleSubmit
                        },
                        {
                            id: id + '_cancel',
                            name: 'Cancel',
                            onClick: this.handleClose
                        }
                    ]
                }
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        registerCodeList: state.registration.codeList
    };
}

const mapDispatchToProps = {
    getBabyInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BabyInfoDialog));