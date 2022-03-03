import React, { Component } from 'react';
import { styles } from './InputFieldStyle';
import { TextField, withStyles, FormHelperText } from '@material-ui/core';
import { trim, findIndex } from 'lodash';
import { ErrorOutline } from '@material-ui/icons';
import { MuiThemeProvider,createMuiTheme } from '@material-ui/core/styles';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

const customTheme = (theme) =>{
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiOutlinedInput: {
        multiline: {
          // padding: '8.5px 10px'
          padding: '2px 10px',
          minHeight: 36
          // maxHeight: 55
        }
      }
    }
  });
};

class TextareaField extends Component {
  constructor(props){
    super(props);
    this.state={
      val: ''
    };
    this.resetStatus = _.debounce(this.resetStatus, 800);
  }

  static getDerivedStateFromProps(props, state) {
    let { field, rowId, assessmentCd, fieldValMap } = props;
    let val = '',
    required=NULLABLE_STATUS.ALLOW_NULL;
    if (fieldValMap.has(assessmentCd)) {
      let tempfieldMap = fieldValMap.get(assessmentCd);
      let fieldValArray = tempfieldMap.get(field.codeAssessmentFieldId);
      val = fieldValArray[rowId].val;
      required = field.nullable;
    }
    if (required!==state.required || val!==state.val) {
      return {
        val,
        required
      };
    } else{
      return null;
    }
  }


  handleTextChange = (event, assessmentCd, fieldId, rowId) => {
    let { fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    let valueStr = event.target.value;
    //计算中英文字符，中文算3个字节,空格也算1个
    let countIn = 0;
    for (let i = 0; i < valueStr.length; i++) {
      const element = valueStr.charCodeAt(i);
      if (element >= 0 && element <= 255) {
        countIn += 1;
      } else {
        countIn += 3;
      }
    }
    if (countIn > 1000) {
      this.setState({
        val: valueStr.slice(0, 1000),
        changeFlag: true
      });
    } else {
      vals[rowId].val = valueStr;
      this.setState({
        val: valueStr,
        changeFlag: true
      });
    }
    this.resetStatus(fieldValMap);
  };

  resetStatus = (fieldValMap) =>{
    let { updateState } = this.props;
    updateState && updateState({
      isEdit:true,
      fieldValMap
    });
  }

  handleBlur = (assessmentCd, fieldId, rowId) => {
    let { updateState, fieldValMap,assessmentItems } = this.props;
    let { val } = this.state;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = val;
    let assessmentRow = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === assessmentCd;
    });
    let currentItem=assessmentItems[assessmentRow].codeAssessmentFields;
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
    this.setState({
      val: vals[rowId].val
    });
    updateState && updateState({
      isEdit:true,
      fieldValMap
    });
  }

  render(){
    let { classes, field, rowId, assessmentCd, saveFlag } = this.props;
    let { val, required } = this.state;
    return(
      <div className={classes.string_field_wrapper} style={{flex:1}}>
        <MuiThemeProvider theme={customTheme}>
          <TextField
              id={`assessment_field_textarea_string_${field.codeAssessmentFieldId}_${rowId}`}
              autoCapitalize="off"
              variant="outlined"
              type="text"
              className={classes.normal_inputRemark}
              onBlur={() => { this.handleBlur(assessmentCd, field.codeAssessmentFieldId, rowId); }}
              onChange={event => { this.handleTextChange(event, assessmentCd, field.codeAssessmentFieldId, rowId); }}
              value={val}
              error={!saveFlag && val === '' && required === NULLABLE_STATUS.NOT_ALLOW_NULL ? true : false}
              multiline
              rowsMax={3}
              inputProps={{
                wrap: 'on',
                style: {
                  ...styles.input,
                  overflowX: 'auto'
                }
              }}
              InputProps={{
                className: (!saveFlag && val === '' && required === NULLABLE_STATUS.NOT_ALLOW_NULL) ? classes.abnormal : null
              }}
          />
        </MuiThemeProvider>
        {(!saveFlag && val === '' && required === NULLABLE_STATUS.NOT_ALLOW_NULL) ? (
          <FormHelperText error classes={{ error: classes.helper_error }}>
            <ErrorOutline className={classes.error_icon} />
              This field is required
          </FormHelperText>
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles)(TextareaField);