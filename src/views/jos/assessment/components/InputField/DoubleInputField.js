import React, { Component } from 'react';
import { TextField, withStyles, FormHelperText } from '@material-ui/core';
import {styles} from './InputFieldStyle';
import '../../../common/css/commonStyle.css';
import { isUndefined } from 'lodash';
import { DATA_TYPE,specialUnitMap } from '../../../../../constants/assessment/assessmentConstants';
import * as generalUtil from '../../utils/generalUtil';
import { ErrorOutline } from '@material-ui/icons';
import { trim,findIndex } from 'lodash';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class DoubleInputField extends Component {
  constructor(props){
    super(props);
    this.state={
      abnormalFlag1: false,
      abnormalFlag2: false,
      errorFlag1: false,
      errorFlag2: false,
      inputVal1: '',
      inputVal2: '',
      encounterId: ''
    };
    this.resetStatus = _.debounce(this.resetStatus, 800);
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap, assessmentCd, rowId, field, fieldNormalRangeMap } = props;
    let abnormalFlag1 = false,
        abnormalFlag2 = false,
        errorFlag1 = false,
        errorFlag2 = false,
        inputVal1 = '',
        inputVal2 = '',
        required1 = NULLABLE_STATUS.ALLOW_NULL,
        required2 = NULLABLE_STATUS.ALLOW_NULL;

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
            abnormalFlag2 = generalUtil.abnormalCheck(inputVal2,assessmentCd,field.codeAssessmentFieldI2,fieldNormalRangeMap);
          }
        }
      }
    }
    if (props.encounterId !== state.encounterId||inputVal1!==state.inputVal1||inputVal2!==state.inputVal2||required1!==state.required1||required2!=state.required2) {
      return {
        encounterId: props.encounterId,
        abnormalFlag1,
        abnormalFlag2,
        errorFlag1,
        errorFlag2,
        inputVal1,
        inputVal2,
        required1,
        required2
      };
    }
    return null;
  }

  handleDoubleChange = (event, assessmentCd, fieldId, rowId, targetNum) => {
    let { fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = event.target.value;
    // vals[rowId].isError=!generalUtil.illegalValidation(vals[rowId].val,DATA_TYPE.DOUBLE)?false:true;
    // let abnormalFlag = generalUtil.abnormalCheck(event.target.value,assessmentCd,fieldId,fieldNormalRangeMap);
    this.setState({
      ['inputVal'+targetNum]:event.target.value
      // ['errorFlag'+targetNum]:vals[rowId].isError,
      // ['abnormalFlag'+targetNum]:abnormalFlag
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

  handleBlur = (event, assessmentCd, fieldId, rowId,targetNum) => {
    let { updateState, fieldValMap, assessmentItems,fieldNormalRangeMap } = this.props;
    let assessmentRow = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === assessmentCd;
    });
    let currentItem = assessmentItems[assessmentRow].codeAssessmentFields;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    // vals[rowId].val = trim(vals[rowId].val);
    vals[rowId].isError=!generalUtil.illegalValidation(vals[rowId].val,DATA_TYPE.DOUBLE)?false:true;
    let abnormalFlag = generalUtil.abnormalCheck(event.target.value,assessmentCd,fieldId,fieldNormalRangeMap);
    this.setState({
      ['errorFlag'+targetNum]:vals[rowId].isError,
      ['abnormalFlag'+targetNum]:abnormalFlag
    });

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
       if (currentItem[index].codeAssessmentFieldId === fieldId && currentItem[index].dataType != 'TIME') {
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
                     if (trim(valueFieldValMap.get(timeObj.codeAssessmentFieldId)[rowId].val) != '' && valueFieldValMap.get(timeObj.codeAssessmentFieldId)[rowId].val != null) {
                       timeChange = false;
                     }
                   } else {
                     timeChange = true;
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
    updateState && updateState({
      isEdit: true,
      fieldValMap
    });
  }

  render(){
    let { classes, assessmentCd, rowId, field, saveFlag} = this.props;
    let { abnormalFlag1, abnormalFlag2, errorFlag1, errorFlag2, inputVal1, inputVal2, required1, required2} = this.state;

    let numberInputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        style: styles.input,
        maxLength: 6
      }
    };

    return(
      <div>
        <div className={classes.double_wrapper_1}>
          <TextField
              id={`assessment_field_double_${field.codeAssessmentFieldId}_${rowId}`}
              InputProps={{
                className: errorFlag1?classes.abnormal:(abnormalFlag1?classes.abnormal:(!saveFlag&&inputVal1===''&&required1===NULLABLE_STATUS.NOT_ALLOW_NULL?classes.abnormal:null))
              }}
              error={!errorFlag1?abnormalFlag1?true:(!saveFlag&&inputVal1===''&&required1===NULLABLE_STATUS.NOT_ALLOW_NULL?true:false):true}
              value={inputVal1}
              className={classes.normal_input}
              onBlur={event => { this.handleBlur(event, assessmentCd, field.codeAssessmentFieldId, rowId, '1'); }}
              onChange={event => {this.handleDoubleChange(event,assessmentCd,field.codeAssessmentFieldId,rowId,'1');}}
              {...numberInputProps}
          />
          {!isUndefined(field.objUnit) ? (
            <div className={classes.unit_wrapper}>
              {/* <span className={classes.unit_span} dangerouslySetInnerHTML={{__html:specialUnitMap.has(field.objUnit)?specialUnitMap.get(field.objUnit):field.objUnit}} /> */}
              <span className={classes.unit_span}>{specialUnitMap.has(field.objUnit)?(<span>kg/m<sup>2</sup></span>):field.objUnit}</span>
            </div>
          ) : null}
          {errorFlag1?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon}/>
              {/* Illegal Characters */}
              Invalid Entry
            </FormHelperText>
          ):(!saveFlag&&inputVal1===''&&required1===NULLABLE_STATUS.NOT_ALLOW_NULL?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
            <ErrorOutline className={classes.error_icon}/>
              This field is required
            </FormHelperText>
          ):null)}
          {/* :null} */}
        </div>
        {/* union unit */}
        {!isUndefined(field.codeAssessmentFieldId2) ? (
          <div className={classes.double_wrapper_2}>
            <TextField
                id={`assessment_field_double_${field.codeAssessmentFieldId2}_${rowId}`}
                InputProps={{
                  className: errorFlag2?classes.abnormal:(abnormalFlag2?classes.abnormal:(!saveFlag&&inputVal2===''&&required2===NULLABLE_STATUS.NOT_ALLOW_NULL?classes.abnormal:null))
                }}
                error={!errorFlag2?abnormalFlag2?true:(!saveFlag&&inputVal2===''&&required2===NULLABLE_STATUS.NOT_ALLOW_NULL?true:false):true}
                value={inputVal2}
                className={classes.normal_input}
                onChange={event => {this.handleDoubleChange(event,assessmentCd,field.codeAssessmentFieldId2,rowId,'2');}}
                {...numberInputProps}
            />
            {!isUndefined(field.objUnit2) ? (
              <div className={classes.unit_wrapper}>
                {/* <span className={classes.unit_span} dangerouslySetInnerHTML={{__html:specialUnitMap.has(field.objUnit2)?specialUnitMap.get(field.objUnit2):field.objUnit2}} /> */}
                <span className={classes.unit_span}>{specialUnitMap.has(field.objUnit2)?(<span>kg/m<sup>2</sup></span>):field.objUnit2}</span>
              </div>
            ) : null}
            {errorFlag2?(
              <div className={classes.helper_wrapper}>
                <FormHelperText
                    error
                    classes={{
                      error:classes.helper_error
                    }}
                >
                  <ErrorOutline className={classes.error_icon}/>
                  {/* Illegal Characters */}
                  Invalid Entry
                </FormHelperText>
              </div>
            ):(!saveFlag&&inputVal2===''&&required2===NULLABLE_STATUS.NOT_ALLOW_NULL?(
              <div className={classes.helper_wrapper}>
                <FormHelperText
                    error
                    classes={{
                      error:classes.helper_error
                    }}
                >
                <ErrorOutline className={classes.error_icon}/>
                  This field is required
                </FormHelperText>
              </div>
            ):null)}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles)(DoubleInputField);