import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './OrderContainerStyle';
import { Typography, Card, CardContent, Grid, Fab, Tooltip } from '@material-ui/core';
import { Delete, PriorityHighRounded, Edit } from '@material-ui/icons';
import { isNull,cloneDeep } from 'lodash';
import * as ServiceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import * as utils from '../../utils/dialogUtils';
import {COMMON_ACTION_TYPE} from '../../../../../../constants/common/commonConstants';
import ProfileOrderEditDialog from '../../../ProfileOrderEditDialog/ProfileOrderEditDialog';

class OrderContainer extends Component {
  constructor(props){
    super(props);
    this.state={
      editDialogIsOpen:false,
      editMiddlewareObject: null,
      targetLabId:null,
      targetFormId:null,
      editOrderKey:null
    };
  }

  handleEditDialogClose = () => {
    this.setState({
      editDialogIsOpen:false
    });
  }

  generateOrderItems = targetObj => {
    const { classes } = this.props;
    let items = [],displayVals = [],displayTests = [];

    //handle specimen
    let displaySpecimen = '';
    if (targetObj.specimenItemsMap.size>0) {
      for (let valObj of targetObj.specimenItemsMap.values()) {
        if (valObj.operationType !== COMMON_ACTION_TYPE.DELETE) {
          displaySpecimen = this.generateItemDisplayName(valObj);
        }
      }
    }

    //handle test
    if (targetObj.testItemsMap.size > 0) {
      for (let valObj of targetObj.testItemsMap.values()) {
        if (valObj.operationType !== COMMON_ACTION_TYPE.DELETE) {
          let displayVal = '';
          let displayTest = this.generateItemDisplayName(valObj);
          if (displaySpecimen!=='') {
            displayVal = `${displaySpecimen}, ${displayTest}`;
          } else {
            displayVal = `${displayTest}`;
          }
          displayTests.push(displayVal);
        }
      }
    }

    if (displayTests.length>0) {
      displayVals = cloneDeep(displayTests);
    } else {
      displayVals.push(displaySpecimen);
    }

    displayVals.forEach(item => {
      items.push(
        <Tooltip key={`${Math.random()}_order_item`} title={item} classes={{tooltip:classes.tooltip}}>
          <Typography component="div" variant="caption" className={classes.itemTypography} noWrap>
            <span>{item}</span>
          </Typography>
        </Tooltip>
      );
    });

    return (
      <div>{items}</div>
    );
  }

  generateItemDisplayName = valObj => {
    const { dropdownMap } = this.props;
    let displayVal = valObj.itemName||'';
    let val1 = valObj.itemVal,
        val2 = valObj.itemVal2;
    if (valObj.frmItemTypeCd === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      val1 = utils.generateDropdownValue(dropdownMap,valObj,ServiceProfileConstants.ITEM_VALUE.TYPE1);
    }
    if (valObj.frmItemTypeCd2 === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      val2 = utils.generateDropdownValue(dropdownMap,valObj,ServiceProfileConstants.ITEM_VALUE.TYPE2);
    }
    if (!!val1&&!!val2) {
      displayVal = displayVal!==''?`${displayVal}: ${val1},${val2}`:`${val1},${val2}`;
    } else if (!isNull(val1)&&val1!=='') {
      displayVal = displayVal!==''?`${displayVal}: ${val1}`:`${val1}`;
    } else if (!isNull(val2)&&val2!=='') {
      displayVal = displayVal!==''?`${displayVal}: ${val2}`:`${val2}`;
    }
    return displayVal;
  }

  generateInfoTooltip = valMap => {
    const { classes } = this.props;
    let element = '';
    if (valMap.size>0) {
      let items = [];
      for (let [itemId, valObj] of valMap) {
        if (!isNull(valObj.itemVal)&&valObj.itemVal!=='') {
          let displayPreVal = `${valObj.itemName}: `;
          let displayVal = `${valObj.itemVal}`;
          items.push(
            <Typography key={`${itemId}_info_item`} component="div" variant="caption">
              <span className={classes.tooltipItemTitleSpan}>{displayPreVal}</span> <span className={classes.tooltipItemSpan}>{displayVal}</span>
            </Typography>
          );
        }
      }
      if (items.length>0) {
        element = (
          <div>
            {items}
          </div>
        );
      }
    }
    return element;
  }

  handleDeleteOrder = orderKey => {
    const { isNew,deletedStorageMap,temporaryStorageMap,updateStateWithoutStatus,insertIxProfileLog,dialogTitle } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let content = `Code IOE Form ID: ${valObj.codeIoeFormId}; Specimen: ${valObj.formShortName} (${valObj.targetLabId === undefined ? valObj.labId : valObj.targetLabId}); `;
      if (valObj.testItemsMap.size > 0) {
        content += 'Test: ';
        for (const value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.codeIoeFormItemId});`;
        }
      }
      insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Delete' button in Added Order`, '', content);

      if (isNew === ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO) {
        let tempValObj = cloneDeep(temporaryStorageMap.get(orderKey));
        tempValObj = utils.handledeletedStorageObj(tempValObj);
        deletedStorageMap.set(orderKey,tempValObj);
      }
      temporaryStorageMap.delete(orderKey);
      utils.handleOrderDeleted(temporaryStorageMap);
      updateStateWithoutStatus&&updateStateWithoutStatus({
        orderIsEdit:false,
        selectedOrderKey: null,
        temporaryStorageMap,
        deletedStorageMap
      });
    }
  }

  handleEditOrder = orderKey => {
    const { frameworkMap,temporaryStorageMap,insertIxProfileLog,dialogTitle } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let targetFormId = valObj.codeIoeFormId;
      let targetLabId = valObj.labId;
      let formObj = frameworkMap.get(targetLabId).formMap.get(targetFormId);
      let middlewareObject = utils.initMiddlewareObject(formObj,valObj);

      let content = `Code IOE Form ID: ${targetFormId}; Specimen: ${valObj.formShortName} (${targetLabId}); `;
      if (valObj.testItemsMap.size > 0) {
        content += 'Test: ';
        for (const value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.codeIoeFormItemId});`;
        }
      }
      insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Edit' button in Added Order`,'',content);
      middlewareObject.backupInfoValMap = cloneDeep(middlewareObject.infoValMap);
      // updateState&&updateState({
      //   orderIsEdit:true,
      //   selectedOrderKey: orderKey,
      //   middlewareObject
      // });
      // updateStateWithoutStatus&&updateStateWithoutStatus({
      //   selectionAreaIsEdit:false
      // });
      // updateGroupingContainerState&&updateGroupingContainerState({
      //   labValue: targetLabId,
      //   selectedFormId: targetFormId,
      //   infoTargetLabId:targetLabId,
      //   infoTargetFormId:targetFormId
      // });
      this.setState({
        targetLabId,
        targetFormId,
        editDialogIsOpen:true,
        editMiddlewareObject:middlewareObject,
        editOrderKey: orderKey
      });
    }
  }

  handleEditInfo = orderKey => {
    const { frameworkMap,temporaryStorageMap,updateStateWithoutStatus,updateGroupingContainerState,insertIxProfileLog,dialogTitle } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let targetFormId = valObj.codeIoeFormId;
      let targetLabId = valObj.labId;
      let formObj = frameworkMap.get(targetLabId).formMap.get(targetFormId);
      let middlewareObject = utils.initMiddlewareObject(formObj,valObj);
      let content = `Code IOE Form ID: ${targetFormId}; Specimen: ${valObj.formShortName}(${targetLabId}); `;
      if (valObj.testItemsMap.size > 0) {
        content += 'Test: ';
        for (let value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.codeIoeFormItemId});`;
        }
      }
      insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'i' (Information) button in Added Order`,'',content);

      middlewareObject.backupInfoValMap = cloneDeep(middlewareObject.infoValMap);
      updateStateWithoutStatus&&updateStateWithoutStatus({
        orderIsEdit:true,
        selectedOrderKey: orderKey,
        infoEditMode:true,
        infoEditMiddlewareObject: middlewareObject
      });
      updateGroupingContainerState&&updateGroupingContainerState({
        isOpen: true,
        infoTargetLabId:targetLabId,
        infoTargetFormId:targetFormId
      });
    }
  }

  generateOrderTitle = valObj => {
    const { classes } = this.props;
    let { labId, formShortName } = valObj;
    let element = (
      <Typography component="div" noWrap>
        <span className={classes.orderTitle}>{`${labId}, ${formShortName}`}</span>
      </Typography>
    );
    return element;
  }

  generateOrders = () => {
    const { classes,temporaryStorageMap } = this.props;
    let orderCards = [];
    if (temporaryStorageMap.size>0) {
      for (let [orderKey, valObj] of temporaryStorageMap) {
        let { labId, formShortName } = valObj;
        let content = this.generateOrderItems(valObj);
        let title = this.generateInfoTooltip(valObj.infoItemsMap);
        orderCards.push(
          <Card key={`${orderKey}_${valObj.codeIoeFormId}`} className={classes.card}>
            <Tooltip title={`${labId}, ${formShortName}`} classes={{tooltip:classes.tooltip}}>
              <Typography component="div" noWrap className={classes.cardHeader} classes={{noWrap:classes.orderTitle}}>
                <span className={classes.orderTitle}>{`${labId}, ${formShortName}`}</span>
              </Typography>
            </Tooltip>
            <CardContent classes={{root:classes.cardContent}}>
              <Grid container>
                <Grid item xs={12}>
                  <div>{content}</div>
                </Grid>
                <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                    spacing={1}
                >
                  <Grid item>
                    <Tooltip title={title} classes={{tooltip:classes.tooltip}}>
                      <Fab
                          size="small"
                          color="primary"
                          aria-label="Info"
                          id="btn_service_profile_dialog_info"
                          className={classes.primaryFab}
                          onClick={()=>{this.handleEditInfo(orderKey);}}
                      >
                        <PriorityHighRounded style={{transform:'rotate(180deg)'}} />
                      </Fab>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Edit Order" classes={{tooltip:classes.tooltip}}>
                      <Fab
                          size="small"
                          color="primary"
                          aria-label="Edit Order"
                          id="btn_service_profile_dialog_edit_order"
                          className={classes.primaryFab}
                          onClick={()=>{this.handleEditOrder(orderKey);}}
                      >
                        <Edit />
                      </Fab>
                    </Tooltip>
                  </Grid>
                  <Grid item className={classes.lastGridItem}>
                    <Tooltip title="Delete Order" classes={{tooltip:classes.tooltip}}>
                      <Fab
                          size="small"
                          color="secondary"
                          aria-label="Delete Order"
                          id="btn_service_profile_dialog_delete_order"
                          className={classes.deleteFab}
                          onClick={()=>{this.handleDeleteOrder(orderKey);}}
                      >
                        <Delete />
                      </Fab>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      }
    }
    return orderCards;
  }

  render() {
    const { classes,temporaryStorageMap,deletedStorageMap,isNew,insertIxProfileLog,dialogTitle } = this.props;
    let { editDialogIsOpen,editMiddlewareObject,targetLabId,targetFormId,editOrderKey } = this.state;
    let editDialogProps = {
      dialogTitle,
      isNew,
      isOpen:editDialogIsOpen,
      selectedOrderKey:editOrderKey,
      editMiddlewareObject,
      targetLabId,
      targetFormId,
      temporaryStorageMap,
      deletedStorageMap,
      insertIxProfileLog,
      handleEditDialogClose:this.handleEditDialogClose
    };
    return (
      <div>
        <Typography
            component="div"
            variant="h6"
            classes={{h6: classes.title}}
            className={classes.header}
        >
          Added Order(s), Total: {temporaryStorageMap.size>0?temporaryStorageMap.size:0}
        </Typography>
        <div className={classes.orderWrapper}>
          {this.generateOrders()}
        </div>
        <ProfileOrderEditDialog {...editDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(OrderContainer);
