import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../../constants/commonMessage';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import _ from 'lodash';
import {
    ORDER_LINE_TYPE,
    DURATION_UNIT
} from '../../../../enums/moe/moeEnums';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';

function initDurationUnit(originalUnit) {
    switch (originalUnit) {
        case DURATION_UNIT.DAY:
            return originalUnit;
        case DURATION_UNIT.WEEK:
            return originalUnit;
        default: {
            // return DURATION_UNIT.DAY;
            return moeUtilities.getHospSetting().defaultDurationUnit;
        }
    }
}

function initDuration(drug, drugList) {
    let item = {};
    if (drug) {
        item = _.cloneDeep(drug);
        // if (item.orderLineType !== ORDER_LINE_TYPE.NORMAL) {
        let newDrugList = _.cloneDeep(drugList);
        let firstAdvanceDrug;
        for (let i = 0; i < newDrugList.length; i++) {
            if (newDrugList[i].orderLineType === ORDER_LINE_TYPE.NORMAL) {
                firstAdvanceDrug = newDrugList[i];
                break;
            }
        }
        if (firstAdvanceDrug) {
            item.txtDuration = firstAdvanceDrug.txtDuration;
            item.ddlDurationUnit = initDurationUnit(firstAdvanceDrug.ddlDurationUnit);
        }
        // }
    } else {
        item.ddlDurationUnit = initDurationUnit();
    }
    return item;
}

const style = {
    clearOverFlowY: {
        overflowY: 'unset'
    }
};
class DurationDialog extends React.Component {
    constructor(props) {
        super(props);
        // let item = initDuration(this.props.drug, this.props.drugList);
        this.state = {
            item: initDuration(this.props.drug, this.props.drugList)
        };
    }
    handleChange = (e, name) => {
        let { item } = this.state;
        if (!item) item = {};
        let fieldName = name, value;
        if (name) {
            //ddlDurationUnit
            value = e.value;
        } else {
            //txtDuration
            fieldName = e.target.name;
            value = e.target.value;
        }
        item[fieldName] = value;
        this.setState({
            item
        });
    }
    handleSubmit = () => {
        const { item } = this.state;
        let newDrugList = _.cloneDeep(this.props.drugList);
        // newDrugList = newDrugList.filter(ele => {
        //     if (ele.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
        //         || ele.dangerDrug === 'Y'
        //         // || ele.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL
        //     )
        //         return null;
        //     if (ele.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        //         if ((item.ddlDurationUnit === DURATION_UNIT.DAY || item.ddlDurationUnit === DURATION_UNIT.WEEK) &&
        //             (ele.ddlDurationUnit === DURATION_UNIT.DAY || ele.ddlDurationUnit === DURATION_UNIT.WEEK)) {
        //             ele.txtDuration = item.txtDuration;
        //             ele.ddlDurationUnit = item.ddlDurationUnit;
        //             return ele;
        //         } else {
        //             return null;
        //         }
        //     }
        //     ele.txtDuration = item.txtDuration;
        //     ele.ddlDurationUnit = item.ddlDurationUnit;
        //     return ele;
        // });
        // this.props.minQuantityCheckAll(newDrugList);
        this.props.maxDurationChecking(newDrugList, item);
        //this.props.confirmDrug(newDrugList);
        this.props.closeDurationDialog();
    }
    render() {
        const { id, open, classes, codeList } = this.props;
        const { item } = this.state;

        let durationUnitList = codeList.duration_unit && codeList.duration_unit.filter(_item =>
            _item.durationUnit === DURATION_UNIT.WEEK || _item.durationUnit === DURATION_UNIT.DAY);
        return (
            <CIMSDialog
                open={open}
                classes={{
                    paper: classes.clearOverFlowY
                }}
                id={id}
            >
                <ValidatorForm id={id + '_form'} ref={'form'} onSubmit={() => this.handleSubmit()} style={{ maxWidth: 500 }}>
                    <DialogContent
                        classes={{
                            root: classes.clearOverFlowY
                        }}
                    >
                        <Grid container style={{ marginBottom: 30 }}>
                            <Grid item xs={3}>
                                <TextFieldValidator
                                    fullWidth
                                    id={id + '_txtDurationTextFieldValidator'}
                                    variant={'outlined'}
                                    labelText={'For:'}
                                    labelPosition="left"
                                    isRequired
                                    value={item && item.txtDuration}
                                    name={'txtDuration'}
                                    onChange={e => this.handleChange(e)}
                                    validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                    notShowMsg
                                    inputProps={{
                                        maxLength: 3
                                    }}
                                    labelProps={{
                                        style: { minWidth: '50px' }
                                    }}
                                    trim={'all'}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <SelectFieldValidator
                                    id={id + '_ddlDurationUnitSelectFieldValidator'}
                                    options={durationUnitList && durationUnitList.map((_item) => ({ value: _item.code, label: _item.engDesc }))}
                                    value={item && item.ddlDurationUnit && item.ddlDurationUnit}
                                    name={'ddlDurationUnit'}
                                    onChange={e => this.handleChange(e, 'ddlDurationUnit')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    notShowMsg
                                />
                            </Grid>
                        </Grid>
                        <Typography variant={'body2'} id={id + '_durationRemarkTypography'}>
                            <i>Duration will be applied to ALL medications, except Step Up / Step Down / Special Interval / Dangerous Drug regimens.</i>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <CIMSButton
                            id={id + '_btnOkCIMSButton'}
                            type={'submit'}
                        >OK</CIMSButton>
                        <CIMSButton
                            id={id + '_btnCancelCIMSButton'}
                            type={'button'}
                            onClick={this.props.closeDurationDialog}
                        >Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            </CIMSDialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        codeList: state.moe.codeList,
        drugList: state.moe.drugList
    };
};
const mapDispatchToProps = {

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(DurationDialog));