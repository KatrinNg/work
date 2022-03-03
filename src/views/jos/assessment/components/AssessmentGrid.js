import React, { Component } from 'react';
import { Grid, withStyles, Fab } from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import {findIndex,cloneDeep,isUndefined, values} from 'lodash';
import {styles} from './AssessmentGridStyle';
import { OBJ_TYPE,DATA_TYPE } from '../../../../constants/assessment/assessmentConstants';
import DoubleInputField from './InputField/DoubleInputField';
import OutputField from './OutputField/OutputField';
import DropdownField from './DropdownField/DropdownField';
import CheckField from './CheckField/CheckField';
import TimeInputField from './InputField/TimeInputField';
import StringInputField from './InputField/StringInputField';
import IntegerInputField from './InputField/IntegerInputField';
import TextareaField from './InputField/TextareaField';
import { Remove, Add } from '@material-ui/icons';
import classNames from 'classnames';
import ButtonField from './ButtonField/ButtonField';

class AssessmentGrid extends Component {

  handleAssessmentFieldsAdd = currentCd => {
    let { assessmentItems, updateState, fieldValMap, resultMap, versionMap, createdByMap, createdDtmMap, insertGeneralAssessmentLog, patientInfo, encounterId } = this.props;
    let index = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === currentCd;
    });
    if (index !== -1) {
      let currentItem = assessmentItems[index];
      let tempFields = cloneDeep(currentItem.fields[0]);
      //handle DL
      tempFields.forEach(element => {
        if (element.codeObjectTypeCd === OBJ_TYPE.DROP_DOWN_LIST) {
          element.dropDisabled = element.defaultDropDisabled;
        }
      });
      currentItem.fields.push(tempFields);

      let fieldVals = fieldValMap.get(currentCd);
      for (let value of fieldVals.values()) {
        value.push({val:'',isError:false,isRequired:value[0].isRequired});
      }
      let fieldResultIds = resultMap.get(currentCd);
      for (let value of fieldResultIds.values()) {
        value.push(null);
      }
      let fieldVersions = versionMap.get(currentCd);
      for (let value of fieldVersions.values()) {
        value.push(null);
      }
      let fieldCreatedBys = createdByMap.get(currentCd);
      for (let value of fieldCreatedBys.values()) {
        value.push(null);
      }
      let fieldCreatedDtms = createdDtmMap.get(currentCd);
      for (let value of fieldCreatedDtms.values()) {
        value.push(null);
      }
      insertGeneralAssessmentLog(`Action: Click ${currentItem.assessmentName} '+' button PMI:${patientInfo.patientKey},EncounterId:${encounterId}`, '');
      updateState && updateState({
        isEdit:true,
        assessmentItems,
        fieldValMap,
        resultMap,
        versionMap,
        createdByMap,
        createdDtmMap
      });
    }
  };

  handleAssessmentFiledsDelete = (currentCd,rowId,cleanFlag) => {
    let { assessmentItems, updateState, fieldValMap, resultMap, versionMap, createdByMap, createdDtmMap, handleDeletItemsArray, insertGeneralAssessmentLog,patientInfo,encounterId } = this.props;
    let fieldDeleteIds = [];
    let fieldDeleteVersions = [];
    let index = findIndex(assessmentItems, item => {
      return item.codeAssessmentCd === currentCd;
    });
    if (index !== -1) {
      let fieldVals = fieldValMap.get(currentCd);
      if (cleanFlag) {
        let logArrContent='';
        let currentItem = assessmentItems[index];
        let fieldResultIds = resultMap.get(currentCd);
        for (let value of fieldVals.values()) {
          value[rowId].val = '';
          value[rowId].isError = false;
          if (currentItem.codeAssessmentCd === 'BP') {
            value[rowId].bpError = false;
          }
        }
        for (let [key,value] of fieldResultIds.entries()) {
          logArrContent += `Row ID: ${rowId},Assessment ID:${currentItem.displaySeq},Code Assessment Field ID: ${key},Assessment Result: ${value[rowId]};`;
        }
        //handle DL
        currentItem.fields[0].forEach(element => {
          if (element.codeObjectTypeCd === OBJ_TYPE.DROP_DOWN_LIST) {
            element.dropDisabled = element.defaultDropDisabled;
          }
        });
        let name = `Action: Click ${currentItem.assessmentName} '-' button PMI:${patientInfo.patientKey},EncounterId:${encounterId}`;
        insertGeneralAssessmentLog(name,'',logArrContent);
      } else {
        let logArrContent='';
        let currentItem = assessmentItems[index];
        currentItem.fields.splice(rowId,1);
        let fieldResultIds = resultMap.get(currentCd);
        let fieldVersions = versionMap.get(currentCd);
        let fieldCreatedBys = createdByMap.get(currentCd);
        let fieldCreatedDtms = createdDtmMap.get(currentCd);
        for (let value of fieldVals.values()) {
          value.splice(rowId,1);
        }
        for (let [key,value] of fieldResultIds.entries()) {
          if (value[rowId] !== null) {
            fieldDeleteIds.push(value[rowId]);
          }
          logArrContent += `Row ID: ${rowId},Assessment ID:${currentItem.displaySeq},Code Assessment Field ID: ${key},Assessment Result: ${value[rowId]};`;
          value.splice(rowId, 1);
        }
        for (let value of fieldVersions.values()) {
          if (value[rowId] !== null) {
            fieldDeleteVersions.push(value[rowId]);
          }
          value.splice(rowId,1);
        }
        for (let value of fieldCreatedBys.values()) {
          value.splice(rowId,1);
        }
        for (let value of fieldCreatedDtms.values()) {
          value.splice(rowId,1);
        }
        let name = `Action: Click ${currentItem.assessmentName} '-' button PMI:${patientInfo.patientKey},EncounterId:${encounterId}`;
        insertGeneralAssessmentLog(name, '', logArrContent);
        handleDeletItemsArray&&handleDeletItemsArray(currentCd,fieldDeleteIds,fieldDeleteVersions);
      }
      updateState && updateState({
        isEdit:true,
        assessmentItems,
        fieldValMap,
        resultMap,
        versionMap,
        createdByMap,
        createdDtmMap
      });
    }
  };

  renderField = (field, rowId, assessmentCd) => {
    let { updateState, fieldValMap, versionMap, fieldDefaultMap, fieldNormalRangeMap, outputAssesmentFieldMap, cascadeDropMap, emptyCascadeFieldMap, assessmentItems, encounterId,saveFlag,handleButtonFieIdLog} = this.props;

    let fieldProps = {
      fieldValMap,
      versionMap,
      assessmentCd,
      rowId,
      field,
      updateState,
      fieldNormalRangeMap,
      outputAssesmentFieldMap,
      cascadeDropMap,
      emptyCascadeFieldMap,
      assessmentItems,
      encounterId,
      saveFlag
    };

    switch (field.codeObjectTypeCd) {
      //IB
      case OBJ_TYPE.INPUT_BOX:{
        if (field.dataType === DATA_TYPE.TIME) {
          return (
            <TimeInputField {...fieldProps}/>
          );
        } else if (field.dataType === DATA_TYPE.STRING) {
          return (
            <StringInputField {...fieldProps}/>
          );
        } else if (field.dataType === DATA_TYPE.DOUBLE) {
          return(
            <DoubleInputField {...fieldProps}/>
          );
        } else if (field.dataType === DATA_TYPE.INTEGER) {
          return(
            <IntegerInputField {...fieldProps}/>
          );
        }
        break;
      }
      // DL
      case OBJ_TYPE.DROP_DOWN_LIST:{
        return (
          <DropdownField {...fieldProps}/>
        );
      }
      //OB
      case OBJ_TYPE.OUTPUT_BOX: {
        return (
          <OutputField {...fieldProps}/>
        );
      }
      //CB
      case OBJ_TYPE.CLICK_BOX: {
        return (
          <CheckField {...fieldProps}/>
        );
      }
      //TA
      case OBJ_TYPE.TEXTAREA:{
        return(
          <TextareaField {...fieldProps} />
        );
      }
      //BTN
      case OBJ_TYPE.BUTTON:{
        return (<ButtonField fieldDefaultMap={fieldDefaultMap} handleButtonFieIdLog={handleButtonFieIdLog} {...fieldProps} />);
      }
      default:
        break;
    }
  };

  calculateGridXS = (field,assessmentCd) => {
    let xsNum = undefined;
    xsNum = field.codeAssessmentFieldId2 !== undefined ? 4 : (field.codeObjectTypeCd === OBJ_TYPE.OUTPUT_BOX? 6 : 3);
    if (field.objTitle&&field.objTitle==='Remarks') {
      if (field.displaySeq > 4) {
        xsNum = (9 - field.displaySeq) * 3;
      } else if (assessmentCd === 'BP') {
        xsNum = (5 - (field.displaySeq-1)) * 3;
      } else {
        xsNum = (5 - field.displaySeq) * 3;
      }
    } else if(assessmentCd==='REM'){
      xsNum = (5 - field.displaySeq) * 3;
    }
    return xsNum;
  }

  generateField = (fields, assessmentCd, isMultiple,colorFlag) => {
    let { classes,fieldValMap,saveBpFlag } = this.props;
    let tempValMap = fieldValMap.get(assessmentCd);
    let cleanFlag = true;
    if (!isUndefined(tempValMap)){
      let i = 0;
      for (let value of tempValMap.values()) {
        cleanFlag = value.length === 1?true:false;
        if (++i===1) {
          break;
        }
      }
    }
    let group = fields.map((fieldGroup, index) => {
      let gridGroup = fieldGroup.map(field => {
        let xsNum = this.calculateGridXS(field, assessmentCd);
        return (
          <Grid
              container
              item
              xs={xsNum}
              // xs={field.codeAssessmentFieldId2 !== undefined ? 4 : (field.codeObjectTypeCd === OBJ_TYPE.OUTPUT_BOX? 6 : 3)}
              key={field.codeAssessmentFieldId}
              classes={{
                'grid-xs-3': assessmentCd === 'BP' ? classes.field_wrapperBP : classes.field_wrapper,
                'grid-xs-4': classNames(classes.field_wrapper,classes.unionFieldWrapper),
                'grid-xs-6': classes.field_wrapper,
                'grid-xs-12': classes.field_wrapper
              }}
              style={{paddingBottom: field.objTitle==='Remarks'?5:0}}
              direction="row"
              justify="flex-start"
              alignItems="center"
          >
            {!isUndefined(field.objTitle)&& field.codeObjectTypeCd!==OBJ_TYPE.BUTTON? (
              <div className={classes.field_title_div}>
                <span className={classes.title_span}>{`${field.objTitle}`}&nbsp;:&nbsp;</span>
              </div>
            ) : null}
            {/* index->row */}
            {this.renderField(field, index, assessmentCd)}
          </Grid>
        );
      });
      return (
        <Grid
            container
            item
            key={`${assessmentCd}_group_${index}`}
            direction="row"
            justify="flex-start"
            alignItems="center"
        >
          <Grid container item xs={11} style={{maxWidth: '96.666667%',flexBasis: '96.666667%'}}>
            {gridGroup}
          </Grid>
          {isMultiple==='Y'?(
            <Grid container item xs={1} style={{ maxWidth: '3.333333%', flexBasis: '3.333333%', height: '100%', alignItems: 'flex-end' }}>
              {/* marginTop: assessmentCd === 'VA' ? 60 : 5 */}
              <div className={assessmentCd === 'BP' ? classes.btn_wrapper_BP : classes.btn_wrapper}>
                <Fab
                    size="small"
                    color="secondary"
                    aria-label="Remove"
                    id={`btn_assessment_item_${assessmentCd}_delete_${index}`}
                    onClick={() => {this.handleAssessmentFiledsDelete(assessmentCd,index,cleanFlag);}}
                    classes={{
                      'secondary':classes.fabButtonDelete
                    }}
                >
                  <Remove className={classes.icon} />
                </Fab>
              </div>
            </Grid>

          )
          :null}
        {isMultiple==='Y' && fieldGroup.length>4 && fields.length!=(index+1)?
          colorFlag?
          <div style={{color:'white',width:'100%',border:'1px solid'}}></div>:
            <div style={{color:'rgb(209,238,252)',width:'100%',border:'1px solid'}} />
          :null}
        </Grid>
      );
    });
    return group;
  };

  initGrid = () => {
    let { classes,assessmentItems,saveBpFlag } = this.props;
    let gridItems = [];

    gridItems = assessmentItems.map((item,index) => {
      let colorFlag=false;
      if((index+1)%2===0){
        colorFlag=true;
      }
      let fields = this.generateField(item.fields, item.codeAssessmentCd, item.isMultiple,colorFlag);
      return (
        <Grid
            container
            key={item.codeAssessmentCd}
            direction="row"
            justify="space-evenly"
            className={classes.item_wrapper}
            classes={{
              'container':(index+1)%2===0?classes.assessment_grid_wrapper:null
            }}
        >
          <Grid
              item
              container
              xs={11}
              direction="row"
              justify="space-between"
              alignItems="center"
          >
            <Grid container item direction="row" alignItems="center" spacing={0} wrap="nowrap">
              <Grid
                  item
                  xs={1}
                  classes={{
                    'grid-xs-1': classes.label_assessment
                  }}
              >
                {item.assessmentName}
              </Grid>

              <Grid
                  item
                  container
                  xs={11}
                  classes={{
                    'grid-xs-11': classes.field_grid_wrapper
                  }}
              >
                {fields}
              </Grid>
            </Grid>
          </Grid>
          <Grid
              container
              direction="row"
              justify="center"
              alignItems="flex-end"
              item
              xs
              classes={{
                'container':item.codeAssessmentCd==='BP'?classes.btnGridBP:classes.btnGrid
              }}
          >
            {item.isMultiple === 'Y' ? (
              <Fab
                  size="small"
                  color="primary"
                  aria-label="Add"
                  onClick={() => {this.handleAssessmentFieldsAdd(item.codeAssessmentCd);}}
                  id={`btn_assessment_item_${item.codeAssessmentCd}_add`}
                  classes={{
                    'primary':classes.btnAdd
                  }}
              >
                <Add className={classes.icon} />
              </Fab>
            ) : null}
          </Grid>
        </Grid>
      );
    });
    return gridItems;
  };

  render() {
    let {classes} = this.props;
    return (
      <ValidatorForm className={classes.form_wrapper} id="AssessmentForm" onSubmit={() => {}} ref="form">
        <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
        >
          {this.initGrid()}
        </Grid>
      </ValidatorForm>
    );
  }
}

export default withStyles(styles)(AssessmentGrid);
