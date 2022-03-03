/*
 * Front-end UI for load&save assessment settings
 * Load Action: [maintenance.js] componentDidMount -> initAssessmentMaintenanceState
 * -> [assessmentAction.js] getAssessmentSettingItemList
 * -> [assessmentSaga.js] getAssessmentSettingItemList
 * -> Backend API = assessment/listCodeAssessmentList
 * Save Action: [maintenance.js] Save -> handleSave
 * -> [assessmentAction.js] updateAssessmentSetting
 * -> [assessmentSaga.js] updateAssessmentSettingItemList
 * -> Backend API = assessment/insertAssessmentItems
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Typography,
  Divider,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core';
import {
  getAssessmentSettingItemList,
  updateAssessmentSetting,
  getAssessmentCheckedItemList
} from '../../../../store/actions/assessment/assessmentAction';
import _, { cloneDeep } from 'lodash';
import { openCommonMessage, closeCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { withRouter } from 'react-router-dom';
import { styles } from './maintenanceStyle';
import { ASSESSMENT_SETTING_CODE } from '../../../../constants/message/assessmentCode';
import classNames from 'classnames';
import Container from 'components/JContainer';
import { COMMON_CODE } from 'constants/message/common/commonCode';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import OrderingMaintenanceDialog from './orderingMaintenanceDialog/orderingMaintenanceDialog';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { deleteTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import * as commonUtils from '../../../../utilities/josCommonUtilties';

const mapStatesToProps = (state) => {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service_cd: state.login.service.serviceCd,
      service: {
        code: state.login.service.serviceCd
      }
    },
    assessmentSettingCheckedItemList: state.assessment.assessmentSettingCheckedItemList,
    assessmentItemList: state.assessment.assessmentSettingList,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  getAssessmentSettingItemList,
  getAssessmentCheckedItemList,
  updateAssessmentSetting,
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  updateCurTab,
  deleteTabs
};

class AssessmentMaintenance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedItemsSet: new Set(),
      isEdit: false
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.props.openCommonCircularDialog();
    this.initAssessmentMaintenanceState();
    this.props.updateCurTab(
      accessRightEnum.assessmentSettingMaintenance,
      this.doClose
    );
    this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} General Assessment Maintenance`,'assessment/assessmentSetting/listGroupAssessmentList');
  }

  customTheme = (theme) =>
    createMuiTheme({
      ...theme,
      overrides: {
        MuiCheckbox: {
          root: {
            margin: 0,
            padding: '5px 14px'
          }
        }
      }
    });

  doClose = (callback) => {
    let editFlag = this.state.isEdit;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleSave(callback,true);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Assessment Setting Maintenance');
            this.insertGeneralAssessmentMaintenanceLog(name,'/assessment/assessmentSetting/');
            // setInterval(callback(true), 1000);
          },
          btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Assessment Setting Maintenance');
            this.insertGeneralAssessmentMaintenanceLog(name,'');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Assessment Setting Maintenance');
            this.insertGeneralAssessmentMaintenanceLog(name, '');
          }
        },
        params: [
          { name: 'title', value: 'Assessment Setting Maintenance'}
        ]
      });
    } else {
      this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close General Assessment Maintenance`,'');
      callback(true);
    }
  };

  initAssessmentMaintenanceState = () => {
    let { loginInfo } = this.props;
    let params = {
      serviceCd: loginInfo.service_cd
    };
    this.props.getAssessmentSettingItemList({
      params,
      callback: (data) => {
        this.setState({
          checkedItemsSet: cloneDeep(data)
        });
        this.props.closeCommonCircularDialog();
      }
    });
  };

  handleCheckBoxChange = (codeAssessmentCd) => (event) => {
    let { checkedItemsSet } = this.state;
    if (event.target.checked) {
      checkedItemsSet.add(codeAssessmentCd);
    } else {
      checkedItemsSet.delete(codeAssessmentCd);
    }
    this.setState({
      isEdit: true,
      checkedItemsSet
    });
  };

  handleReset = () => {
    let payload = {
      msgCode: ASSESSMENT_SETTING_CODE.RESET_SETTING_COMFIRM,
      btnActions: {
        // Yes
        btn1Click: () => {
          let { checkedItemsSet } = this.state;
          checkedItemsSet.clear();
          this.setState({
            isEdit: true,
            checkedItemsSet
          });
        }
      }
    };
    this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Clear' button`, '');
    this.props.openCommonMessage(payload);
  };

  handleSave = (saveCallback, closeFlag=false) => {
    let { loginInfo, assessmentSettingCheckedItemList } = this.props;
    let { checkedItemsSet } = this.state;
    if (checkedItemsSet.size === 0) {
      this.props.openCommonMessage({
        msgCode: ASSESSMENT_SETTING_CODE.SAVE_SETTING_EMPTY_ITEM,
        btn1AutoClose: false,
        btnActions: {
          btn1Click: () => {
            this.props.closeCommonMessage();
          }
        }
      });
      this.setState({ isEdit: true });
    } else {
      let tempArray = [];
      for (let item of checkedItemsSet.values()) {
        let savedObj = _.find(assessmentSettingCheckedItemList, checkedItem => checkedItem.codeAssessmentCd === item);
        tempArray.push({
          assessmentItemId: savedObj?savedObj.assessmentItemId:null,
          codeAssessmentCd: item,
          serviceCd: loginInfo.service.code,
          version: savedObj?savedObj.version:null,
          operationType: savedObj?null:commonConstants.COMMON_ACTION_TYPE.INSERT
        });
      }

      //handle delete
      let checkedItemCds = [...checkedItemsSet];
      let savedItemCds = _(assessmentSettingCheckedItemList).map(item => item.codeAssessmentCd).value();
      let deletedCds =_(checkedItemCds)
        .xor(savedItemCds)
        .intersection(savedItemCds)
        .value();
      deletedCds.forEach(deletedCd => {
        let savedObj = _.find(assessmentSettingCheckedItemList, checkedItem => checkedItem.codeAssessmentCd === deletedCd);
        tempArray.push({
          assessmentItemId: savedObj.assessmentItemId,
          codeAssessmentCd: savedObj.codeAssessmentCd,
          serviceCd: savedObj.codeAssessmentCd,
          version: savedObj.version,
          operationType: commonConstants.COMMON_ACTION_TYPE.DELETE
        });
      });

      this.props.openCommonCircularDialog();
      this.props.updateAssessmentSetting({
        params: tempArray,
        callback: (msgCode) => {
          if (msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode,
              btnActions: {
                btn1Click: () => {
                  this.setState({ isEdit: false });
                  this.initAssessmentMaintenanceState();
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            this.props.openCommonMessage({
              msgCode,
              showSnackbar: true
            });
            this.setState({ isEdit: false });
            if (typeof saveCallback != 'function' || saveCallback === undefined) {
              if (closeFlag) {
                this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Close' button`, '/assessment/assessmentSetting/');
                this.props.deleteTabs(accessRightEnum.assessmentSettingMaintenance);
              } else {
                this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '/assessment/assessmentSetting/');
                this.initAssessmentMaintenanceState();
              }
              return false;
            } else {
              saveCallback(true);
            }
          }
        }
      });
    }
  };

  handleServiceChange = (obj) => {
    this.setState({
      selectedServiceLabel: obj.label,
      selectedServiceVal: obj.value
    });
    let params = {
      serviceCd: obj.value
    };
    this.props.getAssessmentCheckedItemList({
      params,
      callback: (data) => {
        this.setState({
          checkedItemsSet: cloneDeep(data)
        });
      }
    });
    this.setState({
      isEdit: false
    });
  };

  generalAssementItems = ()=>{
    const { classes, assessmentItemList } = this.props;
    let { checkedItemsSet=new Set()} = this.state;
    let checkboxs = [];
    assessmentItemList.forEach((elementArray, index) => {
        checkboxs.push(
          <FormGroup key={index} className={classes.fullWidth}>
            {elementArray.map((item) => {
              return (
                <Grid
                    key={Math.random()}
                    className={classes.checkBoxGrid}
                    item
                    xs={4}
                >
                  <FormControlLabel
                      classes={{
                      label: classes.normalFont
                    }}
                      control={
                      <Checkbox
                          id={item.codeAssessmentCd}
                          color="primary"
                          style={{padding: '2px 14px'}}
                          checked={
                          checkedItemsSet.has(item.codeAssessmentCd)
                            ? true
                            : false
                        }
                          onChange={this.handleCheckBoxChange(
                          item.codeAssessmentCd
                        )}
                      />
                    }
                      label={item.assessmentName}
                  />
                </Grid>
              );
            })}
          </FormGroup>
        );
    });
    return checkboxs;
  }

  handleOrderingMaintenanceDialogCancel = () =>{
    this.setState({ dialogOpen: false });
  }

  handleOrderingMaintenanceDialogOpen=()=>{
    this.setState({ dialogOpen: true });
    this.insertGeneralAssessmentMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Order' button`,'assessment/assessmentSetting');
  }

  insertGeneralAssessmentMaintenanceLog = (desc, apiName = '', content = '') => {
    commonUtils.commonInsertLog(apiName, 'F101', 'General Assessment Maintenance', desc, 'assessment', content);
  };

  handleCancelLog = (name, apiName = '') => {
    this.insertGeneralAssessmentMaintenanceLog(name, apiName);
  }

  render() {
    const { classes, loginInfo } = this.props;
    const buttonBar = {
      isEdit: this.state.isEdit,
      title:'General Assessment Maintenance',
      logSaveApi: '/assessment/assessmentSetting/',
      saveFuntion:this.handleSave,
      handleCancelLog: this.handleCancelLog,
      autoCloseBtn1:false,
      // height:'64px',
      position: 'fixed',
      buttons: [
        {
          title: 'Order',
          onClick: this.handleOrderingMaintenanceDialogOpen,
          id: 'default_order_button'
        },
        {
          title: 'Save',
          onClick: this.handleSave,
          id: 'default_save_button'
        },
        {
          title: 'Save & Close',
          onClick:  ()=>{this.handleSave(null,true);},
          id: 'default_save_close_button'
        },
        {
          title: 'Clear',
          onClick: this.handleReset,
          id: 'default_clear_button'
        }
      ]
    };

    let engDesc = JSON.parse(sessionStorage.getItem('service')).serviceName;
    let serviceCd = loginInfo.service.code;
    let orderingMaintenance = {
      id: 'generalOrderingAssessmentMaintenance',
      open: this.state.dialogOpen,
      dispatch: this.props.dispatch,
      handleOrderingMaintenanceDialogCancel: this.handleOrderingMaintenanceDialogCancel,
      insertGeneralAssessmentMaintenanceLog: this.insertGeneralAssessmentMaintenanceLog
    };
    return (
      <div className={classNames('detail_warp', classes.fixedDiv)}>
        <Container
            buttonBar={buttonBar}
            className={'nephele_content_body ' + classes.settingWrapperDiv}
        >
          <MuiThemeProvider theme={this.customTheme}>
            <Typography component="div">
              {/* title */}
              <Typography component="div">
                <div className={classes.titleFont}>
                  General Assessment Maintenance
                </div>
                <div className={classes.serviceFont}>
                  {`Service: ${engDesc} (${serviceCd})`}
                </div>
              </Typography>
              <Divider />
              {/* checkbox */}
              <Typography component="div" className={classes.wrapper}>
                <div className={classes.cardContainer}>
                    {this.generalAssementItems()}
                </div>
              </Typography>
            </Typography>
          </MuiThemeProvider>
          <OrderingMaintenanceDialog {...orderingMaintenance} />
        </Container>
      </div>
    );
  }
}

export default withRouter(
  connect(
    mapStatesToProps,
    mapDispatchToProps
  )(withStyles(styles)(AssessmentMaintenance))
);
