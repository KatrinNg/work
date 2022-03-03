import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Grid,
    Typography,
    IconButton,
    FormControlLabel
} from '@material-ui/core';
import TextFieldValidator from '../../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../../../constants/commonMessage';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { PANEL_FIELD_NAME } from '../../../../../enums/moe/moeEnums';
import minPic from '../../../../../images/moe/elbow-end-minus-lg2.gif';
import plusPic from '../../../../../images/moe/elbow-end-plus-lg2.gif';
import FrequencyDialog from '../../dialog/frequencyDialog';
import DelayInput from '../../../../compontent/delayInput';
import CIMSCheckbox from '../../../../../components/CheckBox/CIMSCheckBox';
import {
    updateField
} from '../../../../../store/actions/moe/myFavourite/myFavouriteAction';
import _ from 'lodash';
import * as moeUtilities from '../../../../../utilities/moe/moeUtilities';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

class StepUpDown extends Component {
    // shouldComponentUpdate(nextProps) {
    //     if ((nextProps.curDrugDetail || nextProps.curDrugDetail.moeMedMultDoses)
    //         !== (!this.props.curDrugDetail || this.props.curDrugDetail.moeMedMultDoses))
    //         return true;
    // }
    handelMultipleCheckboxChange = (e, index) => {
        let cbValue = 'N';
        if (e.target.checked) {
            cbValue = 'Y';
        }
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        prescriptionData.moeMedMultDoses[index][e.target.name] = cbValue;

        this.props.updateField({
            curDrugDetail: prescriptionData
        });
    }
    // handleAddStepUpDown = (multDoseNo) => {
    //     let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
    //     if (!prescriptionData) return;
    //     if (!prescriptionData.stepUpDown)
    //         prescriptionData.stepUpDown = [];

    //     if (prescriptionData.stepUpDown.length > 8) return;
    //     // if (this.props.curDrugDetail.dangerDrug === 'Y' && index >= 1) index += 1;
    //     let arryMulti = {
    //         multDoseNo: multDoseNo + 1,
    //         txtDosage: '',
    //         ddlFreq: '',
    //         chkPRN: 'N',
    //         txtDuration: '',
    //         ddlDurationUnit: '',
    //         // freq1: 0,
    //         frequencyItem: '',
    //         txtDangerDrugQty: ''
    //     };
    //     prescriptionData.stepUpDown.push(arryMulti);
    //     this.props.updateField({
    //         curDrugDetail: prescriptionData
    //     });
    // }
    // handleDeleteMultipleLine = (index) => {
    //     if (!this.props.curDrugDetail) return;
    //     if (!this.props.curDrugDetail.stepUpDown) return;

    //     let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
    //     prescriptionData.stepUpDown.splice(index, 1);

    //     if (prescriptionData.stepUpDown.length === 1)
    //         prescriptionData.stepUpDown = [];

    //     if (prescriptionData.stepUpDown.length === 0) {
    //         this.props.showAdvanced(true, true);
    //     }
    //     this.props.updateField({
    //         curDrugDetail: prescriptionData
    //     });
    // }

    render() {
        const { curDrugDetail, id } = this.props;
        // const durationUnitList = this.props.codeList.duration_unit.filter(item => {
        //     if (item.code === 'd' || item.code === 'w')
        //         return { value: item.code, label: item.engDesc };
        //     return null;
        // });

        return (
            <div>
                {curDrugDetail
                    && curDrugDetail.moeMedMultDoses
                    && curDrugDetail.moeMedMultDoses.map((item, i) => {
                        if (i === 0) {
                            return null;
                        } else {
                            const freqId = id + '_' + i + '_freqSelectFieldValidator';
                            const durationUnitId = id + '_' + i + '_durationUnitSelectFieldValidator';
                            const durationUnitList = moeUtilities.getDurationUnitCodeList(
                                item,
                                this.props.codeList.duration_unit,
                                this.props.codeList.freq_code,
                                curDrugDetail.orderLineType
                            );
                            return (
                                <Grid container spacing={1} key={i}>
                                    <Grid item container xs={2}>
                                        <Grid item xs={9}>
                                            <DelayInput
                                                fullWidth
                                                value={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? null : item.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                name={'txtDosage'}
                                                labelText="then Dosage:"
                                                labelPosition="left"
                                                id={id + '_' + i + '_dosageTextFieldValidator'}
                                                // variant={'outlined'}
                                                onChange={e => this.props.handleMultipleChange(e, i)}
                                                isRequired
                                                validators={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                trim={'all'}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'stepUpDown' + i + '_dosage')}
                                                notShowMsg
                                                inputProps={{
                                                    maxLength: 20
                                                }}
                                                isSmallSize
                                                labelProps={{
                                                    style: { minWidth: '98px', paddingLeft: '6px', paddingRight: '0px', textAlign: 'right' }
                                                }}
                                                type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                                disabled={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == ''}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography style={{ width: '100%', paddingLeft: '5px', lineHeight: '28px' }}>
                                                {curDrugDetail && (curDrugDetail.txtDosageModu ? curDrugDetail.txtDosageModu : curDrugDetail.prescribeUnit)}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={2} container>
                                        <Typography component={'div'} style={{ width: '35px', padding: '4px', paddingLeft: '0px' }}>
                                            <Typography className={this.props.panelClasses.inGridTitleLabel}>
                                                Freq:<RequiredIcon />
                                            </Typography>
                                        </Typography>
                                        <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                                            <SelectFieldValidator
                                                id={freqId}
                                                options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((ele) => {
                                                    if (ele.useInputValue === 'Y' && item.ddlFreq === ele.code && item.freq1) {
                                                        let freq1 = item.freq1;
                                                        let flagIndex = ele.engDesc.indexOf('_');
                                                        let desc = ele.engDesc.slice(0, flagIndex + 1) + freq1 + ele.engDesc.slice(flagIndex + 1);
                                                        return ({ ...ele, value: ele.code, label: desc });
                                                    }
                                                    return ({ ...ele, value: ele.code, label: ele.engDesc });
                                                }
                                                )}
                                                value={item.ddlFreq}
                                                name={'ddlFreq'}
                                                onChange={e => this.props.onMultipleSelectedItem(e, i, 'ddlFreq')}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Freq', 'stepUpDown' + i + '_freq')}
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
                                                onBlur={() => this.props.handleOnBlurChange(i)}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <FormControlLabel
                                            control={
                                                <CIMSCheckbox
                                                    id={id + '_' + i + '_PRNCheckBox'}
                                                    value={'PRN'}
                                                    name={'chkPRN'}
                                                    checked={item.chkPRN === 'Y'}
                                                    onChange={e => this.handelMultipleCheckboxChange(e, i)}
                                                />
                                            }
                                            classes={{
                                                root: this.props.panelClasses.radioBtn
                                            }}
                                            label={'PRN'}
                                        />
                                    </Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item container xs={2}>
                                        <Grid item xs={5}>
                                            <TextFieldValidator
                                                fullWidth
                                                id={id + '_' + i + '_durationTextFieldValidator'}
                                                variant={'outlined'}
                                                labelText={'For:'}
                                                labelPosition={'left'}
                                                value={item.txtDuration}
                                                name={'txtDuration'}
                                                trim={'all'}
                                                onChange={e => this.props.handleMultipleChange(e, i)}
                                                validators={[ValidatorEnum.isPositiveIntegerWithoutZero]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO()]}
                                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'For', 'stepUpDown' + i + 'duration')}
                                                notShowMsg
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
                                                onBlur={() => this.props.handleOnBlurChange(i)}
                                                type={'number'}//20191009 Define the text field for number only by Louis Chen
                                            />
                                        </Grid>
                                        <Grid item xs={7}>
                                            <SelectFieldValidator
                                                id={durationUnitId}
                                                key={durationUnitId + '_' + item.ddlDurationUnit}
                                                options={durationUnitList && durationUnitList.map((ele) => ({ value: ele.code, label: ele.engDesc }))}
                                                value={item.ddlDurationUnit}
                                                name={'ddlDurationUnit'}
                                                onChange={e => this.props.onMultipleSelectedItem(e, i, 'ddlDurationUnit')}
                                                // validators={[ValidatorEnum.required]}
                                                // errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                // validatorListener={(...arg) => this.props.validatorListener(...arg, 'For', 'stepUpDown' + i + '_durationUnit')}
                                                notShowMsg
                                                isSmallSize
                                                onFocus={
                                                    () => this.props.logOldData(
                                                        PANEL_FIELD_NAME.DURATION_UNIT,
                                                        document.getElementById(durationUnitId + '_control').getAttribute('value')
                                                    )
                                                }
                                                onBlur={() => this.props.handleOnBlurChange(i)}
                                            />
                                        </Grid>
                                    </Grid>
                                    {/* {curDrugDetail && curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y' ?
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
                                                    id={id + '_' + i + '_dangerousDrugTextField'}
                                                    variant={'outlined'}
                                                    value={item.txtDangerDrugQty}
                                                    name={'txtDangerDrugQty'}
                                                    onChange={e => this.props.handleMultipleChange(e, i)}
                                                    validators={[ValidatorEnum.isPositiveInteger, ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity', 'stepUpDown' + i + '_dangerousDrugTextField')}
                                                    notShowMsg
                                                    trim={'all'}
                                                    inputProps={{
                                                        maxLength: 4
                                                    }}
                                                    //onBlur={!isFreeText ? () => this.props.handleChangeDose(lineId) : ''}
                                                    type={'number'}//20191009 Define the text field for number only by Louis Chen
                                                />
                                            </Typography>
                                            <Typography component="div" style={{ lineHeight: '28px' }}>
                                                dose)
                                        </Typography>
                                        </Grid>
                                        :
                                        <Grid item container xs={2}></Grid>
                                    } */}
                                    <Grid item container xs={2}></Grid>
                                    <Grid item xs={1} container justify={'flex-end'}>
                                        <Grid item xs={3}>
                                            <IconButton style={{ padding: '0px' }}
                                                id={id + '_' + i + '_deleteIconButton'}
                                                // onClick={() => this.handleDeleteMultipleLine(i)}
                                                onClick={() => this.props.handleDeleteMulDosesRow(i)}
                                            >
                                                <img src={minPic} alt={''} />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs={3}>
                                            {curDrugDetail.moeMedMultDoses
                                                && curDrugDetail.moeMedMultDoses.length === i + 1
                                                && curDrugDetail.moeMedMultDoses.length < 8 ?
                                                <IconButton style={{ padding: '0px' }}
                                                    id={id + '_' + i + '_addIconButton'}
                                                    // onClick={() => this.handleAddStepUpDown(item.multDoseNo)}
                                                    onClick={() => this.props.handleAddMulDoses(curDrugDetail.orderLineType, item.multDoseNo)}
                                                >
                                                    <img src={plusPic} alt={''} />
                                                </IconButton>
                                                :
                                                null
                                            }
                                        </Grid>
                                    </Grid>

                                    <FrequencyDialog
                                        id={id + '_' + i + '_FrequencyDialog'}
                                        frequency={item.frequencyItem}
                                        dialogTitle={'Frequency'}
                                        handleChange={(e) => this.props.updateOrderLineField(e, i, 'freq1', 'S')}
                                        name={'freq1'}
                                        freqValue={item.freq1}
                                        codeList={item.freqCodeList}
                                        okClick={(name, value) => this.props.closeMultipleFrequencyDialog(name, value, i)}
                                    />
                                </Grid >
                            );
                        }
                    })
                }
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        curDrugDetail: state.moeMyFavourite.curDrugDetail,
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    updateField
};

export default connect(mapStateToProps, mapDispatchToProps)(StepUpDown);