import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './OrderContainerStyle';
import { Typography, Card, CardContent, Grid, Fab, Tooltip } from '@material-ui/core';
import { Delete, PriorityHighRounded, Edit } from '@material-ui/icons';
import { isNull, cloneDeep, find } from 'lodash';
import * as utils from '../../utils/ixUtils';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import { COMMON_ACTION_TYPE } from '../../../../../../constants/common/commonConstants';
import RequestOrderEditDialog from '../../RequestOrderEditDialog/RequestOrderEditDialog';
import EventEmitter from '../../../../../../utilities/josCommonUtilties';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import _ from 'lodash';
import DeleteOrderDialog from '../DeleteOrderDialog/DeleteOrderDialog';
import * as commonConstants from '../../../../../../constants/common/commonConstants';

class OrderContainer extends Component {
  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.bottomRef = React.createRef();
    this.state = {
      targetOrderKey: null,
      targetValObj: null,
      deleteDialogOpen: false,
      containerHeight: undefined,
      editDialogIsOpen: false,
      editMiddlewareObject: null,
      editOrderKey: null,
      editContentVals: null,
      editBasicInfo: null
    };
  }

  UNSAFE_componentWillMount() {
    EventEmitter.on('ix_request_add_order', this.handleScrollBottom);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.wrapperHeight && this.titleRef.current && this.titleRef.current.clientHeight !== 0) {
      let containerHeight = nextProps.wrapperHeight - this.titleRef.current.clientHeight - 20;
      if (containerHeight !== this.state.containerHeight) {
        this.setState({ containerHeight });
      }
    }
  }

  componentWillUnmount() {
    EventEmitter.remove('ix_request_add_order', this.handleScrollBottom);
  }

  handleScrollBottom = () => {
    _.delay(() => {
      if (this.bottomRef.current) {
        this.bottomRef.current.scrollTo({ top: this.bottomRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 300);
  }

  generateOrderItems = targetObj => {
    const { classes } = this.props;
    let items = [], displayVals = [], displayTests = [];  let displaySpecimenArray=[];
    //handle specimen
    let displaySpecimen = '';
    if (targetObj.specimenItemsMap.size > 0) {
      for (let valObj of targetObj.specimenItemsMap.values()) {
        if ((targetObj.isInvld === 1) || (targetObj.isInvld === 0 && valObj.operationType !== COMMON_ACTION_TYPE.DELETE)) {
          displaySpecimen = this.generateItemDisplayName(valObj);
          displaySpecimenArray.push(displaySpecimen);
        }
      }
      if(displaySpecimenArray.length>1){
          displaySpecimen = '';
          for (let index = 0; index < displaySpecimenArray.length; index++) {
            if(index+1===displaySpecimenArray.length){
                displaySpecimen += displaySpecimenArray[index];
            }else{
              displaySpecimen += displaySpecimenArray[index]+', ';
            }
          }
      }
    }

    //handle test
    if (targetObj.testItemsMap.size > 0) {
      for (let valObj of targetObj.testItemsMap.values()) {
        if ((targetObj.isInvld === 1) || (targetObj.isInvld === 0 && valObj.operationType !== COMMON_ACTION_TYPE.DELETE)) {
          let displayVal = '';
          let displayTest = this.generateItemDisplayName(valObj);
            if (displaySpecimen !== '') {
              displayVal = `${displaySpecimen}, ${displayTest}`;
            } else {
              displayVal = `${displayTest}`;
            }
            displayTests.push(displayVal);

        }
      }
    }

    if (displayTests.length > 0) {
      displayVals = cloneDeep(displayTests);
    } else {
      displayVals.push(displaySpecimen);
    }

    displayVals.forEach(item => {
      items.push(
        <Tooltip key={`${Math.random()}_order_item`} title={item} classes={{ tooltip: classes.tooltip }}>
          <Typography component="div" variant="caption" className={classes.itemTypography} noWrap>
            {targetObj.isInvld === 1 ? (
              <span><s>{item}</s></span>
            ) : (
              <span>{item}</span>
            )}
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
    let displayVal = valObj.itemName || '';
    let val1 = valObj.itemVal,
      val2 = valObj.itemVal2;
      try {
        if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
          val1 = utils.generateDropdownValue(dropdownMap, valObj, constants.ITEM_VALUE.TYPE1);
        }
        if (valObj.frmItemTypeCd2 === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
          val2 = utils.generateDropdownValue(dropdownMap, valObj, constants.ITEM_VALUE.TYPE2);
        }
      } catch (error) {
        console.log(error);
       return false;
      }
    if (!!val1 && !!val2) {
      displayVal = displayVal !== '' ? `${displayVal}: ${val1},${val2}` : `${val1},${val2}`;
    } else if (!isNull(val1) && val1 !== '' && val1 != undefined) {
      displayVal = displayVal !== '' ? `${displayVal}: ${val1}` : `${val1}`;
    } else if (!isNull(val2) && val2 !== '' && val2 != undefined) {
      displayVal = displayVal !== '' ? `${displayVal}: ${val2}` : `${val2}`;
    }
    return displayVal;
  }

  generateBasicInfoItemValContent = (valObj, labelName) => {
    const { clinicList } = this.props;
    let displayVal = '';
    if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.CLICK_BOX) {
      displayVal = `${valObj.itemName}`;
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      let targetOption = find(clinicList, option => {
        return option.clinicCd === valObj.itemVal;
      });
      if (!!targetOption) {
        displayVal = `${labelName}: ${targetOption.clinicName}`;
      }
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.INPUT_BOX) {
      displayVal = `${labelName}: ${valObj.itemVal}`;
    }
    return displayVal;
  }

  generateBasicInfoItemValContentNoTitle = (valObj) => {
    const { clinicList } = this.props;
    let displayVal = '';
    if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.CLICK_BOX) {
      displayVal = `${valObj.itemName}`;
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      let targetOption = find(clinicList, option => {
        return option.clinicCd === valObj.itemVal;
      });
      if (!!targetOption) {
        displayVal = ` ${targetOption.clinicName}`;
      }
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.INPUT_BOX) {
      displayVal = `${valObj.itemVal}`;
    }
    return displayVal;
  }

  generateBasicInfoTooltip = storeValObj => {
    const { classes, basicInfo, clinicList } = this.props;
    let { otherItemsMap } = storeValObj;
    let element = '';
    if (otherItemsMap.size > 0) {
      let requestingUnitDisplayName = '';
      let tempClinic = find(clinicList, clinic => {
        return basicInfo.requestingUnit === clinic.clinicCd;
      });
      if (!!tempClinic) {
        requestingUnitDisplayName = tempClinic.clinicName;
      }
      let items = [(
        <Typography key={`basic_info_item_request_by_${Math.random()}`} component="div" variant="caption">
          <span className={classes.tooltipItemTitleSpan}>Requested By:</span> <span className={classes.tooltipItemSpan}>{storeValObj.requestUser}</span>
        </Typography>
      ), (
        <Typography key={`basic_info_item_request_unit_${Math.random()}`} component="div" variant="caption">
          <span className={classes.tooltipItemTitleSpan}>Requested Unit:</span> <span className={classes.tooltipItemSpan}>{requestingUnitDisplayName}</span>
        </Typography>
      )];
      for (let [itemId, valObj] of otherItemsMap) {
        let displayVal = '';
        if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Urgent
          && (valObj.operationType === COMMON_ACTION_TYPE.INSERT
            || valObj.operationType === COMMON_ACTION_TYPE.UPDATE
            || (!isNull(valObj.version) && isNull(valObj.operationType)))
        ) {
          displayVal = this.generateBasicInfoItemValContent(valObj);
          let tempArray = [(
            <Typography key={`${itemId}_info_item`} component="div" variant="caption">
              <span className={classes.tooltipItemSpan}>{displayVal}</span>
            </Typography>
          )];
          items = _.concat(tempArray, items);
        } else if (!isNull(valObj.itemVal) && valObj.itemVal !== '') {
          let labelName = '';
          if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
            labelName = 'Clinic Ref. No.';
          } else if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
            labelName = 'Clinical Summary & Diagnosis';
          } else if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo) {
            labelName = 'Report To';
          } else if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark && valObj.itemName === constants.REMARK_ITEM_NAME) {
            labelName = 'Remark';
          } else if (valObj.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction && valObj.itemName === constants.INSTRUCTION_ITEM_NAME) {
            labelName = 'Instruction';
          }
          displayVal = this.generateBasicInfoItemValContentNoTitle(valObj);
          items.push(
            <Typography key={`${itemId}_info_item`} component="div" variant="caption">
              <span className={classes.tooltipItemTitleSpan}>{`${labelName}:`}</span> <span className={classes.tooltipItemSpan}>{displayVal}</span>
            </Typography>
          );
        }
      }
      if (items.length > 0) {
        element = (
          <div>
            {items}
          </div>
        );
      }
    }
    return element;
  }

  generateQuestionItemValContent = (valObj) => {
    const { dropdownMap } = this.props;
    let displayVal = '';
    if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.CLICK_BOX) {
      displayVal = `- ${valObj.itemName}`;
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      let options = dropdownMap.get(valObj.codeIoeFormItemId).get(constants.ITEM_VALUE.TYPE1);
      let targetOption = find(options, option => {
        return option.codeIoeFormItemDropId === valObj.itemVal;
      });
      let targetOptionValue = targetOption ? targetOption.value : '';
      displayVal = !!valObj.itemName ? `- ${valObj.itemName}: ${targetOptionValue}` : `- ${targetOptionValue}`;
    } else if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.INPUT_BOX) {
      displayVal = !!valObj.itemName ? `- ${valObj.itemName}: ${valObj.itemVal}` : `- ${valObj.itemVal}`;
    }
    return displayVal;
  }

  generateQuestionTooltip = (valMap, orderKey) => {
    const { classes, frameworkMap, temporaryStorageMap } = this.props;
    let element = '';
    if (valMap.size > 0) {
      let valObj = temporaryStorageMap.get(orderKey);
      let { labId, codeIoeFormId } = valObj;
      let { questionItemsMap } = frameworkMap.get(labId).formMap.get(codeIoeFormId);
      let items = [];
      for (let [groupName, frameworkObjs] of questionItemsMap) {
        let contents = [(
          <Typography key={`${groupName}_info_item`} component="div" variant="caption">
            <span className={classes.tooltipItemSpan}>{groupName}</span>
          </Typography>
        )];
        frameworkObjs.forEach(frameworkObj => {
          let tempValObj = valMap.has(frameworkObj.codeIoeFormItemId) ? valMap.get(frameworkObj.codeIoeFormItemId) : null;
          if (!!tempValObj && tempValObj.operationType !== COMMON_ACTION_TYPE.DELETE) {
            let displayVal = this.generateQuestionItemValContent(tempValObj);
            contents.push(
              <Typography key={`${frameworkObj.codeIoeFormItemId}_info_item`} component="div" variant="caption">
                <span className={classes.tooltipItemSpan}>{displayVal}</span>
              </Typography>
            );
          }
        });
        if (contents.length > 1) {
          items = items.concat(contents);
        }
      }
      if (items.length > 0) {
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
    const { deletedStorageMap, temporaryStorageMap, updateStateWithoutStatus, insertIxRequestLog,serviceSpecificFunctionInfo } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let content = `Code IOE Form ID: ${valObj.codeIoeFormId}; Specimen: ${valObj.formShortName} (${valObj.labId}}); Test: `;
      if (valObj.specimenItemsMap.size > 0) {
        for (const value of valObj.specimenItemsMap.values()) {
          content += `${value.itemName} (${value.ioeRequestItemId});`;
        }
      }
      if (valObj.testItemsMap.size > 0) {
        for (const value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.codeIoeFormItemId});`;
        }
      }
      insertIxRequestLog(`Action: Click 'Delete' button in Added Order (IOE Request ID: ${valObj.codeIoeFormId})`, '', content);

      let tempValObj = cloneDeep(temporaryStorageMap.get(orderKey));
      tempValObj = utils.handleDeletedStorageObj(tempValObj);
      if (tempValObj.version) {
        this.setState({
          targetValObj: tempValObj,
          targetOrderKey: orderKey,
          deleteDialogOpen: true
        });
      } else {
        temporaryStorageMap.delete(orderKey);
        if (tempValObj.version) {
          deletedStorageMap.set(orderKey, tempValObj);
        }
        let orders = [...temporaryStorageMap.values()];
        let availableOrderIndex = _.findIndex(orders, orderObj => (orderObj.ioeRequestNumber!==null && orderObj.isInvld != 1)||orderObj.ioeRequestNumber === 0 );
        let checkedResult = _.findIndex(orders, orderObj => (orderObj.isInvld != 1 && orderObj.specimenCollected != 1));

        if(checkedResult===-1){
          let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
          let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
          let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
          updateStateWithoutStatus&&updateStateWithoutStatus({
            isEdit:this.setEditStatus(temporaryStorageMap,deletedStorageMap),
            orderIsEdit:false,
            selectedOrderKey: null,
            temporaryStorageMap,
            deletedStorageMap,
            disabledFlag: availableOrderIndex === -1,
            // Test
            reminderIsChecked,
            lableIsChecked,
            outputFormIsChecked,
            btnSwith: false,
            artificialChecked:false
          });
        }else{
          updateStateWithoutStatus&&updateStateWithoutStatus({
            isEdit:this.setEditStatus(temporaryStorageMap,deletedStorageMap),
            orderIsEdit:false,
            selectedOrderKey: null,
            temporaryStorageMap,
            deletedStorageMap,
            disabledFlag: availableOrderIndex === -1 && checkedResult === -1
          });
        }
      }
    }
  }

  setEditStatus = (temporaryStorageMap, deletedStorageMap) => {
    let isEditOrigin = false,
      isEditDeleted = deletedStorageMap.size > 0 ? true : false;

    for (let valueObj of temporaryStorageMap.values()) {
      if (valueObj.operationType) {
        isEditOrigin = true;
        break;
      }
    }
    return isEditOrigin || isEditDeleted;
  }

  handleEditOrder = orderKey => {
    const { frameworkMap, temporaryStorageMap, basicInfo, insertIxRequestLog } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let storageInfoObj = utils.generateBasicInfoByEdit(valObj);
      let targetFormId = valObj.codeIoeFormId;
      let targetLabId = valObj.labId;
      let formObj = frameworkMap.get(targetLabId).formMap.get(targetFormId);
      let middlewareObject = utils.initMiddlewareObject(formObj, valObj);
      middlewareObject.backupQuestionValMap = cloneDeep(middlewareObject.questionValMap);
      let tempInfoObj = utils.getBasicInfo(middlewareObject.otherValMap);

      let content = `Code IOE Form ID: ${targetFormId}; Specimen: ${valObj.formShortName} (${targetLabId}); Test: `;
      if (valObj.specimenItemsMap.size > 0) {
        for (const value of valObj.specimenItemsMap.values()) {
          content += `${value.itemName} (${value.ioeRequestItemId});`;
        }
      }
      if (valObj.testItemsMap.size > 0) {
        for (const value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.ioeRequestItemId});`;
        }
      }
      let requestId = valObj.ioeRequestId === 0 ? null : valObj.ioeRequestId;
      insertIxRequestLog(`Action: Click 'Edit' button in Added Order (IOE Request ID: ${requestId})`, '', content);

      //filter
      let { specimenValMap, testValMap } = middlewareObject;
      let specimenFlag = false, specimenItemId = null, testFlag = false, testItemId = null;
      for (let tempValObj of specimenValMap.values()) {
        if (tempValObj.isChecked) {
          specimenItemId = tempValObj.codeIoeFormItemId;
          specimenFlag = true;
          break;
        }
      }

      for (let tempValObj of testValMap.values()) {
        if (tempValObj.isChecked) {
          testItemId = tempValObj.codeIoeFormItemId;
          testFlag = true;
          break;
        }
      }

      this.setState({
        editDialogIsOpen: true,
        editMiddlewareObject: middlewareObject,
        editOrderKey: orderKey,
        editContentVals: {
          labId: targetLabId,
          selectedSubTabId: targetFormId,
          infoTargetLabId: targetLabId,
          infoTargetFormId: targetFormId
        },
        editBasicInfo: {
          ...basicInfo,
          ...storageInfoObj,
          ...tempInfoObj,
          orderType: constants.PRIVILEGES_DOCTOR_TABS[0].value,
          infoOrderType: constants.PRIVILEGES_DOCTOR_TABS[0].value
        }
      });
      if (specimenFlag) {
        _.delay(() => {
          EventEmitter.emit('ix_request_edit_dialog_specimen_scroll', { labId: targetLabId, formId: targetFormId, itemId: specimenItemId });
        }, 1000);
      }
      if (testFlag) {
        _.delay(() => {
          EventEmitter.emit('ix_request_edit_dialog_test_scroll', { labId: targetLabId, formId: targetFormId, itemId: testItemId });
        }, 2000);
      }
    }
  }

  handleEditQuestion = orderKey => {
    const { frameworkMap, temporaryStorageMap, updateStateWithoutStatus, updateGroupingContainerState, contentVals, basicInfo, insertIxRequestLog } = this.props;
    if (temporaryStorageMap.has(orderKey)) {
      let valObj = temporaryStorageMap.get(orderKey);
      let targetFormId = valObj.codeIoeFormId;
      let targetLabId = valObj.labId;
      let formObj = frameworkMap.get(targetLabId).formMap.get(targetFormId);
      let middlewareObject = utils.initMiddlewareObject(formObj, valObj);
      middlewareObject.backupQuestionValMap = cloneDeep(middlewareObject.questionValMap);

      let content = `Code IOE Form ID: ${targetFormId}; Specimen: ${valObj.formShortName} (${targetLabId}); Test: `;
      if (valObj.specimenItemsMap.size > 0) {
        for (const value of valObj.specimenItemsMap.values()) {
          content += `${value.itemName} (${value.ioeRequestItemId});`;
        }
      }
      if (valObj.testItemsMap.size > 0) {
        for (const value of valObj.testItemsMap.values()) {
          content += `${value.itemName} (${value.ioeRequestItemId});`;
        }
      }
      insertIxRequestLog && insertIxRequestLog(`Action: Click 'i' (Information) button in Added Order (IOE Request ID: ${valObj.ioeRequestId})`, '', content);

      updateStateWithoutStatus && updateStateWithoutStatus({
        orderIsEdit: true,
        selectedOrderKey: orderKey,
        questionEditMode: true,
        questionEditMiddlewareObject: middlewareObject,
        // middlewareObject,
        basicInfo: {
          ...basicInfo,
          infoOrderType: constants.PRIVILEGES_DOCTOR_TABS[0].value
        },
        contentVals: {
          ...contentVals,
          infoTargetLabId: targetLabId,
          infoTargetFormId: targetFormId
        }
      });
      updateGroupingContainerState && updateGroupingContainerState({
        otherDialogIsOpen: true,
        isCanDisabled:basicInfo.isShowEditButton
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
    const { classes, temporaryStorageMap, basicInfo } = this.props;
    let orderCards = [];
    let { codeIoeRequestTypeCd, privilegeInvalidate,isShowEditButton } = basicInfo;
    if (temporaryStorageMap.size > 0) {
      console.log('temporaryStorageMap', temporaryStorageMap);
      for (let [orderKey, valObj] of temporaryStorageMap) {
        let { labId, formShortName, specimenCollected, isInvld, isReportReturned, codeIoeRequestTypeCd: itemCodeIoeRequestTypeCd } = valObj;
        let content = this.generateOrderItems(valObj);
        let questionTitle = this.generateQuestionTooltip(valObj.questionItemsMap, orderKey);
        let basicInfoTitle = this.generateBasicInfoTooltip(valObj);
        let privilegeDeleteOrder = false;
        if (itemCodeIoeRequestTypeCd === constants.IOE_REQUEST_TYPE.DOCTOR && privilegeInvalidate && privilegeInvalidate.doctor) {
          privilegeDeleteOrder = true;
        } else if (itemCodeIoeRequestTypeCd === constants.IOE_REQUEST_TYPE.NURSE && privilegeInvalidate && privilegeInvalidate.nurse) {
          privilegeDeleteOrder = true;
        }
        orderCards.push(
          <Card key={`${orderKey}_${valObj.codeIoeFormId}`} className={classes.card}>
            <Tooltip title={`${labId}, ${formShortName}`} classes={{ tooltip: classes.tooltip }}>
              <Typography component="div" noWrap className={classes.cardHeader} classes={{ noWrap: classes.orderTitle }}>
                <span className={classes.orderTitle}>{`${labId}, ${formShortName}`}</span>
              </Typography>
            </Tooltip>
            <CardContent classes={{ root: classes.cardContent }}>
              <Grid container>
                <Grid item xs={12}>
                  <div style={{
                    textDecorationLine: (isInvld === 1 || specimenCollected === 1) ? 'none' :
                      (isInvld === 1 ? 'line-through' : 'none')
                  }}
                  >{content}
                  </div>
                </Grid>
                <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    spacing={1}
                    style={{ margin: 'auto' }}
                >
                  <Grid item style={{ padding: 'unset' }}>
                    {/* <span className={specimenCollected===1?classes.statusSubmitted:(isInvld===1?classes.statusInvalidated:(isReportReturned==='Y'?classes.statusReportReturned:''))}>{specimenCollected===1?'Submitted':(isInvld===1?'Deleted':(isReportReturned==='Y'?'Report Returned':''))}</span> */}
                    <span className={isInvld === 1 ? classes.statusInvalidated : (isReportReturned === 'Y' ? classes.statusReportReturned : (specimenCollected === 1 ? classes.statusSubmitted : ''))}>{isInvld === 1 ? 'Deleted' : (isReportReturned === 'Y' ? 'Report Returned' : (specimenCollected === 1 ? 'Submitted' : ''))}</span>
                  </Grid>
                  <Grid item style={{ padding: 'unset' }}>
                    {!!questionTitle ? (
                      <Tooltip title={questionTitle} classes={{ tooltip: classes.tooltip }}>
                        <div style={{ display: 'initial' }}>
                          <Fab
                              size="small"
                              color="primary"
                              aria-label="Question"
                              id={`btn_ix_request_question_${orderKey}`}
                              className={classes.primaryFab}
                              disabled={isInvld === 1 || specimenCollected === 1 || isReportReturned === 'Y' ? true : false}
                              onClick={() => { this.handleEditQuestion(orderKey); }}
                          >
                            <PriorityHighRounded style={{ transform: 'rotate(180deg)' }} />
                          </Fab>
                        </div>
                      </Tooltip>
                    ) : null}
                    {isShowEditButton?null: (
                      <Tooltip title={basicInfoTitle} classes={{ tooltip: classes.tooltip }}>
                        <div style={{ display: 'initial' }}>
                          <Fab
                              size="small"
                              color="primary"
                              aria-label="Edit Order"
                              id={`btn_ix_request_edit_order_${orderKey}`}
                              className={classes.primaryFab}
                              disabled={codeIoeRequestTypeCd === constants.IOE_REQUEST_TYPE.NURSE || isInvld === 1 || specimenCollected === 1 || isReportReturned === 'Y' ? true : false}
                              onClick={() => { this.handleEditOrder(orderKey); }}
                          >
                            <Edit />
                          </Fab>
                        </div>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Order" classes={{ tooltip: classes.tooltip }}>
                      <div style={{ display: 'initial' }}>
                        <Fab
                            size="small"
                            color="secondary"
                            aria-label="Delete Order"
                            id={`btn_ix_request_delete_order_${orderKey}`}
                            className={classes.deleteFab}
                          //disabled={isInvld===1||specimenCollected===1||isReportReturned==='Y'?true:false}
                            disabled={!privilegeDeleteOrder || isInvld === 1 || isReportReturned === 'Y' ? true : false}
                            onClick={() => { this.handleDeleteOrder(orderKey); }}
                        >
                          <Delete />
                        </Fab>
                      </div>
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

  handleEditDialogClose = () => {
    this.setState({
      editDialogIsOpen: false
    });
  }

  handleDeleteDialogConfirm = (reason) => {
    let { deletedStorageMap, temporaryStorageMap, updateStateWithoutStatus,insertIxRequestLog,serviceSpecificFunctionInfo } = this.props;
    let { targetOrderKey, targetValObj } = this.state;
    let reasonValue = _.trim(reason);
    let disabledFlag = false;
    targetValObj.isInvld = 1;
    targetValObj.invldReason = reasonValue === '' ? null : reasonValue;
    temporaryStorageMap.set(targetOrderKey, targetValObj);
    deletedStorageMap.set(targetOrderKey, targetValObj);
    disabledFlag = this.haveDeleteRecord(targetOrderKey, temporaryStorageMap);
    insertIxRequestLog && insertIxRequestLog('[Delete Request Order Dialog] Action: Click \'Confirm\' button', '');
    if (disabledFlag) {
      let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
      let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
      let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo,commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
      updateStateWithoutStatus && updateStateWithoutStatus({
        isEdit: true,
        orderIsEdit: false,
        selectedOrderKey: null,
        temporaryStorageMap,
        deletedStorageMap,
        disabledFlag,
        reminderIsChecked,
        lableIsChecked,
        outputFormIsChecked,
        btnSwith: false,
        artificialChecked: false
      });
    } else {
      updateStateWithoutStatus && updateStateWithoutStatus({
        isEdit: true,
        orderIsEdit: false,
        selectedOrderKey: null,
        temporaryStorageMap,
        deletedStorageMap,
        disabledFlag
      });
    }
    // this.handleDeleteDialogCancel();
    this.setState({ deleteDialogOpen: false });
  }

  haveDeleteRecord = (targetOrderKey, temporaryStorageMap) => {
    let flag = true;
    temporaryStorageMap.forEach((value, key) => {
      if (targetOrderKey != key) {
        let valWrapperObj = value;
        if (valWrapperObj.isInvld != 1 && valWrapperObj.specimenCollected != 1) {
          flag = false;
        }
      }
    });
    return flag;
  }

  handleDeleteDialogCancel = () => {
    const { insertIxRequestLog } = this.props;
    this.setState({
      deleteDialogOpen: false
    });
    insertIxRequestLog && insertIxRequestLog('[Delete Request Order Dialog] Action: Click \'Cancel\' button', '');
  }

  render() {
    const { classes, temporaryStorageMap, deletedStorageMap, editDeletedMap, ioeFormMap, updateState, insertIxRequestLog, officerInChargeRequestUser, officerInChargeRequestLoginName, basicInfo, ioeContainerHeight } = this.props;
    let { deleteDialogOpen, editMiddlewareObject, editDialogIsOpen, editOrderKey, editContentVals, editBasicInfo, containerHeight } = this.state;
    let editDialogProps = {
      isOpen: editDialogIsOpen,
      selectedOrderKey: editOrderKey,
      editMiddlewareObject,
      editContentVals,
      editBasicInfo,
      ioeFormMap,
      temporaryStorageMap,
      deletedStorageMap,
      editDeletedMap,
      updateState,
      insertIxRequestLog,
      officerInChargeRequestUser,
      officerInChargeRequestLoginName,
      codeIoeRequestTypeCd: basicInfo.codeIoeRequestTypeCd,
      handleEditDialogClose: this.handleEditDialogClose
    };

    let deleteOrderDialogProps = {
      isOpen: deleteDialogOpen,
      id: 'ix_request_delete_order_dialog',
      handleDeleteDialogConfirm: this.handleDeleteDialogConfirm,
      handleDeleteDialogCancel: this.handleDeleteDialogCancel
    };

    return (
      <div>
        <Typography
            ref={this.titleRef}
            component="div"
            variant="h6"
            classes={{ h6: classes.title }}
            className={classes.header}
        >
          <div>{commonUtils.getCurrentEncounterDesc('Y')}</div>
          Added Order(s), Total: {temporaryStorageMap.size > 0 ? temporaryStorageMap.size : 0}
        </Typography>
        {/* <div style={{ height: containerHeight }} className={classes.orderWrapper} ref={this.bottomRef}> */}
        <div style={{ height: ioeContainerHeight }} className={classes.orderWrapper} ref={this.bottomRef}>
          {this.generateOrders()}
          {/* <div ref={this.bottomRef} ></div> */}
        </div>
        <RequestOrderEditDialog {...editDialogProps} />
        <DeleteOrderDialog {...deleteOrderDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(OrderContainer);
