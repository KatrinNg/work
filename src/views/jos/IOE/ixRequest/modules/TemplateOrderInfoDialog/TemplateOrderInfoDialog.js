import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid, Card, CardContent } from '@material-ui/core';
import Draggable from 'react-draggable';
import { styles } from './TemplateOrderInfoDialogStyle';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import _, { findIndex,difference,cloneDeep,uniq,intersection } from 'lodash';
import classNames from 'classnames';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
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

class TemplateOrderInfoDialog extends Component {
  constructor(props){
    super(props);
    this.displayGroupNamesMap = new Map();
    this.formGroupKeysMap = new Map();
    this.formIqsMap = new Map();
    this.filterKeys = [];
    this.state = {
      action: null,
      isError: false
    };
  }

  handleMandatoryVerify = (templateOrderWithQuestionKeys,middlewareMap) => {
    let mandatoryFlag = true;
    templateOrderWithQuestionKeys.forEach(key => {
      let middlewareObject = middlewareMap.get(key);
      let { questionGroupMap,questionValMap } = middlewareObject;
      let displayGroupNames = this.displayGroupNamesMap.get(key);
      if (displayGroupNames.size > 0) {
        for (let groupName of displayGroupNames.values()) {
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
    });
    return mandatoryFlag;
  }

  handleAction = action => {
    let { topTabSwitchFlag,topTabParamsObj,tabSwitchFlag,nextStepParamsObj,orderNumber,selectedSubTabId, categoryMap, temporaryStorageMap, updateState,handleInfoDialogCancel,handleResetOrderNumber,basicInfo,middlewareMapObj,itemMapping,updateStateWithoutStatus,updateGroupingContainerState,searchFieldLengthObj,autoMiddlewareMapObj,autoAddDefaultAllOrder,genderCd,fopServiceTemplateIsActive, antGBSIsActive, antZIKAIsActive, gbsValue, zikaValue, antLFTIsActive, searchIsOpen} = this.props;
    middlewareMapObj = autoMiddlewareMapObj ? autoMiddlewareMapObj : middlewareMapObj;
    let { orderType } = basicInfo;
    let { storageMap } = categoryMap.get(orderType).templateMap.get(selectedSubTabId);
    let {templateOrderTotalKeys,templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys,templateOrderWithDiagnosisKeys} = utils.handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping,storageMap);
    let tempQuestionKeys = difference(templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys);
    basicInfo = cloneDeep(basicInfo);
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === ''?true:false;
    let { middlewareMap } = middlewareMapObj;
    let { infoOrderType } = basicInfo;
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo,searchFieldLengthObj);
    this.setState({action});
    if (action === constants.INFO_DIALOG_ACTION_TYPE.CANCEL) {
      templateOrderWithQuestionKeys.forEach(key => {
        let middlewareObject = middlewareMap.get(key);
        middlewareObject.questionValMap = middlewareObject.backupQuestionValMap ? middlewareObject.backupQuestionValMap : middlewareObject.questionValMap;
        delete middlewareObject.backupQuestionValMap;
      });
      handleInfoDialogCancel&&handleInfoDialogCancel();
      if(autoMiddlewareMapObj) {
        updateStateWithoutStatus&&updateStateWithoutStatus({
          topTabSwitchFlag:false,
          topTabParamsObj:null,
          tabSwitchFlag:false,
          nextStepParamsObj:null,
          selectedOrderKey:null,
          orderIsEdit:false,
          autoMiddlewareMapObj:null
        });
      }else{
        updateStateWithoutStatus&&updateStateWithoutStatus({
          topTabSwitchFlag:false,
          topTabParamsObj:null,
          tabSwitchFlag:false,
          nextStepParamsObj:null,
          selectedOrderKey:null,
          orderIsEdit:false,
          middlewareMapObj
        });
      }
    } else {
      //verify
      let { orderType } = basicInfo;
      if((orderType === 'S'||orderType === 'N' )&& genderCd=== 'M' && fopServiceTemplateIsActive && (utils.getServiceTemplateTabName(categoryMap,selectedSubTabId)||utils.getNurseTemplateTabName(categoryMap,selectedSubTabId))) {
        basicInfo.clinicRefNo = basicInfo.tempClinicRefNo ? basicInfo.tempClinicRefNo : basicInfo.clinicRefNo;
      }
      let mandatoryFlag = this.handleMandatoryVerify(this.filterKeys,middlewareMap);
      if (mandatoryFlag) {
        utils.copyQuestionVal(middlewareMap,this.formGroupKeysMap,this.filterKeys);
        let { storageMap } = categoryMap.get(infoOrderType).templateMap.get(selectedSubTabId);
        let gbsOrZikaIsExist = false;
        if((orderType === 'S' || orderType === 'N') && antZIKAIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap,infoOrderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_ZIKA__NAME)){
          basicInfo.infoRemark= zikaValue === '' ? 'Viral exposure EDC:' : `Viral exposure EDC: ${zikaValue}`;
          gbsOrZikaIsExist = true;
        }
        if (!diagnosisEmptyFlag  && !searchFieldLengthFlag) {
          templateOrderTotalKeys.forEach(key => {
            let middlewareObject = middlewareMap.get(key);
            let tempBasicInfo = cloneDeep(basicInfo);
            if(this.gbsIsExist(middlewareObject,(orderType === 'S' || orderType === 'N')
            && antGBSIsActive
            && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_GBS_NAME)
            && middlewareObject.questionValMap.has(825))) {
              tempBasicInfo.infoRemark= gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
              middlewareObject.questionValMap.get(825).isChecked = true;
              middlewareObject.questionValMap.get(825).itemVal = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
              middlewareObject.questionValMap.get(825).operationType = 'I';
              gbsOrZikaIsExist = true;
            }else{
              gbsOrZikaIsExist = antZIKAIsActive ? gbsOrZikaIsExist : false;
            }
            if(this.lftIsExist(middlewareObject,(orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_LFT_NAME))) {
              if(middlewareObject.questionValMap.has(489)) {
                middlewareObject.questionValMap.get(489).isChecked = true;
                middlewareObject.questionValMap.get(489).operationType = 'I';
              }
            }
            let obj = utils.initTemporaryStorageObj(middlewareObject,tempBasicInfo,storageMap.get(key).labId,infoOrderType,gbsOrZikaIsExist,searchFieldLengthObj.remark);
            for (let i = 0; i < orderNumber; i++) {
              temporaryStorageMap.set(`${storageMap.get(key).codeIoeFormId}_${Math.random()}`,obj);
            }
            utils.resetTemplateOrderMiddlewareObject(middlewareObject);
            delete middlewareObject.backupQuestionValMap;
          });
          middlewareMapObj.templateSelectAll = false;
        } else {
          templateOrderWithDiagnosisKeys.forEach(key => {
            let middlewareObject = middlewareMap.get(key);
            let tempBasicInfo = cloneDeep(basicInfo);
            if(this.gbsIsExist(middlewareObject,(orderType === 'S' || orderType === 'N')
            && antGBSIsActive
            && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_GBS_NAME)
            && middlewareObject.questionValMap.has(825))) {
              tempBasicInfo.infoRemark= gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
              middlewareObject.questionValMap.get(825).isChecked = true;
              middlewareObject.questionValMap.get(825).itemVal = gbsValue === '' ? 'Report to be sent to: Delivery Hospital -' : `Report to be sent to: Delivery Hospital - ${gbsValue}`;
              middlewareObject.questionValMap.get(825).operationType = 'I';
              gbsOrZikaIsExist = true;
            }else{
              gbsOrZikaIsExist = antZIKAIsActive ? gbsOrZikaIsExist : false;
            }

            if(this.lftIsExist(middlewareObject,(orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_LFT_NAME))) {
              if(middlewareObject.questionValMap.has(489)) {
                middlewareObject.questionValMap.get(489).isChecked = true;
                middlewareObject.questionValMap.get(489).operationType = 'I';
              }
            }
            let obj = utils.initTemporaryStorageObj(middlewareObject,tempBasicInfo,storageMap.get(key).labId,infoOrderType,gbsOrZikaIsExist,searchFieldLengthObj.remark);
            for (let i = 0; i < orderNumber; i++) {
              temporaryStorageMap.set(`${storageMap.get(key).codeIoeFormId}_${Math.random()}`,obj);
            }
            if(templateOrderWithDiagnosisKeys.indexOf(tempQuestionKeys) != -1) {
              delete middlewareObject.backupQuestionValMap;
            }
            utils.resetTemplateOrderMiddlewareObject(middlewareObject);
          });
          if (templateOrderTotalKeys.length > templateOrderWithoutDiagnosisKeys.length) {
            middlewareMapObj.templateSelectAll = false;
          }
        }
        if(autoMiddlewareMapObj) {
          updateState&&updateState({
            isEdit:true,
            selectedOrderKey:null,
            orderIsEdit:false,
            temporaryStorageMap,
            autoMiddlewareMapObj:null
          });
        }else{
          updateState&&updateState({
            isEdit:true,
            selectedOrderKey:null,
            orderIsEdit:false,
            temporaryStorageMap,
            middlewareMapObj
          });
        }

        if (!diagnosisEmptyFlag||(templateOrderTotalKeys.length === templateOrderWithQuestionKeys.length)) {
          if (tabSwitchFlag) {
            let tempObj = cloneDeep(nextStepParamsObj);
            updateStateWithoutStatus&&updateStateWithoutStatus({
              ...tempObj,
              nextStepParamsObj:null,
              tabSwitchFlag:false
            },() => tempObj.autoMiddlewareMapObj && autoAddDefaultAllOrder && autoAddDefaultAllOrder(tempObj.tempMiddlewareMapObj,true)
            );
          }
          if (topTabSwitchFlag) {
            let tempObj = cloneDeep(topTabParamsObj);
            updateGroupingContainerState&&updateGroupingContainerState({
              ...tempObj
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

  handleQuestionType = (id,valMap,masterTestMap,formId) => {
    let { frameworkMap,ioeFormMap } = this.props;
    let {labId} = ioeFormMap.get(formId);
    let questionItemsMap = frameworkMap.get(labId).formMap.get(formId).questionItemsMap;
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

  generateItemByType = (item,middlewareObject,type=constants.ITEM_VALUE.TYPE1) => {
    const { classes,dropdownMap,updateState, updateStateWithoutStatus } = this.props;
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
      updateState,
      updateStateWithoutStatus
    };

    let element = null;
    switch (itemType) {
      case constants.FORM_ITEM_TYPE.CLICK_BOX:{
        fieldProps.sideEffect = this.handleQuestionType;
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

  isDislayItem = (item,middlewareObject) => {
    const { itemMapping } = this.props;
    let {codeIoeFormId} = middlewareObject;
    let displayItem = true;
    let { questionValMap } = middlewareObject;
    if (itemMapping.has(codeIoeFormId)) {
      let itemMap = itemMapping.get(codeIoeFormId);
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

  generateGroupItems = (items,labId,formId,middlewareObject) => {
    let { classes } = this.props;
    let itemElements = [];
    if (items.length>0) {
      items.forEach(item => {
        let itemElement = this.generateItemByType(item,middlewareObject,constants.ITEM_VALUE.TYPE1);
        let displayItem = true;
        if (item.ioeType === constants.ITEM_QUESTION_TYPE.IQS) {
          displayItem = this.validateIQS(item,middlewareObject);
        } else {
          displayItem = this.isDislayItem(item,middlewareObject);
        }
        itemElements.push(
          <div
              key={`${labId}_${formId}_${item.codeIoeFormItemId}`}
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

  validateGroup = (questionItems,middlewareObject) => {
    let displayGroupFlag = true;
    let index = findIndex(questionItems,item => {
      return item.ioeType !== constants.ITEM_QUESTION_TYPE.IQS;
    });
    if (index === -1) {
      // only exist IQS
      displayGroupFlag = this.validateIQS(questionItems[0],middlewareObject);
    }
    return displayGroupFlag;
  }

  validateIQS = (questionItem,middlewareObject) => {
    const { itemMapping } = this.props;
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

  isHasIQS = middlewareObject => {
    const { itemMapping } = this.props;
    let { codeIoeFormId, specimenValMap, testValMap } = middlewareObject;
    let displayIQS = false;
    let iqsIds = [];
    if (itemMapping.has(codeIoeFormId)) {
      let itemMap = itemMapping.get(codeIoeFormId);
      let specIds = [...specimenValMap.values()].filter(item => item.isChecked && item.isActive === constants.TEMPLATE_ACTIVE_STATUS.ACTIVE).map(item => item.codeIoeFormItemId);
      let testIds = [...testValMap.values()].filter(item => item.isChecked && item.isActive === constants.TEMPLATE_ACTIVE_STATUS.ACTIVE).map(item => item.codeIoeFormItemId);
      let checkedItemIds = [...specIds, ...testIds];

      if (checkedItemIds.length > 0) {
        for (let [iqsId, idSet] of itemMap) {
          let intersections = _.intersection([...idSet], checkedItemIds);
          if (intersections.length > 0) {
            iqsIds.push(iqsId);
            displayIQS = true;
          }
        }
      }
    }
    middlewareObject.iqsIds = _.sortBy(iqsIds); //mapping iqs item id
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
    const { isOpen,classes,frameworkMap,itemMapping,basicInfo,categoryMap,selectedSubTabId,autoMiddlewareMapObj,antGBSIsActive,antLFTIsActive } = this.props;
    let { middlewareMapObj } = this.props;
    let { orderType } = basicInfo;
    let forms = [];
    middlewareMapObj = autoMiddlewareMapObj ? autoMiddlewareMapObj : middlewareMapObj;
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === ''?true:false;
    if ( isOpen && frameworkMap.size > 0 && categoryMap.size > 0 && categoryMap.get(orderType).templateMap.size > 0) {
      let gbsIsExist = this.gbsIsExistInMiddlewareMap(middlewareMapObj.middlewareMap,(orderType === 'S' || orderType === 'N') && antGBSIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_GBS_NAME));
      let lftIsExist = this.lftIsExistInMiddlewareMap(middlewareMapObj.middlewareMap,(orderType === 'S' || orderType === 'N') && antLFTIsActive && utils.getServiceTemplateTabNameByOrderType(categoryMap,orderType,selectedSubTabId,commonConstants.COMMON_CODE.ANT_LFT_NAME));
      let {templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys} = utils.handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping,'',gbsIsExist,lftIsExist);
      let { storageMap } = categoryMap.get(orderType).templateMap.get(selectedSubTabId);
      let tempQuestionKeys = difference(templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys);
      let tempKeys = [];
      if (!diagnosisEmptyFlag) {
        tempKeys = templateOrderWithQuestionKeys;
      } else {
        tempKeys = tempQuestionKeys;
      }

      tempKeys.forEach(key => {
        let {codeIoeFormId} = storageMap.get(key);
        let middlewareObject = middlewareMapObj.middlewareMap.get(key);
        let tempOrderKeys = [];
        if (this.formGroupKeysMap.has(codeIoeFormId)) {
          tempOrderKeys = this.formGroupKeysMap.get(codeIoeFormId);
        }
        tempOrderKeys.push(key);
        // question form keys map
        this.formGroupKeysMap.set(codeIoeFormId,_.uniq(tempOrderKeys));

        let displayIQS = this.isHasIQS(middlewareObject);
        if (displayIQS) {
          if (this.formIqsMap.has(codeIoeFormId)) {
            this.formIqsMap.get(codeIoeFormId).push({templateKey: key, iqsIds: middlewareObject.iqsIds||[], idStrs: (middlewareObject.iqsIds||[]).join(',') });
          } else {
            this.formIqsMap.set(codeIoeFormId, [{templateKey: key, iqsIds: middlewareObject.iqsIds||[], idStrs: (middlewareObject.iqsIds||[]).join(',') }]);
          }
          this.formIqsMap.set(codeIoeFormId, _.unionBy(this.formIqsMap.get(codeIoeFormId), 'templateKey'));
        }
      });

      let tempFilterKeys =[];
      for (let [formId, keys] of this.formGroupKeysMap) {
        let tempFormIqsIds = this.formIqsMap.has(formId)?this.formIqsMap.get(formId):[];
        // uniq, remove duplicate combinations
        tempFormIqsIds = _.uniqBy(tempFormIqsIds, 'idStrs');
        if (tempFormIqsIds.length > 0) {
          tempFilterKeys = [...tempFilterKeys, ...tempFormIqsIds.map(idObj => idObj.templateKey)];
        } else {
          tempFilterKeys.push(_.head(keys));
        }
      }
      tempFilterKeys = _.uniq(tempFilterKeys);
      // all form question representative
      this.filterKeys = tempFilterKeys;

      tempFilterKeys.forEach((key,index) => {
        let {labId,codeIoeFormId:formId,formShortName} = storageMap.get(key);
        let questionItemsMap = frameworkMap.get(labId).formMap.get(formId).questionItemsMap;
        let middlewareObject = middlewareMapObj.middlewareMap.get(key);
        let orderTitle = `${labId}, ${formShortName}`;
        if (!!questionItemsMap&&questionItemsMap.size>0) {
          let groups = [];
          for (let [groupName, items] of questionItemsMap) {
            let displayGroup = this.validateGroup(items,middlewareObject);
            let displayRequired = this.validateIsQuestion(items);
            let { questionGroupMap } = middlewareObject;
            let groupObj = questionGroupMap.get(groupName);
            let errorSpanElm = groupObj.isError?(
              <span className={classes.errorSpan}>(This field is required.)</span>
            ):null;

            if (!displayGroup) {
              continue;
            } else {
              let itemElements = this.generateGroupItems(items,labId,formId,middlewareObject);
              let tempSet = this.displayGroupNamesMap.has(key)?this.displayGroupNamesMap.get(key):new Set();
              tempSet.add(groupName);
              this.displayGroupNamesMap.set(key,tempSet);
              groups.push(
                <Card
                    key={`ix_request_other_info_${labId}_${formId}_${groupName}`}
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
          forms.push(
            <div className={classes.group} key={`ix_request_other_info_form_${formId}_${index}`}>
              <label className={classes.formTitle}>{orderTitle}</label>
              <div>{groups}</div>
              {/* <Divider className={classes.divider}/> */}
            </div>
          );
        }
      });
    }
    return forms;
  }

  getGBSMap = (middlewareObject) => {
    let result = null;
    for (const [key,value] of middlewareObject) {
      if(value.codeIoeFormId === 100012){
        result = value;
        break;
      }
    }
    return result;
  }

  gbsIsExist = (middlewareObject,flag) => {
    let result = false;
    if(middlewareObject && middlewareObject.codeIoeFormId === 100012 && middlewareObject.testValMap.size > 0
      && (middlewareObject.testValMap.has(824) ? middlewareObject.testValMap.get(824).isChecked : false) && flag) {
        result = true;
    }
    return result;
  }

  gbsIsExistInMiddlewareMap = (middlewareMap,flag) => {
    let result = false;
    for (const [key,value] of middlewareMap) {
      if(value && value.codeIoeFormId === 100012 && value.testValMap.size > 0
        && (value.testValMap.has(824) ? value.testValMap.get(824).isChecked : false) && flag) {
          result = true;
          break;
      }
    }
    return result;
  }

  lftIsExist = (middlewareObject,flag) => {
    let result = false;
    if(middlewareObject && middlewareObject.questionValMap.size > 0
      && middlewareObject.questionGroupMap.has('Gel tube') && flag) {
        result = true;
    }
    return result;
  }

  lftIsExistInMiddlewareMap = (middlewareMap,flag) => {
    let result = false;
    for (let obj of middlewareMap.values()) {
      if(obj && obj.questionValMap && obj.questionValMap.size > 0
        && obj.questionGroupMap.has('Gel tube') && flag) {
          result = true;
          break;
      }
    }
    return result;
  }

  resetStatus = () => {
    let { action } = this.state;
    let { basicInfo,middlewareMapObj,itemMapping,updateStateWithoutStatus } = this.props;
    let {templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys} = utils.handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping);
    let tempQuestionKeys = difference(templateOrderWithQuestionKeys,templateOrderWithoutDiagnosisKeys);
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === ''?true:false;
    let { middlewareMap } = middlewareMapObj;
    if (diagnosisEmptyFlag&&action === constants.INFO_DIALOG_ACTION_TYPE.OK) {
      tempQuestionKeys.forEach(key => {
        let middlewareObject = middlewareMap.get(key);
        utils.resetTemplateOrderMiddlewareObject(middlewareObject);
      });
      middlewareMapObj.templateSelectAll = false;
    }
    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareMapObj
    });
    this.displayGroupNamesMap = new Map();
    this.formGroupKeysMap = new Map();
    this.formIqsMap = new Map();
    this.filterKeys = [];
    this.setState({
      isError: false,
      action:null
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
              <CIMSButton
                  id="btn_ix_request_other_info_dialog_ok"
                  onClick={()=>{this.handleAction(constants.INFO_DIALOG_ACTION_TYPE.OK);}}
              >
                OK
              </CIMSButton>
              <CIMSButton
                  id="btn_ix_request_other_info_dialog_cancel"
                  onClick={()=>{this.handleAction(constants.INFO_DIALOG_ACTION_TYPE.CANCEL);}}
              >
                Cancel
              </CIMSButton>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(TemplateOrderInfoDialog);
