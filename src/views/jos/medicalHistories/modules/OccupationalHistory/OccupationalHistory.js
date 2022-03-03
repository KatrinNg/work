import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Card, CardContent, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { styles } from './OccupationalHistoryStyle';
import { ExpandMore } from '@material-ui/icons';
import HistoryContainer from './modules/HistoryContainer/HistoryContainer';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import { MEDICAL_HISTORIES_CODE } from '../../../../../constants/message/medicalHistoriesCode';
import moment from 'moment';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import { getOccupationalHistoryList, getOccupationalLogList, getOccupationalOthersLogList } from '../../../../../store/actions/medicalHistories/medicalHistoriesAction';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import * as utils from '../../util/utils';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class OccupationalHistory extends Component {
  constructor(props){
    super(props);
    this.cardRef = React.createRef();
    this.summaryRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY,new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS,new Map());
    this.state={
      seed:Math.random(),
      haveBeenLoad:false,
      containerHeight: undefined,
      valMap: tempMap,
      occupationHistoryList:[],
      othersList:[],
      isEdit: false
    };
  }

  UNSAFE_componentWillMount(){
    EventEmitter.on('medical_histories_occupational_histroy_year_error', this.handleYearError);
    EventEmitter.on('medical_histories_occupational_histroy_load_data', this.handleLoadData);
    EventEmitter.on('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  componentDidMount(){
    const { childRef } = this.props;
    childRef(this);
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
    EventEmitter.delete('medical_histories_occupational_histroy_year_error', this.handleYearError);
    EventEmitter.delete('medical_histories_occupational_histroy_load_data', this.handleLoadData);
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
      this.props.getOccupationalHistoryList({
        params:{
          patientKey:patientInfo.patientKey
        },
        callback: data => {
          let { msOccupationalHistoryDtos=[], msOccupationalOthersDtos=[] } = data;
          let valMap = new Map();
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS,new Map());
          if (msOccupationalHistoryDtos.length > 0) {
            msOccupationalHistoryDtos.forEach(item => {
              let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY,item);
              valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY).set(item.occupationalHistoryId,valObj);
            });
          }
          if (msOccupationalOthersDtos.length > 0) {
            msOccupationalOthersDtos.forEach(item => {
              let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS,item);
              valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS).set(item.occupationalOthersId,valObj);
            });
          }
          this.setState({
            seed:Math.random(),
            haveBeenLoad:true,
            valMap,
            occupationHistoryList:msOccupationalHistoryDtos,
            othersList:msOccupationalOthersDtos
          });
          this.props.closeCommonCircularDialog();
        }
      });
    }
  }

  handleYearError = (payload) => {
    let { valMap } = this.state;
    let { attrName, itemId, type } = payload;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      if (valObj[attrName]&&valObj[attrName]!=='Invalid date') {
        let oppositeName = attrName === 'yearFrom'?'yearTo':'yearFrom';
        let msgCode = null;
        if (moment(valObj[attrName]).year()>moment(new Date()).year()) {
          // validate current field future year
          msgCode = MEDICAL_HISTORIES_CODE.FUTURE_YEAR;
        } else if (valObj[oppositeName]&&valObj[oppositeName]!=='Invalid date'&&moment(valObj[oppositeName]).year()>moment(new Date()).year()) {
          // validate opposite field future year
          msgCode = MEDICAL_HISTORIES_CODE.FUTURE_YEAR;
          attrName = oppositeName;
        } else if (!moment(valObj[attrName]).isSameOrAfter(moment('1900'))) {
          // validate current field > 1900
          msgCode = MEDICAL_HISTORIES_CODE.YEAR_GREATER_THAN_1900;
        } else if (valObj[oppositeName]&&valObj[oppositeName]!=='Invalid date'&&!moment(valObj[oppositeName]).isSameOrAfter(moment('1900'))) {
          // validate opposite field > 1900
          msgCode = MEDICAL_HISTORIES_CODE.YEAR_GREATER_THAN_1900;
          attrName = oppositeName;
        } else {
          // Compare from and to
          if (valObj.yearFrom&&valObj.yearFrom!=='Invalid date'&&valObj.yearTo&&valObj.yearTo!=='Invalid date') {
            if (!moment(valObj.yearFrom).isSameOrBefore(moment(valObj.yearTo))) {
              msgCode = MEDICAL_HISTORIES_CODE.YEAR_FORM_LESS_THAN_YEAR_TO;
              valObj.yearFromErrorFlag = true;
              valObj.yearToErrorFlag = true;
            } else {
              valObj.yearFromErrorFlag = false;
              valObj.yearToErrorFlag = false;
            }
            this.setState({valMap});
          }
        }
        if (msgCode) {
          this.props.openCommonMessage({
            msgCode,
            showSnackbar: true,
            params:[{name:'fieldName',value: attrName === 'yearFrom'?'Year From':'Year To'}]
          });
        }
      } else {
        valObj.yearFromErrorFlag = valObj.yearFrom === 'Invalid date'?true:(
          valObj.yearFrom?(!moment(valObj.yearFrom).isSameOrAfter(moment('1900'))||(moment(valObj.yearFrom).year()>moment(new Date()).year())?true:false)
          :false);
        valObj.yearToErrorFlag = valObj.yearTo === 'Invalid date'?true:(
          valObj.yearTo?(!moment(valObj.yearTo).isSameOrAfter(moment('1900'))||(moment(valObj.yearTo).year()>moment(new Date()).year())?true:false)
          :false);
        this.setState({valMap});
      }
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
    let tempOccupationalMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY);
    if (tempOccupationalMap.size > 0) {
      for (let valObj of tempOccupationalMap.values()) {
        if (valObj.occupation === '') {
          valObj.occupationErrorFlag = true;
        }
        if (valObj.occupationErrorFlag||valObj.yearFromErrorFlag||valObj.yearToErrorFlag) {
          flag = true;
          break;
        }
      }
    }

    let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS);
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
    let resultObj = {
      msOccupationalHistoryDtos:[],
      msOccupationalOthersDtos:[]
    };
    if (!this.validateValMap()) {
      // occupation
      let tempOccupationalMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY);
      if (tempOccupationalMap.size > 0) {
        for (let item of tempOccupationalMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.occupationalHistoryId = null;
            }
            delete temp.occupationErrorFlag;
            delete temp.yearFromErrorFlag;
            delete temp.yearToErrorFlag;
            delete temp.operationType;
            resultObj.msOccupationalHistoryDtos.push(temp);
          }
        }
      }
      // others
      let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS);
      if (tempOthersMap.size > 0) {
        for (let item of tempOthersMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.occupationalOthersId = null;
            }
            delete temp.othersErrorFlag;
            delete temp.operationType;

            resultObj.msOccupationalOthersDtos.push(temp);
          }
        }
      }
    } else {
      errorFlag = true;
    }

    return { errorFlag, resultObj };
  }

  render() {
    const { classes,currentServiceInfo,serviceList, openCommonMessage, changeEditFlag, patientInfo, encounterExistFlag, encounterInfo=null,insertMedicalHistoriesLog,selectedTabName } = this.props;
    let { containerHeight, valMap, occupationHistoryList, othersList } = this.state;

    let commonHistoryProps = {
      openCommonCircularDialog:this.props.openCommonCircularDialog,
      closeCommonCircularDialog:this.props.closeCommonCircularDialog,
      getOccupationalLogList:this.props.getOccupationalLogList,
      getOccupationalOthersLogList:this.props.getOccupationalOthersLogList,
      openCommonMessage,
      containerHeight:containerHeight,
      valMap,
      currentServiceInfo,
      serviceList,
      encounterInfo,
      changeEditFlag,
      encounterExistFlag,
      selectedTabName,
      insertMedicalHistoriesLog,
      patientKey: patientInfo?patientInfo.patientKey:null,
      encounterId: encounterExistFlag?encounterInfo.encounterId:null,
      updateState:this.updateState
    };

    let occupationalProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY,
      isOthers: false,
      dataList: occupationHistoryList,
      typeName:'Occupational History'
    };

    let othersProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS,
      isOthers: true,
      dataList:othersList,
      typeName:'Others'
    };

    return (
      <div className={classes.wrapper}>
        <Card className={classes.cardWrapper}>
          <CardContent ref={this.cardRef} className={classes.cardContent}>
            <div>
              {/* Occupational History */}
              <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    ref={this.summaryRef}
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Occupational-History-Content"
                    id="occupational_history_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Occupational History</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...occupationalProps} />
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
                    aria-controls="Occupational-Others-Content"
                    id="occupational_others_panel_header"
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
  serviceList: state.common.serviceList
});

const mapDispatchToProps = {
  getOccupationalHistoryList,
  getOccupationalLogList,
  getOccupationalOthersLogList,
  openCommonCircularDialog,
  closeCommonCircularDialog
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(OccupationalHistory));
