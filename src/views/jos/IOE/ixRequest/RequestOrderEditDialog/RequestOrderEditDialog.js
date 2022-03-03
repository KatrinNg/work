import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './RequestOrderEditDialogStyle';
import { withStyles, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography, Paper } from '@material-ui/core';
import Draggable from 'react-draggable';
import { openCommonMessage, closeCommonMessage } from '../../../../../store/actions/message/messageAction';
import { COMMON_CODE } from '../../../../../constants/message/common/commonCode';
import ContentContainer from './modules/ContentContainer/ContentContainer';
import BasicInfo from './modules/BasicInfo/BasicInfo';
import * as utils from '../utils/ixUtils';
import _ from 'lodash';
import OtherInfoDialog from './modules/OtherInfoDialog/OtherInfoDialog';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { COMMON_ACTION_TYPE } from '../../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import * as constants from '../../../../../constants/IOE/ixRequest/ixRequestConstants';
import { IX_REQUEST_CODE } from '../../../../../constants/message/IOECode/ixRequestCode';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=>{
          return e.target.getAttribute('editdrag') === 'allowed';
        }}
    >
      <Paper style={{ margin: 'auto' }} {...props} />
    </Draggable>
  );
}

class RequestOrderEditDialog extends Component {
  constructor(props){
    super(props);
    let { loginInfo,encounterData,loginServiceCd } = props;
    this.state = {
      isEdit: false,
      diagnosisErrorFlag:false,
      basicInfo:{
        infoOrderType: null,
        orderType: null,
        codeIoeRequestTypeCd: this.codeIoeRequestTypeCd,
        encounterId: encounterData.encounterId,
        patientKey: encounterData.patientKey,
        serviceCd: loginServiceCd,
        createdBy: null,
        createdDtm: null,
        updatedBy: null,
        updatedDtm: null,
        ioeRequestId: 0,
        ioeRequestNumber: null,
        requestDatetime: null,
        version:null,
        invldReason:null, // invalid
        isInvld: 0, // invalid
        ivgRqstSeqNum: 0, // invalid
        outputFormPrinted: 0, // invalid
        outputFormPrintedBy: null, // invalid
        outputFormPrintedDatetime: null, // invalid
        specimenCollectDatetime: null, // invalid
        specimenCollected: 0, // invalid
        specimenCollectedBy: null, // invalid
        specimenLabelPrinted: 0, // invalid
        specimenLabelPrintedBy: null, // invalid
        specimenLabelPrintedDatetime: null, // invalid

        urgentIsChecked: false,
        requestedBy:loginInfo.loginName, // requestUser
        requestUser: commonUtils.getUserFullName(), // only display request by
        requestLoginName: loginInfo.userDto.loginName,
        requestingUnit:encounterData.clinicCd||'',  //clinicCd
        reportTo:encounterData.clinicCd||'',
        clinicRefNo:'',
        infoDiagnosis:'',
        infoRemark:'',
        infoInstruction:''
      },
      backUpBasicInfo:{
      },
      contentVals: {
        labId: null,
        selectedSubTabId: null,
        infoTargetLabId: null,
        infoTargetFormId: null
      },
      dialogOpenStatus: false,
      infoIsOpen: false,
      middlewareObject: null,
      targetLabId: null,
      targetFormId: null,
      selectedOrderKey: null,
      orderIsEdit: true,
      originFormId: null,
      originMiddlewareObject: null,
      searchFieldLengthObj: {},
      backUpMiddlewareObject:null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { isOpen,editMiddlewareObject,selectedOrderKey,editBasicInfo,editContentVals,diagnosisErrorFlag } = nextProps;
    if (isOpen&&!this.state.dialogOpenStatus) {
      this.setState({
        middlewareObject: _.cloneDeep(editMiddlewareObject),
        backUpMiddlewareObject: _.cloneDeep(editMiddlewareObject),
        basicInfo: _.cloneDeep(editBasicInfo),
        backUpBasicInfo: _.cloneDeep(editBasicInfo),
        contentVals: _.cloneDeep(editContentVals),
        targetLabId:editContentVals.labId,
        targetFormId:editContentVals.selectedSubTabId,
        selectedOrderKey,
        originFormId: editContentVals.selectedSubTabId,
        originMiddlewareObject: _.cloneDeep(editMiddlewareObject),
        dialogOpenStatus: isOpen,
        diagnosisErrorFlag: diagnosisErrorFlag
      });
    }
  }

  updateStateWithoutStatus = obj => {
    this.setState({
      ...obj
    });
  }

  updateState=(obj)=>{
    this.setState({
      // isEdit:true,
      ...obj
    });
  }

  handleClose = () => {
    const { handleEditDialogClose,insertIxRequestLog } = this.props;
    let { middlewareObject, backUpMiddlewareObject, basicInfo, backUpBasicInfo } = this.state;
    let isEditBool = false;
    let basicBool = false;
    //上层验证
    if (_.trim(basicInfo.infoRemark) == '' &&
      _.trim(basicInfo.infoInstruction) == '' &&
      _.trim(basicInfo.infoDiagnosis) == '' &&
      _.trim(basicInfo.clinicRefNo) == '' &&
      basicInfo.urgentIsChecked == backUpBasicInfo.urgentIsChecked &&
      basicInfo.reportTo == backUpBasicInfo.reportTo
    ) {
      basicBool = false;
    } else if (
      basicInfo.urgentIsChecked !== backUpBasicInfo.urgentIsChecked ||
      basicInfo.infoRemark !== backUpBasicInfo.infoRemark ||
      basicInfo.infoInstruction !== backUpBasicInfo.infoInstruction ||
      basicInfo.infoDiagnosis !== backUpBasicInfo.infoDiagnosis ||
      basicInfo.clinicRefNo !== backUpBasicInfo.clinicRefNo ||
      basicInfo.reportTo !== backUpBasicInfo.reportTo
    ) {
      basicBool = true;
    }

    //下层验证
    let questionObject = middlewareObject.testValMap.size > 0 ? middlewareObject.testValMap : middlewareObject.specimenValMap;
    let backupQuestionObject = backUpMiddlewareObject.testValMap.size > 0 ? backUpMiddlewareObject.testValMap : backUpMiddlewareObject.specimenValMap;
    for (const [key, value] of questionObject.entries()) {
      let backObj = backupQuestionObject.get(key);
      //search ix from discipline data cannnot find backobj
      if(backObj != undefined && backObj != null) {
        //CB--checked,IB,OB,DL--input/text/select
        if (value.frmItemTypeCd === 'CB') {
          if (value.isChecked !== backObj.isChecked) {
            isEditBool = true;
            break;
          }
        } else {
          if (value.itemVal != backObj.itemVal || value.itemVal2 != backObj.itemVal2 || value.isChecked != backObj.isChecked) {
            isEditBool = true;
            break;
          }
        }
      }else{
        isEditBool = true;
        break;
      }
    }
    if (isEditBool || basicBool) {
      this.setState({ isEdit: true });
      let payload = {
        msgCode:COMMON_CODE.SAVE_DIALOG_WARING,
        btn1AutoClose: false,
        btnActions: {
          btn1Click: () => {
           this.handleEdit();
          },btn2Click:()=>{
            insertIxRequestLog && insertIxRequestLog('[Edit Ix Request Order Dialog] Action: Click \'Close\' button', '');
            handleEditDialogClose&&handleEditDialogClose();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      insertIxRequestLog && insertIxRequestLog('[Edit Ix Request Order Dialog] Action: Click \'Close\' button', '');
      handleEditDialogClose&&handleEditDialogClose();
    }
  }

  handleInfoDialogOK = (displayIQS) =>{
    const { temporaryStorageMap, editDeletedMap, updateState, handleEditDialogClose,insertIxRequestLog,dropdownMap } = this.props;
    let { selectedOrderKey,contentVals,basicInfo,originFormId,middlewareObject,originMiddlewareObject } = this.state;
    if (contentVals.selectedSubTabId === originFormId) {
      utils.compareMiddlewareObject(middlewareObject,originMiddlewareObject,true);
      middlewareObject = _.cloneDeep(originMiddlewareObject);
      utils.handleIQSItem(displayIQS,middlewareObject);
    }else {
      // validate delete
      let tempValObj = _.cloneDeep(temporaryStorageMap.get(selectedOrderKey));
      tempValObj = utils.handleDeletedStorageObj(tempValObj);
      // deletedStorageMap.set(Math.random(),tempValObj);
      if (tempValObj.version&&!editDeletedMap.has(tempValObj.ioeRequestId)) {
        editDeletedMap.set(tempValObj.ioeRequestId,tempValObj);
      }
    }
    let obj = utils.initTemporaryStorageObj(middlewareObject,basicInfo,contentVals.labId);
    obj.operationType = obj.operationType === COMMON_ACTION_TYPE.INSERT ? obj.operationType : COMMON_ACTION_TYPE.UPDATE;
    let storageObj = temporaryStorageMap.get(selectedOrderKey);
    utils.transformStorageInfo(obj,storageObj);
    temporaryStorageMap.set(selectedOrderKey,obj);

    //验证是否改值---start----
    let ques = constants.ITEM_CATEGORY_TYPE.QUESTION;
    let backup = constants.ITEM_CATEGORY_TYPE.BACKUPQUESTION;
    let questionObject = middlewareObject[`${ques}ValMap`];
    let backupQuestionObject = middlewareObject[`${backup}ValMap`];
    for (const [key, value] of questionObject.entries()) {
      let backObj = backupQuestionObject.get(key);
      //CB--checked,IB,OB,DL--input/text/select
      if (value.frmItemTypeCd === 'CB') {
        if (value.isChecked != backObj.isChecked) {
          updateState && updateState({ isEdit: true });
          break;
        }
      } else {
        if (value.itemVal != backObj.itemVal || value.itemVal2 != backObj.itemVal2) {
          updateState && updateState({ isEdit: true });
          break;
        }
      }
    }
    //---end---
    let content = 'Input Item(s): ';
    for (const [key,value] of questionObject.entries()) {
      if (value.frmItemTypeCd === 'CB' && value.isChecked===true) {
        content += `${value.itemName} (${value.codeIoeFormItemId}): value: Checked;`;
      }else if(value.frmItemTypeCd==='IB'&&value.isChecked===true){
        content += `${value.itemName} (${value.codeIoeFormItemId}): value: ${value.itemVal};`;
      } else if (value.frmItemTypeCd === 'DL' && value.isChecked === true) {
        let dropdownList = dropdownMap.get(value.codeIoeFormItemId).get(constants.ITEM_VALUE.TYPE1);
        for (const objVal of dropdownList.entries()) {
          if(objVal.codeIoeFormItemDropId===value.itemVal){
            content += `${value.itemName} (${value.codeIoeFormItemId}): value: ${objVal.value};`;
            break;
          }
        }
      }
    }
    insertIxRequestLog&&insertIxRequestLog('[Edit Ix Request Order Dialog] [Other Order Information Dialog] Action: Click \'OK\' button',content);

    this.setState({ infoIsOpen: false });
    updateState&&updateState({
      orderIsEdit:false,
      selectedOrderKey: null,
      temporaryStorageMap,
      editDeletedMap
    });
    handleEditDialogClose&&handleEditDialogClose();
  }

  handleInfoDialogCancel = () =>{
    let {insertIxRequestLog}=this.props;
    this.setState({
      infoIsOpen:false
    });
    insertIxRequestLog && insertIxRequestLog(' [Edit Ix Request Order Dialog] [Other Order Information Dialog] Action: Click \'Cancel\' button', '');
  }

  handleEdit = () => {
    let {
      itemMapping,
      // openCommonMessage,
      temporaryStorageMap,
      officerInChargeRequestUser,
      officerInChargeRequestLoginName,
      // deletedStorageMap,
      editDeletedMap,
      updateState,
      handleEditDialogClose,
      insertIxRequestLog,
      codeIoeRequestTypeCd
      } = this.props;
    let { basicInfo,backUpBasicInfo,contentVals,selectedOrderKey,middlewareObject,originFormId,originMiddlewareObject,searchFieldLengthObj,isEdit,backUpMiddlewareObject } = this.state;
    // validate
    let diagnosisErrorFlag = basicInfo.infoDiagnosis === ''?true:false;
    basicInfo.requestUser = officerInChargeRequestUser;
    basicInfo.requestLoginName = officerInChargeRequestLoginName;
    basicInfo.codeIoeRequestTypeCd = codeIoeRequestTypeCd;
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
    let itemNullAbleFlag = utils.itemNullAbleFlag(middlewareObject);

     //Log--start
     let content = `Urgent: ${basicInfo.urgentIsChecked ? 'Yes' : 'No'}; `;
     content += `Clinic Ref. No.: ${basicInfo.clinicRefNo}; `;
     content += `Clinical Summary & Diagnosis: ${basicInfo.infoDiagnosis}; `;
     content += `Remark: ${basicInfo.infoRemark}; Instruction: ${basicInfo.infoInstruction}; `;
     content += `Report to: ${basicInfo.reportTo}; `;
     if (middlewareObject.specimenValMap.size > 0) {
       content += 'Selected specimen: ';
       for (const [key,value] of middlewareObject.specimenValMap.entries()) {
         if (value.isChecked) {
           content += `${value.itemName} (${value.ioeRequestItemId});`;
         }
       }
     } else {
       content += 'Selected specimen: null (null);';
     }
     content += 'Selected test: ';
     if (middlewareObject.testValMap.size > 0) {
       let valObjResult = middlewareObject.testValMap;
       for (const [key,value] of valObjResult.entries()) {
         if (value.isChecked) {
           content += `${value.itemName} (${value.ioeRequestItemId});`;
         }
       }
     }
     else {
      content += 'null (null);';
    }
     insertIxRequestLog && insertIxRequestLog('[Edit Ix Request Order Dialog] Action: Click \'Edit\' button', '', content);
    //Log--End

    if(utils.checkLipidProfileIsCheck(middlewareObject)){
      if (!diagnosisErrorFlag && !searchFieldLengthFlag && itemNullAbleFlag) {
        let msgCode = utils.handleValidateItems(middlewareObject);
        if (msgCode === '') {
          this.props.closeCommonMessage();
          let displayDialogFlag = utils.handleOtherInfoDialogDisplay(middlewareObject,itemMapping);
          if (displayDialogFlag) {
            if (contentVals.selectedSubTabId === originFormId) {
              middlewareObject.questionValMap = _.cloneDeep(originMiddlewareObject.questionValMap);
            } else {
              utils.resetQuestionStatus(middlewareObject.questionValMap);
            }
            //backup question
            middlewareObject.backupQuestionValMap = _.cloneDeep(middlewareObject.questionValMap);
            utils.resetQuestionGroupStatus(middlewareObject.questionGroupMap);
            // has question
            this.setState({
              middlewareObject,
              // backUpMiddlewareObject:_.cloneDeep(middlewareObject),
              infoIsOpen: true
            });
          } else {
            //下层判断
            let isEditBool = false;
            //如果是Close有验证isEdit为true，以下不执行，false才会执行
            if (!isEdit) {
              let questionObject = middlewareObject.testValMap.size > 0 ? middlewareObject.testValMap : middlewareObject.specimenValMap;
              let backupQuestionObject = backUpMiddlewareObject.testValMap.size > 0 ? backUpMiddlewareObject.testValMap : backUpMiddlewareObject.specimenValMap;
              for (const [key, value] of questionObject.entries()) {
                let backObj = backupQuestionObject.get(key);
                //search ix from discipline data cannnot find backobj
                if(backObj != undefined && backObj != null) {
                  //CB--checked,IB,OB,DL--input/text/select
                  if (value.frmItemTypeCd === 'CB') {
                    if (value.isChecked != backObj.isChecked) {
                      isEditBool = true;
                      break;
                    }
                  } else {
                    if (value.itemVal != backObj.itemVal || value.itemVal2 != backObj.itemVal2 || value.isChecked != backObj.isChecked) {
                      isEditBool = true;
                      break;
                    }
                  }
                }else{
                  isEditBool = true;
                  break;
                }
              }
            }
            // no question
            if (contentVals.selectedSubTabId === originFormId) {
              utils.compareMiddlewareObject(middlewareObject,originMiddlewareObject);
              middlewareObject = _.cloneDeep(originMiddlewareObject);
            } else {
              // validate delete
              let tempValObj = _.cloneDeep(temporaryStorageMap.get(selectedOrderKey));
              tempValObj = utils.handleDeletedStorageObj(tempValObj);
              // deletedStorageMap.set(Math.random(),tempValObj);
              if (tempValObj.version&&!editDeletedMap.has(tempValObj.ioeRequestId)) {
                editDeletedMap.set(tempValObj.ioeRequestId,tempValObj);
              }
            }
            let basicBool = false;
            //上层判断
            if (
              basicInfo.urgentIsChecked !== backUpBasicInfo.urgentIsChecked ||
              basicInfo.infoRemark !== backUpBasicInfo.infoRemark ||
              basicInfo.infoInstruction !== backUpBasicInfo.infoInstruction ||
              basicInfo.infoDiagnosis !== backUpBasicInfo.infoDiagnosis ||
              basicInfo.clinicRefNo !== backUpBasicInfo.clinicRefNo ||
              basicInfo.reportTo !== backUpBasicInfo.reportTo
            ) {
              basicBool = true;
            }
            let obj = utils.initTemporaryStorageObj(middlewareObject,basicInfo,contentVals.labId);
            // obj.operationType = COMMON_ACTION_TYPE.UPDATE;
            obj.operationType = obj.operationType === COMMON_ACTION_TYPE.INSERT ? obj.operationType : COMMON_ACTION_TYPE.UPDATE;
            let storageObj = temporaryStorageMap.get(selectedOrderKey);
            utils.transformStorageInfo(obj,storageObj);
            temporaryStorageMap.set(selectedOrderKey,obj);
            //当前页是否改动true/false
            if (isEdit || basicBool || isEditBool) {
              updateState && updateState({
                isEdit: true,
                orderIsEdit: false,
                selectedOrderKey: null,
                temporaryStorageMap,
                editDeletedMap
              });
            } else {
              updateState && updateState({
                orderIsEdit: false,
                selectedOrderKey: null,
                temporaryStorageMap,
                editDeletedMap
              });
            }
            handleEditDialogClose&&handleEditDialogClose();
          }
        } else {
          let payload = {
            msgCode:msgCode
          };
          this.props.openCommonMessage(payload);
        }
      } else {
        this.props.closeCommonMessage();
        this.setState({
          diagnosisErrorFlag
        });
      }
    }else{
      this.props.openCommonMessage({msgCode:IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED});
    }
  }

  resetDialogState = () => {
    this.setState({
      infoIsOpen:false,
      isEdit: false,
      middlewareObject: null,
      targetLabId: null,
      targetFormId: null,
      selectedOrderKey: null,
      orderIsEdit: true,
      originFormId: null,
      originMiddlewareObject: null,
      dialogOpenStatus: false,
      backUpMiddlewareObject:null
      // basicInfo: null,
      // contentVals: null
    });
  }

  render() {
    const { classes, isOpen=false, dropdownMap, lab2FormMap, frameworkMap, ioeFormMap, loginClinicCd,loginServiceCd, itemMapping, temporaryStorageMap,insertIxRequestLog } = this.props;
    let {clinicList}=this.props;
    let { diagnosisErrorFlag, basicInfo, contentVals, infoIsOpen,middlewareObject,orderIsEdit,selectedOrderKey} = this.state;
    let containerProps = {
      ioeFormMap,
      dropdownMap,
      lab2FormMap,
      frameworkMap,
      insertIxRequestLog,
      openCommonMessage: this.props.openCommonMessage,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      ...this.state
    };
    let infoDialogProps = {
      basicInfo,
      contentVals,
      isOpen:infoIsOpen,
      orderIsEdit,
      selectedOrderKey,
      dialogTitle: 'Other Order Information',
      selectedLabId:contentVals.infoTargetLabId,
      selectedFormId:contentVals.infoTargetFormId,
      itemMapping,
      dropdownMap,
      frameworkMap,
      middlewareObject,
      temporaryStorageMap,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      handleInfoDialogOK: this.handleInfoDialogOK,
      handleInfoDialogCancel: this.handleInfoDialogCancel
    };

    let basicInfoProps = {
      diagnosisErrorFlag,
      basicInfo,
      contentVals,
      clinicList,
      loginClinicCd,
      frameworkMap,
      insertIxRequestLog,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      changEditFlag:this.changEditFlag
    };

    let dialogTitle = 'Edit Ix Request Order';
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="body"
          PaperComponent={PaperComponent}
          onExited={()=>{this.resetDialogState();}}
          onEscapeKeyDown={this.handleClose}
      >
        {/* title */}
        <DialogTitle
            className={classes.dialogTitle}
            disableTypography
            editdrag="allowed"
        >
          {dialogTitle}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1}>
              <ValidatorForm id="ixEditForm" onSubmit={()=>{}}>
                <Grid container className={classes.gridContainer}>
                  <Grid item xs={12}>
                    <BasicInfo {...basicInfoProps}/>
                  </Grid>
                  <Grid item xs={12}>
                    <ContentContainer {...containerProps} />
                  </Grid>
                </Grid>
              </ValidatorForm>
            </Paper>
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
          >
            <Grid item xs>
              <p className={classes.remark}><span className={classes.iteoSign}>@</span>: The test must be ordered independently.</p>
              <p className={classes.remark}><span className={classes.itefSign}>#</span> : The test must be ordered with other test(s) not labeled with #.</p>
            </Grid>
            <Grid item container xs justify="flex-end">
              <CIMSButton
                  id="btn_ix_request_edit_order_dialog_edit"
                  onClick={this.handleEdit}
              >
                Edit
              </CIMSButton>
              <CIMSButton
                  id="btn_ix_request_edit_order_dialog_close"
                  onClick={this.handleClose}
              >
                Close
              </CIMSButton>
            </Grid>
          </Grid>
        </DialogActions>
        {/* Info dialog */}
        <OtherInfoDialog {...infoDialogProps} />
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  encounterData: state.patient.encounterInfo,
  loginInfo: state.login.loginInfo,
  loginServiceCd: state.login.service.serviceCd,
  loginClinicCd: state.login.clinic.clinicCd,
  clinicList: state.common.clinicList.filter(clinic=>{ return  clinic.serviceCd===state.login.service.serviceCd;}),
  frameworkMap: state.ixRequest.frameworkMap,
  lab2FormMap: state.ixRequest.lab2FormMap,
  dropdownMap: state.ixRequest.dropdownMap,
  itemMapping: state.ixRequest.itemMapping,
  categoryMap: state.ixRequest.categoryMap
});

const mapDispatchToProps = {
  openCommonMessage,
  closeCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RequestOrderEditDialog));
