/*
 * Front-end UI for save/update IOE Service Profile Template Dialog
 * Load Lab Test Grouping Dialog Item Data Action: [ServiceProfileDialog.js] componentDidMount -> initFramework
 * -> [serviceProfileAction.js] getServiceProfileFrameworkList
 * -> [serviceProfileSaga.js] getServiceProfileFrameworkList
 * -> Backend API = /ioe/loadServiceProfileDatas
 * Load Lab Test Grouping Dialog Dropdown Item options Action: [ServiceProfileDialog.js] componentDidMount -> initFramework
 * -> [serviceProfileAction.js] getServiceProfildItemDropdownList
 * -> [serviceProfileSaga.js] getServiceProfildItemDropdownList
 * -> Backend API = /ioe/loadCodeIoeFormItemDrops
 * Save Action: [ServiceProfileDialog.js] Save -> handleSave
 * -> [serviceProfileAction.js] saveServiceProfileTemplate
 * -> [serviceProfileSaga.js] saveServiceProfileTemplate
 * -> Backend API = /ioe/saveServiceProfile
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './ServiceProfileDialogStyle';
import { withStyles, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography, Paper } from '@material-ui/core';
import CIMSButton from '../../../Buttons/CIMSButton';
import ContentContainer from './modules/ContentContainer/ContentContainer';
import BasicInfo from './modules/BasicInfo/BasicInfo';
import Draggable from 'react-draggable';
import { openCommonMessage, closeCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { trim, isEmpty, isNull, delay } from 'lodash';
import { getServiceProfileFrameworkList, getServiceProfildItemDropdownList, saveServiceProfileTemplate, getTemplateAllItemsForSearch, checkTemplateNameData } from '../../../../store/actions/IOE/serviceProfile/serviceProfileAction';
import * as ServiceProfileConstants from '../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import { COMMON_ACTION_TYPE } from '../../../../constants/common/commonConstants';
import * as utils from '../../Dialog/ServiceProfile/utils/dialogUtils';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import * as ixRequestUtils from '../../../../views/jos/IOE/ixRequest/utils/ixUtils';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e) => {
        return e.target.getAttribute('customdrag') === 'allowed';
      }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ServiceProfileDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectionAreaIsEdit: false,
      isEdit: false,
      temporaryStorageMap: new Map(),
      deletedStorageMap: new Map(),
      middlewareObject: {},
      infoEditMode: false,
      infoEditMiddlewareObject: null,
      searchIx: '',
      searchIsOpen: false,
      templateTypeCd: props.templateTypeCd,
      ioeTestTemplateId: null,
      templateNameErrorFlag: false,
      templateNameMessage: 'This field is required.',
      isNew: props.dialogIsCreateMode ? ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.YES : ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO,
      maxSeq: props.maxSeq || 0,
      maxVersion: props.maxVersion || null,
      templateName: '',
      isActive: props.dialogIsCreateMode ? true : false,
      externalVersion: null,
      currentUserId: props.userId || null,
      orderIsEdit: false,
      selectedOrderKey: null,
      orderNumber: ServiceProfileConstants.ORDER_NUMBER_OPTIONS[0].value
    };
  }

  componentDidMount() {
    this.initFramework();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.initData(nextProps);
  }

  initFramework = () => {
    // this.props.openCommonCircularDialog();
    // this.props.getServiceProfildItemDropdownList({});
    // this.props.getTemplateAllItemsForSearch({});
    // this.props.getServiceProfileFrameworkList({
    //   params:{},
    //   callback: () => {
    //     this.props.closeCommonCircularDialog();
    //   }
    // });
  }

  initData = nextProps => {
    let { isOpen, templateTypeCd, dialogIsCreateMode, dialogExtraProps, serviceProfileTemplate } = nextProps;
    if (isOpen) {
      let name = '',
        templateId = null,
        activeFlag = false,
        isNew = null,
        externalVersion = null,
        tempTemporaryStorageMap = new Map();
      if (dialogIsCreateMode) {
        // create mode
        activeFlag = true;
        isNew = ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.YES;
      } else {
        // edit mode
        isNew = ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO;
        if (!isEmpty(serviceProfileTemplate)) {
          let { version, ioeTestTemplateId, templateName, isActive, storageMap } = serviceProfileTemplate;
          templateId = ioeTestTemplateId;
          externalVersion = version;
          name = templateName;
          activeFlag = isActive === ServiceProfileConstants.TEMPLATE_ACTIVE_STATUS.ACTIVE ? true : false;
          tempTemporaryStorageMap = storageMap;
        }
      }
      this.setState({
        searchIsOpen: false,
        searchIx: '',
        templateName: name,
        isActive: activeFlag,
        ioeTestTemplateId: templateId,
        isNew,
        maxSeq: dialogExtraProps.maxSeq,
        maxVersion: dialogExtraProps.maxVersion,
        currentUserId: dialogExtraProps.userId,
        templateTypeCd,
        externalVersion,
        temporaryStorageMap: tempTemporaryStorageMap
      });
    }
  }

  handleOrderNumberChange = (orderNumber) => {
    this.setState({
      orderNumber: orderNumber
    });
  }

  updateStateWithoutStatus = obj => {
    this.setState({
      ...obj
    });
  }

  updateState = (obj) => {
    this.setState({
      selectionAreaIsEdit: true,
      isEdit: true,
      ...obj
    });
  }

  generateTestTmplListItem = (tmplList, itemMap) => {
    if (itemMap.size > 0) {
      for (let valObj of itemMap.values()) {
        if (isNull(valObj.version) &&
          (valObj.operationType === COMMON_ACTION_TYPE.UPDATE || valObj.operationType === COMMON_ACTION_TYPE.DELETE)) {
          continue;
        } else {
          tmplList.push({
            codeIoeFormId: valObj.codeIoeFormId,
            codeIoeFormItemId: valObj.codeIoeFormItemId,
            ioeTestTemplateId: valObj.ioeTestTemplateId,
            ioeTestTemplateItemId: valObj.ioeTestTemplateItemId,
            itemVal: valObj.itemVal,
            itemVal2: valObj.itemVal2,
            operationType: valObj.operationType,
            testGroup: valObj.testGroup,
            createdBy: valObj.createdBy,
            createdDtm: valObj.createdDtm,
            updatedBy: valObj.updatedBy,
            updatedDtm: valObj.updatedDtm,
            version: valObj.version
          });
        }
      }
    }
  }

  generateResultObj = () => {
    let {
      ioeTestTemplateId,
      templateName,
      isActive,
      templateTypeCd,
      isNew,
      maxSeq,
      maxVersion,
      externalVersion,
      currentUserId,
      temporaryStorageMap,
      deletedStorageMap
    } = this.state;

    let innerEditTemplateDto = {
      codeIoeTestTmplTypeCd: templateTypeCd,
      userId: currentUserId,
      ioeTestTemplateId,
      isActive: isActive ? ServiceProfileConstants.TEMPLATE_ACTIVE_STATUS.ACTIVE : ServiceProfileConstants.TEMPLATE_ACTIVE_STATUS.NOT_ACTIVE,
      isNew,
      maxSeq,
      maxVersion,
      templateName: templateName.trim(),
      version: externalVersion,
      testTmplList: []
    };
    //handle delete
    if (deletedStorageMap.size > 0) {
      for (let valWrapperObj of deletedStorageMap.values()) {
        let { testItemsMap, specimenItemsMap, infoItemsMap } = valWrapperObj;
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, testItemsMap);
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, specimenItemsMap);
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, infoItemsMap);
      }
    }
    //handle temporary
    if (temporaryStorageMap.size > 0) {
      for (let valWrapperObj of temporaryStorageMap.values()) {
        let { testItemsMap, specimenItemsMap, infoItemsMap } = valWrapperObj;
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, testItemsMap);
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, specimenItemsMap);
        this.generateTestTmplListItem(innerEditTemplateDto.testTmplList, infoItemsMap);
      }
    }
    return {
      favoriteType: templateTypeCd,
      innerEditTemplateDto
    };
  }

  handleSave = () => {
    console.log('tosave');
    const { handleDialogCancel, lab2FormMap, commonMessageList, insertIxProfileLog, dialogTitle } = this.props;
    let { templateName, middlewareObject, temporaryStorageMap } = this.state;
    let { testValMap, specimenValMap } = middlewareObject;
    let noCheckedBoxChecked = false;
    let validateMsgCode = utils.handleValidateItems(middlewareObject);
    // let msgCode = utils.handleValidateItemsIncludeTestAndSpecimen(middlewareObject);
    let defaultTabValue = null;
    let defaultFormValue = null;

    if (lab2FormMap.size > 0) {
      let i = 0;
      for (let [labId, formIds] of lab2FormMap) {
        defaultTabValue = labId;
        defaultFormValue = formIds[0];
        if (++i === 1) {
          break;
        }
      }
    }

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

    if (trim(templateName) === '') {
      this.setState({
        templateNameErrorFlag: true,
        templateNameMessage: 'This field is required.'
      });
    } else {
      if (noCheckedBoxChecked) {
        let payload = {
          msgCode: SERVICE_PROFILE_MAINTENANCE_CODE.IS_SAVE_CHANGE_ORDER,
          btn1AutoClose: false,
          btnActions: {
            btn1Click: () => {
              let lipidProfileFlag = ixRequestUtils.checkLipidProfileIsCheck(middlewareObject);
              validateMsgCode = validateMsgCode === '' && !lipidProfileFlag ? IX_REQUEST_CODE.LIPIDPROFILE_SELECTED_AND_CHOLESTEROLLDL_UNSELECTED : validateMsgCode;
              if (validateMsgCode === '') {
                for (let i = 0; i < this.state.orderNumber; i++) {
                  let currentTestGroup = temporaryStorageMap.size + 1;
                  let obj = utils.initTemporaryStorageObj(middlewareObject, currentTestGroup, defaultTabValue);
                  let timestamp = new Date().valueOf();
                  temporaryStorageMap.set(`${defaultFormValue}_${timestamp}_${i}`, obj);
                }
                this.setState({ temporaryStorageMap });
                let resultObj = this.generateResultObj();
                this.props.openCommonCircularDialog();
                this.props.saveServiceProfileTemplate({
                  params: resultObj,
                  callback: data => {
                    console.log('Dialog:', data);
                    if (data.respCode === 0) {
                      this.props.openCommonMessage({ msgCode: data.msgCode, showSnackbar: true });
                      handleDialogCancel && handleDialogCancel(true);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                      let { refreshEditData } = this.props;
                      let payload = {
                        msgCode: data.msgCode,
                        btnActions:
                        {
                          btn1Click: () => {
                            refreshEditData && refreshEditData();
                          },
                          btn2Click: () => {
                            this.props.closeCommonCircularDialog();
                          }
                        }
                      };
                      this.props.openCommonMessage(payload);
                    } else {
                      if (testValMap.size > 0) {
                        for (let valueObj of testValMap.values()) {
                          if (valueObj.isChecked) {
                            valueObj.isChecked = false;
                          }
                        }
                      }

                      if (specimenValMap.size > 0) {
                        for (let valueObj of specimenValMap.values()) {
                          if (valueObj.isChecked) {
                            valueObj.isChecked = false;
                          }
                        }
                      }
                      this.setState({ middlewareObject });
                      this.props.closeCommonMessage();
                      let message = commonMessageList.find(item => item.messageCode === data.msgCode);
                      if (!!message) {
                        //  let msgDescription=message.description.replace('%GroupName%','Lx Profile Template Name');
                        this.setState({
                          templateNameErrorFlag: true,
                          templateNameMessage: message.description
                        });
                      }
                    }
                  }
                });
                insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Save' button`, '/ioe/saveServiceProfile');
              } else {
                this.props.closeCommonMessage();
                delay(() => {
                  this.props.openCommonMessage({ msgCode: validateMsgCode });
                }, 500);
              }
            },
            btn2Click: () => {
              let resultObj = this.generateResultObj();
              this.props.openCommonCircularDialog();
              this.props.saveServiceProfileTemplate({
                params: resultObj,
                callback: data => {
                  if (data.respCode === 0) {
                    this.props.openCommonMessage({ msgCode: data.msgCode, showSnackbar: true });
                    handleDialogCancel && handleDialogCancel(true);
                  } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    // let { refreshEditData } = this.props;
                    let payload = {
                      msgCode: data.msgCode,
                      btnActions:
                      {
                        btn1Click: () => {
                          this.refreshEditData();
                        },
                        btn2Click: () => {
                          this.props.closeCommonCircularDialog();
                        }
                      }
                    };
                    this.props.openCommonMessage(payload);
                  } else {
                    this.props.closeCommonMessage();
                    let message = commonMessageList.find(item => item.messageCode === data.msgCode);
                    if (!!message) {
                      //  let msgDescription=message.description.replace('%GroupName%','Lx Profile Template Name');
                      this.setState({
                        templateNameErrorFlag: true,
                        templateNameMessage: message.description
                      });
                    }
                  }
                }
              });
              insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Save' button`, '/ioe/saveServiceProfile');
            }
          }
        };
        this.props.openCommonMessage(payload);
      } else {
        let resultObj = this.generateResultObj();
        this.props.openCommonCircularDialog();
        this.props.saveServiceProfileTemplate({
          params: resultObj,
          callback: data => {
            if (data.respCode === 0) {
              this.props.openCommonMessage({ msgCode: data.msgCode, showSnackbar: true });
              handleDialogCancel && handleDialogCancel(true);
            } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
              let { refreshEditData, selectedObj } = this.props;
              let payload = {
                msgCode: data.msgCode,
                btnActions:
                {
                  btn1Click: () => {
                    refreshEditData && refreshEditData(selectedObj);
                  },
                  btn2Click: () => {
                    this.props.closeCommonCircularDialog();
                  }
                }
              };
              this.props.openCommonMessage(payload);

            } else {
              let message = commonMessageList.find(item => item.messageCode === data.msgCode);
              if (!!message) {
                this.props.closeCommonMessage();
                //  let msgDescription=message.description.replace('%GroupName%','Lx Profile Template Name');
                this.setState({
                  templateNameErrorFlag: true,
                  templateNameMessage: message.description
                });
              }
            }
          }
        });
        insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Save' button`, '/ioe/saveServiceProfile');
      }
    }
  }

  handleCancel = () => {
    const { handleDialogCancel, insertIxProfileLog, dialogTitle } = this.props;
    let { isEdit } = this.state;
    if (isEdit) {
      let payload = {
        msgCode: SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM,
        btnActions: {
          btn1Click: () => {
            let name = commonUtils.commonMessageLog(SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM, 'Yes', `[${dialogTitle} Dialog]`);
            insertIxProfileLog && insertIxProfileLog(name, '');
            handleDialogCancel && handleDialogCancel();
          },
          btn2Click: () => {
            let name = commonUtils.commonMessageLog(SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_CLOSE_CONFIRM, 'No', `[${dialogTitle} Dialog]`);
            insertIxProfileLog && insertIxProfileLog(name, '');
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Cancel' button`, '');
      handleDialogCancel && handleDialogCancel();
    }
  }

  resetDialogState = () => {
    this.setState({
      selectionAreaIsEdit: false,
      isEdit: false,
      temporaryStorageMap: new Map(),
      deletedStorageMap: new Map(),
      middlewareObject: {},
      templateNameErrorFlag: false,
      orderIsEdit: false,
      selectedOrderKey: null,
      templateTypeCd: null,
      ioeTestTemplateId: null,
      isNew: ServiceProfileConstants.TEMPLATE_IS_NEW_FLAG.NO,
      maxSeq: 0,
      maxVersion: null,
      templateName: '',
      isActive: false,
      externalVersion: null,
      currentUserId: null,
      searchIsOpen: false,
      searchIx: ''
    });
  }

  handleSearchDialogOpen = () => {
    this.setState({
      searchIsOpen: true
    });
  }

  handleSearchDialogClose = () => {
    this.setState({
      searchIsOpen: false
    });
  }

  render() {
    const {
      classes,
      isOpen = false,
      dialogTitle,
      dropdownMap,
      lab2FormMap,
      frameworkMap,
      ioeFormMap,
      insertIxProfileLog
    } = this.props;
    let {
      searchIsOpen,
      searchIx,
      templateName,
      isActive,
      templateNameErrorFlag,
      temporaryStorageMap,
      middlewareObject,
      orderIsEdit,
      deletedStorageMap,
      isNew,
      selectedOrderKey,
      selectionAreaIsEdit,
      infoEditMode,
      infoEditMiddlewareObject,
      templateNameMessage
    } = this.state;

    let basicInfoProps = {
      searchIx,
      templateName,
      isActive,
      templateNameErrorFlag,
      templateNameMessage,
      updateState: this.updateState,
      updateStateWithoutStatus: this.updateStateWithoutStatus,
      handleSearchDialogOpen: this.handleSearchDialogOpen
    };

    let containerProps = {
      dialogTitle,
      ioeFormMap,
      selectionAreaIsEdit,
      searchIsOpen,
      searchIx,
      isNew,
      frameworkMap,
      dropdownMap,
      temporaryStorageMap,
      middlewareObject,
      lab2FormMap,
      deletedStorageMap,
      orderIsEdit,
      selectedOrderKey,
      infoEditMode,
      infoEditMiddlewareObject,
      insertIxProfileLog,
      openCommonMessage: this.props.openCommonMessage,
      closeCommonMessage: this.props.closeCommonMessage,
      updateState: this.updateState,
      updateStateWithoutStatus: this.updateStateWithoutStatus,
      handleSearchDialogOpen: this.handleSearchDialogOpen,
      handleSearchDialogClose: this.handleSearchDialogClose,
      handleOrderNumberChange: this.handleOrderNumberChange
    };
    return (
      <Dialog
          classes={{ paper: classes.paper }}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="body"
          PaperComponent={PaperComponent}
          onExited={() => { this.resetDialogState(); }}
          onEscapeKeyDown={this.handleCancel}
      >
        {/* title */}
        <DialogTitle
            className={classes.dialogTitle}
            disableTypography
            customdrag="allowed"
        >
          {dialogTitle}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{ 'root': classes.dialogContent }}>
          <Typography component="div">
            <Paper elevation={1}>
              <Grid container className={classes.gridContainer}>
                <Grid item xs={12}>
                  <BasicInfo {...basicInfoProps} />
                </Grid>
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
                  id="btn_service_profile_dialog_save"
                  onClick={this.handleSave}
              >
                Save
              </CIMSButton>
              <CIMSButton
                  id="btn_service_profile_dialog_cancel"
                  onClick={this.handleCancel}
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

const mapStateToProps = state => {
  return {
    ioeFormMap: state.serviceProfile.ioeFormMap,
    frameworkMap: state.serviceProfile.frameworkMap,
    lab2FormMap: state.serviceProfile.lab2FormMap,
    dropdownMap: state.serviceProfile.dropdownMap,
    serviceProfileTemplate: state.serviceProfile.serviceProfileTemplate
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  getServiceProfileFrameworkList,
  getServiceProfildItemDropdownList,
  saveServiceProfileTemplate,
  getTemplateAllItemsForSearch,
  checkTemplateNameData
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ServiceProfileDialog));
