import React, { Component } from 'react';
import { styles } from './InputFieldStyle';
import { TextField, withStyles, FormHelperText } from '@material-ui/core';
import { trim } from 'lodash';
import { ErrorOutline } from '@material-ui/icons';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class StringInputField extends Component {
  constructor(props){
    super(props);
    this.state={
      val:'',
      encounterId:''
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
    if (props.encounterId !== state.encounterId||val!==state.val||required!==state.required) {
      return {
        encounterId: props.encounterId,
        val,
        required
      };
    }
    return null;
  }

  handleTextChange = (event, assessmentCd, fieldId, rowId) => {
    let { fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = event.target.value;
    this.setState({
      val:event.target.value
    });
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
    let { updateState, fieldValMap } = this.props;
    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = trim(vals[rowId].val);
    this.setState({
      val:vals[rowId].val
    });
    updateState && updateState({
      isEdit: true,
      fieldValMap
    });
  }

  render(){
    let { classes, field, rowId, assessmentCd, saveFlag } = this.props;
    let { val,required } = this.state;

    return(
      <div className={classes.string_field_wrapper}>
          <TextField
              id={`assessment_field_string_${field.codeAssessmentFieldId}_${rowId}`}
              autoCapitalize="off"
              variant="outlined"
              type="text"
              className={classes.normal_input}
              onBlur={() => { this.handleBlur(assessmentCd, field.codeAssessmentFieldId, rowId); }}
              onChange={event => { this.handleTextChange(event, assessmentCd, field.codeAssessmentFieldId, rowId); }}
              value={val}
              error={!saveFlag && val === '' && required === NULLABLE_STATUS.NOT_ALLOW_NULL ? true : false}
              inputProps={{
                style: styles.input
              }}
              InputProps={{
              className: (!saveFlag && val === '' && required === NULLABLE_STATUS.NOT_ALLOW_NULL) ? classes.abnormal : null
            }}
          />
        {(!saveFlag&&val===''&&required===NULLABLE_STATUS.NOT_ALLOW_NULL)?(
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

export default withStyles(styles)(StringInputField);