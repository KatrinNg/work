import React, { Component } from 'react';
import {
    Grid,
    Typography,
    FormControlLabel,
    IconButton
} from '@material-ui/core';
import { connect } from 'react-redux';
import DelayInput from '../../compontent/delayInput';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import MultipleLine from './multipleLine';
import StepUpDown from './stepUpDown';
import minPic from '../../../images/moe/elbow-end-minus-lg2.gif';
import CIMSCheckbox from '../../../components/CheckBox/CIMSCheckBox';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

class FreeTextPanelField extends Component {

    render() {
        const { panelClasses, index, prescriptionData, id } = this.props;
        const durationUnitList = moeUtilities.getDurationUnitCodeList(
            prescriptionData,
            this.props.codeList.duration_unit,
            this.props.codeList.freq_code,
            prescriptionData.orderLineType
        );
        console.log('demi test free panel', prescriptionData);
        return (

            <Grid id="prescriptionInputArea" style={{ paddingTop: 10 }} >
                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <DelayInput
                            fullWidth
                            value={prescriptionData && prescriptionData.txtForm}
                            name={'txtForm'}
                            isRequired
                            labelText="Form:"
                            labelPosition="left"
                            id={id + '_fromTextFieldValidator'}
                            variant={'outlined'}
                            onChange={e => this.props.handleChange(e)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Form')}
                            notShowMsg
                            trim={'all'}
                            inputProps={{
                                maxLength: 255
                            }}
                            labelProps={{
                                style: { minWidth: '110px', paddingLeft: '8px', textAlign: 'right' }
                            }}
                        />
                    </Grid>
                    <Grid item container xs={2}>
                        <Grid item xs={8} >
                            <DelayInput
                                fullWidth
                                value={prescriptionData && prescriptionData.txtDosage}
                                name={'txtDosage'}
                                id={id + '_dosageTextFieldValidator'}
                                isRequired
                                labelText="Dosage:"
                                labelPosition={'left'}
                                variant={'outlined'}
                                onChange={e => this.props.handleChange(e)}
                                validators={[ValidatorEnum.required, 'isDecimal']}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage')}
                                notShowMsg
                                trim={'all'}
                                inputProps={{
                                    maxLength: 16
                                }}
                                labelProps={{
                                    style: { maxWidth: '70px' }
                                }}
                                type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                isSmallSize
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <DelayInput
                                value={prescriptionData && prescriptionData.txtDosageModu}
                                defaultvaule={prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                                name={'txtDosageModu'}
                                id={id + '_dosageModuTextFieldValidator'}
                                variant={'outlined'}
                                fullWidth
                                onChange={e => this.props.handleChange(e)}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'DosageModu')}
                                trim={'all'}
                                inputProps={{
                                    maxLength: 255
                                }}
                                notShowMsg
                                isSmallSize
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={2} container>
                        <Typography component={'div'} style={{ width: '35px', padding: '4px' }}>
                            <label className={panelClasses.inGridTitleLabel}>
                                Freq:<RequiredIcon />
                            </label>
                        </Typography>
                        <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                            <SelectFieldValidator
                                id={id + '_freqSelectFieldValidator'}
                                options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                    if (item.useInputValue === 'Y' && prescriptionData && prescriptionData.ddlFreq === item.code && prescriptionData.freq1) {
                                        let freq1 = prescriptionData && prescriptionData.freq1;
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
                                onBlur={() => this.props.handleSpecialIntervalConfirm(prescriptionData.specialInterval)}
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
                                    checked={prescriptionData.chkPRN === 'Y'}
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
                        <Typography component={'div'} style={{ width: '53px', padding: '4px' }}>
                            <label className={panelClasses.inGridTitleLabel}>
                                Route:<RequiredIcon />
                            </label>
                        </Typography>
                        <Grid item xs={8}>
                            <SelectFieldValidator
                                id={id + '_routeSelectFieldValidator'}
                                // options={this.props.codeList.route && this.props.codeList.route.map((item) => ({ value: item.code, label: item.engDesc }))}
                                options={this.props.routeCodeList.map(item => ({ ...item, value: item.code, label: item.engDesc }))}
                                value={prescriptionData && prescriptionData.ddlRoute}
                                name={'ddlRoute'}
                                menuIsOpen={this.props.openRouteComponent}
                                onMenuOpen={() => this.props.toggleRouteComponent(true)}
                                onMenuClose={() => this.props.toggleRouteComponent(false)}
                                onChange={(e, filterList) => this.props.handleChangeSite(e, 'ddlRoute', filterList)}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Route')}
                                notShowMsg
                                moeFilter={{
                                    filterField: 'routeOtherName',
                                    displayFiledName: 'hadFilterAbbreviation'
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container xs={3}>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                fullWidth
                                id={id + '_durationTextFieldValidator'}
                                variant={'outlined'}
                                value={prescriptionData && prescriptionData.txtDuration}
                                name={'txtDuration'}
                                labelText="For:"
                                labelPosition="left"
                                isRequired
                                onChange={e => this.props.handleChange(e)}
                                validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'For')}
                                notShowMsg
                                trim={'all'}
                                inputProps={{
                                    maxLength: 3
                                }}
                                disabled={prescriptionData.specialInterval && prescriptionData.specialInterval.regimen ? true : false}
                                type={'number'}//20191009 Define the text field for number only by Louis Chen
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <SelectFieldValidator
                                fullWidth
                                id={id + '_durationUnitSelectFieldValidator'}
                                options={durationUnitList && durationUnitList.map((item) =>
                                    ({ value: item.code, label: item.engDesc })
                                )}
                                //value={prescriptionData && prescriptionData.ddlDurationUnit}
                                value={prescriptionData.ddlDurationUnit}
                                name={'ddlDurationUnit'}
                                onChange={e => this.props.onSelectedItem(e, 'ddlDurationUnit')}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'For', 'Duration Unit')}
                                notShowMsg
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {prescriptionData && prescriptionData.specialInterval ?
                    <Typography component="div">
                        <Grid container spacing={1}>
                            <Grid item container xs={7} justify="flex-end">
                                <Grid item>
                                    <TextFieldValidator
                                        id={id + '_SpecialInterval_0_TextFieldValidator'}
                                        name="specialInterval"
                                        labelText="Special Interval:"
                                        labelPosition="left"
                                        trim={'all'}
                                        labelProps={{
                                            style: { width: '190px', marginRight: '-20px' }
                                        }}
                                        style={{ width: '94%', float: 'right' }}
                                        onClick={this.props.handleBtnPopUpSpecialinterval}
                                        value={prescriptionData && prescriptionData.specialInterval && prescriptionData.specialInterval.supFreqText && prescriptionData.specialInterval.supFreqText.length > 0 ? prescriptionData.specialInterval.supFreqText[0] : ''}
                                        inputProps={{
                                            readOnly: true
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={5} container justify={'flex-end'}>
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
                                    <Grid item container xs={4} justify="flex-end">
                                        <Grid item xs={5} container spacing={0}>
                                            <DelayInput
                                                fullWidth
                                                value={prescriptionData.specialInterval.txtDosage}
                                                name={'txtDosage'}
                                                labelText="and Dosage:"
                                                isRequired
                                                labelPosition="left"
                                                id={id + '_specialInterval_dosage'}
                                                // variant={'outlined'}
                                                trim={'all'}
                                                onChange={e => this.props.handleSpecialIntervalChange(e)}
                                                validators={[ValidatorEnum.required, 'isDecimal']}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'specialInterval_dosage')}
                                                notShowMsg
                                                style={{
                                                    paddingLeft: '0px',
                                                    paddingRight: '0px',
                                                    marginLeft: '-2px'
                                                }}
                                                inputProps={{
                                                    maxLength: 20
                                                }}
                                                labelProps={{
                                                    style: { minWidth: '108px', paddingRight: '0px', textAlign: 'right' }
                                                }}
                                                isSmallSize
                                                type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <label style={{ width: '100%', paddingLeft: '5px' }}>
                                                {prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                                            </label>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={2} container>
                                        <Typography component={'div'} style={{ width: '35px', padding: '4px' }}>
                                            <label className={this.props.panelClasses.inGridTitleLabel}>
                                                Freq:<RequiredIcon />
                                            </label>
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
                                                onBlur={() => this.props.handleSpecialIntervalConfirm(prescriptionData.specialInterval)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid >
                                <Grid container spacing={1}>
                                    <Grid item container xs={7} justify="flex-end">
                                        <Grid item>
                                            <TextFieldValidator
                                                id={id + '_SpecialInterval_1_TextFieldValidator'}
                                                name="specialInterval"
                                                trim={'all'}
                                                labelText="Special Interval:"
                                                labelPosition="left"
                                                labelProps={{
                                                    style: { width: '190px', marginRight: '-20px' }
                                                }}
                                                style={{ width: '94%', float: 'right' }}
                                                onClick={this.props.handleBtnPopUpSpecialinterval}
                                                value={prescriptionData && prescriptionData.specialInterval && prescriptionData.specialInterval.supFreqText && prescriptionData.specialInterval.supFreqText[1]}
                                                inputProps={{
                                                    readOnly: true
                                                }}
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
                {this.props.showMultipleLine &&
                    this.props.prescriptionData.moeMedMultDoses
                    && this.props.prescriptionData.moeMedMultDoses.map((item, i) => {
                        if (i === 0) {
                            return null;
                        } else {
                            return <MultipleLine
                                id={id + '_multipleLine' + i}
                                key={item.multDoseNo}
                                mulDosesItem={item}
                                lineId={i}
                                index={index}
                                prescriptionData={prescriptionData}
                                panelClasses={panelClasses}
                                codeList={this.props.codeList}
                                multipleLineData={item}
                                // handleAddMultipleLine={() => this.props.handleAddMultipleLine(item.multDoseNo)}
                                // handleDeleteMultipleLine={this.props.handleDeleteMultipleLine}
                                handleMultipleChange={this.props.handleMultipleChange}
                                onMultipleSelectedItem={this.props.onMultipleSelectedItem}
                                isFreeText
                                validatorListener={this.props.validatorListener}
                                closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                                updateOrderLineField={this.props.updateOrderLineField}
                                handleFocusDose={this.props.handleFocusDose}
                                logOldData={this.props.logOldData}

                                handleAddMulDoses={() => this.props.handleAddMulDoses(prescriptionData.orderLineType, item.multDoseNo)}
                                handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                                   />;
                        }
                    })
                }
                {this.props.showStepUpDown &&
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
                                prescriptionData={prescriptionData}
                                panelClasses={panelClasses}
                                codeList={this.props.codeList}
                                multipleLineData={item}
                                // handleAddStepUpDown={() => this.props.handleAddStepUpDown(item.multDoseNo)}
                                // handleDeleteMultipleLine={this.props.handleDeleteMultipleLine}
                                handleMultipleChange={this.props.handleMultipleChange}
                                onMultipleSelectedItem={this.props.onMultipleSelectedItem}
                                handelMultipleCheckboxChange={this.props.handelMultipleCheckboxChange}
                                isFreeText
                                validatorListener={this.props.validatorListener}
                                closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                                updateOrderLineField={this.props.updateOrderLineField}
                                handleFocusDose={this.props.handleFocusDose}
                                logOldData={this.props.logOldData}

                                handleAddMulDoses={() => this.props.handleAddMulDoses(prescriptionData.orderLineType, item.multDoseNo)}
                                handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                                   />;
                        }
                    })
                }
                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <TextFieldValidator
                            id={id + '_strengthTextFieldValidator'}
                            variant={'outlined'}
                            fullWidth
                            isRequired
                            labelText="Strength:"
                            labelPosition="left"
                            value={prescriptionData && prescriptionData.txtStrength}
                            name={'txtStrength'}
                            trim={'all'}
                            onChange={e => this.props.handleChange(e)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Strength')}
                            notShowMsg
                            inputProps={{
                                maxLength: 500
                            }}
                            labelProps={{
                                style: { minWidth: '110px', paddingLeft: '8px', textAlign: 'right' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <SelectFieldValidator
                            id={id + '_actionStatusSelectFieldValidator'}
                            options={this.props.codeList.action_status && this.props.codeList.action_status.map((item) => ({ value: item.code, label: item.engDesc }))}
                            // value={prescriptionData && prescriptionData.ddlActionStatus}
                            value={prescriptionData.ddlActionStatus}
                            name={'ddlActionStatus'}
                            onChange={e => this.props.onSelectedItem(e, 'ddlActionStatus')}
                            // validators={[ValidatorEnum.required]}
                            // errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            // validatorListener={(...arg) => this.props.validatorListener(...arg, index,'Strength', 'Action Status')}
                            notShowMsg
                        />
                    </Grid>
                    <Grid item xs={2} container>
                        <Typography component={'div'} style={{ width: '35px', padding: '4px' }}>
                            <label className={panelClasses.inGridTitleLabel}>
                                Site:
                            </label>
                        </Typography>
                        <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                            <SelectFieldValidator
                                isDisabled={!this.props.sitesCodeList || this.props.sitesCodeList.length === 0}
                                fullWidth
                                id={id + '_SiteSelectFieldValidator'}
                                value={prescriptionData && prescriptionData.ddlSite}
                                name={'ddlSite'}
                                options={this.props.sitesCodeList.map((item) => (
                                    { value: item.siteId, label: item.siteEng }))
                                }
                                onChange={e => this.props.handleChangeSite(e, 'ddlSite')}
                                inputProps={{
                                    maxLength: 255
                                }}
                                labelProps={{
                                    style: { minWidth: '50px', paddingLeft: '8px' }
                                }}
                                menuIsOpen={this.props.openSiteComponent}
                                onMenuOpen={() => this.props.toggleSiteComponent(true)}
                                onMenuClose={() => this.props.toggleSiteComponent(false)}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={3} container>
                        <Grid item xs={5}>
                            <TextFieldValidator
                                fullWidth
                                id={id + '_qtyTextFieldValidator'}
                                labelText={'Qty:'}
                                variant={'outlined'}
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
                                type={'number'}//20191009 Define the text field for number only by Louis Chen
                            />
                        </Grid>
                        <Grid item xs={7}>
                            <SelectFieldValidator
                                id={id + '_qtyUnitSelectFieldValidator'}
                                options={this.props.codeList.base_unit && this.props.codeList.base_unit.map((item) => ({ value: item.code, label: item.engDesc }))}
                                value={prescriptionData && prescriptionData.ddlQtyUnit}
                                name={'ddlQtyUnit'}
                                onChange={e => this.props.onSelectedItem(e, 'ddlQtyUnit')}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container spacing={1} style={{ marginBottom: '5px' }}>
                    <Grid item xs={9}>
                        <TextFieldValidator
                            fullWidth
                            id={id + '_specInstTextFieldValidator'}
                            variant={'outlined'}
                            labelText={'Special Inst:'}
                            labelPosition={'left'}
                            value={prescriptionData && prescriptionData.txtSpecInst}
                            name={'txtSpecInst'}
                            trim={'all'}
                            onChange={e => this.props.handleChange(e)}
                            inputProps={{
                                maxLength: 125
                            }}
                            labelProps={{
                                style: { minWidth: '110px', paddingLeft: '8px', textAlign: 'right' }
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = () => {
    return {
        //codeList: state.prescription.codeList
        //codeList: state.moe.codeList
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FreeTextPanelField);