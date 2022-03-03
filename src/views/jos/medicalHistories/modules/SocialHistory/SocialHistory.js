import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Card, CardContent, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { styles } from './SocialHistoryStyle';
import { ExpandMore } from '@material-ui/icons';
import HistoryContainer from './modules/HistoryContainer/HistoryContainer';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import { MEDICAL_HISTORIES_CODE } from '../../../../../constants/message/medicalHistoriesCode';
import moment from 'moment';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import * as utils from '../../util/utils';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import {
  getSocialDropdownList, getSocialHistoryList,
  getSocialHistoryCommonLogList, getSocialHistoryPassiveSmokingInformationLogList,
  getSocialHistoryOthersLogList
} from '../../../../../store/actions/medicalHistories/medicalHistoriesAction';
import _ from 'lodash';

class SocialHistory extends Component {
  constructor(props){
    super(props);
    this.cardRef = React.createRef();
    this.summaryRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING,new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE, new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING,new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE,new Map());
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS,new Map());

    let askedMap = new Map();
    askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.SMOKING,{checkedFlag:constants.CHECK_BOX_STATUS.UNCHECKED,date:null});
    askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.DRINKING,{checkedFlag:constants.CHECK_BOX_STATUS.UNCHECKED,date:null});
    askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.SUBSTANCE_ABUSE,{checkedFlag:constants.CHECK_BOX_STATUS.UNCHECKED,date:null});
    this.state={
      seed:Math.random(),
      haveBeenLoad:false,
      containerHeight: undefined,
      valMap: tempMap,
      dropdownOption: null,
      askedMap,

      smokingHistoryList:[],
      drinkingHistoryList:[],
      substanceAbuseHistoryList: [],
      othersList:[],
      passiveHistoryList:[],
      isEdit: false
    };
  }

  UNSAFE_componentWillMount(){
    EventEmitter.on('medical_histories_social_histroy_year_error', this.handleYearError);
    EventEmitter.on('medical_histories_social_histroy_age_error', this.handleAgeError);
    EventEmitter.on('medical_histories_social_history_load_data', this.handleLoadData);
    EventEmitter.on('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  componentDidMount(){
    const { childRef } = this.props;
    childRef(this);
    this.props.getSocialDropdownList({
      params:{},
      callback: data => {
        this.setState({dropdownOption: data});
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
    EventEmitter.delete('medical_histories_social_histroy_year_error', this.handleYearError);
    EventEmitter.delete('medical_histories_social_histroy_age_error', this.handleAgeError);
    EventEmitter.delete('medical_histories_social_history_load_data', this.handleLoadData);
    EventEmitter.delete('medical_histories_reset_load_flag', this.resetLoadFlag);
  }

  resetLoadFlag = (payload={}) => {
    const { eventType } = this.props;
    let { eventTypeName } = payload;
    if (eventTypeName !== eventType) {
      this.setState({haveBeenLoad:false});
    }
  }

  generateValMap = (valMap,contentList,type,isOthers=false,isPassive=false) => {
    let keyName = isPassive ? 'msPassiveSmkId' : (isOthers ? 'socialOthersId' : 'socialHistoryDetailsId');
    if (contentList.length>0) {
      contentList.forEach(item => {
        let valObj = utils.generateHistoryValObj(type,item);
        valMap.get(type).set(item[keyName],valObj);
        if (!isOthers) {
          item.ageFrom = item.ageFrom!==null?item.ageFrom:'';
          item.ageTo = item.ageTo!==null?item.ageTo:'';
          item.yearFrom = item.yrFrom?item.yrFrom:'';  // yrFrom <--> yearFrom
          item.yearTo = item.yrTo?item.yrTo:'';  // yrTo <--> yearTo
        }
      });
    }
  }

  handleLoadData = (payload={}) => {
    let { manualFlag=false } = payload;
    let { haveBeenLoad } = this.state;
    let loadFlag = manualFlag?true:!haveBeenLoad;
    if (loadFlag) {
      const { patientInfo } = this.props;
      this.props.openCommonCircularDialog();
      this.props.getSocialHistoryList({
        params:{
          patientKey:patientInfo.patientKey
        },
        callback: data => {
          let { drinkings, smokings, substanceAbuses, others, passiveSmokings } = data;
          // init asked date
          let askedMap = new Map();
          askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.SMOKING,{checkedFlag:false,date:smokings.askedDate});
          askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.DRINKING,{checkedFlag:false,date:drinkings.askedDate});
          askedMap.set(constants.SOCIAL_CODE_ENCOUNTER_RFI.SUBSTANCE_ABUSE,{checkedFlag:false,date:substanceAbuses.askedDate});

          let valMap = new Map();
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS,new Map());
          valMap.set(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE,new Map());

          this.generateValMap(valMap,drinkings.details,constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING);
          this.generateValMap(valMap,smokings.details,constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING);
          this.generateValMap(valMap,substanceAbuses.details,constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE);
          this.generateValMap(valMap, others, constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS, true);
          this.generateValMap(valMap, passiveSmokings, constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE, false, true);

          this.setState({
            seed:Math.random(),
            haveBeenLoad:true,
            askedMap,
            valMap,
            smokingHistoryList:smokings.details,
            drinkingHistoryList:drinkings.details,
            substanceAbuseHistoryList: substanceAbuses.details,
            othersList:others,
            passiveHistoryList: passiveSmokings
          });
          this.props.closeCommonCircularDialog();
        }
      });
    }
  }

  handleAgeError = (payload) => {
    let { valMap } = this.state;
    let { attrName, itemId, type } = payload;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      if (valObj.ageFrom!==''&&valObj.ageTo!=='') {
        let msgCode = null;
        let ageFromFlag = utils.validateAge(valObj.ageFrom);
        let ageToFlag = utils.validateAge(valObj.ageTo);
        // Compare from and to
        if (ageFromFlag&&ageToFlag) {
          let fromVal = parseInt(valObj.ageFrom);
          let toVal = parseInt(valObj.ageTo);
          if (fromVal > toVal) {
            msgCode = MEDICAL_HISTORIES_CODE.AGE_FORM_LESS_THAN_AGE_TO;
            valObj.ageFromErrorFlag = true;
            valObj.ageToErrorFlag = true;
          } else {
            valObj.ageFromErrorFlag = valObj.ageToErrorFlag = false;
          }
        } else {
          valObj.ageFromErrorFlag = !ageFromFlag;
          valObj.ageToErrorFlag = !ageToFlag;
        }
        this.setState({valMap});
        if (msgCode) {
          this.props.openCommonMessage({
            msgCode,
            showSnackbar: true,
            params:[{name:'fieldName',value: attrName === 'ageFrom'?'Age From':'Age To'}]
          });
        }
      } else {
        valObj.ageFromErrorFlag = valObj.ageFrom === ''?false:!utils.validateAge(valObj.ageFrom);
        valObj.ageToErrorFlag = valObj.ageTo === ''?false:!utils.validateAge(valObj.ageTo);
        this.setState({valMap});
      }
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
    let tempSmokingMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING);
    if (tempSmokingMap.size > 0) {
      for (let valObj of tempSmokingMap.values()) {
        if (valObj.socialHistorySubtypeId === null) {
          valObj.socialHistorySubtypeIdErrorFlag = true;
        }
        if (valObj.status === null) {
          valObj.statusErrorFlag = true;
        }
        if (valObj.statusErrorFlag||valObj.socialHistorySubtypeIdErrorFlag||valObj.ageFromErrorFlag||valObj.ageToErrorFlag
          ||valObj.yearFromErrorFlag||valObj.yearToErrorFlag||valObj.amtTxtErrorFlag) {
          flag = true;
          break;
        }
      }
    }

    let tempDrinkingMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING);
    if (tempDrinkingMap.size > 0) {
      for (let valObj of tempDrinkingMap.values()) {
        if (valObj.socialHistorySubtypeId === null) {
          valObj.socialHistorySubtypeIdErrorFlag = true;
        }
        if (valObj.status === null) {
          valObj.statusErrorFlag = true;
        }
        if (valObj.statusErrorFlag||valObj.socialHistorySubtypeIdErrorFlag||valObj.ageFromErrorFlag||valObj.ageToErrorFlag
          ||valObj.yearFromErrorFlag||valObj.yearToErrorFlag||valObj.amtTxtErrorFlag||valObj.volAmtErrorFlag||valObj.stdUnitErrorFlag) {
          flag = true;
          break;
        }
      }
    }

    let tempSubstanceAbuseMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE);
    if (tempSubstanceAbuseMap.size > 0) {
      for (let valObj of tempSubstanceAbuseMap.values()) {
        if (valObj.socialHistorySubtypeId === null) {
          valObj.socialHistorySubtypeIdErrorFlag = true;
        }
        if (valObj.status === null) {
          valObj.statusErrorFlag = true;
        }
        if (valObj.statusErrorFlag||valObj.socialHistorySubtypeIdErrorFlag||valObj.ageFromErrorFlag||valObj.ageToErrorFlag
          ||valObj.yearFromErrorFlag||valObj.yearToErrorFlag||valObj.amtTxtErrorFlag) {
          flag = true;
          break;
        }
      }
    }

    let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS);
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

    let tempPassiveMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE);
    if (tempPassiveMap.size > 0) {
      for (let valObj of tempPassiveMap.values()) {
        if (valObj.codRlatTypeId === null) {
          valObj.codRlatTypeIdErrorFlag = true;
        }
        if(valObj.smkNum===''){
          valObj.smkNumErrorFlag = true;
        }
        if (valObj.codRlatTypeIdErrorFlag||valObj.smkNumErrorFlag) {
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

  initResultObj = (askedTypeId) => {
    const { currentServiceInfo, currentClinicInfo, encounterInfo, patientInfo } = this.props;
    let { askedMap } = this.state;
    return {
      askedFlag:askedMap.get(askedTypeId).checkedFlag,
      codeEncounterRfiId:askedTypeId,
      clinicCd:currentClinicInfo.clinicCd,
      serviceCd:currentServiceInfo.serviceCd,
      encounterId:encounterInfo.encounterId,
      patientKey:patientInfo.patientKey,
      details:[]
    };
  }

  generateResultObj = () => {
    let { valMap } = this.state;
    let errorFlag = false;
    let resultObj = {
      drinkings:this.initResultObj(constants.SOCIAL_CODE_ENCOUNTER_RFI.DRINKING),
      smokings:this.initResultObj(constants.SOCIAL_CODE_ENCOUNTER_RFI.SMOKING),
      substanceAbuses:this.initResultObj(constants.SOCIAL_CODE_ENCOUNTER_RFI.SUBSTANCE_ABUSE),
      others:[],
      passiveSmokings:[]
    };
    if (!this.validateValMap()) {
      // smoking
      let tempSmokingMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING);
      if (tempSmokingMap.size > 0) {
        for (let item of tempSmokingMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.socialHistoryDetailsId = null;
            }
            // convert year
            temp.yrFrom = temp.yearFrom;
            temp.yrTo = temp.yearTo;
            // age empty
            temp.ageFrom = temp.ageFrom===''?null:temp.ageFrom;
            temp.ageTo = temp.ageTo===''?null:temp.ageTo;

            delete temp.statusErrorFlag;
            delete temp.socialHistorySubtypeIdErrorFlag;
            delete temp.yearFromErrorFlag;
            delete temp.yearToErrorFlag;
            delete temp.operationType;
            delete temp.ageFromErrorFlag;
            delete temp.ageToErrorFlag;
            delete temp.amtTxtErrorFlag;
            resultObj.smokings.details.push(temp);
          }
        }
      }
      //Passive Smoking Information
      let tempPassiveMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE);
      if(tempPassiveMap.size>0){
        for (let item of tempPassiveMap.values()) {
          if(item.operationType){
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.msPassiveSmkId = null;
            }

            // delete temp.socialHistoryDetailsId;
            delete temp.locationErrorFlag;
            delete temp.rlatErrorFlag;
            delete temp.codRlatTypeIdErrorFlag;
            delete temp.smkNumErrorFlag;
            delete temp.operationType;
            resultObj.passiveSmokings.push(temp);
          }
        }
      }
      // drinking
      let tempDrinkingMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING);
      if (tempDrinkingMap.size > 0) {
        for (let item of tempDrinkingMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.socialHistoryDetailsId = null;
            }
            // convert year
            temp.yrFrom = temp.yearFrom;
            temp.yrTo = temp.yearTo;
            // age empty
            temp.ageFrom = temp.ageFrom===''?null:temp.ageFrom;
            temp.ageTo = temp.ageTo===''?null:temp.ageTo;

            delete temp.statusErrorFlag;
            delete temp.socialHistorySubtypeIdErrorFlag;
            delete temp.yearFromErrorFlag;
            delete temp.yearToErrorFlag;
            delete temp.operationType;
            delete temp.ageFromErrorFlag;
            delete temp.ageToErrorFlag;
            delete temp.amtTxtErrorFlag;
            resultObj.drinkings.details.push(temp);
          }
        }
      }
      // Substance Abuse
      let tempSubstanceAbuseMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE);
      if (tempSubstanceAbuseMap.size > 0) {
        for (let item of tempSubstanceAbuseMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.socialHistoryDetailsId = null;
            }
            // convert year
            temp.yrFrom = temp.yearFrom;
            temp.yrTo = temp.yearTo;
            // age empty
            temp.ageFrom = temp.ageFrom===''?null:temp.ageFrom;
            temp.ageTo = temp.ageTo===''?null:temp.ageTo;

            delete temp.yearFrom;
            delete temp.yearTo;
            delete temp.statusErrorFlag;
            delete temp.socialHistorySubtypeIdErrorFlag;
            delete temp.yearFromErrorFlag;
            delete temp.yearToErrorFlag;
            delete temp.operationType;
            delete temp.ageFromErrorFlag;
            delete temp.ageToErrorFlag;
            delete temp.amtTxtErrorFlag;
            resultObj.substanceAbuses.details.push(temp);
          }
        }
      }
      // others
      let tempOthersMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS);
      if (tempOthersMap.size > 0) {
        for (let item of tempOthersMap.values()) {
          if (item.operationType) {
            let temp = _.cloneDeep(item);
            if (temp.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
              temp.socialOthersId = null;
            }
            delete temp.othersErrorFlag;
            delete temp.operationType;
            resultObj.others.push(temp);
          }
        }
      }
    } else {
      errorFlag = true;
    }
    return { errorFlag, resultObj };
  }

  render() {
    const { classes, socialHistoryType, currentServiceInfo,serviceList,currentClinicInfo, patientInfo, openCommonMessage, encounterInfo=null, encounterExistFlag, changeEditFlag,insertMedicalHistoriesLog, antFeatureFlag } = this.props;
    let { containerHeight, valMap, askedMap, dropdownOption, smokingHistoryList, othersList, drinkingHistoryList, passiveHistoryList, substanceAbuseHistoryList, askMap } = this.state;

    let commonHistoryProps = {
      openCommonCircularDialog:this.props.openCommonCircularDialog,
      closeCommonCircularDialog:this.props.closeCommonCircularDialog,
      getSocialHistoryCommonLogList:this.props.getSocialHistoryCommonLogList,
      getSocialHistoryOthersLogList:this.props.getSocialHistoryOthersLogList,
      getSocialHistoryPassiveSmokingInformationLogList: this.props.getSocialHistoryPassiveSmokingInformationLogList,
      socialHistoryType,
      dropdownOption,
      openCommonMessage,
      containerHeight:containerHeight,
      valMap,
      askMap,
      askedMap,
      currentServiceInfo,
      serviceList,
      currentClinicInfo,
      encounterInfo,
      encounterExistFlag,
      patientKey: patientInfo?patientInfo.patientKey:null,
      encounterId: encounterExistFlag?encounterInfo.encounterId:null,
      updateState:this.updateState,
      changeEditFlag,
      insertMedicalHistoriesLog,
      antFeatureFlag
    };

    let smokingProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING,
      socialHistoryTypeId:constants.SOCIAL_HISTORY_TYPE_ID.SMOKING,
      askTypeId: constants.SOCIAL_CODE_ENCOUNTER_RFI.SMOKING,
      dataList: smokingHistoryList,
      isOthers:false,
      typeName:'Smoking'
    };

    let drinkingProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING,
      socialHistoryTypeId:constants.SOCIAL_HISTORY_TYPE_ID.DRINKING,
      askTypeId: constants.SOCIAL_CODE_ENCOUNTER_RFI.DRINKING,
      dataList: drinkingHistoryList,
      isOthers:false,
      typeName:'Drinking'
    };

    let substanceAbuseProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE,
      socialHistoryTypeId:constants.SOCIAL_HISTORY_TYPE_ID.SUBSTANCE_ABUSE,
      askTypeId: constants.SOCIAL_CODE_ENCOUNTER_RFI.SUBSTANCE_ABUSE,
      dataList: substanceAbuseHistoryList,
      isOthers:false,
      typeName:'Substance Abuse'
    };

    let othersProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS,
      dataList:othersList,
      isOthers:true,
      typeName:'Others'
    };

    let passiveProps = {
      ...commonHistoryProps,
      type: constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE,
      dataList: passiveHistoryList,
      isOthers: true,
      typeName: 'Passive Smoking Information'
    };

    return (
      <div className={classes.wrapper}>
        <Card className={classes.cardWrapper}>
          <CardContent ref={this.cardRef} className={classes.cardContent}>
            {/* Smoking History */}
            <div>
              <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    ref={this.summaryRef}
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Social-History-Smoking-Content"
                    id="social_history_smoking_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Smoking</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...smokingProps} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            {/* Passive Smoking Information */}
            <div>
            <ExpansionPanel defaultExpanded style={{marginTop: 20}}>
              <ExpansionPanelSummary
                  ref={this.summaryRef}
                  classes={{
                  root:classes.expansionPanelSummaryRoot,
                  expandIcon:classes.expansionPanelSummaryIcon
                }}
                  expandIcon={<ExpandMore />}
                  aria-controls="Social-History-Passive-Content"
                  id="social_history_passive_panel_header"
              >
                <label className={classes.expansionPanelSummaryLabel}>Passive Smoking Information</label>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...passiveProps} />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            </div>
            {/* Drinking */}
            <div>
              <ExpansionPanel defaultExpanded style={{marginTop: 20}}>
                <ExpansionPanelSummary
                    ref={this.summaryRef}
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Social-History-Drinking-Content"
                    id="social_history_drinking_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Drinking</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...drinkingProps} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            {/* Substance Abuse */}
            <div>
              <ExpansionPanel defaultExpanded style={{marginTop: 20}}>
                <ExpansionPanelSummary
                    ref={this.summaryRef}
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Social-History-Substance-Abuse-Content"
                    id="social_history_substance_abuse_panel_header"
                >
                  <label className={classes.expansionPanelSummaryLabel}>Substance Abuse</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <HistoryContainer key={this.state.seed} {...substanceAbuseProps} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            {/* Others */}
            <div>
              <ExpansionPanel defaultExpanded style={{marginTop: 20, marginBottom: 20}}>
                <ExpansionPanelSummary
                    classes={{
                      root:classes.expansionPanelSummaryRoot,
                      expandIcon:classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore />}
                    aria-controls="Social-History-Others-Content"
                    id="social_history_others_panel_header"
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
  socialHistoryType: state.medicalHistories.socialHistoryType
});

const mapDispatchToProps = {
  openCommonCircularDialog,
  closeCommonCircularDialog,
  getSocialDropdownList,
  getSocialHistoryCommonLogList,
  getSocialHistoryOthersLogList,
  getSocialHistoryList,
  getSocialHistoryPassiveSmokingInformationLogList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SocialHistory));
