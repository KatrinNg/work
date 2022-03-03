import React, { Component } from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { styles } from './OutputFieldStyle';
import '../../../common/css/commonStyle.css';
import {isUndefined} from 'lodash';
import { specialUnitMap } from '../../../../../constants/assessment/assessmentConstants';
import * as generalUtil from '../../utils/generalUtil';

class OutputField extends Component {
  constructor(props){
    super(props);
    this.state={
      val:'',
      abnormalFlag: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { field, rowId, assessmentCd, fieldValMap, outputAssesmentFieldMap, fieldNormalRangeMap } = props;
    let val = '';
    let abnormalFlag = false;
    if (assessmentCd === 'BMI') {
      generalUtil.calculateBMI(rowId,outputAssesmentFieldMap,fieldValMap);
    } else if (assessmentCd === 'FBW') {
      generalUtil.calculateFBWBMI(rowId,outputAssesmentFieldMap,fieldValMap);
    } else if (assessmentCd === 'PBW') {
      generalUtil.calculatePBWBMI(rowId,outputAssesmentFieldMap,fieldValMap);
    }

    if (fieldValMap.has(assessmentCd)) {
      let tempfieldMap = fieldValMap.get(assessmentCd);
      let fieldValArray = tempfieldMap.get(field.codeAssessmentFieldId);
      val = fieldValArray[rowId].val;
      abnormalFlag = generalUtil.abnormalCheck(val,assessmentCd,field.codeAssessmentFieldId,fieldNormalRangeMap);
    }
    if (props.encounterId !== state.encounterId||val !== state.val) {
      return {
        encounterId: props.encounterId,
        val,
        abnormalFlag
      };
    }
    return null;
  }

  render() {
    let { classes, field, rowId } = this.props;
    let {val,abnormalFlag} = this.state;

    return(
      <Typography
          id={`assessment_item_${field.codeAssessmentFieldId}_${rowId}_OB`}
          component="div"
          variant="body2"
          classes={{ body2: classes.field_outputbox }}
      >
        <div className={abnormalFlag?classes.abnormal:classes.normal}>{val}</div>
        {!isUndefined(field.objUnit) ? (
          <div className={classes.unit_wrapper}>
            <span className={classes.unit_span}>{specialUnitMap.has(field.objUnit)?(<span>kg/m<sup>2</sup></span>):field.objUnit}</span>
          </div>
        ) : null}
      </Typography>
    );
  }
}

export default withStyles(styles)(OutputField);