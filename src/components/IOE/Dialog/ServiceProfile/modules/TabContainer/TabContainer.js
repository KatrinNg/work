import React, { Component } from 'react';
import { withStyles, AppBar, Toolbar, Typography, Drawer, Divider, List, ListItem, ListItemText, Tooltip, Grid, Fab } from '@material-ui/core';
import { styles } from './TabContainerStyle';
import classNames from 'classnames';
import { ArrowForward, TextRotationNone } from '@material-ui/icons';
import TestContainer from '../TestContainer/TestContainer';
import SpecimenContainer from '../SpecimenContainer/SpecimenContainer';
import ValidatorForm from '../../../../../FormValidator/ValidatorForm';
import * as utils from '../../utils/dialogUtils';
import { cloneDeep,delay } from 'lodash';
import CustomizedSelectFieldValidator from '../../../../../Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as serviceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import CIMSMultiTabs from '../../../../../Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../../../../../Tabs/CIMSMultiTab';
import {SERVICE_PROFILE_MAINTENANCE_CODE} from '../../../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import * as ixRequestUtils from '../../../../../../views/jos/IOE/ixRequest/utils/ixUtils';


class TabContainer extends Component {
  constructor(props){
    super(props);
    let { selectedFormId } = props;
    this.state={
      open: false,
      selectedFormId: selectedFormId
    };
  }

  handleDrawerClick = labId => {
    let { middlewareObject,lab2FormMap,frameworkMap,updateStateWithoutStatus,updateGroupingContainerState,selectionAreaIsEdit,openCommonMessage,closeCommonMessage } = this.props;
    let selectedFormId = lab2FormMap.get(labId)[0];
    let formObj = frameworkMap.get(labId).formMap.get(selectedFormId);
    let valObj = utils.initMiddlewareObject(formObj);
    let validateMsgCode = utils.handleValidateItems(middlewareObject);
    let nullAbleCheckFlag = utils.checkItemNullAble(middlewareObject);
    // let validateMsgCode = utils.handleValidateItemsIncludeTestAndSpecimen(middlewareObject);
    let noCheckedBoxChecked=false;
    let {testValMap,specimenValMap} = middlewareObject;
    if (testValMap.size > 0 ) {
      for (let valueObj of testValMap.values()) {
        if (valueObj.isChecked) {
          noCheckedBoxChecked=true;
        }
      }
    }
    if ( specimenValMap.size>0) {
      for (let valueObj of specimenValMap.values()) {
        if (valueObj.isChecked) {
          noCheckedBoxChecked=true;
        }
      }
    }
    if(noCheckedBoxChecked){
      if (selectionAreaIsEdit) {
        let payload = {
          msgCode: SERVICE_PROFILE_MAINTENANCE_CODE.SWITCH_TAB_CHANGED,
          btn1AutoClose:false,
          btnActions: {
            btn1Click: () => {
              let lipidProfileFlag = ixRequestUtils.checkLipidProfileIsCheck(middlewareObject);
              validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
              if (validateMsgCode === ''&&nullAbleCheckFlag) {
                this.handleAddOrder();//添加已经勾选的数据
                updateStateWithoutStatus&&updateStateWithoutStatus({
                  selectionAreaIsEdit:false,
                  orderIsEdit:false,
                  selectedOrderKey: null,
                  middlewareObject:valObj
                });
                updateGroupingContainerState&&updateGroupingContainerState({
                  selectedFormId,
                  labValue:labId
                });
                closeCommonMessage&&closeCommonMessage();
              } else {
                closeCommonMessage&&closeCommonMessage();
                delay(()=>{
                  validateMsgCode!==''&&openCommonMessage&&openCommonMessage({msgCode:validateMsgCode});
                },500);
              }
            },
            btn2Click: () => {
              updateStateWithoutStatus&&updateStateWithoutStatus({
                selectionAreaIsEdit:false,
                orderIsEdit:false,
                selectedOrderKey: null,
                middlewareObject:valObj
              });
              updateGroupingContainerState&&updateGroupingContainerState({
                selectedFormId,
                labValue:labId
              });
            }
          }
        };
        openCommonMessage&&openCommonMessage(payload);
      } else {
        updateStateWithoutStatus&&updateStateWithoutStatus({
          orderIsEdit:false,
          selectedOrderKey: null,
          middlewareObject:valObj
        });
        updateGroupingContainerState&&updateGroupingContainerState({
          selectedFormId,
          labValue:labId
        });
      }
    }else{
      updateStateWithoutStatus&&updateStateWithoutStatus({
        orderIsEdit:false,
        selectedOrderKey: null,
        middlewareObject:valObj
      });
      updateGroupingContainerState&&updateGroupingContainerState({
        selectedFormId,
        labValue:labId
      });
    }
  };

  generateDrawerList = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let list = [];
    for (let labId of frameworkMap.keys()) {
      list.push(
        <ListItem
            id={labId}
            key={labId}
            button
            style={{padding: '3px'}}
            onClick={() => {this.handleDrawerClick(labId);}}
            className={classNames({
              [classes.selectedItem]: labId === selectedLabId
            })}
        >
          <ListItemText
              style={{textAlign: 'center'}}
              primary={
                <Typography className={classes.font}>
                  {labId}
                </Typography>
              }
          />
        </ListItem>
      );
    }
    return list;
  }

  handleDrawerOpen = () => {
    this.setState({
      open: true
    });
  };

  handleDrawerClose = () => {
    this.setState({
      open: false
    });
  };

  handleAddOrder = () => {
    const {dialogTitle,frameworkMap,orderNumber,selectedLabId,selectedFormId, middlewareObject, temporaryStorageMap, updateState, openCommonMessage,updateGroupingContainerState,updateStateWithoutStatus,insertIxProfileLog } = this.props;
    let formObj = frameworkMap.get(selectedLabId).formMap.get(selectedFormId);
    let valObj = utils.initMiddlewareObject(formObj);
    if(ixRequestUtils.checkLipidProfileIsCheck(middlewareObject)){
      //validate
      let msgCode = utils.handleValidateItems(middlewareObject);
      let nullAbleCheckFlag = utils.checkItemNullAble(middlewareObject);
      if (msgCode === ''&&nullAbleCheckFlag) {
        // Add
        for (let i = 0; i < orderNumber; i++) {
          let currentTestGroup = temporaryStorageMap.size+1;
          let obj = utils.initTemporaryStorageObj(middlewareObject,currentTestGroup,selectedLabId);
          let timestamp = new Date().valueOf();
          temporaryStorageMap.set(`${selectedFormId}_${timestamp}_${i}`,obj);
        }
        let content = `Quantity: ${orderNumber}; Specimen: ${valObj.formShortName} (${selectedLabId});`;
        if (valObj.testValMap.size > 0) {
          content += 'Test: ';
          for (const value of valObj.testValMap.values()) {
            content += `${value.itemName} (${value.codeIoeFormItemId}); `;
          }
        }
        insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click '→' (Add Order) button`, '', content);

        updateState&&updateState({
          selectedOrderKey:null,
          orderIsEdit:false,
          temporaryStorageMap,
          middlewareObject: valObj
        });
        updateGroupingContainerState&&updateGroupingContainerState({
          orderNumber:serviceProfileConstants.ORDER_NUMBER_OPTIONS[0].value
        });
        updateStateWithoutStatus&&updateStateWithoutStatus({
          selectionAreaIsEdit:false
        });
      } else {
        msgCode!==''&&openCommonMessage&&openCommonMessage({msgCode});
      }
    }else{
      openCommonMessage&&openCommonMessage({msgCode:IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED});
    }
  }

  handleAddOrderWithInfo = () => {
    let { updateGroupingContainerState,orderNumber,openCommonMessage,middlewareObject,selectedLabId,selectedFormId,updateState,insertIxProfileLog,dialogTitle } = this.props;
    let content = `Quantity: ${orderNumber} ; Specimen: ${middlewareObject.formShortName} (${selectedLabId});`;
    if (middlewareObject.testValMap.size > 0) {
      content += 'Test: ';
      for (const value of middlewareObject.testValMap.values()) {
        content += `${value.itemName} (${value.codeIoeFormItemId}); `;
      }
    }
    insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'A→' (Add Order) button`,'',content);
    if(ixRequestUtils.checkLipidProfileIsCheck(middlewareObject)){
      //validate
      let msgCode = utils.handleValidateItems(middlewareObject);
      let nullAbleCheckFlag = utils.checkItemNullAble(middlewareObject);
      if (msgCode === ''&&nullAbleCheckFlag) {
        //backup info
        // let formObj = frameworkMap.get(selectedLabId).formMap.get(selectedFormId);
        // let valObj = utils.initMiddlewareObject(formObj);
        // valObj.backupInfoValMap = cloneDeep(middlewareObject.infoValMap);
        middlewareObject.backupInfoValMap = cloneDeep(middlewareObject.infoValMap);
        updateState&&updateState({
          middlewareObject
        });
        updateGroupingContainerState&&updateGroupingContainerState({
          isOpen: true,
          infoTargetLabId:selectedLabId,
          infoTargetFormId:selectedFormId
        });
      } else {
        msgCode!==''&&openCommonMessage&&openCommonMessage({msgCode});
      }
    }else {
      openCommonMessage&&openCommonMessage({msgCode:IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED});
    }
  }

  handleOrderNumberChange = event => {
    const { handleOrderNumberChange } = this.props;
    handleOrderNumberChange&&handleOrderNumberChange(event);
  }

  changeTabValue = (event, value) => {
    let { middlewareObject, frameworkMap, selectedLabId, updateStateWithoutStatus, updateGroupingContainerState, selectionAreaIsEdit, openCommonMessage, closeCommonMessage } = this.props;
    let formObj = frameworkMap.get(selectedLabId).formMap.get(value);
    let valObj = utils.initMiddlewareObject(formObj);
    let validateMsgCode = utils.handleValidateItems(middlewareObject);
    let nullAbleCheckFlag = utils.checkItemNullAble(middlewareObject);
    // let validateMsgCode = utils.handleValidateItemsIncludeTestAndSpecimen(middlewareObject);
    let { testValMap, specimenValMap } = middlewareObject;
    let noCheckedBoxChecked = false;
    if (testValMap.size > 0) {
      for (let valueObj of testValMap.values()) {
        if (valueObj.isChecked) {
          noCheckedBoxChecked = true;
        }
      }
    }
    if (specimenValMap.size > 0) {
      for (let valueObj of specimenValMap.values()) {
        if (valueObj.isChecked) {
          noCheckedBoxChecked = true;
        }
      }
    }
    if (noCheckedBoxChecked) {
      if (selectionAreaIsEdit) {
        let payload = {
          msgCode: SERVICE_PROFILE_MAINTENANCE_CODE.SWITCH_TAB_CHANGED,
          btn1AutoClose:false,
          btnActions: {
            btn1Click: () => {
              let lipidProfileFlag = ixRequestUtils.checkLipidProfileIsCheck(middlewareObject);
              validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
              if (validateMsgCode === ''&&nullAbleCheckFlag) {
                this.handleAddOrder();//添加已经勾选的数据
                updateStateWithoutStatus&&updateStateWithoutStatus({
                  selectionAreaIsEdit:false,
                  orderIsEdit:false,
                  selectedOrderKey: null,
                  middlewareObject:valObj
                });
                updateGroupingContainerState && updateGroupingContainerState({
                  selectedFormId: value
                });
                closeCommonMessage&&closeCommonMessage();
              } else {
                closeCommonMessage&&closeCommonMessage();
                delay(()=>{
                  validateMsgCode!==''&&openCommonMessage&&openCommonMessage({msgCode:validateMsgCode});
                },500);
              }
            },
            btn2Click: () => {
              updateStateWithoutStatus && updateStateWithoutStatus({
                selectionAreaIsEdit: false,
                orderIsEdit: false,
                selectedOrderKey: null,
                middlewareObject: valObj
              });
              updateGroupingContainerState && updateGroupingContainerState({
                selectedFormId: value
              });
            }
          }
        };
        openCommonMessage && openCommonMessage(payload);
      } else {
        updateStateWithoutStatus && updateStateWithoutStatus({
          orderIsEdit: false,
          selectedOrderKey: null,
          middlewareObject: valObj
        });
        updateGroupingContainerState && updateGroupingContainerState({
          selectedFormId: value
        });
      }
    } else {
      updateStateWithoutStatus && updateStateWithoutStatus({
        orderIsEdit: false,
        selectedOrderKey: null,
        middlewareObject: valObj
      });
      updateGroupingContainerState && updateGroupingContainerState({
        selectedFormId: value
      });
    }
  }

  generateTab = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let { selectedFormId } = this.state;
    let tabs = [];
    if (selectedLabId!==null&&frameworkMap.size > 0) {
      let formMap = frameworkMap.get(selectedLabId).formMap;
      for (let [formId,formObj] of formMap) {
        tabs.push(
          <CIMSMultiTab
              key={formId}
              id={`form_tab_${formId}`}
              value={formId}
              disableClose
              className={selectedFormId === formId ? 'tabSelected' : 'tabNavigation'}
              label={
                <span className={classes.tabSpan}>
                  {formObj.formShortName}
                </span>
              }
          />
        );
      }
    }
    return tabs;
  }

  judgeContainerType = (testFrameworkMap,specimenFrameworkMap) => {
    let types = [];
    if (testFrameworkMap.size > 0) {
      types.push(serviceProfileConstants.ITEM_CATEGORY_TYPE.TEST);
    }
    if (specimenFrameworkMap.size > 0) {
      types.push(serviceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN);
    }
    return types;
  }

  render() {
    const {
      classes,
      ioeFormMap,
      frameworkMap,
      selectedLabId,
      selectedFormId,
      dropdownMap,
      middlewareObject,
      updateState,
      orderIsEdit,
      orderNumber,
      openCommonMessage
    } = this.props;
    let { open } = this.state;

    let testFrameworkMap = frameworkMap!==undefined&&frameworkMap.size>0?frameworkMap.get(selectedLabId).formMap.get(selectedFormId).testItemsMap:new Map();
    let specimenFrameworkMap = frameworkMap!==undefined&&frameworkMap.size>0?frameworkMap.get(selectedLabId).formMap.get(selectedFormId).specimenItemsMap:new Map();
    let types = this.judgeContainerType(testFrameworkMap,specimenFrameworkMap);

    let testContainerProps = {
      ioeFormMap,
      selectedLabId,
      selectedFormId,
      dropdownMap,
      testFrameworkMap,
      middlewareObject,
      openCommonMessage,
      updateState
    };
    let specimenContainerProps = {
      selectedLabId,
      selectedFormId,
      dropdownMap,
      middlewareObject,
      specimenFrameworkMap,
      updateState
    };
    return (
      <div>
        <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open
            })}
            position="relative"
        >
          <Toolbar
              disableGutters={!open}
              classes={{
                regular:classes.toolBar
              }}
          />
        </AppBar>
        <Drawer
            classes={{
              root: classes.drawerRoot,
              paper: classNames(classes.drawerPaperRoot, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open
              })
            }}
            className={classNames(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })}
            open={open}
            variant="permanent"
        >
          <Divider />
          <List className={classes.listRoot}>
            {this.generateDrawerList()}
          </List>
        </Drawer>
        {/* list content */}
        <ValidatorForm id="GroupForm" onSubmit={()=>{}} ref="form">
          <div
              className={classNames(classes.content, {
                [classes.contentOpen]: open
              })}
          >
            {/* Top Tab */}
            <CIMSMultiTabs
                value={selectedFormId}
                onChange={this.changeTabValue}
                indicatorColor="primary"
            >
              {this.generateTab()}
            </CIMSMultiTabs>
            {/* Content */}
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
            >
              {
                types.length>1?(
                  [
                    (
                      <Grid item xs={6} key={`${selectedLabId}_${selectedFormId}_specimen`} classes={{'grid-xs-6':classes.specimenWrapper}}>
                        <SpecimenContainer {...specimenContainerProps} />
                      </Grid>
                    ),
                    (
                      <Grid item xs={6} key={`${selectedLabId}_${selectedFormId}_test`} classes={{'grid-xs-6':classes.testWrapper}}>
                        <TestContainer {...testContainerProps} />
                      </Grid>
                    )
                  ]
                ):(
                  types.length === 1?(
                    types[0] === serviceProfileConstants.ITEM_CATEGORY_TYPE.TEST?(
                      <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                        <TestContainer {...testContainerProps} displayHeader />
                      </Grid>
                    ):(
                      types[0] === serviceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN?(
                        <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                          <SpecimenContainer {...specimenContainerProps} displayHeader />
                        </Grid>
                      ):null
                    )
                  ):null
                )
              }
            </Grid>
          </div>
          {/* action */}
          <div className={classes.actionWrapper}>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                className={classes.fabGird}
            >
              <Grid item style={{width:82,marginBottom:20}}>
                <CustomizedSelectFieldValidator
                    id="service_profile_order_number_dropdown"
                    options={serviceProfileConstants.ORDER_NUMBER_OPTIONS.map(option=>{
                      return {
                        label: option.label,
                        value: option.value
                      };
                    })}
                    isDisabled={orderIsEdit}
                    value={orderNumber}
                    onChange={event => {this.handleOrderNumberChange(event);}}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                    menuPortalTarget={document.body}
                />
              </Grid>
              <Grid item>
                <Tooltip title="Add Order" classes={{tooltip:classes.tooltip}}>
                  <Fab
                      size="small"
                      color="primary"
                      aria-label="Add Order"
                      id="btn_service_profile_dialog_add_order"
                      className={classes.fab}
                      onClick={()=>{this.handleAddOrder();}}
                  >
                    <ArrowForward />
                  </Fab>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Add Order with Info" classes={{tooltip:classes.tooltip}}>
                  <Fab
                      size="small"
                      color="primary"
                      aria-label="Add Order with Info"
                      id="btn_service_profile_dialog_add_order_with_info"
                      className={classes.fab}
                      onClick={()=>{this.handleAddOrderWithInfo();}}
                  >
                    <TextRotationNone />
                  </Fab>
                </Tooltip>
              </Grid>
            </Grid>
          </div>
        </ValidatorForm>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TabContainer);
