import React, { Component } from 'react';
import moment from 'moment';
import { dataTypeForamtMap } from '../../../../../constants/assessment/assessmentConstants';
import { withStyles } from '@material-ui/core';
import { styles } from './InputFieldStyle';
import { isNull } from 'lodash';
import { KeyboardTimePicker } from '@material-ui/pickers';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import _ from 'lodash';

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiPickersTimePickerToolbar: {
      ...theme.overrides.MuiPickersTimePickerToolbar,
      hourMinuteLabel: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'flex-end'
      }
    }
  }
});

class TimeInputField extends Component {
  constructor(props){
    super(props);
    this.state={
      val:'',
      encounterId:'',
      errorFlag: false
    };
    this.resetStatus = _.debounce(this.resetStatus, 800);
  }

  static getDerivedStateFromProps(props, state) {
    let { field, rowId, assessmentCd, fieldValMap } = props;
    let val = '';
    let errorFlag = false;
    if (fieldValMap.has(assessmentCd)) {
      let tempfieldMap = fieldValMap.get(assessmentCd);
      let fieldValArray = tempfieldMap.get(field.codeAssessmentFieldId);
      errorFlag = fieldValArray[rowId].isError;
      val = fieldValArray[rowId].val;
    }
    if (props.encounterId !== state.encounterId||val !== state.val||errorFlag !== state.errorFlag) {
      return {
        encounterId: props.encounterId,
        val,
        errorFlag
      };
    }
    return null;
  }

  handleTimeChange = (date, assessmentCd, fieldId, rowId, format) => {
    let { fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = isNull(date)?'':moment(date).format(format);
    vals[rowId].isError = false;
    // updateState && updateState({
    //   isEdit:true,
    //   fieldValMap
    // });
    this.resetStatus(fieldValMap);
  };

  resetStatus = (fieldValMap) =>{
    let { updateState } = this.props;
    updateState && updateState({
      isEdit:true,
      fieldValMap
    });
  }

  // handleTimeError = (assessmentCd, fieldId, rowId) => {
  //   let { updateState, fieldValMap } = this.props;
  //   let vals = fieldValMap.get(assessmentCd).get(fieldId);
  //   vals[rowId].isError = true;
  //   updateState && updateState({
  //     isEdit:true,
  //     fieldValMap
  //   });
  // }

  handleBlur=(assessmentCd,fieldId,rowId) => {
    let { updateState, fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);

    if (vals[rowId].val === 'Invalid date') {
      vals[rowId].isError = true;
    } else {
      vals[rowId].isError = false;
    }

    updateState && updateState({
      isEdit:true,
      fieldValMap
    });
  }

  render(){
    let { classes, assessmentCd, rowId, field } = this.props;
    let {val,encounterId} = this.state;
    let format = dataTypeForamtMap.get(field.dataType);
    let timePickerInputProps = {
      style: {
        ...styles.input,
        padding: 0
      }
    };
    let timePickerKeyboardButtonProps = { style: { padding: 2, position: 'absolute', right: 0 }};
    return(
      <div
          key={encounterId}
          className={classes.time_field_wrapper}
          id={`assessment_field_time_${field.codeAssessmentFieldId}_${rowId}`}
      >
        <MuiThemeProvider theme={customTheme}>
          <KeyboardTimePicker
              // mask={[/\d/, /\d/, ':', /\d/, /\d/]}
              className={classes.time_field}
              InputProps={timePickerInputProps}
              KeyboardButtonProps={timePickerKeyboardButtonProps}
              inputVariant={'outlined'}
              ampm={false}
              FormHelperTextProps={{
                className:classes.time_helper_error
              }}
              invalidDateMessage={'Invalid Time'}
              value={val!==''?moment(val,format).valueOf():null}
              onChange={date => {this.handleTimeChange(date,assessmentCd,field.codeAssessmentFieldId,rowId,format);}}
              // onError={()=>{this.handleTimeError(assessmentCd,field.codeAssessmentFieldId,rowId);}}
              onBlur={()=>{this.handleBlur(assessmentCd,field.codeAssessmentFieldId,rowId);}}
              clearable
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(TimeInputField);