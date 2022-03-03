import React, { Component } from 'react';
import {
    Grid,
    Typography,
    FormControlLabel,
    IconButton
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import {
    PANEL_FIELD_NAME,
    ACTION_STATUS_TYPE
} from '../../../enums/moe/moeEnums';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import * as prescriptionUtilities from '../../../utilities/prescriptionUtilities';
import MultipleLine from './multipleLine';
import StepUpDown from './stepUpDown';
import minPic from '../../../images/moe/elbow-end-minus-lg2.gif';
import DelayInput from '../../compontent/delayInput';
import CIMSCheckbox from '../../../components/CheckBox/CIMSCheckBox';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';
// import _ from 'lodash';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiTypography: {
            body1: {
                fontSize: '10pt'
            }
        },
        MuiInputBase: {
            root: {
                height: 26,
                lineHeight: 'inherit',
                fontSize: '10pt'
            },
            input: {
                height: 30,
                lineHeight: 'inherit',
                fontSize: '10pt'
            }
        }
    }
});
// function getAllSiteCodeList(allRouteCodeList) {
//     let siteCodeList = [];
//     allRouteCodeList.filter(function (element) {
//         if (element.sites && element.sites.length > 0) {
//             siteCodeList = siteCodeList.concat(_.cloneDeep(element.sites));
//         }
//         return element;
//     });
//     siteCodeList = siteCodeList.filter((el, index, arr) => index === arr.findIndex(_el => _el.siteId === el.siteId));
//     return siteCodeList;
// }


class PanelField extends Component {
    // getSpecTitle = (prescriptionData) => {
    //     let result = {};
    //     let supFreqInputText = prescriptionUtilities.getFreqInputText(prescriptionData.specialInterval, prescriptionData.specialInterval.supFreqText);

    //     if (supFreqInputText.length>0) {
    //         result.inputText1=supFreqInputText[0];
    //     }
    //     if (supFreqInputText.length>1) {
    //         result.inputText2=supFreqInputText[1];
    //     }
    //     return result;
    // }

    render() {
        const { panelClasses, index, prescriptionData, isShowAdvanced, id } = this.props;
        // const durationUnitList = this.props.codeList.duration_unit.filter(item => {
        //     let regimen = (prescriptionData.specialInterval && prescriptionData.specialInterval.regimen) || 'd';
        //     if (item.code === 'd' || item.code === 'w' || item.code === regimen.toLowerCase())
        //         return { value: item.code, label: item.engDesc };
        //     return null;
        // });
        const durationUnitList = moeUtilities.getDurationUnitCodeList(
            prescriptionData,
            this.props.codeList.duration_unit,
            this.props.codeList.freq_code,
            prescriptionData.orderLineType
        );
        const durationUnitId = 'prescription_PrescriptionPanel' + index + '_durationUnitSelectFieldValidator';
        const freqId = 'prescription_PrescriptionPanel' + index + '_freqSelectFieldValidator';
        const siteId = 'prescription_PrescriptionPanel' + index + '_SiteSelectFieldValidator';

        console.log('dmei test panelField', prescriptionData);
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid id="prescriptionInputArea" style={{ paddingTop: 10/*, overflowX: 'hidden', overflowY: 'auto'*/ }}/*style={{display:'flex'}}*/>
                    <Grid container spacing={1}>
                        <Grid item container xs={2}>
                            <Grid item xs={9}>
                                <DelayInput
                                    fullWidth
                                    value={(prescriptionData && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')) ? null : prescriptionData.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                    name={'txtDosage'}
                                    labelText="Dosage:"
                                    labelPosition="left"
                                    isRequired={!(prescriptionData && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == ''))}
                                    id={id + '_dosageTextFieldValidator'}
                                    onChange={e => this.props.handleChange(e)}
                                    validators={(prescriptionData && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')) ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage')}
                                    notShowMsg
                                    trim={'all'}
                                    inputProps={{
                                        maxLength: 20
                                    }}
                                    isSmallSize
                                    labelProps={{
                                        style: { minWidth: '98px', paddingLeft: '8px', textAlign: 'right' }
                                    }}
                                    type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                    disabled={prescriptionData && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Typography style={{ width: '100%', paddingLeft: '5px', lineHeight: '28px' }}>
                                    {prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={2} container>
                            <Typography component={'div'} style={{ width: '35px', padding: '4px', paddingLeft: '0px' }}>
                                <Typography component="div" className={panelClasses.inGridTitleLabel}>
                                    Freq:<RequiredIcon />
                                </Typography>
                            </Typography>
                            <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                                <SelectFieldValidator
                                    id={freqId}
                                    options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                        if (item.useInputValue === 'Y' && prescriptionData && prescriptionData.ddlFreq === item.code && prescriptionData.freq1) {
                                            let freq1 = prescriptionData.freq1;
                                            let flagIndex = item.engDesc.indexOf('_');
                                            let desc = item.engDesc.slice(0, flagIndex + 1) + freq1 + item.engDesc.slice(flagIndex + 1);
                                            return ({ ...item, value: item.code, label: desc });
                                        }
                                        return ({ ...item, value: item.code, label: item.engDesc });
                                    }
                                    )}
                                    value={prescriptionData && prescriptionData.ddlFreq}
                                    name={'ddlFreq'}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlFreq')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Freq')}
                                    notShowMsg
                                    inputProps={{
                                        maxLength: 40
                                    }}
                                    isSmallSize
                                    onFocus={
                                        () => this.props.logOldData(
                                            PANEL_FIELD_NAME.FREQ,
                                            document.getElementById(freqId + '_control').getAttribute('value')
                                        )
                                    }
                                    onBlur={() => this.props.handleOnBlurChange('ddlFreq', '', true)}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={1}>
                            <FormControlLabel
                                control={
                                    <CIMSCheckbox
                                        id={id + '_PRNCheckbox'}
                                        value={'PRN'}
                                        name={'chkPRN'}
                                        checked={prescriptionData && prescriptionData.chkPRN === 'Y'}
                                        onChange={e => this.props.handelCheckboxChange(e)}
                                    />
                                }
                                classes={{
                                    root: panelClasses.radioBtn
                                }}
                                label={'PRN'}
                            />
                        </Grid>
                        <Grid item xs={2} container>
                            <Typography component={'div'} style={{ width: '50px', padding: '4px' }}>
                                <Typography component="div" className={panelClasses.inGridTitleLabel}>
                                    Route:<RequiredIcon />
                                </Typography>
                            </Typography>
                            <Grid item xs={8}>
                                <SelectFieldValidator
                                    id={id + '_routeSelectFieldValidator'}
                                    options={this.props.routeCodeList.map(item => ({ ...item, value: item.code, label: item.engDesc }))}
                                    value={prescriptionData && prescriptionData.ddlRoute}
                                    name={'ddlRoute'}
                                    onChange={(e, filterList) => this.props.handleChangeSite(e, 'ddlRoute', filterList)}
                                    validators={[ValidatorEnum.required]}
                                    menuIsOpen={this.props.openRouteComponent}
                                    onMenuOpen={() => this.props.toggleRouteComponent(true)}
                                    onMenuClose={() => this.props.toggleRouteComponent(false)}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Route')}
                                    notShowMsg
                                    isSmallSize
                                    onFocus={() => this.props.logOldData(
                                        PANEL_FIELD_NAME.SITE,
                                        document.getElementById(siteId + '_control') ? document.getElementById(siteId + '_control').getAttribute('value') : ''
                                    )} //[Site] will effect dose, not [Route]
                                    onBlur={() => this.props.handleOnBlurChange('ddlRoute', '', false)}
                                    moeFilter={{
                                        filterField: 'routeOtherName',
                                        displayFiledName: 'hadFilterAbbreviation'
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item container xs={2}>
                            <Grid item xs={5}>
                                <TextFieldValidator
                                    fullWidth
                                    id={id + '_durationTextFieldValidator'}
                                    variant={'outlined'}
                                    labelText={'For:'}
                                    labelPosition="left"
                                    isRequired
                                    value={prescriptionData && prescriptionData.txtDuration}
                                    name={'txtDuration'}
                                    onChange={e => this.props.handleChange(e)}
                                    validators={[ValidatorEnum.required, ValidatorEnum.isPositiveIntegerWithoutZero]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'For')}
                                    notShowMsg
                                    trim={'all'}
                                    inputProps={{
                                        maxLength: 3
                                    }}
                                    labelProps={{
                                        style: { minWidth: '35px' }
                                    }}
                                    isSmallSize
                                    onFocus={
                                        (e) => this.props.logOldData(
                                            PANEL_FIELD_NAME.DURATION,
                                            e.target.value
                                        )
                                    }
                                    onBlur={() => this.props.handleOnBlurChange('txtDuration', '', true)}
                                    type={'number'}//20191009 Define the text field for number only by Louis Chen
                                />
                            </Grid>
                            <Grid item xs={7}>
                                <SelectFieldValidator
                                    id={durationUnitId}
                                    options={durationUnitList && durationUnitList.map((item) =>
                                        ({ value: item.code, label: item.engDesc })
                                    )}
                                    onFocus={
                                        () => this.props.logOldData(
                                            PANEL_FIELD_NAME.DURATION_UNIT,
                                            document.getElementById(durationUnitId + '_control').getAttribute('value')
                                        )
                                    }
                                    value={prescriptionData && prescriptionData.ddlDurationUnit}
                                    name={'ddlDurationUnit'}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlDurationUnit')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'For', 'Duration Unit')}
                                    notShowMsg
                                    isSmallSize
                                    onBlur={() => this.props.handleOnBlurChange('ddlDurationUnit', '', true)}
                                    isDisabled={prescriptionData.specialInterval && prescriptionData.specialInterval.regimen ? true : false}
                                />
                            </Grid>
                        </Grid>
                        {prescriptionData && prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y' ?
                            <Grid item container xs={2}>
                                <Typography component="div" style={{ lineHeight: '28px' }}>
                                    (
                                </Typography>
                                <Typography
                                    component="div"
                                    style={{
                                        width: '48%',
                                        marginRight: '3px',
                                        marginLeft: '3px'
                                    }}
                                >
                                    <TextFieldValidator
                                        id={id + '_original_dangerousDrugTextField'}
                                        variant={'outlined'}
                                        value={prescriptionData && prescriptionData.txtDangerDrugQty}
                                        name={'txtDangerDrugQty'}
                                        onChange={e => this.props.handleChange(e)}
                                        validators={[ValidatorEnum.isPositiveIntegerWithoutZero, ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity')}
                                        notShowMsg
                                        trim={'all'}
                                        inputProps={{
                                            maxLength: 4
                                        }}
                                        isSmallSize
                                        onBlur={() => this.props.handleChangeDose(null, prescriptionData && prescriptionData.txtDangerDrugQty)}
                                        onFocus={() => this.props.handleFocusDose(prescriptionData)}
                                        type={'number'}//20191009 Define the text field for number only by Louis Chen
                                    />
                                </Typography>
                                <Typography component="div" style={{ lineHeight: '28px' }}>
                                    dose)
                                </Typography>
                            </Grid>
                            :
                            isShowAdvanced ?
                                null
                                :
                                <Grid item container xs={2}>
                                    <Grid item xs={6}>
                                        <DelayInput
                                            key={'moeQty:' + prescriptionData.txtQty}
                                            fullWidth
                                            id={id + '_qtyTextFieldValidator'}
                                            variant={'outlined'}
                                            labelText="Qty:"
                                            labelPosition={'left'}
                                            value={prescriptionData && prescriptionData.txtQty}
                                            name={'txtQty'}
                                            onChange={e => this.props.handleChange(e)}
                                            validators={[ValidatorEnum.isPositiveInteger]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Qty')}
                                            notShowMsg
                                            trim={'all'}
                                            inputProps={{
                                                maxLength: 4
                                            }}
                                            isSmallSize
                                            type={'number'}//20191009 Define the text field for number only by Louis Chen
                                        // labelProps={{
                                        //     style: { minWidth: '96px', paddingLeft: '8px', textAlign: 'right' }
                                        // }}
                                        />
                                    </Grid>
                                    <Typography component="div" style={{ paddingLeft: '5px', lineHeight: '28px' }}>
                                        {prescriptionData.ddlQtyUnit && prescriptionUtilities.getSelectValue(this.props.codeList.base_unit, prescriptionData.ddlQtyUnit)}
                                    </Typography>
                                </Grid>
                        }
                    </Grid>
                    {prescriptionData && prescriptionData.specialInterval ?
                        <Typography component="div">
                            <Grid container spacing={1}>
                                <Grid item container xs={5} justify="flex-end">
                                    <Grid item xs={9}>
                                        <TextFieldValidator
                                            id={id + '_SpecialInterval_0_TextFieldValidator'}
                                            name="specialInterval"
                                            labelText="Special Interval:"
                                            labelPosition="left"
                                            labelProps={{
                                                style: { width: '165px', marginLeft: '10px' }
                                            }}
                                            trim={'all'}
                                            onClick={this.props.handleBtnPopUpSpecialinterval}
                                            //value={this.getSpecTitle(prescriptionData).inputText1}
                                            value={prescriptionData && prescriptionData.specialInterval && prescriptionData.specialInterval.supFreqText && prescriptionData.specialInterval.supFreqText.length > 0 ? prescriptionData.specialInterval.supFreqText[0] : ''}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                            isSmallSize
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={7} container justify={'flex-end'}>
                                    <Grid item xs={1}>
                                        <IconButton style={{ padding: '0px' }}
                                            id={id + '_specialInterval_deleteIconButton'}
                                            onClick={() => this.props.handleDeleteSpecialInterval()}
                                        >
                                            <img src={minPic} alt={''} />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {prescriptionData.specialInterval.regimen === 'D' && (prescriptionData.specialInterval.supplFreqId === 2) ?
                                <Typography component="div">
                                    <Grid container spacing={1}>
                                        <Grid item container xs={2}>
                                            <Grid item xs={9}>
                                                <DelayInput
                                                    fullWidth
                                                    value={prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '' ? null : prescriptionData.specialInterval.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                    name={'txtDosage'}
                                                    labelText="and Dosage:"
                                                    isRequired
                                                    labelPosition="left"
                                                    id={id + '_specialInterval_dosage'}
                                                    variant={'outlined'}
                                                    onChange={e => this.props.handleSpecialIntervalChange(e)}
                                                    validators={prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '' ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'specialInterval_dosage')}
                                                    notShowMsg
                                                    trim={'all'}
                                                    inputProps={{
                                                        maxLength: 20
                                                    }}
                                                    labelProps={{
                                                        style: { minWidth: '98px', paddingLeft: '8px', textAlign: 'right' }
                                                    }}
                                                    isSmallSize
                                                    type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                                    disabled={prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == ''}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography style={{ width: '100%', paddingLeft: '5px', lineHeight: '28px' }}>
                                                    {prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={2} container>
                                            <Typography component={'div'} style={{ width: '35px', padding: '4px', paddingLeft: '0px' }}>
                                                <Typography component="div" className={this.props.panelClasses.inGridTitleLabel}>
                                                    Freq:<RequiredIcon />
                                                </Typography>
                                            </Typography>
                                            <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                                                <SelectFieldValidator
                                                    id={id + '_specialInterval_Freq'}
                                                    options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                                        if (item.useInputValue === 'Y' && prescriptionData && prescriptionData.specialInterval.ddlFreq === item.code && prescriptionData.specialInterval.freq1) {
                                                            let freq1 = prescriptionData.specialInterval.freq1;
                                                            let flagIndex = item.engDesc.indexOf('_');
                                                            let desc = item.engDesc.slice(0, flagIndex + 1) + freq1 + item.engDesc.slice(flagIndex + 1);
                                                            return ({ ...item, value: item.code, label: desc });
                                                        }
                                                        return ({ ...item, value: item.code, label: item.engDesc });
                                                    }
                                                    )}
                                                    value={prescriptionData && prescriptionData.specialInterval && prescriptionData.specialInterval.ddlFreq}
                                                    name={'ddlFreq'}
                                                    onChange={e => this.props.handleSpecialIntervalSelectChange(e, 'ddlFreq')}
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Freq', 'specialInterval_Freq')}
                                                    notShowMsg
                                                    inputProps={{
                                                        maxLength: 40
                                                    }}
                                                    isSmallSize
                                                    //onBlur={() => this.props.handleSpecialIntervalConfirm(prescriptionData.specialInterval)}
                                                    onBlur={() => this.props.handleOnBlurChange('ddlFreq', '', false)}
                                                />
                                            </Grid>
                                        </Grid>
                                        {prescriptionData && prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y' ?
                                            <Grid item xs={5}></Grid> : null}
                                        {prescriptionData && prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y' ?
                                            <Grid item container xs={2}>
                                                <Typography component="div" style={{ lineHeight: '28px' }}>
                                                    (
                                                </Typography>
                                                <Typography
                                                    component="div"
                                                    style={{
                                                        width: '48%',
                                                        marginRight: '3px',
                                                        marginLeft: '3px'
                                                    }}
                                                >
                                                    <TextFieldValidator
                                                        id={id + '_specialInterval_dangerousDrugTextField'}
                                                        variant={'outlined'}
                                                        value={prescriptionData && prescriptionData.specialInterval.txtDangerDrugQty}
                                                        name={'txtDangerDrugQty'}
                                                        onChange={e => this.props.handleSpecialIntervalChange(e)}
                                                        validators={[ValidatorEnum.isPositiveIntegerWithoutZero, ValidatorEnum.required]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                        validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity', 'specialInterval_Quantity')}
                                                        notShowMsg
                                                        trim={'all'}
                                                        inputProps={{
                                                            maxLength: 4
                                                        }}
                                                        isSmallSize
                                                        onBlur={() => this.props.handleChangeDose(1, prescriptionData && prescriptionData.specialInterval.txtDangerDrugQty)}
                                                        onFocus={() => this.props.handleFocusDose(prescriptionData.specialInterval, 1)}
                                                        type={'number'}//20191009 Define the text field for number only by Louis Chen
                                                    />
                                                </Typography>
                                                <Typography component="div" style={{ lineHeight: '28px' }}>
                                                    dose)
                                                </Typography>
                                            </Grid>
                                            : null}
                                    </Grid >
                                    <Grid container spacing={1}>
                                        <Grid item container xs={5} justify="flex-end">
                                            <Grid item xs={9}>
                                                <TextFieldValidator
                                                    id={id + '_SpecialInterval_1_TextFieldValidator'}
                                                    name="specialInterval"
                                                    labelText="Special Interval:"
                                                    labelPosition="left"
                                                    labelProps={{
                                                        style: { width: '165px', marginLeft: '10px' }
                                                    }}
                                                    onClick={this.props.handleBtnPopUpSpecialinterval}
                                                    //value={this.getSpecTitle(prescriptionData).inputText2}
                                                    value={prescriptionData && prescriptionData.specialInterval && prescriptionData.specialInterval.supFreqText && prescriptionData.specialInterval.supFreqText[1]}
                                                    inputProps={{
                                                        readOnly: true
                                                    }}
                                                    isSmallSize
                                                    trim={'all'}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Typography>
                                : null
                            }
                        </Typography>
                        :
                        null
                    }
                    {this.props.showMultipleLine ?
                        prescriptionData.moeMedMultDoses
                        && prescriptionData.moeMedMultDoses.map((item, i) => {
                            if (i === 0) {
                                return null;
                            } else {
                                return <MultipleLine
                                    id={id + '_multipleLine' + i}
                                    key={item.multDoseNo}
                                    mulDosesItem={item}
                                    lineId={i}
                                    index={index}
                                    prescriptionData={this.props.prescriptionData}
                                    panelClasses={panelClasses}
                                    codeList={this.props.codeList}
                                    multipleLineData={item}
                                    // handleAddMultipleLine={() => this.props.handleAddMultipleLine(item.multDoseNo)}
                                    // handleDeleteMultipleLine={this.props.handleDeleteMultipleLine}
                                    handleMultipleChange={this.props.handleMultipleChange}
                                    onMultipleSelectedItem={this.props.onMultipleSelectedItem}
                                    validatorListener={this.props.validatorListener}
                                    isFreeText={false}
                                    closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                                    updateOrderLineField={this.props.updateOrderLineField}
                                    handleOnBlurChange={this.props.handleOnBlurChange}
                                    handleChangeDose={this.props.handleChangeDose}
                                    handleFocusDose={this.props.handleFocusDose}
                                    logOldData={this.props.logOldData}

                                    handleAddMulDoses={() => this.props.handleAddMulDoses(prescriptionData.orderLineType, item.multDoseNo)}
                                    handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                                       />;
                            }
                        })
                        : null}
                    {this.props.showStepUpDown ?
                        prescriptionData.moeMedMultDoses
                        && prescriptionData.moeMedMultDoses.map((item, i) => {
                            if (i === 0) {
                                return null;
                            } else {
                                return <StepUpDown
                                    id={id + '_stepUpDown' + i}
                                    key={item.multDoseNo}
                                    mulDosesItem={item}
                                    lineId={i}
                                    index={index}
                                    prescriptionData={this.props.prescriptionData}
                                    panelClasses={panelClasses}
                                    codeList={this.props.codeList}
                                    multipleLineData={item}
                                    // handleAddStepUpDown={() => this.props.handleAddStepUpDown(item.multDoseNo)}
                                    // handleDeleteMultipleLine={this.props.handleDeleteMultipleLine}
                                    handleMultipleChange={this.props.handleMultipleChange}
                                    onMultipleSelectedItem={this.props.onMultipleSelectedItem}
                                    handelMultipleCheckboxChange={this.props.handelMultipleCheckboxChange}
                                    validatorListener={this.props.validatorListener}
                                    isFreeText={false}
                                    closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                                    updateOrderLineField={this.props.updateOrderLineField}
                                    handleOnBlurChange={this.props.handleOnBlurChange}
                                    handleChangeDose={this.props.handleChangeDose}
                                    handleFocusDose={this.props.handleFocusDose}
                                    logOldData={this.props.logOldData}

                                    handleAddMulDoses={() => this.props.handleAddMulDoses(prescriptionData.orderLineType, item.multDoseNo)}
                                    handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                                       />;
                            }
                        })
                        : null}
                    {isShowAdvanced ?
                        <Grid container spacing={1}>
                            <Typography component={'div'} style={{ width: '88px', padding: '4px', textAlign: 'right' }}>
                                <Typography component="div" className={panelClasses.inGridTitleLabel}>
                                    Prep:
                                </Typography>
                            </Typography>
                            <Grid item xs={1}>
                                <SelectFieldValidator
                                    id={id + '_PrepSelectFieldValidator'}
                                    // labelText="Prep: "
                                    // labelPosition="left"
                                    value={prescriptionData && prescriptionData.ddlPrep}
                                    name={'ddlPrep'}
                                    disabled={prescriptionData.ddlPrepCodeList && false}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlPrep')}
                                    options={prescriptionData.ddlPrepCodeList && prescriptionData.ddlPrepCodeList.map((item) => ({ value: item.strength, label: item.strength }))}
                                    // labelProps={{
                                    //     style: { minWidth: '96px', paddingLeft: '8px', textAlign: 'right' }
                                    // }}
                                    isSmallSize
                                    isDisabled={!prescriptionData.ddlPrepCodeList || prescriptionData.ddlPrepCodeList.length === 0}//20191009 Disable the selector when not item to select by Louis Chen
                                    addNullOption={prescriptionData.strengthCompulsory != 'Y'}
                                // validators={[ValidatorEnum.required]}
                                // errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                // validatorListener={(...arg) => this.props.validatorListener(...arg, index, 'Strength')}
                                // notShowMsg
                                // inputProps={{
                                //     maxLength: 500
                                // }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <SelectFieldValidator
                                    id={id + '_actionStatusSelectFieldValidator'}
                                    options={this.props.codeList.action_status && this.props.codeList.action_status.map((item) => ({ value: item.code, label: item.engDesc }))}
                                    // value={prescriptionData && prescriptionData.ddlActionStatus}
                                    value={prescriptionData.ddlActionStatus ? prescriptionData.ddlActionStatus : ACTION_STATUS_TYPE.DISPENSE_PHARMACY}
                                    name={'ddlActionStatus'}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlActionStatus')}
                                    // validators={[ValidatorEnum.required]}
                                    // errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    // validatorListener={(...arg) => this.props.validatorListener(...arg, index,'Strength', 'Action Status')}
                                    notShowMsg
                                    isSmallSize
                                />
                            </Grid>
                            <Grid item xs={2} container>
                                <Typography component={'div'} style={{ width: '50px', padding: '4px' }}>
                                    <Typography component="div" className={panelClasses.inGridTitleLabel}>
                                        Site:
                                </Typography>
                                </Typography>
                                <Grid item xs={8}>
                                    <SelectFieldValidator
                                        isDisabled={!this.props.sitesCodeList || this.props.sitesCodeList.length === 0}
                                        fullWidth
                                        id={siteId}
                                        value={prescriptionData && prescriptionData.ddlSite}
                                        name={'ddlSite'}
                                        onChange={e => this.props.handleChangeSite(e, 'ddlSite')}
                                        // options={[{ value: '1', label: 'affected' }]}
                                        options={this.props.sitesCodeList.map((item) => (
                                            { value: item.siteId, label: item.siteEng }))
                                        }
                                        inputProps={{
                                            maxLength: 255
                                        }}
                                        isSmallSize
                                        onFocus={
                                            () => this.props.logOldData(
                                                PANEL_FIELD_NAME.SITE,
                                                document.getElementById(siteId + '_control').getAttribute('value')
                                            )
                                        }
                                        onBlur={() => this.props.handleOnBlurChange('ddlSite')}
                                        menuIsOpen={this.props.openSiteComponent}
                                        onMenuOpen={() => this.props.toggleSiteComponent(true)}
                                        onMenuClose={() => this.props.toggleSiteComponent(false)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={3}>
                                <DateFieldValidator
                                    labelText="Start From: "
                                    id={id + '_startFromDateFieldValidator'}
                                    labelPosition={'left'}
                                    value={prescriptionData.txtStartFrom}
                                    name={'txtStartFrom'}
                                    labelProps={{
                                        style: { minWidth: '80px' }
                                    }}
                                    isSmallSize
                                    onChange={e => this.props.onSelectedDate(e, 'txtStartFrom')}
                                />
                            </Grid>
                            {prescriptionData && prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'N' ?
                                <Grid container item xs={2}>
                                    <Grid item xs={6}>
                                        <DelayInput
                                            key={'moeQty:' + prescriptionData.txtQty}
                                            fullWidth
                                            id={id + '_qtyTextFieldValidator'}
                                            variant={'outlined'}
                                            labelText="Qty:"
                                            labelPosition={'left'}
                                            value={prescriptionData && prescriptionData.txtQty}
                                            name={'txtQty'}
                                            onChange={e => this.props.handleChange(e)}
                                            validators={[ValidatorEnum.isPositiveInteger]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Qty')}
                                            notShowMsg
                                            inputProps={{
                                                maxLength: 4
                                            }}
                                            labelProps={{
                                                style: { minWidth: '30px' }
                                            }}
                                            isSmallSize
                                            trim={'all'}
                                            type={'number'}//20191009 Define the text field for number only by Louis Chen
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography style={{ paddingLeft: '5px', lineHeight: '28px' }}>
                                            {prescriptionData.ddlQtyUnit && prescriptionUtilities.getSelectValue(this.props.codeList.base_unit, prescriptionData.ddlQtyUnit)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                :
                                null}
                        </Grid>
                        :
                        null
                    }
                    <Grid container spacing={1} style={{ marginBottom: '5px' }}>
                        <Grid item xs={12} style={{ paddingRight: '50px' }}>
                            <DelayInput
                                fullWidth
                                id={id + '_specInstTextFieldValidator'}
                                variant={'outlined'}
                                labelText={'Special Inst:'}
                                labelPosition={'left'}
                                value={prescriptionData && prescriptionData.txtSpecInst}
                                name={'txtSpecInst'}
                                onChange={e => this.props.handleChange(e)}
                                inputProps={{
                                    maxLength: 125
                                }}
                                isSmallSize
                                trim={'all'}
                                labelProps={{
                                    style: { minWidth: '96px', paddingLeft: '8px', textAlign: 'right' }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        //codeList: state.prescription.codeList
        //codeList: state.moe.codeList
        maxDosage: state.moe.maxDosage
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(PanelField);