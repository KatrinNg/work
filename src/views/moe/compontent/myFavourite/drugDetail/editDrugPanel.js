import React, { Component } from 'react';
import {
    Grid,
    Typography,
    FormControlLabel,
    IconButton
} from '@material-ui/core';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CIMSCheckbox from '../../../../../components/CheckBox/CIMSCheckBox';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../../../components/FormValidator/TextFieldValidator';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import DelayInput from '../../../../compontent/delayInput';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { PANEL_FIELD_NAME } from '../../../../../enums/moe/moeEnums';
import CommonMessage from '../../../../../constants/commonMessage';
import * as deptFavUtilities from '../../../../../utilities/prescriptionUtilities';
import MultipleLine from './multipleLine';
import StepUpDown from './stepUpDown';
import minPic from '../../../../../images/moe/elbow-end-minus-lg2.gif';
import {
    updateField
} from '../../../../../store/actions/moe/myFavourite/myFavouriteAction';
import _ from 'lodash';
import * as moeUtilities from '../../../../../utilities/moe/moeUtilities';
import moment from 'moment';

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


function initRouteCodeList(drug, codeList) {
    let routeCodeList = [];
    if (!drug) return routeCodeList;
    if (drug.ddlRoute) {
        const routeOption = codeList.route.find(item => item.routeId == drug.ddlRoute);
        routeCodeList = [
            { ...routeOption, code: drug.ddlRoute, engDesc: drug.routeEng },
            { code: 'others', engDesc: 'others...' }
        ];
    } else if (codeList && codeList.route && codeList.route[0]) {
        routeCodeList = codeList.route;
    }
    return routeCodeList;
}

class EditDrugPanel extends Component {
    state = {
        //site
        openSiteComponent: null,
        sitesCodeList: deptFavUtilities.getSiteCodeListByRoute(this.props.curDrugDetail, this.props.codeList),
        //route
        routeCodeList: initRouteCodeList(this.props.curDrugDetail, this.props.codeList),
        openRouteComponent: null
    }
    onMultipleSelectedItem = (e, index, name) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        const freqCodeList = deptFavUtilities.getFreqCodeList(e.label);
        if (prescriptionData.moeMedMultDoses[index][name] == e.value) return;
        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                if (prescriptionData.moeMedMultDoses[index]
                    && prescriptionData.moeMedMultDoses[index].freq1
                    && prescriptionData.moeMedMultDoses[index].freq1 !== freqValue
                    && prescriptionData.moeMedMultDoses[index].ddlFreq === e.value) {
                    freqValue = prescriptionData.moeMedMultDoses[index].freq1;
                } else if (freqCodeList && freqCodeList[0])
                    freqValue = freqCodeList[0].code;
                prescriptionData.moeMedMultDoses[index].frequencyItem = { open: true, value: e.value, label: e.label };
                prescriptionData.moeMedMultDoses[index].freqCodeList = freqCodeList;
            }
            prescriptionData.moeMedMultDoses[index].freq1 = freqValue;
            prescriptionData.moeMedMultDoses[index].freqId = e.freqId;

            if (this.props.showStepUpDown) {
                moeUtilities.autoSetDurationByFreq(
                    prescriptionData.moeMedMultDoses[index],
                    e,
                    this.props.codeList.duration_unit,
                    prescriptionData.orderLineType);
            }
        }
        prescriptionData.moeMedMultDoses[index][name] = e.value;

        // if (this.props.showMultipleLine) {
        //     if (prescriptionData.multipleLine[index][name] == e.value) return;
        //     if (name === 'ddlFreq') {
        //         let freqValue = 0;
        //         if (e.useInputValue === 'Y') {
        //             if (prescriptionData.multipleLine[index]
        //                 && prescriptionData.multipleLine[index].freq1
        //                 && prescriptionData.multipleLine[index].freq1 !== freqValue
        //                 && prescriptionData.multipleLine[index].ddlFreq === e.value) {
        //                 freqValue = prescriptionData.multipleLine[index].freq1;
        //             } else if (freqCodeList && freqCodeList[0])
        //                 freqValue = freqCodeList[0].code;
        //             prescriptionData.multipleLine[index].frequencyItem = { open: true, value: e.value, label: e.label };
        //             prescriptionData.multipleLine[index].freqCodeList = freqCodeList;
        //         }
        //         prescriptionData.multipleLine[index].freq1 = freqValue;
        //         prescriptionData.multipleLine[index].freqId = e.freqId;
        //     }
        //     prescriptionData.multipleLine[index][name] = e.value;
        // }
        // else if (this.props.showStepUpDown) {
        //     if (prescriptionData.stepUpDown[index][name] == e.value) return;
        //     if (name === 'ddlFreq') {
        //         let freqValue = 0;
        //         if (e.useInputValue === 'Y') {
        //             if (prescriptionData.stepUpDown[index] && prescriptionData.stepUpDown[index].freq1 && prescriptionData.stepUpDown[index].freq1 !== freqValue && prescriptionData.stepUpDown[index].ddlFreq === e.value) {
        //                 freqValue = prescriptionData.stepUpDown[index].freq1;
        //             } else if (freqCodeList && freqCodeList[0])
        //                 freqValue = freqCodeList[0].code;
        //             prescriptionData.stepUpDown[index].frequencyItem = { open: true, value: e.value, label: e.label };
        //             prescriptionData.stepUpDown[index].freqCodeList = freqCodeList;
        //         }
        //         prescriptionData.stepUpDown[index].freq1 = freqValue;
        //         prescriptionData.stepUpDown[index].freqId = e.freqId;
        //         //auto set duration by freq
        //         moeUtilities.autoSetDurationByFreq(
        //             prescriptionData.stepUpDown[index],
        //             e,
        //             this.props.codeList.duration_unit,
        //             prescriptionData.orderLineType);
        //     }
        //     prescriptionData.stepUpDown[index][name] = e.value;
        // }
        prescriptionData.txtQty = '';
        this.props.updateField({
            showProceedBtn: null,
            curDrugDetail: prescriptionData
        });
        //this.resetProceedBtn();
    }
    handleMultipleChange = (e, index) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        let name = e.target.name;

        if ((prescriptionData.moeMedMultDoses[index][name] || '') == e.target.value) return;
        prescriptionData.moeMedMultDoses[index][name] = e.target.value;

        // if (this.props.showMultipleLine) {
        //     if ((prescriptionData.multipleLine[index][name] || '') == e.target.value) return;
        //     prescriptionData.multipleLine[index][name] = e.target.value;
        // }
        // else if (this.props.showStepUpDown) {
        //     if ((prescriptionData.stepUpDown[index][name] || '') == e.target.value) return;
        //     prescriptionData.stepUpDown[index][name] = e.target.value;
        // }
        prescriptionData.txtQty = '';
        this.props.updateField({
            showProceedBtn: null,
            curDrugDetail: prescriptionData
        });
    }
    // eslint-disable-next-line react/sort-comp
    handleChangeSite = (e, name, filterList) => {
        let value = e.value;
        //const allRouteCodeList = this.props.codeList.route;
        let { sitesCodeList } = { ...this.state };
        const { curDrugDetail } = this.props;
        let prescriptionData = _.cloneDeep(curDrugDetail);
        if (name === 'ddlSite' && value === 'others') {
            sitesCodeList = this.props.codeList.site;
            this.setState({
                sitesCodeList: sitesCodeList,
                openSiteComponent: true
            });
            return;
        }

        if (name === 'ddlRoute') {
            //change route code list start
            if (value === 'others') {
                this.setState({
                    routeCodeList: this.props.codeList && this.props.codeList.route,
                    openRouteComponent: true
                });
                return;
            }
            //change route code list end

            prescriptionData.routeEng = e.label;

            //reset ddlSite value when change dllRoute
            if (value !== prescriptionData.ddlRoute) {
                prescriptionData.ddlSite = 0;
                //this.onSelectedItem({ value: 0 }, 'ddlSite');
            }

            //site code list
            let curRouteCodeList = this.props.codeList.route.find(i => i.code === value);
            if (curRouteCodeList) {
                sitesCodeList = _.cloneDeep(curRouteCodeList.sites);
                const isExitOthers = sitesCodeList.find(item => item.siteId === 'others');
                if (!isExitOthers && sitesCodeList.length !== 0)
                    sitesCodeList.push({ siteId: 'others', siteEng: 'others' });
            }
            this.onUpdateRouteOption(e, filterList);
        }
        if (prescriptionData[name] != e.value)
            prescriptionData.txtQty = '';

        prescriptionData[name] = value;
        this.props.updateField({
            curDrugDetail: prescriptionData
        });
        // this.props.onSelectedItem(e, name);
        this.setState({
            sitesCodeList
        });
    }
    toggleSiteComponent = (open) => {
        this.setState({
            openSiteComponent: open
        }, () => {
            console.log('openSiteComponent', open);
        });
    }
    toggleRouteComponent = (isOpen) => {
        this.setState({
            openRouteComponent: isOpen
        });
    }
    onSelectedDate = (e, name) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (moment(prescriptionData[name]).isSame(e)) return;
        prescriptionData[name] = e;
        if (name != 'txtStartFrom')
            prescriptionData.txtQty = '';
        this.props.updateField({
            curDrugDetail: prescriptionData,
            showProceedBtn: null
        });
        // this.resetProceedBtn();
    }
    handelCheckboxChange = (e) => {
        const name = e.target.name;
        let cbValue = 'N';
        if (e.target.checked) {
            cbValue = 'Y';
        }
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (prescriptionData[name] == cbValue) return;
        prescriptionData[name] = cbValue;
        if (name != 'chkPRN') {
            prescriptionData.txtQty = '';
        }
        moeUtilities.updateMultDoseFirstRow(prescriptionData, name, e.value);
        this.props.updateField({
            curDrugDetail: prescriptionData,
            showProceedBtn: null
        });
    }
    handleSpecialIntervalChange = (e) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (prescriptionData.specialInterval[e.target.name] == e.target.value) return;
        prescriptionData.specialInterval[e.target.name] = e.target.value;
        prescriptionData.txtQty = '';
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    onUpdateRouteOption = (curOption, filterList) => {
        if (!filterList || filterList.length == 0) return;
        let routeCodeList = _.cloneDeep(this.state.routeCodeList);
        if (!routeCodeList || routeCodeList.length == 0) return;
        for (let i = 0; i < routeCodeList.length; i++) {
            if (routeCodeList[i].code != curOption.value) continue;
            if (routeCodeList[i].hadFilterAbbreviation) continue;
            const filterInput = filterList.find(m => m == routeCodeList[i].routeOtherName);
            if (filterInput)
                routeCodeList[i].hadFilterAbbreviation = true;
        }
        this.setState({
            routeCodeList: routeCodeList
        });
    }

    render() {
        const { panelClasses, id, curDrugDetail } = this.props;
        let isShowAdvanced = curDrugDetail && curDrugDetail.isShowAdvanced;
        // const durationUnitList = this.props.codeList.duration_unit.filter(item => {
        //     let regimen = (curDrugDetail && curDrugDetail.specialInterval && curDrugDetail.specialInterval.regimen) || 'd';
        //     if (item.code === 'd' || item.code === 'w' || item.code === regimen.toLowerCase())
        //         return { value: item.code, label: item.engDesc };
        //     return null;
        // });
        const durationUnitList = moeUtilities.getDurationUnitCodeList(
            curDrugDetail,
            this.props.codeList.duration_unit,
            this.props.codeList.freq_code,
            curDrugDetail.orderLineType
        );

        const durationUnitId = id + '_durationUnitSelectFieldValidator';
        const freqId = id + '_freqSelectFieldValidator';
        const siteId = id + '_SiteSelectFieldValidator';
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid id={id + '_inputArea'} style={{ paddingTop: 10 }}>
                    <Grid container spacing={1}>
                        <Grid item container xs={2}>
                            <Grid item xs={9}>
                                <DelayInput
                                    fullWidth
                                    value={(curDrugDetail && (curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '')) ? null : curDrugDetail.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                    name={'txtDosage'}
                                    labelText="Dosage:"
                                    labelPosition="left"
                                    isRequired={!(curDrugDetail && (curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == ''))}
                                    id={id + '_dosageTextFieldValidator'}
                                    onChange={e => this.props.handleChange(e)}
                                    validators={(curDrugDetail && (curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '')) ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
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
                                    type={'decimal'}
                                    disabled={curDrugDetail && (curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '')}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
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
                                <Typography component="div" className={panelClasses.inGridTitleLabel}>
                                    Freq:<RequiredIcon />
                                </Typography>
                            </Typography>
                            <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                                <SelectFieldValidator
                                    id={freqId}
                                    options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                        if (item.useInputValue === 'Y' && curDrugDetail && curDrugDetail.ddlFreq === item.code && curDrugDetail.freq1) {
                                            let freq1 = curDrugDetail.freq1;
                                            let flagIndex = item.engDesc.indexOf('_');
                                            let desc = item.engDesc.slice(0, flagIndex + 1) + freq1 + item.engDesc.slice(flagIndex + 1);
                                            return ({ ...item, value: item.code, label: desc });
                                        }
                                        return ({ ...item, value: item.code, label: item.engDesc });
                                    }
                                    )}
                                    value={curDrugDetail && curDrugDetail.ddlFreq}
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
                                    onBlur={() => this.props.handleOnBlurChange('', true)}
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
                                        checked={curDrugDetail && curDrugDetail.chkPRN === 'Y'}
                                        onChange={e => this.handelCheckboxChange(e)}
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
                                    options={this.state.routeCodeList.map(item => ({ ...item, value: item.code, label: item.engDesc }))}
                                    value={curDrugDetail && curDrugDetail.ddlRoute}
                                    name={'ddlRoute'}
                                    onChange={(e, filterList) => this.handleChangeSite(e, 'ddlRoute', filterList)}
                                    validators={[ValidatorEnum.required]}
                                    menuIsOpen={this.state.openRouteComponent}
                                    onMenuOpen={() => this.toggleRouteComponent(true)}
                                    onMenuClose={() => this.toggleRouteComponent(false)}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    validatorListener={(...arg) => this.props.validatorListener(...arg, 'Route')}
                                    notShowMsg
                                    isSmallSize
                                    onFocus={() => this.props.logOldData(
                                        PANEL_FIELD_NAME.SITE,
                                        document.getElementById(siteId + '_control') ? document.getElementById(siteId + '_control').getAttribute('value') : ''
                                    )} //[Site] will effect dose, not [Route]
                                    onBlur={() => this.props.handleOnBlurChange('', false)}
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
                                    labelPosition={'left'}
                                    value={curDrugDetail && curDrugDetail.txtDuration}
                                    name={'txtDuration'}
                                    onChange={e => this.props.handleChange(e)}
                                    validators={[ValidatorEnum.isPositiveIntegerWithoutZero]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO()]}
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
                                    onBlur={() => this.props.handleOnBlurChange('', true)}
                                    type={'number'}//20191009 Define the text field for number only by Louis Chen
                                />
                            </Grid>
                            <Grid item xs={7}>
                                <SelectFieldValidator
                                    id={durationUnitId}
                                    options={durationUnitList && durationUnitList.map((item) =>
                                        ({ value: item.code, label: item.engDesc })
                                    )}
                                    value={curDrugDetail && curDrugDetail.ddlDurationUnit}
                                    name={'ddlDurationUnit'}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlDurationUnit')}
                                    // validators={[ValidatorEnum.required]}
                                    // errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    // validatorListener={(...arg) => this.props.validatorListener(...arg, 'For', 'Duration Unit')}
                                    notShowMsg
                                    isSmallSize
                                    onFocus={
                                        () => this.props.logOldData(
                                            PANEL_FIELD_NAME.DURATION_UNIT,
                                            document.getElementById(durationUnitId + '_control').getAttribute('value')
                                        )
                                    }
                                    onBlur={() => this.props.handleOnBlurChange('', true)}
                                    isDisabled={curDrugDetail && curDrugDetail.specialInterval && curDrugDetail.specialInterval.regimen ? true : false}
                                />
                            </Grid>
                        </Grid>
                        {curDrugDetail && curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y' ?
                            // <Grid item container xs={2}>
                            //     <Typography component="div" style={{ lineHeight: '28px' }}>
                            //         (
                            //     </Typography>
                            //     <Typography
                            //         component="div"
                            //         style={{
                            //             width: '48%',
                            //             marginRight: '3px',
                            //             marginLeft: '3px'
                            //         }}
                            //     >
                            //         <TextFieldValidator
                            //             id={id + '_original_dangerousDrugTextField'}
                            //             variant={'outlined'}
                            //             value={curDrugDetail && curDrugDetail.txtDangerDrugQty}
                            //             name={'txtDangerDrugQty'}
                            //             onChange={e => this.props.handleChange(e)}
                            //             validators={[ValidatorEnum.isPositiveIntegerWithoutZero, ValidatorEnum.required]}
                            //             errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            //             validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity')}
                            //             notShowMsg
                            //             trim={'all'}
                            //             inputProps={{
                            //                 maxLength: 4
                            //             }}
                            //             isSmallSize
                            //             //onBlur={() => this.props.handleChangeDose()}
                            //             type={'number'}//20191009 Define the text field for number only by Louis Chen
                            //         />
                            //     </Typography>
                            //     <Typography component="div" style={{ lineHeight: '28px' }}>
                            //         dose)
                            //     </Typography>
                            // </Grid>
                            null
                            :
                            isShowAdvanced ?
                                null
                                :
                                <Grid item container xs={2}>
                                    <Grid item xs={6}>
                                        <DelayInput
                                            fullWidth
                                            id={id + '_qtyTextFieldValidator'}
                                            variant={'outlined'}
                                            labelText="Qty:"
                                            labelPosition={'left'}
                                            value={curDrugDetail && curDrugDetail.txtQty}
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
                                        {curDrugDetail && curDrugDetail.ddlQtyUnit && deptFavUtilities.getSelectValue(this.props.codeList.base_unit, curDrugDetail.ddlQtyUnit)}
                                    </Typography>
                                </Grid>

                        }
                    </Grid>
                    {this.props.showMultipleLine &&
                        <MultipleLine
                            id={id + '_multipleLine'}
                            panelClasses={panelClasses}
                            handleMultipleChange={this.handleMultipleChange}
                            onMultipleSelectedItem={this.onMultipleSelectedItem}
                            validatorListener={this.props.validatorListener}
                            closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                            updateOrderLineField={this.props.updateOrderLineField}
                            handleOnBlurChange={this.props.handleOnBlurChange}
                            handleChangeDose={this.props.handleChangeDose}
                            showAdvanced={this.props.showAdvanced}
                            logOldData={this.props.logOldData}

                            handleAddMulDoses={this.props.handleAddMulDoses}
                            handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                        />
                    }
                    {this.props.showStepUpDown &&
                        <StepUpDown
                            id={id + '_stepUpDown'}
                            panelClasses={panelClasses}
                            handleMultipleChange={this.handleMultipleChange}
                            onMultipleSelectedItem={this.onMultipleSelectedItem}
                            validatorListener={this.props.validatorListener}
                            closeMultipleFrequencyDialog={this.props.closeMultipleFrequencyDialog}
                            updateOrderLineField={this.props.updateOrderLineField}
                            handleOnBlurChange={this.props.handleOnBlurChange}
                            handleChangeDose={this.props.handleChangeDose}
                            showAdvanced={this.props.showAdvanced}
                            logOldData={this.props.logOldData}

                            handleAddMulDoses={this.props.handleAddMulDoses}
                            handleDeleteMulDosesRow={this.props.handleDeleteMulDosesRow}
                        />

                    }
                    {curDrugDetail && curDrugDetail.specialInterval ?
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
                                            //value={this.getSpecTitle(curDrugDetail).inputText1}
                                            value={curDrugDetail
                                                && curDrugDetail.specialInterval
                                                && curDrugDetail.specialInterval.supFreqText
                                                && curDrugDetail.specialInterval.supFreqText.length > 0 ?
                                                curDrugDetail.specialInterval.supFreqText[0] : ''}
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
                            {curDrugDetail.specialInterval.regimen === 'D'
                                && (curDrugDetail.specialInterval.supplFreqId === 2) ?
                                <Typography component="div">
                                    <Grid container spacing={1}>
                                        <Grid item container xs={2}>
                                            <Grid item xs={9}>
                                                <DelayInput
                                                    fullWidth
                                                    value={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? null : curDrugDetail.specialInterval.txtDosage}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
                                                    name={'txtDosage'}
                                                    labelText="and Dosage:"
                                                    isRequired
                                                    labelPosition="left"
                                                    id={id + '_specialInterval_dosage'}
                                                    variant={'outlined'}
                                                    onChange={e => this.handleSpecialIntervalChange(e)}
                                                    validators={curDrugDetail.prescribeUnit == null || curDrugDetail.prescribeUnit == '' ? [] : [ValidatorEnum.required, 'isDecimal']}//20191227 disable the dosage field for the drugs are ointment by Louis Chen
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
                                                <Typography component="div" className={this.props.panelClasses.inGridTitleLabel}>
                                                    Freq:<RequiredIcon />
                                                </Typography>
                                            </Typography>
                                            <Grid item xs={9} style={{ paddingLeft: '8px' }}>
                                                <SelectFieldValidator
                                                    id={id + '_specialInterval_Freq'}
                                                    options={this.props.codeList.freq_code && this.props.codeList.freq_code.map((item) => {
                                                        if (item.useInputValue === 'Y' && curDrugDetail && curDrugDetail.specialInterval.ddlFreq === item.code && curDrugDetail.specialInterval.freq1) {
                                                            let freq1 = curDrugDetail.specialInterval.freq1;
                                                            let flagIndex = item.engDesc.indexOf('_');
                                                            let desc = item.engDesc.slice(0, flagIndex + 1) + freq1 + item.engDesc.slice(flagIndex + 1);
                                                            return ({ ...item, value: item.code, label: desc });
                                                        }
                                                        return ({ ...item, value: item.code, label: item.engDesc });
                                                    }
                                                    )}
                                                    value={curDrugDetail && curDrugDetail.specialInterval && curDrugDetail.specialInterval.ddlFreq}
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
                                                    onBlur={() => this.props.handleOnBlurChange('', false)}
                                                />
                                            </Grid>
                                        </Grid>
                                        {curDrugDetail && curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y' ?
                                            <Grid item xs={5}></Grid> : null}
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
                                                        id={id + '_specialInterval_dangerousDrugTextField'}
                                                        variant={'outlined'}
                                                        value={curDrugDetail && curDrugDetail.specialInterval.txtDangerDrugQty}
                                                        name={'txtDangerDrugQty'}
                                                        onChange={e => this.handleSpecialIntervalChange(e)}
                                                        validators={[ValidatorEnum.isPositiveIntegerWithoutZero, ValidatorEnum.required]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                        validatorListener={(...arg) => this.props.validatorListener(...arg, 'Quantity', 'specialInterval_Quantity')}
                                                        notShowMsg
                                                        trim={'all'}
                                                        inputProps={{
                                                            maxLength: 4
                                                        }}
                                                        isSmallSize
                                                        onBlur={() => this.props.handleChangeDose(1)}
                                                        type={'number'}//20191009 Define the text field for number only by Louis Chen
                                                    />
                                                </Typography>
                                                <Typography component="div" style={{ lineHeight: '28px' }}>
                                                    dose)
                                                </Typography>
                                            </Grid>
                                            : null} */}
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
                                                    //value={this.getSpecTitle(curDrugDetail).inputText2}
                                                    value={curDrugDetail && curDrugDetail.specialInterval && curDrugDetail.specialInterval.supFreqText && curDrugDetail.specialInterval.supFreqText[1]}
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
                                    value={curDrugDetail && curDrugDetail.ddlPrep}
                                    name={'ddlPrep'}
                                    disabled={curDrugDetail.ddlPrepCodeList && false}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlPrep')}
                                    options={curDrugDetail.ddlPrepCodeList && curDrugDetail.ddlPrepCodeList.map((item) => ({ value: item.strength, label: item.strength }))}
                                    isSmallSize
                                    addNullOption={curDrugDetail.strengthCompulsory != 'Y'}
                                    isDisabled={!curDrugDetail.ddlPrepCodeList || curDrugDetail.ddlPrepCodeList.length === 0}//20191009 Disable the selector when not item to select by Louis Chen
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <SelectFieldValidator
                                    id={id + '_actionStatusSelectFieldValidator'}
                                    options={this.props.codeList.action_status && this.props.codeList.action_status.map((item) => ({ value: item.code, label: item.engDesc }))}
                                    value={curDrugDetail.ddlActionStatus ? curDrugDetail.ddlActionStatus : 'Y'}
                                    name={'ddlActionStatus'}
                                    onChange={e => this.props.onSelectedItem(e, 'ddlActionStatus')}
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
                                        isDisabled={!this.state.sitesCodeList || this.state.sitesCodeList.length === 0}
                                        fullWidth
                                        id={siteId}
                                        value={curDrugDetail && curDrugDetail.ddlSite}
                                        name={'ddlSite'}
                                        onChange={e => this.handleChangeSite(e, 'ddlSite')}
                                        // options={[{ value: '1', label: 'affected' }]}
                                        options={this.state.sitesCodeList.map((item) => (
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
                                        onBlur={() => this.props.handleOnBlurChange()}
                                        menuIsOpen={this.state.openSiteComponent}
                                        onMenuOpen={() => this.toggleSiteComponent(true)}
                                        onMenuClose={() => this.toggleSiteComponent(false)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={3}>
                                <DateFieldValidator
                                    labelText="Start From: "
                                    id={id + '_startFromDateFieldValidator'}
                                    labelPosition={'left'}
                                    value={curDrugDetail.txtStartFrom}
                                    name={'txtStartFrom'}
                                    labelProps={{
                                        style: { minWidth: '80px' }
                                    }}
                                    isSmallSize
                                    onChange={e => this.onSelectedDate(e, 'txtStartFrom')}
                                />
                            </Grid>
                            {curDrugDetail
                                && curDrugDetail.dangerDrug
                                && curDrugDetail.dangerDrug === 'N' ?
                                <Grid container item xs={2}>
                                    <Grid item xs={6}>
                                        <DelayInput
                                            fullWidth
                                            id={id + '_qtyTextFieldValidator'}
                                            variant={'outlined'}
                                            labelText="Qty:"
                                            labelPosition={'left'}
                                            value={curDrugDetail && curDrugDetail.txtQty}
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
                                            {curDrugDetail.ddlQtyUnit && deptFavUtilities.getSelectValue(this.props.codeList.base_unit, curDrugDetail.ddlQtyUnit)}
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
                                value={curDrugDetail && curDrugDetail.txtSpecInst}
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
        curDrugDetail: state.moeMyFavourite.curDrugDetail,
        showProceedBtn: state.moeMyFavourite.showProceedBtn,
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    updateField
};
export default connect(mapStateToProps, mapDispatchToProps)(EditDrugPanel);