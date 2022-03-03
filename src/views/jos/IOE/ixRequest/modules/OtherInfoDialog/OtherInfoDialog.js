import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid, Button, Card, CardContent } from '@material-ui/core';
import Draggable from 'react-draggable';
import { styles } from './OtherInfoDialogStyle';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import { findIndex,cloneDeep,uniq,intersection } from 'lodash';
import classNames from 'classnames';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../../../constants/common/commonConstants';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=>{
          return e.target.getAttribute('customdraginfo') === 'allowed';
        }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class OtherInfoDialog extends Component {
  constructor(props){
    super(props);
    this.displayGroupNames = new Set();
    this.state = {
      isError: false
    };
  }

  handleMandatoryVerify = () => {
    let { middlewareObject } = this.props;
    let mandatoryFlag = true;
    let { questionGroupMap,questionValMap } = middlewareObject;
    if (this.displayGroupNames.size > 0) {
      for (let groupName of this.displayGroupNames.values()) {
        let obj = questionGroupMap.get(groupName);
        let {ids} = obj;
        let mandatoryFlags = [];
        if (ids.length > 0) {
          ids.forEach(id => {
            if (questionValMap.get(id).isChecked) {
              mandatoryFlags.push(id);
            }
          });
          if (mandatoryFlags.length === 0) {
            obj.isError = true;
            mandatoryFlag = false;
          } else {
            obj.isError = false;
          }
        }
      }
    }

    return mandatoryFlag;
  }

  handleAction = action => {
    let { dropdownMap, topTabSwitchFlag, topTabParamsObj, tabSwitchFlag, nextStepParamsObj, orderNumber, selectedOrderKey, orderIsEdit,
      selectedLabId, selectedFormId, middlewareObject, temporaryStorageMap, updateState, handleInfoDialogCancel, handleResetOrderNumber,
      basicInfo, updateStateWithoutStatus, updateGroupingContainerState, questionEditMode = false, insertIxRequestLog,
      reminderIsChecked, lableIsChecked, outputFormIsChecked, artificialChecked, serviceSpecificFunctionInfo, isCanDisabled, searchIsOpen } = this.props;
      let itemType = null;
    if (action === constants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
      middlewareObject.questionValMap = middlewareObject.backupQuestionValMap;
      delete middlewareObject.backupQuestionValMap;
      if (questionEditMode) {
        updateStateWithoutStatus&&updateStateWithoutStatus({ questionEditMiddlewareObject:middlewareObject });
      } else {
        updateStateWithoutStatus&&updateStateWithoutStatus({ middlewareObject });
      }
      insertIxRequestLog && insertIxRequestLog('[Other Order Information Dialog] Action: Click \'Cancel\' button', '');
      updateStateWithoutStatus&&updateStateWithoutStatus({
        topTabSwitchFlag:false,
        topTabParamsObj:null,
        tabSwitchFlag:false,
        nextStepParamsObj:null,
        selectedOrderKey:null,
        orderIsEdit:false,
        questionEditMode:false,
        basicInfo:{
          ...basicInfo,
          infoOrderType:basicInfo.orderType
        }
      });
      handleInfoDialogCancel&&handleInfoDialogCancel();
    } else {
      //verify
      let mandatoryFlag = this.handleMandatoryVerify();
      if (mandatoryFlag) {
        if (orderIsEdit) {
          // Edit
          let obj = utils.initTemporaryStorageObj(middlewareObject,basicInfo,selectedLabId);
          let storageObj = temporaryStorageMap.get(selectedOrderKey);
          utils.transformStorageInfo(obj,storageObj);
          utils.transformOtherValMap(obj,middlewareObject);
          temporaryStorageMap.set(selectedOrderKey,obj);
        } else {
          // Add
          for (let i = 0; i < orderNumber; i++) {
            let obj = utils.initTemporaryStorageObj(middlewareObject,basicInfo,selectedLabId);
            let timestamp = new Date().valueOf();
            temporaryStorageMap.set(`${selectedFormId}_${timestamp}_${i}`,obj);
          }
        }
        //验证是否改变值State
        let ques = constants.ITEM_CATEGORY_TYPE.QUESTION;
        let backup = constants.ITEM_CATEGORY_TYPE.BACKUPQUESTION;
        let questionObject = middlewareObject[`${ques}ValMap`];
        let backupQuestionObject = middlewareObject[`${backup}ValMap`];
        for (const [key, value] of questionObject) {
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
        //---End---
        let outputFormIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
        let reminderIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
        let lableIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
        delete middlewareObject.backupQuestionValMap;
        if (questionEditMode) {
          updateStateWithoutStatus&&updateStateWithoutStatus({ questionEditMiddlewareObject:middlewareObject });
        } else {
          utils.resetMiddlewareObject(middlewareObject);
          updateStateWithoutStatus&&updateStateWithoutStatus({ middlewareObject });
        }
        let content = 'Input Item(s): ';
        for (const value of questionObject.values()) {
          if (value.frmItemTypeCd === 'CB' && value.isChecked===true) {
            content += `${value.itemName} (${value.codeIoeFormItemId}): value: Checked;`;
          }else if(value.frmItemTypeCd==='IB'&&value.isChecked===true){
            content += `${value.itemName} (${value.codeIoeFormItemId}): value: ${value.itemVal};`;
          } else if (value.frmItemTypeCd === 'DL' && value.isChecked === true) {
            let dropdownList = dropdownMap.get(value.codeIoeFormItemId).get(constants.ITEM_VALUE.TYPE1);
            for (const obj of dropdownList.values()) {
              if(obj.codeIoeFormItemDropId===value.itemVal){
                content += `${value.itemName} (${value.codeIoeFormItemId}): value: ${obj.value};`;
                break;
              }
            }
          }
        }
        insertIxRequestLog&&insertIxRequestLog('[Other Order Information Dialog] Action: Click \'OK\' button','',content);
        updateState&&updateState({
          selectedOrderKey:null,
          orderIsEdit:false,
          temporaryStorageMap,
          questionEditMode:false,

          outputFormIsChecked: artificialChecked ? outputFormIsChecked : outputFormIsChecked1,
          reminderIsChecked: artificialChecked ? reminderIsChecked : reminderIsChecked1,
          lableIsChecked: artificialChecked ? lableIsChecked : lableIsChecked1,
          btnSwith: artificialChecked ? (outputFormIsChecked || reminderIsChecked || lableIsChecked) : (outputFormIsChecked1 || reminderIsChecked1 || lableIsChecked1)
        });
        if (tabSwitchFlag) {
          let tempObj = cloneDeep(nextStepParamsObj);
          updateStateWithoutStatus&&updateStateWithoutStatus({
            ...tempObj,
            nextStepParamsObj:null,
            tabSwitchFlag:false
          });
          if (topTabSwitchFlag) {
            let tempParamsObj = cloneDeep(topTabParamsObj);
            updateGroupingContainerState&&updateGroupingContainerState({
              ...tempParamsObj
            });
            updateStateWithoutStatus&&updateStateWithoutStatus({
              topTabParamsObj:null,
              topTabSwitchFlag:false
            });
          }
        }
        updateStateWithoutStatus&&updateStateWithoutStatus({
          selectionAreaIsEdit:false
        });
        this.props.verifyPrintStatusAfterAddOrder();
        EventEmitter.emit('ix_request_add_order');
        handleResetOrderNumber&&handleResetOrderNumber();
        handleInfoDialogCancel&&handleInfoDialogCancel();
        searchIsOpen && EventEmitter.emit('ix_request_turn_to_select_tab');
      } else {
        this.setState({
          isError: true
        });
      }
    }
  }

  handleQuestionType = (id,valMap) => {
    let { frameworkMap,selectedLabId,selectedFormId } = this.props;
    let questionItemsMap = frameworkMap.get(selectedLabId).formMap.get(selectedFormId).questionItemsMap;
    let iquIdSet = new Set();
    for (let items of questionItemsMap.values()) {
      let index = findIndex(items,item=>{
        return item.codeIoeFormItemId === id && (item.ioeType === constants.ITEM_QUESTION_TYPE.IQU || item.ioeType === constants.ITEM_QUESTION_TYPE.IRE) && item.frmItemTypeCd === constants.FORM_ITEM_TYPE.CLICK_BOX;
      });
      if (index!==-1) {
        items.forEach(item => {
          iquIdSet.add(item.codeIoeFormItemId);
        });
        break;
      }
    }
    utils.handleQuestionItem(id,valMap,iquIdSet);
  }

  generateItemByType = (item,type=constants.ITEM_VALUE.TYPE1) => {
    let { classes,dropdownMap,middlewareObject,updateState,updateStateWithoutStatus,questionEditMode,isCanDisabled} = this.props;
    let itemType = null;
    if (type === constants.ITEM_VALUE.TYPE1) {
      itemType = item.frmItemTypeCd;
    } else if (type === constants.ITEM_VALUE.TYPE2) {
      itemType = item.frmItemTypeCd2;
    }

    let fieldProps = {
      questionEditMode,
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:type,
      categoryType:constants.ITEM_CATEGORY_TYPE.QUESTION,
      sideEffect:this.handleQuestionType,
      updateState,
      updateStateWithoutStatus,
      disabledFlag:isCanDisabled
    };

    let element = null;
    switch (itemType) {
      case constants.FORM_ITEM_TYPE.CLICK_BOX:{
        if (type === constants.ITEM_VALUE.TYPE1) {
          element = (
            <div className={classes.questionWrapper}>
              <div className={classes.componentWrapper}>
                <ClickBoxField {...fieldProps} />
              </div>
              <label>{item.frmItemName}</label>
            </div>
          );
        }
        break;
      }
      case constants.FORM_ITEM_TYPE.INPUT_BOX:{
        fieldProps.maxLength = item.fieldLength;
        fieldProps.sideEffect = utils.handleInfoOperationType;
        fieldProps.enableDisabled = isCanDisabled;
        element = (
          <div className={classes.questionWrapper}>
            <label>{item.frmItemName}</label>
            <InputBoxField {...fieldProps} />
          </div>
        );
        break;
      }
      case constants.FORM_ITEM_TYPE.DROP_DOWN_LIST:{
        fieldProps.dropdownMap = dropdownMap;
        fieldProps.sideEffect = utils.handleInfoOperationType;
        fieldProps.enableDisabled = isCanDisabled;
        element = (
          <div className={classes.questionWrapper}>
            <label>{item.frmItemName}</label>
            <DropdownField {...fieldProps} />
          </div>
        );
        break;
      }
      default:
        break;
    }
    return element;
  }

  isDislayItem = item => {
    let { selectedFormId,middlewareObject,itemMapping } = this.props;
    let displayItem = true;
    let { questionValMap } = middlewareObject;
    if (itemMapping.has(selectedFormId)) {
      let itemMap = itemMapping.get(selectedFormId);
      let currentItemId = item.codeIoeFormItemId;
      if (itemMap.has(currentItemId)) {
        let mappingIds = itemMap.get(currentItemId);
        mappingIds.forEach(id => {
          displayItem = questionValMap.has(id)?questionValMap.get(id).isChecked:false;
        });
      }
    }
    return displayItem;
  }

  generateGroupItems = items => {
    let { classes,selectedLabId,selectedFormId } = this.props;
    let itemElements = [];
    if (items.length>0) {
      items.forEach(item => {
        let itemElement = this.generateItemByType(item,constants.ITEM_VALUE.TYPE1);
        let displayItem = true;
        if (item.ioeType === constants.ITEM_QUESTION_TYPE.IQS) {
          displayItem = this.validateIQS(item);
        } else {
          displayItem = this.isDislayItem(item);
        }
        itemElements.push(
          <div
              key={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`}
              className={
                classNames({
                  [classes.displayNone]:!displayItem
                })
              }
          >
            {itemElement}
          </div>
        );
      });
    }
    return itemElements;
  }

  validateGroup = (questionItems) => {
    let displayGroupFlag = true;
    let index = findIndex(questionItems,item => {
      return item.ioeType !== constants.ITEM_QUESTION_TYPE.IQS;
    });
    if (index === -1) {
      // only exist IQS
      displayGroupFlag = this.validateIQS(questionItems[0]);
    }
    return displayGroupFlag;
  }

  validateIQS = (questionItem) => {
    let { middlewareObject,itemMapping } = this.props;
    let { codeIoeFormId,specimenValMap,testValMap } = middlewareObject;
    let displayIQS = false;
    if (itemMapping.has(codeIoeFormId)) {
      let itemMap = itemMapping.get(codeIoeFormId);

      let selectedIdArray = [];
      for (const itemObj of specimenValMap.values()) {
        if (itemObj.isChecked) {
          selectedIdArray.push(itemObj.codeIoeFormItemId);
        }
      }
      for (const itemObj of testValMap.values()) {
        if (itemObj.isChecked) {
          selectedIdArray.push(itemObj.codeIoeFormItemId);
        }
      }
      selectedIdArray = uniq(selectedIdArray);
      if (selectedIdArray.length>0 && itemMap.has(questionItem.codeIoeFormItemId)) {
        let specialIdSet = itemMap.get(questionItem.codeIoeFormItemId);
        let tempArray = intersection(selectedIdArray, [...specialIdSet]);
        if (tempArray.length>0) {
          displayIQS = true;
        }
      }
    }
    return displayIQS;
  }

  validateIsQuestion = items => {
    let displayRequired = false;
    let index = findIndex(items,item=>{
      return item.ioeType === constants.ITEM_QUESTION_TYPE.IQS || item.ioeType === constants.ITEM_QUESTION_TYPE.IQU || item.ioeType === constants.ITEM_QUESTION_TYPE.IQUM;
    });
    if (index !== -1) {
      displayRequired = true;
    }
    return displayRequired;
  }

  generateQuestionList = () => {
    let { isOpen,classes,frameworkMap,selectedLabId,selectedFormId,middlewareObject } = this.props;
    let groups = [];
    if (frameworkMap.size > 0 &&isOpen) {
      let questionItemsMap = frameworkMap.get(selectedLabId).formMap.get(selectedFormId).questionItemsMap;
      if (!!questionItemsMap&&questionItemsMap.size>0) {
        for (let [groupName, items] of questionItemsMap) {
          let displayGroup = this.validateGroup(items);
          let displayRequired = this.validateIsQuestion(items);
          let { questionGroupMap } = middlewareObject;
          let groupObj = questionGroupMap.get(groupName);
          let errorSpanElm = groupObj.isError?(
            <span className={classes.errorSpan}>(This field is required.)</span>
          ):null;
          if (!displayGroup) {
            continue;
          } else {
            let itemElements = this.generateGroupItems(items);
            this.displayGroupNames.add(groupName);
            groups.push(
              <Card
                  key={`ix_request_other_info_${selectedLabId}_${selectedFormId}_${groupName}`}
                  className={
                    classNames(classes.card,{
                      [classes.errorCard]:groupObj.isError
                    })
                  }
              >
                <CardContent classes={{root:classes.cardContent}}>
                  <Typography
                      component="div"
                      variant="subtitle1"
                      classes={{subtitle1: classes.groupNameTitle}}
                  >
                    {displayRequired?(
                      <label><span className={classes.requiredFlag}>*</span> {groupName} {errorSpanElm}</label>
                    ):(
                      <label>{groupName}</label>
                    )}
                  </Typography>
                  <Typography component="div">{itemElements}</Typography>
                </CardContent>
              </Card>
            );
          }
        }
      }
    }
    return groups;
  }

  resetStatus = () => {
    this.displayGroupNames = new Set();
    this.setState({
      isError: false
    });
  }

  render() {
    const { classes, isOpen=false, dialogTitle='',isCanDisabled} = this.props;
    let { isError } = this.state;
    let errorTipElm = null;
    if (isError) {
      errorTipElm = (
        <label className={classes.errorTip}>Please review and complete the required items.</label>
      );
    }
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="paper"
          PaperComponent={PaperComponent}
          onExited={this.resetStatus}
          onEscapeKeyDown={()=>{this.handleAction(constants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
      >
        {/* title */}
        <DialogTitle
            className={classes.dialogTitle}
            disableTypography
            customdraginfo="allowed"
        >
          {dialogTitle}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            {this.generateQuestionList()}
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
              <label><span className={classes.requiredFlag}>*</span> Mandatory field</label>
              {errorTipElm}
            </Grid>
            <Grid item>
              <Button
                  classes={{
                    'root':classes.btnRoot,
                    'label':classes.btnLabel
                  }}
                  disabled={isCanDisabled}
                  color="primary"
                  id="btn_ix_request_other_info_dialog_ok"
                  onClick={()=>{this.handleAction(constants.INFO_DIALOG_ACTION_TYPE.OK);}}
                  variant="contained"
              >
                OK
              </Button>
              <Button
                  classes={{
                    'root':classes.btnRoot,
                    'label':classes.btnLabel
                  }}
                  color="primary"
                  id="btn_ix_request_other_info_dialog_cancel"
                  onClick={()=>{this.handleAction(constants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
                  variant="contained"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(OtherInfoDialog);
