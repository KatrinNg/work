import React, { Component } from 'react';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { DATA_TYPE } from '../../../../../constants/assessment/assessmentConstants';
import _ from 'lodash';

class ButtonField extends Component {
  constructor(props){
    super(props);
    this.state={};
  }

  handleBtnClick = (assessmentCd) => {
    const { fieldDefaultMap, fieldValMap, assessmentItems, updateState,handleButtonFieIdLog } = this.props;
    let date = new Date();
    let dateMin = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    let dateTime = date.getHours() + ':' + dateMin;
    if (fieldDefaultMap.has(assessmentCd)) {
      let fieldDefaultVals = fieldDefaultMap.get(assessmentCd);
      fieldDefaultVals.forEach(itemObj => {
        if (fieldValMap.has(itemObj.codeAssessmentCd)) {
          let tempValMap = fieldValMap.get(itemObj.codeAssessmentCd);
          if (tempValMap.has(itemObj.codeAssessmentFieldId)) {
            let targetCodeAssessmentObj = _.find(assessmentItems, obj => obj.codeAssessmentCd === itemObj.codeAssessmentCd);
            if (targetCodeAssessmentObj) {
              let timeFieldObj = _.find(targetCodeAssessmentObj.codeAssessmentFields, fieldObj => fieldObj.dataType === DATA_TYPE.TIME);
              let timeFieldVals = [];
              if (timeFieldObj) {
                timeFieldVals = tempValMap.get(timeFieldObj.codeAssessmentFieldId);
              }
              let tempFieldVals = tempValMap.get(itemObj.codeAssessmentFieldId);
              tempFieldVals.forEach((valObj, index) => {
                if (valObj.val === null || valObj.val === '') {
                  valObj.val = itemObj.defaultValue;
                  valObj.isError = false;
                  if(timeFieldVals.length>0){
                    timeFieldVals[index].val = timeFieldVals[index].val.length > 0 ? timeFieldVals[index].val : dateTime;
                    timeFieldVals[index].isError=false;
                  }
                }
              });
            }
          }
        }
      });
    }
    updateState && updateState({ fieldValMap });
    handleButtonFieIdLog&&handleButtonFieIdLog();
  }

  render() {
    const { field, rowId, assessmentCd } = this.props;
    return (
      <div>
        <CIMSButton
            id={`assessment_item_checkbox_${field.codeAssessmentFieldId}_${rowId}`}
            onClick={()=>{this.handleBtnClick(assessmentCd);}}
        >
          {field.objTitle}
        </CIMSButton>
      </div>
    );
  }
}

export default ButtonField;
