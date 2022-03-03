import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Checkbox } from '@material-ui/core';
import { styles } from './BasicInfoStyle';
import classNames from 'classnames';
import {find,trim} from 'lodash';
import * as contants from '../../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import CommonTextField from '../../components/CommonTextField/CommonTextField';
import ValidatorEnum from '../../../../../../../enums/validatorEnum';
import CustomizedSelectFieldValidator from '../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';

class BasicInfo extends Component {
  constructor(props){
    super(props);
  }

  handleUrgentChecked = event => {
    const { basicInfo,updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      basicInfo:{
        ...basicInfo,
        urgentIsChecked: event.target.checked
      }
    });
  }

  handleTextFieldChanged = (event,name) => {
    let { basicInfo,updateStateWithoutStatus,diagnosisErrorFlag } = this.props;
    if (name === 'infoDiagnosis') {
      if (basicInfo.orderType === contants.PRIVILEGES_DOCTOR_TABS[0].value) {
        // Discipline
        diagnosisErrorFlag = trim(event.target.value)!==''?false:true;
      } else {
        if (diagnosisErrorFlag&&trim(event.target.value)!=='') {
          diagnosisErrorFlag = false;
        }
      }
    }
    updateStateWithoutStatus&&updateStateWithoutStatus({
      diagnosisErrorFlag,
      basicInfo:{
        ...basicInfo,
        [name]:event.target.value
      }
    });
  }

  handleTextFieldBlur = (event,name) => {
    let { basicInfo,updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      // diagnosisErrorFlag,
      basicInfo:{
        ...basicInfo,
        [name]:trim(event.target.value)
      }
    });
  }

  handleReportToChanged = event => {
    const { basicInfo,updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      basicInfo:{
        ...basicInfo,
        reportTo:!!event?event.value:''
      }
    });
  }

  generateLengthObj = fieldLengthObj => {
    const { contentVals,frameworkMap,updateStateWithoutStatus } = this.props;
    let searchFieldLengthObj={};
    if (!!contentVals.labId&&!!contentVals.selectedSubTabId) {
      let otherItemsMap = frameworkMap.get(contentVals.labId).formMap.get(contentVals.selectedSubTabId).otherItemsMap;
      let items = !!otherItemsMap?otherItemsMap.get(contants.OTHER_ITEM_MAP_KEY):[];
      items.forEach(item => {
        if (item.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
          fieldLengthObj.refNo = item.fieldLength;
        } else if (item.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
          fieldLengthObj.diagnosis = item.fieldLength;
          searchFieldLengthObj.diagnosis = item.fieldLength;
        } else if (item.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Remark&&item.frmItemName === contants.REMARK_ITEM_NAME) {
          fieldLengthObj.remark = item.fieldLength;
          searchFieldLengthObj.remark = item.fieldLength;
        } else if (item.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction&&item.frmItemName === contants.INSTRUCTION_ITEM_NAME) {
          fieldLengthObj.instruction = item.fieldLength;
          searchFieldLengthObj.instruction = item.fieldLength;
        }
      });
      updateStateWithoutStatus&&updateStateWithoutStatus({
        searchFieldLengthObj
      });
    }
  }

  render() {
    const { classes,clinicList=[],basicInfo,diagnosisErrorFlag } = this.props;
    let fieldLengthObj = {
      refNo: null,
      diagnosis: null,
      remark: null,
      instruction: null
    };
    this.generateLengthObj(fieldLengthObj);

    let requestingUnitDisplayName = '';
    let tempClinic = find(clinicList,clinic=>{
      return basicInfo.requestingUnit === clinic.clinicCd;
    });
    if (!!tempClinic) {
      requestingUnitDisplayName = tempClinic.clinicName;
    }
    return (
      <div style={{padding: '0 10px'}}>
        <Grid container direction="row">
          <Grid item xs={6}>
            <Grid container alignItems="center">
              {/* Urgent && Clinic Ref. No. */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label className={classes.label}>Urgent</label>
                  <div className={classes.floatLeft}>
                    <Checkbox
                        id="ix_request_edit_basic_info_urgent"
                        checked={basicInfo.urgentIsChecked}
                        color="primary"
                        classes={{root:classes.rootCheckbox}}
                        onChange={this.handleUrgentChecked}
                    />
                  </div>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <label className={classNames(classes.label,classes.clinicNoLabel)}>Clinic Ref. No.</label>
                  <div className={classNames(classes.floatLeft,classes.fullWidth)}>
                    <CommonTextField
                        id="ix_request_basic_info_clinic_ref_no"
                        stateParameter="clinicRefNo"
                        length={fieldLengthObj.refNo}
                        value={basicInfo.clinicRefNo}
                        onChange={this.handleTextFieldChanged}
                        onBlur={this.handleTextFieldBlur}
                    />
                  </div>
                </div>
              </Grid>
              {/* Diagnosis */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label><span className={classes.requiredSpan}>*</span>Clinical Summary & Diagnosis</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CommonTextField
                      id="ix_request_edit_basic_info_diagnosis"
                      stateParameter="infoDiagnosis"
                      length={fieldLengthObj.diagnosis}
                      value={basicInfo.infoDiagnosis}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                      errorFlag={diagnosisErrorFlag}
                      required
                  />
                </div>
              </Grid>
              {/* Remark */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label>Remark</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CommonTextField
                      id="ix_request_edit_basic_info_remark"
                      stateParameter="infoRemark"
                      length={fieldLengthObj.remark}
                      value={basicInfo.infoRemark}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                  />
                </div>
              </Grid>
              {/* Instruction */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label>Instruction</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CommonTextField
                      id="ix_request_edit_basic_info_instruction"
                      stateParameter="infoInstruction"
                      length={fieldLengthObj.instruction}
                      value={basicInfo.infoInstruction}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                  />
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6} className={classes.paddingLeftDiv}>
            <Grid container alignItems="center">
              {/* Requested By */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label>Requested By</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CommonTextField
                      id="ix_request_edit_basic_info_requestd_by"
                      value={basicInfo.requestUser}
                      inputStyle={{
                        style:{
                          paddingLeft:20,
                          backgroundColor:'#e0e0e0'
                        }
                      }}
                      disabled
                  />
                </div>
              </Grid>
              {/* Requesting Unit */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label>Requesting Unit</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CommonTextField
                      id="ix_request_edit_basic_info_requesting_unit"
                      value={requestingUnitDisplayName}
                      inputStyle={{
                        style:{
                          paddingLeft:20,
                          backgroundColor:'#e0e0e0'
                        }
                      }}
                      disabled
                  />
                </div>
              </Grid>
              {/* Report to */}
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label><span className={classes.requiredSpan}>*</span>Report to</label>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classNames(classes.flexCenter,classes.marginBottomDiv)}>
                  <CustomizedSelectFieldValidator
                      id="ix_request_edit_basic_info_report_to"
                      options={clinicList.map(clinic => {
                        return {
                          label: clinic.clinicName,
                          value: clinic.clinicCd
                        };
                      })}
                      isDisabled={false}
                      // validators={[ValidatorEnum.required]}
                      // selectClassName={{ paddingLeft: 0 }}
                      notShowMsg
                      value={basicInfo.reportTo}
                      onChange={event => { this.handleReportToChanged(event); }}
                  />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default connect()(withStyles(styles)(BasicInfo));
