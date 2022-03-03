import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid, Button } from '@material-ui/core';
import { CheckCircle, HighlightOff } from '@material-ui/icons';
import Draggable from 'react-draggable';
import { styles } from './InfoDialogStyle';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import * as ServiceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import * as utils from '../../../ServiceProfile/utils/dialogUtils';
import CIMSButton from '../../../../../Buttons/CIMSButton';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=>{
          return e.target.getAttribute('editinfo') === 'allowed';
        }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class InfoDialog extends Component {
  handleAction = action => {
    let { handleInfoDialogCancel,handleInfoDialogOK } = this.props;
    if (action === ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
      handleInfoDialogCancel&&handleInfoDialogCancel();
    } else {
      handleInfoDialogOK&&handleInfoDialogOK();
    }
  }

  generateFieldByType = (item) => {
    const { classes,middlewareObject,updateState } = this.props;
    let itemType = item.frmItemTypeCd;
    let fieldProps = {
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:ServiceProfileConstants.ITEM_VALUE.TYPE1, //default:value1
      categoryType:ServiceProfileConstants.ITEM_CATEGORY_TYPE.INFO,
      updateState
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
          onEscapeKeyDown={()=>{this.handleAction(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
      >
        {/* title */}
        <DialogTitle
            className={classes.dialogTitle}
            disableTypography
            editinfo="allowed"
        >
          {dialogTitle}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1}>
              {this.generateContents()}
            </Paper>
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid container direction="row" justify="flex-end" alignItems="center">
            <CIMSButton
                id="btn_ix_profile_info_edit_dialog_ok"
                onClick={()=>{this.handleAction(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.OK);}}
            >
              OK
            </CIMSButton>
            <CIMSButton
                id="btn_ix_profile_info_edit_dialog_cancel"
                onClick={()=>{this.handleAction(ServiceProfileConstants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
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
