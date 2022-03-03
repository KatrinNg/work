
/*
 * Front-end UI for Measurement/LabTest shows page
 * init Measurement/LabTest List Action: [measurementAndLabTest.js] getDerivedStateFromProps -> getTokenTemplateList
 * -> [tokenTemplateManagementAction.js] getTokenTemplateList
 * -> [tokenTemplateManagementSaga.js] getTokenTemplateList
 * -> Backend API = /ioe/listReminderTemplate
 * Save Action: [tokenTemplateManagement.js] Save -> saveReminderTemplateList
 * -> [tokenTemplateManagementAction.js] saveReminderTemplateList
 * -> [tokenTemplateManagementSaga.js] saveReminderTemplateList
 * -> Backend API = /ioe/saveReminderTemplateList
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {style} from './measurementAndLabTestCss';
import { withStyles } from '@material-ui/core/styles';
import { Card,CardContent, Grid, Typography,Paper, FormHelperText,TextField} from '@material-ui/core';
// import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSTable from './labTable';
import MergeTypeSharpIcon from '@material-ui/icons/MergeTypeSharp';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import * as generalUtil from '../../utils/generalUtil';
import JDecimalTextField from '../../components/JDecimalTextField/JDecimalTextField';
// import { isEqual } from 'lodash';
import { BMI_RANGE,MRAM_MEASUREMENTS_PREFIX,MRAM_MEASUREMENTS_ID,RANGE_BEST_WAIST_FEMALE,RANGE_BEST_WAIST_MALE,RADIO_OPTION_1,RADIO_OPTION_2, RANG_BEST_HEIGHT, RANGE_BEST_BLOOD_PRESSURE_SYSTOLIC, RANGE_BEST_BLOOD_PRESSURE_DIASTOLIC } from '../../../../../constants/MRAM/measurementAndLabTest/measurementAndLabTestConstant';
import { MRAM_RISKPROFILE_RSPF_PREFIX,MRAM_RISKPROFILE_RSPF_EXAMINATION_ID,DL_ALBUMINURIA } from '../../../../../constants/MRAM/riskProfile/riskProfileConstants';
import RadioField from '../../components/RadioField/RadioField';
import TextareaField from '../../components/TextareaField/TextareaField';
import Enum from '../../../../../enums/enum';
import { ErrorOutline } from '@material-ui/icons';
import classNames from 'classnames';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
// import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { derivePara } from '../../../../../constants/MRAM/riskProfile/derivePara';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import clsx from 'clsx';
import _ from 'lodash';

class measurementAndLabTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      measurementAndLabTestFieldValMap:new Map(),
      bmiWarning:false,
      rBpError:false,
      lBpError:false,
      bmiError:false,
      data:[
        {labTest:'HbA1c',labResult:'%'},
        {labTest:'Fasting glucose',labResult:'mmol/L'},
        {labTest:'Total cholesterol',labResult:'mmol/L'},
        {labTest:'LDL-C',labResult:'mmol/L'},
        {labTest:'HDL-C',labResult:'mmol/L'},
        {labTest:'Triglycerides',labResult:'mmol/L'},
        {labTest:'Serum K',labResult:'mmol/L'},
        {labTest:'Serum creatinine',labResult:'umol/L'},
        {labTest:'Estimated GFR(CKD-EPI)',labResult:'ml/min/1.73m'},
        {labTest:'Creatinine clearance',labResult:'ml/min'},
        {labTest:'Proteinuria',labResult:'g/d'},
        {labTest:'Albumin excretion rate',labResult:'mg/d'},
        {labTest:'Urine alb / Cr ratio',labResult:'mg/mmol'},
        {labTest:'Urine alb concentration',labResult:'mg/L'},
        {labTest:'Urine protein / Cr ratio',labResult:'mg/mg Cr'},
        {labTest:'Hb',labResult:'g/dL'},
        {labTest:'Hct',labResult:''},
        {labTest:'ALT',labResult:'U/L'}
      ],
      tableRows: [
        { name: 'labTest',width: '25%', label:'Lab Test'},
        { name: 'labResult', width: 'auto', label: 'Lab Result' },
        { name: 'refernceDate', width: '15%', label: 'Reference Date' },
        { name: 'hospital', width: '15%', label: 'Hospital' }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage:5,
        onSelectIdName:'', //显示tips的列
        tipsListName:'', //显示tips的list
        tipsDisplayListName:'', //显示tips的列
        tipsDisplayName: '', //显示tips的值
        // onSelectedRow:(rowId,rowData,selectedData)=>{
        //   this.selectTableItem(selectedData);
        // },
        bodyCellStyle:this.props.classes.customRowStyle,
 	    	headRowStyle:this.props.classes.headRowStyle,
        headCellStyle:this.props.classes.headCellStyle
      },
      albuminuriaVal: derivePara.NOT_KNOWN,
      displayAlbuminuriaDL: true,
      dervieType:null
    };
  }

  //get state
  // static getDerivedStateFromProps(props, state) {
  //   let { measurementAndLabTestFieldValMap } = props;
  //   if (!isEqual(measurementAndLabTestFieldValMap,state.measurementAndLabTestFieldValMap)) {
  //     return {
  //       measurementAndLabTestFieldValMap
  //     };
  //   }
  //   return null;
  // }

  UNSAFE_componentWillMount(){
    EventEmitter.on('mram_measurement_lab_test_albuminuria_reload', this.resetLoadAlbuminuria);
  }

  UNSAFE_componentWillUpdate(nextProps){
    if (nextProps.measurementAndLabTestFieldValMap !== this.state.measurementAndLabTestFieldValMap) {
      this.setState({
        measurementAndLabTestFieldValMap:nextProps.measurementAndLabTestFieldValMap
      });
    }
    if (nextProps.dervieType !== this.state.dervieType) {
        this.setState({
            dervieType:nextProps.dervieType
        });
      }
  }

  componentWillUnmount(){
    EventEmitter.delete('mram_measurement_lab_test_albuminuria_reload', this.resetLoadAlbuminuria);
  }

  resetLoadAlbuminuria = (payload={}) => {
    let { displayAlbuminuriaDL, albuminuriaVal } = payload;
    this.setState({
      displayAlbuminuriaDL,
      albuminuriaVal
    });
    // if (displayAlbuminuriaDL) {

    // }
  }

  //update props
  updateValMaps = (map) => {
    const { updateState } = this.props;
    updateState&&updateState({
      measurementAndLabTestFieldValMap:map
    });
  }
  //check number
  decimalValCheck(val) {
    // keep at most three decimal places
    let partten = /^([0-9]\d*|0)(\.[0-9]{1,3})?$/;
    if (partten.test(val)) {
      return true;
    }
    return false;
  }

  handleInputoChanged = (val,mramId,event) =>{
    let id = event.target.id;
    let { measurementAndLabTestFieldValMap } = this.state;
    let fieldValObj = measurementAndLabTestFieldValMap.get(id);
    fieldValObj.value = val;
    //this.handleMaculopathy(event.target.value,mramId);
    generalUtil.handleOperationType(fieldValObj);
    this.checkedInput(id,measurementAndLabTestFieldValMap);
    this.setBMI(measurementAndLabTestFieldValMap);
    this.setWHR(measurementAndLabTestFieldValMap);
    this.updateValMaps(measurementAndLabTestFieldValMap);
    this.setState({
      measurementAndLabTestFieldValMap
    });
  }

  handleRadiChanged = (val)=>{
    let {measurementAndLabTestFieldValMap} = this.state;
    let fieldValObj = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.ECG}`);
    fieldValObj.value = val;
    if(val === '') {
      let descriptionFieldValObj = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.ECG_DESCRIPTION}`);
      descriptionFieldValObj.value !== '' && generalUtil.handleOperationType(descriptionFieldValObj);
      descriptionFieldValObj.value = '';
    }
    generalUtil.handleOperationType(fieldValObj);
    this.updateValMaps(measurementAndLabTestFieldValMap);
    this.setState({
      measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap
    });
  }

  resetInput=(inputId,measurementAndLabTestFieldValMap)=>{
    measurementAndLabTestFieldValMap.get(inputId).value = '';
    this.updateValMaps(measurementAndLabTestFieldValMap);
    this.setState({
      measurementAndLabTestFieldValMap : measurementAndLabTestFieldValMap
    });
  }

    //Update the error status
    updateErrorStatus =(status,mramId,errorObj,measurementAndLabTestFieldValMap)=>{
      let fieldValObj;
      this.setState({
        [errorObj]: status
      });
      fieldValObj = measurementAndLabTestFieldValMap.get(mramId);
      if(status){
        fieldValObj.isError = status;
      }
      if(fieldValObj.isAbnormal){
        fieldValObj.isError = true;
      }
      this.updateValMaps(measurementAndLabTestFieldValMap);
      this.setState({
        measurementAndLabTestFieldValMap : measurementAndLabTestFieldValMap
      });
    }

  checkedInput=(inputId,measurementAndLabTestFieldValMap)=>{
    switch (inputId) {
      case `${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`:
        if(this.decimalValCheck(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`).value)
          &&this.decimalValCheck(measurementAndLabTestFieldValMap.get(inputId).value)
          &&measurementAndLabTestFieldValMap.get(inputId).value>=30
          &&measurementAndLabTestFieldValMap.get(inputId).value<=300
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`).value>=30
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`).value<=300
          &&(Number(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`).value)>Number(measurementAndLabTestFieldValMap.get(inputId).value))){
          this.updateErrorStatus(true,inputId,'rBpError',measurementAndLabTestFieldValMap);
        } else {
          this.updateErrorStatus(false,inputId,'rBpError',measurementAndLabTestFieldValMap);
        }
        break;
      case `${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`:
        if(this.decimalValCheck(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`).value)
          &&this.decimalValCheck(measurementAndLabTestFieldValMap.get(inputId).value)
          &&measurementAndLabTestFieldValMap.get(inputId).value>=30
          &&measurementAndLabTestFieldValMap.get(inputId).value<=300
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`).value>=30
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`).value<=300
          &&(Number(measurementAndLabTestFieldValMap.get(inputId).value)>Number(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`).value))){
          this.updateErrorStatus(true,inputId,'rBpError',measurementAndLabTestFieldValMap);
        } else {
          this.updateErrorStatus(false,inputId,'rBpError',measurementAndLabTestFieldValMap);
        }
        break;
      case `${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`:
        if(this.decimalValCheck(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value)
          &&this.decimalValCheck(measurementAndLabTestFieldValMap.get(inputId).value)
          &&measurementAndLabTestFieldValMap.get(inputId).value>=30
          &&measurementAndLabTestFieldValMap.get(inputId).value<=300
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`).value>=30
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`).value<=300
          &&(Number(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`).value)>Number(measurementAndLabTestFieldValMap.get(inputId).value))){
          this.updateErrorStatus(true,inputId,'lBpError',measurementAndLabTestFieldValMap);
        } else {
          this.updateErrorStatus(false,inputId,'lBpError',measurementAndLabTestFieldValMap);
        }
        break;
      case `${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`:
        if(this.decimalValCheck(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value)
          &&this.decimalValCheck(measurementAndLabTestFieldValMap.get(inputId).value)
          &&measurementAndLabTestFieldValMap.get(inputId).value>=30
          &&measurementAndLabTestFieldValMap.get(inputId).value<=300
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value>=30
          &&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value<=300
          &&(Number(measurementAndLabTestFieldValMap.get(inputId).value)>Number(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value))){
          this.updateErrorStatus(true,inputId,'lBpError',measurementAndLabTestFieldValMap);
        } else {
          this.updateErrorStatus(false,inputId,'lBpError',measurementAndLabTestFieldValMap);
        }
        break;
      default:
        break;
    }
  }

  setBMI=(measurementAndLabTestFieldValMap)=>{
    let weight = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BODY_WEIGHT}`).value;
    let height = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BODY_HEIGHT}`).value;
    let fieldValObj= measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BMI}`);
    if(weight>0&&height>0){
      let bmi = weight/height/height;
      bmi = String(parseFloat(bmi.toFixed(2)));
      if(bmi<BMI_RANGE.OBESITY_ERROR){ //Calculated 'BMI' value should be less than 10
        fieldValObj.value = bmi;
        fieldValObj.isError = true;
        generalUtil.handleOperationType(fieldValObj);
        this.updateValMaps(measurementAndLabTestFieldValMap);
        this.setState({
          measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap,
          bmiWarning : true,
          bmiError : true
        });
        }else {
        if(bmi>=BMI_RANGE.OPTIMAL_WEIGHT&&bmi<=BMI_RANGE.OVERWEIGHT){
          fieldValObj.value = bmi;
          fieldValObj.isError = false;
          generalUtil.handleOperationType(fieldValObj);
          this.updateValMaps(measurementAndLabTestFieldValMap);
          this.setState({
            measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap,
            bmiWarning : false,
            bmiError : false
          });
        }else {
          fieldValObj.value = bmi;
          fieldValObj.isError = false;
          generalUtil.handleOperationType(fieldValObj);
          this.updateValMaps(measurementAndLabTestFieldValMap);
          this.setState({
            measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap,
            bmiWarning : true,
            bmiError : false
          });
        }
      }
    }else{
      fieldValObj.value = '';
      fieldValObj.isError = false;
      generalUtil.handleOperationType(fieldValObj);
      this.updateValMaps(measurementAndLabTestFieldValMap);
      this.setState({
        bmiWarning : false,
        bmiError : false,
        measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap
      });
    }
  }
  //'WHR' will be calculated automatically when 'Waist' and 'Hip' are input.
  setWHR=(measurementAndLabTestFieldValMap)=>{
    let waist = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`).value;
    let hip = measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.HIP}`).value;
    let fieldValObj= measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WHR}`);
    if(waist>0&&hip>0){
      let whr = waist/hip;
      whr = whr.toFixed(2);
      fieldValObj.value = whr;
      generalUtil.handleOperationType(fieldValObj);
      this.updateValMaps(measurementAndLabTestFieldValMap);
      this.setState({
        measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap
      });
    }else {
      fieldValObj.value = '';
      generalUtil.handleOperationType(fieldValObj);
      this.updateValMaps(measurementAndLabTestFieldValMap);
      this.setState({
        measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap
      });
    }
  }

  labRetrievalClick = () =>{
    const { updateState } = this.props;
    updateState&&updateState({
        dervieType:4
    });
  }

  handleAlbuminuriaDropdownChanged = (obj,prefix,mramId) => {
    let { updateStateWithoutRiskProfile, riskProfileFieldValMap } = this.props;
    let fieldValObj = riskProfileFieldValMap.get(`${prefix}_${mramId}`);
    // handle not known
    fieldValObj.value = obj.value===derivePara.BLANK?derivePara.NOT_KNOWN:obj.value;
    generalUtil.handleOperationType(fieldValObj);
    updateStateWithoutRiskProfile&&updateStateWithoutRiskProfile({
      riskProfileFieldValMap:riskProfileFieldValMap
    });
    this.setState({
      albuminuriaVal: obj.value
    });
  }

  render() {
    const { classes,view=false ,selectedGenderCd} = this.props;
    const { measurementAndLabTestFieldValMap,lBpError,rBpError,bmiError, albuminuriaVal, displayAlbuminuriaDL,dervieType} = this.state;
    let ecgDescriptionDisplay = (measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.ECG}`)&&measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.ECG}`).value!=='')?true:false;
    let bmi = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BMI}`)?measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BMI}`).value:'';
    let whr = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WHR}`)?measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WHR}`).value:'';
    // let {bmiWarning} = this.state;
    let bmiWarning = (bmi<18.5||bmi>23)&&bmi!=='';
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent>
          <Typography component="div" className="bgRed">
          <Paper elevation={1} style={{minWidth:'1335px'}} className={classes.paper}>
            <Grid container>
              <Grid container item xs={5} id="divMeasurements">
                <Grid  item xs={12}>
                  <Typography variant="h5" component="h3" className={classes.leftHeader}>Measurements</Typography>
                </Grid>
                <Grid id="gridBloodPressure" container item xs={12} style={{padding:10,height:'95%'}}>
                  <Grid item xs={12} >
                    <Typography className={classes.defultFont}>Blood&nbsp;Pressure</Typography>
                    <Typography className={classes.defultFont} style={{paddingLeft: 30,textAlign:'center'}}>
                      Systolic<sup className={classes.sup}>R</sup>&nbsp;/&nbsp;Diastolic<sup className={classes.sup}>R</sup>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className="MuiGrid-item" style={{height:'7%'}}>
                    <Typography component="div" className={classes.divRow}>
                      <span style={{paddingLeft:9}} className={classNames(classes.span,classes.bottom)}>Sitting&nbsp;(R)</span>
                        <JDecimalTextField
                            classes={{helper_error:classes.helper_error,wrapper:classes.textField,outer:classes.outer}}
                            id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`}
                            rangeValObj={RANGE_BEST_BLOOD_PRESSURE_SYSTOLIC}
                            fieldValMap={measurementAndLabTestFieldValMap}
                            prefix={MRAM_MEASUREMENTS_PREFIX}
                            mramId={MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}
                            updateState={this.props.updateState}
                            abnormalMsg={'Abnormal'}
                            minValMsg="The value should not less than 30."
                            maxValMsg="The value should not greater than 300."
                            mixMode
                            maxLength={3}
                            sideEffect={this.handleInputoChanged}
                            viewMode={view}
                            redBorderController={rBpError}
                        />
                      <span className={classNames(classes.span,classes.bottom)}>/</span>
                      <JDecimalTextField
                          classes={{helper_error:classes.helper_error,wrapper:classes.textField,outer:classes.outer}}
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`}
                          rangeValObj={RANGE_BEST_BLOOD_PRESSURE_DIASTOLIC}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}
                          updateState={this.props.updateState}
                          abnormalMsg={'Abnormal'}
                          minValMsg="The value should not less than 30."
                          maxValMsg="The value should not greater than 300."
                          mixMode
                          maxLength={3}
                          sideEffect={this.handleInputoChanged}
                          viewMode={view}
                          redBorderController={rBpError}
                      />
                      <span className={classNames(classes.span,classes.bottom)}>mmHg</span>
                    </Typography>
                    {rBpError?(
                      <FormHelperText
                          error
                          classes={{
                        root:classes.bloodPressure_error
                      }}
                      >
                      <ErrorOutline className={classes.error_icon} />
                      Diastolic Blood Pressure should be less than or equal to Systolic Blood Pressure
                  </FormHelperText>
                    ):null
                  }
                  </Grid>
                  <Grid item xs={12}  style={{height:'7%'}}>
                    <Typography component="div" className={classes.divRow}>
                      <span className={classes.defultFont} style={{padding: '0px 10px 0px 65px',fontWeight:'bold'}}>(L)</span>
                      <JDecimalTextField
                          classes={{helper_error:classes.helper_error,wrapper:classes.textField}}
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          rangeValObj={RANGE_BEST_BLOOD_PRESSURE_SYSTOLIC}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}
                          updateState={this.props.updateState}
                          abnormalMsg={'Abnormal'}
                          minValMsg="The value should not less than 30."
                          maxValMsg="The value should not greater than 300."
                          mixMode
                          maxLength={3}
                          sideEffect={this.handleInputoChanged}
                          viewMode={view}
                          redBorderController={lBpError}
                      />
                      <span className={classNames(classes.span,classes.bottom)}>/</span>
                      <JDecimalTextField
                          classes={{helper_error:classes.helper_error,wrapper:classes.textField}}
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`}
                          rangeValObj={RANGE_BEST_BLOOD_PRESSURE_DIASTOLIC}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}
                          updateState={this.props.updateState}
                          abnormalMsg={'Abnormal'}
                          minValMsg="The value should not less than 30."
                          maxValMsg="The value should not greater than 300."
                          mixMode
                          maxLength={3}
                          sideEffect={this.handleInputoChanged}
                          viewMode={view}
                          ruleError={lBpError}
                          redBorderController={lBpError}
                      />
                      <span className={classNames(classes.span,classes.bottom)}>mmHg</span>
                    </Typography>
                    {lBpError?(
                      <FormHelperText
                          error
                          classes={{
                        root:classes.bloodPressure_error
                      }}
                      >
                      <ErrorOutline className={classes.error_icon} />
                      Diastolic Blood Pressure should be less than or equal to Systolic Blood Pressure
                  </FormHelperText>
                    ):null
                  }
                  </Grid>
                  <Grid item xs={12} >
                    <Typography component="div" className={classes.divRow} style={{paddingLeft: 2}}>
                      <span className={classes.span}>Pulse&nbsp;(R)</span>
                      <JDecimalTextField
                          classes={{helper_error:classes.helper_error}}
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_PULSE}`}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.RIGHT_PULSE}
                          updateState={this.props.updateState}
                          //abnormalMsg={'The value should not less than 30.'}
                          maxLength={10}
                          // sideEffect={this.handleInputoChanged}
                          viewMode={view}
                      />
                      <span className={classes.span}>(per&nbsp;minute)</span>
                    </Typography>
                  </Grid>

                  <Grid item xs={12} >
                    <Typography component="div" className={classes.divRow} style={{paddingLeft: 50}}>
                      <span className={classes.span}>(L)</span>
                      <JDecimalTextField
                          classes={{helper_error:classes.helper_error}}
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_PULSE}`}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.LEFT_PULSE}
                          updateState={this.props.updateState}
                          //abnormalMsg={'The value should not less than 30.'}
                          maxLength={10}
                          // sideEffect={this.handleInputoChanged}
                          viewMode={view}
                      />
                      <span className={classes.span}>
                        (per&nbsp;minute)
                      </span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} style={{padding:'10px 0px'}}>
                    <Typography className={classes.defultFont}>Body</Typography>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      <Typography component="div"  className={classes.divBodyLeft}>
                        <span className={classes.span}>Weight<sup className={classes.sup} >R</sup></span >
                        <JDecimalTextField
                            classes={{helper_error:classes.helper_error}}
                            id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BODY_WEIGHT}`}
                            fieldValMap={measurementAndLabTestFieldValMap}
                            prefix={MRAM_MEASUREMENTS_PREFIX}
                            mramId={MRAM_MEASUREMENTS_ID.BODY_WEIGHT}
                            updateState={this.props.updateState}
                            //abnormalMsg={'The value should not less than 30.'}
                            maxLength={10}
                            sideEffect={this.handleInputoChanged}
                            viewMode={view}
                        />
                        <span className={classes.span}>kg</span>
                      </Typography>
                      <Typography component="div" className={classes.divBodyLeft} style={{paddingLeft: 4}}>
                          <span className={classes.span}>Height<sup className={classes.sup}>R</sup></span>
                          <JDecimalTextField
                              classes={{helper_error:classes.helper_error}}
                              id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BODY_HEIGHT}`}
                              rangeValObj={RANG_BEST_HEIGHT}
                              fieldValMap={measurementAndLabTestFieldValMap}
                              prefix={MRAM_MEASUREMENTS_PREFIX}
                              mramId={MRAM_MEASUREMENTS_ID.BODY_HEIGHT}
                              updateState={this.props.updateState}
                              abnormalMsg={'The value should less than 3.'}
                              maxLength={10}
                              sideEffect={this.handleInputoChanged}
                              viewMode={view}
                          />
                          <span className={classes.span} style={{paddingRight:16}}>m</span>
                        </Typography>
                    </Grid>
                    <Grid container item xs={6}>
                      <Grid item xs={2}>
                        <Typography component="div">
                          <MergeTypeSharpIcon
                              className={classes.mergeTypeSharpIcon}
                          />
                        </Typography>
                      </Grid>
                      <Grid item xs={10}  className={classes.bodyRight}>
                        <span style={{display:'block'}} className={classes.lableSpan}>BMI</span >
                        <Typography component="div" className={classes.divBodyLeft}>
                          <TextField
                              id="span_BMI"
                              variant="outlined"
                              InputProps={{
                                className:bmiWarning?classes.abnormal:null,
                                style:{marginRight:6},
                                classes: {
                                  input: classes.input
                                }
                              }}
                              value={bmi}
                              error={bmiWarning}
                          />
                          <span className={classes.lableSpan}>kg/m<sup style={{fontSize:1}}>2</sup></span>
                        </Typography>
                        {bmiError?(
                            <FormHelperText
                                error
                                classes={{
                              root:classes.bmiError
                            }}
                            >
                            <ErrorOutline className={classes.error_icon} />
                              BMI should not be less than 10.
                            </FormHelperText>
                              ):null
                          }
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6} >
                      <Typography component="div" className={classes.divBodyLeft} style={{ paddingLeft: 12}}>
                        <span className={classes.span}>Waist<sup className={classes.sup} >R</sup></span >
                        <JDecimalTextField
                            classes={{helper_error:classes.helper_error}}
                            id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`}
                            rangeValObj={selectedGenderCd===Enum.GENDER_FEMALE_VALUE?RANGE_BEST_WAIST_FEMALE:RANGE_BEST_WAIST_MALE}
                            fieldValMap={measurementAndLabTestFieldValMap}
                            prefix={MRAM_MEASUREMENTS_PREFIX}
                            mramId={MRAM_MEASUREMENTS_ID.WAIST}
                            updateState={this.props.updateState}
                            // abnormalMsg={selectedGenderCd===Enum.GENDER_FEMALE_VALUE?`The value should not less than ${RANGE_BEST_WAIST_FEMALE.minVal} and greater than ${RANGE_BEST_WAIST_FEMALE.maxVal}.`:`The value should not less than ${RANGE_BEST_WAIST_MALE.minVal} and greater than ${RANGE_BEST_WAIST_MALE.maxVal}.`}
                            maxLength={10}
                            // errorIconOpen={false}
                            sideEffect={this.handleInputoChanged}
                            viewMode={view}
                            abnormalFlag={generalUtil.abnormalCheck(measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`)===undefined?'':measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`).value,selectedGenderCd===Enum.GENDER_FEMALE_VALUE?RANGE_BEST_WAIST_FEMALE:RANGE_BEST_WAIST_MALE)}
                        />
                        <span className={classes.span}>cm</span>
                      </Typography>
                      <Typography component="div" className={classes.divBodyLeft} style={{paddingLeft: 29}}>
                        <span className={classes.span}>Hip</span>
                        <JDecimalTextField
                            classes={{helper_error:classes.helper_error}}
                            id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.HIP}`}
                            fieldValMap={measurementAndLabTestFieldValMap}
                            prefix={MRAM_MEASUREMENTS_PREFIX}
                            mramId={MRAM_MEASUREMENTS_ID.HIP}
                            updateState={this.props.updateState}
                              //abnormalMsg={'The value should not less than 30.'}
                            maxLength={10}
                            sideEffect={this.handleInputoChanged}
                            viewMode={view}
                        />
                        <span className={classes.span}>cm</span>
                      </Typography>
                    </Grid>
                    <Grid container item xs={6} >
                      <Grid item xs={2} >
                        <Typography component="div" style={{display:'inline',float: 'left'}}>
                          <MergeTypeSharpIcon
                              className={classes.mergeTypeSharpIcon}
                          />
                        </Typography>
                      </Grid>
                      <Grid item xs={10} className={classes.bodyRight}>
                        <span style={{display:'block'}} className={classes.lableSpan}>WHR</span >
                          <Typography component="div" className={classes.divBodyLeft} style={{paddingRight:45}}>
                            <TextField
                                id="span_WHR"
                                variant="outlined"
                                InputProps={{
                                  classes: {input: classes.input},
                                  style:{marginRight:6}
                                }}
                                value={whr}
                            />
                          </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={5} >
                      <Typography className={classNames(classes.defultFont,classes.paddingTop)} >
                        Periodontitis
                      </Typography>
                    </Grid>
                    <Grid item xs={7} >
                      <Typography  component="div">
                      <RadioField
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.PERIODONTITIS}`}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.PERIODONTITIS}
                          updateState={this.props.updateState}
                          radioOptions={RADIO_OPTION_1}
                          viewMode={view}
                      />
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} >
                    <Grid item xs={5} >
                      <Typography className={classNames(classes.defultFont,classes.paddingTop)} >
                        ECG
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography component="div" >
                      <RadioField
                          id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.ECG}`}
                          fieldValMap={measurementAndLabTestFieldValMap}
                          prefix={MRAM_MEASUREMENTS_PREFIX}
                          mramId={MRAM_MEASUREMENTS_ID.ECG}
                          updateState={this.props.updateState}
                          radioOptions={RADIO_OPTION_2}
                          sideEffect={this.handleRadiChanged}
                          viewMode={view}
                      />
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{height:'10%'}}>
                    <Grid item xs={5} >
                    </Grid>
                    <Grid item xs={7} >
                    {ecgDescriptionDisplay?(
                    <Typography component="div">
                        <TextareaField
                            classes={{textBox:classes.textBox}}
                            id={`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID}`}
                            fieldValMap={measurementAndLabTestFieldValMap}
                            prefix={MRAM_MEASUREMENTS_PREFIX}
                            mramId={MRAM_MEASUREMENTS_ID.ECG_DESCRIPTION}
                            updateState={this.props.updateState}
                            viewMode={view}
                            maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                        />
                      </Typography>
                      ):<Typography component="div" >
                        <textarea className={clsx(classes.textBox, classes.textareaDisabled)} disabled></textarea>
                      </Typography>
                    }
                    </Grid>
                  </Grid>
                  {/* Albuminuria
                    当derviceType的值为null时 dropdown隐藏不改变risk profile中Albuminuria的值
                  */}
                  <Grid container item xs={12} style={{display:displayAlbuminuriaDL?'flex':'none'}}>
                    <Grid item xs={5}>
                      <Typography className={classNames(classes.defultFont,classes.paddingTop)}>
                        Albuminuria
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography component="div" >
                        <ValidatorForm onSubmit={()=>{}}>
                          <JCustomizedSelectFieldValidator
                              id={`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}_Dropdown`}
                              options={
                                DL_ALBUMINURIA.map(option => {
                                  return {
                                    label: option.label,
                                    value: option.value
                                  };
                                })
                              }
                              value={albuminuriaVal}
                              isDisabled={view}
                              styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                              menuPortalTarget={document.body}
                              onChange={(obj)=>{this.handleAlbuminuriaDropdownChanged(obj,MRAM_RISKPROFILE_RSPF_PREFIX,MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA);}}
                          />
                          <label className={classes.defultFont}>Please input for deriving rule</label>
                        </ValidatorForm>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container item xs={7} id="divLaboratoryTest" >
                <Grid  item xs={12}>
                  <Typography variant="h5" component="h3" className={classes.rightHeader}>Laboratory Tests</Typography>
                </Grid>
                <Grid id="gridLabRetrieval" item xs={12} className={classes.labRetrievalBorder}>
                  {/* <CIMSButton  onClick={() =>this.labRetrievalClick()}>Lab&nbsp;<u style={{fontSize:'1rem'}}>R</u>etrieval</CIMSButton>
                  <div style={{display:'inline-flex'}}>
                  <span style={{paddingLeft:'10',fontSize:'1rem',fontWeight:'bold',marginTop: 7}}>Last retrieval&nbsp;:&nbsp;</span>
                  <JDecimalTextField
                      classes={{helper_error:classes.helper_error}}
                      id={`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.LAST_RETRIEVAL}`}
                      fieldValMap={measurementAndLabTestFieldValMap}
                      prefix={MRAM_LABTEST_PREFIX}
                      mramId={MRAM_LABTEST_ID.LAST_RETRIEVAL}
                      updateState={this.props.updateState}
                      //abnormalMsg={'The value should not less than 30.'}
                      maxLength={10}
                      sideEffect={this.handleInputoChanged}
                      viewMode={view}
                  />
                  </div> */}
                </Grid>
                <Grid  item xs={12}>
                  <Typography component="div" style={{}}>
                    <CIMSTable data={this.state.data}
                        updateState={this.props.updateState}
                        measurementAndLabTestFieldValMap={measurementAndLabTestFieldValMap}
                        voList={this.state.voList}
                        getSelectRow={()=>{}}
                        id="labTestTable"
                        options={this.state.tableOptions}
                        rows={this.state.tableRows}
                        rowsPerPage={this.state.pageNum}
                        selectRow={null}
                        className={classes.cimsTtable}
                        set={this.state.tipsListSize}
                        tipsListSize={this.state.tipsListSize}
                        view={view}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            </Paper>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    sysConfig:state.clinicalNote.sysConfig
  };
}
const mapDispatchToProps = {
  openCommonMessage
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(measurementAndLabTest));