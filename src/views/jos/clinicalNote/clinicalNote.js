import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { CLINICALNOTE_CODE } from '../../../constants/message/clinicalNoteCode';
import MedicalRecord from './MedicalRecord';
import * as actionTypes from '../../../store/actions/clinicalNote/clinicalNoteActionType';
import _ from 'lodash';
import {UPDATE_CURRENT_TAB} from '../../../store/actions/mainFrame/mainFrameActionType';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as clinicalNoteConstants from '../../../constants/clinicalNote/clinicalNoteConstants';
import {COMMON_CODE} from '../../../constants/message/common/commonCode';
import accessRightEnum from '../../../enums/accessRightEnum';
import EncounterNoteContainer from './modules/EncounterNoteContainer/EncounterNoteContainer';
import moment from 'moment';
import TagANoteEncounterNoteContainer from '../tagANote/modules/EncounterNoteContainer/EncounterNoteContainer';
import * as tagsActionTypes from '../../../store/actions/tagaNote/tagaNoteActionType';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import * as commonActionType from '../../../store/actions/common/commonActionType';

const customTheme = (theme) =>{
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiInputBase:{
        multiline:{
          height:'100%'
        },
        inputMultiline:{
          height:'100%'
        }
      },
      MuiBottomNavigation:{
        root:{
          height:'36px',
          '& .Mui-disabled':{
            color:'#ccc'
          }
        }
      },
      MuiBottomNavigationAction:{
        wrapper:{
          flexDirection:'inherit'
        }
      },
      MuiButtonGroup:{
        contained:{
          boxShadow:'note'
        }
      },
      MuiButton:{
        label:{
          fontSize:'0.8125rem'
        }
      },
      MuiInputLabel:{
        outlined:{
          display:'inherit'
        }
      }
    }
  });
};

class ClinicalNote extends Component {
  constructor(props) {
    super(props);
    const { loginInfo={}, encounter, common, patientInfo } = props;
    const { clinic={}, loginName } = loginInfo;
    const { serviceList, encounterTypeList } = common;
    const { patientKey } = patientInfo;
    const { encntrTypeId } = encounter;
    //get userRoleType
    let userRoleType = commonUtils.getUserRoleType();
    // Generate Service Dropdown List
    let defaultOption = [{value:'ALL' , title: 'ALL'}];
    let services = serviceList.map(item => {
      return { value: item.serviceCd, title: item.serviceName };
    });
    services = defaultOption.concat(services);
    let currentEncounterObj = _.find(encounterTypeList,item => {
      return item.service === encounter.serviceCd&&item.clinic === encounter.clinicCd&&item.encntrTypeId === encntrTypeId;
    });
    //get default service and default clinic
    let owneClinic = commonUtils.getOwnClinic();
    this.dragTargetContentType = '';
    this.state = {
      params:{
        currentloginName:loginName,
        currentServiceCd:clinic.serviceCd,
        currentClinicCdTopbar:clinic.clinicCd,
        currentClinicCd:owneClinic?owneClinic:clinic.clinicCd,
        currentEncounterId:encounter.encounterId,
        currentEncounterTypeCd:encntrTypeId,
        currentEncounterDesc: currentEncounterObj?(encntrTypeId?currentEncounterObj.description:''):'',
        currentEncounterClinicCd:encounter.clinicCd,
        currentEncounterServiceCd:encounter.serviceCd,
        currentEncounterDate:encounter.encounterDate,
        pastEncounterId:null,
        pastEncounterClinicCd:null,
        pastEncounterServiceCd:null,
        pastEncounterTypeCd:null,
        pastEncounterDate:null,
        pastPatientKey:null,
        userRoleType,  //common
        patientKey
      },
      userLogName:JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,

      isPastRecordEdit:false,
      editEncounterIds: new Set(),
      originDrag:false,
      latestCursor:null,
      pastSeed:Math.random(),
      currentSeed:Math.random(),
      inputAreaValMap: new Map(),
      noteHistorys:[], //origin
      medicalRecords:[], //filter history
      cascadeMap: new Map(),
      serviceOptions: services,
      // selectedService:clinic.serviceCd,
      // selectedClinic:owneClinic?owneClinic:clinic.clinicCd,
      encounterTypeOptions: [],
      selectedEncounterTypes:[],
      noteTypeOptions: [],
      selectedNoteTypes:[],
      tagNoteCheckedFlag: commonUtils.getDefalutShowEIN(),
      originCurrentNoteInfo:null,
      currentNoteInfo: {},
      originPastNoteInfo: null,
      pastNoteInfo: {},
      displayPastEncounterFlag:false,
      historySelected:[],
      clinicIsDisabled:false,
      currentEditFlag:'N',
      pastEditFlag:'N',
      initFlag:true,
      tagANoteTypes:[],
      encounterId:null,
      historyErrMsg: false,
      pastClinicErrMsg: false,
      currentClinicErrMsg: false
    };
  }

  componentWillMount() {
    this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Clinical Note`,'/clinical-note/clinicalNote/');
  }

  componentDidMount() {
    this.props.ensureDidMount();
    const { dispatch, encounter }=this.props;
    let { tagNoteCheckedFlag } = this.state;
    let { encounterId } = encounter;
    this.getCurrentEncounterNoteInfo();
    this.accessCheckIn(false,encounterId);
    if(tagNoteCheckedFlag) {
      this.showTagNoteChange(this.state.tagNoteCheckedFlag);
      this.getNoteTypes();
      this.initServiceListAndClinicList('/clinical-note/clinicalNote');
    }else{
      this.getNoteHistoryList(true);
    }
    dispatch({type:UPDATE_CURRENT_TAB,name:accessRightEnum.clinicalNote,doCloseFunc:this.doCloseTab}); //关闭tab
  }

  componentWillUnmount() {
    this.pastTimer && clearInterval(this.pastTimer);
    this.currentTimer && clearInterval(this.currentTimer);
  }

  initServiceListAndClinicList = (apiFunctionName) =>{
    const { dispatch, patientInfo, loginInfo }=this.props;
    const { initFlag, selectedService } = this.state;
    let { patientKey } = patientInfo;
    let params = {
      apiFunctionName:apiFunctionName,
      patientKey : patientKey
    };
    dispatch({
      type:commonActionType.GET_COMMON_SERVICED_LIST,
      params,
      callback : (data) => {
        let serviceOptions = commonUtils.getServiceListByServiceCdList(data);
		const currentServiceCd = !initFlag && selectedService ? selectedService : loginInfo.service.serviceCd;
        let serviceCdIsExist = _.find(serviceOptions,{ 'value': currentServiceCd });

        this.handleServiceChange(serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : currentServiceCd, false);
        this.setState({
          serviceOptions
        });
      }
    });
  }

  accessCurrentCheckOut = (encounterId) =>{
    let { dispatch, loginInfo } = this.props;
    let { userDto } = loginInfo;
    let params = {
      appCode:'Clinicalnote',
      encounterId,
      loginName:userDto.loginName
    };
    dispatch({
      type:actionTypes.CURRENT_ACCESS_CHECK_OUT,
      params
    });
  }

  accessPastCheckOut = (encounterId) =>{
    let { dispatch, loginInfo } = this.props;
    let { userDto } = loginInfo;
    let params = {
      appCode:'Clinicalnote',
      encounterId,
      loginName:userDto.loginName
    };
    dispatch({
      type:actionTypes.PAST_ACCESS_CHECK_OUT,
      params
    });
    this.setState({pastEditFlag:'N'});
  }

  accessCheckIn = (isPastEncounter,encounterId) =>{
    let { dispatch, loginInfo } = this.props;
    let { userDto } = loginInfo;
    let params = {
      appCode:'Clinicalnote',
      encounterId,
      loginName:userDto.loginName
    };
    dispatch({
      type:actionTypes.ACCESS_CHECK_IN,
      params,
      callback: data => {
        if(isPastEncounter){
          if(_.toUpper(userDto.loginName) === _.toUpper(data.data)){
            this.setState({pastEditFlag:''});
            this.pastTimer = setInterval(
              () => {
                this.resetTimeOut(this.state.params.pastEncounterId);
              },
              clinicalNoteConstants.OPERATION_TIME_OUT.TIME
            );
          }else{
            this.setState({pastEditFlag:data.data});
          }
        }else{
          if(_.toUpper(userDto.loginName) === _.toUpper(data.data)){
            this.setState({currentEditFlag:''});
            this.currentTimer = setInterval(
              () => {
                this.resetTimeOut(this.state.params.currentEncounterId);
              },
              clinicalNoteConstants.OPERATION_TIME_OUT.TIME
            );
          }else{
            this.setState({currentEditFlag:data.data});
          }
        }
      }
    });
  }

  resetTimeOut = (encounterId) =>{
    let { dispatch, loginInfo } = this.props;
    let { userDto } = loginInfo;
    let params = {
      appCode:'Clinicalnote',
      encounterId,
      loginName:userDto.loginName
    };
    dispatch({
      type:actionTypes.ACCESS_RESET_TIMEOUT,
      params
    });
  }

  setPastTimeout = (encounterId) =>{
    this.pastTimer = setInterval(
      () => {
        this.resetTimeOut(encounterId);
      },
      clinicalNoteConstants.OPERATION_TIME_OUT.TIME
    );
  }

  doCloseTab = (callback,doCloseParams) => {
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    let currentSaveIsDisabled = this.saveBtnIsDisabled(false);
    // let editFlag = this.state.editEncounterIds.size > 0 ? true : false;
    switch (doCloseParams.src) {
      case doCloseFuncSrc.CLOSE_BY_LOGOUT:
      case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
        // if (editFlag) {
        if (!(pastSaveIsDisabled && currentSaveIsDisabled)) {
          this.handleClinicalNoteCancel(null, callback, false);
        } else {
          this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Clinical Note`, '');
          callback(true);
          if (this.state.params.pastEncounterId && this.state.pastEditFlag !== 'N' && !this.state.pastEditFlag) {
            this.accessPastCheckOut(this.state.params.pastEncounterId);
          }
          if (!this.state.currentEditFlag && this.state.currentEditFlag !== 'N') {
            this.accessCurrentCheckOut(this.state.params.currentEncounterId);
          }
        }
        break;
      case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
        // if (editFlag) {
        if (!(pastSaveIsDisabled && currentSaveIsDisabled)) {
          this.handleClinicalNotedoClose(callback);
        } else {
          callback(true);
          this.accessPastCheckOutCommon();
          this.accessCurrentCheckOutCommon();
        }
        break;
    }
  }

  getNoteHistoryList = (refreshFlag=false, tagNoteCheckedFlag=false) => {
    const { dispatch } = this.props;
    let { patientKey } = this.state.params;
    let params = {
      patientKey,
      tagNoteCheckedFlag:tagNoteCheckedFlag?'Y':'N'
    };
    dispatch({
      type: actionTypes.GET_NOTE_HISTORY_LIST,
      params,
      callback: data => {
        let {
          encounterTypeOptions, selectedService, selectedClinic, historySelected,
          displayPastEncounterFlag, selectedEncounterTypes, selectedNoteTypes
        } = this.state;

        let { noteHistorys, cascadeMap, noteTypes } = data;
        let { encounter } = this.props;
        let { encntrTypeId } = encounter;
        let deletehistorySelectedFLag = false;
        let paramState = params;
        paramState.currentEncounterTypeCd = encntrTypeId;

        let currentNoteHistory = [];
        let tempEncounterOptions = [];
        let historySelectedNew = [];
        let currentNoteRecord = [];
        let noteTypeOption = [];
        let selectedNoteItems = [];
        let selectedNoteTypesItems = [];
        let selectedEncounterTypesItems = [];

        selectedNoteItems = selectedNoteTypes.length > 0 ? selectedNoteTypes :
          noteTypes.map(item => {
            return item.value;
          });
        let noteTypeCodes = selectedNoteItems.map(noteType => {
          let noteTypeObj = _.find(noteTypes, { 'value': noteType });
          return noteTypeObj.code;
        });
        if (refreshFlag) {
          noteHistorys.forEach(noteRecord => {
            if ((noteRecord.serviceCd === selectedService || selectedService === 'ALL') && (noteRecord.clinicCd === selectedClinic || selectedClinic === 'ALL')) {
              // Test 待定
              // let totalEncounter = _.intersection([noteRecord.encounterTypeId ? noteRecord.encounterTypeId : '<Blank>'], selectedEncounterTypes);
              // if (totalEncounter.length > 0 || selectedEncounterTypes.length === 0) {
              //   selectedEncounterTypesItems = selectedEncounterTypes;
              // }
              let total = _.intersection(noteRecord.typeIds, noteTypeCodes);
              if (total.length > 0) {
                selectedNoteTypesItems = selectedNoteTypes;
                currentNoteHistory.push(noteRecord);
                // currentNoteRecord = currentNoteRecord.concat(total);
              }
            }
            if((historySelected.length>0 && historySelected[0].encounterId && noteRecord.encounterId === historySelected[0].encounterId) ||
            (historySelected.length>0 && historySelected[0].taganoteId && noteRecord.taganoteId === historySelected[0].taganoteId)){
              deletehistorySelectedFLag = true;
              historySelectedNew.push(noteRecord);
            }
            if(selectedService!=='ALL'){
              tempEncounterOptions = selectedClinic === 'ALL'?this.getEncounterTypesByService(selectedService,cascadeMap):cascadeMap.get(selectedService+','+selectedClinic);
            }
          });
          if(!deletehistorySelectedFLag){
            displayPastEncounterFlag = false;
          }
        } else {
          noteHistorys.forEach(noteRecord => {
            if ((noteRecord.serviceCd === selectedService || selectedService === 'ALL') && (noteRecord.clinicCd === selectedClinic || selectedClinic === 'ALL')) {
              let index = _.findIndex(selectedEncounterTypes, encounterType => {
                return encounterType === noteRecord.encounterTypeId ? noteRecord.encounterTypeId : (encounterType == '<Blank>' ? true : false);
              });
              if (index !== -1 || selectedEncounterTypes.length === 0) {
                selectedEncounterTypesItems = selectedEncounterTypes;
                let total = _.intersection(noteRecord.typeIds, noteTypeCodes);
                if (total.length > 0) {
                  selectedNoteTypesItems = selectedNoteTypes;
                  currentNoteHistory.push(noteRecord);
                  // currentNoteRecord = currentNoteRecord.concat(total);
                }
              }
            }
            tempEncounterOptions = encounterTypeOptions.concat(selectedClinic === 'ALL'?this.getEncounterTypesByService(selectedService,cascadeMap):(cascadeMap.get(selectedService+','+selectedClinic)?cascadeMap.get(selectedService+','+selectedClinic):[]));
          });
        }
        //get lastest NoteRecord
        let noteTypeName = [];
        noteTypeName = noteTypes.map(item => {
            return item.value;
        });
        let noteTypeCodesInfo = noteTypeName.map(noteType => {
          let noteTypeObj = _.find(noteTypes, { 'value': noteType });
          return noteTypeObj.code;
        });
        currentNoteRecord = this.arrUnique(noteTypeCodesInfo);
        // currentNoteRecord = this.arrUnique(currentNoteRecord);
        if (currentNoteRecord.length > 0) {
          currentNoteRecord = currentNoteRecord.map(noteType => {
            let noteTypeObj = _.find(noteTypes, { 'code': noteType.toString() });
            noteTypeOption = noteTypeOption.concat(noteTypeObj);
            return noteTypeObj.value;
          });
        }
        this.setState({
          encounterTypeOptions: selectedService !== 'ALL' ? this.filterEncounterTypesRepeat(tempEncounterOptions) : this.filterEncounterTypesRepeat(encounterTypeOptions),
          noteTypeOptions: noteTypeOption,
          selectedEncounterTypes: selectedEncounterTypesItems,
          selectedNoteTypes: selectedNoteTypesItems,
          medicalRecords: currentNoteHistory, //Current history
          noteHistorys, //All history
          cascadeMap,
          params:{
            ...this.state.params,
            paramState
          },
          historySelected:historySelectedNew.length>0?historySelectedNew:(displayPastEncounterFlag?historySelected:[]),
          displayPastEncounterFlag,
          noteTypes,
          historyErrMsg: data.errMsg === clinicalNoteConstants.CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
        });
        if ((selectedEncounterTypesItems.length === 0 && selectedNoteTypesItems.length === 0) || refreshFlag) {
          this.initServiceListAndClinicList('/clinical-note/clinicalNote');
        }
      }
    });
  }

  getCurrentEncounterNoteInfo = () => {
    const { dispatch }=this.props;
    let params = {
      encounterId: this.state.params.currentEncounterId,
      encounterClinicCd: this.state.params.currentEncounterClinicCd,
      userRoleTypeCd: this.state.params.userRoleType,
      selectedServiceCd: this.state.params.pastEncounterServiceCd===null?this.state.params.currentEncounterServiceCd:this.state.params.pastEncounterServiceCd,
      selectedClinicCd: this.state.params.pastEncounterClinicCd===null?this.state.params.currentEncounterClinicCd:this.state.params.pastEncounterClinicCd
    };
    dispatch({
      type: actionTypes.GET_NOTE_BY_ENCOUNTER,
      params,
      callback: (data, errMsg) => {
        let currentNoteInfo = {
          encounterId:this.state.params.currentEncounterId,
          encounterDate:this.state.params.currentEncounterDate,
          encounterDesc:this.state.params.currentEncounterDesc,
          contents:data
        };
        this.setState({
          originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
          currentNoteInfo,
          currentClinicErrMsg: errMsg === clinicalNoteConstants.CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
        });
      }
    });
  }

    handleServiceChange = (value, refreshClinic = true) => {
    let { cascadeMap, noteHistorys,noteTypes,initFlag,serviceOptions, params, selectedClinic: prevSelectedClinic } = this.state;
    let { loginInfo,patientInfo} =this.props;
    let { patientKey } = patientInfo;
    const {service={},clinic={}}=loginInfo;
    const defaultClinicCd = params && params.currentClinicCd;
    let serviceItemName = '';
    for (let index = 0; index < serviceOptions.length; index++) {
      const element = serviceOptions[index];
      if (element.value === value) {
        serviceItemName = element.title;
        break;
      }
    }
    let clinicOptions = commonUtils.getClinicListByServiceCd(value);
    let selectedClinic = clinicOptions.length>0?(service.serviceCd===value&&initFlag?(defaultClinicCd?defaultClinicCd:clinic.clinicCd):(!refreshClinic && prevSelectedClinic ? prevSelectedClinic: clinicOptions[0].value)):'';
    let encounterTypes =value!=='ALL'?(selectedClinic==='ALL'?this.getEncounterTypesByService(value,cascadeMap):cascadeMap.get(value+','+selectedClinic)):this.getAllEncounterTypes(cascadeMap);
    let resultRecords = [];
    let currentNoteRecord = [];
    let noteTypeOption = [];
    if (encounterTypes&&noteTypes) {
      let selectedNoteTypes = noteTypes.map(item => {
        return item.value;
      });
      let noteTypeCodes = selectedNoteTypes.map(noteType => {
      let noteTypeObj = _.find(noteTypes,{ 'value': noteType });
        return noteTypeObj.code;
      });

      // let currentClinic = clinicOptions.length>0?(service.serviceCd===value?clinic.clinicCd:clinicOptions[0].value):'';
      if(selectedClinic!=='ALL' && selectedClinic!==''){
        noteHistorys.forEach(item => {
          if (item.serviceCd === value && item.clinicCd === selectedClinic) {
            let total = _.intersection(item.typeIds,noteTypeCodes);
            if (total.length > 0) {
              currentNoteRecord = currentNoteRecord.concat(total);
            }
            resultRecords.push(item);
          }
        });
      }else{
        noteHistorys.forEach(item => {
          if (item.serviceCd === value || value === 'ALL') {
            let total = _.intersection(item.typeIds,noteTypeCodes);
            if (total.length > 0) {
              currentNoteRecord = currentNoteRecord.concat(total);
            }
            resultRecords.push(item);
          }
        });
      }
    }
    currentNoteRecord = this.arrUnique(currentNoteRecord);
    if(currentNoteRecord.length>0&&noteTypes){
        currentNoteRecord = currentNoteRecord.map(noteType => {
        let noteTypeObj = _.find(noteTypes,{ 'code': noteType.toString() });
        noteTypeOption = noteTypeOption.concat(noteTypeObj);
        return noteTypeObj.value;
      });
    }
    let allItem = value === 'ALL' ? '' : `(Service code: ${value})`;
    let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} service: (${serviceItemName}) in drop-down list ${allItem},PMI:${patientKey},EncounterId: ${this.state.params.currentEncounterId}`;
    this.insertClinicalnoteLog(name, '');
    // this.handleClosePastEncounter();
    this.setState({
      clinicOptions,
      clinicIsDisabled:value==='ALL'?true:false,
      selectedService: value,
      selectedClinic: initFlag ? (value === 'ALL' ? 'ALL' : (defaultClinicCd ? defaultClinicCd : clinic.clinicCd)) : selectedClinic,
      medicalRecords: resultRecords,
      encounterTypeOptions: encounterTypes||[],
      selectedEncounterTypes: [],
      selectedNoteTypes: [],
      noteTypeOptions: noteTypeOption,
      initFlag:false
    });
  }

  arrUnique = arr => {
    return arr.length>0?Array.from(new Set(arr)):arr;
  }

  filterEncounterTypesRepeat = (encounterList) =>{
    //unique obj arr
    if(encounterList){
      let uniq = new Set(encounterList.map(e => JSON.stringify(e)));
      encounterList = Array.from(uniq).map(e => JSON.parse(e));
      return encounterList;
    }else{
      return [];
    }
  }

  getEncounterTypesByService = (service,cascadeMap) =>{
    let encounterList = [];
    cascadeMap.forEach(function (value,key) {
      if(key.includes(service)){
        encounterList = encounterList.concat(value);
      }
    });
    //unique obj arr
    let uniq = new Set(encounterList.map(e => JSON.stringify(e)));
    encounterList = Array.from(uniq).map(e => JSON.parse(e));
    return encounterList;
  }

  getAllEncounterTypes = cascadeMap =>{
    let encounterList = [];
    cascadeMap.forEach(function (value) {
      if(value.length>0){
        encounterList = encounterList.concat(value);
      }
    });
    //unique obj arr
    let uniq = new Set(encounterList.map(e => JSON.stringify(e)));
    let res = Array.from(uniq).map(e => JSON.parse(e));
    return res;
  }

  getAllEncounterIds = encounterIdMap =>{
    let encounterIdList = [];
    encounterIdMap.forEach(function (value) {
      if(value.length>0){
        encounterIdList = encounterIdList.concat(value);
      }
    });
    return encounterIdList;
  }

  handleClincChange = value => {
    let { cascadeMap, noteHistorys,selectedService,noteTypes } = this.state;
    let { patientInfo } = this.props;
    let { patientKey } = patientInfo;

    let encounterTypes = value === 'ALL'?this.getEncounterTypesByService(selectedService,cascadeMap):cascadeMap.get(selectedService+','+value);
    let resultRecords = [], currentNoteRecord = [], noteTypeOption = [];
    if (encounterTypes) {
      let selectedNoteTypes = noteTypes.map(item => {
        return item.value;
      });
      let noteTypeCodes = selectedNoteTypes.map(noteType => {
      let noteTypeObj = _.find(noteTypes,{ 'value': noteType });
        return noteTypeObj.code;
      });
      noteHistorys.forEach(item => {
        if (item.serviceCd === selectedService && (item.clinicCd === value || value === 'ALL')) {
          let total = _.intersection(item.typeIds,noteTypeCodes);
          if (total.length > 0) {
            currentNoteRecord = currentNoteRecord.concat(total);
          }
          resultRecords.push(item);
        }
      });
    }
    currentNoteRecord = this.arrUnique(currentNoteRecord);
    if(currentNoteRecord.length>0){
        currentNoteRecord = currentNoteRecord.map(noteType => {
        let noteTypeObj = _.find(noteTypes,{ 'code': noteType.toString() });
        noteTypeOption = noteTypeOption.concat(noteTypeObj);
        return noteTypeObj.value;
      });
    }
    let allName = value === 'ALL' ? '' : `(Clinic Code: ${value})`;
    let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} clinic: (${value}) in drop-down list ${allName}, PMI:${patientKey}, EncounterId=${this.state.params.currentEncounterId}`;
    this.insertClinicalnoteLog(name, '');
    this.setState({
      selectedClinic: value,
      medicalRecords: resultRecords,
      encounterTypeOptions: encounterTypes||[],
      selectedEncounterTypes: [],
      selectedNoteTypes: [],
      noteTypeOptions: noteTypeOption
    });
  }

  handleEncounterTypeChange = value => {
    let { noteHistorys,selectedService,selectedClinic,noteTypes,selectedEncounterTypes } = this.state;
    let resultRecords = [], currentNoteRecord = [], noteTypeOption = [];
    const {patientInfo}=this.props;
    let { patientKey } = patientInfo;
    let selectedNoteTypes = noteTypes.map(item => {
      return item.value;
    });
    let noteTypeCodes = selectedNoteTypes.map(noteType => {
    let noteTypeObj = _.find(noteTypes,{ 'value': noteType });
      return noteTypeObj.code;
    });
    noteHistorys.forEach(item => {
      if ((item.serviceCd === selectedService &&  (item.clinicCd === selectedClinic || selectedClinic === 'ALL')) || selectedService === 'ALL') {
        let totalEncounter = _.intersection([item.encounterTypeId?item.encounterTypeId:'<Blank>'],value);
        if (totalEncounter.length > 0||value.length === 0) {
          let total = _.intersection(item.typeIds,noteTypeCodes);
          if (total.length > 0) {
            currentNoteRecord = currentNoteRecord.concat(total);
            resultRecords.push(item);
          }
        }
      }
    });
    currentNoteRecord = this.arrUnique(currentNoteRecord);
    if(currentNoteRecord.length>0){
        currentNoteRecord = currentNoteRecord.map(noteType => {
        let noteTypeObj = _.find(noteTypes,{ 'code': noteType.toString() });
        noteTypeOption = noteTypeOption.concat(noteTypeObj);
        return noteTypeObj.value;
      });
    }
    let name='';
    if (selectedEncounterTypes.length > value.length) {
      if (value.length == 0) {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} all selected encounter type: encounter type desc in drop-down list, PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
      } else {
        let result = selectedEncounterTypes.filter(x => value.indexOf(x) < 0)[0];
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} selected encounter type: encounter type desc in drop-down list (Encounter Type ID: ${result}), PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
      }
    } else if (selectedEncounterTypes.length < value.length) {
      let result = value.filter(x => selectedEncounterTypes.indexOf(x) < 0)[0];
      name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} encounter type: encounter type desc in drop-down list (Encounter Type ID: ${result}), PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
    }
    this.insertClinicalnoteLog(name, '');
    this.setState({
      selectedEncounterTypes: value,
      medicalRecords: resultRecords,
      selectedNoteTypes: [],
      noteTypeOptions: noteTypeOption
    });
  }

  handleNoteTypeChange = value => {
    let { noteHistorys, noteTypeOptions, selectedService, selectedEncounterTypes, selectedClinic, selectedNoteTypes } = this.state;
    let resultRecords = [];
    const {patientInfo}=this.props;
    let { patientKey } = patientInfo;
    let noteTypeCodes = value.map(noteType => {
      let noteTypeObj = _.find(noteTypeOptions,{ 'value': noteType });
      return noteTypeObj.code;
    });
    noteHistorys.forEach(item => {
      if ((item.serviceCd === selectedService && (item.clinicCd === selectedClinic || selectedClinic === 'ALL')) || selectedService==='ALL') {
        let index = _.findIndex(selectedEncounterTypes,encounterType => {
          return encounterType === item.encounterTypeId ? item.encounterTypeId : (encounterType == '<Blank>' ? true : false);
        });
        if (index != -1 || selectedEncounterTypes.length == 0) {
          let total = _.intersection(item.typeIds,noteTypeCodes);
          if (total.length > 0||value.length == 0) {
            resultRecords.push(item);
          }
        }
      }
    });
    let name='';
    if(selectedNoteTypes.length > value.length){
      if(value.length == 0) {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} all selected note type: note type desc in drop-down list, PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
      }else{
        let result = selectedNoteTypes.filter(x => value.indexOf(x) < 0)[0];
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} selected note type: note type desc in drop-down list (Encounter Type ID: ${result}), PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
      }
    } else if(selectedNoteTypes.length < value.length){
      let result = value.filter(x => selectedNoteTypes.indexOf(x) < 0)[0];
      name=`Action: ${commonConstants.INSERT_LOG_STATUS.Select} note type: note type desc in drop-down list (Encounter Type ID: ${result}), PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
    }
    this.insertClinicalnoteLog(name,'');
    this.setState({
      selectedNoteTypes: value,
      medicalRecords: resultRecords
    });
  }

  handleSwitchSelectedChange = (selectListName,value) => {
    if(selectListName === 'Service'){
      this.handleClosePastEncounter(this.handleServiceChange,value);
    }else if(selectListName === 'Clinic'){
      this.handleClosePastEncounter(this.handleClincChange,value);
    }else if(selectListName === 'Encounter Type'){
      this.handleClosePastEncounter(this.handleEncounterTypeChange,value);
    }else if(selectListName === 'Note Type'){
      this.handleClosePastEncounter(this.handleNoteTypeChange,value);
    }
  }

  handleShowTagNoteChange = event => {
    this.handleClosePastEncounter(this.showTagNoteChange,event.target.checked);
  }

  showTagNoteChange = value => {
    const {patientInfo}=this.props;
    let { patientKey } = patientInfo;
    // value && this.getNoteTypes();
    this.getNoteHistoryList(false, value);
    let checkedBoo = value ? 'Check' : 'Uncheck';
    this.insertClinicalnoteLog(`Action: ${checkedBoo} 'Show EIN' checkbox, PMI:${patientKey}, EncounterId: ${this.state.params.currentEncounterId}`, '');
    this.setState({
      tagNoteCheckedFlag: value,
      historySelected:[],
      displayPastEncounterFlag:false
    });
  }

  handleDiableEditSameNote = pastNoteInfo => {
    let { contents } = pastNoteInfo;
    if (contents.length>0) {
      contents.forEach(contentObj => {
        let { notes } = contentObj;
        if (notes.length>0) {
          notes.forEach(noteObj => {
            noteObj.allowEdit = clinicalNoteConstants.OPERATION_ALLOWED_TYPE.NO;
          });
        }
      });
    }
  }

  switchEncounter = (selectedVals) => {
    const { dispatch,encounter,patientInfo } = this.props;
    let { patientKey } = patientInfo;
    let { inputAreaValMap, tagNoteCheckedFlag, pastEditFlag, historySelected } = this.state;
    if(tagNoteCheckedFlag && selectedVals.length>0 && selectedVals[0].taganoteId){
      let selectedRecord=selectedVals[0];
      let name=`Action: ${commonConstants.INSERT_LOG_STATUS.Select} an EIN record in note history list (EIN ID: ${selectedRecord.taganoteId}),PMI: ${patientKey}, EncounterId: ${this.state.params.currentEncounterId}`;
      this.insertClinicalnoteLog(name, '');
      let params = {
        taganoteId: selectedRecord.taganoteId
      };
      dispatch({
        type: tagsActionTypes.GET_TAG_A_NOTE_BY_ID,
        params,
        callback: (data) => {
          let pastNoteInfo = data;
          this.removePastNote(this.state.pastNoteInfo,inputAreaValMap);
          this.setState({
            params: {
              ...this.state.params,
              pastPatientKey: selectedRecord.patientKey
            },
            historySelected: selectedVals,
            displayPastEncounterFlag: true,
            originPastNoteInfo: _.cloneDeep(pastNoteInfo),
            pastNoteChange: false,
            pastSeed:Math.random(),
            pastNoteInfo
          });
        }
      });
      if(inputAreaValMap.size>0){
        this.pastTimer && clearTimeout(this.pastTimer);
        !pastEditFlag && pastEditFlag !== 'N' && historySelected.length>0 && this.accessPastCheckOut(historySelected[0].encounterId);
      }
    }else{
      if (selectedVals.length>0) {
        let selectedRecord=selectedVals[0];
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} an encounter in note history list (Encounter ID: ${selectedRecord.encounterId}),PMI: ${patientKey}, EncounterId: ${this.state.params.currentEncounterId}`;
        this.insertClinicalnoteLog(name, '');
        let params = {
          encounterId: selectedRecord.encounterId,
          encounterClinicCd: this.state.params.currentEncounterClinicCd,
          userRoleTypeCd: this.state.params.userRoleType,
          selectedServiceCd: selectedVals[0].serviceCd===null?this.state.params.currentEncounterServiceCd:selectedVals[0].serviceCd,
          selectedClinicCd: selectedVals[0].clinicCd===null?this.state.params.currentEncounterClinicCd:selectedVals[0].clinicCd
        };
        dispatch({
          type: actionTypes.GET_NOTE_BY_ENCOUNTER,
          params,
          callback: (data, errMsg) => {
            let resultObj = this.generateResultDto(true);
            let { encounterId } = resultObj;
            let { editEncounterIds, currentNoteInfo } = this.state;
            let pastNoteInfo = {
              encounterId:selectedRecord.encounterId,
              encounterDate:selectedRecord.encounterDate,
              encounterDesc:selectedRecord.encounterTypeId?selectedRecord.encounterTypeDescription:'',
              contents:data||[]
            };

            if(!inputAreaValMap.has(currentNoteInfo.encounterId)) {
              encounterId && editEncounterIds && editEncounterIds.delete(encounterId);
            }

            if (moment(params.currentEncounterDate).isSame(moment(selectedRecord.encounterDate))) {
              this.handleDiableEditSameNote(pastNoteInfo);
            }
            this.removePastNote(this.state.pastNoteInfo,inputAreaValMap,encounterId);

            this.setState({
              params:{
                ...this.state.params,
                pastEncounterId:selectedRecord.encounterId,
                pastEncounterClinicCd:selectedRecord.clinicCd,
                pastEncounterServiceCd:selectedRecord.serviceCd,
                pastEncounterTypeCd:selectedRecord.encounterTypeId,
                pastEncounterDate:selectedRecord.encounterDate,
                pastPatientKey:selectedRecord.patientKey
              },
              historySelected:selectedVals,
              displayPastEncounterFlag:selectedRecord.encounterId===encounter.encounterId?false:true,
              originPastNoteInfo: _.cloneDeep(pastNoteInfo),
              pastNoteInfo,
              isPastRecordEdit: false,
              pastSeed:Math.random(),
              inputAreaValMap: inputAreaValMap,
              editEncounterIds,
              pastClinicErrMsg: errMsg === clinicalNoteConstants.CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
            });
          }
        });
        if(inputAreaValMap.size>0){
          this.pastTimer && clearTimeout(this.pastTimer);
          !pastEditFlag && pastEditFlag !== 'N' && historySelected.length>0 && this.accessPastCheckOut(historySelected[0].encounterId);
        }
      } else {
        let name='';
        if (historySelected[0].taganoteId) {
          name = `Action: ${commonConstants.INSERT_LOG_STATUS.Unselect} an EIN record in note history list (EIN ID: ${historySelected[0].taganoteId}),PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
        } else {
          name = `Action: ${commonConstants.INSERT_LOG_STATUS.Unselect} an encounter in note history list (Encounter ID: ${historySelected[0].encounterId}), PMI:${patientKey},EncounterId:${this.state.params.currentEncounterId}`;
        }
        this.insertClinicalnoteLog(name,'');
        this.handleClosePastEncounter(null,null);
      }
    }
  }

  removePastNote = (pastNoteInfo,inputAreaValMap) =>{
    let {currentNoteInfo} = this.state;
    //select record is not current page
    if(pastNoteInfo.encounterId !== currentNoteInfo.encounterId) {
      if(pastNoteInfo&&inputAreaValMap.has(pastNoteInfo.encounterId)){
        inputAreaValMap.delete(pastNoteInfo.encounterId);
      }
    }
  }

  onSelectionChange=(selected)=>{
    const { dispatch }=this.props;
    let { isPastRecordEdit, currentNoteInfo, pastNoteInfo } = this.state;
    const isCurrentFlag = (pastNoteInfo.encounterId !== undefined && currentNoteInfo.encounterId !== undefined) ? (pastNoteInfo.encounterId === currentNoteInfo.encounterId) : false;
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    // if (isPastRecordEdit) {
      if (!pastSaveIsDisabled && !isCurrentFlag) {
        let resultObj = this.generateResultDto(true);
        if( resultObj.clinicalNoteDetailList.length>0 && !isCurrentFlag){
          dispatch({
            type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
            payload:{
              msgCode:CLINICALNOTE_CODE.SWITCH_ENCOUNTER_CONFIRM,
              btnActions:{
                btn1Click: () => {
                  // Save
                  dispatch({
                    type: actionTypes.SAVE_CLINICAL_NOTE,
                    params: resultObj,
                    callback: (data) => {
                      if(!data.msgCode) {
                        const payload={
                          msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                          showSnackbar: true
                        };
                        dispatch(openCommonMessage(payload));
                        this.switchEncounter(selected.length>0?selected:this.state.historySelected);
                      }else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE)) {
                        let payload = {
                          msgCode: data.msgCode,
                          btnActions: {
                              btn1Click: () => {
                                this.refreshPageData(true);
                              }
                          }
                        };
                        dispatch(openCommonMessage(payload));
                      }
                    }
                  });
                },
                btn2Click: () => {
                  // Discard
                  this.switchEncounter(selected.length>0?selected:this.state.historySelected);
                }
              }
            }
          });
        }else{
          this.setState({
            historySelected:[],
            originPastNoteInfo: null,
            pastNoteInfo: {},
            displayPastEncounterFlag: false,
            isPastRecordEdit: false
          });
        }
      } else {
        this.switchEncounter(selected);
      }
  }

  handleClosePastEncounter = (selectMethod,value) => {
    const { dispatch }=this.props;
    let { pastEditFlag, historySelected, currentNoteInfo, pastNoteInfo } = this.state;
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    const isCurrentFlag = (pastNoteInfo.encounterId !== undefined && currentNoteInfo.encounterId !== undefined) ? (pastNoteInfo.encounterId === currentNoteInfo.encounterId) : false;
    // if (isPastRecordEdit) {
    if (!pastSaveIsDisabled && !isCurrentFlag) {
      dispatch({
        type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
        payload:{
          msgCode:CLINICALNOTE_CODE.SWITCH_ENCOUNTER_CONFIRM,
          btnActions:{
            btn1Click: () => {
              // Save
              selectMethod && selectMethod(value);
              let resultObj = this.generateResultDto(true);
              if (resultObj.clinicalNoteDetailList.length>0) {
                dispatch({
                  type: actionTypes.SAVE_CLINICAL_NOTE,
                  params: resultObj,
                  callback: (data) => {
                    if(!data.msgCode) {
                      const payload={
                        msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                        showSnackbar: true
                      };
                      dispatch(openCommonMessage(payload));
                      this.setState({
                        historySelected:[],
                        originPastNoteInfo: null,
                        pastNoteInfo: {},
                        displayPastEncounterFlag: false,
                        isPastRecordEdit: false
                      });
                    }else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE)) {
                      let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                              let { inputAreaValMap, encounterId, editEncounterIds, tagNoteCheckedFlag } = this.state;
                              inputAreaValMap.set(encounterId,new Map());
                              editEncounterIds.delete(encounterId);
                              this.getCurrentEncounterNoteInfo();
                              this.accessCheckIn(false,encounterId);
                              this.getNoteHistoryList(false, tagNoteCheckedFlag);
                              this.setState({
                                currentSeed:Math.random(),
                                editEncounterIds,
                                inputAreaValMap,
                                historySelected:[],
                                originPastNoteInfo: null,
                                pastNoteInfo: {},
                                displayPastEncounterFlag: false,
                                isPastRecordEdit: false
                              });
                            }
                        }
                      };
                      dispatch(openCommonMessage(payload));
                    }

                  }
                });
              }
              //check out
              this.pastTimer && clearTimeout(this.pastTimer);
              !pastEditFlag && pastEditFlag !== 'N' && historySelected.length>0 && this.accessPastCheckOut(this.state.historySelected[0].encounterId);
            },
            btn2Click: () => {
              selectMethod && selectMethod(value);
              let { params, inputAreaValMap, editEncounterIds } = this.state;
              inputAreaValMap.set(params.pastEncounterId,new Map());
              editEncounterIds.delete(params.pastEncounterId);
              //check out
              this.pastTimer && clearTimeout(this.pastTimer);
              !pastEditFlag && pastEditFlag !== 'N' && historySelected.length>0 && this.accessPastCheckOut(this.state.historySelected[0].encounterId);
              // Discard
              this.setState({
                historySelected:[],
                originPastNoteInfo: null,
                pastNoteInfo: {},
                displayPastEncounterFlag: false,
                isPastRecordEdit: false,
                inputAreaValMap,
                editEncounterIds
              });
            }
          }
        }
      });
    } else {
      selectMethod && selectMethod(value);
      //check out
      this.pastTimer && clearTimeout(this.pastTimer);
      !pastEditFlag && pastEditFlag !== 'N' && historySelected.length>0 && this.accessPastCheckOut(this.state.historySelected[0].encounterId);
      this.setState({
        historySelected:[],
        originPastNoteInfo: null,
        pastNoteInfo: {},
        displayPastEncounterFlag: false,
        isPastRecordEdit: false
      });
    }

  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  generateResultDto = (isPastEncounter) => {
    let { pastNoteInfo, currentNoteInfo, params, inputAreaValMap } = this.state;
    let infoObj = null;
    if (isPastEncounter) {
      infoObj = pastNoteInfo;
    } else {
      infoObj = currentNoteInfo;
    }
    let resultObj = {
      encounterServiceCd: isPastEncounter?params.pastEncounterServiceCd:params.currentEncounterServiceCd,
      encounterClinicCd: isPastEncounter?params.pastEncounterClinicCd:params.currentEncounterClinicCd,
      encounterDate: isPastEncounter?new Date(params.pastEncounterDate):new Date(params.currentEncounterDate),
      encounterId: isPastEncounter?params.pastEncounterId:params.currentEncounterId,
      encounterTypeId: isPastEncounter?params.pastEncounterTypeCd:params.currentEncounterTypeCd,
      patientKey: isPastEncounter?params.pastPatientKey:params.patientKey,
      userRoleTypeCd: params.userRoleType,
      clinicalNoteDetailList:[]
    };
    if(infoObj){
      let { contents } = infoObj;
      if (contents&&contents.length>0) {
        if (inputAreaValMap.has(infoObj.encounterId)) {
          let noteValMap = inputAreaValMap.get(infoObj.encounterId);
          if (noteValMap.size>0) {
            for (let noteObj of noteValMap.values()) {
              if (noteObj.actionType) {
                if(this.noteTypeClinicalNoteIsChange(contents,noteObj)){
                  let tempObj = {
                    clinicalnoteId:noteObj.clinicalnoteId,
                    clinicalnoteText:_.trim(noteObj.clinicalnoteText),
                    typeId:noteObj.typeId,
                    version:noteObj.version,
                    isDelete:_.trim(noteObj.clinicalnoteText)===''?'Y':''
                  };
                  if (noteObj.actionType === clinicalNoteConstants.ACTION_TYPE.INSERT) {
                    tempObj.createDtm = new Date();
                    delete tempObj.clinicalnoteId;
                  }
                  resultObj.clinicalNoteDetailList.push(tempObj);
                }
              }
            }
          }
        }
      }
    }

    return resultObj;
  }

  noteTypeClinicalNoteIsChange = (contents,noteObj) =>{
    let flag = true;
    if(noteObj.actionType === 'I'&&noteObj.clinicalnoteText.trim()===''){
      flag = false;
    }else{
      contents.forEach(element => {
        element.notes.forEach(note => {
          if(note.clinicalnoteId === noteObj.clinicalnoteId&&note.clinicalnoteText===noteObj.clinicalnoteText){
            flag = false;
          }
        });
      });
    }
    return flag;
  }

  handleClinicalNoteSave = (isPastEncounter) => {
    const {dispatch,patientInfo}=this.props;
    let { patientKey } = patientInfo;
    let resultObj = this.generateResultDto(isPastEncounter);
    let { encounterId } = resultObj;
    if (resultObj.clinicalNoteDetailList.length>0) {
      dispatch({
        type: actionTypes.SAVE_CLINICAL_NOTE,
        params: resultObj,
        callback: data => {
          if(!data.msgCode){
            let { inputAreaValMap,editEncounterIds } = this.state;
            inputAreaValMap.set(encounterId,new Map());
            editEncounterIds.delete(encounterId);
            if (isPastEncounter) {
              let { pastNoteInfo, tagNoteCheckedFlag } = this.state;
              pastNoteInfo.contents = data;
              let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past encounter, PMI:${patientKey},EncounterId:${encounterId}`;
              this.insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
              this.getNoteHistoryList(false,tagNoteCheckedFlag);
              this.setState({
                originPastNoteInfo: _.cloneDeep(pastNoteInfo),
                isPastRecordEdit: false,
                pastSeed:Math.random(),
                editEncounterIds,
                inputAreaValMap,
                pastNoteInfo
              });
            } else {
              let { currentNoteInfo, tagNoteCheckedFlag } = this.state;
              currentNoteInfo.contents = data;
              let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in current encounter, PMI:${patientKey},EncounterId:${encounterId}`;
              this.insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
              this.getNoteHistoryList(false,tagNoteCheckedFlag);
              this.setState({
                originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
                currentSeed:Math.random(),
                editEncounterIds,
                inputAreaValMap,
                currentNoteInfo
              });
            }
            const payload={
              msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
              showSnackbar: true
            };
            dispatch(openCommonMessage(payload));
          } else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE)) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                  btn1Click: () => {
                    let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in current encounter, PMI:${patientKey},EncounterId:${encounterId}`;
                    this.insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
                    this.refreshPageData(isPastEncounter);
                  }
              }
            };
            dispatch(openCommonMessage(payload));
          }
        }
      });
    }
    if(isPastEncounter){
      this.accessPastCheckOut(encounterId);
      this.pastTimer && clearTimeout(this.pastTimer);
    }
  }

  refreshPageData = (isPastEncounter) => {
    if (isPastEncounter) {
      let { currentNoteInfo, tagNoteCheckedFlag } = this.state;
      this.getCurrentEncounterNoteInfo();
      // this.accessCheckIn(false,encounterId);
      this.getNoteHistoryList(true,tagNoteCheckedFlag);
      this.setState({
        currentSeed:Math.random(),
        editEncounterIds:new Set(),
        inputAreaValMap:new Map(),
        historySelected:[],
        originPastNoteInfo: null,
        pastNoteInfo: {},
        displayPastEncounterFlag: false,
        isPastRecordEdit: false,
        originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
        currentNoteInfo
      });
    } else {
      let { currentNoteInfo, tagNoteCheckedFlag } = this.state;
      this.getCurrentEncounterNoteInfo();
      // this.accessCheckIn(false,encounterId);
      this.getNoteHistoryList(true,tagNoteCheckedFlag);
      this.setState({
        originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
        currentSeed:Math.random(),
        editEncounterIds:new Set(),
        inputAreaValMap:new Map(),
        currentNoteInfo
      });
    }
  }

  handlePastClinicalNoteCancel = (isPastEncounter) => {
    const {dispatch,mainFrame}=this.props;
    const {tabsActiveKey}=mainFrame;
    let { editEncounterIds, isPastRecordEdit } = this.state;
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    let currentSaveIsDisabled = this.saveBtnIsDisabled(false);

    if (isPastEncounter) {
      // if (isPastRecordEdit) {
      if (!pastSaveIsDisabled) {
        dispatch({
          type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          payload:{
            msgCode:COMMON_CODE.SAVE_DIALOG_WARING,
            btnActions:{
              btn1Click: () => {
                let { params, inputAreaValMap, originPastNoteInfo } = this.state;
                inputAreaValMap.set(params.pastEncounterId,new Map());
                editEncounterIds.delete(params.pastEncounterId);
                this.setState({
                  pastSeed:Math.random(),
                  editEncounterIds,
                  inputAreaValMap,
                  pastNoteInfo: _.cloneDeep(originPastNoteInfo),
                  isPastRecordEdit:false
                });
              }
            }
          }
        });
      }
    } else {
      // if (editEncounterIds.size>0) {
      if (!currentSaveIsDisabled) {
        dispatch({
          type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          payload:{
            msgCode:COMMON_CODE.SAVE_DIALOG_WARING,
            btnActions:{
              btn1Click: () => {
                if (tabsActiveKey == accessRightEnum.patientSpec){
                  dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:accessRightEnum.clinicalNote});
                }else{
                  dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
                }
              }
            }
          }
        });
      } else {
        if (tabsActiveKey == accessRightEnum.patientSpec){
          dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:accessRightEnum.clinicalNote});
        }else{
          dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
        }
      }
    }
    if(isPastEncounter){
      this.accessPastCheckOutCommon();
    }else{
      this.accessCurrentCheckOutCommon();
    }
  }

  handleClinicalNoteCancel = (isPastEncounter, saveCallback, saveBool) => {
    const { dispatch, mainFrame, patientInfo } = this.props;
    const { tabsActiveKey } = mainFrame;
    let { patientKey } = patientInfo;
    let { editEncounterIds, isPastRecordEdit, currentNoteInfo } = this.state;
    let result = this.generateResultDto(true);
    let name='';
    if (isPastEncounter) {
      name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button in past encounter,PMI:${patientKey},EncounterId:${result.encounterId}`;
    } else {
      name=`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button in current encounter,PMI:${patientKey},EncounterId:${result.encounterId}`;
    }
    this.insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    let currentSaveIsDisabeld = this.saveBtnIsDisabled(false);
    if (isPastEncounter) {
      // if (isPastRecordEdit) {
      if (!pastSaveIsDisabled) {
        dispatch({
          type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          btn1AutoClose: false,
          payload: {
            msgCode: COMMON_CODE.SAVE_WARING,
            params: [
              {
                name: 'title',
                value: 'Clinical Note'
              }
            ],
            btnActions: {
              btn1Click: () => {
                let resultObj = this.generateResultDto(true);
                let { pastNoteInfo, tagNoteCheckedFlag } = this.state;
                let { encounterId } = resultObj;
                this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past encounter, PMI:${patientKey},EncounterId:${encounterId}`, '/clinical-note/clinicalNote');
                if (resultObj.clinicalNoteDetailList.length > 0) {
                  dispatch({
                    type: actionTypes.SAVE_CLINICAL_NOTE,
                    params: resultObj,
                    callback: data => {
                      if(!data.msgCode) {
                        let { inputAreaValMap } = this.state;
                        inputAreaValMap.set(encounterId, new Map());
                        pastNoteInfo.contents = data;
                        this.getNoteHistoryList(false, tagNoteCheckedFlag);
                        // this.getNoteHistoryList(true);
                        this.setState({
                          editEncounterIds,
                          inputAreaValMap,
                          historySelected:[],
                          originPastNoteInfo: null,
                          pastNoteInfo: {},
                          displayPastEncounterFlag: false,
                          isPastRecordEdit: false
                        });
                        const payload = {
                          msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                          showSnackbar: true
                        };
                        dispatch(openCommonMessage(payload));
                        this.accessPastCheckOutCommon();
                        //执行关闭方法
                        if (!saveBool) {
                          if (typeof saveCallback != 'function' || saveCallback == undefined) {
                            return false;
                          } else {
                            saveCallback && saveCallback(true);
                          }
                        }
                      }else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE)) {
                        let payload = {
                          msgCode: data.msgCode,
                          btnActions: {
                              btn1Click: () => {
                                this.refreshPageData(true);
                              }
                          }
                        };
                        dispatch(openCommonMessage(payload));
                      }
                    }
                  });
                }else{
                  //执行关闭方法
                  if (!saveBool) {
                    if (typeof saveCallback != 'function' || saveCallback == undefined) {
                      return false;
                    } else {
                      saveCallback && saveCallback(true);
                    }
                  }
                }
              },
              btn2Click: () => {
                let { params, inputAreaValMap, originPastNoteInfo } = this.state;
                inputAreaValMap.set(params.pastEncounterId, new Map());
                editEncounterIds.delete(params.pastEncounterId);
                this.setState({
                  pastSeed: Math.random(),
                  editEncounterIds,
                  inputAreaValMap,
                  pastNoteInfo: _.cloneDeep(originPastNoteInfo),
                  isPastRecordEdit: false,
                  displayPastEncounterFlag: false,
                  historySelected: []
                });
                this.accessPastCheckOutCommon();
                if (!saveBool) { saveCallback&&saveCallback(true); }
              }
            }
          }
        });
      } else {
        let { params, inputAreaValMap, originPastNoteInfo } = this.state;
        inputAreaValMap.set(params.pastEncounterId, new Map());
        editEncounterIds.delete(params.pastEncounterId);
        this.setState({
          pastSeed: Math.random(),
          editEncounterIds,
          inputAreaValMap,
          pastNoteInfo: _.cloneDeep(originPastNoteInfo),
          isPastRecordEdit: false,
          displayPastEncounterFlag: false,
          historySelected: []
        });
        this.accessPastCheckOutCommon();
        if (!saveBool) { saveCallback&&saveCallback(true); }
      }
    } else {
      // if (editEncounterIds.size > 0 || isPastRecordEdit) {
      if (!(pastSaveIsDisabled && currentSaveIsDisabeld)) {
        dispatch({
          type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          btn1AutoClose: false,
          payload: {
            msgCode: COMMON_CODE.SAVE_WARING,
            params: [
              {
                name: 'title',
                value: 'Clinical Note'
              }
            ],
            btnActions: {
              btn1Click: () => {
                let resultObj;
                // if(editEncounterIds.size > 0 && !isPastRecordEdit) {
                if(!currentSaveIsDisabeld && pastSaveIsDisabled) {
                  resultObj = this.generateResultDto(false);
                }else{
                  resultObj = this.generateResultDto(true);
                }
                let { inputAreaValMap, pastNoteInfo, tagNoteCheckedFlag } = this.state;
                let { encounterId } = resultObj;
                let tempPastNoteInfo;
                this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in current encounter, PMI:${patientKey},EncounterId:${encounterId}`,'/clinical-note/clinicalNote');
                if (resultObj.clinicalNoteDetailList.length > 0) {
                  dispatch({
                    type: actionTypes.SAVE_CLINICAL_NOTE,
                    params: resultObj,
                    callback: data => {
                      if(!data.msgCode){
                        inputAreaValMap.set(encounterId, new Map());  //past encounter
                        editEncounterIds.delete(encounterId);
                        // pastNoteInfo.contents = data;
                        tempPastNoteInfo = data;
                        let resultCurrentObj = this.generateResultDto(false);
                        let currentEncounterId = resultCurrentObj.encounterId;
                        if (resultCurrentObj.clinicalNoteDetailList.length > 0) {
                          dispatch({
                            type: actionTypes.SAVE_AGAIN_CLINICAL_NOTE,
                            params: resultCurrentObj,
                            callback: currentData => {
                                pastNoteInfo.contents = tempPastNoteInfo;
                                inputAreaValMap.set(currentEncounterId, new Map());
                                editEncounterIds.delete(currentEncounterId);
                                currentNoteInfo.contents = currentData;
                                this.getNoteHistoryList(true, tagNoteCheckedFlag);
                                this.setState({
                                  originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
                                  originPastNoteInfo: _.cloneDeep(pastNoteInfo),
                                  currentSeed: Math.random(),
                                  pastSeed: Math.random(),
                                  isPastRecordEdit: false,
                                  displayPastEncounterFlag: false,
                                  editEncounterIds,
                                  inputAreaValMap,
                                  currentNoteInfo,
                                  pastNoteInfo,
                                  historySelected: []
                                });
                                const payload = {
                                  msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                                  showSnackbar: true
                                };
                                dispatch(openCommonMessage(payload));
                                if (tabsActiveKey == accessRightEnum.patientSpec){
                                  dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:accessRightEnum.clinicalNote});
                                }else{
                                  dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
                                }
                                //执行关闭方法
                                if (!saveBool) {
                                  if (typeof saveCallback != 'function' || saveCallback == undefined) {
                                    return false;
                                  } else {
                                    saveCallback && saveCallback(true);
                                  }
                                }
                            }
                          });
                        } else {
                          pastNoteInfo.contents = data;
                          this.getNoteHistoryList(true, tagNoteCheckedFlag);
                          this.setState({
                            originPastNoteInfo: _.cloneDeep(pastNoteInfo),
                            isPastRecordEdit: false,
                            displayPastEncounterFlag: false,
                            historySelected: [],
                            pastSeed: Math.random(),
                            editEncounterIds,
                            inputAreaValMap,
                            pastNoteInfo
                          });
                          const payload = {
                            msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                            showSnackbar: true
                          };
                          dispatch(openCommonMessage(payload));
                          if (tabsActiveKey == accessRightEnum.patientSpec) {
                            dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: accessRightEnum.clinicalNote });
                          } else {
                            dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
                          }
                           //执行关闭方法
                          if (!saveBool) {
                            if (typeof saveCallback != 'function' || saveCallback == undefined) {
                              return false;
                            } else {
                              saveCallback && saveCallback(true);
                            }
                          }
                        }
                        if(isPastRecordEdit){
                          this.accessPastCheckOut(encounterId);
                          this.pastTimer && clearTimeout(this.pastTimer);
                        }
                        if(editEncounterIds.size > 0){
                          this.accessCurrentCheckOut(encounterId);
                          this.currentTimer && clearTimeout(this.currentTimer);
                        }
                      } else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE)) {
                        let payload = {
                          msgCode: data.msgCode,
                          btnActions: {
                              btn1Click: () => {
                                this.refreshPageData(true);
                              }
                          }
                        };
                        dispatch(openCommonMessage(payload));
                      }
                    }
                  });
                }
              }, btn2Click: () => {
                this.accessPastCheckOutCommon();
                this.accessCurrentCheckOutCommon();
                if (tabsActiveKey == accessRightEnum.patientSpec) {
                  dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: accessRightEnum.clinicalNote });
                } else {
                  dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
                }
                if (!saveBool) { saveCallback && saveCallback(true); }
              }
            }
          }
        });
      } else {
        this.accessPastCheckOutCommon();
        this.accessCurrentCheckOutCommon();
        if (tabsActiveKey == accessRightEnum.patientSpec) {
          dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: accessRightEnum.clinicalNote });
        } else {
          dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
        }
        if (!saveBool) { saveCallback && saveCallback(true); }
      }
    }
  }

  handleCloseTab = () =>{
    const { dispatch, mainFrame } = this.props;
    const { tabsActiveKey } = mainFrame;
    this.accessPastCheckOutCommon();
    this.accessCurrentCheckOutCommon();
    if (tabsActiveKey == accessRightEnum.patientSpec) {
      dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: accessRightEnum.clinicalNote });
    } else {
      dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
    }
  }

  handleClinicalNotedoClose = (saveCallback) => {
    const { dispatch, patientInfo } = this.props;
    let { patientKey } = patientInfo;
    let { editEncounterIds, isPastRecordEdit,displayPastEncounterFlag,currentNoteInfo } = this.state;
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    let currentSaveIsDisabled = this.saveBtnIsDisabled(false);
    if(displayPastEncounterFlag){
      // if(isPastRecordEdit){
      if(!pastSaveIsDisabled){
        //提取方法
        let resultObj = this.generateResultDto(true);
        let { inputAreaValMap, pastNoteInfo, tagNoteCheckedFlag } = this.state;
        let { encounterId } = resultObj;
        let tempPastNoteInfo;
        this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past encounter, PMI:${patientKey},EncounterId:${encounterId}`, '/clinical-note/clinicalNote');
        if (resultObj.clinicalNoteDetailList.length > 0) {
          dispatch({
            type: actionTypes.SAVE_CLINICAL_NOTE,
            params: resultObj,
            callback: data => {
              if(!data.msgCode){
                inputAreaValMap.set(encounterId, new Map());  //past encounter
                editEncounterIds.delete(encounterId);
                // pastNoteInfo.contents = data;
                tempPastNoteInfo = data;
                let resultCurrentObj = this.generateResultDto(false);
                let currentEncounterId = resultCurrentObj.encounterId;
                if (resultCurrentObj.clinicalNoteDetailList.length > 0) {
                  dispatch({
                    type: actionTypes.SAVE_AGAIN_CLINICAL_NOTE,
                    params: resultCurrentObj,
                    callback: currentData => {
                      pastNoteInfo.contents = tempPastNoteInfo;
                      inputAreaValMap.set(currentEncounterId, new Map());
                      editEncounterIds.delete(currentEncounterId);
                      currentNoteInfo.contents = currentData;
                      this.getNoteHistoryList(true, tagNoteCheckedFlag);
                      this.setState({
                        originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
                        originPastNoteInfo: _.cloneDeep(pastNoteInfo),
                        currentSeed: Math.random(),
                        pastSeed: Math.random(),
                        isPastRecordEdit: false,
                        displayPastEncounterFlag: false,
                        editEncounterIds,
                        inputAreaValMap,
                        currentNoteInfo,
                        pastNoteInfo,
                        historySelected: []
                      });
                      const payload = {
                        msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                        showSnackbar: true
                      };
                      dispatch(openCommonMessage(payload));
                    }
                  });
                } else {
                  pastNoteInfo.contents = data;
                  this.getNoteHistoryList(true, tagNoteCheckedFlag);
                  this.setState({
                    originPastNoteInfo: _.cloneDeep(pastNoteInfo),
                    isPastRecordEdit: false,
                    displayPastEncounterFlag: false,
                    historySelected: [],
                    pastSeed: Math.random(),
                    editEncounterIds,
                    inputAreaValMap,
                    pastNoteInfo
                  });
                  const payload = {
                    msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                    showSnackbar: true
                  };
                  dispatch(openCommonMessage(payload));
                }
                this.accessPastCheckOut(encounterId);
                this.pastTimer && clearTimeout(this.pastTimer);
                if(typeof saveCallback!='function'||saveCallback==undefined){
                  return false;
                }else{
                  saveCallback && saveCallback(true);
                }
              }else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE)) {
                let payload = {
                  msgCode: data.msgCode,
                  btnActions: {
                      btn1Click: () => {
                        this.refreshPageData(true);
                      }
                  }
                };
                dispatch(openCommonMessage(payload));
              }
            }
          });
        }
      }else{
        // if (editEncounterIds.size>0) {
        if (!currentSaveIsDisabled) {
          let resultCurrentObj = this.generateResultDto(false);
          let { encounterId } = resultCurrentObj;
          let { tagNoteCheckedFlag } = this.state;
          this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in current encounter, PMI:${patientKey},EncounterId:${encounterId}`,'/clinical-note/clinicalNote');
          if (resultCurrentObj.clinicalNoteDetailList.length > 0) {
            dispatch({
              type: actionTypes.SAVE_CLINICAL_NOTE,
              params: resultCurrentObj,
              callback: data => {
                if(!data.msgCode) {
                  let { inputAreaValMap } = this.state;
                  inputAreaValMap.set(encounterId, new Map());
                  editEncounterIds.delete(encounterId);
                  currentNoteInfo.contents = data;
                  this.getNoteHistoryList(true,tagNoteCheckedFlag);
                  this.setState({
                    originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
                    currentSeed: Math.random(),
                    editEncounterIds,
                    inputAreaValMap,
                    currentNoteInfo
                  });
                  const payload = {
                    msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                    showSnackbar: true
                  };
                  dispatch(openCommonMessage(payload));
                  this.accessPastCheckOutCommon();
                  this.accessCurrentCheckOutCommon();
                  if(typeof saveCallback!='function'||saveCallback==undefined){
                    return false;
                  }else{
                    saveCallback && saveCallback(true);
                  }
                }else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE)) {
                  let payload = {
                    msgCode: data.msgCode,
                    btnActions: {
                        btn1Click: () => {
                          this.refreshPageData(true);
                        }
                    }
                  };
                  dispatch(openCommonMessage(payload));
                }
              }
            });
          }
        }else{
          this.accessPastCheckOutCommon();
          this.accessCurrentCheckOutCommon();
          if(typeof saveCallback!='function'||saveCallback==undefined){
            return false;
          }else{
            saveCallback && saveCallback(true);
          }
        }
      }
    }else{
      // if (editEncounterIds.size > 0) {
      if (!currentSaveIsDisabled) {
        let resultCurrentObj = this.generateResultDto(false);
        let { encounterId } = resultCurrentObj;
        let { tagNoteCheckedFlag } = this.state;
        this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in current encounter, PMI:${patientKey},EncounterId:${encounterId}`,'/clinical-note/clinicalNote');
        if (resultCurrentObj.clinicalNoteDetailList.length > 0) {
          dispatch({
            type: actionTypes.SAVE_CLINICAL_NOTE,
            params: resultCurrentObj,
            callback: data => {
              if(!data.msgCode) {
                let { inputAreaValMap } = this.state;
                inputAreaValMap.set(encounterId, new Map());
                editEncounterIds.delete(encounterId);
                currentNoteInfo.contents = data;
                this.getNoteHistoryList(true,tagNoteCheckedFlag);
                this.setState({
                  originCurrentNoteInfo: _.cloneDeep(currentNoteInfo),
                  currentSeed: Math.random(),
                  editEncounterIds,
                  inputAreaValMap,
                  currentNoteInfo
                });
                const payload = {
                  msgCode: CLINICALNOTE_CODE.SAVE_CLINICALNOTE_SUCCESSFULLY,
                  showSnackbar: true
                };
                dispatch(openCommonMessage(payload));
                this.accessPastCheckOutCommon();
                this.accessCurrentCheckOutCommon();
                if(typeof saveCallback!='function'||saveCallback==undefined){
                  return false;
                }else{
                  saveCallback && saveCallback(true);
                }
              } else if(data.msgCode && (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE)) {
                let payload = {
                  msgCode: data.msgCode,
                  btnActions: {
                      btn1Click: () => {
                        this.refreshPageData(true);
                      }
                  }
                };
                dispatch(openCommonMessage(payload));
              }
            }
          });
        }
      }else{
        this.accessPastCheckOutCommon();
        this.accessCurrentCheckOutCommon();
        if(typeof saveCallback!='function'||saveCallback==undefined){
          return false;
        }else{
          saveCallback && saveCallback(true);
        }
      }
    }
  }


  handleCancelBtnSave = (isPastEncounter) => {
    const {dispatch,mainFrame}=this.props;
    const {tabsActiveKey}=mainFrame;
    let { editEncounterIds, isPastRecordEdit } = this.state;
    let pastSaveIsDisabled = this.saveBtnIsDisabled(true);
    let currentSaveIsDisabled = this.saveBtnIsDisabled(false);
    if (isPastEncounter) {
      // if (isPastRecordEdit) {
      if (!pastSaveIsDisabled) {
        dispatch({
          type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          payload:{
            msgCode:COMMON_CODE.SAVE_DIALOG_WARING,
            btnActions:{
              btn1Click: () => {
                let { params, inputAreaValMap, originPastNoteInfo } = this.state;
                inputAreaValMap.set(params.pastEncounterId,new Map());
                editEncounterIds.delete(params.pastEncounterId);
                this.setState({
                  pastSeed:Math.random(),
                  editEncounterIds,
                  inputAreaValMap,
                  pastNoteInfo: _.cloneDeep(originPastNoteInfo),
                  isPastRecordEdit:false
                });
              }
            }
          }
        });
      }
    } else {
      // if (editEncounterIds.size>0) {
      if (!currentSaveIsDisabled) {
        dispatch({
          type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
          payload:{
            msgCode:COMMON_CODE.SAVE_DIALOG_WARING,
            btnActions:{
              btn1Click: () => {
                if (tabsActiveKey == accessRightEnum.patientSpec){
                  dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:accessRightEnum.clinicalNote});
                }else{
                  dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
                }
              }
            }
          }
        });
      } else {
        if (tabsActiveKey == accessRightEnum.patientSpec){
          dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:accessRightEnum.clinicalNote});
        }else{
          dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
        }
      }
    }
    this.accessPastCheckOutCommon();
    if(!isPastEncounter){
      this.accessCurrentCheckOutCommon();
    }
  }

  accessCurrentCheckOutCommon = () => {
    this.currentTimer && clearTimeout(this.currentTimer);
    !this.state.currentEditFlag && this.state.currentEditFlag!=='N' && this.state.params.currentEncounterId && this.accessCurrentCheckOut(this.state.params.currentEncounterId);
  }

  accessPastCheckOutCommon = () => {
    this.pastTimer && clearTimeout(this.pastTimer);
    !this.state.pastEditFlag && this.state.pastEditFlag!=='N' && this.state.params.pastEncounterId && this.accessPastCheckOut(this.state.params.pastEncounterId);
  }

  saveBtnIsDisabled = (isPastEncounter) => {
    let { pastNoteInfo, currentNoteInfo, inputAreaValMap } = this.state;
    let flag = true;
    let info = null;
    if (isPastEncounter) {
      info = pastNoteInfo;
    } else {
      info = currentNoteInfo;
    }
    if(info && inputAreaValMap.has(info.encounterId)){
      let noteValMap = inputAreaValMap.get(info.encounterId);
      let contents = info.contents;
      if(this.noteTypeAddIsDisabled(noteValMap)){
        return false;
      }else{
        for (let index = 0; index < contents.length; index++) {
          let notes = contents[index].notes;
          for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
            if(noteValMap.has(notes[noteIndex].clinicalnoteId) && noteValMap.get(notes[noteIndex].clinicalnoteId).clinicalnoteText!==undefined){
              let text = notes[noteIndex].clinicalnoteText;
              if(text !== noteValMap.get(notes[noteIndex].clinicalnoteId).clinicalnoteText.trim()){
                return false;
              }
            }
          }
        }
      }
    }
    return flag;
  }

  noteTypeAddIsDisabled = (noteValMap) => {
    let flag = false;
    for (let valWrapperObj of noteValMap.values()) {
      if((valWrapperObj.actionType==='I'||(!valWrapperObj.actionType&&valWrapperObj.version===null)) && valWrapperObj.clinicalnoteText.trim()!==''){
          flag = true;
          break;
      }
    }
    return flag;
  }

  insertClinicalnoteLog=(desc,apiName='', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F102', 'Clinical Note', desc, 'clinical-note', content);
  };

  handleBackClosePastEncounter = () =>{
    this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '<' (Close tab) button in past encounter`,'');
    this.setState({
      historySelected: [],
      originPastNoteInfo: null,
      pastNoteInfo: {},
      displayPastEncounterFlag: false,
      pastNoteChange: false
    });
  }

  getNoteTypes = () => {
    const { dispatch } = this.props;
    let params = {};
    dispatch({
      type: tagsActionTypes.GET_TAG_A_NOTE_TYPES,
      params,
      callback: (data) => {
        this.setState({
          tagANoteTypes: data //Current history
        });
      }
    });
  };

  render(){
    const {dispatch,loginInfo={}}=this.props;
    const {service={}}=loginInfo;
    const {selectedService,historySelected,inputAreaValMap,serviceOptions,clinicOptions,selectedClinic,encounterTypeOptions,noteTypeOptions,clinicIsDisabled,medicalRecords=[],tagNoteCheckedFlag,displayPastEncounterFlag,noteTypes,isPastRecordEdit,tagANoteTypes,historyErrMsg,currentClinicErrMsg,pastClinicErrMsg} =this.state;
    const medicalRecordProps={
      historySelected,
      tagNoteCheckedFlag,
      serviceOptions,
      encounterTypeOptions,
      noteTypeOptions,
      medicalRecords,
      currentService:selectedService,
      selectedEncounterTypes:this.state.selectedEncounterTypes,
      selectedNoteTypes:this.state.selectedNoteTypes,
      clinicOptions,
      currentClinic:selectedClinic,
      clinicIsDisabled,
      noteTypes,
      handleServiceChange:this.handleSwitchSelectedChange,
      handleEncounterTypeChange:this.handleSwitchSelectedChange,
      handleNoteTypeChange:this.handleSwitchSelectedChange,
      handleShowTagNoteChange:this.handleShowTagNoteChange,
      handleClincChange:this.handleSwitchSelectedChange,
      onSelectionChange:this.onSelectionChange,
      isPastRecordEdit,
      errorFlag: historyErrMsg
    };

    const topbarProps={
      dispatch,
      encounterDate: this.state.params.currentEncounterDate,
      patientKey: this.state.params.patientKey,
      encounterId: this.state.params.currentEncounterId,
      currentServiceCd: this.state.params.currentServiceCd,
      userLogName: this.state.userLogName,
      currentClinicCd:this.state.params.currentClinicCdTopbar,
      loginInfo
    };

    const commonEncounterProps = {
      editEncounterIds:this.state.editEncounterIds,
      originDrag:this.state.originDrag,
      dispatch,
      topbarProps,
      inputAreaValMap,
      latestCursor: this.state.latestCursor,
      params: this.state.params,
      updateState:this.updateState,
      handleClinicalNoteSave:this.handleClinicalNoteSave,
      handleClinicalNoteCancel:this.handleClinicalNoteCancel,
      saveBtnIsDisabled:this.saveBtnIsDisabled,
      insertClinicalnoteLog:this.insertClinicalnoteLog,
      handlePastClinicalNoteCancel:this.handlePastClinicalNoteCancel
    };

    const pastEncounterProps = {
      ...commonEncounterProps,
      displayPastEncounterFlag,
      isPastRecordEdit:this.state.isPastRecordEdit,
      seed:this.state.pastSeed,
      pastNoteInfo: this.state.pastNoteInfo,
      isPastEncounter: true,
      isAddDivFlag:service.serviceCd!==this.state.params.pastEncounterServiceCd?true:false,
      handleClosePastEncounter:this.handleClosePastEncounter,
      pastEditFlag:this.state.pastEditFlag,
      accessCheckIn:this.accessCheckIn,
      setPastTimeout:this.setPastTimeout,
      currentNoteInfo:this.state.currentNoteInfo,
      EINCancel:'ClinicalNote',
      errorFlag: pastClinicErrMsg
    };

    const currentEncounterProps = {
      ...commonEncounterProps,
      seed:this.state.currentSeed,
      isPastEncounter: false,
      currentNoteInfo:this.state.currentNoteInfo,
      currentEditFlag:this.state.currentEditFlag,
      pastNoteInfo: this.state.pastNoteInfo,
      EINCancel:'ClinicalNote',
      handleCloseTab:this.handleCloseTab,
      errorFlag: currentClinicErrMsg
    };

    const tagANotecommonEncounterProps = {
      dispatch,
      displayPastEncounterFlag,
      params: this.state.params,
      latestCursor: this.state.latestCursor,
      isEdit:this.state.isEdit,
      tagANoteTypes
    };

    const tagANotepastEncounterProps = {
      ...tagANotecommonEncounterProps,
      pastNoteInfo: this.state.pastNoteInfo,
      originPastNoteInfo: this.state.originPastNoteInfo,
      isPastEncounter: true,
      handleBackClosePastEncounter: this.handleBackClosePastEncounter,
      clinicalNoteUseFlag: true,
      insertClinicalnoteLog:this.insertClinicalnoteLog,
      EINCancel:'ClinicalNote'
    };

    return (
      <Grid container spacing={0} style={{height:'100%'}}>
        <Grid item xs style={{flex:'0 0 auto',width:400,background:'#ccc',height:'100%',border:'1px solid rgba(0, 0, 0, 0.5)'}}>
          <MuiThemeProvider theme={customTheme}>
            <MedicalRecord {...medicalRecordProps} height={'100%'}/>
          </MuiThemeProvider>
        </Grid>
        <Grid item xs container direction="column" justify="space-between" alignItems="stretch" style={{overflow:'auto',height:'100%'}}>
          <Grid item container style={{flex:'auto',padding:'0 12px',paddingLeft: 0,boxSizing:'border-box',overflow:'hidden',minWidth:600}}>
            {/* Special */}
            <Grid item xs={12} md={6} style={{paddingBottom:0,paddingRight:10,height:'100%',display:displayPastEncounterFlag?'block':'none'}}>
              {tagNoteCheckedFlag&&(historySelected.length>0?historySelected[0].taganoteId:false)?
                (<TagANoteEncounterNoteContainer key={this.state.pastSeed} {...tagANotepastEncounterProps}></TagANoteEncounterNoteContainer>):
                (<EncounterNoteContainer key={this.state.pastSeed} {...pastEncounterProps} />)
              }
            </Grid>
            {/* current */}
            <Grid item xs={12} md={displayPastEncounterFlag?6:12} style={{paddingBottom:0,height:'100%'}}>
              <EncounterNoteContainer key={this.state.currentSeed} {...currentEncounterProps} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service:state.login.service,
      clinic:state.login.clinic
    },
    common: state.common,
    mainFrame:state.mainFrame,
    encounter: state.patient.encounterInfo,
    patientInfo: state.patient.patientInfo,
    appointmentInfo: state.patient.appointmentInfo
  };
}

export default connect(mapStateToProps)(ClinicalNote);