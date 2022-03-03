import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
  Typography,
  Grid,
  Button,
  Radio,
  FormControlLabel
} from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import TextFieldValidator from '../../../../../components/FormValidator/TextFieldValidator';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import _ from 'lodash';
//import DelayInput from '../../compontent/delayInput';
import CommonRegex from '../../../../../constants/commonRegex';
import CIMSCheckbox from '../../../../../components/CheckBox/CIMSCheckBox';
import {specialStyles as styles} from '../../../../moe/moeStyles';

function contentProps(index, value) {
  return {
    id: `specailIntervalTab_${index}`,
    style: { display: value === index ? 'block' : 'none', width: '100%', height: '100%' }
  };
}

class SpecialInterval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specialIntervalData: _.cloneDeep(this.props.specialIntervalData),
      validWeekOfDay: true,
      ValidMonthlyFromToDay: false,
      ValidCycleFromToDay: false
    };
  }

  componentDidMount() {
    ValidatorForm.addValidationRule('FromToDay', () => {
      if (this.state.specialIntervalData.regimen) {
        if (this.state.specialIntervalData.regimen === 'M' || this.state.specialIntervalData.regimen === 'C') {
          // if (!this.props.specialIntervalData.supFreq1 || !this.props.specialIntervalData.supFreq2)
          //   return false;
          return parseInt(this.state.specialIntervalData.supFreq1) <= parseInt(this.state.specialIntervalData.supFreq2);
        }
        return true;
      }
      return false;
    });
    ValidatorForm.addValidationRule('EachCycle', (value) => {
      const specialIntervalData = { ...this.state.specialIntervalData };
      const codeList = this.props.codeList;
      value = parseInt(value);
      if (specialIntervalData.supplFreqId && specialIntervalData.regimen === 'C') {
        if (specialIntervalData.supplFreqId === 40) {
          return !(value < parseInt(codeList.regimen_type[0]['C'][0].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][0].upperLimit) < value);
        } else if (specialIntervalData.supplFreqId === 19) {
          return !(value < parseInt(codeList.regimen_type[0]['C'][1].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][1].upperLimit) < value);
        } else if (specialIntervalData.supplFreqId === 20) {
          return !(value < parseInt(codeList.regimen_type[0]['C'][2].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][2].upperLimit) < value);
        } else {
          return !(value < parseInt(codeList.regimen_type[0]['C'][0].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][0].upperLimit) < value);
        }
      } else {
        return true;
      }
    });
  }

  componentUnmount() {
    ValidatorForm.removeValidationRule('FromToDay');
    ValidatorForm.removeValidationRule('EachCycle');
  }
  handleSpecInterRadioChange = (e, tabType) => {
    this.resetValidator();
    let specialIntervalData = { ...this.state.specialIntervalData };
    specialIntervalData.regimen = tabType;
    if (specialIntervalData.supplFreqId !== parseInt(e.target.value)) {
      specialIntervalData.supplFreqId = parseInt(e.target.value);
      specialIntervalData.supFreq1 = '';
      specialIntervalData.supFreq2 = '';
    }
    specialIntervalData.supFreqCode = '';
    specialIntervalData.dayOfWeek = '';
    specialIntervalData.supFreqText = [];
    specialIntervalData.txtDosage = '';
    specialIntervalData.ddlFreq = '';
    specialIntervalData.freqText = '';
    specialIntervalData.freq1 = '';
    specialIntervalData.txtDangerDrugQty = '';
    this.setState({
      specialIntervalData
    });
  }

  specailIntervalValidatorListener(isValid, msg, id, regimen, textBoxId, isError) {
    const validObj = document.getElementById(id);
    if (!isValid) {
      validObj.style.color = 'red';
    } else {
      if (!isError) {
        validObj.style.color = '#404040';
      }
    }
  }
  handleSelectDayOfWeek = (e) => {
    if (e.target.checked) {
      this.resetValidator();
    }
    let specialIntervalData = { ...this.state.specialIntervalData };
    let weekDayCodeList = [
      { code: 'm', engDesc: 'Monday' },
      { code: 't', engDesc: 'Tuesday' },
      { code: 'w', engDesc: 'Wednesday' },
      { code: 'th', engDesc: 'Thursday' },
      { code: 'f', engDesc: 'Friday' },
      { code: 'sa', engDesc: 'Saturday' },
      { code: 'su', engDesc: 'Sunday' }
    ];
    let dayOfWeek = specialIntervalData.dayOfWeek;
    dayOfWeek = dayOfWeek ? dayOfWeek : '0000000';
    for (let i = 0; i < weekDayCodeList.length; i++) {
      if (weekDayCodeList[i].code === e.target.value) {
        let arryDayOfWeek = dayOfWeek.split('');
        arryDayOfWeek.splice(i, 1, dayOfWeek[i] === '1' ? '0' : '1');
        arryDayOfWeek = arryDayOfWeek.join('');
        dayOfWeek = arryDayOfWeek;
      }
    }
    specialIntervalData.regimen = 'W';
    specialIntervalData.supplFreqId = 21;
    specialIntervalData.dayOfWeek = dayOfWeek;
    specialIntervalData.supFreq1 = '';
    specialIntervalData.supFreq2 = '';
    specialIntervalData.txtDosage = '';
    specialIntervalData.ddlFreq = '';
    specialIntervalData.freqText = '';
    specialIntervalData.freq1 = '';
    this.setState({
      specialIntervalData
    });
  }
  handleBtnOk = () => {
    let { specialIntervalData, ValidMonthlyFromToDay, ValidCycleFromToDay } = this.state;
    if (specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 21 && !specialIntervalData.dayOfWeek) {
      this.setState({
        validWeekOfDay: false
      });
    } else if (ValidMonthlyFromToDay || ValidCycleFromToDay) {
      return false;
    } else {
      this.props.handleSpecialIntervalConfirm(specialIntervalData);
    }
  }

  resetFontColor = () => {
    let idArray = [
      'evrydays',
      'daysPerWeek',
      'everyWeeks',
      'daysPerMonth',
      'monthlyFromToDay',
      'everyMonths',
      'eachCycle',
      'onDayOfTheCycle',
      'daysPerCycle',
      'cycleFromToDay'
    ];
    idArray.filter(function (ele) {
      let eleId = document.getElementById(ele);
      eleId.style.color = '#404040';
      return ele;
    });
  }

  resetValidator = () => {
    this.setState({
      validWeekOfDay: true,
      ValidMonthlyFromToDay: false,
      ValidCycleFromToDay: false
    });
    this.refs.specialform.resetValidations();
    this.resetFontColor();
  }

  handleOnChangeFromToDay = (supplFreqId, e, regimen, fromToDay) => {
    let eleId = null;
    if (regimen === 'M') {
      eleId = document.getElementById('monthlyFromToDay');
    } else {
      eleId = document.getElementById('cycleFromToDay');
    }
    if (fromToDay === 'FD') {
      if (this.state.specialIntervalData.supFreq2 && (parseInt(e.target.value) > parseInt(this.state.specialIntervalData.supFreq2))) {
        eleId.style.color = 'red';
        if (regimen === 'M') {
          this.setState({
            ValidMonthlyFromToDay: true,
            ValidCycleFromToDay: false
          });
        } else {
          this.setState({
            ValidCycleFromToDay: true,
            ValidMonthlyFromToDay: false
          });
        }
      } else {
        eleId.style.color = '#404040';
        this.setState({
          ValidMonthlyFromToDay: false,
          ValidCycleFromToDay: false
        });
      }
    }
    if (fromToDay === 'TD') {
      if (this.state.specialIntervalData.supFreq1 && (parseInt(e.target.value) < parseInt(this.state.specialIntervalData.supFreq1))) {
        eleId.style.color = 'red';
        if (regimen === 'M') {
          this.setState({
            ValidMonthlyFromToDay: true,
            ValidCycleFromToDay: false
          });
        } else {
          this.setState({
            ValidCycleFromToDay: true,
            ValidMonthlyFromToDay: false
          });
        }
      } else {
        eleId.style.color = '#404040';
        this.setState({
          ValidMonthlyFromToDay: false,
          ValidCycleFromToDay: false
        });
      }
    }
    let regx = CommonRegex.VALIDATION_REGEX_POSITIVE_INTEGER_EMPTY;
    let newVal = e.target.value.trim();
    if (regx.test(newVal)) {
      // this.input.validator();
      this.refs.EachCycleRef.validateCurrent();
      let specialIntervalData = { ...this.state.specialIntervalData };
      if (fromToDay === 'FD') {
        specialIntervalData.supFreq1 = newVal;
        if (specialIntervalData.supplFreqId !== supplFreqId) {
          specialIntervalData.supFreq2 = '';
        }
      } else {
        specialIntervalData.supFreq2 = newVal;
        if (specialIntervalData.supplFreqId !== supplFreqId) {
          specialIntervalData.supFreq1 = '';
        }
      }
      specialIntervalData.regimen = regimen;
      if (specialIntervalData.supFreq1 || specialIntervalData.supFreq2) {
        specialIntervalData.supplFreqId = supplFreqId;
      }
      specialIntervalData.dayOfWeek = '';
      specialIntervalData.txtDosage = '';
      specialIntervalData.ddlFreq = '';
      specialIntervalData.freqText = '';
      specialIntervalData.freq1 = '';
      this.setState({
        specialIntervalData: specialIntervalData
      });
    }

  }

  handleSpecInterBehindRadionInputChange = (selectedValue, inputValue, tabType, isModifyEachCycle) => {
    let regx = CommonRegex.VALIDATION_REGEX_POSITIVE_INTEGER_EMPTY;
    let newVal = inputValue.target.value.trim();
    if (regx.test(newVal)) {
      let specialIntervalData = { ...this.state.specialIntervalData };
      specialIntervalData.regimen = tabType;
      // if (specialIntervalData.supFreq1) {
      if (newVal) {
        this.resetValidator();
        // this.input.validator();
        this.refs.EachCycleRef.validateCurrent();
        specialIntervalData.supplFreqId = selectedValue;
      }

      specialIntervalData.dayOfWeek = '';
      specialIntervalData.txtDosage = '';
      specialIntervalData.ddlFreq = '';
      specialIntervalData.freqText = '';
      specialIntervalData.freq1 = '';
      if (isModifyEachCycle) {
        //this.props.codeList.
        specialIntervalData.cycleMultiplier = newVal;
      } else if (specialIntervalData.supplFreqId === selectedValue) {
        specialIntervalData.supFreq1 = newVal;
        specialIntervalData.supFreq2 = '';
      }

      this.setState({
        specialIntervalData
      });
    }
  }

  validEachCycle = () => {
    const specialIntervalData = { ...this.state.specialIntervalData };
    const codeList = this.props.codeList;
    const value = parseInt(specialIntervalData.cycleMultiplier);
    if (specialIntervalData.supplFreqId && specialIntervalData.regimen === 'C') {
      if (specialIntervalData.supplFreqId === 40) {
        return !(value < parseInt(codeList.regimen_type[0]['C'][0].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][0].upperLimit) < value);
      } else if (specialIntervalData.supplFreqId === 19) {
        return !(value < parseInt(codeList.regimen_type[0]['C'][1].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][1].upperLimit) < value);
      } else if (specialIntervalData.supplFreqId === 20) {
        return !(value < parseInt(codeList.regimen_type[0]['C'][2].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][2].upperLimit) < value);
      } else if (value < parseInt(codeList.regimen_type[0]['C'][0].lowerLimit) || parseInt(codeList.regimen_type[0]['C'][0].upperLimit) < value) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  handleChangeTab = (newValue) => {
    let specialIntervalData = { ...this.state.specialIntervalData };
    if (specialIntervalData.regimen !== newValue) {
      specialIntervalData.regimen = newValue;
      specialIntervalData.cycleMultiplier = newValue === 'C' && specialIntervalData.supplFreqId !== '40' && specialIntervalData.supplFreqId !== '19' && specialIntervalData.supplFreqId !== '20' ? '28' : specialIntervalData.cycleMultiplier;
      specialIntervalData.supplFreqId = '';
      specialIntervalData.supFreq1 = '';
      specialIntervalData.supFreq2 = '';
      specialIntervalData.supFreqCode = '';
      specialIntervalData.dayOfWeek = '';
      specialIntervalData.supFreqText = [];
      specialIntervalData.txtDosage = '';
      specialIntervalData.ddlFreq = '';
      specialIntervalData.freqText = '';
      specialIntervalData.freq1 = '';
      specialIntervalData.txtDangerDrugQty = '';
      this.setState({
        specialIntervalData
      });
    }
  }

  render() {
    const { classes, id, codeList } = this.props;
    const { specialIntervalData } = this.state;
    let weekDayCodeList = [
      { code: 'm', engDesc: 'Monday' },
      { code: 't', engDesc: 'Tuesday' },
      { code: 'w', engDesc: 'Wednesday' },
      { code: 'th', engDesc: 'Thursday' },
      { code: 'f', engDesc: 'Friday' },
      { code: 'sa', engDesc: 'Saturday' },
      { code: 'su', engDesc: 'Sunday' }
    ];
    return (
      <Typography component="div">
        <Typography style={{ backgroundColor: '#b8bcb9', fontWeight: 'bold', fontSize: 16 }} variant={'subtitle2'} id="PopUpSpecialIntervalTitle">Special Interval Pattern</Typography>
        <Typography component="div" className={classes.root}>
          <Typography component="div" className={classes.tabs}>
            <Button
                id={id + '_specialIntervalBtnDaily'}
                className={specialIntervalData && specialIntervalData.regimen === 'D' ? classes.onSelect : classes.tabBtn}
                onClick={() => this.handleChangeTab('D')}
            >
              Daily
              </Button>
            <Button
                id={id + '_specialIntervalBtnWeekly'}
                className={specialIntervalData && specialIntervalData.regimen === 'W' ? classes.onSelect : classes.tabBtn}
                onClick={() => this.handleChangeTab('W')}
            >
              Weekly
              </Button>
            <Button
                id={id + '_specialIntervalBtnMonthly'}
                className={specialIntervalData && specialIntervalData.regimen === 'M' ? classes.onSelect : classes.tabBtn}
                onClick={() => this.handleChangeTab('M')}
            >
              Monthly
              </Button>
            <Button
                id={id + '_specialIntervalBtnCyclic'}
                className={specialIntervalData && specialIntervalData.regimen === 'C' ? classes.onSelect : classes.tabBtn}
                onClick={() => this.handleChangeTab('C')}
            >
              Cyclic
              </Button>
          </Typography>
          <ValidatorForm ref={'specialform'} onSubmit={() => this.handleBtnOk()} style={{ height: '100%', width: '100%' }}>
            <Typography component="div" {...contentProps('D', specialIntervalData.regimen)}>
              <Daily
                  specialIntervalData={specialIntervalData}
                  classes={classes}
                  handleSpecInterRadioChange={this.handleSpecInterRadioChange}
                  handleSpecInterBehindRadionInputChange={this.handleSpecInterBehindRadionInputChange}
                  specailIntervalValidatorListener={this.specailIntervalValidatorListener}
                  handleCancelSpecInter={this.props.handleCancelSpecInter}
                  codeList={codeList}
              />
            </Typography>
            <Typography component="div" {...contentProps('W', specialIntervalData.regimen)}>
              <Weekly
                  specialIntervalData={specialIntervalData}
                  classes={classes}
                  weekDayCodeList={weekDayCodeList}
                  handleSpecInterRadioChange={this.handleSpecInterRadioChange}
                  handleSpecInterBehindRadionInputChange={this.handleSpecInterBehindRadionInputChange}
                  specailIntervalValidatorListener={this.specailIntervalValidatorListener}
                  handleSelectDayOfWeek={this.handleSelectDayOfWeek}
                  handleCancelSpecInter={this.props.handleCancelSpecInter}
                  validWeekOfDay={this.state.validWeekOfDay}
                  codeList={codeList}
              />
            </Typography>
            <Typography component="div" {...contentProps('M', specialIntervalData.regimen)}>
              <Monthly
                  specialIntervalData={specialIntervalData}
                  classes={classes}
                  weekDayCodeList={weekDayCodeList}
                  handleSpecInterRadioChange={this.handleSpecInterRadioChange}
                  handleSpecInterBehindRadionInputChange={this.handleSpecInterBehindRadionInputChange}
                  specailIntervalValidatorListener={this.specailIntervalValidatorListener}
                  handleOnChangeFromToDay={this.handleOnChangeFromToDay}
                  handleCancelSpecInter={this.props.handleCancelSpecInter}
                  ValidMonthlyFromToDay={this.state.ValidMonthlyFromToDay}
                  codeList={codeList}
              />
            </Typography>
            <Typography component="div" {...contentProps('C', specialIntervalData.regimen)}>
              {/* <Cyclic
                  index={index}
                  specialIntervalData={specialIntervalData}
                  classes={classes}
                  weekDayCodeList={weekDayCodeList}
                  handleSpecInterRadioChange={this.handleSpecInterRadioChange}
                  handleSpecInterBehindRadionInputChange={this.handleSpecInterBehindRadionInputChange}
                  specailIntervalValidatorListener={this.specailIntervalValidatorListener}
                  handleOnChangeFromToDay={this.handleOnChangeFromToDay}
                  handleCancelSpecInter={this.props.handleCancelSpecInter}
                  ValidCycleFromToDay={this.state.ValidCycleFromToDay}
                  codeList={codeList}
                  EachCycleRef={EachCycleRef}
              /> */}
              <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.inputArea}>
                <Grid container style={{ marginLeft: '-10px' }} id="eachCycle">
                  <Grid item><label style={{ fontStyle: 'oblique', fontSize: '16px', lineHeight: '26px', fontWeight: 'bold' }}>Each cycle=</label></Grid>
                  <Grid item>
                    <TextFieldValidator
                        id={id + '_specialIntervalTextFieldEachCycle'}
                        ref="EachCycleRef"
                        value={specialIntervalData && specialIntervalData.cycleMultiplier}
                        onChange={(e) => this.handleSpecInterBehindRadionInputChange(specialIntervalData.supplFreqId, e, 'C', true)}
                        style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
                        name="inputEachCycle"
                        validators={specialIntervalData && specialIntervalData.regimen === 'C' ?
                        [ValidatorEnum.required, 'EachCycle']
                        :
                        null}
                        validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'eachCycle')}
                        notShowMsg
                        trim={'all'}
                    />
                  </Grid>
                  <Grid item><label style={{ fontStyle: 'oblique', fontSize: '16px', lineHeight: '26px', fontWeight: 'bold' }}>day(s) (default 28 days per cycle)</label></Grid>
                </Grid>
                <Grid item container>
                  <Grid item>
                    <FormControlLabel
                        control={
                        <Radio
                            id={id + '_specialIntervalRadioOnDayOfTheCycle'}
                            checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40}
                            onChange={e => this.handleSpecInterRadioChange(e, 'C')}
                            value="40"
                            color="primary"
                            name="dayOfCycle"
                        />
                      }
                        classes={{
                        root: classes.radioBtn
                      }}
                        style={{ marginRight: 0 }}
                    />
                  </Grid>
                  <Grid item id="onDayOfTheCycle" container xs={10}>
                    <Grid item><label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>on day</label></Grid>
                    <Grid item>
                      <TextFieldValidator
                          id={id + '_specialIntervalTextFieldOnDayOfTheCycle'}
                          value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40 ? specialIntervalData.supFreq1 : ''}
                          onChange={(e) => this.handleSpecInterBehindRadionInputChange(40, e, 'C')}
                          style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
                          name="inputDayOfCycle"
                          validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40 ?
                          [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][0].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
                          :
                          null}
                          validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'onDayOfTheCycle')}
                          notShowMsg
                          trim={'all'}
                      />
                    </Grid>
                    <Grid item>
                      <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>of the cycle</label>
                    </Grid>

                  </Grid>
                </Grid>
                <Grid item container>
                  <Grid item>
                    <FormControlLabel
                        control={
                        <Radio
                            id={id + '_specialIntervalRadioDaysPerCycle'}
                            checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19}
                            onChange={e => this.handleSpecInterRadioChange(e, 'C')}
                            value="19"
                            color="primary"
                            name="daysPerCylce"
                        />
                      }
                        classes={{
                        root: classes.radioBtn
                      }}
                    />
                  </Grid>
                  <Grid item style={{ marginLeft: '-17px' }}>
                    <TextFieldValidator
                        id={id + '_specialIntervalTextFieldDaysPerCycle'}
                        value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19 ? specialIntervalData.supFreq1 : ''}
                        onChange={(e) => this.handleSpecInterBehindRadionInputChange(19, e, 'C')}
                        style={{ width: '60px', marginRight: '5px' }}
                        name="inputPerCylce"
                        validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19 ?
                        [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][1].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
                        :
                        null}
                        validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'daysPerCycle')}
                        notShowMsg
                        trim={'all'}
                    />
                  </Grid>
                  <Grid item id="daysPerCycle">
                    <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>day(s) per cycle</label>
                  </Grid>
                </Grid>
                <Grid item container id="cycleFromToDay">
                  <Grid item>
                    <FormControlLabel
                        control={
                        <Radio
                            id={id + '_specialIntervalRadioCycleFromToDay'}
                            checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20}
                            onChange={e => this.handleSpecInterRadioChange(e, 'C')}
                            value="20"
                            color="primary"
                            name="cyclefromToDay"
                        />}
                        classes={{
                        root: classes.radioBtn
                      }}
                    />
                  </Grid>
                  <Grid item style={{ marginLeft: '-17px' }}>
                    <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>from day</label>
                  </Grid>
                  <Grid item>
                    <TextFieldValidator
                        id={id + '_specialIntervalTextFieldCycleFromDay'}
                      // ref="CycleFromDay"
                        value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ? specialIntervalData.supFreq1 : ''}
                      // onChange={(e) => this.this.props.handleFromToDay(20, e, 'C', 'FD')}
                        onChange={(e) => this.handleOnChangeFromToDay(20, e, 'C', 'FD')}
                        style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
                        name="inputFromDay"
                        validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ?
                        // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:' + specialIntervalData.cycleMultiplier, 'FromToDay']
                        [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][2].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
                        :
                        null}
                      // validatorListener={(...arg) => this.this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'fromDay', () => this.{ this.refs.CycleToDay.validateCurrent(); })}
                        validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'fromDay', this.state.ValidCycleFromToDay)}
                        notShowMsg
                        trim={'all'}
                        error={this.state.ValidCycleFromToDay}
                    />
                  </Grid>
                  <Grid item>
                    <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>to day</label>
                  </Grid>
                  <Grid item>
                    <TextFieldValidator
                        id={id + '_specialIntervalTextFieldCycleToDay'}
                      // ref="CycleToDay"
                        value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ? specialIntervalData.supFreq2 : ''}
                      // onChange={(e) => this.this.props.handleFromToDay(20, e, 'C', 'TD')}
                        onChange={(e) => this.handleOnChangeFromToDay(20, e, 'C', 'TD')}
                        style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
                        name="inputToDay"
                        validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ?
                        // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:' + specialIntervalData.cycleMultiplier, 'FromToDay']
                        [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][2].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
                        :
                        null}
                      // validatorListener={(...arg) => this.this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'toDay', () => this.{ this.refs.CycleFromDay.validateCurrent(); })}
                        validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'toDay', this.state.ValidCycleFromToDay)}
                        notShowMsg
                        trim={'all'}
                        error={this.state.ValidCycleFromToDay}
                    />
                  </Grid>
                  <Grid item>
                    <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>per cycle</label>
                  </Grid>
                </Grid>
                <SpecialActions handleCancelSpecInter={this.props.handleCancelSpecInter}
                    disabledBtn={specialIntervalData && specialIntervalData.regimen && specialIntervalData.supplFreqId}
                />
              </Grid>
            </Typography>
          </ValidatorForm>
        </Typography>
      </Typography>

    );
  }
}

//ok and cancel button
function SpecialActions(props) {
  const { id, handleCancelSpecInter } = props;
  return <Grid container item justify={'flex-end'}>
    <CIMSButton
        id={id + '_specialIntervalBtnOK'}
        type="submit"
        disabled={!props.disabledBtn}
    >
      OK
  </CIMSButton>
    <CIMSButton
        id={id + '_specialIntervalBtnCancel'}
        type="button"
        onClick={handleCancelSpecInter}
    >
      Cancel
  </CIMSButton>
  </Grid>;
}

//Daily tab
function Daily(props) {
  const { id, specialIntervalData, classes, handleCancelSpecInter,
    handleSpecInterRadioChange, handleSpecInterBehindRadionInputChange, specailIntervalValidatorListener, codeList } = props;
  return <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.inputArea}>
    <Grid item>
      <FormControlLabel
          control={
          <Radio
              id={id + '_specialIntervalRadioOnAlternateDays'}
              checked={specialIntervalData && specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 1}
              onChange={e => handleSpecInterRadioChange(e, 'D')}
              value="1"
              color="primary"
              name="onAlternateDays"
          />}
          classes={{
          root: classes.radioBtn
        }}
          label="on alternate days"
      />
    </Grid>
    <Grid item>
      <FormControlLabel
          control={
          <Radio
              id={id + '_specialIntervalRadioOnOddEvenDays'}
              checked={specialIntervalData && specialIntervalData.regimen === 'D' && (specialIntervalData.supplFreqId === '2' || specialIntervalData.supplFreqId === 2)}
              onChange={e => handleSpecInterRadioChange(e, 'D')}
              value="2"
              color="primary"
              name="onOddEvenDays"
          />}
          classes={{
          root: classes.radioBtn
        }}
          label="on odd / even days"
      />
    </Grid>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioEveryDays'}
                checked={specialIntervalData && specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 5}
                onChange={e => handleSpecInterRadioChange(e, 'D')}
                value="5"
                color="primary"
                name="everyDays"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
            style={{ marginRight: 0 }}
        />
      </Grid>
      <Grid container item xs={10} id="evrydays">
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>every</label >
        </Grid>
        <Grid item>
          <TextFieldValidator
              id={id + '_specialIntervalTextFieldEveryDays'}
              value={specialIntervalData && specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 5 ? specialIntervalData.supFreq1 : ''}
              onChange={(e) => handleSpecInterBehindRadionInputChange(5, e, 'D')}
              style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
              validators={specialIntervalData && specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 5 ?
              [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['D'][2].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['D'][2].upperLimit]
              :
              null
            }
            // errorMessages={specialIntervalData && specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 5 ?
            // ['','','']:null}
              validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'evrydays')}
              notShowMsg
              trim={'all'}
          />
        </Grid>
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>days</label >
        </Grid>
      </Grid>
    </Grid>
    <SpecialActions id={id} handleCancelSpecInter={handleCancelSpecInter}
        disabledBtn={specialIntervalData && specialIntervalData.regimen && specialIntervalData.supplFreqId}
    />
  </Grid>;
}

//Weekly tab
function Weekly(props) {
  const { id, specialIntervalData, classes, weekDayCodeList, handleCancelSpecInter,
    handleSpecInterRadioChange, handleSpecInterBehindRadionInputChange, specailIntervalValidatorListener, handleSelectDayOfWeek, codeList
  } = props;
  return <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.inputArea}>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioDaysPerWeek'}
                checked={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 7}
                onChange={e => handleSpecInterRadioChange(e, 'W')}
                value="7"
                color="primary"
                name="daysPerWeek"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
        />
      </Grid>
      <Grid container xs={10} item style={{ marginLeft: '-17px' }} id="daysPerWeek">
        <Grid item>
          <TextFieldValidator
              id={id + '_specialIntervalTextFieldDaysPerWeek'}
              value={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 7 ? specialIntervalData.supFreq1 : ''}
              onChange={(e) => handleSpecInterBehindRadionInputChange(7, e, 'W')}
              style={{ width: '60px', marginRight: '5px' }}
              name="inputPerWeekValue"
              validators={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 7 ?
              [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['W'][0].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['W'][0].upperLimit]
              :
              null}
              validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'daysPerWeek')}
              notShowMsg
              trim={'all'}
          />
        </Grid>
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>day(s) per week</label>
        </Grid>
      </Grid>
    </Grid>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioEveryWeeks'}
                checked={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 8}
                onChange={e => handleSpecInterRadioChange(e, 'W')}
                value="8"
                color="primary"
                name="everyweeks"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
            style={{ marginRight: 0 }}
        />
      </Grid>
      <Grid container item xs={10} id="everyWeeks">
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>every</label>
        </Grid>
        <Grid item>
          <TextFieldValidator
              id={id + '_specialIntervalTextFieldEveryWeeks'}
              value={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 8 ? specialIntervalData.supFreq1 : ''}
              onChange={(e) => handleSpecInterBehindRadionInputChange(8, e, 'W')}
              style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
              name="inputEveryWeek"
              validators={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 8 ?
              [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['W'][1].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['W'][1].upperLimit]
              :
              null}
              validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'everyWeeks')}
              notShowMsg
              trim={'all'}
          />
        </Grid>

        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>week(s)</label>
        </Grid>
      </Grid>

    </Grid>
    <Grid container item>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioWeekDay'}
                value="21"
                color="primary"
                checked={specialIntervalData && specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 21}
                onChange={e => handleSpecInterRadioChange(e, 'W')}
            />
          }
        />
      </Grid>
      <Grid item xs={11} style={{ marginLeft: '-17px' }}>
        {weekDayCodeList.map((item, i) => {
          let isCheck = false;
          if (specialIntervalData && specialIntervalData.dayOfWeek && specialIntervalData.dayOfWeek[i] === '1')
            isCheck = true;
          return <FormControlLabel
              key={i}
              control={
              <CIMSCheckbox
                  id={id + '_specialIntervalRadioWeekDay_CHK' + item.engDesc}
                  checked={isCheck}
                  value={item.code}
                  onChange={e => handleSelectDayOfWeek(e)}
                  name={item.engDesc}
              />
            }
              classes={{
              label: props.validWeekOfDay ? classes.correctFont : classes.errorFont
            }}
              label={item.engDesc}
                 />;
        }
        )}
      </Grid>
    </Grid>
    <SpecialActions id={id} handleCancelSpecInter={handleCancelSpecInter}
        disabledBtn={specialIntervalData && specialIntervalData.regimen && specialIntervalData.supplFreqId}
    />
  </Grid>;
}

//Monthly tab
function Monthly(props) {
  const { id, specialIntervalData, classes, handleCancelSpecInter,
    handleSpecInterRadioChange, handleSpecInterBehindRadionInputChange, specailIntervalValidatorListener, handleOnChangeFromToDay, ValidMonthlyFromToDay, codeList } = props;
  return <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.inputArea}>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioDaysPerMonth'}
                checked={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 16}
                onChange={e => handleSpecInterRadioChange(e, 'M')}
                value="16"
                color="primary"
                name="daysPerMonth"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
        />
      </Grid>
      <Grid item style={{ marginLeft: '-17px' }}>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldDaysPerMonth'}
            value={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 16 ? specialIntervalData.supFreq1 : ''}
            onChange={(e) => handleSpecInterBehindRadionInputChange(16, e, 'M')}
            style={{ width: '60px', marginRight: '5px' }}
            name="inputDaysPerMonth"
            validators={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 16 ?
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['M'][0].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['M'][0].upperLimit]
            :
            null}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'daysPerMonth')}
            notShowMsg
            trim={'all'}
        />
      </Grid>
      <Grid item id="daysPerMonth">
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>day(s) per month</label>
      </Grid>
    </Grid>
    <Grid item container id="monthlyFromToDay">
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioMonthlyFromToDay'}
                checked={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 17}
                onChange={e => handleSpecInterRadioChange(e, 'M')}
                value="17"
                color="primary"
                name="fromToDay"
            />}
            classes={{
            root: classes.radioBtn
          }}
        />
      </Grid>
      <Grid item style={{ marginLeft: '-17px' }}>
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>from day</label>
      </Grid>
      <Grid item>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldMonthlyFromDay'}
          // ref="MonthlyFromDay"
            value={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 17 ? specialIntervalData.supFreq1 : ''}
          // onChange={(e) => this.props.handleFromToDay(17, e, 'M', 'FD')}
            onChange={(e) => handleOnChangeFromToDay(17, e, 'M', 'FD')}
            style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
            name="inputFromDay"
            validators={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 17 ?
            // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:31', 'FromToDay']
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['M'][1].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['M'][1].upperLimit]
            :
            null}
          // validatorListener={(...arg) =>
          // this.specailIntervalValidatorListener(...arg, 'monthlyFromToDay', 'M', 'fromDay', () => { this.refs.MonthlyToDay.validateCurrent(); })
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'monthlyFromToDay', 'M', 'fromDay', ValidMonthlyFromToDay)
          }
            error={props.ValidMonthlyFromToDay}
            notShowMsg
            trim={'all'}
        />
      </Grid>
      <Grid item>
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>to day</label>
      </Grid>
      <Grid item>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldMonthlyToDay'}
          // ref="MonthlyToDay"
            value={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 17 ? specialIntervalData.supFreq2 : ''}
          // onChange={(e) => this.props.handleFromToDay(17, e, 'M', 'TD')}
            onChange={(e) => handleOnChangeFromToDay(17, e, 'M', 'TD')}
            style={{ width: '60px', marginLeft: '5px' }}
            name="inputToDay"
            validators={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 17 ?
            // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:31', 'FromToDay']
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['M'][1].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['M'][1].upperLimit]
            :
            null}
          // validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'monthlyFromToDay', 'M', 'toDay', () => { this.refs.MonthlyFromDay.validateCurrent(); })}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'monthlyFromToDay', 'M', 'toDay', ValidMonthlyFromToDay)}
            notShowMsg
            error={props.ValidMonthlyFromToDay}
            trim={'all'}
        />
      </Grid>
    </Grid>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioEveryMonth'}
                checked={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 18}
                onChange={e => handleSpecInterRadioChange(e, 'M')}
                value="18"
                color="primary"
                name="everyMonth"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
            style={{ marginRight: 0 }}
        />
      </Grid>
      <Grid item container xs={10} id="everyMonths">
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>every</label>
        </Grid>
        <Grid item>
          <TextFieldValidator
              id={id + '_specialIntervalTextFieldEveryMonth'}
              value={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 18 ? specialIntervalData.supFreq1 : ''}
              onChange={(e) => handleSpecInterBehindRadionInputChange(18, e, 'M')}
              style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
              name="inputEveryMonth"
              validators={specialIntervalData && specialIntervalData.regimen === 'M' && specialIntervalData.supplFreqId === 18 ?
              [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['M'][2].lowerLimit, 'maxNumber:' + codeList.regimen_type[0]['M'][2].upperLimit]
              :
              null}
              validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'everyMonths')}
              notShowMsg
              trim={'all'}
          />
        </Grid>
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>month(s)</label>
        </Grid>
      </Grid>
    </Grid>
    <SpecialActions id={id} handleCancelSpecInter={handleCancelSpecInter}
        disabledBtn={specialIntervalData && specialIntervalData.regimen && specialIntervalData.supplFreqId}
    />
  </Grid>;
}

//Cyclic tab
// eslint-disable-next-line
function Cyclic(props) {
  const { id, specialIntervalData, classes, handleCancelSpecInter,
    handleSpecInterRadioChange, handleSpecInterBehindRadionInputChange, specailIntervalValidatorListener, handleOnChangeFromToDay, ValidCycleFromToDay, codeList } = props;
  return <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.inputArea}>
    <Grid container style={{ marginLeft: '-10px' }} id="eachCycle">
      <Grid item><label style={{ fontStyle: 'oblique', fontSize: '16px', lineHeight: '26px', fontWeight: 'bold' }}>Each cycle=</label></Grid>
      <Grid item>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldEachCycle'}
            ref={props.EachCycleRef}
            value={specialIntervalData && specialIntervalData.cycleMultiplier}
            onChange={(e) => handleSpecInterBehindRadionInputChange(specialIntervalData.supplFreqId, e, 'C', true)}
            style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
            name="inputEachCycle"
            validators={specialIntervalData && specialIntervalData.regimen === 'C' ?
            [ValidatorEnum.required, 'EachCycle']
            :
            null}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'eachCycle')}
            notShowMsg
            trim={'all'}
        />
      </Grid>
      <Grid item><label style={{ fontStyle: 'oblique', fontSize: '16px', lineHeight: '26px', fontWeight: 'bold' }}>day(s) (default 28 days per cycle)</label></Grid>
    </Grid>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioOnDayOfTheCycle'}
                checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40}
                onChange={e => handleSpecInterRadioChange(e, 'C')}
                value="40"
                color="primary"
                name="dayOfCycle"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
            style={{ marginRight: 0 }}
        />
      </Grid>
      <Grid item id="onDayOfTheCycle" container xs={10}>
        <Grid item><label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>on day</label></Grid>
        <Grid item>
          <TextFieldValidator
              id={id + '_specialIntervalTextFieldOnDayOfTheCycle'}
              value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40 ? specialIntervalData.supFreq1 : ''}
              onChange={(e) => handleSpecInterBehindRadionInputChange(40, e, 'C')}
              style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
              name="inputDayOfCycle"
              validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 40 ?
              [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][0].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
              :
              null}
              validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'onDayOfTheCycle')}
              notShowMsg
              trim={'all'}
          />
        </Grid>
        <Grid item>
          <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>of the cycle</label>
        </Grid>

      </Grid>
    </Grid>
    <Grid item container>
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioDaysPerCycle'}
                checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19}
                onChange={e => handleSpecInterRadioChange(e, 'C')}
                value="19"
                color="primary"
                name="daysPerCylce"
            />
          }
            classes={{
            root: classes.radioBtn
          }}
        />
      </Grid>
      <Grid item style={{ marginLeft: '-17px' }}>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldDaysPerCycle'}
            value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19 ? specialIntervalData.supFreq1 : ''}
            onChange={(e) => handleSpecInterBehindRadionInputChange(19, e, 'C')}
            style={{ width: '60px', marginRight: '5px' }}
            name="inputPerCylce"
            validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 19 ?
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][1].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
            :
            null}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'daysPerCycle')}
            notShowMsg
            trim={'all'}
        />
      </Grid>
      <Grid item id="daysPerCycle">
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>day(s) per cycle</label>
      </Grid>
    </Grid>
    <Grid item container id="cycleFromToDay">
      <Grid item>
        <FormControlLabel
            control={
            <Radio
                id={id + '_specialIntervalRadioCycleFromToDay'}
                checked={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20}
                onChange={e => handleSpecInterRadioChange(e, 'C')}
                value="20"
                color="primary"
                name="cyclefromToDay"
            />}
            classes={{
            root: classes.radioBtn
          }}
        />
      </Grid>
      <Grid item style={{ marginLeft: '-17px' }}>
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>from day</label>
      </Grid>
      <Grid item>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldCycleFromDay'}
          // ref="CycleFromDay"
            value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ? specialIntervalData.supFreq1 : ''}
          // onChange={(e) => this.props.handleFromToDay(20, e, 'C', 'FD')}
            onChange={(e) => handleOnChangeFromToDay(20, e, 'C', 'FD')}
            style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
            name="inputFromDay"
            validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ?
            // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:' + specialIntervalData.cycleMultiplier, 'FromToDay']
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][2].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
            :
            null}
          // validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'fromDay', () => { this.refs.CycleToDay.validateCurrent(); })}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'fromDay', ValidCycleFromToDay)}
            notShowMsg
            trim={'all'}
            error={ValidCycleFromToDay}
        />
      </Grid>
      <Grid item>
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>to day</label>
      </Grid>
      <Grid item>
        <TextFieldValidator
            id={id + '_specialIntervalTextFieldCycleToDay'}
          // ref="CycleToDay"
            value={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ? specialIntervalData.supFreq2 : ''}
          // onChange={(e) => this.props.handleFromToDay(20, e, 'C', 'TD')}
            onChange={(e) => handleOnChangeFromToDay(20, e, 'C', 'TD')}
            style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
            name="inputToDay"
            validators={specialIntervalData && specialIntervalData.regimen === 'C' && specialIntervalData.supplFreqId === 20 ?
            // [ValidatorEnum.required, 'minNumber:1', 'maxNumber:' + specialIntervalData.cycleMultiplier, 'FromToDay']
            [ValidatorEnum.required, 'minNumber:' + codeList.regimen_type[0]['C'][2].lowerLimit, 'maxNumber:' + specialIntervalData.cycleMultiplier]
            :
            null}
          // validatorListener={(...arg) => this.specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'toDay', () => { this.refs.CycleFromDay.validateCurrent(); })}
            validatorListener={(...arg) => specailIntervalValidatorListener(...arg, 'cycleFromToDay', 'C', 'toDay', ValidCycleFromToDay)}
            notShowMsg
            error={ValidCycleFromToDay}
            trim={'all'}
        />
      </Grid>
      <Grid item>
        <label style={{ fontSize: '0.875rem', lineHeight: '26px' }}>per cycle</label>
      </Grid>
    </Grid>
    <SpecialActions id={id} handleCancelSpecInter={handleCancelSpecInter}
        disabledBtn={specialIntervalData && specialIntervalData.regimen && specialIntervalData.supplFreqId}
    />
  </Grid>;
}

const mapStateToProps = (state) => {
  return {
    codeList: state.moe.codeList
  };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SpecialInterval));