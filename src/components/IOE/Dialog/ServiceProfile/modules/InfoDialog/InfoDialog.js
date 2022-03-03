import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid } from '@material-ui/core';
import Draggable from 'react-draggable';
import { styles } from './InfoDialogStyle';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import * as ServiceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import * as utils from '../../utils/dialogUtils';
import _ from 'lodash';
import CIMSButton from '../../../../../Buttons/CIMSButton';

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

class InfoDialog extends Component {
  handleAction = action => {
    let { dialogTitleResult,orderNumber,selectedOrderKey,orderIsEdit,selectedLabId,selectedFormId, middlewareObject, temporaryStorageMap,handleInfoDialogCancel,handleResetOrderNumber,updateStateWithoutStatus,infoEditMode, infoEditMiddlewareObject,insertIxProfileLog } = this.props;
    if (infoEditMode) {
      middlewareObject = _.cloneDeep(infoEditMiddlewareObject);
    }
    // if (action === ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
    //   middlewareObject.infoValMap = middlewareObject.backupInfoValMap;
    // } else if (action === ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.OK) {
    // }


    if (orderIsEdit) {
      // Edit
      let targetObj = temporaryStorageMap.get(selectedOrderKey);
      let obj = utils.initTemporaryStorageObj(middlewareObject, targetObj.testGroup, selectedLabId);
      let content = '';
      for (const [key,value] of obj.infoItemsMap) {
        content += `${value.itemName}: ${value.itemVal};`;
      }
      insertIxProfileLog && insertIxProfileLog(`[${dialogTitleResult} Dialog] [Other Order Information Dialog] Action: Click 'OK' button`, '', content);
      temporaryStorageMap.set(selectedOrderKey, obj);
    } else {
      // Add
      for (let i = 0; i < orderNumber; i++) {
        let currentTestGroup = temporaryStorageMap.size + 1; //seq
        let obj = utils.initTemporaryStorageObj(middlewareObject, currentTestGroup, selectedLabId);
        let timestamp = new Date().valueOf();
        temporaryStorageMap.set(`${selectedFormId}_${timestamp}_${i}`, obj);
      }
    }
    delete middlewareObject.backupInfoValMap;
    updateStateWithoutStatus && updateStateWithoutStatus({
      selectedOrderKey: null,
      orderIsEdit: false,
      temporaryStorageMap,
      selectionAreaIsEdit: false,
      infoEditMode: false,
      infoEditMiddlewareObject: null
    });
    if (!infoEditMode) {
      utils.resetMiddlewareObject(middlewareObject);
      updateStateWithoutStatus && updateStateWithoutStatus({
        middlewareObject
      });
    }
    handleResetOrderNumber && handleResetOrderNumber();
    handleInfoDialogCancel && handleInfoDialogCancel();
  }
  handleActionCancel = action => {
    let { dialogTitleResult,middlewareObject, temporaryStorageMap,handleInfoDialogCancel,handleResetOrderNumber,updateStateWithoutStatus,infoEditMode, infoEditMiddlewareObject,insertIxProfileLog } = this.props;
    if (infoEditMode) {
      middlewareObject = _.cloneDeep(infoEditMiddlewareObject);
    }
    if (action === ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
      middlewareObject.infoValMap = middlewareObject.backupInfoValMap;
    }
    delete middlewareObject.backupInfoValMap;
    updateStateWithoutStatus && updateStateWithoutStatus({
      selectedOrderKey: null,
      orderIsEdit: false,
      temporaryStorageMap,
      selectionAreaIsEdit: false,
      infoEditMode: false,
      infoEditMiddlewareObject: null
    });
    if (!infoEditMode) {
      utils.resetMiddlewareObject(middlewareObject);
      updateStateWithoutStatus && updateStateWithoutStatus({
        middlewareObject
      });
    }
    insertIxProfileLog && insertIxProfileLog(`[${dialogTitleResult} Dialog] [Other Order Information Dialog] Action: Click 'Cancel' button`, '');
    handleResetOrderNumber && handleResetOrderNumber();
    handleInfoDialogCancel && handleInfoDialogCancel();
  }

  generateFieldByType = (item) => {
    let { classes,middlewareObject,updateStateWithoutStatus,infoEditMode, infoEditMiddlewareObject } = this.props;
    let itemType = item.frmItemTypeCd;
    let fieldProps = {
      infoEditMode,
      id:item.codeIoeFormItemId,
      middlewareObject:infoEditMode?infoEditMiddlewareObject:middlewareObject,
      itemValType:ServiceProfileConstants.ITEM_VALUE.TYPE1, //default:value1
      categoryType:ServiceProfileConstants.ITEM_CATEGORY_TYPE.INFO,
      updateStateWithoutStatus
    };
    let element = null;
    if(itemType==ServiceProfileConstants.FORM_ITEM_TYPE.INPUT_BOX){
      fieldProps.maxLength = item.fieldLength;
      fieldProps.sideEffect = utils.handleInfoOperationType;
      fieldProps.disabledFlag = false;
      element = (
        <div className={classes.itemGrid}>
          <InputBoxField {...fieldProps} />
        </div>
      );
    }
    return element;
  }

  generateContents = () => {
    const { classes,selectedLabId,selectedFormId,frameworkMap } = this.props;
    let infoItemsMap = frameworkMap.get(selectedLabId).formMap.get(selectedFormId).infoItemsMap;
    let gridItems = [];
    let items = infoItemsMap.get(ServiceProfileConstants.ITEM_CATEGORY_TYPE.INFO);
    gridItems = items.map(item=>{
      let element = this.generateFieldByType(item);
      return (
        <div key={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} className={classes.itemWrapper}>
          <Grid item xs={4} classes={{'grid-xs-4':classes.itemNameGrid}}>
            <Typography component="div" variant="subtitle1" classes={{subtitle1:classes.itemNameTypography}}>
              {item.frmItemName}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            {element}
          </Grid>
        </div>
      );
    });
    return (
      <Grid container direction="row" justify="center" alignItems="center">
        {gridItems}
      </Grid>
    );
  }

  render() {
    const {
      classes,
      isOpen=false,
      dialogTitle=''
    } = this.props;
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="body"
          PaperComponent={PaperComponent}
          onEscapeKeyDown={()=>{this.handleActionCancel(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
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
            <Paper elevation={1} classes={{ 'root': classes.pagerContent }}>
              {this.generateContents()}
            </Paper>
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid container direction="row" justify="flex-end" alignItems="center">
            <CIMSButton
                id="btn_service_profile_info_dialog_ok"
                onClick={()=>{this.handleAction(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.OK);}}
            >
              OK
            </CIMSButton>
            <CIMSButton
                id="btn_service_profile_info_dialog_cancel"
                onClick={()=>{this.handleActionCancel(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
            >
              Cancel
            </CIMSButton>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(InfoDialog);
