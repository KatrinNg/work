import React, { Component } from 'react';
import { withStyles, Grid, Tabs, Tab, Typography, TextField } from '@material-ui/core';
import { styles } from './ContentContainerStyle';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import {trim,delay, cloneDeep} from 'lodash';
import classNames from 'classnames';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import TabContainer from '../TabContainer/TabContainer';
import OrderContainer from '../OrderContainer/OrderContainer';
import OtherInfoDialog from '../OtherInfoDialog/OtherInfoDialog';
import SearchIxDialog from '../SearchIxDialog/SearchIxDialog';
import TemplateContainer from '../TemplateContainer/TemplateContainer';
import ExpressIoeTemplateContainer from '../ExpressIoeTemplateContainer/ExpressIoeTemplateContainer';
import TemplateOrderInfoDialog from '../TemplateOrderInfoDialog/TemplateOrderInfoDialog';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';

class ContentContainer extends Component {
  constructor(props){
    super(props);
    let { topTabs } = props;
    this.tabsRef = React.createRef();
    this.disciplineRef=React.createRef();
    this.templateRef=React.createRef();
    this.expressIoeRef=React.createRef();
    this.state={
      containerHeight: undefined,
      searchIx: '',
      searchIsOpen: false,
      infoIsOpen: false,
      tabValue: topTabs.length>0?(topTabs[1]?topTabs[1].value:topTabs[0].value):null,
      orderNumber:constants.ORDER_NUMBER_OPTIONS[0].value, //default 1
      otherDialogIsOpen: false,
      isExpressIoe:false,
      isCanDisabled:false,
      resetCheckedExpressIoeMap:false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.contentHeight&&this.tabsRef.current) {
      let containerHeight = nextProps.contentHeight - this.tabsRef.current.clientHeight;
      let basicInfo=nextProps.basicInfo;
      if(basicInfo.shsExpressIoeChecked){
        this.setState({tabValue:constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value});
      }else if(nextProps.defaultNSLFlag){
        this.setState({tabValue:constants.PRIVILEGES_DOCTOR_TABS[0].value});
      }
      if (containerHeight!==this.state.containerHeight) {
        this.setState({containerHeight});
      }
    }
  }

  handleSearchDialogClose = () => {
    this.setState({
      searchIsOpen: false
    });
  }

  handleSearchIxChanged = event => {
    this.setState({
      searchIx: event.target.value
    });
  }

  handleSearchIxByEnter = event => {
    if (event.keyCode === 13) {
      this.setState({
        searchIsOpen: true
      });
    }
  }

  handleSearchIxBlur = event => {
    this.setState({
      searchIx: trim(event.target.value)
    });
  }

  handleSearchBtnClick = () => {
    const{insertIxRequestLog}=this.props;
    let {searchIx}=this.state;
    this.setState({
      searchIsOpen: true
    });
    let val = searchIx.length > 0 ? searchIx : '';
    insertIxRequestLog && insertIxRequestLog(`Action: Click 'Search' button (Searching by Test/Specimen: ${val})`, '');
  }

  handleOrderNumberChange = event => {
    this.setState({
      orderNumber:event.value
    });
  }

  handleResetOrderNumber = () => {
    this.setState({
      orderNumber:constants.ORDER_NUMBER_OPTIONS[0].value
    });
  }

  generateMiddlewareObject = (defaultObj) => {
    const { selectionAreaIsEdit,frameworkMap, updateStateWithoutStatus} = this.props;
    let formObj = frameworkMap.has(defaultObj.labId)?frameworkMap.get(defaultObj.labId).formMap.get(defaultObj.selectedSubTabId):null;
    let valObj = utils.initMiddlewareObject(formObj);
    let obj = {
      middlewareObject:valObj,
      contentVals: {
        ...defaultObj
      }
    };
    if (selectionAreaIsEdit) {
      return obj;
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        ...obj
      });
    }
  }

  generateMiddlewareObjectByTemplate = (orderType) => {
    const { selectionAreaIsEdit,frameworkMap, categoryMap, updateStateWithoutStatus} = this.props;
    let categoryObj = categoryMap.has(orderType)?categoryMap.get(orderType):null;
    let defaultTemplateId = null;
    let defaultMiddlewareMap = new Map();
    if (!!categoryObj&&categoryObj.templateMap.size>0) {
      let i = 0;
      for (let templateId of categoryObj.templateMap.keys()) {
        defaultTemplateId = templateId;
        if (++i===1) {
          break;
        }
      }
      let defaultTemplateObj = categoryObj.templateMap.get(defaultTemplateId);
      // template has order list
      if (defaultTemplateObj.storageMap.size>0) {
        for (let [storageKey,storageObj] of defaultTemplateObj.storageMap) {
          // init middlewareObject
          let formObj = frameworkMap.has(storageObj.labId)?frameworkMap.get(storageObj.labId).formMap.get(storageObj.codeIoeFormId):null;
          let middlewareObject = utils.initMiddlewareObject(formObj,storageObj,true,orderType);
          defaultMiddlewareMap.set(storageKey,middlewareObject);
        }
      }
    }

    let obj = {
      middlewareMapObj:{
        templateId:defaultTemplateId,
        templateSelectAll: false,
        middlewareMap:defaultMiddlewareMap
      },
      contentVals:{
        labId:null,
        selectedSubTabId: defaultTemplateId,
        infoTargetLabId: null,
        infoTargetFormId: defaultTemplateId
      }
    };
    if (selectionAreaIsEdit) {
      return obj;
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        ...obj
      });
    }

  }

  generateTab = () => {
    const { classes,topTabs } = this.props;
    let { tabValue } = this.state;
    let tabs = [];
    topTabs.forEach(option => {
      tabs.push(
        <Tab
            key={option.value}
            value={option.value}
            classes={{
              selected:classes.tabSelect
            }}
            className={tabValue===option.value?'tabSelected':'tabNavigation'}
            label={
              <Typography
                  className={classNames(classes.tabSpan,{
                    [classes.tabSpanSelected]: tabValue===option.value
                  })}
              >
                {option.label}
              </Typography>
            }
        />
      );
    });
    return tabs;
  }

  handleTabChangeChcked = (event) => {
    let {expressIoeMap,middlewareMapObj, middlewareObject} = this.props;
    let checkedFlag = false;
    if (this.disciplineRef.current) {
      checkedFlag = utils.validateTestOrSpecimentChecked(middlewareObject);
    } else if (this.templateRef.current) {
      checkedFlag = utils.validateTemplateChecked(middlewareMapObj);
    }else if(this.expressIoeRef.current){
      checkedFlag = utils.validateExpressIoeTemplateChecked(expressIoeMap);
    }
    return checkedFlag;
  }

  tabChange = (value, method, obj) => {
    this.handleTabChange(null, value, method, obj);
  }

  handleTabChange = (event, value, method, object) => {
    let {resetexpressIoeMap,expressIoeMap,middlewareMapObj, lab2FormMap, middlewareObject, updateStateWithoutStatus, basicInfo, resetDiscipline, openCommonMessage, diagnosisErrorFlag, closeCommonMessage, itemMapping, searchFieldLengthObj, serviceSpecificFunctionInfo } = this.props;
   let {isExpressIoe}=this.state;
    let checkedFlag = false;
    if (this.disciplineRef.current) {
      checkedFlag = utils.validateTestOrSpecimentChecked(middlewareObject);
    } else if (this.templateRef.current) {
      checkedFlag = utils.validateTemplateChecked(middlewareMapObj);
    }else if(this.expressIoeRef.current){
      checkedFlag = utils.validateExpressIoeTemplateChecked(expressIoeMap);
    }

    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
    if (checkedFlag) {
      let payload = {
        msgCode:IX_REQUEST_CODE.SWITCH_TAB_CHANGED,
        btn1AutoClose:false,
        btnActions: {
          btn1Click: () => {
            if(!searchFieldLengthFlag){
              let obj = {};
              if (value === constants.PRIVILEGES_DOCTOR_TABS[0].value) {
                // discipline
                let defaultObj = resetDiscipline&&resetDiscipline(lab2FormMap);
                obj = this.generateMiddlewareObject(defaultObj);
              } else {
                // service / personal / nurse
                obj = this.generateMiddlewareObjectByTemplate(value);
              }
              if (this.disciplineRef.current) {
                let validateMsgCode = utils.handleValidateItems(middlewareObject);
                let tempDiagnosisErrorFlag = basicInfo.infoDiagnosis === ''?true:false;
                let itemNullAbleFlag = utils.itemNullAbleFlag(middlewareObject);
                if (!tempDiagnosisErrorFlag&&itemNullAbleFlag) {
                  let lipidProfileFlag = utils.checkLipidProfileIsCheck(middlewareObject);
                  validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
                  if (validateMsgCode === '') {
                    let displayDialogFlag = utils.handleOtherInfoDialogDisplay(middlewareObject,itemMapping);
                    if (displayDialogFlag) {
                      obj.basicInfo={
                        ...basicInfo,
                        infoOrderType: value,
                        shsExpressIoeChecked:false,
                        orderType: value
                      };
                      let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
                      if(object){
                        obj.orderIsEdit = object.orderIsEdit,
                        obj.middlewareObject = object.middlewareObject,
                        obj.contentVals = object.contentVals,
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          tabSwitchFlag:true,
                          nextStepParamsObj:obj,
                          functionLevelFlag:functionLevel,
                          topTabSwitchFlag:true,
                          defaultNSLFlag:false,
                          topTabParamsObj:{tabValue: value}
                        });
                      }else{
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          tabSwitchFlag:true,
                          nextStepParamsObj:obj,
                          functionLevelFlag:functionLevel,
                          topTabSwitchFlag:true,
                          defaultNSLFlag:false,
                          topTabParamsObj:{tabValue: value}
                        });
                      }
                      closeCommonMessage && closeCommonMessage();
                      let flag = this.disciplineRef.current.handleAddOrderWithInfo(true);
                      !flag && method && method();
                    } else {
                      let flag = this.disciplineRef.current.handleAddOrderWithInfo(true);
                      !flag && method && method();
                      this.setState({tabValue: value});
                      let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
                      if(object){
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          ...obj,
                          selectionAreaIsEdit:false,
                          orderIsEdit:false,
                          selectedOrderKey: null,
                          defaultNSLFlag:false,
                          basicInfo:{
                            ...basicInfo,
                            functionLevelFlag:functionLevel,
                            shsExpressIoeChecked:false,
                            infoOrderType: value,
                            orderType: value
                          },
                          ...object
                        });
                      }else{
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          ...obj,
                          selectionAreaIsEdit:false,
                          orderIsEdit:false,
                          defaultNSLFlag:false,
                          selectedOrderKey: null,
                          basicInfo:{
                            ...basicInfo,
                            functionLevelFlag:functionLevel,
                            shsExpressIoeChecked:false,
                            infoOrderType: value,
                            orderType: value
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
                    diagnosisErrorFlag:tempDiagnosisErrorFlag
                  });
                }
              } else if (this.templateRef.current) {
                let validateMsgCode = utils.handleValidateTemplateItems(middlewareMapObj);
                let lipidProfileFlag = utils.checkLipidProfileIsCheck(middlewareObject);
                validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
                if (validateMsgCode === '') {
                  let {templateOrderWithQuestionKeys} = utils.handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping);
                  if (templateOrderWithQuestionKeys.length > 0) {
                    let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
                    // has question
                    obj.basicInfo={
                      ...basicInfo,
                      infoOrderType: value,
                      functionLevelFlag:functionLevel,
                      shsExpressIoeChecked:false,
                      orderType: value
                    };
                    if(object) {
                      obj.orderIsEdit = object.orderIsEdit,
                      obj.middlewareObject = object.middlewareObject,
                      obj.contentVals = object.contentVals,
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        defaultNSLFlag:false,
                        tabSwitchFlag:true,
                        nextStepParamsObj:obj,
                        topTabSwitchFlag:true,
                        topTabParamsObj:{tabValue: value}
                        // ...object
                      });
                    }else{
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        tabSwitchFlag:true,
                        nextStepParamsObj:obj,
                        topTabSwitchFlag:true,
                        topTabParamsObj:{tabValue: value}
                      });
                    }
                    closeCommonMessage && closeCommonMessage();
                    this.templateRef.current.handleAddOrderWithInfo(true);
                  } else {
                    // no question
                    let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
                    let continueFlag = this.templateRef.current.handleAddOrderWithInfo(true);
                    if (!continueFlag) {
                      this.setState({tabValue: value});
                      if(object) {
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          ...obj,
                          selectionAreaIsEdit:false,
                          orderIsEdit:false,
                          functionLevelFlag:functionLevel,
                          selectedOrderKey: null,
                          defaultNSLFlag:false,
                          basicInfo:{
                            ...basicInfo,
                            infoOrderType: value,
                            shsExpressIoeChecked:false,
                            orderType: value
                          },
                          ...object
                        });
                      }else{
                        updateStateWithoutStatus&&updateStateWithoutStatus({
                          ...obj,
                          selectionAreaIsEdit:false,
                          orderIsEdit:false,
                          functionLevelFlag:functionLevel,
                          defaultNSLFlag:false,
                          selectedOrderKey: null,
                          basicInfo:{
                            ...basicInfo,
                            infoOrderType: value,
                            shsExpressIoeChecked:false,
                            orderType: value
                          }
                        });
                      }
                    } else {
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        selectionAreaIsEdit:true
                      });
                    }
                    closeCommonMessage&&closeCommonMessage();
                  }
                } else {
                  method && method();
                  this.setState({searchIsOpen: false});
                  closeCommonMessage&&closeCommonMessage();
                  delay(()=>{
                    openCommonMessage&&openCommonMessage({msgCode:validateMsgCode});
                  },500);
                }
              }else if(this.expressIoeRef.current){
                  let returnObj =this.expressIoeRef.current.handleAddOrderWithInfo(true);
                  let {stopFlag}=returnObj;
                  if (stopFlag) {
                    this.setState({tabValue: value});
                    let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
                    if(object) {
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        ...obj,
                        selectionAreaIsEdit:false,
                        orderIsEdit:false,
                        functionLevelFlag:functionLevel,
                        selectedOrderKey: null,
                        basicInfo:{
                          ...basicInfo,
                          infoOrderType: value,
                          orderType: value,
                          shsExpressIoeChecked:false
                        },
                        ...object
                      });
                    }else{
                      updateStateWithoutStatus&&updateStateWithoutStatus({
                        ...obj,
                        selectionAreaIsEdit:false,
                        orderIsEdit:false,
                        functionLevelFlag:functionLevel,
                        selectedOrderKey: null,
                        basicInfo:{
                          ...basicInfo,
                          infoOrderType: value,
                          orderType: value,
                          shsExpressIoeChecked:false
                        }
                      });
                    }
                    closeCommonMessage&&closeCommonMessage();
                    this.setState({
                      resetCheckedExpressIoeMap:true
                    });
                    updateStateWithoutStatus && updateStateWithoutStatus({expressIoeMap:cloneDeep(resetexpressIoeMap)});
                  }
                  else{
                    updateStateWithoutStatus&&updateStateWithoutStatus({
                      selectionAreaIsEdit:true
                    });
                    let {payload}=returnObj;
                    closeCommonMessage&&closeCommonMessage();
                    delay(()=>{
                      if(!!payload){
                        openCommonMessage&&openCommonMessage(payload);
                      }
                    },500);
                  }
              }
            }else{
              closeCommonMessage&&closeCommonMessage();
            }
          },
          btn2Click: () => {
            let obj = {};
            let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
             method && method();
            if (value === constants.PRIVILEGES_DOCTOR_TABS[0].value) {
              // discipline
              let defaultObj = resetDiscipline&&resetDiscipline(lab2FormMap);
              obj = this.generateMiddlewareObject(defaultObj);
            } else {
              // service / personal / nurse
              obj = this.generateMiddlewareObjectByTemplate(value);
            }
            this.setState({tabValue: value});
            if(this.expressIoeRef.current) {
              this.setState({resetCheckedExpressIoeMap:true});
              updateStateWithoutStatus && updateStateWithoutStatus({expressIoeMap:cloneDeep(resetexpressIoeMap)});
            }
            if(object) {
              updateStateWithoutStatus&&updateStateWithoutStatus({
                ...obj,
                selectionAreaIsEdit:false,
                orderIsEdit:false,
                selectedOrderKey: null,
                defaultNSLFlag:false,
                functionLevelFlag:functionLevel,
                basicInfo:{
                  ...basicInfo,
                  shsExpressIoeChecked:false,
                  infoOrderType: value,
                  orderType: value
                },
                ...object
              });
            }else{
              updateStateWithoutStatus&&updateStateWithoutStatus({
                ...obj,
                selectionAreaIsEdit:false,
                orderIsEdit:false,
                selectedOrderKey: null,
                defaultNSLFlag:false,
                functionLevelFlag:functionLevel,
                basicInfo:{
                  ...basicInfo,
                  shsExpressIoeChecked:false,
                  infoOrderType: value,
                  orderType: value
                }
              });
            }
          }
        }
      };
      openCommonMessage&&openCommonMessage(payload);
    } else {
      let tempDiagnosisErrorFlag = diagnosisErrorFlag;
      let obj = {};
      let functionLevel= commonUtils.getDefalutValByOrderType(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE,value);
      if (value === constants.PRIVILEGES_DOCTOR_TABS[0].value) {
        // discipline
        let defaultObj = resetDiscipline&&resetDiscipline(lab2FormMap);
        obj = this.generateMiddlewareObject(defaultObj);
      } else {
        // service / personal / nurse
        obj = this.generateMiddlewareObjectByTemplate(value);
        tempDiagnosisErrorFlag = false;
      }
      this.setState({tabValue: value});
      updateStateWithoutStatus&&updateStateWithoutStatus({
        ...obj,
        diagnosisErrorFlag:tempDiagnosisErrorFlag,
        orderIsEdit:false,
        functionLevelFlag:functionLevel,
        defaultNSLFlag:false,
        selectedOrderKey: null,
        basicInfo:{
          ...basicInfo,
          shsExpressIoeChecked:false,
          infoOrderType: value,
          orderType: value
        }
      });
    }
  }

  updateGroupingContainerState = (obj) => {
    this.setState({
      ...obj
    });
  }

  handleInfoDialogCancel = () =>{
    this.setState({
      infoIsOpen:false,
      isCanDisabled:false
    });
  }

  handleOrderDialogCancel = () =>{
    this.setState({
      otherDialogIsOpen:false
    });
  }

  render() {
    let {
      topTabs,
      topTabSwitchFlag,
      topTabParamsObj,
      tabSwitchFlag,
      nextStepParamsObj,
      selectionAreaIsEdit,
      classes,
      clinicList,
      ioeFormMap,
      basicInfo,
      contentVals,
      categoryMap,
      itemMapping,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      temporaryStorageMap,
      middlewareMapObj,
      middlewareObject,
      orderIsEdit,
      deletedStorageMap,
      editDeletedMap,
      selectedOrderKey,
      questionEditMode,
      questionEditMiddlewareObject,
      openCommonMessage,
      closeCommonMessage,
      updateState,
      updateStateWithoutStatus,
      searchFieldLengthObj,
      contentHeight,
      privilegeFlag,
      insertIxRequestLog,
      officerInChargeRequestLoginName,
      officerInChargeRequestUser,
      verifyPrintStatusAfterAddOrder,
      autoMiddlewareMapObj,
      autoAddDefaultAllOrder,
      fopServiceTemplateIsActive,
      genderCd,
      functionLevelFlag,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      serviceSpecificFunctionInfo,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      ioeExpressQuickBtnDtoList,
      expressIoeMap,
      resetexpressIoeMap,
      loginClinicCd,
      ioeContainerHeight,
      resetHeight
    } = this.props;
    let {
      searchIx,
      searchIsOpen,
      infoIsOpen,
      tabValue,
      orderNumber,
      containerHeight,
      otherDialogIsOpen,
      isExpressIoe,
      isCanDisabled,
      resetCheckedExpressIoeMap
    } = this.state;
    let { orderType,infoOrderType } = basicInfo;

    let expressIoeContainerProps = {
      wrapperHeight: containerHeight,
      ioeFormMap,
      selectionAreaIsEdit,
      itemMapping,
      basicInfo,
      contentVals,
      orderNumber,
      selectedLabId:null,
      selectedSubTabId:null,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      temporaryStorageMap,
      middlewareObject,
      orderIsEdit,
      selectedOrderKey,
      openCommonMessage,
      closeCommonMessage,
      updateState,
      updateStateWithoutStatus,
      searchFieldLengthObj,
      insertIxRequestLog,
      updateGroupingContainerState:this.updateGroupingContainerState,
      handleOrderNumberChange:this.handleOrderNumberChange,
      handleResetOrderNumber:this.handleResetOrderNumber,
      verifyPrintStatusAfterAddOrder,
      ioeExpressQuickBtnDtoList,
      expressIoeMap,
      resetexpressIoeMap,
      loginClinicCd,
       artificialChecked,
      serviceSpecificFunctionInfo,
      isExpressIoe,
      ioeContainerHeight,
      resetHeight,
      resetCheckedExpressIoeMap
    };

    let tabContainerProps = {
      wrapperHeight: containerHeight,
      ioeFormMap,
      selectionAreaIsEdit,
      itemMapping,
      basicInfo,
      contentVals,
      orderNumber,
      selectedLabId:contentVals.labId,
      selectedSubTabId:contentVals.selectedSubTabId,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      temporaryStorageMap,
      middlewareObject,
      orderIsEdit,
      selectedOrderKey,
      openCommonMessage,
      closeCommonMessage,
      updateState,
      updateStateWithoutStatus,
      searchFieldLengthObj,
      insertIxRequestLog,
      updateGroupingContainerState:this.updateGroupingContainerState,
      handleOrderNumberChange:this.handleOrderNumberChange,
      handleResetOrderNumber:this.handleResetOrderNumber,
      verifyPrintStatusAfterAddOrder,
      serviceSpecificFunctionInfo,
      artificialChecked,
      ioeExpressQuickBtnDtoList,
      expressIoeMap,
      resetexpressIoeMap
    };

    let templateContainerProps = {
      wrapperHeight: containerHeight,
      tabValue,
      selectionAreaIsEdit,
      itemMapping,
      categoryMap,
      basicInfo,
      contentVals,
      orderNumber,
      selectedSubTabId:contentVals.selectedSubTabId,
      dropdownMap,
      frameworkMap,
      temporaryStorageMap,
      middlewareMapObj,
      orderIsEdit,
      openCommonMessage,
      closeCommonMessage,
      updateState,
      updateStateWithoutStatus,
      searchFieldLengthObj,
      insertIxRequestLog,
      updateGroupingContainerState:this.updateGroupingContainerState,
      handleOrderNumberChange:this.handleOrderNumberChange,
      handleResetOrderNumber:this.handleResetOrderNumber,
      verifyPrintStatusAfterAddOrder,
      autoMiddlewareMapObj,
      fopServiceTemplateIsActive,
      genderCd,
	    functionLevelFlag,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      serviceSpecificFunctionInfo,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked
    };

    let orderContainerProps = {
      wrapperHeight: contentHeight,
      clinicList,
      basicInfo,
      contentVals,
      dropdownMap,
      deletedStorageMap,
      editDeletedMap,
      frameworkMap,
      temporaryStorageMap,
      lab2FormMap,
      ioeFormMap,
      updateState,
      updateStateWithoutStatus,
      insertIxRequestLog,
      officerInChargeRequestUser,
      officerInChargeRequestLoginName,
      updateGroupingContainerState:this.updateGroupingContainerState,
      verifyPrintStatusAfterAddOrder,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      serviceSpecificFunctionInfo,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      ioeContainerHeight
    };

    let infoDialogProps = {
      topTabSwitchFlag,
      topTabParamsObj,
      tabSwitchFlag,
      nextStepParamsObj,
      questionEditMode,
      basicInfo,
      contentVals,
      orderNumber,
      isOpen:otherDialogIsOpen,
      orderIsEdit,
      selectedOrderKey,
      dialogTitle: 'Other Order Information',
      selectedLabId:contentVals.infoTargetLabId,
      selectedFormId:contentVals.infoTargetFormId,
      itemMapping,
      dropdownMap,
      frameworkMap,
      questionEditMiddlewareObject,
      middlewareObject:questionEditMode?questionEditMiddlewareObject:middlewareObject,
      temporaryStorageMap,
      updateState,
      updateStateWithoutStatus,
      insertIxRequestLog,
      handleInfoDialogCancel: this.handleOrderDialogCancel,
      handleResetOrderNumber:this.handleResetOrderNumber,
      updateGroupingContainerState:this.updateGroupingContainerState,
      verifyPrintStatusAfterAddOrder,
      serviceSpecificFunctionInfo,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      isCanDisabled,
      searchIsOpen
    };
    let templateInfoDialogProps = {
      topTabSwitchFlag,
      topTabParamsObj,
      tabSwitchFlag,
      nextStepParamsObj,
      ioeFormMap,
      categoryMap,
      basicInfo,
      orderNumber,
      isOpen:infoIsOpen,
      dialogTitle: 'Other Order Information',
      selectedSubTabId:contentVals.infoTargetFormId,
      middlewareMapObj,
      itemMapping,
      dropdownMap,
      frameworkMap,
      temporaryStorageMap,
      updateState,
      updateStateWithoutStatus,
      searchFieldLengthObj,
      insertIxRequestLog,
      autoMiddlewareMapObj,
      handleInfoDialogCancel: this.handleInfoDialogCancel,
      handleResetOrderNumber:this.handleResetOrderNumber,
      updateGroupingContainerState:this.updateGroupingContainerState,
      verifyPrintStatusAfterAddOrder,
      autoAddDefaultAllOrder,
      fopServiceTemplateIsActive,
      genderCd,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      serviceSpecificFunctionInfo,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      searchIsOpen
    };

    let searchDialogProps = {
      basicInfo,
      frameworkMap,
      isOpen:searchIsOpen,
      searchIx,
      orderIsEdit,
      middlewareObject,
      updateState,
      updateStateWithoutStatus,
      insertIxRequestLog,
      dialogType: '[Search Result Dialog]',
      handleSearchDialogCancel: this.handleSearchDialogClose,
      updateGroupingContainerState:this.updateGroupingContainerState,
      handleTabChangeChcked:this.handleTabChangeChcked,
      tabChange: this.tabChange
    };
    let term=constants.PRIVILEGES_DOCTOR_TABS[0].value;

    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className:classes.inputProps
      },
      InputProps: {
        classes: {
          input: classes.input
        }
      }
    };

    return (
      <Grid container style={{height:'inherit'}}>
        <Grid item xs={10}>
          {/* top labs */}
          <Tabs
              ref={this.tabsRef}
              classes={{root:classes.tabs}}
              indicatorColor="primary"
              value={tabValue}
              onChange={this.handleTabChange}
          >
            {this.generateTab()}
          </Tabs>
          {/* search ix */}
          <div className={
              classNames(classes.searchBar,{
                [classes.divHidden]:orderType === constants.PRIVILEGES_NURSE_TABS[0].value&&topTabs.length === 1
              })
            }
          >
            <div className={classes.flexCenter}>
              <label className={classes.label}>Search Ix from Discipline:</label>
              <TextField
                  id="input_ix_request_search"
                  placeholder="Search by Test / Specimen"
                  onChange={this.handleSearchIxChanged}
                  onKeyUp={this.handleSearchIxByEnter}
                  onBlur={this.handleSearchIxBlur}
                  disabled={!privilegeFlag}
                  value={searchIx}
                  {...inputProps}
              />
              <CIMSButton
                  id="btn_ix_request_search"
                  className={classes.searchBtn}
                  onClick={this.handleSearchBtnClick}
                  disabled={!privilegeFlag}
              >
                Search
              </CIMSButton>
            </div>
          </div>
          {
            orderType === constants.PRIVILEGES_DOCTOR_TABS[0].value?
            (
              <TabContainer ref={this.disciplineRef} {...tabContainerProps}/>
            )
            : orderType === constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value?
            (<ExpressIoeTemplateContainer ref={this.expressIoeRef} {...expressIoeContainerProps}/>)
            :
            (
              <TemplateContainer ref={this.templateRef} {...templateContainerProps}/>
            )
          }
        </Grid>
        {/* orders  */}
        <Grid item xs={2}>
          <OrderContainer {...orderContainerProps} />
        </Grid>
        {/* Other Info dialog  */}
        {
          infoOrderType === term?(
            <OtherInfoDialog {...infoDialogProps} />
          ):(
            <TemplateOrderInfoDialog {...templateInfoDialogProps} />
          )
        }
        {/* Search dialog  */}
        <SearchIxDialog {...searchDialogProps} />
      </Grid>
    );
  }
}

export default withStyles(styles)(ContentContainer);
