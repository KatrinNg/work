import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './medicalHistoriesStyle';
import { withStyles, Card, CardContent } from '@material-ui/core';
import { saveMedicalHistory, resetActiveTab } from '../../../store/actions/medicalHistories/medicalHistoriesAction';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { updateCurTab, updateRefreshTabFunc } from '../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import { COMMON_CODE } from '../../../constants/message/common/commonCode';
import Container from 'components/JContainer';
import MedicalContainer from './modules/MedicalContainer/MedicalContainer';
import _ from 'lodash';
import EventEmitter from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import * as commonUtils from '../../../utilities/josCommonUtilties';

class medicalHistories extends Component {
  constructor(props){
    super(props);
    this.containerRef = React.createRef();
    this.moduleNameList = [
      {name:'Past Medical History',shortName:'PMH',eventType:'past_medical_history'},
      {name:'Social History',shortName:'SH',eventType:'social_history'},
      {name:'Occupational History',shortName:'OH',eventType:'occupational_histroy'},
      {name:'Family History',shortName:'FH',eventType:'family_history'}
    ];
    this.state = {
      key: Math.random(),
      selectedTabName: this.moduleNameList[0].name,
      isEdit: false,
      antFeatureFlag: false
    };
  }

  componentDidMount(){
    this.props.ensureDidMount();
    this.props.updateCurTab(accessRightEnum.medicalHistories, this.doClose); //bind closing
    this.props.updateRefreshTabFunc(accessRightEnum.medicalHistories, ()=> {
      const selectedTab = this.getTabByPref();
      if (selectedTab) {
        EventEmitter.emit(`medical_histories_${selectedTab.eventType}_load_data`);
        this.setState({ selectedTabName: selectedTab.name });
      }
    });
    this.insertMedicalHistoriesLog('Action: ' + commonConstants.INSERT_LOG_STATUS.Open + ' Medical Histories', 'medical-summary/pastMedHistory/getMsPastMedHistoryList');

    const { currentServiceInfo } = this.props;
    this.setState({ antFeatureFlag: currentServiceInfo.serviceCd === 'ANT' });
    const selectedTab = this.getTabByPref();
    if (selectedTab) {
      EventEmitter.emit(`medical_histories_${selectedTab.eventType}_load_data`);
      this.setState({ selectedTabName: selectedTab.name });
    }
  }

  getTabByPref = () => {
    const { activeTab } = this.props;
    if (activeTab && activeTab != undefined && activeTab != null) {
      const moduleName = this.moduleNameList.find(item => item.name.substring(0, 1).toUpperCase() === activeTab.toUpperCase());
      return moduleName ? moduleName : this.moduleNameList[0];
    }
    return null;
  };

  doClose = (callback, doCloseParams) => {
    let isEdit = this.state.isEdit;
    switch (doCloseParams.src) {
      case doCloseFuncSrc.CLOSE_BY_LOGOUT:
      case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
        if (isEdit) {
          this.props.openCommonMessage({
            msgCode: COMMON_CODE.SAVE_WARING,
            params: [{ name: 'title', value: 'Medical Histories' }],
            btnActions: {
              btn1Click: () => {
                this.handleSave(callback);
                this.props.resetActiveTab();
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Medical Histories');
                this.insertMedicalHistoriesLog(name, 'medical-summary/globalSaveMedicalHisoty/');
              },
              btn2Click: () => {
                callback(true);
                this.props.resetActiveTab();
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Medical Histories');
                this.insertMedicalHistoriesLog(name, '');
              },
              btn3Click: () => {
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Medical Histories');
                this.insertMedicalHistoriesLog(name, '');
              }
            }
          });
        } else {
          callback(true);
          this.props.resetActiveTab();
          this.insertMedicalHistoriesLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Medical Histories`, '');
        }
        break;
      case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
        isEdit ? this.handleSave(callback,false) : callback(true);
        this.props.resetActiveTab();
        break;
    }
  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  changeEditFlag = () => {
    this.setState({isEdit: true});
  }

  handleSave = (saveCallback,nextFlag=true) => {
    let params = this.containerRef.current.integrateResultObj();
    if (params) {
      this.props.openCommonCircularDialog();
      this.props.saveMedicalHistory({
        params,
        callback:(data)=>{
          this.props.closeCommonCircularDialog();
          if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  this.refreshPageData();
                }
                // btn2Click: () => {
                //   this.props.closeCommonCircularDialog();
                // }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            let { selectedTabName } = this.state;
            this.props.openCommonMessage({
              msgCode:data.msgCode,
              showSnackbar:true
            });
            let tempObj = _.find(this.moduleNameList,moduleObj=>moduleObj.name === selectedTabName);
            if (tempObj) {
              EventEmitter.emit(`medical_histories_${tempObj.eventType}_load_data`,{manualFlag:nextFlag?true:false});
            }
            EventEmitter.emit('medical_histories_reset_load_flag',{eventTypeName:tempObj.eventType});
            this.setState({isEdit:false});
            if (typeof saveCallback === 'function') {
              saveCallback && saveCallback(true);
            }else{
              this.insertMedicalHistoriesLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'medical-summary/globalSaveMedicalHisoty/');
            }
          }
        }
      });
    }
  }

  refreshPageData = () => {
    let { selectedTabName } = this.state;
    let tempObj = _.find(this.moduleNameList,moduleObj=>moduleObj.name === selectedTabName);
    this.moduleNameList.forEach(moduleObj => {
      EventEmitter.emit(`medical_histories_${moduleObj.eventType}_load_data`,{manualFlag:true});
    });
    EventEmitter.emit('medical_histories_reset_load_flag',{eventTypeName:tempObj.eventType});
    this.setState({isEdit:false});
  }

  insertMedicalHistoriesLog = (desc, apiName = '', content = '') => {
    commonUtils.commonInsertLog(apiName, 'F127', 'Medical Histories', desc, 'medical-summary', content);
  };
  handleCancelLog = (name, apiName = '') => {
    this.props.resetActiveTab();
    this.insertMedicalHistoriesLog(name, apiName);
  }

  render() {
    const { classes, encounterInfo, patientInfo, currentServiceInfo, currentClinicInfo, serviceList } = this.props;
    let { isEdit, selectedTabName, antFeatureFlag } = this.state;
    let encounterExistFlag = encounterInfo&&!_.isEmpty(encounterInfo)?true:false;
    const containerProps = {
      antFeatureFlag,
      moduleNameList: this.moduleNameList,
      selectedTabName,
      encounterInfo,
      patientInfo,
      currentServiceInfo,
      currentClinicInfo,
      serviceList,
      encounterExistFlag,
      openCommonMessage: this.props.openCommonMessage,
      updateState: this.updateState,
      changeEditFlag: this.changeEditFlag,
      insertMedicalHistoriesLog:this.insertMedicalHistoriesLog
    };

    const buttonBar = {
      isEdit,
      position: 'fixed',
      title:'Medical Histories',
      logSaveApi: 'medical-summary/globalSaveMedicalHisoty/',
      saveFuntion:this.handleSave,
      handleCancelLog:this.handleCancelLog,
      buttons:[{
        title: 'Save',
        id: 'btn_medical_histories_save',
        disabled: encounterExistFlag?!isEdit:true,
        onClick:this.handleSave
      }]
    };
    return (
      <Container buttonBar={buttonBar}>
        <div className={classes.wrapper}>
          <Card className={classes.cardWrapper}>
            <CardContent className={classes.cardContent}>
              <MedicalContainer ref={this.containerRef} {...containerProps} />
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  encounterInfo: state.patient.encounterInfo,
  patientInfo: state.patient.patientInfo,
  currentServiceInfo: state.login.service,
  currentClinicInfo: state.login.clinic,
  serviceList: state.common.serviceList,
  activeTab: state.medicalHistories.activeTab
});

const mapDispatchToProps = {
  updateCurTab,
  openCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  saveMedicalHistory,
  updateRefreshTabFunc,
  resetActiveTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(medicalHistories));