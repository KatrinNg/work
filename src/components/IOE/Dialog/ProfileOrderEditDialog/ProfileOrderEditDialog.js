import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './ProfileOrderEditDialogStyle';
import { withStyles, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography, Paper } from '@material-ui/core';
import Draggable from 'react-draggable';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import CIMSButton from '../../../Buttons/CIMSButton';
import ContentContainer from './modules/ContentContainer/ContentContainer';
import * as utils from '../ServiceProfile/utils/dialogUtils';
import * as ServiceProfileConstants from '../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import _ from 'lodash';
import InfoDialog from './modules/InfoDialog/InfoDialog';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import * as ixRequestUtils from '../../../../views/jos/IOE/ixRequest/utils/ixUtils';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=>{
          return e.target.getAttribute('editdrag') === 'allowed';
        }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ProfileOrderEditDialog extends Component {
  constructor(props){
    super(props);
    this.state = {
      infoIsOpen:false,
      isEdit: false,
      middlewareObject: null,
      targetLabId: null,
      targetFormId: null,
      selectedOrderKey: null,
      orderIsEdit: true,
      originFormId: null,
      originMiddlewareObject: null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { isOpen,editMiddlewareObject,targetLabId,targetFormId,selectedOrderKey } = nextProps;
    if (isOpen) {
      this.setState({
        middlewareObject: _.cloneDeep(editMiddlewareObject),
        targetLabId,
        targetFormId,
        selectedOrderKey,
        originFormId: targetFormId,
        originMiddlewareObject: _.cloneDeep(editMiddlewareObject)
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
      isEdit:true,
      ...obj
    });
  }

  handleEdit = () => {
    const { temporaryStorageMap, deletedStorageMap, isNew, handleEditDialogClose,insertIxProfileLog, openCommonMessage,dialogTitle } = this.props;
    let { selectedOrderKey,targetLabId,targetFormId,originFormId,middlewareObject,originMiddlewareObject } = this.state;
    //validate
    let msgCode = utils.handleValidateItems(middlewareObject);
    let nullAbleCheckFlag = utils.checkItemNullAble(middlewareObject);
    insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] [Edit Ix Profile Order Dialog] Action: Click 'Edit' button`,'');
    if(ixRequestUtils.checkLipidProfileIsCheck(middlewareObject)){
      if (msgCode === ''&&nullAbleCheckFlag) {
        utils.validateInfoValMap(originMiddlewareObject.infoValMap,middlewareObject.infoValMap);
        let targetObj = temporaryStorageMap.get(selectedOrderKey);
        if (targetFormId === originFormId) {
          utils.compareMiddlewareObject(middlewareObject,originMiddlewareObject);
          middlewareObject = _.cloneDeep(originMiddlewareObject);
        } else {
          // validate delete
          if (isNew === ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO) {
            let tempValObj = _.cloneDeep(temporaryStorageMap.get(selectedOrderKey));
            tempValObj = utils.handledeletedStorageObj(tempValObj);
            deletedStorageMap.set(Math.random(),tempValObj);
          }
        }
        // Edit
        let obj = utils.initTemporaryStorageObj(middlewareObject,targetObj.testGroup,targetLabId);
        temporaryStorageMap.set(selectedOrderKey,obj);
        handleEditDialogClose&&handleEditDialogClose();
      } else {
        msgCode!==''&&openCommonMessage&&openCommonMessage({msgCode});
      }
    }else {
      openCommonMessage&&openCommonMessage({msgCode:IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED});
    }
  }

  handleClose = () => {
    const { handleEditDialogClose,insertIxProfileLog,dialogTitle } = this.props;
    let { isEdit } = this.state;
    if (isEdit) {
      let payload = {
        msgCode:SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM,
        btnActions: {
          btn1Click: () => {
            let name = commonUtils.commonMessageLog(SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM, 'Yes', `[${dialogTitle} Dialog] [Edit Ix Profile Order Dialog]`);
            insertIxProfileLog&&insertIxProfileLog(name,'');
            handleEditDialogClose&&handleEditDialogClose();
          },btn2Click:()=>{
            let name = commonUtils.commonMessageLog(SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM, 'No', `[${dialogTitle} Dialog] [Edit Ix Profile Order Dialog]`);
            insertIxProfileLog&&insertIxProfileLog(name,'');
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] [Edit Ix Profile Order Dialog] Action: Click 'Close' button`,'');
      handleEditDialogClose&&handleEditDialogClose();
    }
  }

  handleInfoDialogOK = () =>{
    const { temporaryStorageMap, deletedStorageMap, isNew, handleEditDialogClose } = this.props;
    let { selectedOrderKey,targetLabId,targetFormId,originFormId,middlewareObject,originMiddlewareObject } = this.state;
    let targetObj = temporaryStorageMap.get(selectedOrderKey);
    if (targetFormId === originFormId) {
      utils.compareMiddlewareObject(middlewareObject,originMiddlewareObject);
      middlewareObject = _.cloneDeep(originMiddlewareObject);
    } else {
      // validate delete
      if (isNew === ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO) {
        let tempValObj = _.cloneDeep(temporaryStorageMap.get(selectedOrderKey));
        tempValObj = utils.handledeletedStorageObj(tempValObj);
        deletedStorageMap.set(Math.random(),tempValObj);
      }
    }
    // Edit
    let obj = utils.initTemporaryStorageObj(middlewareObject,targetObj.testGroup,targetLabId);
    temporaryStorageMap.set(selectedOrderKey,obj);
    this.setState({
      infoIsOpen:false
    });
    handleEditDialogClose&&handleEditDialogClose();
  }

  handleInfoDialogCancel = () =>{
    this.setState({
      infoIsOpen:false
    });
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
      originMiddlewareObject: null
    });
  }

  render() {
    const { classes, isOpen=false, dropdownMap, lab2FormMap, frameworkMap, ioeFormMap,insertIxProfileLog,dialogTitle } = this.props;
    let {infoIsOpen,middlewareObject,targetLabId,targetFormId} = this.state;
    let containerProps = {
      dialogTitle,
      ioeFormMap,
      dropdownMap,
      lab2FormMap,
      frameworkMap,
      insertIxProfileLog,
      openCommonMessage,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      ...this.state
    };
    let infoDialogProps = {
      isOpen:infoIsOpen,
      dialogTitle: 'Other Order Information',
      selectedLabId:targetLabId,
      selectedFormId:targetFormId,
      frameworkMap,
      middlewareObject,
      insertIxProfileLog,
      updateState:this.updateState,
      handleInfoDialogOK: this.handleInfoDialogOK,
      handleInfoDialogCancel: this.handleInfoDialogCancel
    };

    let dialogTitleResult = 'Edit Ix Profile Order';
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
          {dialogTitleResult}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1}>
              <Grid container className={classes.gridContainer}>
                <Grid item xs={12}>
                  <ContentContainer {...containerProps} />
                </Grid>
              </Grid>
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
                  id="btn_ix_profile_order_dialog_edit"
                  onClick={this.handleEdit}
              >
                Edit
              </CIMSButton>
              <CIMSButton
                  id="btn_ix_profile_order_dialog_close"
                  onClick={this.handleClose}
              >
                Close
              </CIMSButton>
            </Grid>
          </Grid>
        </DialogActions>
        {/* Info dialog */}
        <InfoDialog {...infoDialogProps} />
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  ioeFormMap: state.serviceProfile.ioeFormMap,
  frameworkMap: state.serviceProfile.frameworkMap,
  lab2FormMap: state.serviceProfile.lab2FormMap,
  dropdownMap: state.serviceProfile.dropdownMap
});

const mapDispatchToProps = {
  openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileOrderEditDialog));
