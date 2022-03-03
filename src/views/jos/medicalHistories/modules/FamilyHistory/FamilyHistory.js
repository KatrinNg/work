import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Card, CardContent, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { styles } from './FamilyHistoryStyle';
import { ExpandMore } from '@material-ui/icons';
import HistoryContainer from './modules/HistoryContainer/HistoryContainer';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
// import { MEDICAL_HISTORIES_CODE } from '../../../../../constants/message/medicalHistoriesCode';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import { getFamilyHistoryList, getFamilyHistoryProblemDetailLogList, getFamilyHistoryOthersLogList, queryProblemList, getFamilyRelationshipList, getFamilyTerminologyServiceList } from '../../../../../store/actions/medicalHistories/medicalHistoriesAction';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import * as utils from '../../util/utils';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class FamilyHistory extends Component {
  constructor(props){
    super(props);
    this.cardRef = React.createRef();
    this.summaryRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP,new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS,new Map());
    this.state={
      seed:Math.random(),
      haveBeenLoad:false,
      relationshipList: [],
      familyTerminologyServiceList: [],

      containerHeight: undefined,
      valMap: tempMap,
      relationshipHistoryList:[],
      othersList:[],
      isEdit: false
    };
  }

  UNSAFE_componentWillMount(){
    EventEmitter.on('medical_histories_family_history_load_data', this.handleLoadData);
    EventEmitter.on('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  componentDidMount(){
    const { childRef, currentServiceInfo } = this.props;
    childRef(this);
    this.props.getFamilyTerminologyServiceList({
      params:{
        serviceCd: currentServiceInfo.serviceCd,
        type: constants.TERMINOLOGY_SERVICE_TYPE.FAMILY_HISTORY
      },
      callback: data => {
        this.setState({familyTerminologyServiceList: data});
      }
    });
    this.props.getFamilyRelationshipList({
      params:{},
      callback: data => {
        this.setState({relationshipList: data});
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.contentHeight&&this.summaryRef.current&&this.summaryRef.current.clientHeight!==0) {
      let containerHeight = (nextProps.contentHeight/2) - this.summaryRef.current.clientHeight;
      if (containerHeight!==this.state.containerHeight) {
        this.setState({containerHeight});
      }
    }
  }

  componentWillUnmount(){
    EventEmitter.delete('medical_histories_family_history_load_data', this.handleLoadData);
    EventEmitter.delete('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  resetLoadFlag = (payload={}) => {
    const { eventType } = this.props;
    let { eventTypeName } = payload;
    if (eventTypeName !== eventType) {
      this.setState({haveBeenLoad:false});
    }
  }

  handleLoadData = (payload={}) => {
    let { manualFlag=false } = payload;
    let { haveBeenLoad } = this.state;
    let loadFlag = manualFlag?true:!haveBeenLoad;
    if (loadFlag) {
      const { patientInfo, currentServiceInfo } = this.props;
      this.props.openCommonCircularDialog();
      this.props.getFamilyHistoryList({
        params:{
          patientKey:patientInfo.patientKey
        },
        callback: data => {
          let { familyHistoryRltList=[], otherList=[] } = data;
          let { relationshipList } = this.state;
          let valMap = new Map();
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS,new Map());
          if (familyHistoryRltList.length > 0) {
            familyHistoryRltList.forEach(item => {
              let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP,item);
              valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP).set(item.familyHistoryRltId,valObj);
            });
          }
          if (currentServiceInfo.serviceCd == 'ANT') {
            utils.generateDefaultFamilyRelationship(familyHistoryRltList, relationshipList, valMap);
          }
          if (otherList.length > 0) {
            otherList.forEach(item => {
              let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS,item);
              valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS).set(item.familyFreeTextId,valObj);
              item.others = item.details;
            });
          }
          this.setState({
            seed:Math.random(),
            haveBeenLoad:true,
            valMap,
            relationshipHistoryList:familyHistoryRltList,
            othersList:otherList
          });
          this.props.closeCommonCircularDialog();
        }
      });
    }
  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  validateValMap = () => {
    let { valMap } = this.state;
    let flag = false;

    let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS);
    if (tempOthersMap.size > 0) {
      for (let valObj of tempOthersMap.values()) {
        if (valObj.others === '') {
          valObj.othersErrorFlag = true;
        }
        if (valObj.othersErrorFlag) {
          flag = true;
          break;
        }
      }
    }

    if (flag) {
      this.setState({valMap});
    }

    return flag;
  }

  generateResultObj = () => {
    let { valMap } = this.state;
    let errorFlag = false;
    let { encounterInfo, currentClinicInfo, currentServiceInfo } = this.props;
    let resultObj = {
      familyHistoryRltList:[],
      otherList:[]
    };
    if (!this.validateValMap()) {
      // relationship
      let tempRelationshipMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP);
      if (tempRelationshipMap.size > 0) {
        for (let item of tempRelationshipMap.values()) {
          if (item.operationType||item.version) {
            let temp = _.cloneDeep(item);
            let saveFlag = false;
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              saveFlag = true;
              temp.encounterId = encounterInfo ? encounterInfo.encounterId : temp.encounterId;
              temp.clinicCd=currentClinicInfo ? currentClinicInfo.clinicCd : temp.clinicCd;
              temp.encounterDate=encounterInfo ? encounterInfo.encounterDate : temp.encounterDate;
              temp.serviceCd=currentServiceInfo ? currentServiceInfo.serviceCd : temp.serviceCd;
              temp.familyHistoryRltId = null;
              utils.handleConvertRelationshipObj(temp);
            } else if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.UPDATE) {
              saveFlag = true;
              temp.encounterId = encounterInfo ? encounterInfo.encounterId : temp.encounterId;
              temp.clinicCd=currentClinicInfo ? currentClinicInfo.clinicCd : temp.clinicCd;
              temp.encounterDate=encounterInfo ? encounterInfo.encounterDate : temp.encounterDate;
              temp.serviceCd=currentServiceInfo ? currentServiceInfo.serviceCd : temp.serviceCd;
              utils.handleConvertRelationshipObj(temp);
            } else if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.DELETE) {
              saveFlag = true;
              temp.encounterId = encounterInfo ? encounterInfo.encounterId : temp.encounterId;
              temp.clinicCd=currentClinicInfo ? currentClinicInfo.clinicCd : temp.clinicCd;
              temp.encounterDate=encounterInfo ? encounterInfo.encounterDate : temp.encounterDate;
              temp.serviceCd=currentServiceInfo ? currentServiceInfo.serviceCd : temp.serviceCd;
              utils.handleSetFamilyDeleteStatus(temp);
            }
            if (saveFlag) {
              delete temp.operationType;
              resultObj.familyHistoryRltList.push(temp);
            }
          }
        }
      }
      // others
      let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS);
      if (tempOthersMap.size > 0) {
        for (let item of tempOthersMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.familyFreeTextId = null;
            } else if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.DELETE) {
              temp.deleteInd = constants.DELETED_STATUS.YES;
            }
            delete temp.othersErrorFlag;
            delete temp.operationType;
            // Convert
            temp.details = item.others;
            delete temp.others;

            resultObj.otherList.push(temp);
          }
        }
      }
    } else {
      errorFlag = true;
    }
    return { errorFlag, resultObj };
  }

  render() {
    const { classes,currentServiceInfo,serviceList, openCommonMessage, changeEditFlag, sysConfig, patientInfo, encounterExistFlag, encounterInfo=null,insertMedicalHistoriesLog,selectedTabName, antFeatureFlag } = this.props;
    let { containerHeight, valMap, relationshipHistoryList, othersList, familyTerminologyServiceList, relationshipList } = this.state;
    let commonHistoryProps = {
      openCommonCircularDialog:this.props.openCommonCircularDialog,
      closeCommonCircularDialog:this.props.closeCommonCircularDialog,
      getFamilyHistoryProblemDetailLogList:this.props.getFamilyHistoryProblemDetailLogList,
      getFamilyHistoryOthersLogList:this.props.getFamilyHistoryOthersLogList,
      openCommonMessage,
      containerHeight:containerHeight,
      valMap,
      currentServiceInfo,
      serviceList,
      encounterInfo,
      changeEditFlag,
      encounterExistFlag,
      patientKey: patientInfo?patientInfo.patientKey:null,
      encounterId: encounterExistFlag?encounterInfo.encounterId:null,
      updateState:this.updateState,
      selectedTabName
    };

    let relationshipProps = {
      ...commonHistoryProps,
      sysConfig,
      queryProblemList:this.props.queryProblemList,
      relationshipList,
      familyTerminologyServiceList,
      type: constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP,
      isOthers: false,
      dataList: relationshipHistoryList,
      insertMedicalHistoriesLog,
      antFeatureFlag,
      typeName:'Relationship History'
    };

    let othersProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS,
      isOthers: true,
      dataList:othersList,
      insertMedicalHistoriesLog,
      typeName:'Others'
    };

    return (
      <div className={classes.wrapper}>
        <Card className={classes.cardWrapper}>
          <CardContent ref={this.cardRef} className={classes.cardContent}>
            <div>
              {/* Relationship */}
              <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    ref={this.summaryRef}
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Family-History-Relationship-Content"
                    id="family_history_relationship_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Relationship History</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...relationshipProps} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            {/* Others */}
            <div>
              <ExpansionPanel defaultExpanded style={{marginTop: 20}}>
                <ExpansionPanelSummary
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Family-History-Others-Content"
                    id="family_History_others_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Others</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...othersProps} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  encounterInfo: state.patient.encounterInfo,
  currentServiceInfo: state.login.service,
  currentClinicInfo: state.login.clinic,
  serviceList: state.common.serviceList,
  sysConfig: state.clinicalNote.sysConfig
});

const mapDispatchToProps = {
  getFamilyHistoryList,
  getFamilyHistoryProblemDetailLogList,
  getFamilyHistoryOthersLogList,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  queryProblemList,
  getFamilyRelationshipList,
  getFamilyTerminologyServiceList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FamilyHistory));
