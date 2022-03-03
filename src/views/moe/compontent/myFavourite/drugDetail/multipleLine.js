import React, { Component } from 'react';
import {
    Grid,
    Typography,
    IconButton
} from '@material-ui/core';
import { connect } from 'react-redux';
//import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../../../constants/commonMessage';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import minPic from '../../../../../images/moe/elbow-end-minus-lg2.gif';
import plusPic from '../../../../../images/moe/elbow-end-plus-lg2.gif';
import FrequencyDialog from '../../dialog/frequencyDialog';
import DelayInput from '../../../../compontent/delayInput';
import {
    updateField
} from '../../../../../store/actions/moe/myFavourite/myFavouriteAction';
import { PANEL_FIELD_NAME } from '../../../../../enums/moe/moeEnums';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

class MultipulLine extends Component {
    // handleDeleteMultipleLine = (index) => {
    //     if (!this.props.curDrugDetail) return;
    //     if (!this.props.curDrugDetail.multipleLine) return;

    //     let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
    //     prescriptionData.multipleLine.splice(index, 1);

    //     if (prescriptionData.multipleLine.length === 1)
    //         prescriptionData.multipleLine = [];

    //     if (prescriptionData.multipleLine.length === 0) {
    //         this.props.showAdvanced(true, true);
    //     }
    //     this.props.updateField({
    //         curDrugDetail: prescriptionData
    //     });
    // }
    // handleAddMultipleLine = (multDoseNo) => {
    //     let curDrugDetail = _.cloneDeep(this.props.curDrugDetail);
    //     if (!curDrugDetail) return;
    //     if (!curDrugDetail.multipleLine)
    //         curDrugDetail.multipleLine = [];
    //     if (curDrugDetail.multipleLine.length > 8) return;

    //     // if (this.props.curDrugDetail.dangerDrug === 'Y' && index >= 1) index += 1;

    //     let arryMulti = {
    //         multDoseNo: multDoseNo + 1,
    //         txtDosage: '',
    //         ddlFreq: '',
    //         // freq1: 0,
    //         frequencyItem: '',
    //         txtDangerDrugQty: ''
    //     };
    //     curDrugDetail.multipleLine.push(arryMulti);
    //     this.props.updateField({
    //         curDrugDetail: curDrugDetail
    //     });
    // }
    render() {
        const { id, curDrugDetail } = this.props;
        console.log(curDrugDetail);
        return (<div>
            {curDrugDetail
                && curDrugDetail.moeMedMultDoses
                && curDrugDetail.moeMedMultDoses.map((item, i) => {
                    if (/*curDrugDetail.dangerDrug === 'Y' &&*/ i === 0) {
                        return null;
                    } else {
                        const freqId = id + '_' + i + '_freqSelectFieldValidator';
                        return (
                            <Grid container spacing={1} key={i}>
                                <Grid item container xs={2}>
                                    <Grid item xs={9}>
                                        <DelayInput
                                            fullWidth
                                            value={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? null : item.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                            name={'txtDosage'}
                                            labelText="and Dosage:"
                                            labelPosition="left"
                                            id={id + '_' + i + '_dosageTextFieldValidator'}
                                            // variant={'outlined'}
                                            onChange={e => this.props.handleMultipleChange(e, i)}
                                            isRequired
                                            validators={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_DECIMALFIELD()]}
                                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Dosage', 'multipleLine' + i + '_dosage')}
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
                                                if (ele.useInputValue === 'Y'
                                                    && item.ddlFreq === ele.code
                                                    && item.freq1) {
                                                    let freq1 = item.freq1;
                                                    let flagIndex = ele.engDesc.indexOf('_');
                                                    let desc = ele.engDesc.slice(0, flagIndex + 1) + freq1 + ele.engDesc.slice(flagIndex + 1);
                                                    return ({ ...item, value: ele.code, label: desc });
                                                }
                                                return ({ ...item, value: ele.code, label: ele.engDesc });
                                            }
                                            )}
                                            value={item.ddlFreq}
                                            name={'ddlFreq'}
                                            onChange={e => this.props.onMultipleSelectedItem(e, i, 'ddlFreq')}
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                            validatorListener={(...arg) => this.props.validatorListener(...arg, 'Freq', 'multipleLine' + i + '_freqSelectFieldValidator')}
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
                                <Grid item xs={5}></Grid>
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
                                                validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity', 'multipleLine' + i + '_dangerousDrugTextField')}
                                                notShowMsg
                                                trim={'all'}
                                                inputProps={{
                                                    maxLength: 4
                                                }}
                                                //onBlur={() => this.props.handleChangeDose(lineId)}
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
                                <Grid item xs={2}></Grid>
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
                                                // onClick={() => this.handleAddMultipleLine(item.multDoseNo)}
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
                                    handleChange={(e) => this.props.updateOrderLineField(e, i, 'freq1', 'M')}
                                    name={'freq1'}
                                    freqValue={curDrugDetail.moeMedMultDoses[i] && curDrugDetail.moeMedMultDoses[i].freq1}
                                    codeList={curDrugDetail.moeMedMultDoses[i] && curDrugDetail.moeMedMultDoses[i].freqCodeList}
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

export default connect(mapStateToProps, mapDispatchToProps)(MultipulLine);