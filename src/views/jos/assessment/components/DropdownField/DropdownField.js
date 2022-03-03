import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './DropdownFieldStyle';
import { toNumber,isUndefined,find } from 'lodash';
import * as generalUtil from '../../utils/generalUtil';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import {trim,findIndex} from 'lodash';
import { NULLABLE_STATUS } from '../../../../../constants/common/commonConstants';

class DropdownField extends Component {
  constructor(props){
    super(props);
    this.state={
      abnormalFlag:false,
      showClear:false,
      val:'',
      encounterId:''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { field, rowId, assessmentCd, fieldValMap, fieldNormalRangeMap } = props;
    let val = '',
        abnormalFlag = false,
        required =NULLABLE_STATUS.ALLOW_NULL;
    if (fieldValMap.has(assessmentCd)) {
      let fieldValArray = fieldValMap.get(assessmentCd).get(field.codeAssessmentFieldId);
      val = !isUndefined(fieldValArray)?fieldValArray[rowId].val:'';
      required = field.nullable;
      let errorFlag = !isUndefined(fieldValArray)?fieldValArray[rowId].isError:false;
      if (!errorFlag) {
        abnormalFlag = generalUtil.abnormalDLCheck(val,assessmentCd,field.codeAssessmentFieldId,fieldNormalRangeMap);
      }
    }
    if (props.encounterId !== state.encounterId||val !== state.val||required !== state.required) {
      return {
        encounterId: props.encounterId,
        val,
        abnormalFlag,
        required
      };
    }
    return null;
  }

  handleSelectChange = (event, assessmentCd, fieldId, rowId) => {
    let { updateState, fieldValMap, cascadeDropMap, emptyCascadeFieldMap, assessmentItems, fieldNormalRangeMap } = this.props;
    let assessmentRow = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === assessmentCd;
    });
    let currentItem = assessmentItems[assessmentRow].codeAssessmentFields;

    let vals = fieldValMap.get(assessmentCd).get(fieldId);
    vals[rowId].val = !!event?event.value:'';
    // let abnormalFlag = false;
    let abnormalFlag = generalUtil.abnormalDLCheck(vals[rowId].val,assessmentCd,fieldId,fieldNormalRangeMap);
    this.setState({
      val: vals[rowId].val,
      abnormalFlag
    });
    let numberVal = toNumber(vals[rowId].val);
    // cascade
    if (cascadeDropMap.has(numberVal)) {
      let cascadeObj = cascadeDropMap.get(numberVal);
      let assessmentObj = find(assessmentItems, assessment => {
        return assessment.codeAssessmentCd === assessmentCd;
      });
      if (!isUndefined(assessmentObj)) {
        let fieldsArray = assessmentObj.fields;
        fieldsArray[rowId].forEach(field => {
          if(field.codeAssessmentFieldId === cascadeObj.fieldId){
            field.dropDisabled = false;
            if (field.subSet !== cascadeObj.subSetId) {
              field.subSet = cascadeObj.subSetId;
              //change value
              vals = fieldValMap.get(assessmentCd).get(cascadeObj.fieldId);
              vals[rowId].val = '';
            }
          }
        });
      }
    } else {
      // empty
      if (emptyCascadeFieldMap.has(fieldId)) {
        let cascadeFieldId = emptyCascadeFieldMap.get(fieldId);
        let assessmentObj = find(assessmentItems,assessment=>{
          return assessment.codeAssessmentCd === assessmentCd;
        });
        if (!isUndefined(assessmentObj)) {
          let fieldsArray = assessmentObj.fields;
          fieldsArray[rowId].forEach(field => {
            if (field.codeAssessmentFieldId === cascadeFieldId) {
              field.dropDisabled = true;
              //change value
              vals = fieldValMap.get(assessmentCd).get(cascadeFieldId);
              vals[rowId].val = '';
            }
          });
        }
      }
    }
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
        if(element.codeAssessmentFieldId===fieldId&&element.dataType!='TIME'){
            // if((element.nullable===0||element.nullable==='0')||(assessmentCd==='TEMP'&& element.nullable === 1 || element.nullable === '1')){
                if(timeObj!=null){
                    let valueFieldValMap=new Map();
                    valueFieldValMap=fieldValMap.get(assessmentCd);
                    for (let key of valueFieldValMap.entries()) {
                    // for (let [key, value] of valueFieldValMap.entries()) { //其他item的value
                        if(key!=fieldId&&key!=timeObj.codeAssessmentFieldId){ //其他item（不包含time 和本身）
                           let otherItem=null;
                            currentItem.forEach(item => {
                                if(item.codeAssessmentFieldId!=timeObj.codeAssessmentFieldId&&item.codeAssessmentFieldId!=fieldId){
                                    otherItem=item;
                                }
                                if(otherItem!=null){
                                    // if(otherItem.nullable===0||otherItem.nullable==='0'){
                                        //let temval=trim(valueFieldValMap.get(otherItem.codeAssessmentFieldId)[rowId].val);
                                        if(trim(valueFieldValMap.get(otherItem.codeAssessmentFieldId)[rowId].val)!=''&&valueFieldValMap.get(otherItem.codeAssessmentFieldId)[rowId].val!=null){
                                            timeChange=false;
                                        }
                                    // }
                                }
                            });
                        }

                    }
                }
            // }
            // else{
            //     timeChange=false;
            //     break;
            // }
        }
    }
    if (timeChange) {
      if (event) {
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
      isEdit:true,
      fieldValMap,
      assessmentItems
    });
  };

  handleFocus = () => {
    this.setState({
      showClear: true
    });
  }

  hanldeBlur = () => {
    this.setState({
      showClear: false
    });
  }

  render(){
    let { classes,field,rowId,assessmentCd,saveFlag} = this.props;
    let {val,showClear,abnormalFlag,required} = this.state;
    let subSetId = field.subSet;
    let input = document.getElementsByClassName('css-tlfecz-indicatorContainer');
    if(input.length>0){
      for (let index = 0; index < input.length; index++) {
        let element = input[index];
        if(showClear){
          element.style.padding='8px 4px';
        }
      }
    }
    let inputIconX = document.getElementsByClassName(' css-tlfecz-indicatorContainer');
    if(inputIconX.length>0){
        for (let index = 0; index < inputIconX.length; index++) {
          let element = inputIconX[index];
          if(showClear){
            element.style.padding='8px 4px 8px 0';
          }
        }
      }
    return(
      <div className={classes.select_wrapper}>
        <JCustomizedSelectFieldValidator
            id={`assessment_item_dropdown_${field.codeAssessmentFieldId}_${rowId}`}
            options={field.subSetOptions[subSetId].options.map(option => {
              return {
                label: option.dropVal,
                value: option.dropId+''
              };
            })}
            notShowMsg={false}
            errorMessages={abnormalFlag?'':'This field is required'}
            isValid={abnormalFlag?false:((!saveFlag&&val===''&&required===NULLABLE_STATUS.NOT_ALLOW_NULL)?false:true)}
            valIsAbnormal={abnormalFlag}
            onFocus={this.handleFocus}
            onBlur={this.hanldeBlur}
            isClearable={showClear}
            isDisabled={field.dropDisabled}
            value={val}
            onChange={event => {this.handleSelectChange(event,assessmentCd,field.codeAssessmentFieldId,rowId);}}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 1600 })
            }}
            menuPortalTarget={document.body}
            msgPosition="bottom"
            isSearchable="false"
        />
      </div>
    );
  }
}

export default withStyles(styles)(DropdownField);