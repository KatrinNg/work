import React, { Component } from 'react';
import { styles } from './TemplateContainerStyle';
import { withStyles, AppBar, Toolbar, Tooltip, Grid, Fab, Checkbox } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import classNames from 'classnames';
import { cloneDeep, difference, delay } from 'lodash';
import CIMSMultiTabs from '../../../../../../components/Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../../../../../../components/Tabs/CIMSMultiTab';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import TemplateOrderContainer from '../TemplateOrderContainer/TemplateOrderContainer';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
import PMIDialog from '../../components/PMIDialog/PMIDialog';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';

class TemplateContainer extends Component {
  constructor(props) {
    super(props);
    this.barRef = React.createRef();
    this.tabRef = React.createRef();
    this.state = {
      containerHeight: undefined,
      open: false,
      PMIDialogIsOpen: false,
      clickAutoParams: {
        templateId: null,
        isAuto: false
      },
      clinicRefOfVal: ''
    };
  }

  componentDidMount() {
    if (this.props.wrapperHeight && this.barRef.current) {
      let containerHeight = this.props.wrapperHeight - this.barRef.current.clientHeight - 10;
      if (containerHeight !== this.state.containerHeight) {
        this.setState({ containerHeight });
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.wrapperHeight && this.barRef.current) {
      let containerHeight = nextProps.wrapperHeight - this.barRef.current.clientHeight - 10;
      if (containerHeight !== this.state.containerHeight) {
        this.setState({ containerHeight });
      }
    }
  }

  handleUrgentChecked = event => {
    const { basicInfo, updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus && updateStateWithoutStatus({
      basicInfo: {
        ...basicInfo,
        urgentIsChecked: event.target.checked
      }
    });
  }

  handleOrderNumberChange = event => {
    const { handleOrderNumberChange } = this.props;
    handleOrderNumberChange && handleOrderNumberChange(event);
  }

  changeTabValue = (event, value) => {
    let { middlewareMapObj, frameworkMap, updateStateWithoutStatus, categoryMap, basicInfo, selectionAreaIsEdit, openCommonMessage,
      closeCommonMessage, itemMapping, genderCd, fopServiceTemplateIsActive, functionLevelFlag, searchFieldLengthObj,
      serviceSpecificFunctionInfo, artificialChecked, outputFormIsChecked, reminderIsChecked, lableIsChecked
    } = this.props;
    let { PMIDialogIsOpen, clinicRefOfVal } = this.state;
    basicInfo = cloneDeep(basicInfo);
    // basicInfo.clinicRefNo = clinicRefOfVal ? clinicRefOfVal : basicInfo.clinicRefNo;
    let { orderType } = basicInfo;
    let categoryObj = categoryMap.has(orderType) ? categoryMap.get(orderType) : null;
    let autoClickToAdd = categoryObj ? (categoryObj.clickToAdd ? categoryObj.clickToAdd.toUpperCase() : 'N') : 'N';
    let middlewareMap = new Map();
    let storageMap;
    // checkedBox
    let outputFormIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
    let reminderIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
    let lableIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);

    // validate
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === '' ? true : false;
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo, searchFieldLengthObj);
    // let {templateOrderWithDiagnosisKeys} = utils.handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping,storageMap);
    if ((utils.getFOPHasDiagnosis(middlewareMap, orderType) || (!diagnosisEmptyFlag && !searchFieldLengthFlag)) && genderCd === 'M' && functionLevelFlag && (utils.getServiceTemplateTabName(categoryMap, value) || utils.getNurseTemplateTabName(categoryMap, value))) {
      basicInfo.clinicRefNo = clinicRefOfVal ? clinicRefOfVal : basicInfo.clinicRefNo;
    }
    if (!!categoryObj && categoryObj.templateMap.size > 0) {
      let templateObj = categoryObj.templateMap.get(value);
      storageMap = templateObj.storageMap;
      // template has order list
      if (templateObj.storageMap.size > 0) {
        for (let [storageKey, storageObj] of templateObj.storageMap) {
          // init middlewareObject
          let formObj = frameworkMap.has(storageObj.labId) ? frameworkMap.get(storageObj.labId).formMap.get(storageObj.codeIoeFormId) : null;
          let middlewareObject = utils.initMiddlewareObject(formObj, storageObj, true, orderType);
          middlewareMap.set(storageKey, middlewareObject);
        }
      }
    }
    if ((utils.getFOPHasDiagnosis(middlewareMap, orderType) || (!diagnosisEmptyFlag && !searchFieldLengthFlag)) && autoClickToAdd === 'Y' && functionLevelFlag && genderCd === 'M' && (utils.getServiceTemplateTabName(categoryMap, value) || utils.getNurseTemplateTabName(categoryMap, value)) && !PMIDialogIsOpen) {
      this.setState({
        PMIDialogIsOpen: true,
        clickAutoParams: {
          templateId: value,
          isAuto: true
        }
      });
      updateStateWithoutStatus && updateStateWithoutStatus({
        orderIsEdit: false,
        selectedOrderKey: null,
        middlewareMapObj: {
          templateId: value,
          templateSelectAll: false,
          middlewareMap
        },
        contentVals: {
          labId: null,
          selectedSubTabId: value,
          infoTargetLabId: null,
          infoTargetFormId: value
        }
      });
    } else {
      let tempMiddlewareMapObj = {
        templateId: value,
        templateSelectAll: false,
        middlewareMap: cloneDeep(middlewareMap)
      };
      let checkedFlag = utils.validateTemplateChecked(middlewareMapObj);
      if (checkedFlag) {
        if (selectionAreaIsEdit) {
          let payload = {
            msgCode: IX_REQUEST_CODE.SWITCH_TAB_CHANGED,
            btn1AutoClose: false,
            btnActions: {
              btn1Click: () => {
                let validateMsgCode = utils.handleValidateTemplateItems(middlewareMapObj);
                if (validateMsgCode === '') {
                  let { templateOrderWithQuestionKeys } = utils.handleTemplateOrderWithQuestions(middlewareMapObj, itemMapping, storageMap);
                  if (templateOrderWithQuestionKeys.length > 0) {
                    // has question
                    let obj = {
                      selectionAreaIsEdit: false,
                      orderIsEdit: false,
                      selectedOrderKey: null,
                      middlewareMapObj: {
                        templateId: value,
                        templateSelectAll: false,
                        middlewareMap
                      },
                      contentVals: {
                        labId: null,
                        selectedSubTabId: value,
                        infoTargetLabId: null,
                        infoTargetFormId: value
                      },
                      autoMiddlewareMapObj: autoClickToAdd === 'Y' ? true : false,
                      tempMiddlewareMapObj
                    };
                    this.handleAddOrderWithInfo(true);
                    updateStateWithoutStatus && updateStateWithoutStatus({
                      tabSwitchFlag: true,
                      nextStepParamsObj: obj,
                      autoAddDefaultAllOrder: this.autoAddDefaultAllOrder
                    });
                  } else {
                    // no question
                    let continueFlag = this.handleAddOrderWithInfo(true);
                    if (!continueFlag) {
                      updateStateWithoutStatus && updateStateWithoutStatus({
                        selectionAreaIsEdit: false,
                        orderIsEdit: false,
                        selectedOrderKey: null,
                        middlewareMapObj: {
                          templateId: value,
                          templateSelectAll: false,
                          middlewareMap
                        },
                        contentVals: {
                          labId: null,
                          selectedSubTabId: value,
                          infoTargetLabId: null,
                          infoTargetFormId: value
                        }
                      }, () => autoClickToAdd === 'Y' && this.autoAddDefaultAllOrder(tempMiddlewareMapObj, true));
                    } else {
                      updateStateWithoutStatus && updateStateWithoutStatus({
                        selectionAreaIsEdit: true
                      }, () => autoClickToAdd === 'Y' && this.autoAddDefaultAllOrder(tempMiddlewareMapObj, true));
                    }
                    closeCommonMessage && closeCommonMessage();
                  }
                } else {
                  //apply default value to add all order
                  closeCommonMessage && closeCommonMessage();
                  delay(() => {
                    openCommonMessage && openCommonMessage({ msgCode: validateMsgCode });
                  }, 500);
                }
              },
              btn2Click: () => {
                updateStateWithoutStatus && updateStateWithoutStatus({
                  orderIsEdit: false,
                  selectedOrderKey: null,
                  middlewareMapObj: {
                    templateId: value,
                    templateSelectAll: false,
                    middlewareMap
                  },
                  contentVals: {
                    labId: null,
                    selectedSubTabId: value,
                    infoTargetLabId: null,
                    infoTargetFormId: value
                  },
                  outputFormIsChecked: artificialChecked ? outputFormIsChecked : outputFormIsChecked1,
                  reminderIsChecked: artificialChecked ? reminderIsChecked : reminderIsChecked1,
                  lableIsChecked: artificialChecked ? lableIsChecked : lableIsChecked1,
                  btnSwith: artificialChecked ? (outputFormIsChecked || reminderIsChecked || lableIsChecked) : (outputFormIsChecked1 || reminderIsChecked1 || lableIsChecked1)
                }, () => autoClickToAdd === 'Y' && this.autoAddDefaultAllOrder(tempMiddlewareMapObj));
              }
            }
          };
          openCommonMessage && openCommonMessage(payload);
        } else {
          updateStateWithoutStatus && updateStateWithoutStatus({
            orderIsEdit: false,
            selectedOrderKey: null,
            middlewareMapObj: {
              templateId: value,
              templateSelectAll: false,
              middlewareMap
            },
            contentVals: {
              labId: null,
              selectedSubTabId: value,
              infoTargetLabId: null,
              infoTargetFormId: value
            }
          }, () => autoClickToAdd === 'Y' && this.autoAddDefaultAllOrder(tempMiddlewareMapObj));
        }
      } else {
        updateStateWithoutStatus && updateStateWithoutStatus({
          orderIsEdit: false,
          selectedOrderKey: null,
          middlewareMapObj: {
            templateId: value,
            templateSelectAll: false,
            middlewareMap
          },
          contentVals: {
            labId: null,
            selectedSubTabId: value,
            infoTargetLabId: null,
            infoTargetFormId: value
          },
          outputFormIsChecked: artificialChecked ? outputFormIsChecked : outputFormIsChecked1,
          reminderIsChecked: artificialChecked ? reminderIsChecked : reminderIsChecked1,
          lableIsChecked: artificialChecked ? lableIsChecked : lableIsChecked1,
          btnSwith: artificialChecked ? (outputFormIsChecked || reminderIsChecked || lableIsChecked) : (outputFormIsChecked1 || reminderIsChecked1 || lableIsChecked1)
        }, () => autoClickToAdd === 'Y' && this.autoAddDefaultAllOrder(tempMiddlewareMapObj));
      }
    }
  }

  autoAddDefaultAllOrder = (middlewareMapObj, flag) => {
    let { updateStateWithoutStatus } = this.props;
    utils.handleTemplateTabClickEffect(true, constants.IX_REQUEST_TEMPLATE_CB.LEVEL_1, middlewareMapObj);
    updateStateWithoutStatus && updateStateWithoutStatus({ autoMiddlewareMapObj: middlewareMapObj }, () => this.handleAddOrderWithInfo(flag ? flag : false, middlewareMapObj));
  }

  generateTab = () => {
    const { classes, selectedSubTabId, categoryMap, basicInfo } = this.props;
    let tabs = [];
    if (!!basicInfo.orderType && categoryMap.size > 0) {
      if (categoryMap.has(basicInfo.orderType)) {
        let categoryObj = categoryMap.get(basicInfo.orderType);
        if (categoryObj.templateMap.size > 0) {
          for (let [templateId, templateObj] of categoryObj.templateMap) {
            tabs.push(
              <CIMSMultiTab
                  key={templateId}
                  id={`ix_request_sub_tab_${templateId}`}
                  value={templateId}
                  disableClose
                  className={selectedSubTabId === templateId ? 'tabSelected' : 'tabNavigation'}
                  label={
                  <span className={classes.tabSpan}>
                    {templateObj.templateName}
                  </span>
                }
              />
            );
          }
        }
      }
    }
    return tabs;
  }

  handleAddOrderWithInfo = (closeDialog = false, defaultMiddlewareMapObj) => {
    let {
      orderIsEdit,
      categoryMap,
      itemMapping,
      basicInfo,
      orderNumber,
      updateStateWithoutStatus,
      updateGroupingContainerState,
      openCommonMessage,
      selectedSubTabId,//templateId
      updateState,
      contentVals,
      temporaryStorageMap,
      handleResetOrderNumber,
      closeCommonMessage,
      searchFieldLengthObj,
      middlewareMapObj,
      genderCd,
      functionLevelFlag,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      serviceSpecificFunctionInfo,
      artificialChecked,
      outputFormIsChecked,
      reminderIsChecked,
      lableIsChecked
    } = this.props;
    let { clickAutoParams, clinicRefOfVal } = this.state;
    middlewareMapObj = cloneDeep(defaultMiddlewareMapObj) ? cloneDeep(defaultMiddlewareMapObj) : cloneDeep(middlewareMapObj);
    basicInfo = cloneDeep(basicInfo);
    let { orderType } = basicInfo;
    // validate
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === '' ? true : false;
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo, searchFieldLengthObj);
    // check the item numbers
    let msgCode = defaultMiddlewareMapObj ? '' : utils.handleValidateTemplateItems(middlewareMapObj);
    let { storageMap } = categoryMap.get(orderType).templateMap.get(selectedSubTabId);
    let { middlewareMap } = middlewareMapObj;
    let gbsIsExist = this.gbsIsExistInMiddlewareMap(middlewareMapObj.middlewareMap, (orderType === 'S' || orderType === 'N') && antGBSIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_GBS_NAME));
    let lftIsExist = this.lftIsExistInMiddlewareMap(middlewareMapObj.middlewareMap, (orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_LFT_NAME));
    let { templateOrderWithDiagnosisKeys } = utils.handleTemplateOrderWithQuestions(middlewareMapObj, itemMapping, storageMap, gbsIsExist, lftIsExist);
    if ((templateOrderWithDiagnosisKeys.length > 0 || (!diagnosisEmptyFlag && !searchFieldLengthFlag)) && genderCd === 'M' && functionLevelFlag && (utils.getServiceTemplateTabName(categoryMap, selectedSubTabId) || utils.getNurseTemplateTabName(categoryMap, selectedSubTabId))) {
      basicInfo.clinicRefNo = clinicRefOfVal ? clinicRefOfVal : basicInfo.clinicRefNo;
    }

    if (utils.checkTemplateOrdersLipidProfileIsCheck(middlewareMap)) {
      if (msgCode === '') {
        if ((templateOrderWithDiagnosisKeys.length > 0 || (!diagnosisEmptyFlag && !searchFieldLengthFlag)) && genderCd === 'M' && functionLevelFlag && (utils.getServiceTemplateTabName(categoryMap, selectedSubTabId) || utils.getNurseTemplateTabName(categoryMap, selectedSubTabId)) && !this.state.PMIDialogIsOpen) {
          this.setState({
            PMIDialogIsOpen: true,
            clickAutoParams: {
              ...clickAutoParams,
              isAuto: false
            }
          });
        }
        else {
          let { templateOrderTotalKeys, templateOrderWithQuestionKeys, templateOrderWithoutDiagnosisKeys } = utils.handleTemplateOrderWithQuestions(middlewareMapObj, itemMapping, storageMap, gbsIsExist, lftIsExist);
          if (templateOrderWithQuestionKeys.length > 0) {
            let tempQuestionKeys = difference(templateOrderWithQuestionKeys, templateOrderWithoutDiagnosisKeys);
            let openDialog = false;
            if (closeDialog) {
              closeCommonMessage && closeCommonMessage();
            }
            //backup question
            if (!diagnosisEmptyFlag && !searchFieldLengthFlag) {
              templateOrderWithQuestionKeys.forEach(key => {
                let middlewareObject = middlewareMap.get(key);
                middlewareObject.backupQuestionValMap = cloneDeep(middlewareObject.questionValMap);
                if (!orderIsEdit) {
                  utils.resetQuestionStatus(middlewareObject.questionValMap);
                }
                utils.resetQuestionGroupStatus(middlewareObject.questionGroupMap);
              });
              openDialog = true;
            } else if (tempQuestionKeys.length > 0) {
              tempQuestionKeys.forEach(key => {
                let middlewareObject = middlewareMap.get(key);
                middlewareObject.backupQuestionValMap = cloneDeep(middlewareObject.questionValMap);
                if (!orderIsEdit) {
                  utils.resetQuestionStatus(middlewareObject.questionValMap);
                }
                utils.resetQuestionGroupStatus(middlewareObject.questionGroupMap);
              });
              openDialog = true;
            } else {
              let gbsOrZikaIsExist = false;
              let tempKeys = difference(templateOrderWithDiagnosisKeys, templateOrderWithQuestionKeys);
              tempKeys.forEach(key => {
                let middlewareObject = middlewareMap.get(key);
                let tempBasicInfo = cloneDeep(basicInfo);
                if (this.gbsIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antGBSIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_GBS_NAME))) {
                  if (middlewareObject.questionValMap.has(825)) {
                    middlewareObject.questionValMap.get(825).isChecked = true;
                    middlewareObject.questionValMap.get(825).itemVal = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    middlewareObject.questionValMap.get(825).operationType = 'I';
                    tempBasicInfo.infoRemark = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    gbsOrZikaIsExist = true;
                  } else {
                    gbsOrZikaIsExist = antZIKAIsActive ? gbsOrZikaIsExist : false;
                  }
                }

                if (this.lftIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_LFT_NAME))) {
                  if (middlewareObject.questionValMap.has(489)) {
                    middlewareObject.questionValMap.get(489).isChecked = true;
                    middlewareObject.questionValMap.get(489).operationType = 'I';
                  }
                }

                let obj = utils.initTemporaryStorageObj(middlewareObject, tempBasicInfo, storageMap.get(key).labId, orderType, gbsOrZikaIsExist, searchFieldLengthObj.remark);
                for (let i = 0; i < orderNumber; i++) {
                  temporaryStorageMap.set(`${storageMap.get(key).codeIoeFormId}_${Math.random()}`, obj);
                }
                utils.resetTemplateOrderMiddlewareObject(middlewareObject);
              });
              if (templateOrderTotalKeys.length > templateOrderWithoutDiagnosisKeys.length) {
                middlewareMapObj.templateSelectAll = false;
              }
            }
            if (genderCd === 'M' && functionLevelFlag && (utils.getServiceTemplateTabName(categoryMap, selectedSubTabId) || utils.getNurseTemplateTabName(categoryMap, selectedSubTabId))) {
              this.setState({ PMIDialogIsOpen: false });
            }
            if (!defaultMiddlewareMapObj) {
              updateStateWithoutStatus && updateStateWithoutStatus({
                autoMiddlewareMapObj: null,
                middlewareMapObj,
                contentVals: {
                  ...contentVals,
                  infoTargetLabId: null,
                  infoTargetFormId: selectedSubTabId // FromId as TemplateId
                }
              });
            } else {
              updateStateWithoutStatus && updateStateWithoutStatus({
                autoMiddlewareMapObj: cloneDeep(middlewareMapObj),
                contentVals: {
                  ...contentVals,
                  infoTargetLabId: null,
                  infoTargetFormId: selectedSubTabId // FromId as TemplateId
                }
              });
            }
            if (openDialog) {
              updateStateWithoutStatus && updateStateWithoutStatus({
                basicInfo: {
                  ...basicInfo,
                  infoOrderType: basicInfo.orderType
                }
              });
              // has question
              updateGroupingContainerState && updateGroupingContainerState({
                infoIsOpen: true
              });
            }
          } else {
            // no question
            // Add
            let outputFormIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
            let reminderIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
            let lableIsChecked1 = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);

            let gbsOrZikaIsExist = false;
            if ((orderType === 'S' || orderType === 'N') && antZIKAIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_ZIKA__NAME)) {
              basicInfo.infoRemark = zikaValue === '' ? 'Viral exposure EDC:' : `Viral exposure EDC: ${zikaValue}`;
              gbsOrZikaIsExist = true;
            }
            if (!diagnosisEmptyFlag && !searchFieldLengthFlag) {
              templateOrderTotalKeys.forEach(key => {
                let middlewareObject = middlewareMap.get(key);
                let tempBasicInfo = cloneDeep(basicInfo);
                if (this.gbsIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antGBSIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_GBS_NAME))) {
                  if (middlewareObject.questionValMap.has(825)) {
                    middlewareObject.questionValMap.get(825).isChecked = true;
                    middlewareObject.questionValMap.get(825).itemVal = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    middlewareObject.questionValMap.get(825).operationType = 'I';
                    tempBasicInfo.infoRemark = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    gbsOrZikaIsExist = true;
                  } else {
                    gbsOrZikaIsExist = antZIKAIsActive ? gbsOrZikaIsExist : false;
                  }
                }
                if (this.lftIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_LFT_NAME))) {
                  if (middlewareObject.questionValMap.has(489)) {
                    middlewareObject.questionValMap.get(489).isChecked = true;
                    middlewareObject.questionValMap.get(489).operationType = 'I';
                  }
                }
                let obj = utils.initTemporaryStorageObj(middlewareObject, tempBasicInfo, storageMap.get(key).labId, orderType, gbsOrZikaIsExist, searchFieldLengthObj.remark);
                for (let i = 0; i < orderNumber; i++) {
                  temporaryStorageMap.set(`${storageMap.get(key).codeIoeFormId}_${Math.random()}`, obj);
                }
                utils.resetTemplateOrderMiddlewareObject(middlewareObject);
              });

              middlewareMapObj.templateSelectAll = false;
              updateState && updateState({
                isEdit: true,
                outputFormIsChecked: artificialChecked ? outputFormIsChecked : outputFormIsChecked1,
                reminderIsChecked: artificialChecked ? reminderIsChecked : reminderIsChecked1,
                lableIsChecked: artificialChecked ? lableIsChecked : lableIsChecked1,
                btnSwith: artificialChecked ? (outputFormIsChecked || reminderIsChecked || lableIsChecked) : (outputFormIsChecked1 || reminderIsChecked1 || lableIsChecked1)
              });
            } else {
              templateOrderWithDiagnosisKeys.forEach(key => {
                let middlewareObject = middlewareMap.get(key);
                let tempBasicInfo = cloneDeep(basicInfo);
                if (this.gbsIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antGBSIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_GBS_NAME))) {
                  if (middlewareObject.questionValMap.has(825)) {
                    middlewareObject.questionValMap.get(825).isChecked = true;
                    middlewareObject.questionValMap.get(825).itemVal = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    middlewareObject.questionValMap.get(825).operationType = 'I';
                    tempBasicInfo.infoRemark = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
                    gbsOrZikaIsExist = true;
                  } else {
                    gbsOrZikaIsExist = antZIKAIsActive ? gbsOrZikaIsExist : false;
                  }
                }
                if (this.lftIsExist(middlewareObject, (orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap, orderType, selectedSubTabId, commonConstants.COMMON_CODE.ANT_LFT_NAME))) {
                  if (middlewareObject.questionValMap.has(489)) {
                    middlewareObject.questionValMap.get(489).isChecked = true;
                    middlewareObject.questionValMap.get(489).operationType = 'I';
                  }
                }
                let obj = utils.initTemporaryStorageObj(middlewareObject, tempBasicInfo, storageMap.get(key).labId, orderType, gbsOrZikaIsExist, searchFieldLengthObj.remark);
                for (let i = 0; i < orderNumber; i++) {
                  temporaryStorageMap.set(`${storageMap.get(key).codeIoeFormId}_${Math.random()}`, obj);
                }
                utils.resetTemplateOrderMiddlewareObject(middlewareObject);
              });
              if (templateOrderTotalKeys.length > templateOrderWithoutDiagnosisKeys.length) {
                middlewareMapObj.templateSelectAll = false;
              }
            }
            if (genderCd === 'M' && functionLevelFlag && (utils.getServiceTemplateTabName(categoryMap, selectedSubTabId) || utils.getNurseTemplateTabName(categoryMap, selectedSubTabId))) {
              this.setState({ PMIDialogIsOpen: false });
            }
            if (!defaultMiddlewareMapObj) {
              updateState && updateState({
                isEdit: true,
                middlewareMapObj,
                autoMiddlewareMapObj: null,
                selectedOrderKey: null,
                orderIsEdit: false,
                temporaryStorageMap,

                outputFormIsChecked: artificialChecked ? outputFormIsChecked : outputFormIsChecked1,
                reminderIsChecked: artificialChecked ? reminderIsChecked : reminderIsChecked1,
                lableIsChecked: artificialChecked ? lableIsChecked : lableIsChecked1,
                btnSwith: artificialChecked ? (outputFormIsChecked || reminderIsChecked || lableIsChecked) : (outputFormIsChecked1 || reminderIsChecked1 || lableIsChecked1)
              });
            } else {
              updateState && updateState({
                autoMiddlewareMapObj: cloneDeep(middlewareMapObj),
                selectedOrderKey: null,
                orderIsEdit: false,
                temporaryStorageMap
              });
            }
            updateStateWithoutStatus && updateStateWithoutStatus({
              selectionAreaIsEdit: false
            });
            this.props.verifyPrintStatusAfterAddOrder();
            EventEmitter.emit('ix_request_add_order');
            handleResetOrderNumber && handleResetOrderNumber();
          }

          let stopFlag = false;
          if (templateOrderWithoutDiagnosisKeys.length > 0 && diagnosisEmptyFlag) {
            updateStateWithoutStatus && updateStateWithoutStatus({
              diagnosisErrorFlag: diagnosisEmptyFlag
            });
            stopFlag = true;
          } else {
            updateStateWithoutStatus && updateStateWithoutStatus({
              diagnosisErrorFlag: false
            });
          }

          if (closeDialog) {
            return stopFlag;
          }
        }
      } else {
        openCommonMessage && openCommonMessage({ msgCode });
      }
    } else {
      openCommonMessage && openCommonMessage({ msgCode: IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED });
    }
  }

  gbsIsExist = (middlewareObject, flag) => {
    let result = false;
    if (middlewareObject && middlewareObject.codeIoeFormId === 100012 && middlewareObject.testValMap.size > 0
      && (middlewareObject.testValMap.has(824) ? middlewareObject.testValMap.get(824).isChecked : false) && flag) {
      result = true;
    }
    return result;
  }

  gbsIsExistInMiddlewareMap = (middlewareMap, flag) => {
    let result = false;
    for (const [key, value] of middlewareMap) {
      if (value && value.codeIoeFormId === 100012 && value.testValMap.size > 0
        && (value.testValMap.has(824) ? value.testValMap.get(824).isChecked : false) && flag) {
        result = true;
        break;
      }
    }
    return result;
  }

  lftIsExist = (middlewareObject, flag) => {
    let result = false;
    if (middlewareObject && middlewareObject.questionValMap.size > 0
      && middlewareObject.questionGroupMap.has('Gel tube') && flag) {
      result = true;
    }
    return result;
  }

  lftIsExistInMiddlewareMap = (middlewareMap, flag) => {
    let result = false;
    for (let obj of middlewareMap.values()) {
      if (obj && obj.questionValMap && obj.questionValMap.size > 0
        && obj.questionGroupMap.has('Gel tube') && flag) {
        result = true;
        break;
      }
    }
    return result;
  }

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  }

  render() {
    const {
      classes,
      basicInfo,
      categoryMap,
      selectedSubTabId,
      updateStateWithoutStatus,
      updateState,
      orderIsEdit,
      orderNumber,
      dropdownMap,
      middlewareMapObj,
      wrapperHeight
    } = this.props;
    let { open, containerHeight, PMIDialogIsOpen, clickAutoParams } = this.state;
    let { orderType } = basicInfo;
    let isHasTemplate = categoryMap.has(orderType) ? (categoryMap.get(orderType).templateMap.size > 0 ? true : false) : false;
    let isHasTemplateOrder = false;
    let storageMap = new Map();
    if (isHasTemplate) {
      storageMap = categoryMap.get(basicInfo.orderType).templateMap.get(selectedSubTabId) ? categoryMap.get(basicInfo.orderType).templateMap.get(selectedSubTabId).storageMap : new Map();
      isHasTemplateOrder = storageMap.size > 0 ? true : false;
    }
    let templateContainerHeight = undefined;
    if (containerHeight && this.tabRef && this.tabRef.current) {
      templateContainerHeight = containerHeight - this.tabRef.current.clientHeight;
    }

    let templateOrderContainerProps = {
      wrapperHeight: templateContainerHeight,
      isHasTemplateOrder,
      templateId: selectedSubTabId,
      storageMap,
      dropdownMap,
      middlewareMapObj,
      updateState,
      updateStateWithoutStatus
    };
    let PMIDialogProps = {
      isOpen: PMIDialogIsOpen,
      updateState: this.updateState,
      handleAddOrderWithInfo: this.handleAddOrderWithInfo,
      changeTabValue: this.changeTabValue,
      clickAutoParams,
      updateStateWithoutStatus,
      basicInfo
    };
    return (
      <div style={{ height: wrapperHeight }} className={classes.wrapper}>
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
              regular: classes.toolBar
            }}
          >
          </Toolbar>
        </AppBar>
        {/* list content */}
        <div
            style={{ height: containerHeight }}
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
            {isHasTemplate ? (
              <Grid item xs={12} classes={{ 'grid-xs-12': classes.fullWrapper }}>
                <TemplateOrderContainer {...templateOrderContainerProps} />
              </Grid>
            ) : null}
          </Grid>
        </div>
        {/* action */}
        <div className={classes.actionWrapper}>
          <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              style={{ height: containerHeight }}
              className={classes.fabGird}
          >
            <Grid item style={{ width: 82, marginBottom: 20 }}>
              <Grid item xs={4}>
                <div className={classes.flexCenter}>
                  <label className={classes.label}>Urgent</label>
                  <div className={classes.floatLeft}>
                    <Checkbox
                        id="ix_request_basic_info_urgent"
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
                  options={constants.ORDER_NUMBER_OPTIONS.map(option => {
                  return {
                    label: option.label,
                    value: option.value
                  };
                })}
                  isDisabled={orderIsEdit}
                  value={orderNumber}
                  onChange={event => { this.handleOrderNumberChange(event); }}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                  menuPortalTarget={document.body}
              />
            </Grid>
            <Grid item>
              <Tooltip title="Add Order" classes={{ tooltip: classes.tooltip }}>
                <Fab
                    size="small"
                    color="primary"
                    aria-label="Add Order"
                    id="btn_ix_request_add_order"
                    disabled={isHasTemplate ? !isHasTemplateOrder : true}
                    className={classes.fab}
                    onClick={() => { this.handleAddOrderWithInfo(); }}
                >
                  <ArrowForward />
                </Fab>
              </Tooltip>
            </Grid>
          </Grid>
        </div>
        <PMIDialog {...PMIDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(TemplateContainer);
