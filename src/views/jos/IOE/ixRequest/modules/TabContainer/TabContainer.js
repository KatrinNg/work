import React, { Component } from 'react';
import {styles} from './TabContainerStyle';
import { withStyles, AppBar, Toolbar, Typography, Drawer, Divider, List, ListItem, ListItemText, Tooltip, Grid, Fab, Checkbox } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import classNames from 'classnames';
import { cloneDeep,delay } from 'lodash';
import CIMSMultiTabs from '../../../../../../components/Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../../../../../../components/Tabs/CIMSMultiTab';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import TestContainer from '../TestContainer/TestContainer';
import SpecimenContainer from '../SpecimenContainer/SpecimenContainer';
// import SelectFieldValidator from '../../../../../../components/FormValidator/SelectFieldValidator';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../../../constants/common/commonConstants';

class TabContainer extends Component {
  constructor(props){
    super(props);
    this.barRef = React.createRef();
    this.tabRef = React.createRef();
    this.state = {
      containerHeight:undefined,
      open: false
    };
  }

  componentDidMount(){
    if (this.props.wrapperHeight&&this.barRef.current) {
      let containerHeight = this.props.wrapperHeight - this.barRef.current.clientHeight - 10;
      if (containerHeight!==this.state.containerHeight) {
        this.setState({containerHeight});
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.wrapperHeight&&this.barRef.current&&this.barRef.current.clientHeight!==0) {
      let containerHeight = nextProps.wrapperHeight - this.barRef.current.clientHeight - 10;
      if (containerHeight!==this.state.containerHeight) {
        this.setState({containerHeight});
      }
    }
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

  handleDrawerClick = labId => {
    let { basicInfo,middlewareObject,lab2FormMap,frameworkMap,updateStateWithoutStatus,contentVals,selectionAreaIsEdit,openCommonMessage,closeCommonMessage,itemMapping,searchFieldLengthObj } = this.props;
    let defaultFormId = lab2FormMap.get(labId)[0];
    let formObj = frameworkMap.get(labId).formMap.get(defaultFormId);
    let valObj = utils.initMiddlewareObject(formObj);
    let checkedFlag = utils.validateTestOrSpecimentChecked(middlewareObject);
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
    if (checkedFlag) {
      if (selectionAreaIsEdit) {
        let payload = {
          msgCode: IX_REQUEST_CODE.SWITCH_TAB_CHANGED,
          btn1AutoClose:false,
          btnActions: {
            btn1Click: () => {
              let validateMsgCode = utils.handleValidateItems(middlewareObject);
              let diagnosisErrorFlag = basicInfo.infoDiagnosis === ''?true:false;
              let itemNullAbleFlag = utils.itemNullAbleFlag(middlewareObject);
              if (!diagnosisErrorFlag&&itemNullAbleFlag) {
                let lipidProfileFlag = utils.checkLipidProfileIsCheck(middlewareObject);
                validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
                if (validateMsgCode === '') {
                  let displayDialogFlag = utils.handleOtherInfoDialogDisplay(middlewareObject,itemMapping);
                  if (displayDialogFlag) {
                    let obj = {
                      selectionAreaIsEdit:false,
                      orderIsEdit:false,
                      selectedOrderKey: null,
                      middlewareObject:valObj,
                      contentVals:{
                        ...contentVals,
                        labId,
                        selectedSubTabId: defaultFormId,
                        infoTargetLabId: labId,
                        infoTargetFormId: defaultFormId
                      }
                    };
                    updateStateWithoutStatus&&updateStateWithoutStatus({
                      tabSwitchFlag:true,
                      nextStepParamsObj:obj
                    });
                    this.handleAddOrderWithInfo(true);
                  } else {
                    if(!searchFieldLengthFlag){
                      this.handleAddOrderWithInfo();
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        selectionAreaIsEdit:false,
                        orderIsEdit:false,
                        selectedOrderKey: null,
                        middlewareObject:valObj,
                        contentVals:{
                          ...contentVals,
                          labId,
                          selectedSubTabId: defaultFormId,
                          infoTargetLabId: labId,
                          infoTargetFormId: defaultFormId
                        }
                      });
                    }
                    closeCommonMessage&&closeCommonMessage();
                  }
                } else {
                  closeCommonMessage&&closeCommonMessage();
                  delay(()=>{
                    openCommonMessage&&openCommonMessage({msgCode:validateMsgCode});
                  },500);
                }
              } else {
                closeCommonMessage&&closeCommonMessage();
                updateStateWithoutStatus&&updateStateWithoutStatus({
                  diagnosisErrorFlag
                });
              }
            },
            btn2Click: () => {
              updateStateWithoutStatus&&updateStateWithoutStatus({
                orderIsEdit:false,
                selectedOrderKey: null,
                middlewareObject:valObj,
                contentVals:{
                  ...contentVals,
                  labId,
                  selectedSubTabId: defaultFormId,
                  infoTargetLabId: labId,
                  infoTargetFormId: defaultFormId
                }
              });
            }
          }
        };
        openCommonMessage&&openCommonMessage(payload);
      } else {
        updateStateWithoutStatus&&updateStateWithoutStatus({
          orderIsEdit:false,
          selectedOrderKey: null,
          middlewareObject:valObj,
          contentVals:{
            ...contentVals,
            labId,
            selectedSubTabId: defaultFormId,
            infoTargetLabId: labId,
            infoTargetFormId: defaultFormId
          }
        });
      }
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        orderIsEdit:false,
        selectedOrderKey: null,
        middlewareObject:valObj,
        contentVals:{
          ...contentVals,
          labId,
          selectedSubTabId: defaultFormId,
          infoTargetLabId: labId,
          infoTargetFormId: defaultFormId
        }
      });
    }
  };

  generateDrawerList = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let list = [];
    if (!!frameworkMap.size&&frameworkMap.size>0) {
      for (let labId of frameworkMap.keys()) {
        list.push(
          <ListItem
              id={labId}
              key={labId}
              button
              onClick={() => {this.handleDrawerClick(labId);}}
              style={{padding: '3px'}}
              className={classNames({
                [classes.selectedItem]: labId === selectedLabId
              })}
          >
            <ListItemText
                style={{textAlign: 'center'}}
                primary={
                  <Typography className={classes.font}>{labId}</Typography>
                }
            />
          </ListItem>
        );
      }
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

  handleOrderNumberChange = event => {
    const { handleOrderNumberChange } = this.props;
    handleOrderNumberChange&&handleOrderNumberChange(event);
  }

  changeTabValue = (event, value) => {
    let { basicInfo,middlewareObject, frameworkMap,selectedLabId,updateStateWithoutStatus,contentVals,selectionAreaIsEdit,openCommonMessage,closeCommonMessage,itemMapping,searchFieldLengthObj } = this.props;
    let formObj = frameworkMap.get(selectedLabId).formMap.get(value);
    let valObj = utils.initMiddlewareObject(formObj);
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
    let checkedFlag = utils.validateTestOrSpecimentChecked(middlewareObject);
    if (checkedFlag) {
      if (selectionAreaIsEdit) {
        let payload = {
          msgCode:IX_REQUEST_CODE.SWITCH_TAB_CHANGED,
          btn1AutoClose:false,
          btnActions: {
            btn1Click: () => {
              let validateMsgCode = utils.handleValidateItems(middlewareObject);
              let diagnosisErrorFlag = basicInfo.infoDiagnosis === ''?true:false;
              let itemNullAbleFlag = utils.itemNullAbleFlag(middlewareObject);
              if (!diagnosisErrorFlag&&itemNullAbleFlag) {
                let lipidProfileFlag = utils.checkLipidProfileIsCheck(middlewareObject);
                validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
                if (validateMsgCode === '') {
                  let displayDialogFlag = utils.handleOtherInfoDialogDisplay(middlewareObject,itemMapping);
                  if (displayDialogFlag) {
                    let obj = {
                      selectionAreaIsEdit:false,
                      orderIsEdit:false,
                      selectedOrderKey: null,
                      middlewareObject:valObj,
                      contentVals:{
                        ...contentVals,
                        selectedSubTabId:value,
                        infoTargetFormId:value
                      }
                    };
                    updateStateWithoutStatus&&updateStateWithoutStatus({
                      tabSwitchFlag:true,
                      nextStepParamsObj:obj
                    });
                    this.handleAddOrderWithInfo(true);
                  } else {
                    if(!searchFieldLengthFlag){
                      this.handleAddOrderWithInfo();
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        selectionAreaIsEdit:false,
                        orderIsEdit:false,
                        selectedOrderKey: null,
                        middlewareObject:valObj,
                        contentVals:{
                          ...contentVals,
                          selectedSubTabId:value,
                          infoTargetFormId:value
                        }
                      });
                    }
                    closeCommonMessage&&closeCommonMessage();
                  }
                } else {
                  closeCommonMessage&&closeCommonMessage();
                  delay(()=>{
                    openCommonMessage&&openCommonMessage({msgCode:validateMsgCode});
                  },500);
                }
              } else {
                closeCommonMessage&&closeCommonMessage();
                updateStateWithoutStatus&&updateStateWithoutStatus({
                  diagnosisErrorFlag
                });
              }
            },
            btn2Click: () => {
              updateStateWithoutStatus&&updateStateWithoutStatus({
                selectionAreaIsEdit: false,
                orderIsEdit:false,
                selectedOrderKey: null,
                middlewareObject:valObj,
                contentVals:{
                  ...contentVals,
                  selectedSubTabId:value,
                  infoTargetFormId:value
                }
              });
            }
          }
        };
        openCommonMessage&&openCommonMessage(payload);
      } else {
        updateStateWithoutStatus&&updateStateWithoutStatus({
          orderIsEdit:false,
          selectedOrderKey: null,
          middlewareObject:valObj,
          contentVals:{
            ...contentVals,
            selectedSubTabId:value,
            infoTargetFormId:value
          }
        });
      }
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        orderIsEdit:false,
        selectedOrderKey: null,
        middlewareObject:valObj,
        contentVals:{
          ...contentVals,
          selectedSubTabId:value,
          infoTargetFormId:value
        }
      });
    }
  }

  generateTab = () => {
    const { classes,selectedLabId,selectedSubTabId,frameworkMap } = this.props;
    let tabs = [];
    if (!!selectedLabId&&frameworkMap.size > 0) {
      let formMap = frameworkMap.get(selectedLabId).formMap;
      for (let [formId,formObj] of formMap) {
        tabs.push(
          <CIMSMultiTab
              key={formId}
              id={`ix_request_sub_tab_${formId}`}
              value={formId}
              disableClose
              className={selectedSubTabId === formId ? 'tabSelected' : 'tabNavigation'}
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
      types.push(constants.ITEM_CATEGORY_TYPE.TEST);
    }
    if (specimenFrameworkMap.size > 0) {
      types.push(constants.ITEM_CATEGORY_TYPE.SPECIMEN);
    }
    return types;
  }

  handleAddOrderWithInfo = (closeDialog=false) => {
    let {
      itemMapping,
      basicInfo,
      orderNumber,
      orderIsEdit,
      updateStateWithoutStatus,
      updateGroupingContainerState,
      openCommonMessage,
      closeCommonMessage,
      middlewareObject,
      selectedLabId,
      selectedSubTabId,
      updateState,
      contentVals,
      temporaryStorageMap,
      handleResetOrderNumber,
      searchFieldLengthObj,
      insertIxRequestLog,
      serviceSpecificFunctionInfo,
      artificialChecked
    } = this.props;
    let dialogOpenFlag = false;
    if(utils.checkLipidProfileIsCheck(middlewareObject)){
      // validate
      let diagnosisErrorFlag = basicInfo.infoDiagnosis === ''?true:false;
      let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
      let itemNullAbleFlag = utils.itemNullAbleFlag(middlewareObject);
      if (!diagnosisErrorFlag&&!searchFieldLengthFlag&&itemNullAbleFlag) {
        let msgCode = utils.handleValidateItems(middlewareObject);
        if (msgCode === '') {
          let displayDialogFlag = utils.handleOtherInfoDialogDisplay(middlewareObject,itemMapping);
          if (displayDialogFlag) {
            // if (closeDialog) {
            //   closeCommonMessage&&closeCommonMessage();
            // }
            closeDialog&&closeCommonMessage&&closeCommonMessage();
            //backup question
            middlewareObject.backupQuestionValMap = cloneDeep(middlewareObject.questionValMap);
            !orderIsEdit&&utils.resetQuestionStatus(middlewareObject.questionValMap);
            // if (!orderIsEdit) {
            //   utils.resetQuestionStatus(middlewareObject.questionValMap);
            // }
            utils.resetQuestionGroupStatus(middlewareObject.questionGroupMap);
            updateStateWithoutStatus&&updateStateWithoutStatus({
              middlewareObject,
              contentVals:{
                ...contentVals,
                infoTargetLabId: selectedLabId,
                infoTargetFormId: selectedSubTabId
              }
            });
            // has question
            // updateGroupingContainerState&&updateGroupingContainerState({ infoIsOpen: true });
            updateGroupingContainerState&&updateGroupingContainerState({ otherDialogIsOpen: true,isCanDisabled:false });
            dialogOpenFlag = true;
          } else {
            // no question
            // Add
            let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
            let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
            let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
            for (let i = 0; i < orderNumber; i++) {
              let obj = utils.initTemporaryStorageObj(middlewareObject,basicInfo,selectedLabId);
              let timestamp = new Date().valueOf();
              temporaryStorageMap.set(`${selectedSubTabId}_${timestamp}_${i}`,obj);
            }

            let content = `Is Urgent: ${basicInfo.urgentIsChecked ? 'Yes' : 'No'};`;
            content += `Quantity: ${orderNumber}; Specimen: ${middlewareObject.formShortName} (${contentVals.infoTargetLabId});`;
            if (middlewareObject.testValMap.size > 0) {
              content += ' Test: ';
              for (const value of middlewareObject.testValMap.values()) {
                if (value.isChecked) {
                  content += `${value.itemName} (${value.codeIoeFormItemId});`;
                }
              }
            }
            insertIxRequestLog && insertIxRequestLog('Action: Click \'→\' (Add Order) button', '', content);

            utils.resetMiddlewareObject(middlewareObject);
            updateState&&updateState({
              isEdit:true,
              selectedOrderKey:null,
              orderIsEdit:false,
              temporaryStorageMap,
              middlewareObject,

              outputFormIsChecked: artificialChecked ? false : outputFormIsChecked,
              reminderIsChecked: artificialChecked ? false : reminderIsChecked,
              lableIsChecked: artificialChecked ? false : lableIsChecked,
              btnSwith: artificialChecked ? false : outputFormIsChecked || reminderIsChecked || lableIsChecked
            });
            updateStateWithoutStatus&&updateStateWithoutStatus({
              selectionAreaIsEdit:false
            });
            handleResetOrderNumber&&handleResetOrderNumber();
            this.props.verifyPrintStatusAfterAddOrder();
          }
          EventEmitter.emit('ix_request_add_order');
        } else {
          openCommonMessage&&openCommonMessage({msgCode});
        }
      }
      updateStateWithoutStatus&&updateStateWithoutStatus({
        diagnosisErrorFlag
      });
    }else {
      openCommonMessage&&openCommonMessage({msgCode:IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED});
    }
    return dialogOpenFlag;
  }

  render() {
    const {
      classes,
      frameworkMap,
      selectedLabId,
      selectedSubTabId,
      dropdownMap,
      middlewareObject,
      updateState,
      updateStateWithoutStatus,
      orderIsEdit,
      orderNumber,
      ioeFormMap,
      openCommonMessage,
      basicInfo,
      wrapperHeight
    } = this.props;
    let { open,containerHeight } = this.state;

    let testFrameworkMap = !!frameworkMap&&frameworkMap.size>0&&!!selectedLabId?frameworkMap.get(selectedLabId).formMap.get(selectedSubTabId).testItemsMap:new Map();
    let specimenFrameworkMap = !!frameworkMap&&frameworkMap.size>0&&!!selectedLabId?frameworkMap.get(selectedLabId).formMap.get(selectedSubTabId).specimenItemsMap:new Map();
    let types = this.judgeContainerType(testFrameworkMap,specimenFrameworkMap);
    let testSpecimenContainerHeight = undefined;
    if (this.tabRef&&this.tabRef.current) {
      testSpecimenContainerHeight = containerHeight-this.tabRef.current.clientHeight;
    }

    let testContainerProps = {
      parentRef:this.tabRef.current,
      wrapperHeight:testSpecimenContainerHeight,
      selectedLabId,
      selectedFormId:selectedSubTabId,
      dropdownMap,
      testFrameworkMap,
      middlewareObject,
      ioeFormMap,
      openCommonMessage,
      updateState,
      updateStateWithoutStatus
    };
    let specimenContainerProps = {
      wrapperHeight:testSpecimenContainerHeight,
      selectedLabId,
      selectedFormId:selectedSubTabId,
      dropdownMap,
      middlewareObject,
      specimenFrameworkMap,
      updateState,
      updateStateWithoutStatus
    };
    return (
      <div style={{height:wrapperHeight}} className={classes.wrapper}>
        <AppBar
            ref={this.barRef}
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
            style={{height:wrapperHeight?wrapperHeight-10:undefined}}
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
        <div
            style={{height:containerHeight}}
            className={classNames(classes.content, {
              [classes.contentOpen]: open
            })}
        >
          {/* sub tab (form name or template name) */}
          <div ref={this.tabRef}>
            <CIMSMultiTabs
                value={selectedSubTabId}
                onChange={this.changeTabValue}
                indicatorColor="primary"
            >
              {this.generateTab()}
            </CIMSMultiTabs>
          </div>
          {/* content */}
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
                    <Grid item xs={6} key={`${selectedLabId}_${selectedSubTabId}_specimen`} classes={{'grid-xs-6':classes.specimenWrapper}}>
                      <SpecimenContainer {...specimenContainerProps} />
                    </Grid>
                  ),
                  (
                    <Grid item xs={6} key={`${selectedLabId}_${selectedSubTabId}_test`} classes={{'grid-xs-6':classes.testWrapper}}>
                      <TestContainer {...testContainerProps} />
                    </Grid>
                  )
                ]
              ):(
                types.length === 1?(
                  types[0] === constants.ITEM_CATEGORY_TYPE.TEST?(
                    <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                      <TestContainer {...testContainerProps} displayHeader />
                    </Grid>
                  ):(
                    types[0] === constants.ITEM_CATEGORY_TYPE.SPECIMEN?(
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
              style={{height:containerHeight}}
              className={classes.fabGird}
          >
            <Grid item style={{width:82,marginBottom:20}}>
              {/* <SelectFieldValidator
                  id="ix_request_order_number_dropdown"
                  options={constants.ORDER_NUMBER_OPTIONS.map(option=>{
                    return {
                      label: option.label,
                      value: option.value
                    };
                  })}
                  isDisabled={orderIsEdit}
                  value={orderNumber}
                  onChange={event => {this.handleOrderNumberChange(event);}}
              /> */}

              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label className={classes.label}>Urgent</label>
                  <div className={classes.floatLeft}>
                    <Checkbox
                        id="ix_request_basic_result_urgent"
                        checked={basicInfo.urgentIsChecked}
                        color="primary"
                        classes={{ root: classes.rootCheckbox }}
                        onChange={this.handleUrgentChecked}
                    />
                  </div>
                </div>
              </Grid>

              <CustomizedSelectFieldValidator
                  id="ix_request_order_number_dropdown"
                  options={constants.ORDER_NUMBER_OPTIONS.map(option=>{
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
                    id="btn_ix_request_add_order"
                    className={classes.fab}
                    onClick={()=>{this.handleAddOrderWithInfo();}}
                >
                  <ArrowForward />
                </Fab>
              </Tooltip>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TabContainer);
