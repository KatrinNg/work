import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid, Button, Card, CardContent } from '@material-ui/core';
import Draggable from 'react-draggable';
import { styles } from './OtherInfoDialogStyle';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as constants from '../../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../../utils/ixUtils';
import { findIndex,uniq,intersection } from 'lodash';
import classNames from 'classnames';

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
    this.diaplayIQS = false;
    this.displayIQSids = new Set();
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
    let { middlewareObject, updateState,handleInfoDialogCancel,handleInfoDialogOK } = this.props;
    if (action === constants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
      middlewareObject.questionValMap = middlewareObject.backupQuestionValMap;
      handleInfoDialogCancel&&handleInfoDialogCancel();
      delete middlewareObject.backupQuestionValMap;
      updateState&&updateState({
        middlewareObject
      });
    } else {
      //verify
      let mandatoryFlag = this.handleMandatoryVerify();
      if (mandatoryFlag) {
        // if (this.diaplayIQS&&this.displayIQSids.size>0) {
        //   utils.pretreatmentEditIQS(middlewareObject,this.displayIQSids);
        // }
        utils.pretreatmentEditIQS(middlewareObject,this.displayIQSids);
        updateState&&updateState({
          middlewareObject
        });
        handleInfoDialogOK&&handleInfoDialogOK(this.diaplayIQS);
      } else {
        this.setState({
          isError: true
        });
        updateState&&updateState({
          middlewareObject
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
        return item.codeIoeFormItemId === id&&(item.ioeType === constants.ITEM_QUESTION_TYPE.IQU || item.ioeType === constants.ITEM_QUESTION_TYPE.IRE)&&item.frmItemTypeCd === constants.FORM_ITEM_TYPE.CLICK_BOX;
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
    const { classes,dropdownMap,middlewareObject,updateState } = this.props;
    let itemType = null;
    if (type === constants.ITEM_VALUE.TYPE1) {
      itemType = item.frmItemTypeCd;
    } else if (type === constants.ITEM_VALUE.TYPE2) {
      itemType = item.frmItemTypeCd2;
    }

    let fieldProps = {
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:type,
      categoryType:constants.ITEM_CATEGORY_TYPE.QUESTION,
      sideEffect:this.handleQuestionType,
      updateState
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
        fieldProps.enableDisabled = false;
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
        fieldProps.enableDisabled = false;
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
    const { selectedFormId,middlewareObject,itemMapping } = this.props;
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
          displayItem = this.validateIQS(item, true);
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
      displayGroupFlag = this.validateIQS(questionItems[0],true);
    }
    return displayGroupFlag;
  }

  validateIQS = (questionItem,newMode = false) => {
    const { middlewareObject,itemMapping } = this.props;
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
          if (newMode) {
            this.displayIQSids.add(questionItem.codeIoeFormItemId);
          }
          this.diaplayIQS = true;
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
    const { classes,frameworkMap,selectedLabId,selectedFormId,middlewareObject } = this.props;
    let groups = [];
    if (frameworkMap.size > 0 ) {
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
    this.diaplayIQS = false;
    this.displayIQSids = new Set();
    this.setState({
      isError: false
    });
  }

  render() {
    const { classes, isOpen=false, dialogTitle='' } = this.props;
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
          onEnter={this.resetStatus}
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
                  color="primary"
                  id="btn_ix_request_edit_other_info_dialog_ok"
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
                  id="btn_ix_request_edit_other_info_dialog_cancel"
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
