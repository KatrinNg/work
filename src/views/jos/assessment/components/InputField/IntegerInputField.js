import React, { Component } from 'react';
import { TextField, withStyles, FormHelperText } from '@material-ui/core';
import {styles} from './InputFieldStyle';
import { isUndefined,findIndex, trim } from 'lodash';
import { DATA_TYPE,specialUnitMap } from '../../../../../constants/assessment/assessmentConstants';
import * as generalUtil from '../../utils/generalUtil';
import { ErrorOutline } from '@material-ui/icons';
import '../../../common/css/commonStyle.css';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class IntegerInputField extends Component {
  constructor(props){
    super(props);
    this.state={
      abnormalFlag1: false,
      abnormalFlag2: false,
      errorFlag1: false,
      errorFlag2: false,
      inputVal1: '',
      inputVal2: '',
      encounterId: '',
      saveFlag: true,
      errorMess1: 'Invalid Entry',
      errorMess2: 'Invalid Entry'
    };
    this.resetStatus = _.debounce(this.resetStatus, 800);
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap, assessmentCd, rowId, field, fieldNormalRangeMap } = props;
    let abnormalFlag1 = false,
        abnormalFlag2 = false,
        errorFlag1 = false,
        errorFlag2 = false,
        saveFlag = state.saveFlag,
        inputVal1 = '',
        inputVal2 = '',
        required1 = NULLABLE_STATUS.NOT_ALLOW_NULL,
        required2 = NULLABLE_STATUS.NOT_ALLOW_NULL;
    if (fieldValMap.has(assessmentCd)) {
      let tempfieldMap = fieldValMap.get(assessmentCd);
      let fieldValArray = tempfieldMap.get(field.codeAssessmentFieldId);
      if (!isUndefined(fieldValArray)) {
        inputVal1 = fieldValArray[rowId].val;
        errorFlag1 = fieldValArray[rowId].isError;
        required1 = field.nullable;
        if (!errorFlag1) {
          abnormalFlag1 = generalUtil.abnormalCheck(inputVal1,assessmentCd,field.codeAssessmentFieldId,fieldNormalRangeMap);
        }
      }
      if (!isUndefined(field.codeAssessmentFieldId2)) {
        let fieldValArray2 = tempfieldMap.get(field.codeAssessmentFieldId2);
        if (!isUndefined(fieldValArray2)) {
          inputVal2 = fieldValArray2[rowId].val;
          errorFlag2 = fieldValArray2[rowId].isError;
          required2 = field.nullable;
          if (!errorFlag2) {
            abnormalFlag2 = generalUtil.abnormalCheck(inputVal2,assessmentCd,field.codeAssessmentFieldId2,fieldNormalRangeMap);
          }
        }
      }
    }
    if (inputVal1 === '' && inputVal2 === '') { saveFlag = true; }
    if (
      props.encounterId !== state.encounterId ||
      inputVal1 !== state.inputVal1 ||
      inputVal2 !== state.inputVal2 ||
      required1 !== state.required1 ||
      required2 !== state.required2
      ) {
      return {
        encounterId: props.encounterId,
        abnormalFlag1,
        abnormalFlag2,
        errorFlag1,
        errorFlag2,
        inputVal1,
        inputVal2,
        required1,
        required2,
        saveFlag
      };
    }
    return null;
  }

  handleIntegerChange = (event, assessmentCd, fieldId, rowId, targetNum) => {
    let { fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = event.target.value;
    vals[rowId].isError = !generalUtil.illegalValidation(vals[rowId].val, DATA_TYPE.INTEGER) ? false : true;
    if (assessmentCd === 'BP') {
      let errorBool = !generalUtil.illegalValidation(vals[rowId].val, DATA_TYPE.INTEGER) ? false : true;
      if (targetNum === '1') {
        vals[rowId].bpError = errorBool;
      } else if (targetNum === '2') {
        vals[rowId].bpError = errorBool;
      }
    }
    this.setState({
      ['inputVal' + targetNum]: event.target.value
    });
    this.resetStatus(fieldValMap);
  }

  resetStatus = (fieldValMap) =>{
    let { updateState } = this.props;
    updateState && updateState({
      isEdit:true,
      fieldValMap
    });
  }

  handleIntegerBlur=(event,assessmentCd,rowId,targetNum,fieldId)=>{
    let saveFlag=true;
    let { updateState,fieldValMap,assessmentItems,fieldNormalRangeMap } = this.props;
    let assessmentRow = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === assessmentCd;
    });
    let currentItem = assessmentItems[assessmentRow].codeAssessmentFields;

     // Control time display New
     let timeChange=true;
     let timeObj=null;
     for (let indexNum = 0; indexNum < currentItem.length; indexNum++) {
         if(currentItem[indexNum].dataType==='TIME'){
             timeObj=currentItem[indexNum];
             break;
         }
     }
    for (let index = 0; index < currentItem.length; index++) {
      const element = currentItem[index];
      if (element.codeAssessmentFieldId === fieldId && element.dataType != 'TIME') {
        if (timeObj != null) {
          let valueFieldValMap = new Map();
          valueFieldValMap = fieldValMap.get(assessmentCd);
          for (let key of valueFieldValMap.entries()) {
            if (key != fieldId && key != timeObj.codeAssessmentFieldId) {
              let otherItem = null;
              currentItem.forEach(item => {
                if (item.codeAssessmentFieldId != timeObj.codeAssessmentFieldId && item.codeAssessmentFieldId != fieldId) {
                  otherItem = item;
                }
                if (otherItem != null) {
                  if (trim(valueFieldValMap.get(otherItem.codeAssessmentFieldId)[rowId].val) != '' && valueFieldValMap.get(otherItem.codeAssessmentFieldId)[rowId].val != null) {
                    timeChange = false;
                  }
                }
              });
            }
          }
        }
      }
    }
    if (timeChange) {
      if (trim(event.target.value).length > 0) {
        let date = new Date();
        let dateMin = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        let dateTime = date.getHours() + ':' + dateMin;
        for (let index = 0; index < currentItem.length; index++) {
          if (currentItem[index].dataType === 'TIME') {
            let fieldIdRow = currentItem[index].codeAssessmentFieldId;
            let valsInfo = fieldValMap.get(assessmentCd).get(fieldIdRow);
            if (valsInfo[rowId].val === '') {
              valsInfo[rowId].val = dateTime;
              valsInfo[rowId].isError = false;
            }
          }
        }
      } else {
        for (let index = 0; index < currentItem.length; index++) {
          if (currentItem[index].dataType === 'TIME') {
            let fieldIdRow = currentItem[index].codeAssessmentFieldId;
            let valsInfo = fieldValMap.get(assessmentCd).get(fieldIdRow);
            valsInfo[rowId].val = '';
            valsInfo[rowId].isError = false;
          }
        }
      }
    }
    if(assessmentCd==='BP'){
      let paramValue1 = '', paramValue2 = '';
      for (let index = 0; index < currentItem.length; index++) {
        const element = currentItem[index];
        if(element.dataType==='INTEGER'){
          let idResult = element.displaySeq;
          let indexfieId = element.codeAssessmentFieldId;
          let valsRow = fieldValMap.get(assessmentCd).get(indexfieId);
          let values = valsRow[rowId].val;
          valsRow[rowId].bpError = false;
          paramValue1 = idResult === 1 ? (idResult === targetNum ? event.target.value : values) : paramValue1;
          paramValue2 = idResult === 2 ? (idResult === targetNum ? event.target.value : values) : paramValue2;
        }
      }
      let bpError = false;
      if (!paramValue1 && paramValue2) {
        saveFlag = false;
        this.setState({ inputVal1: '' });
        bpError = true;
        let indexfieId = currentItem[0].codeAssessmentFieldId;
        let valsRow = fieldValMap.get(assessmentCd).get(indexfieId);
        valsRow[rowId].bpError = bpError;
      }
      else if (paramValue1 && !paramValue2) {
        saveFlag = false;
        this.setState({ inputVal2: '' });
        bpError = true;
        let indexfieId = currentItem[1].codeAssessmentFieldId;
        let valsRow = fieldValMap.get(assessmentCd).get(indexfieId);
        valsRow[rowId].bpError = bpError;
      }
      else if (!paramValue1 && !paramValue2) {
        this.setState({
          ['errorFlag' + 1]: false,
          ['errorFlag' + 2]: false,
          ['abnormalFlag' + 1]: false,
          ['abnormalFlag' + 2]: false
        });
      }
    }
    if (trim(event.target.value).length > 0) {
      this.setState({
        saveFlag:saveFlag,
        ['errorFlag' + targetNum]: !generalUtil.illegalValidation(event.target.value, DATA_TYPE.INTEGER) ? false : true,
        ['abnormalFlag' + targetNum]: generalUtil.abnormalCheck(event.target.value, assessmentCd, fieldId, fieldNormalRangeMap)
      });
    }
    else{
      this.setState({ saveFlag: saveFlag, ['errorFlag' + targetNum]: false });
    }
    updateState &&updateState({
      // saveBpFlag:saveFlag,
      isEdit:true,
      fieldValMap
    });
  }

  render(){
    let { classes, assessmentCd, rowId, field} = this.props;
    let {
      abnormalFlag1, abnormalFlag2,
      errorFlag1, errorFlag2,
      inputVal1, inputVal2, saveFlag,
      errorMess1, errorMess2
    } = this.state;
    let numberInputProps = {
      autoCapitalize: 'off',
      variant: 'outlined',
      type: 'text',
      inputProps: {
        style: styles.input,
        maxLength: 6
      }
    };

    return(
      <div>
        <div className={classes.double_wrapper_1}>
          <TextField
              id={`assessment_field_integer_${field.codeAssessmentFieldId}_${rowId}`}
              InputProps={{//&&required1===0
                className: errorFlag1?classes.abnormal:(abnormalFlag1?classes.abnormal:(!saveFlag&&inputVal1===''?classes.abnormal:null))
              }}
              //&&required1===0
              error={!errorFlag1?abnormalFlag1?true:(!saveFlag&&inputVal1===''?true:false):true}
              value={inputVal1}
              className={classes.normal_input}
              onBlur={event => { this.handleIntegerBlur(event, assessmentCd, rowId, '1',field.codeAssessmentFieldId); }}
              onChange={event => { this.handleIntegerChange(event, assessmentCd, field.codeAssessmentFieldId, rowId, '1'); }}
              {...numberInputProps}
          />
          {!isUndefined(field.objUnit) ? (
            <div className={classes.unit_wrapper}>
              <span className={classes.unit_span}>{specialUnitMap.has(field.objUnit)?(<span>kg/m<sup>2</sup></span>):field.objUnit}</span>
            </div>
          ) : null}
          {errorFlag1 && saveFlag ? (
            <FormHelperText error classes={{ error: classes.helper_error }}>
              <ErrorOutline className={classes.error_icon} />
              {errorMess1}
            </FormHelperText>
          ) : null}
        </div>
        {/* union unit */}
        {!isUndefined(field.codeAssessmentFieldId2) ? (
          <div className={classes.double_wrapper_2}>
            <TextField
                id={`assessment_field_integer_${field.codeAssessmentFieldId2}_${rowId}`}
                InputProps={{//&&required2===0
                  className: errorFlag2?classes.abnormal:(abnormalFlag2?classes.abnormal:(!saveFlag&&inputVal2===''?classes.abnormal:null))
                }}//&&required2===0
                error={!errorFlag2?abnormalFlag2?true:(!saveFlag&&inputVal2===''?true:false):true}
                value={inputVal2}
                className={classes.normal_input}
                onBlur={event => { this.handleIntegerBlur(event, assessmentCd,rowId, '2',field.codeAssessmentFieldId2); }}
                onChange={event => { this.handleIntegerChange(event, assessmentCd, field.codeAssessmentFieldId2, rowId, '2'); }}
                {...numberInputProps}
            />
            {!isUndefined(field.objUnit2) ? (
              <div className={classes.unit_wrapper}>
                <span className={classes.unit_span}>{specialUnitMap.has(field.objUnit2)?(<span>kg/m<sup>2</sup></span>):field.objUnit2}</span>
              </div>
            ) : null}
            {errorFlag2?(
              <div className={classes.helper_wrapper}>
                <FormHelperText error classes={{ error: classes.helper_error }}>
                  <ErrorOutline className={classes.error_icon}/>
                  {errorMess2}
                </FormHelperText>
              </div>
            ):null}
          </div>
        ) : null}
        {errorFlag1 && !saveFlag ? (
          <FormHelperText error classes={{ error: classes.helper_error }}>
            <ErrorOutline className={classes.error_icon} />
              Invalid Entry
          </FormHelperText>
        ) : null}
        {
          !saveFlag ?
            <FormHelperText error classes={{ error: classes.helper_error }}>
              {
                inputVal1 === '' ? <div><ErrorOutline className={classes.error_icon} />The systolic pressure should be input with the diastolic pressure as provided</div>:
                  inputVal2 === '' ? <div><ErrorOutline className={classes.error_icon} />The diastolic pressure should be input with the systolic pressure as provided</div> : ''
              }
            </FormHelperText> : null
        }
      </div>
    );
  }
}

export default withStyles(styles)(IntegerInputField);