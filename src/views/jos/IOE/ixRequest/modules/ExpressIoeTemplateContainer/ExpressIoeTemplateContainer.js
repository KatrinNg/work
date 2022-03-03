import React, { Component } from 'react';
import { styles } from './ExpressIoeTemplateContainerStyle';
import { withStyles, AppBar, Toolbar, Typography, Drawer, Divider, List, ListItem, ListItemText, Tooltip, Grid, Fab, Checkbox } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import classNames from 'classnames';
import { cloneDeep, delay, isUndefined } from 'lodash';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../utils/ixUtils';
import ExpressIoeContainer from '../ExpressIoeContainer/ExpressIoeContainer';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
import { COMMON_ACTION_TYPE } from '../../../../../../constants/common/commonConstants';
import * as util from '../../../../medicalHistories/util/utils';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../../../constants/common/commonConstants';

class ExpressIoeTemplateContainer extends Component {
  constructor(props) {
    super(props);
    this.barRef = React.createRef();
    this.tabRef = React.createRef();
    this.state = {
      containerHeight: undefined,
      open: false,
      checkedExpressIoeMap: new Map(),
      seed: Math.random()
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
    let { updateState, basicInfo, updateGroupingContainerState } = this.props;
    if (nextProps.wrapperHeight && this.barRef.current && this.barRef.current.clientHeight !== 0) {
      let containerHeight = nextProps.wrapperHeight - this.barRef.current.clientHeight - 10;
      if (containerHeight !== this.state.containerHeight) {
        this.setState({ containerHeight });
      }
    }
    if (nextProps.resetCheckedExpressIoeMap) {
      this.setState({ checkedExpressIoeMap: new Map() });
      basicInfo.checkedExpressIoeMap = new Map();
      updateState && updateState({ basicInfo });
      updateGroupingContainerState && updateGroupingContainerState({ resetCheckedExpressIoeMap: false });
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

  handleDrawerClick = btnDto => {
    let { updateStateWithoutStatus, expressIoeMap, basicInfo, updateState,updateGroupingContainerState } = this.props;
    let { checkedExpressIoeMap } = this.state;
    let labIds = btnDto.codeIoeRequestScatgryIds;
    labIds.forEach(id => {
      expressIoeMap.forEach(expressIoe => {
        let expressIoeItem = new Map(expressIoe.formMap);
        if (expressIoeItem.has(id)) {
          let valObj = expressIoeItem.get(id);
          valObj.isChecked = true;
          checkedExpressIoeMap.set(id, valObj);
        }
      });
    });
    if (btnDto.addDx === 1) {
      let { basicInfo } = this.props;
      basicInfo.infoDiagnosis = basicInfo.infoDiagnosis === '' ? btnDto.codeIoeRequestScatgryPackName : basicInfo.infoDiagnosis + ',' + btnDto.codeIoeRequestScatgryPackName;
    }

    if(checkedExpressIoeMap.size>0){
      basicInfo.checkedExpressIoeMap=checkedExpressIoeMap;
      updateState&&updateState({basicInfo});
      updateGroupingContainerState&&updateGroupingContainerState({resetCheckedExpressIoeMap:false});
    }else{
      basicInfo.checkedExpressIoeMap=checkedExpressIoeMap;
      updateState&&updateState({basicInfo});
    }
    this.setState({ checkedExpressIoeMap });
    updateStateWithoutStatus && updateStateWithoutStatus({
      expressIoeMap
    });
  };

  stylePropChange = (str) => {
    let parseCSSObj = '';
    parseCSSObj = '{' + str + '}';
    parseCSSObj = parseCSSObj.replace(/'/g, '"');
    let obj = JSON.parse(parseCSSObj);
    let newObj = {};
    for (let key in obj) {
      console.log(key + obj[key]);
      if (key.indexOf('-') > 0) {
        let iconIndex = key.indexOf('-');
        let propName = key.substring(0, iconIndex) + key[iconIndex + 1].toUpperCase() + key.substring(iconIndex + 2);
        newObj[propName] = obj[key];
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  generateDrawerList = () => {
    const { classes, selectedLabId, frameworkMap, ioeExpressQuickBtnDtoList } = this.props;
    let list = [];
    if (!!ioeExpressQuickBtnDtoList.length && ioeExpressQuickBtnDtoList.length > 0) {
      for (let index = 0; index < ioeExpressQuickBtnDtoList.length; index++) {
        const btnDto = ioeExpressQuickBtnDtoList[index];
        let style = this.stylePropChange(ioeExpressQuickBtnDtoList[index].displayStyle);
        list.push(
          <ListItem
              id={index}
              key={index}
              button
              onClick={() => { this.handleDrawerClick(btnDto); }}
              style={style}
              className={classNames(classes.drawerItem)}
          >
            <ListItemText
                style={{ textAlign: 'center' }}
                primary={
                <Tooltip title={btnDto.codeIoeRequestScatgryPackName} classes={{ tooltip: classes.tooltip }}>
                  <Typography className={classes.font} noWrap>{btnDto.codeIoeRequestScatgryPackName}</Typography>
                </Tooltip>
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
    handleOrderNumberChange && handleOrderNumberChange(event);
  }

  handleHasPeripheralSmearAtypicalLym = () => {
    let { checkedExpressIoeMap } = this.state;
    let remarkFormList = [];
    let checkedExpressIoeList = [...checkedExpressIoeMap.values()];
    for (let index = 0; index < checkedExpressIoeList.length; index++) {
      let expressIoe = checkedExpressIoeList[index];
      let { codeIoeRequestScatgryFrmMap } = expressIoe;
      let codeIoeRequestScatgryFrmList = [...codeIoeRequestScatgryFrmMap.values()];
      if (codeIoeRequestScatgryFrmList.length === 1) {
        for (let form of codeIoeRequestScatgryFrmMap.values()) {
          let remark = form[0];
          if (remark.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark && remark.frmItemName === constants.REMARK_ITEM_NAME)
            remarkFormList.push(remark);
        }
      }
    }
    return remarkFormList;
  }

  handleAddOrderWithInfo = (closeDialog = false, callback) => {
    let {
      basicInfo,
      orderNumber,
      updateStateWithoutStatus,
      openCommonMessage,
      updateState,
      temporaryStorageMap,
      handleResetOrderNumber,
      resetexpressIoeMap,
      frameworkMap,
      ioeFormMap,
      searchFieldLengthObj,
      artificialChecked,
      insertIxRequestLog,
      serviceSpecificFunctionInfo,
      updateGroupingContainerState
    } = this.props;
    let { orderType } = basicInfo;
    let { checkedExpressIoeMap } = this.state;
    let tempCheckedExpressIoeMap = cloneDeep(checkedExpressIoeMap);
    let diagnosisEmptyFlag = basicInfo.infoDiagnosis === '' ? true : false;
    let searchFieldLengthFlag = utils.searchFieldLengthFlag(basicInfo, searchFieldLengthObj);
    let fieldInputCheckFlagObj = utils.fieldInputCheckFlagObj(cloneDeep(checkedExpressIoeMap));
    let { flag, item } = fieldInputCheckFlagObj; let newExpressIoeMap = new Map();
    let remarkMap = new Map();
    let remarkList = [];
    //得到remark item 且在选中的check express items map中剔除掉相对应的item 避免加入到order中
    let checkedExpressIoeList = [...tempCheckedExpressIoeMap.values()];
    for (let index = 0; index < checkedExpressIoeList.length; index++) {
      let expressIoe = checkedExpressIoeList[index];
      let { codeIoeRequestScatgryFrmMap, codeIoeRequestScatgryId } = expressIoe;
      let codeIoeRequestScatgryFrmList = [...codeIoeRequestScatgryFrmMap.values()];
      if (codeIoeRequestScatgryFrmList.length === 1) {
        for (let form of codeIoeRequestScatgryFrmMap.values()) {
          let remark = form[0];
          if (remark.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark) {
            remarkList.push(remark);
            remark.codeIoeRequestScatgryId = codeIoeRequestScatgryId;
            tempCheckedExpressIoeMap.delete(expressIoe.codeIoeRequestScatgryId);
          }
        }
      }
    }
    if (!diagnosisEmptyFlag && !searchFieldLengthFlag) {
      if (flag) {
        let { codeIoeRequestScatgryName } = item;
        let payload = {
          msgCode: IX_REQUEST_CODE.NOTNULL_ORDER_CODE,
          params: [
            {
              name: 'ITEM',
              value: `${codeIoeRequestScatgryName}`
            }
          ]
        };
        let stopFlag = false;
        if (closeDialog) {
          updateGroupingContainerState && updateGroupingContainerState({ isExpressIoe: true });
          return { stopFlag, payload };
        } else {
          openCommonMessage && openCommonMessage(payload);
        }
        return;
      }
      else if (remarkList.length > 0) {
        // loop remark item list,when checked express ioe item isSeparateFrm property is 0 and checked express ioe item codeIoeFormId is remark item form
        let validateFlag = false;
        let promptRemark = '';
        for (let remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex++) {
          let flag = false;
          let remark = remarkList[remarkIndex];
          if (tempCheckedExpressIoeMap.size > 0) {
            for (let expressItem of tempCheckedExpressIoeMap.values()) {
              let { codeIoeRequestScatgryFrmMap, isSeparateFrm } = expressItem;
              if (codeIoeRequestScatgryFrmMap.has(remark.codeIoeFormId + '') && isSeparateFrm === 0) {
                flag = true;
                remarkMap.set(expressItem.codeIoeRequestScatgryId, flag);
              } else {
                promptRemark = (remark.defaultValue).substr(0, remark.defaultValue.length - 1);
              }
            }
          } else {
            promptRemark = (remark.defaultValue).substr(0, remark.defaultValue.length - 1);
          }
        }
        // if remark item in check ioe form then merge order item remark, else promt message
        for (let expressFlag of remarkMap.values()) {
          if (expressFlag) {
            validateFlag = true;
          } else {
            validateFlag = false;
          }
        }
        let payload = {
          msgCode: IX_REQUEST_CODE.NOT_CAN_SELECT_PERIPHERAL_SMEAR_X_ATYPICAL_LYM,
          params: [
            {
              name: 'TEXT',
              value: `${promptRemark}`
            }
          ]
        };
        if (!validateFlag) {
          let stopFlag = false;
          if (closeDialog) {
            updateGroupingContainerState && updateGroupingContainerState({ isExpressIoe: true });
            return { stopFlag, payload };
          } else {
            openCommonMessage && openCommonMessage(payload);
          }
          return;
        }
      }
      if (tempCheckedExpressIoeMap.size > 0) {
        for (let items of tempCheckedExpressIoeMap.values()) {
          let middlewareObj = {
            codeIoeFormId: null,
            formShortName: '',
            masterTestMap: new Map(),
            otherValMap: new Map(),
            panelItems: [],
            questionGroupMap: new Map(),
            questionValMap: new Map(),
            selectAll: false,
            specimenValMap: new Map(),
            testValMap: new Map()
          };
          let { codeIoeRequestScatgryFrmMap, inputOrderList = [], isDetl, codeIoeRequestScatgryId, codeIoeRequestScatgryName } = items;
          if (isDetl > 0) {
            if (inputOrderList.length > 0) {
              for (let index = 0; index < inputOrderList.length; index++) {
                let inputOrder = inputOrderList[index];
                let scatgryHxDto = this.getListByCheckedExpressObj(items, basicInfo, inputOrder);
                let ioeRequestScatgryHxDtoItems = [];
                ioeRequestScatgryHxDtoItems.push(scatgryHxDto);
                if (remarkList.length > 0) {
                  for (let remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex++) {
                    let remark = remarkList[remarkIndex];
                    if (codeIoeRequestScatgryFrmMap.has(remark.codeIoeFormId + '')) {
                      let form = ioeFormMap.get(remark.codeIoeFormId);
                      if (form !== undefined) {
                        if (ioeFormMap.has(remark.codeIoeFormId)) {
                          let ioeForm = ioeFormMap.get(remark.codeIoeFormId);
                          if (!!ioeForm) {
                            let labByFrame = frameworkMap.get(ioeForm.labId);
                            let { formMap } = labByFrame;
                            let formByFrame = formMap.get(ioeForm.id);
                            let selectItemsMap = formByFrame['otherItemsMap'];
                            middlewareObj.infoTargetLabId = ioeForm.labId;
                            if (remarkMap.has(codeIoeRequestScatgryId)) {
                              let expressIoeByRemark=checkedExpressIoeMap.get(remark.codeIoeRequestScatgryId);
                              let scatgryHxDtoByRemark = this.getListByCheckedExpressObj(expressIoeByRemark, basicInfo);
                              ioeRequestScatgryHxDtoItems.push(cloneDeep(scatgryHxDtoByRemark));
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap, remark);
                            } else {
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                            }
                          }
                        }
                      }
                    }else{
                      for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
                        let form = ioeFormMap.get(parseInt(key));
                        if (form !== undefined) {
                          middlewareObj.codeIoeFormId = parseInt(key);
                          middlewareObj.formShortName = form.formShortName;
                          if (ioeFormMap.has(parseInt(key))) {
                            let ioeForm = ioeFormMap.get(parseInt(key));
                            if (!!ioeForm) {
                              let labByFrame = frameworkMap.get(ioeForm.labId);
                              let { formMap } = labByFrame;
                              let formByFrame = formMap.get(ioeForm.id);
                              let selectItemsMap = formByFrame['otherItemsMap'];
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
                    let form = ioeFormMap.get(parseInt(key));
                    if (form !== undefined) {
                      middlewareObj.codeIoeFormId = parseInt(key);
                      middlewareObj.formShortName = form.formShortName;
                      if (ioeFormMap.has(parseInt(key))) {
                        let ioeForm = ioeFormMap.get(parseInt(key));
                        if (!!ioeForm) {
                          let labByFrame = frameworkMap.get(ioeForm.labId);
                          let { formMap } = labByFrame;
                          let formByFrame = formMap.get(ioeForm.id);
                          let selectItemsMap = formByFrame['otherItemsMap'];
                          middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                        }
                      }
                    }
                  }
                }
                for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
                  let form = ioeFormMap.get(parseInt(key));
                  if (form !== undefined) {
                    middlewareObj.codeIoeFormId = parseInt(key);
                    middlewareObj.formShortName = form.formShortName;
                    middlewareObj.questionValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'questionItemsMap', inputOrder);
                    middlewareObj.specimenValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'specimenItemsMap', inputOrder);
                    middlewareObj.testValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'testItemsMap', inputOrder);
                    middlewareObj.ioeRequestScatgryHxDtoItems = ioeRequestScatgryHxDtoItems;
                    let obj = utils.initTemporaryStorageObjForExpressIoe(middlewareObj, basicInfo, form.labId, orderType);
                    obj.isSeparateFrm = items.isSeparateFrm;
                    let timestamp = new Date().valueOf();
                    newExpressIoeMap.set(`${key}_${timestamp}`, obj);
                    let content = `Is Urgent: ${basicInfo.urgentIsChecked ? 'Yes' : 'No'};`;
                    content += `Quantity: ${orderNumber}; Specimen: ${middlewareObj.formShortName} (${middlewareObj.infoTargetLabId});`;
                    if (middlewareObj.testValMap.size > 0) {
                      content += ' Test: ';
                      for (const value of middlewareObj.testValMap.values()) {
                        if (value.isChecked) {
                          content += `${value.itemName} (${value.codeIoeFormItemId});`;
                        }
                      }
                    }
                    if (middlewareObj.specimenValMap.size > 0) {
                      content += ' Specimen: ';
                      for (const value of middlewareObj.specimenValMap.values()) {
                        if (value.isChecked) {
                          content += `${value.itemName} (${value.codeIoeFormItemId});`;
                        }
                      }
                    }
                    insertIxRequestLog && insertIxRequestLog('Action: Click \'→\' (Add Order) button', '', content);
                    middlewareObj.codeIoeFormId=null;
                    utils.resetMiddlewareObject(middlewareObj);
                    this.setState({ checkedExpressIoeMap: new Map() });
                    basicInfo.checkedExpressIoeMa = new Map();
                    updateState && updateState({
                      isEdit: true,
                      selectedOrderKey: null,
                      orderIsEdit: false,
                      temporaryStorageMap,
                      expressIoeMap: cloneDeep(resetexpressIoeMap),
                      middlewareObject: middlewareObj,
                      basicInfo
                    });
                    updateStateWithoutStatus && updateStateWithoutStatus({
                      selectionAreaIsEdit: false
                    });
                  }
                }
              }
            }
          } else {
            for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
              let formId = parseInt(key);
              let form = ioeFormMap.get(formId);
              if (form !== undefined) {
                let scatgryHxDto = this.getListByCheckedExpressObj(items, basicInfo);
                if (scatgryHxDto) {
                  let ioeRequestScatgryHxDtoItems = [];
                  ioeRequestScatgryHxDtoItems.push(scatgryHxDto);
                  middlewareObj.codeIoeFormId = parseInt(key);
                  middlewareObj.formShortName = form.formShortName;
                  if(remarkList.length>0){
                    for (let remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex++) {
                      let remark = remarkList[remarkIndex];
                      if (codeIoeRequestScatgryFrmMap.has(remark.codeIoeFormId + '')) {
                        if (ioeFormMap.has(remark.codeIoeFormId)) {
                          let ioeForm = ioeFormMap.get(remark.codeIoeFormId);
                          if (!!ioeForm) {
                            let labByFrame = frameworkMap.get(ioeForm.labId);
                            let { formMap } = labByFrame;
                            let formByFrame = formMap.get(ioeForm.id);
                            let selectItemsMap = formByFrame['otherItemsMap'];
                            middlewareObj.infoTargetLabId = ioeForm.labId;
                            if (remarkMap.has(codeIoeRequestScatgryId)) {
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap, remark);
                              let expressIoeByRemark=checkedExpressIoeMap.get(remark.codeIoeRequestScatgryId);
                              let scatgryHxDtoByRemark = this.getListByCheckedExpressObj(expressIoeByRemark, basicInfo);
                              ioeRequestScatgryHxDtoItems.push(cloneDeep(scatgryHxDtoByRemark));
                            } else {
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                            }
                          }
                        }
                      }else{
                        for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
                          let form = ioeFormMap.get(parseInt(key));
                          if (form !== undefined) {
                            middlewareObj.codeIoeFormId = parseInt(key);
                            middlewareObj.formShortName = form.formShortName;
                            if (ioeFormMap.has(parseInt(key))) {
                              let ioeForm = ioeFormMap.get(parseInt(key));
                              if (!!ioeForm) {
                                let labByFrame = frameworkMap.get(ioeForm.labId);
                                let { formMap } = labByFrame;
                                let formByFrame = formMap.get(ioeForm.id);
                                let selectItemsMap = formByFrame['otherItemsMap'];
                                middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                              }
                            }
                          }
                        }
                      }
                    }
                  }else {
                      for (let [key, item] of codeIoeRequestScatgryFrmMap.entries()) {
                        let form = ioeFormMap.get(parseInt(key));
                        if (form !== undefined) {
                          middlewareObj.codeIoeFormId = parseInt(key);
                          middlewareObj.formShortName = form.formShortName;
                          if (ioeFormMap.has(parseInt(key))) {
                            let ioeForm = ioeFormMap.get(parseInt(key));
                            if (!!ioeForm) {
                              let labByFrame = frameworkMap.get(ioeForm.labId);
                              let { formMap } = labByFrame;
                              let formByFrame = formMap.get(ioeForm.id);
                              let selectItemsMap = formByFrame['otherItemsMap'];
                              middlewareObj.otherValMap = this.convertToOtherValMap(selectItemsMap);
                            }
                          }
                        }
                      }
                    }
                  middlewareObj.questionValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'questionItemsMap');
                  middlewareObj.specimenValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'specimenItemsMap');
                  middlewareObj.testValMap = this.getMapItemByCodeIoeFormItemId(key, item, 'testItemsMap');
                  middlewareObj.ioeRequestScatgryHxDtoItems = ioeRequestScatgryHxDtoItems;
                  let obj = utils.initTemporaryStorageObjForExpressIoe(middlewareObj, basicInfo, form.labId, orderType);
                  obj.isSeparateFrm = items.isSeparateFrm;
                  let timestamp = new Date().valueOf();
                  newExpressIoeMap.set(`${key}_${timestamp}`, obj);
                  let content = `Is Urgent: ${basicInfo.urgentIsChecked ? 'Yes' : 'No'};`;
                  content += `Quantity: ${orderNumber}; Specimen: ${middlewareObj.formShortName} (${middlewareObj.infoTargetLabId});`;
                  if (middlewareObj.testValMap.size > 0) {
                    content += ' Test: ';
                    for (const value of middlewareObj.testValMap.values()) {
                      if (value.isChecked) {
                        content += `${value.frmItemName} (${value.codeIoeFormItemId});`;
                      }
                    }
                  }
                  if (middlewareObj.specimenValMap.size > 0) {
                    content += ' Specimen: ';
                    for (const value of middlewareObj.specimenValMap.values()) {
                      if (value.isChecked) {
                        content += `${value.frmItemName} (${value.codeIoeFormItemId});`;
                      }
                    }
                  }
                  insertIxRequestLog && insertIxRequestLog('Action: Click \'→\' (Add Order) button', '', content);
                  middlewareObj.codeIoeFormId=null;
                  utils.resetMiddlewareObject(middlewareObj);
                  basicInfo.checkedExpressIoeMap = new Map();
                  updateState && updateState({
                    isEdit: true,
                    selectedOrderKey: null,
                    orderIsEdit: false,
                    temporaryStorageMap,
                    expressIoeMap: cloneDeep(resetexpressIoeMap),
                    middlewareObject: middlewareObj,
                    basicInfo
                  });
                  this.setState({ checkedExpressIoeMap: new Map() });
                  updateStateWithoutStatus && updateStateWithoutStatus({
                    selectionAreaIsEdit: false
                  });
                }
              }
            }
          }
        }
        let newCheckedExpressIoeMap = new Map();
        for (let [key, item] of this.getNewCheckedExpressIoeMap(newExpressIoeMap).entries()) {
          for (let i = 0; i < orderNumber; i++) {
            newCheckedExpressIoeMap.set(key + '_' + i, item);
          }
        }

        let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
        let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
        let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
        let tempMap = new Map([...temporaryStorageMap, ...newCheckedExpressIoeMap]);
        temporaryStorageMap = tempMap;
        updateState && updateState({
          temporaryStorageMap: tempMap,
          outputFormIsChecked: artificialChecked ? false : outputFormIsChecked,
          reminderIsChecked: artificialChecked ? false : reminderIsChecked,
          lableIsChecked: artificialChecked ? false : lableIsChecked,
          btnSwith: artificialChecked ? false : outputFormIsChecked || reminderIsChecked || lableIsChecked
        });
        this.props.verifyPrintStatusAfterAddOrder(temporaryStorageMap);
        handleResetOrderNumber && handleResetOrderNumber();
        EventEmitter.emit('ix_request_add_order');
      } else {
        openCommonMessage && openCommonMessage({ msgCode: IX_REQUEST_CODE.TEST_NOT_SELECTED });
      }
    } else {
      updateStateWithoutStatus && updateStateWithoutStatus({
        diagnosisErrorFlag: diagnosisEmptyFlag
      });
    }
    let stopFlag = false;
    if (diagnosisEmptyFlag) {
      let { resetHeight } = this.props;
      updateStateWithoutStatus && updateStateWithoutStatus({
        diagnosisErrorFlag: diagnosisEmptyFlag
      });
      resetHeight && resetHeight();
      stopFlag = false;
    } else {
      updateStateWithoutStatus && updateStateWithoutStatus({
        diagnosisErrorFlag: false
      });
      stopFlag = true;
    }
    if (closeDialog) {
      return { stopFlag };
    }
  }

  getNewCheckedExpressIoeMap = (checkedExpressIoeMap) => {
    let map = new Map();
    let tempMap = new Map();
    let mergeMap = new Map();
    let exsitArr = [];
    //get isSeparateFrm = 0 data
    for (let [key, item] of checkedExpressIoeMap.entries()) {
      if (item.isSeparateFrm === 0) {
        tempMap.set(key, item);
      } else {
        map.set(key, item);
      }
    }
    //merge one order
    for (let [key, item] of tempMap.entries()) {
      if (exsitArr.indexOf(key) == -1) {
        exsitArr.push(key);
        mergeMap.set(key, item);
        for (let [k, i] of tempMap.entries()) {
          if (key != k && item.codeIoeFormId === i.codeIoeFormId &&
            !this.specimenIsDifference(item.specimenItemsMap, i.specimenItemsMap)) {
            exsitArr.push(k);
            mergeMap.set(k, i);
          }
        }
        //has mergemap data
        if (mergeMap.size > 1) {
          let mapObj = this.integerMergeMap(mergeMap);
          map.set(mapObj.tempkey, mapObj.tempItem);
        } else {
          map.set(key, item);
        }
        mergeMap = new Map();
      }
    }

    //sort by Map
    map = this.sortByMap(checkedExpressIoeMap, map);
    return map;
  }

  integerMergeMap = (mergeMap) => {
    let map = new Map();
    let otherItemsMap = new Map();
    let testItemsMap = new Map();
    let specimenItemsMap = new Map();
    let questionItemsMap = new Map();
    let ioeRequestScatgryHxDtoItems = [];
    let ioeRequestScatgryHxDtoItemsMap = new Map();
    let tempkey = '';
    let tempItem = null;
    let { frameworkMap } = this.props;
    for (let [key, item] of mergeMap.entries()) {
      tempkey = tempkey === '' ? key : tempkey;
      map.size === 0 ? map.set(key, item) : null;
      otherItemsMap = this.loopMap(otherItemsMap, item.otherItemsMap);
      testItemsMap = this.loopMap(testItemsMap, item.testItemsMap, 'other');
      specimenItemsMap = this.loopMap(specimenItemsMap, item.specimenItemsMap);
      questionItemsMap = this.loopMap(questionItemsMap, item.questionItemsMap, 'question');
      ioeRequestScatgryHxDtoItemsMap = this.loopList(ioeRequestScatgryHxDtoItemsMap, item.ioeRequestScatgryHxDtoItems);
    }
    ioeRequestScatgryHxDtoItems=[...ioeRequestScatgryHxDtoItemsMap.values()];
    tempItem = map.get(tempkey);
    //sort by map
    let formObj = frameworkMap.has(tempItem.labId) ? frameworkMap.get(tempItem.labId).formMap.get(tempItem.codeIoeFormId) : null;
    let valObj = utils.initMiddlewareObject(formObj);
    map.get(tempkey).otherItemsMap = this.sortByMap(valObj.otherValMap, otherItemsMap);
    map.get(tempkey).testItemsMap = this.sortByMap(valObj.testValMap, testItemsMap);
    map.get(tempkey).specimenItemsMap = this.sortByMap(valObj.specimenValMap, specimenItemsMap);
    map.get(tempkey).questionItemsMap = this.sortByMap(valObj.questionValMap, questionItemsMap);
    map.get(tempkey).questionItemsMap = this.fastingQuestionOnly(map.get(tempkey).questionItemsMap);
    map.get(tempkey).ioeRequestScatgryHxDtoItems = ioeRequestScatgryHxDtoItems;

    return { tempkey, tempItem };
  }

  loopList = (currentMap, list) => {
    if (list && list.length > 0) {
      for (let item of list) {
        if (!currentMap.has(item.ioeRequestScatgryId)) {
          currentMap.set(item.ioeRequestScatgryId, item);
        }
      }
    }
    return currentMap;
  }

  loopMap = (currentMap, map, name) => {
    if (map && map.size > 0) {
      for (let [key, item] of map.entries()) {
        if (!currentMap.has(key)) {
          currentMap.set(key, item);
        } else {
          if (name === 'other' || name === 'question') {
            let currentItem = currentMap.get(key);
            currentItem.itemVal = this.getNewTestVal('frmItemTypeCd', 'itemVal', currentItem, item);
            currentItem.itemVal2 = this.getNewTestVal('frmItemTypeCd2', 'itemVal2', currentItem, item);
          }
        }
      }
    }
    return currentMap;
  }

  getNewTestVal = (frmItemTypeCdName, itemValName, currentItem, item) => {
    let value = currentItem[itemValName];
    if (currentItem[frmItemTypeCdName] === 'IB') {
      value = currentItem[itemValName]
        ? (currentItem[itemValName] + (item[itemValName] ? ',' + item[itemValName] : ''))
        : (item[itemValName] ? item[itemValName] : '');
    }
    return value;
  }

  sortByMap = (checkedExpressIoeMap, map) => {
    let sortByMap = new Map();
    for (let [key, item] of checkedExpressIoeMap.entries()) {
      for (let [k, item] of map.entries()) {
        if (key === k) {
          sortByMap.set(k, item);
        }
      }
    }
    return sortByMap;
  }

  fastingQuestionOnly = (map) => {
    //When grouping request, if both Fasting (CODE_IOE_FORM_ITEM_ID = 488) and Spot (CODE_IOE_FORM_ITEM_ID = 489) exist, only add Fasting (CODE_IOE_FORM_ITEM_ID = 488) to the request
    if (map.has(488) && map.has(489)) {
      map.delete(489);
    }
    return map;
  }

  specimenIsDifference = (specimenItemsMap, compareSpecimenItemsMap) => {
    let flag = false;
    let times = 0;
    if (specimenItemsMap.size != compareSpecimenItemsMap.size) {
      flag = true;
    } else {
      for (let [key, item] of specimenItemsMap.entries()) {
        for (let [k, i] of compareSpecimenItemsMap.entries()) {
          if (key === k) {
            if (item.itemVal !== i.itemVal || item.itemVal2 !== i.itemVal2) {
              // return true;
              flag = true;
            }
            times++;
          }
        }
      }
    }
    if (!flag) {
      let maxTimes = specimenItemsMap.size > compareSpecimenItemsMap.size ? specimenItemsMap.size : compareSpecimenItemsMap.size;
      flag = maxTimes === times ? false : true;
    }
    return flag;
  }
  convertToOtherValMap = (selectItemsMap, psalObj) => {
    let newMap = new Map();
    let array = selectItemsMap.get('otherItems');
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      element.version = null;
      if (element.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark && element.frmItemName === constants.REMARK_ITEM_NAME && !!psalObj) {
        element.itemVal = psalObj.defaultValue;
      }
      newMap.set(element.codeIoeFormItemId, element);
    }
    return newMap;
  }

  getListByCheckedExpressObj = (items, basicInfo, inputOrder) => {
    let { loginClinicCd } = this.props;
    let {
      categoryId,
      categoryName,
      codeIoeRequestScatgryId,
      codeIoeRequestScatgryName,
      detlLbl,
      isDetl,
      codeIoeRequestScatgryFrmMap
    } = items;
    let isFieldCount = 0;
    let ioeRequestDetl = '';
    if (parseInt(isDetl) === 0) {
      ioeRequestDetl = codeIoeRequestScatgryName;
    } else {
      if (parseInt(isDetl) === 1) {
        codeIoeRequestScatgryFrmMap.forEach(valArray => {
          for (let index = 0; index < valArray.length; index++) {
            let valObj = valArray[index];
            if (!isUndefined(valObj.isInputField) && valObj.isInputField != null && valObj.isInputField != 0) {
              isFieldCount++;
            }
          }
        });
        if (isFieldCount === 1) {
          if (inputOrder) {
            ioeRequestDetl = `${codeIoeRequestScatgryName} - ${inputOrder.text}`;
          } else {
            return false;
          }
        } else {
          ioeRequestDetl = `${codeIoeRequestScatgryName} - `;
          inputOrder && inputOrder.arrayList && inputOrder.arrayList.forEach((item, index) => {
            if ((index + 1) !== inputOrder.arrayList.length) {
              ioeRequestDetl += `${detlLbl}:${inputOrder[item.codeIoeFormItemId]};`;
            } else {
              ioeRequestDetl += ` ${detlLbl}:${inputOrder[item.codeIoeFormItemId]}`;
            }
          });
        }
      }
    }
    let tempObj = {
      catgryName: categoryName,
      ioeRequestDetl: util.cutOutString(ioeRequestDetl, 500),
      ioeRequestScatgryId: codeIoeRequestScatgryId,
      operationType: COMMON_ACTION_TYPE.INSERT,
      clinicCd: loginClinicCd,
      encounterId: basicInfo.encounterId,
      patientKey: basicInfo.patientKey,
      serviceCd: basicInfo.serviceCd,
      createdBy: basicInfo.createdBy,
      createdDtm: basicInfo.createdDtm,
      updatedBy: basicInfo.updatedBy,
      updatedDtm: basicInfo.updatedDtm,
      ioeRequestId: basicInfo.ioeRequestId,
      version: basicInfo.version
    };
    return tempObj;
  }

  getMapItemByCodeIoeFormItemId = (key, items, mapName, inputOrder) => {
    let { frameworkMap, ioeFormMap } = this.props;
    let otherMap = new Map();
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (ioeFormMap.has(parseInt(key))) {
        let form = ioeFormMap.get(parseInt(key));
        if (!!form) {
          let labByFrame = frameworkMap.get(form.labId);
          let { formMap } = labByFrame;
          let formByFrame = formMap.get(form.id);
          let selectItemsMap = formByFrame[mapName];
          for (let [key, itemList] of selectItemsMap.entries()) {
            let valObj = itemList.find((obj) => { return parseInt(obj.codeIoeFormItemId) === parseInt(element.codeIoeFormItemId); });
            if (valObj != undefined) {
              valObj.isChecked = true;
              valObj.operationType = COMMON_ACTION_TYPE.INSERT;
              if (inputOrder && inputOrder.text) {
                if (element.isInputField === 1 && !!inputOrder) {
                  valObj.itemVal = inputOrder.text;
                }
              } else {
                if (element.isInputField === 1 && !!inputOrder && inputOrder[valObj.codeIoeFormItemId]) {
                  valObj.itemVal = inputOrder[valObj.codeIoeFormItemId];
                }
              }
              if (element.isDefaultValue === 1) {
                valObj.itemVal = element.defaultValue;
                valObj.itemVal2 = element.defaultValue2;
              }
              otherMap.set(valObj.codeIoeFormItemId, valObj);
            }
          }
        }
      }
    }
    return otherMap;
  }

  updateExpressIoeContainerState = (obj) => {
    this.setState({
      ...obj
    });
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
      wrapperHeight,
      expressIoeMap,
      ioeContainerHeight,
      updateGroupingContainerState
    } = this.props;
    let { open, containerHeight, checkedExpressIoeMap } = this.state;
    let testSpecimenContainerHeight = undefined;
    if (this.tabRef && this.tabRef.current) {
      testSpecimenContainerHeight = containerHeight - this.tabRef.current.clientHeight;
    }

    let testContainerProps = {
      parentRef: this.tabRef.current,
      wrapperHeight: testSpecimenContainerHeight,
      selectedLabId,
      selectedFormId: selectedSubTabId,
      dropdownMap,
      frameworkMap,
      middlewareObject,
      ioeFormMap,
      openCommonMessage,
      updateState,
      updateStateWithoutStatus,
      updateExpressIoeContainerState: this.updateExpressIoeContainerState,
      checkedExpressIoeMap,
      expressIoeMap,
      ioeContainerHeight,
      updateGroupingContainerState,
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
          />
        </AppBar>
        <Drawer
            style={{ height: wrapperHeight ? wrapperHeight - 10 : undefined }}
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
          <List className={classes.listRoot} style={{ color: 'white' }}>
            {this.generateDrawerList()}
          </List>
        </Drawer>
        {/* list content */}
        <div
            style={{ height: containerHeight }}
            className={classNames(classes.content, {
            [classes.contentOpen]: open
          })}
        >
          {/* content */}
          <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
          >
            <Grid item xs={12} classes={{ 'grid-xs-12': classes.fullWrapper }}>
              <ExpressIoeContainer {...testContainerProps} displayHeader />
            </Grid>
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
                    className={classes.fab}
                    onClick={() => { this.handleAddOrderWithInfo(); }}
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

export default withStyles(styles)(ExpressIoeTemplateContainer);