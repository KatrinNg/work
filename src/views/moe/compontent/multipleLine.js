import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Grid,
    Typography,
    IconButton
} from '@material-ui/core';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import minPic from '../../../images/moe/elbow-end-minus-lg2.gif';
import plusPic from '../../../images/moe/elbow-end-plus-lg2.gif';
import FrequencyDialog from './dialog/frequencyDialog';
import DelayInput from '../../compontent/delayInput';
import { PANEL_FIELD_NAME } from '../../../enums/moe/moeEnums';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

class MultipulLine extends Component {

    render() {

        const { lineId, prescriptionData, isFreeText, id, mulDosesItem } = this.props;
        const freqId = id + '_freqSelectFieldValidator';
        return (
            <Grid container spacing={1}>
                {isFreeText ?
                    <Grid item container xs={4} justify="flex-end">
                        <Grid item xs={5} container spacing={0}>
                            <DelayInput
                                fullWidth
                                value={mulDosesItem.txtDosage}
                                name={'txtDosage'}
                                labelText="and Dosage:"
                                isRequired
                                labelPosition="left"
                                id={id + '_dosageTextFieldValidator'}
                                // variant={'outlined'}
                                onChange={e => this.props.handleMultipleChange(e, lineId)}
                                validators={mulDosesItem.prescribeUnit == null || mulDosesItem.prescribeUnit == '' ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'multipleLine' + lineId + '_dosage')}
                                notShowMsg
                                trim={'all'}
                                style={{
                                    paddingLeft: '0px',
                                    paddingRight: '0px',
                                    marginLeft: '-2px'
                                }}
                                inputProps={{
                                    maxLength: 20
                                }}
                                isSmallSize
                                labelProps={{
                                    style: { minWidth: '108px', paddingRight: '0px', textAlign: 'right' }
                                }}
                                type={'decimal'}//20191025 Define the text field for decimal only by Louis Chen
                                // disabled={prescriptionData && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                disabled={prescriptionData && !prescriptionData.txtDosageModu}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <label style={{ width: '100%', paddingLeft: '5px', wordBreak: 'break-word' }}>
                                {prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                            </label>
                        </Grid>
                    </Grid>
                    :
                    <Grid item container xs={2}>
                        <Grid item xs={9}>
                            <DelayInput
                                fullWidth
                                value={(mulDosesItem && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')) ? null : mulDosesItem.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                name={'txtDosage'}
                                labelText="and Dosage:"
                                labelPosition="left"
                                id={id + '_dosageTextFieldValidator'}
                                // variant={'outlined'}
                                onChange={e => this.props.handleMultipleChange(e, lineId)}
                                isRequired
                                validators={(mulDosesItem && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')) ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'multipleLine' + lineId + '_dosage')}
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
                                disabled={mulDosesItem && (prescriptionData.prescribeUnit == null || prescriptionData.prescribeUnit == '')}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Typography style={{ width: '100%', paddingLeft: '5px', lineHeight: '28px' }}>
                                {prescriptionData && (prescriptionData.txtDosageModu ? prescriptionData.txtDosageModu : prescriptionData.prescribeUnit)}
                            </Typography>
                        </Grid>
                    </Grid>
                }
                <Grid item xs={2} container>
                    <Typography component={'div'} style={{ width: '35px', padding: '4px', paddingLeft: isFreeText ? '4px' : '0px' }}>
                        <Typography className={this.props.panelClasses.inGridTitleLabel}>
                            Freq:<RequiredIcon />
                        </Typography>
                    </Typography>
                    <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                        <SelectFieldValidator
                            id={freqId}
                            options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                if (item.useInputValue === 'Y' && mulDosesItem.ddlFreq === item.code && mulDosesItem.freq1) {
                                    let freq1 = mulDosesItem.freq1;
                                    let flagIndex = item.engDesc.indexOf('_');
                                    let desc = item.engDesc.slice(0, flagIndex + 1) + freq1 + item.engDesc.slice(flagIndex + 1);
                                    return ({ ...item, value: item.code, label: desc });
                                }
                                return ({ ...item, value: item.code, label: item.engDesc });
                            }
                            )}
                            value={mulDosesItem.ddlFreq}
                            name={'ddlFreq'}
                            onChange={e => this.props.onMultipleSelectedItem(e, lineId, 'ddlFreq')}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Freq', 'multipleLine' + lineId + '_freqSelectFieldValidator')}
                            notShowMsg
                            inputProps={{
                                maxLength: 40
                            }}
                            isSmallSize={!isFreeText}
                            onFocus={
                                () => this.props.logOldData(
                                    PANEL_FIELD_NAME.FREQ,
                                    document.getElementById(freqId + '_control').getAttribute('value')
                                )
                            }
                            onBlur={!isFreeText ? () => this.props.handleOnBlurChange('ddlFreq', lineId) : ''}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={isFreeText ? 3 : 5}></Grid>
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
                                id={id + '_dangerousDrugTextField'}
                                variant={'outlined'}
                                value={mulDosesItem.txtDangerDrugQty}
                                name={'txtDangerDrugQty'}
                                onChange={e => this.props.handleMultipleChange(e, lineId)}
                                validators={[ValidatorEnum.isPositiveIntegerWithoutZero, ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity', 'multipleLine' + lineId + '_dangerousDrugTextField')}
                                notShowMsg
                                trim={'all'}
                                inputProps={{
                                    maxLength: 4
                                }}
                                onFocus={!isFreeText ? () => this.props.handleFocusDose(mulDosesItem, lineId) : ''}
                                onBlur={() => this.props.handleChangeDose(lineId, mulDosesItem.txtDangerDrugQty)}
                                type={'number'}//20191009 Define the text field for number only by Louis Chen
                            />
                        </Typography>
                        <Typography component="div" style={{ lineHeight: '28px' }}>
                            dose)
                        </Typography>
                    </Grid>
                    :
                    <Grid item container xs={2}></Grid>
                }

                <Grid item xs={1} container justify={'flex-end'}>
                    <Grid item xs={3}>
                        <IconButton style={{ padding: '0px' }}
                            id={id + '_deleteIconButton'}
                            // onClick={() => this.props.handleDeleteMultipleLine(lineId)}
                            onClick={() => this.props.handleDeleteMulDosesRow(lineId)}
                        >
                            <img src={minPic} alt={''} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={3}>
                        {prescriptionData.moeMedMultDoses
                            && prescriptionData.moeMedMultDoses.length === lineId + 1
                            && prescriptionData.moeMedMultDoses.length < 8 ?
                            <IconButton style={{ padding: '0px' }}
                                id={id + '_addIconButton'}
                                // onClick={this.props.handleAddMultipleLine}
                                onClick={this.props.handleAddMulDoses}
                            >
                                <img src={plusPic} alt={''} />
                            </IconButton>
                            :
                            null
                        }
                    </Grid>
                </Grid>
                <FrequencyDialog
                    id={id + '_FrequencyDialog'}
                    frequency={mulDosesItem.frequencyItem}
                    dialogTitle={'Frequency'}
                    handleChange={(e) => this.props.updateOrderLineField(e, lineId, 'freq1', 'M')}
                    name={'freq1'}
                    freqValue={mulDosesItem.freq1}
                    codeList={mulDosesItem.freqCodeList}
                    okClick={(name, value) => this.props.closeMultipleFrequencyDialog(name, value, lineId)}
                />
            </Grid >
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

export default connect(mapStateToProps, mapDispatchToProps)(MultipulLine);