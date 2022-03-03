import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { withStyles, Grid } from '@material-ui/core';
import { styles } from './BasicInfoStyle';
import classNames from 'classnames';
import {find,trim} from 'lodash';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as contants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import CommonTextField from '../../components/CommonTextField/CommonTextField';
// import SelectFieldValidator from '../../../../../../components/FormValidator/SelectFieldValidator';

class BasicInfo extends Component {
  constructor(props){
    super(props);
    this.state = {
      searchFieldLengthObj:{}
    };
  }

  handleTextFieldChanged = (event,name) => {
    let { basicInfo,updateStateWithoutStatus,diagnosisErrorFlag,resetHeight } = this.props;
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
    if(diagnosisErrorFlag){
      resetHeight && resetHeight();
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

  generateLengthObj = (fieldLengthObj) => {
    const { contentVals,frameworkMap,updateStateWithoutStatus } = this.props;
    const searchFieldLengthObj = {
      refNo: null,
      diagnosis: null,
      remark: null,
      instruction: null
    };
    let { middlewareMapObj,autoMiddlewareMapObj,basicInfo } = this.props;
    let {orderType,checkedExpressIoeMap}=basicInfo;
    if (!!contentVals.labId&&!!contentVals.selectedSubTabId&&orderType!= contants.PRIVILEGES_EXPRESS_IOE_TABS[0].value) {
      let otherItemsMap = frameworkMap.get(contentVals.labId).formMap.get(contentVals.selectedSubTabId).otherItemsMap;
      let items = !!otherItemsMap?otherItemsMap.get(contants.OTHER_ITEM_MAP_KEY):[];
      items.forEach(item => {
        if (item.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
          fieldLengthObj.refNo = item.fieldLength;
          searchFieldLengthObj.refNo = item.fieldLength;
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
      if(
        this.state.searchFieldLengthObj &&
        (
          this.state.searchFieldLengthObj.refNo !== searchFieldLengthObj.refNo ||
          this.state.searchFieldLengthObj.diagnosis !== searchFieldLengthObj.diagnosis ||
          this.state.searchFieldLengthObj.remark !== searchFieldLengthObj.remark ||
          this.state.searchFieldLengthObj.instruction !== searchFieldLengthObj.instruction
        )
      ) {
        this.setState({ searchFieldLengthObj });
        updateStateWithoutStatus&&updateStateWithoutStatus({
          searchFieldLengthObj
        });
      }
    }else if(orderType=== contants.PRIVILEGES_EXPRESS_IOE_TABS[0].value){
      if(checkedExpressIoeMap && checkedExpressIoeMap.size > 0){
        let diagnosis = null;
        let remark = null;
        let instruction = null;
        let refNo = null;
        for (let mapObj of checkedExpressIoeMap.values()) {
          let {codeIoeRequestScatgryFrmMap}=mapObj;
          for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
            let ioeFormId =parseInt(key);
            let templateOtherItemsMap = frameworkMap.get('CPLC').formMap.has(ioeFormId)?frameworkMap.get('CPLC').formMap.get(ioeFormId).otherItemsMap:(frameworkMap.get('PHLC').formMap.has(ioeFormId)?frameworkMap.get('PHLC').formMap.get(ioeFormId).otherItemsMap:null);
            let items = !!templateOtherItemsMap?templateOtherItemsMap.get(contants.OTHER_ITEM_MAP_KEY):[];
            if(!!items&&items!=null){
              items.forEach(tempObj => {
                if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
                  refNo = refNo?(refNo>tempObj.fieldLength?tempObj.fieldLength:refNo):tempObj.fieldLength?tempObj.fieldLength:refNo;
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
                  diagnosis = diagnosis?(diagnosis>tempObj.fieldLength?tempObj.fieldLength:diagnosis):(tempObj.fieldLength?tempObj.fieldLength:diagnosis);
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Remark&&tempObj.frmItemName === contants.REMARK_ITEM_NAME) {
                  remark = remark?(remark>tempObj.fieldLength?tempObj.fieldLength:remark):(tempObj.fieldLength?tempObj.fieldLength:remark);
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction&&tempObj.frmItemName === contants.INSTRUCTION_ITEM_NAME) {
                  instruction = instruction?(instruction>tempObj.fieldLength?tempObj.fieldLength:instruction):(tempObj.fieldLength?tempObj.fieldLength:instruction);
                }
              });
            }
          }
        }
        fieldLengthObj.refNo = refNo ? refNo : 15;
        fieldLengthObj.diagnosis = diagnosis ? diagnosis : 50;
        fieldLengthObj.remark = remark ? remark : 50;
        fieldLengthObj.instruction = instruction ? instruction : 80;
        searchFieldLengthObj.refNo = refNo ? refNo : 15;
        searchFieldLengthObj.diagnosis = diagnosis ? diagnosis : 50;
        searchFieldLengthObj.remark = remark ? remark : 50;
        searchFieldLengthObj.instruction = instruction ? instruction : 80;
        if(
          this.state.searchFieldLengthObj &&
          (
            this.state.searchFieldLengthObj.refNo !== searchFieldLengthObj.refNo ||
            this.state.searchFieldLengthObj.diagnosis !== searchFieldLengthObj.diagnosis ||
            this.state.searchFieldLengthObj.remark !== searchFieldLengthObj.remark ||
            this.state.searchFieldLengthObj.instruction !== searchFieldLengthObj.instruction
          )
        ) {
          this.setState({ searchFieldLengthObj });
          updateStateWithoutStatus&&updateStateWithoutStatus({
            searchFieldLengthObj
          });
        }
      }else{
      fieldLengthObj.diagnosis = 50;
      searchFieldLengthObj.diagnosis = 50;
      fieldLengthObj.remark = 50;
      searchFieldLengthObj.remark = 50;
      if(
        this.state.searchFieldLengthObj &&
        (
          this.state.searchFieldLengthObj.refNo !== searchFieldLengthObj.refNo ||
          this.state.searchFieldLengthObj.diagnosis !== searchFieldLengthObj.diagnosis ||
          this.state.searchFieldLengthObj.remark !== searchFieldLengthObj.remark ||
          this.state.searchFieldLengthObj.instruction !== searchFieldLengthObj.instruction
        )
      ) {
        this.setState({ searchFieldLengthObj });
        updateStateWithoutStatus&&updateStateWithoutStatus({
          searchFieldLengthObj
        });
      }
      }
    }
    //template basic information control
    else {
      middlewareMapObj = autoMiddlewareMapObj ? autoMiddlewareMapObj : middlewareMapObj;
      if(middlewareMapObj && middlewareMapObj.middlewareMap && middlewareMapObj.middlewareMap.size > 0){
        let diagnosis = null;
        let remark = null;
        let instruction = null;
        let refNo = null;
        for (let mapObj of middlewareMapObj.middlewareMap.values()) {
            let ioeFormId = mapObj.codeIoeFormId;
            let templateOtherItemsMap = frameworkMap.get('CPLC').formMap.has(ioeFormId)?frameworkMap.get('CPLC').formMap.get(ioeFormId).otherItemsMap:(frameworkMap.get('PHLC').formMap.has(ioeFormId)?frameworkMap.get('PHLC').formMap.get(ioeFormId).otherItemsMap:null);
            let items = !!templateOtherItemsMap?templateOtherItemsMap.get(contants.OTHER_ITEM_MAP_KEY):[];
            if(!!items&&items!=null){
              items.forEach(tempObj => {
                if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
                  refNo = refNo?(refNo>tempObj.fieldLength?tempObj.fieldLength:refNo):tempObj.fieldLength?tempObj.fieldLength:refNo;
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
                  diagnosis = diagnosis?(diagnosis>tempObj.fieldLength?tempObj.fieldLength:diagnosis):(tempObj.fieldLength?tempObj.fieldLength:diagnosis);
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Remark&&tempObj.frmItemName === contants.REMARK_ITEM_NAME) {
                  remark = remark?(remark>tempObj.fieldLength?tempObj.fieldLength:remark):(tempObj.fieldLength?tempObj.fieldLength:remark);
                } else if (tempObj.ioeType === contants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction&&tempObj.frmItemName === contants.INSTRUCTION_ITEM_NAME) {
                  instruction = instruction?(instruction>tempObj.fieldLength?tempObj.fieldLength:instruction):(tempObj.fieldLength?tempObj.fieldLength:instruction);
                }
              });
            }
        }
        fieldLengthObj.refNo = refNo ? refNo : 15;
        fieldLengthObj.diagnosis = diagnosis ? diagnosis : 50;
        fieldLengthObj.remark = remark ? remark : 50;
        fieldLengthObj.instruction = instruction ? instruction : 80;
        searchFieldLengthObj.refNo = refNo ? refNo : 15;
        searchFieldLengthObj.diagnosis = diagnosis ? diagnosis : 50;
        searchFieldLengthObj.remark = remark ? remark : 50;
        searchFieldLengthObj.instruction = instruction ? instruction : 80;
        if(
          this.state.searchFieldLengthObj &&
          (
            this.state.searchFieldLengthObj.refNo !== searchFieldLengthObj.refNo ||
            this.state.searchFieldLengthObj.diagnosis !== searchFieldLengthObj.diagnosis ||
            this.state.searchFieldLengthObj.remark !== searchFieldLengthObj.remark ||
            this.state.searchFieldLengthObj.instruction !== searchFieldLengthObj.instruction
          )
        ) {
          this.setState({ searchFieldLengthObj });
          updateStateWithoutStatus&&updateStateWithoutStatus({
            searchFieldLengthObj
          });
        }
      }else{
        fieldLengthObj.refNo = 15;
        fieldLengthObj.diagnosis = 50;
        fieldLengthObj.remark = 50;
        fieldLengthObj.instruction = 80;
        searchFieldLengthObj.refNo = 15;
        searchFieldLengthObj.diagnosis = 50;
        searchFieldLengthObj.remark = 50;
        searchFieldLengthObj.instruction = 80;
        if(
          this.state.searchFieldLengthObj &&
          (
            this.state.searchFieldLengthObj.refNo !== searchFieldLengthObj.refNo ||
            this.state.searchFieldLengthObj.diagnosis !== searchFieldLengthObj.diagnosis ||
            this.state.searchFieldLengthObj.remark !== searchFieldLengthObj.remark ||
            this.state.searchFieldLengthObj.instruction !== searchFieldLengthObj.instruction
          )
        ) {
          this.setState({ searchFieldLengthObj });
          updateStateWithoutStatus&&updateStateWithoutStatus({
            searchFieldLengthObj
          });
        }
      }
    }
  }

  itemIsChecked = (testValMap) => {
    let flag = false;
    if(testValMap.size > 0){
      for(let map of testValMap.values()) {
        if(map.isChecked) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

  render() {
    const { classes,clinicList,basicInfo,diagnosisErrorFlag,privilegeFlag,resetHeight} = this.props;
    let fieldLengthObj = {
      refNo: null,
      diagnosis: null,
      remark: null,
      instruction: null
    };
    this.generateLengthObj(fieldLengthObj);
    console.log('fieldLengthObj',fieldLengthObj);

    let requestingUnitDisplayName = '';
    let tempClinic = find(clinicList,clinic=>{
      return basicInfo.requestingUnit === clinic.clinicCd;
    });
    if (!!tempClinic) {
      requestingUnitDisplayName = tempClinic.clinicName;
    }

    return (
      <div>
        <Grid container direction="row">
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label className={classes.clinicNoLabel}>Clinic Ref. No.</label>
                <div className={classes.fullWidth}>
                  <CommonTextField
                      id="ix_request_basic_info_clinic_ref_no"
                      stateParameter="clinicRefNo"
                      length={fieldLengthObj.refNo}
                      value={basicInfo.clinicRefNo}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                      disabled={!privilegeFlag}
                      resetHeight={resetHeight}
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label style={{paddingLeft:5,minWidth:80}}><span className={classes.requiredSpan}>*</span>Report to</label>
                <div className={classNames(classes.fullWidth)} style={{ maxWidth: '377px' }}>
                  <CustomizedSelectFieldValidator
                      id="ix_request_basic_info_report_to"
                      options={clinicList.map(clinic => {
                        return {
                          label: clinic.clinicName,
                          value: clinic.clinicCd
                        };
                      })}
                      isDisabled={!privilegeFlag}
                      selectClassName={{ paddingLeft: 0 }}
                      notShowMsg
                      value={basicInfo.reportTo}
                      onChange={event => { this.handleReportToChanged(event); }}
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label style={{minWidth:108,paddingLeft:5}}>Requested By</label>
                <div className={classNames(classes.floatLeft, classes.fullWidth)}>
                  <CommonTextField
                      id="ix_request_basic_info_requestd_by"
                      value={basicInfo.requestUser}
                      inputStyle={{
                        paddingLeft: 20,
                        backgroundColor: '#e0e0e0'
                      }}
                      disabled
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label className={classes.clinicNoLabel}>Requesting Unit</label>
                <div className={classNames(classes.floatLeft,classes.fullWidth)} style={{maxWidth:333}}>
                  <CommonTextField
                      id="ix_request_basic_info_requesting_unit"
                      value={requestingUnitDisplayName}
                      inputStyle={{
                        paddingLeft: 20,
                        backgroundColor:'#e0e0e0'
                      }}
                      disabled
                  />
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label style={{ paddingRight: '5px' }}><span className={classes.requiredSpan}>*</span>Clinical Summary & Diagnosis</label>
                <div className={classNames(classes.floatLeft, classes.fullWidth)} style={{ width: '87.5%' }}>
                  <CommonTextField
                      id="ix_request_basic_info_diagnosis"
                      stateParameter="infoDiagnosis"
                      length={fieldLengthObj.diagnosis}
                      value={basicInfo.infoDiagnosis}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                      errorFlag={diagnosisErrorFlag}
                      required
                      disabled={!privilegeFlag}
                      resetHeight={resetHeight}
                  />
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container alignItems="center">
            <Grid item xs={4}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label style={{paddingRight:'10px'}}>Remark</label>
                <div className={classNames(classes.floatLeft, classes.fullWidth)}>
                  <CommonTextField
                      id="ix_request_basic_info_remark"
                      stateParameter="infoRemark"
                      length={fieldLengthObj.remark}
                      value={basicInfo.infoRemark}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                      disabled={!privilegeFlag}
                      resetHeight={resetHeight}
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div className={classNames(classes.flexCenter, classes.marginBottomDiv)}>
                <label style={{paddingLeft:'10px',paddingRight:'10px'}}>Instruction</label>
                <div className={classNames(classes.floatLeft, classes.fullWidth)}>
                  <CommonTextField
                      id="ix_request_basic_info_instruction"
                      stateParameter="infoInstruction"
                      length={fieldLengthObj.instruction}
                      value={basicInfo.infoInstruction}
                      onChange={this.handleTextFieldChanged}
                      onBlur={this.handleTextFieldBlur}
                      disabled={!privilegeFlag}
                      resetHeight={resetHeight}
                  />
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default withStyles(styles)(BasicInfo);
