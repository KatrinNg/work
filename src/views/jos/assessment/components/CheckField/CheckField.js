import React, { Component } from 'react';
import { FormControlLabel, withStyles, Checkbox, FormHelperText} from '@material-ui/core';
import { styles } from './CheckFieldStyle';
import { CHECKBOX_STATUS } from '../../../../../constants/assessment/assessmentConstants';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';
import * as generalUtil from '../../utils/generalUtil';
import { ErrorOutline } from '@material-ui/icons';
import {findIndex,trim} from 'lodash';

class CheckField extends Component {
  constructor(props){
    super(props);
    this.state={
      abnormalFlag:false,
      checkFlag:false
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { field, rowId, assessmentCd, fieldValMap, fieldNormalRangeMap } = props;
    let val = '',
        abnormalFlag = false,
        required = NULLABLE_STATUS.ALLOW_NULL;
    if (fieldValMap.has(assessmentCd)) {
      let tempfieldMap = fieldValMap.get(assessmentCd);
      let fieldValArray = tempfieldMap.get(field.codeAssessmentFieldId);
      val = fieldValArray!==undefined?fieldValArray[rowId].val:'';
      required = field.nullable;
      let errorFlag = fieldValArray!==undefined?fieldValArray[rowId].isError:false;
      if (!errorFlag) {
        abnormalFlag = generalUtil.abnormalCBCheck(val,assessmentCd,field.codeAssessmentFieldId,fieldNormalRangeMap);
      }
    }
    if (props.encounterId !== state.encounterId||val !== state.val||required !== state.required) {
      return {
        encounterId: props.encounterId,
        checkFlag:val!==''?true:false,
        abnormalFlag,
        required
      };
    }
    return null;
  }

  handleCheckBoxChange = (assessmentCd, fieldId, rowId, event) => {
    let { updateState,fieldValMap,fieldNormalRangeMap,assessmentItems } = this.props;
    let assessmentRow = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === assessmentCd;
    });
    let currentItem = assessmentItems[assessmentRow].codeAssessmentFields;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = event.target.checked?CHECKBOX_STATUS.CHECKED:CHECKBOX_STATUS.UNCHECKED;
    let abnormalFlag = generalUtil.abnormalCBCheck(vals[rowId].val,assessmentCd,fieldId,fieldNormalRangeMap);
    this.setState({
      checkFlag:event.target.checked,
      abnormalFlag
    });
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
    if(timeChange){
      if (event.target.checked) {
        let date = new Date();
        let dateTime = date.getHours() + ':' + date.getMinutes();
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
    let { classes, field, rowId, assessmentCd, saveFlag } = this.props;
    let {checkFlag,abnormalFlag,required} = this.state;
    return(
      <div className={classes.check_wrapper}>
        <FormControlLabel
            control={
              <Checkbox
                  id={`assessment_item_checkbox_${field.codeAssessmentFieldId}_${rowId}`}
                  classes={{
                    checked: abnormalFlag?classes.abnormal:null
                  }}
                  color="primary"
                  checked={checkFlag}
                  onChange={event => {this.handleCheckBoxChange(assessmentCd,field.codeAssessmentFieldId,rowId,event);}}
              />
            }
        />
        {!saveFlag&&!checkFlag&&required===NULLABLE_STATUS.NOT_ALLOW_NULL?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon}/>
                This field is required
            </FormHelperText>
          ):null}
      </div>
    );
  }
}

export default withStyles(styles)(CheckField);