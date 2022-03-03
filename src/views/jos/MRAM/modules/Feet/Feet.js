import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, FormControl, withStyles, TextField } from '@material-ui/core';
import { styles } from './FeetStyle';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import classNames from 'classnames';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import { RADIO_OPTION_2 } from '../../../../../constants/MRAM/mramConstant';
import {
  MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,
  MRAM_FEET_FOOT_PATHOLOGY_PREFIX,
  MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX,
  MRAM_FEET_OTHER_INFORMATION_PREFIX,
  MRAM_FEET_NEUROLOGY_EXAMINATION_ID,
  MRAM_FEET_FOOT_PATHOLOGY_ID,
  MRAM_FEET_VASCULAR_ASSESSMENT_ID,
  MRAM_FEET_OTHER_INFORMATION_ID,
  DL_MONOFILAMENT_TEST,
  DL_128HZ_TUNING_FORK,
  DL_ACHILLES_REFLEXES,
  RANGE_GRADUATED_TUNING_FORK,
  RANGE_VPT,
  LEFT_ABNORMAL_VIBRATION_SENSE_FACTOR_ID_SET,
  RIGHT_ABNORMAL_VIBRATION_SENSE_FACTOR_ID_SET
} from '../../../../../constants/MRAM/feet/feetConstant';
import _, { isEqual,toNumber } from 'lodash';
import * as generalUtil from '../../utils/generalUtil';
import RadioField from '../../components/RadioField/RadioField';
import TextareaField from '../../components/TextareaField/TextareaField';
import NameTextField from '../../components/NameTextField/NameTextField';
import DateTextField from '../../components/DateTextField/DateTextField';
import NaturalNumTextField from '../../components/NaturalNumTextField/NaturalNumTextField';
import AbiComponent from './components/AbiComponent/AbiComponent';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';

class Feet extends Component {
  constructor(props){
    super(props);
    this.state={
      feetFieldValMap:new Map()
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { feetFieldValMap } = props;
    if (!isEqual(feetFieldValMap,state.feetFieldValMap)) {
      return {
        feetFieldValMap
      };
    }
    return null;
  }

  /**
   * AbnormalVibrationSense
   * Yes: 1
   * No: 0
   * Not known: null
   */
  handleAbnormalVibrationSense = (val,mramId) => {
    let { feetFieldValMap } = this.state;
    let result = ''; //default
    // let result = 'Not known'; //default
    let _128HzTF = null,
        _GTF = null,
        _VPT = null,
        flag = null;
    if (RIGHT_ABNORMAL_VIBRATION_SENSE_FACTOR_ID_SET.has(mramId)) {
      _128HzTF = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}`).value;
      _GTF = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK}`).value;
      _VPT = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT}`).value;
      flag = 'right';
    } else if (LEFT_ABNORMAL_VIBRATION_SENSE_FACTOR_ID_SET.has(mramId)){
      _128HzTF = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}`).value;
      _GTF = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK}`).value;
      _VPT = mramId === MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT?val:feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT}`).value;
      flag = 'left';
    }
    if (flag) {
      _GTF = _GTF!==''?toNumber(_GTF):null;
      _VPT = _VPT!==''?toNumber(_VPT):null;
      let val1 = _128HzTF === ' '?null:(_128HzTF === 'Normal'?0:1);
      let val2 = null;
      if (_GTF!==null) {
        let { patientInfo } = this.props;
        let age =_.toLower(patientInfo.ageUnit) === 'year'?_.toInteger(patientInfo.age):(
          _.toLength(patientInfo.age) === 2? _.toInteger(patientInfo.age)/100:_.toInteger(patientInfo.age)/10
        );
        if (age<65) {
          if (_GTF>=0&&_GTF<=6) {
            val2 = 1; //Yes
          } else if (_GTF>6&&_GTF<=8) {
            val2 = 0; //No
          }
        } else if (age >=65) {
          if (_GTF>=0&&_GTF<=4) {
            val2 = 1; //Yes
          } else if (_GTF>4&&_GTF<=8) {
            val2 = 0; //No
          }
        }
      }
      let val3 = null;
      if (_VPT!==null) {
        if (_VPT>=0&&_VPT<=25) {
          val3 = 0; //No
        } else if (_VPT>=26&&_VPT<=50) {
          val3 = 1; //Yes
        }
      }

      if (val1 === null&&val2 === null&&val3 === null) {
        result = 'Not known';
      } else {
        result = val1 || val2 || val3 === 1?'Yes':'No';
      }
      let _AVS = null;
      if (flag === 'left') {
        _AVS = feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_VIBRATION_SENSE}`);
      } else if (flag === 'right') {
        _AVS = feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_VIBRATION_SENSE}`);
      }
      if(_AVS){
        _AVS.value = result;
      }
      generalUtil.handleOperationType(_AVS);
      this.setState({
        feetFieldValMap
      });
    }
  }

  handleDropdownChanged = (obj,prefix,mramId) => {
    let { feetFieldValMap } = this.state;
    let fieldValObj = feetFieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = obj.value;
    generalUtil.handleOperationType(fieldValObj);
    this.handleAbnormalVibrationSense(obj.value,mramId);
    this.updateValMaps(feetFieldValMap);
    this.setState({
      feetFieldValMap
    });
  }

  updateValMaps = (map) => {
    const { updateState } = this.props;
    updateState&&updateState({
      feetFieldValMap:map
    });
  }

  render() {
    const { classes,view=false } = this.props;
    let { feetFieldValMap } = this.state;
    let supStr = <sup className={classes.sup}>R</sup>;
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          {/* Neurology Examination */}
          <Typography component="div" id="divNeurologyExamination">
            <Typography variant="h5" component="h3" className={classes.topHeader}>
              Neurology Examination
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                <Paper elevation={1}>
                  <ValidatorForm onSubmit={() => {}} >
                    <FormControl component="fieldset" className={classes.form}>
                      <Table>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableHeadFirstCell}></TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25,classes.feetBorder)}>Right</TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25)}>Left</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Monofilament test{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST}_Dropdown`}
                                  options={
                                    DL_MONOFILAMENT_TEST.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST);}}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST}_Dropdown`}
                                  options={
                                    DL_MONOFILAMENT_TEST.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Vibration test{supStr}</TableCell>
                            <TableCell className={classNames(classes.tableCrossRow,classes.feetBorder)}></TableCell>
                            <TableCell />
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>a. 128 Hz tuning fork</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}_Dropdown`}
                                  options={
                                    DL_128HZ_TUNING_FORK.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK);}}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}_Dropdown`}
                                  options={
                                    DL_128HZ_TUNING_FORK.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>b. Graduated tuning fork</TableCell>
                            <TableCell className={classes.feetBorder}>
                              <NaturalNumTextField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK}`}
                                  rangeValObj={RANGE_GRADUATED_TUNING_FORK}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be between 0 and 8.'}
                                  abnormal2ErrorSwitch
                                  // abnormalMsg={'The value should be between 0 and 8.'}
                                  maxLength={1}
                                  extraContent={'/ 8'}
                                  sideEffect={this.handleAbnormalVibrationSense}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell>
                              <NaturalNumTextField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK}`}
                                  rangeValObj={RANGE_GRADUATED_TUNING_FORK}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be between 0 and 8.'}
                                  abnormal2ErrorSwitch
                                  // abnormalMsg={'The value should be between 0 and 8.'}
                                  maxLength={1}
                                  extraContent={'/ 8'}
                                  sideEffect={this.handleAbnormalVibrationSense}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>c. VPT</TableCell>
                            <TableCell className={classes.feetBorder}>
                              <NaturalNumTextField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT}`}
                                  rangeValObj={RANGE_VPT}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be between 0 and 50.'}
                                  abnormal2ErrorSwitch
                                  // abnormalMsg={'The value should be between 0 and 50.'}
                                  maxLength={4}
                                  sideEffect={this.handleAbnormalVibrationSense}
                                  viewMode={view}
                                  typeName={'MramVPT'}
                              />
                            </TableCell>
                            <TableCell>
                              <NaturalNumTextField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT}`}
                                  rangeValObj={RANGE_VPT}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be between 0 and 50.'}
                                  abnormal2ErrorSwitch
                                  // abnormalMsg={'The value should be between 0 and 50.'}
                                  maxLength={4}
                                  sideEffect={this.handleAbnormalVibrationSense}
                                  viewMode={view}
                                  typeName={'MramVPT'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Abnormal vibration sense (from one of the above)</TableCell>
                            <TableCell className={classes.feetBorder}>
                              <TextField
                                  id="rightAbnormalVibrationSense"
                                  autoCapitalize="off"
                                  type="text"
                                  variant="outlined"
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_VIBRATION_SENSE}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_VIBRATION_SENSE}`).value:
                                    ''
                                  }
                                  InputProps={{
                                    classes: { input: classes.input },
                                    readOnly: true
                                  }}
                                  disabled={view}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                  id="leftAbnormalVibrationSense"
                                  autoCapitalize="off"
                                  type="text"
                                  variant="outlined"
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_VIBRATION_SENSE}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_VIBRATION_SENSE}`).value:
                                    ''
                                  }
                                  InputProps={{
                                    readOnly: true
                                  }}
                                  disabled={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Achilles reflexes{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES}_Dropdown`}
                                  options={
                                    DL_ACHILLES_REFLEXES.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES);}}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES}_Dropdown`}
                                  options={
                                    DL_ACHILLES_REFLEXES.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES}`)?
                                    feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Abnormal pinprick sensation{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_PINPRICK_SENSATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_PINPRICK_SENSATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_PINPRICK_SENSATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_PINPRICK_SENSATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Abnormal temperature sensation</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}
                                  mramId={MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Paper>
              </Grid>
            </Grid>
          </Typography>
          {/* Foot Pathology */}
          <Typography component="div" id="divFootPathology">
            <Typography variant="h5" component="h3" className={classes.middleHeader}>
              Foot Pathology
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                <Paper elevation={1}>
                  <ValidatorForm onSubmit={() => { }} >
                    <FormControl component="fieldset" className={classes.form}>
                      <Table>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableHeadFirstCell}></TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25,classes.feetBorder)}>Right</TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25)}>Left</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Nail pathology{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_NAIL_PATHOLOGY}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_NAIL_PATHOLOGY}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_NAIL_PATHOLOGY}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_NAIL_PATHOLOGY}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Deformity{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DEFORMITY}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DEFORMITY}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DEFORMITY}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DEFORMITY}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Dry skin / Callus{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DRY_SKINCALLUS}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DRY_SKINCALLUS}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DRY_SKINCALLUS}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DRY_SKINCALLUS}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Infection{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_INFECTION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_INFECTION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_INFECTION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_INFECTION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Fissure{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_FISSURE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_FISSURE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_FISSURE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_FISSURE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Ischaemic change{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ISCHAEMIC_CHANGE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ISCHAEMIC_CHANGE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ISCHAEMIC_CHANGE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ISCHAEMIC_CHANGE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>History of ulcer / non-traumatic lower extremity amputation{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_HX_OF_ULCER}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_HX_OF_ULCER}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_HX_OF_ULCER}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_HX_OF_ULCER}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Active ulcer{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ACTIVE_ULCER}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ACTIVE_ULCER}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ACTIVE_ULCER}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_FOOT_PATHOLOGY_PREFIX}
                                  mramId={MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ACTIVE_ULCER}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Paper>
              </Grid>
            </Grid>
          </Typography>
          {/* Vascular Assessment */}
          <Typography component="div" id="divVascularAssessment">
            <Typography variant="h5" component="h3" className={classes.middleHeader}>
              Vascular Assessment
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                <Paper elevation={1}>
                  <ValidatorForm onSubmit={() => { }} >
                    <FormControl component="fieldset" className={classes.form}>
                      <Table>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableHeadFirstCell}></TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25,classes.feetBorder)}>Right</TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25)}>Left</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>History</TableCell>
                            <TableCell className={classes.feetBorder}/>
                            <TableCell />
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Revascularization{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REVASCULARIZATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REVASCULARIZATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REVASCULARIZATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REVASCULARIZATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Claudication{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_CALUDICATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_CALUDICATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_CALUDICATION}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_CALUDICATION}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Rest pain{supStr}</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REST_PAIN}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REST_PAIN}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REST_PAIN}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REST_PAIN}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Assessment</TableCell>
                            <TableCell className={classes.feetBorder}/>
                            <TableCell />
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Abnormal foot pulse{supStr}</TableCell>
                            <TableCell classes={{ 'body': classNames(classes.tableCellSpan, classes.feetBorder) }}>
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABNORMAL_FOOT_PULSE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABNORMAL_FOOT_PULSE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell classes={{ 'body': classes.tableCellSpan }}>
                              <RadioField
                                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABNORMAL_FOOT_PULSE}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}
                                  mramId={MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABNORMAL_FOOT_PULSE}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>

                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Ankle systolic BP{supStr}</TableCell>
                            <TableCell className={classNames(classes.feetBorder)} rowSpan={2}>
                              <AbiComponent
                                  direction="RIGHT"
                                  maxLength={3}
                                  updateState={this.props.updateState}
                                  fieldValMap={feetFieldValMap}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell rowSpan={2}>
                              <AbiComponent
                                  direction="LEFT"
                                  maxLength={3}
                                  updateState={this.props.updateState}
                                  fieldValMap={feetFieldValMap}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCellIndent,classes.firstLevelHeadCell)}>Brachial systolic BP{supStr}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Paper>
              </Grid>
            </Grid>
          </Typography>
          {/* Other Information */}
          <Typography component="div" id="divOtherInformation">
            <Typography variant="h5" component="h3" className={classes.middleHeader}>
              Other Information
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                <Paper elevation={1}>
                  <ValidatorForm onSubmit={() => { }} >
                    <FormControl component="fieldset" className={classes.form}>
                      <Table>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableHeadFirstCell}>{''}</TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25,classes.feetBorder)}>Right</TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.width25)}>Left</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Footwear problem</TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.feetBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_OTHER_INFORMATION_PREFIX}_${MRAM_FEET_OTHER_INFORMATION_ID.RIGHT_FOOT_FOOTWEAR_PROBLEM}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_FEET_OTHER_INFORMATION_ID.RIGHT_FOOT_FOOTWEAR_PROBLEM}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'body':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_FEET_OTHER_INFORMATION_PREFIX}_${MRAM_FEET_OTHER_INFORMATION_ID.LEFT_FOOT_FOOTWEAR_PROBLEM}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_FEET_OTHER_INFORMATION_ID.LEFT_FOOT_FOOTWEAR_PROBLEM}
                                  updateState={this.props.updateState}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.remarkTitleTableRow)}>
                            <TableCell
                                colSpan={3}
                                className={classNames(classes.tableRowFieldCell,classes.borderLeftRight)}
                                classes={{
                                  'root':classes.remarkTitleTableCell
                                }}
                            >
                              Remarks
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                                colSpan={3}
                                className={classNames(classes.remarkTableCell,classes.borderLeftRight)}
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <TextareaField
                                  id={`${MRAM_FEET_OTHER_INFORMATION_PREFIX}_${MRAM_FEET_OTHER_INFORMATION_ID.REMARKS}`}
                                  fieldValMap={feetFieldValMap}
                                  prefix={MRAM_FEET_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_FEET_OTHER_INFORMATION_ID.REMARKS}
                                  updateState={this.props.updateState}
                                  viewMode={view}
                                  maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={3}>
                              <Grid container>
                                <Grid item xs={2} className={classes.tableRowFieldCell}><div className={classes.paddingTop}>Assessed by</div></Grid>
                                <Grid item xs={4}>
                                  <div className={classes.width50}>
                                    <NameTextField
                                        id={`${MRAM_FEET_OTHER_INFORMATION_PREFIX}_${MRAM_FEET_OTHER_INFORMATION_ID.FEET_ASSESSED_BY}`}
                                        fieldValMap={feetFieldValMap}
                                        prefix={MRAM_FEET_OTHER_INFORMATION_PREFIX}
                                        mramId={MRAM_FEET_OTHER_INFORMATION_ID.FEET_ASSESSED_BY}
                                        updateState={this.props.updateState}
                                        viewMode={view}
                                    />
                                  </div>
                                </Grid>
                                <Grid item xs={2} className={classes.tableRowFieldCell}><div className={classes.paddingTop}>Assessment date</div></Grid>
                                <Grid item xs={4}>
                                  <div className={classes.width50}>
                                    <DateTextField
                                        id={`${MRAM_FEET_OTHER_INFORMATION_PREFIX}_${MRAM_FEET_OTHER_INFORMATION_ID.FEET_ASSESSMENT_DATE}`}
                                        fieldValMap={feetFieldValMap}
                                        prefix={MRAM_FEET_OTHER_INFORMATION_PREFIX}
                                        mramId={MRAM_FEET_OTHER_INFORMATION_ID.FEET_ASSESSMENT_DATE}
                                        updateState={this.props.updateState}
                                        viewMode={view}
                                    />
                                  </div>
                                </Grid>
                              </Grid>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Paper>
              </Grid>
            </Grid>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default connect()(withStyles(styles)(Feet));
