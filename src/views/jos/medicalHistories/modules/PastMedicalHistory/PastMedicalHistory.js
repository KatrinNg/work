import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Card, CardContent, Grid } from '@material-ui/core';
import { styles } from './PastMedicalHistoryStyle';
import ProblemContainer from './modules/ProblemContainer/ProblemContainer';
import TableContainer from './modules/TableContainer/TableContainer';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import { queryProblemList,getPastTerminologyServiceList,getPastHistoryList,getPastHistoryProblemDetailLogList } from '../../../../../store/actions/medicalHistories/medicalHistoriesAction';
import ProblemDetailDialog from './modules/ProblemDetailDialog/ProblemDetailDialog';
import * as utils from '../../util/utils';
import _ from 'lodash';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../../constants/common/commonConstants';

class PastMedicalHistory extends Component {
  constructor(props){
    super(props);
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY,new Map());
    this.state={
      seed:Math.random(),
      haveBeenLoad:false,
      terminologyServiceList: null,
      // containerHeight: undefined,
      valMap: tempMap,
      problemValObjList:[],
      isEdit: false,
      recordUpdateFlag: false,

      problemItemObj: null,
      problemDetailType: null,
      detailIsOpen: false
    };
  }

  UNSAFE_componentWillMount(){
    EventEmitter.on('medical_histories_past_medical_history_load_data', this.handleLoadData);
    EventEmitter.on('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  componentDidMount(){
    const { childRef, currentServiceInfo } = this.props;
    childRef(this);
    this.props.getPastTerminologyServiceList({
      params:{
        serviceCd: currentServiceInfo.serviceCd,
        type: constants.TERMINOLOGY_SERVICE_TYPE.PAST_MEDICAL_HISTORY
      },
      callback: data => {
        this.setState({terminologyServiceList: data});
      }
    });
    this.handleLoadData();
  }

  componentWillUnmount(){
    EventEmitter.delete('medical_histories_past_medical_history_load_data', this.handleLoadData);
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
      const { patientInfo } = this.props;
      this.props.openCommonCircularDialog();
      this.props.getPastHistoryList({
        params:{
          patientKey:patientInfo.patientKey
        },
        callback: data => {
          let valMap = new Map();
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY,new Map());
          if (data.length > 0) {
            data.forEach(item => {
              let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY,item);
              valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY).set(item.pastMedHistoryId,valObj);
            });
          }
          this.setState({
            seed:Math.random(),
            haveBeenLoad:true,
            valMap,
            problemValObjList:data
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

  handleProblemUpdate = (rowId) => {
    let { valMap } = this.state;
    let valObj = valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY).get(rowId);
    if (valObj) {
      let problemItem = utils.transformProblemItem(null,valObj);
      this.setState({
        problemItemObj: problemItem,
        problemDetailType: valObj.pastMedHistoryIndt,
        detailIsOpen: true,
        recordUpdateFlag: true
      });
    }
  }

  handleOtherProblemAdd = (item, accidentMode=false) => {
    let problemItem = utils.transformProblemItem(item);
    this.setState({
      problemItemObj: problemItem,
      problemDetailType:accidentMode?constants.PAST_MED_HISTORY_INDT.ACCIDENT:constants.PAST_MED_HISTORY_INDT.INPUT_PROBLEM,
      detailIsOpen: true,
      recordUpdateFlag: false
    });
  }

  handleProblemItemClick = (problemItem) => {
    const { encounterExistFlag,insertMedicalHistoriesLog } = this.props;
    if (encounterExistFlag) {
      this.setState({
        problemItemObj: problemItem,
        problemDetailType:constants.PAST_MED_HISTORY_INDT.PRE_SER_PROBLEM,
        detailIsOpen: true,
        recordUpdateFlag: false
      });
    }
    let name = `[Past Medical History] Action: Select ${problemItem.displayGroup} in problem list (Code Term ID: ${problemItem.codeTermId}; Problem: ${problemItem.pastMedHistoryText})`;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(name, '');
  }

  handleDetailDialogOK = (tempObj,editMode=false) => {
    const { changeEditFlag } = this.props;
    let { valMap, problemValObjList } = this.state;
    valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY).set(tempObj.pastMedHistoryId,tempObj);
    if (editMode) {
      let index = _.findIndex(problemValObjList, itemObj => {
        return itemObj.pastMedHistoryId === tempObj.pastMedHistoryId;
      });
      if (index!==-1) {
        problemValObjList[index] = tempObj;
      }
    } else {
      problemValObjList = _.concat(problemValObjList,tempObj);
    }
    this.handleDetailDialogCancel();
    this.setState({
      problemValObjList,
      valMap
    },()=>{
      // this.handleDetailDialogCancel();
      EventEmitter.emit('medical_histories_past_medical_history_problem_table_add_data',{
        editMode,
        rowId:tempObj.pastMedHistoryId
      });
      changeEditFlag&&changeEditFlag();
    });
  }

  handleDetailDialogCancel = () => {
    this.setState({detailIsOpen: false});
  }

  generateResultObj = () => {
    const { encounterInfo, currentServiceInfo } = this.props;
    let { valMap } = this.state;
    let resultObj = { pastMedHistoryList: [] };
    let tempProblemMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY);
    if (tempProblemMap.size > 0) {
      for (let item of tempProblemMap.values()) {
        if (item.operationType||item.version) {
          let temp = _.cloneDeep(item);
          temp.encounterDate = encounterInfo.encounterDate;
          temp.serviceCd=currentServiceInfo ? currentServiceInfo.serviceCd : temp.serviceCd;
          let saveFlag = false;
          if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
            saveFlag = true;
            temp.pastMedHistoryId = null;
            utils.handleConvertPastMedicalObj(temp);
          } else if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.UPDATE) {
            saveFlag = true;
            utils.handleConvertPastMedicalObj(temp);
          } else if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.DELETE) {
            saveFlag = true;
            utils.handleSetPastDeleteStatus(temp);
          }
          if (saveFlag) {
            delete temp.operationType;
            resultObj.pastMedHistoryList.push(temp);
          }
        }
      }
    }
    return {
      errorFlag: false,
      resultObj
    };
  }

  render() {
    const { classes,currentServiceInfo,serviceList,contentHeight,changeEditFlag, encounterInfo, sysConfig, encounterExistFlag,insertMedicalHistoriesLog,antFeatureFlag,currentClinicInfo } = this.props;
    let { valMap, problemValObjList, detailIsOpen, problemDetailType, problemItemObj, terminologyServiceList, recordUpdateFlag } = this.state;
    let commonProps = {
      antFeatureFlag,
      encounterExistFlag,
      sysConfig,
      terminologyServiceList,
      encounterInfo,
      valMap,
      currentServiceInfo,
      serviceList,
      updateState:this.updateState,
      changeEditFlag,
      insertMedicalHistoriesLog
    };
    let problemContainerProps = {
      containerHeight:contentHeight - 10,
      queryProblemList:this.props.queryProblemList,
      handleProblemItemClick:this.handleProblemItemClick,
      handleOtherProblemAdd: this.handleOtherProblemAdd,
      ...commonProps
    };
    let tableContainerProps = {
      containerHeight:contentHeight - 20,
      type: constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY,
      dataList:problemValObjList,
      openCommonCircularDialog:this.props.openCommonCircularDialog,
      closeCommonCircularDialog:this.props.closeCommonCircularDialog,
      getPastHistoryProblemDetailLogList:this.props.getPastHistoryProblemDetailLogList,
      handleProblemUpdate: this.handleProblemUpdate,
      ...commonProps
    };
    let detailDialogProps ={
      encounterInfo,
      currentClinicInfo,
      recordUpdateFlag,
      currentServiceInfo,
      serviceList,
      problemDetailType,
      problemItemObj:_.cloneDeep(problemItemObj),
      type: constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS,
      isOpen:detailIsOpen,
      insertMedicalHistoriesLog,
      handleDetailDialogOK:this.handleDetailDialogOK,
      handleDetailDialogCancel:this.handleDetailDialogCancel
    };
    return (
      <div className={classes.wrapper}>
        <Card className={classes.cardWrapper}>
          <CardContent className={classes.cardContent}>
            <Grid container>
              <Grid item xs={6} style={{ maxWidth: '47%', flexBasis: '47%' }}>
                <TableContainer key={this.state.seed} {...tableContainerProps} />
              </Grid>
              <Grid item xs={6} style={{ maxWidth: '53%', flexBasis: '53%' }}>
                <ProblemContainer {...problemContainerProps} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {/* detail dialog */}
        <ProblemDetailDialog {...detailDialogProps} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  sysConfig: state.clinicalNote.sysConfig
});

const mapDispatchToProps = {
  openCommonCircularDialog,
  closeCommonCircularDialog,
  queryProblemList,
  getPastTerminologyServiceList,
  getPastHistoryList,
  getPastHistoryProblemDetailLogList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PastMedicalHistory));
