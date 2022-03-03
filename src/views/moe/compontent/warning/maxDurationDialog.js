import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    Typography
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { getTotalDangerDrug } from '../../../../store/actions/moe/moeAction';
import {
    ORDER_LINE_TYPE,
    DURATION_UNIT
} from '../../../../enums/moe/moeEnums';
import _ from 'lodash';
// import * as moeUtilities from '../../../../utilities/moe/moeUtilities';

const styles = {
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    }
};

class MaxDurationDialog extends React.Component {
    state = {
        data: _.cloneDeep(this.props.data),
        index: 0
    }
    onApply = (event) => {
        //lineIndex 1,2,3...
        //itemIndex 0,1,2,3...
        //index 0,1,2,3...
        let data = this.state.data;
        let itemLines = this.getAllItemLines(data);
        let index = this.state.index;
        let itemIndex = itemLines[index].itemIndex;
        let lineIndex = itemLines[index].lineIndex;
        let maxDuration = itemLines[index].maxDuration;
        let orderLineType = itemLines[index].orderLineType;
        let maxDurationIndex = itemLines[index].maxDurationIndex;
        let txtDuration = maxDuration;
        let ddlDurationUnit = DURATION_UNIT.DAY;
        // let ddlDurationUnit = moeUtilities.getHospSetting().defaultDurationUnit;
        const allDurationDto = data.allDurationDto;

        let item = data.saveData[itemIndex];

        // if (allDurationDto) {
        //     item = moeUtilities.editAllDuration(item, allDurationDto);
        //     this.setState({ index: index + 1, data: data }, () => {
        //         if (index === itemLines.length - 1) {
        //             if (typeof (event.onSave) === 'function') {
        //                 event.onSave(data.saveData);
        //             }
        //         }
        //     });
        //     return;
        // }

        if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            let drugItem;
            if (allDurationDto) {
                drugItem = data.maxDurationData[maxDurationIndex];
            } else {
                drugItem = data.maxDurationData[itemIndex];
            }
            txtDuration = maxDuration / drugItem.unit;
            ddlDurationUnit = item.ddlDurationUnit;
        }
        let dangerParam = {};
        let startIndex = 1;
        // let startIndex = 0;
        // if (item.dangerDrug === 'Y') startIndex = 1;
        if (lineIndex === 1) {
            item.txtDuration = txtDuration;
            item.ddlDurationUnit = ddlDurationUnit;
            dangerParam = this.getDangerParam(1, item);
        } else {
            // let startIndex = 0;
            // if (item.dangerDrug === 'Y') startIndex = 1;
            if (item.multipleLine && item.multipleLine.length > 0) {
                let otherRow = item.multipleLine[lineIndex - 2 + startIndex];
                otherRow.txtDuration = txtDuration;
                otherRow.ddlDurationUnit = ddlDurationUnit;
                dangerParam = this.getDangerParam(1, otherRow);
            } else if (item.stepUpDown && item.stepUpDown.length > 0) {
                let otherRow = item.stepUpDown[lineIndex - 2 + startIndex];
                otherRow.txtDuration = txtDuration;
                otherRow.ddlDurationUnit = ddlDurationUnit;
                dangerParam = this.getDangerParam(1, otherRow);
            }
        }
        if (item.dangerDrug === 'Y') {
            this.props.getTotalDangerDrug(dangerParam, () => {
                let maxDosage = this.props.maxDosage && this.props.maxDosage[0].maxDosage;
                let specialDosage2 = this.props.maxDosage && this.props.maxDosage.length > 1 && this.props.maxDosage[1].maxDosage;
                if (lineIndex === 1) {
                    item.txtDangerDrugQty = maxDosage;
                    if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
                        for (let i = 0; i < item.multipleLine.length; i++) {
                            this.props.maxDosage.map((dosageItem) => {
                                if (dosageItem.multDoseNo === 1 && dosageItem.multDoseNo === item.multipleLine[i].multDoseNo) {
                                    item.txtDangerDrugQty = dosageItem.maxDosage;
                                    item.multipleLine[i].txtDangerDrugQty = dosageItem.maxDosage;
                                } else if (dosageItem.multDoseNo === item.multipleLine[i].multDoseNo) {
                                    item.multipleLine[i].txtDangerDrugQty = dosageItem.maxDosage;
                                }
                            });
                        }
                    }
                    if (specialDosage2 && orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) item.specialInterval.txtDangerDrugQty = specialDosage2;
                } else {
                    if (item.multipleLine && item.multipleLine.length > 0) {
                        item.multipleLine[lineIndex - 2 + startIndex].txtDangerDrugQty = maxDosage;
                    } else if (item.stepUpDown && item.stepUpDown.length > 0) {
                        item.stepUpDown[lineIndex - 2 + startIndex].txtDangerDrugQty = maxDosage;
                    }
                }

                this.setState({ index: index + 1, data: data }, () => {
                    if (index === itemLines.length - 1) {
                        if (typeof (event.onSave) === 'function') {
                            event.onSave(data.saveData);
                        }
                    }
                });
            });
        } else {
            this.setState({ index: index + 1, data: data }, () => {
                if (index === itemLines.length - 1) {
                    if (typeof (event.onSave) === 'function') {
                        event.onSave(data.saveData);
                    }
                }
            });
        }
    }

    onIgnore = (event) => {
        let data = this.state.data;
        let itemLines = this.getAllItemLines(data);
        let index = this.state.index;
        const allDurationDto = data.allDurationDto;

        if (allDurationDto) {
            const itemIndex = itemLines[index].itemIndex;
            const maxDurationIndex = itemLines[index].maxDurationIndex;
            const orderLineType = itemLines[index].orderLineType;
            let item = data.saveData[itemIndex];
            if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                //duration unit conversion
                let drugItem = data.maxDurationData[maxDurationIndex];
                if (item.ddlDurationUnit === DURATION_UNIT.DAY && allDurationDto.ddlDurationUnit === DURATION_UNIT.WEEK) {
                    item.txtDuration = allDurationDto.txtDuration * drugItem.allDurationUnit;
                } else if (item.ddlDurationUnit === DURATION_UNIT.WEEK && allDurationDto.ddlDurationUnit === DURATION_UNIT.DAY) {
                    item.txtDuration = allDurationDto.txtDuration / drugItem.unit;
                } else {
                    item.txtDuration = allDurationDto.txtDuration;
                }
            } else {
                item.txtDuration = allDurationDto.txtDuration;
                item.ddlDurationUnit = allDurationDto.ddlDurationUnit;
                // item = moeUtilities.editAllDuration(item, allDurationDto);
            }
            data.saveData[itemIndex] = item;
        }
        this.setState({ index: index + 1, data: data }, () => {
            if (index === itemLines.length - 1) {
                if (typeof (event.onSave) === 'function') {
                    event.onSave(data.saveData);
                }
            }
        });
    }

    getDangerParam = (index, data) => {

        let params = {
            duration: data.txtDuration,
            durationUnit: data.ddlDurationUnit,
            freq1: data.freq1,
            freqCode: data.ddlFreq,
            moeEhrMedProfile: {
                orderLineType: data.orderLineType || ORDER_LINE_TYPE.NORMAL,
                siteId: data.ddlSite || null
            },
            moeMedMultDoses: [{
                multDoseNo: index,
                duration: data.txtDuration,
                durationUnit: data.ddlDurationUnit,
                freq1: data.freq1,
                freqCode: data.ddlFreq
            }]
        };

        if (data.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL && data.dangerDrug === 'Y') {
            params = {
                duration: data.txtDuration,
                durationUnit: data.ddlDurationUnit,
                freq1: data.freq1,
                freqCode: data.ddlFreq,
                supFreqCode: data.specialInterval.supFreqCode,
                supplFreqId: data.specialInterval.supplFreqId,
                supFreq1: data.specialInterval.supFreq1,
                supFreq2: data.specialInterval.supFreq2,
                regimen: data.specialInterval.regimen,
                dayOfWeek: data.specialInterval.dayOfWeek || null,
                moeEhrMedProfile: {
                    orderLineType: data.orderLineType || ORDER_LINE_TYPE.SPECIAL_INTERVAL,
                    siteId: data.ddlSite || null,
                    supplFreqId: data.specialInterval.supplFreqId,
                    cycleMultiplier: data.specialInterval.cycleMultiplier
                },
                moeMedMultDoses: [
                    {
                        freq1: data.freq1,
                        freqCode: data.ddlFreq,
                        multDoseNo: 1,
                        moeEhrMedMultDose: {
                            supplFreqId: data.specialInterval.supplFreqId
                        }

                    },
                    {
                        freq1: data.specialInterval.freq1,
                        freqCode: data.specialInterval.ddlFreq,
                        multDoseNo: 2,
                        moeEhrMedMultDose: {
                            supplFreqId: data.specialInterval.supplFreqId
                        }
                    }
                ]
            };
        }
        else if (data.dangerDrug === 'Y' && data.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
            let arryMultDose = [];
            for (let i = 0; i < data.multipleLine.length; i++) {
                let item = data.multipleLine[i];
                if (i === 0 && data.ddlFreq) {
                    arryMultDose.push({
                        multDoseNo: 1,
                        duration: data.txtDuration,
                        durationUnit: data.ddlDurationUnit,
                        freq1: data.freq1,
                        freqCode: data.ddlFreq
                    });
                } else if (i !== 0 && item.ddlFreq) {
                    arryMultDose.push({
                        multDoseNo: item.multDoseNo,
                        duration: data.txtDuration,
                        durationUnit: data.ddlDurationUnit,
                        freq1: item.freq1,
                        freqCode: item.ddlFreq
                    });
                } else {
                    break;
                }
            }
            params.moeMedMultDoses = arryMultDose;
        }

        return params;
    }

    getAllItemLines = (data) => {
        let dataLines = [];
        for (let i = 0; i < data.maxDurationData.length; i++) {
            let drugItem = data.maxDurationData[i];
            for (let j = 0; j < drugItem.rowNums.length; j++) {
                let item = {};
                item.maxDuration = drugItem.maxDuration;
                item.drugName = drugItem.drugName;
                item.itemIndex = drugItem.itemIndex;
                item.maxDurationIndex = i;
                item.lineIndex = drugItem.rowNums[j];
                item.orderLineType = drugItem.orderLineType;
                if (drugItem.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                    //item.lineMessage = 'in line' + item.lineIndex;
                    item.lineMessage = item.lineIndex;
                }
                item.displayApplyButton = true;
                let drugData = drugItem.drugData;
                if (drugData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                    let cyclicMultipler = drugItem.unit;
                    if (drugData.specialInterval && drugData.specialInterval.regimen === 'C') {
                        cyclicMultipler = drugData.specialInterval.cycleMultiplier;
                    }
                    if (item.maxDuration % cyclicMultipler !== 0) {
                        item.displayApplyButton = false;
                    }
                }

                // if (drugItem.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
                //     || (drugItem.orderLineType !== ORDER_LINE_TYPE.STEP_UP_AND_DOWN && dataLines.length === 0)
                //     || drugData.dangerDrug === 'Y') {
                dataLines.push(item);
                // }
            }
        }
        return dataLines;
    }

    render() {
        const { classes, id, data, open } = this.props;
        let allItems = this.getAllItemLines(data);
        let curItem = (allItems && allItems[this.state.index]) || {};
        if (!curItem.displayApplyButton) curItem.displayApplyButton = 0;
        else curItem.displayApplyButton = 1;
        return (
            <CIMSDialog
                id={id + '_CIMSDialog'}
                open={open}
                dialogTitle={'Question'}
                classes={{
                    paper: classes.fullWidth
                }}
            >
                <DialogContent>
                    <Typography component="div">
                        This suggested duration of <font color={'red'}>{curItem.drugName}</font> is {curItem.maxDuration} days. Apply the suggested duration
                        {curItem.lineMessage ? <span> in line<font color={'red'}> {curItem.lineMessage} </font></span> : ''}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <CIMSButton display={curItem.displayApplyButton} id={id + '_ApplyCIMSButton'} onClick={() => { this.onApply(data); }}>Apply suggested duration</CIMSButton>
                    <CIMSButton id={id + '_IgnoreCIMSButton'} onClick={() => { this.onIgnore(data); }}>Ignore suggested duration</CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );

    }
}
const mapStateToProps = (state) => {
    return {
        maxDosage: state.moe.maxDosage,
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    getTotalDangerDrug
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MaxDurationDialog));