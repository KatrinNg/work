import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { openCommonMessage,closeCommonMessage } from '../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../store/actions/common/commonAction';
import MedicalRecord from './MedicalRecord';
import * as tagsActionTypes from '../../../store/actions/tagaNote/tagaNoteActionType';
import _ from 'lodash';
import { UPDATE_CURRENT_TAB } from '../../../store/actions/mainFrame/mainFrameActionType';
import { COMMON_CODE } from '../../../constants/message/common/commonCode';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as messageType from '../../../store/actions/message/messageActionType';
import EncounterNoteContainer from './modules/EncounterNoteContainer/EncounterNoteContainer';
import TagContainer from './modules/TagContainer/TagContainer';
import { CLINICALNOTE_CODE } from '../../../constants/message/clinicalNoteCode';
import * as commonActionType from '../../../store/actions/common/commonActionType';
import * as actionTypes from '../../../store/actions/clinicalNote/clinicalNoteActionType';
import EncounterClinicalContainer from '../clinicalNote/modules/EncounterNoteContainer/EncounterNoteContainer';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import { CLINICAL_NOTE_FAIL_CONNECT } from '../../../constants/clinicalNote/clinicalNoteConstants';

const customTheme = (theme) => {
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiMenu: {
        paper: {
          backgroundColor: theme.palette.cimsBackgroundColor
        }
      },
      MuiInputBase: {
        multiline: {
          height: '100%'
        },
        inputMultiline: {
          height: '100%'
        }
      },
      MuiBottomNavigation: {
        root: {
          height: '36px',
          '& .Mui-disabled': {
            color: '#ccc'
          }
        }
      },
      MuiBottomNavigationAction: {
        wrapper: {
          flexDirection: 'inherit'
        }
      },
      MuiButtonGroup: {
        contained: {
          boxShadow: 'note'
        }
      },
      MuiButton: {
        label: {
          fontSize: '0.8125rem'
        }
      },
      MuiInputLabel: {
        outlined: {
          display: 'inherit'
        },
        shrink: {
          color: `${theme.palette.cimsLabelColor} !important`
        }
      },
      MuiFormLabel:{
        root:{
          color: theme.palette.cimsPlaceholderColor
        }
      }
    }
  });
};

class TagANote extends Component {
  constructor(props) {
    super(props);
    const { loginInfo = {}, common, patientInfo } = props;
    const { service = {}, userRoleType  } = loginInfo;
    let clinic  = loginInfo.clinic;
    const { serviceList, clinicConfig } = common;
    const { patientKey } = patientInfo;
    // Generate Service Dropdown List
    let defaultOption = [{value:'ALL' , title: 'ALL'}];
    let currentSearch = clinicConfig.DEFAULT_SHOW_CLINICALNOTE === undefined ? [] : clinicConfig.DEFAULT_SHOW_CLINICALNOTE;
    let booShow = false;
    for (let index = 0; index < currentSearch.length; index++) {
      const element = currentSearch[index];
      if (element.serviceCd === loginInfo.service.serviceCd) {
        booShow = _.toUpper(element.paramValue) === 'Y' ? true : false;
        break;
      }
    }
    let services = serviceList.map((item) => {
      return { value: item.serviceCd, title: item.serviceName };
    });
    services=defaultOption.concat(services);
    let owneClinic = commonUtils.getOwnClinic();
    this.dragTargetContentType = '';
    this.state = {
      params: {
        currentServiceCd: service.serviceCd,
        currentClinicCd: owneClinic?owneClinic:clinic.clinicCd,
        pastPatientKey: null,
        clinicCd:owneClinic?owneClinic:clinic.clinicCd,
        serviceCd: '',
        userRoleType, //common
        patientKey
      },
      templateOpen: false,
      userLogName: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
      isContentEdit: false,
      isContentRightEdit:false,
      noteCardTypeFlag: false,
      noteHistorys: [], //origin
      medicalRecords: [], //filter history
      serviceOptions: services,
      // clinicOptions:clinicOption,
      //temporary change
      tagNoteCheckedFlag: booShow,
      originCurrentNoteInfo: null,
      currentNoteInfo: {
        taganoteType:'',
        taganoteTypeDesc: '',
        taganoteTitle:'',
        taganoteText:'',
        serviceCd:service.serviceCd,
        patientKey
      },
      originPastNoteInfo: null,
      pastNoteInfo: null,
      displayPastEncounterFlag: false,
      historySelected: [],
      latestCursor: null,
      pastNoteChange: false,
      currentNoteChange: false,
      taganoteTypeTmp:null,
      taganoteTypeDescTmp:null,
      taganoteTitleTmp:null,
      taganoteTextTmp:null,
      falg:false,
      showNoteType:true,
      typeFlag:false,
      titleFlag:false,
      currentServiceAndClinic:false,
      loginInfo,
      tagANoteTypes: [],
      tagANoteTypesLoadData: [],
      tagANoteTypesList:[],
      noteTypeOptions: [],
      tagANoteDefaultType:null,
      historyErrMsg: false,
      clinicErrMsg: false
    };
  }

  componentWillMount() {
    this.insertEINLog(`Action：${commonConstants.INSERT_LOG_STATUS.Open} Encounter Independent Note`,'');
  }

  componentDidMount() {
    this.props.ensureDidMount();
    const { dispatch } = this.props;
    this.getNoteHistoryList();
    this.getNoteTypes();
    dispatch({
      type: UPDATE_CURRENT_TAB,
      name: accessRightEnum.tagANote,
      doCloseFunc: this.doCloseTab
    }); //关闭tab
  }

  initServiceListAndClinicList = (apiFunctionName, flag) =>{
    const { dispatch, patientInfo, loginInfo }=this.props;
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
        const currentServiceCd = this.state.params.serviceCd ? this.state.params.serviceCd : loginInfo.service.serviceCd;
        let clinicOptions = commonUtils.getClinicListByServiceCd(currentServiceCd);
        let serviceCdIsExist = _.find(serviceOptions,{ 'value': currentServiceCd });
        !flag && this.handleServiceChange(serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : currentServiceCd, false);
        this.setState({
          clinicOptions,
          serviceOptions
        });
      }
    });
  }

  doCloseTab = (callback, doCloseParams) => {
    const { dispatch } = this.props;
    let { currentNoteInfo, isContentRightEdit, isContentEdit } = this.state;
    let errorBool = false;
    if (currentNoteInfo.taganoteTitle !== '' || currentNoteInfo.taganoteText !== '') {
      errorBool = true;
    }
    let editFlag = isContentEdit || isContentRightEdit || errorBool;
    switch (doCloseParams.src) {
      case doCloseFuncSrc.CLOSE_BY_LOGOUT:
      case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
        if (editFlag) {
          dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
              msgCode: COMMON_CODE.SAVE_WARING,
              params: [{ name: 'title', value: 'Encounter Independent Note' }],
              btn1AutoClose: false,
              btnActions: {
                btn1Click: () => {
                  this.handleCancleBtnSave(callback);
                  let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Encounter Independent Note');
                  this.insertEINLog(name,'clinical-note/taganotes/');
                }, btn2Click: () => {
                  let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Encounter Independent Note');
                  this.insertEINLog(name,'');
                  callback(true);
                }, btn3Click: () => {
                  let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Encounter Independent Note');
                  this.insertEINLog(name, '');
                }
              }
            }
          });
        }
        else {
          callback(true);
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Encounter Independent Note`, '');
        }
        break;
      case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
        editFlag ? this.handleCancleBtnSave(callback) : callback(true);
        break;
    }
}

  getNoteHistoryList = () => {
    const { dispatch } = this.props;
    let params = {
      patientKey: this.state.params.patientKey,
      showChecked: this.state.tagNoteCheckedFlag ? 'Y' : 'N'
    };
    dispatch({
      type: tagsActionTypes.GET_TAG_A_NOTE_HISTORY_LIST,
      params,
      callback: (data, errMsg) => {
        let noteTypeServices = data.noteTypes.map((item) => {
          return { value: item.codeTaganoteTypeCd, title: item.typeDesc };
        });
        this.setState({
          noteHistorys: data.taganoteHistoryDtos,
          medicalRecords: data.taganoteHistoryDtos,
          noteTypes: data.codeClinicalNoteTypeDtos,
          tagANoteTypesList: noteTypeServices,
          tagANoteTypesLoadData: noteTypeServices,
          historyErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
        });
        this.initServiceListAndClinicList('/clinical-note/taganotes');
      }
    });
  };

  getNoteHistoryListResult = (serviceCd, clinicCd, noteTypeOptions, tagNoteCheckedFlag, initFlag) => {
    const { dispatch } = this.props;
    let resultRecords=[];
    let params={
      patientKey: this.state.params.patientKey,
      showChecked: tagNoteCheckedFlag ? 'Y' : 'N'
    };
    dispatch({
      type:tagsActionTypes.GET_TAG_A_NOTE_HISTORY_LIST,
      params,
      callback: (data, errMsg) => {
        // Note data Item
        let noteTypeServices = data.noteTypes.map((item) => {
          return { value: item.codeTaganoteTypeCd, title: item.typeDesc };
        });
        let dataResult = data.taganoteHistoryDtos;
        let noteTypeArr=[];
        let tagANoteTypesListResult = [];
        let optionValue = [];
        dataResult.forEach(item => {
          if (clinicCd !== 'ALL') {
            if (item.serviceCd === serviceCd && item.clinicCd === clinicCd) {
              let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
              if (total !== -1) {
                optionValue = noteTypeOptions;
                resultRecords.push(item);
              }
              noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
            }
          } else {
            if (item.serviceCd === serviceCd || serviceCd === clinicCd) {
              let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
              if (total !== -1) {
                optionValue = noteTypeOptions;
                resultRecords.push(item);
              }
              noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
            }
          }
        });
        for (let arrIndex = 0; arrIndex < noteTypeArr.length; arrIndex++) {
          let noteTypeObj = _.find(noteTypeServices, { 'value': noteTypeArr[arrIndex] });
          noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
        }
        if (tagANoteTypesListResult.length > 1) {
          tagANoteTypesListResult.sort(function (first, second) {
            if (first.value < second.value) {
              return -1;
            }
            if (first.value > second.value) {
              return 1;
            }
            return 0;
          });
        }
        this.setState({
          noteHistorys: dataResult,
          medicalRecords: resultRecords,
          tagANoteTypesList: tagANoteTypesListResult,
          tagANoteTypesLoadData: noteTypeServices,
          noteTypeOptions: optionValue,
          historyErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
        });
        // initFlag && this.initServiceListAndClinicList('/clinical-note/taganotes');
        if (optionValue.length === 0 || initFlag) {
          this.initServiceListAndClinicList('/clinical-note/taganotes');
        }
        if(!initFlag) {
          this.initServiceListAndClinicList('/clinical-note/taganotes',true);
        }
      }
    });
  }

  getNoteTypes = () => {
    const { dispatch } = this.props;
    const { currentNoteInfo } = this.state;
    let params = {};
    dispatch({
      type: tagsActionTypes.GET_TAG_A_NOTE_TYPES,
      params,
      callback: (data) => {
        // default type
        let taganoteType = '';
        let defaultNoteType = data.find(item => item.isDefault === 'Y');
        if (defaultNoteType) {
          taganoteType = defaultNoteType.codeTaganoteTypeCd;
          currentNoteInfo.taganoteType = taganoteType;
        }

        this.setState({
          tagANoteTypes: data, //Current history
          tagANoteDefaultType: taganoteType,
          currentNoteInfo : _.cloneDeep(currentNoteInfo)
        });
      }
    });
  };

  handleNoteTypeChange = (name, value) => {
    let { noteTypeOptions, params, noteHistorys,tagANoteTypesLoadData } = this.state;
    let resultRecords=[];
    noteHistorys.forEach(item => {
      let total = _.indexOf(value, item.taganoteType);
      if (
        (item.serviceCd === params.serviceCd || params.serviceCd === 'ALL') &&
        (item.clinicCd === params.clinicCd || params.clinicCd === 'ALL') &&
        (total !== -1 || value.length == 0)
      ) {
        resultRecords.push(item);
      }
    });
    this.setState({
      noteTypeOptions: value,
      medicalRecords: resultRecords
    });

    let nameResult = '';
    let fullName=[];
    tagANoteTypesLoadData.forEach(element => {
      let total = tagANoteTypesLoadData.length > 0 ? _.indexOf(value, element.value) : 0;
      if (total !== -1) {
        fullName.push(element.title);
      }
    });
    if (noteTypeOptions.length > value.length) {
      if (value.length == 0) {
        nameResult = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} all selected note type: note type desc in drop-down list`;
      } else {
        nameResult = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} selected note type: ${fullName} in drop-down list (Note Type code: ${value})`;
      }
    } else if (noteTypeOptions.length < value.length) {
      nameResult = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} note type: ${fullName} in drop-down list (Note Type code: ${value})`;
    }
    this.insertEINLog(nameResult, '');
  };

  handleServiceChange = (value, refreshFlag = true) => {
    let {params,serviceOptions,noteHistorys,tagANoteTypesLoadData }=this.state;
    let serviceItemName = '';
    for (let index = 0; index < serviceOptions.length; index++) {
      const element = serviceOptions[index];
      if (element.value === value) {
        serviceItemName = element.title;
        break;
      }
    }
    let clinicOptions = commonUtils.getClinicListByServiceCd(value);
    // let theClinicCd = !refreshFlag && params?.clinicCd ? params.clinicCd : (value === params.currentServiceCd ? params.currentClinicCd : 'ALL');
    let theClinicCd = value === params.currentServiceCd ? params.currentClinicCd : 'ALL';
    let resultRecords = [];
    let tagANoteTypesListResult = [];
    let noteTypeArr = [];
    noteHistorys.forEach(item => {
      if (theClinicCd !== 'ALL') {
        if (item.serviceCd === value && item.clinicCd === theClinicCd) {
          resultRecords.push(item);
          noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
        }
      } else {
        if (item.serviceCd === value || value === 'ALL') {
          resultRecords.push(item);
          noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
        }
      }
    });
    for (let arrIndex = 0; arrIndex < noteTypeArr.length; arrIndex++) {
      let noteTypeObj = _.find(tagANoteTypesLoadData, { 'value': noteTypeArr[arrIndex] });
      noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
    }
    if (tagANoteTypesListResult.length > 1) {
      tagANoteTypesListResult.sort(function (first, second) {
        if (first.value < second.value) {
          return -1;
        }
        if (first.value > second.value) {
          return 1;
        }
        return 0;
      });
    }
    this.setState({
      params: {
        ...params,
        serviceCd: value,
        clinicCd: theClinicCd
      },
      clinicOptions,
      pastNoteChange: false,
      medicalRecords: resultRecords,
      tagANoteTypesList: tagANoteTypesListResult,
      noteTypeOptions: []
    });
    let allItem = value === 'ALL' ? '' : `(Service code: ${value})`;
    this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} service: ${serviceItemName} in drop-down list ${allItem}`,'');
    this.handleClosePastEncounter();
  };

  handleClinicChange = (value) => {
    let { params, noteHistorys, tagANoteTypesLoadData } = this.state;
    let noteTypeArr = [];
    let resultRecords = [];
    let tagANoteTypesListResult = [];
    noteHistorys.forEach(item => {
      if ((item.clinicCd === value || value === 'ALL') && item.serviceCd === params.serviceCd) {
        resultRecords.push(item);
        noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
      }
    });
    for (let arrIndex = 0; arrIndex < noteTypeArr.length; arrIndex++) {
      let noteTypeObj = _.find(tagANoteTypesLoadData, { 'value': noteTypeArr[arrIndex] });
      noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
    }
    if (tagANoteTypesListResult.length > 1) {
      tagANoteTypesListResult.sort(function (first, second) {
        if (first.value < second.value) {
          return -1;
        }
        if (first.value > second.value) {
          return 1;
        }
        return 0;
      });
    }
    this.setState({
      params: {
        ...params,
        clinicCd: value
      },
      medicalRecords: resultRecords,
      tagANoteTypesList: tagANoteTypesListResult,
      noteTypeOptions: []
    });
    let allItem = value === 'ALL' ? '' : `(Clinic code: ${value})`;
    this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} clinic: ${value} in drop-down list ${allItem}`,'');
  };

  // TODO
  handleShowTagNoteChange = (event) => {
    let { pastNoteInfo } = this.state;
    this.handleBackClosePastEncounter(pastNoteInfo,this.showTagNoteChange,event.target.checked);
  };

  handleSwitchSelectedChange = (selectListName,value) => {
    if(selectListName === 'Service'){
      this.handleBackClosePastEncounter(true,this.handleServiceChange,value);
    }else if(selectListName === 'Clinic'){
      this.handleBackClosePastEncounter(true,this.handleClinicChange,value);
    }
  }

  showTagNoteChange = (value) =>{
    this.setState({ tagNoteCheckedFlag: value });
    let { params, noteTypeOptions } = this.state;
    this.getNoteHistoryListResult(params.serviceCd, params.clinicCd, noteTypeOptions, value, false);
    let name = value ? 'Check' : 'Uncheck';
    this.insertEINLog(`Action: ${name} 'Show Clinical Note' checkbox`,'clinical-note/taganotes/history');
  }

  onSelectionChange = (selected) => {
    const { dispatch } = this.props;
    let { pastNoteChange, taganoteTextTmp, taganoteTitleTmp, taganoteTypeTmp, taganoteTypeDescTmp, noteTypeOptions, tagNoteCheckedFlag, pastNoteInfo } = this.state;
    if (pastNoteChange) {
      let tagANote = pastNoteInfo;
      if (taganoteTextTmp != null) {
        tagANote.taganoteText = taganoteTextTmp;
      }
      if (taganoteTitleTmp != null) {
        tagANote.taganoteTitle = taganoteTitleTmp;
      }
      if (taganoteTypeTmp != null) {
        tagANote.taganoteType = taganoteTypeTmp;
        tagANote.taganoteTypeDesc = taganoteTypeDescTmp;
      }
      dispatch({
        type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
        payload: {
          msgCode: CLINICALNOTE_CODE.SWITCH_ENCOUNTER_CONFIRM,
          btnActions: {
            btn1Click: () => {
              if (pastNoteInfo.taganoteType === '') {
                this.setState({ noteCardTypeFlag: true });
                dispatch(closeCommonMessage());
              } else {
                // Save
                dispatch({
                  type: tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
                  params: tagANote,
                  callback: (data) => {
                    this.getNoteHistoryListResult(this.state.params.serviceCd, this.state.params.clinicCd, noteTypeOptions, tagNoteCheckedFlag);
                    this.switchNote(selected);
                    const payload = {
                      msgCode: data.msgCode,
                      showSnackbar: true
                    };
                    dispatch(openCommonMessage(payload));
                  }
                });
              }
            },
            btn2Click: () => {
              // Discard
              this.switchNote(selected);
            }
          }
        }
      });
    } else {
      this.switchNote(selected);
    }
  };

  switchNote = (selected) => {
    const { dispatch} = this.props;
    if (selected.length > 0) {
      let selectedRecord = selected[0];
      let currentServiceAndClinic=commonUtils.checkIsNotCurrentServiceAndClinic(selectedRecord.serviceCd,selectedRecord.clinicCd);
      let params = {
        taganoteId: selectedRecord.taganoteId
      };
      if (params.taganoteId !== 0) {
        if (this.state.tagNoteCheckedFlag) {
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} an EIN record in note history list (EIN ID: ${selectedRecord.taganoteId})`, 'clinical-note/taganotes');
        } else {
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} an note in note history list (EIN ID: ${selectedRecord.taganoteId})`,'clinical-note/taganotes');
        }
        dispatch({
          type: tagsActionTypes.GET_TAG_A_NOTE_BY_ID,
          params,
          callback: (data) => {
            let { params ,userLogName} = this.state;
            let pastNoteInfo = data;
            if(_.toUpper(pastNoteInfo.createBy)!=_.toUpper(userLogName)){
                currentServiceAndClinic=true;
            }
            this.setState({
              params: {
                ...params,
                pastPatientKey: selectedRecord.patientKey
              },
              historySelected: selected,
              displayPastEncounterFlag: true,
              originPastNoteInfo: _.cloneDeep(pastNoteInfo),
              pastNoteChange: false,
              isContentEdit:false,
              pastNoteInfo,
              showNoteType: true,
              currentServiceAndClinic,

              noteCardTypeFlag: false
            });
          }
        });
      }else{
        if (this.state.tagNoteCheckedFlag) {
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} an encounter in note history list (Encounter ID: ${selectedRecord.encounterId})`, '');
        } else {
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} an note in note history list (Encounter ID: ${selectedRecord.encounterId})`, '');
        }
        dispatch({
          type: actionTypes.GET_NOTE_BY_ENCOUNTER,
          params: {
            encounterId: selectedRecord.encounterId,
            userRoleTypeCd: this.state.params.userRoleType,
            selectedServiceCd: selectedRecord.serviceCd,
            selectedClinicCd: selectedRecord.clinicCd
          },
          callback:(data, errMsg)=>{
            let pastNoteInfo = {
              encounterId:selectedRecord.encounterId,
              encounterDate:selectedRecord.createDtm,
              encounterDesc:selectedRecord.encounterTypeDesc,
              contents:data||[]
            };
            this.setState({
              historySelected:selected,
              displayPastEncounterFlag:true,
              originPastNoteInfo: _.cloneDeep(pastNoteInfo),
              pastNoteInfo,
              showNoteType: false,
              currentServiceAndClinic,
              noteCardTypeFlag: false,
              clinicErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
            });
          }
        });
      }
    } else {
      let name='';
      let apiName='';
      let {historySelected,tagNoteCheckedFlag}=this.state;
      if (historySelected[0].taganoteId !== 0) {
        if (tagNoteCheckedFlag) {
          name = `Action：${commonConstants.INSERT_LOG_STATUS.Unselect} an EIN record in note history list (EIN ID：${historySelected[0].taganoteId})`;
          apiName = 'clinical-note/taganotes';
        } else {
          name = `Action: ${commonConstants.INSERT_LOG_STATUS.Unselect} an note in note history list (EIN ID: ${historySelected[0].taganoteId})`;
          apiName = 'clinical-note/taganotes';
        }
      } else {
        if (tagNoteCheckedFlag) {
          name = `Action: ${commonConstants.INSERT_LOG_STATUS.Unselect} an encounter in note history list (Encounter ID: ${historySelected[0].encounterId})`;
        } else {
          name = `Action: ${commonConstants.INSERT_LOG_STATUS.Unselect} an note in note history list (EIN ID: ${historySelected[0].encounterId})`;
        }
      }
      this.insertEINLog(name,apiName);
      this.setState({
        historySelected: [],
        originPastNoteInfo: null,
        pastNoteInfo: null,
        displayPastEncounterFlag: false,
        pastNoteChange: false,
        isContentEdit:false
      });
    }
  };

  handleClosePastEncounter = () => {
    this.setState({
      historySelected: [],
      originPastNoteInfo: null,
      pastNoteInfo: null,
      displayPastEncounterFlag: false,
      pastNoteChange: false,
      isContentEdit: false
    });
    this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '<' (Close tab button in past record)`,'');
  };

  handleClinicalNoteCancelResultEIN=()=>{
    this.setState({
      historySelected: [],
      originPastNoteInfo: null,
      pastNoteInfo: null,
      displayPastEncounterFlag: false,
      pastNoteChange: false,
      isContentEdit: false
    });
    this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button in past record`, '');
  }

  //EIN < icon
  handleBackClosePastEncounter = (isPastEncounter, method, val) => {
    const { dispatch } = this.props;
    const { pastNoteChange, tagNoteCheckedFlag, pastNoteInfo, taganoteTextTmp, taganoteTitleTmp, taganoteTypeTmp,taganoteTypeDescTmp, noteTypeOptions } = this.state;
    if (isPastEncounter && pastNoteChange) {
      if (taganoteTextTmp != null) {
        pastNoteInfo.taganoteText = taganoteTextTmp;
      }
      if (taganoteTitleTmp != null) {
        pastNoteInfo.taganoteTitle = taganoteTitleTmp;
      }
      if (taganoteTypeTmp != null) {
        pastNoteInfo.taganoteType = taganoteTypeTmp;
        pastNoteInfo.taganoteTypeDesc = taganoteTypeDescTmp;
      }
      dispatch({
        type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
        payload: {
          msgCode: CLINICALNOTE_CODE.SWITCH_ENCOUNTER_CONFIRM,
          btnActions: {
            btn1Click: () => {
              if (pastNoteInfo.taganoteType === '') {
                this.setState({ noteCardTypeFlag: true });
                dispatch(closeCommonMessage());
              } else {
                //Save
                dispatch({
                  type: tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
                  params: pastNoteInfo,
                  callback: (data) => {
                    this.getNoteHistoryListResult(this.state.params.serviceCd, this.state.params.clinicCd, noteTypeOptions, tagNoteCheckedFlag);
                    this.setState({
                      isContentEdit: false,
                      pastNoteChange: false
                    });
                    const payload = {
                      msgCode: data.msgCode,
                      showSnackbar: true
                    };
                    dispatch(openCommonMessage(payload));
                  }
                });
                method && method(val);
                this.handleClosePastEncounter();
              }
            },
            btn2Click: () => {
              // Discard
              this.setState({
                displayPastEncounterFlag: false,
                isContentEdit:false,
                pastNoteChange: false,
                noteCardTypeFlag:false
              });
              method && method(val);
              this.handleClosePastEncounter();
            }
          }
        }
      });
    } else {
      method && method(val);
      this.handleClosePastEncounter();
    }
  }

  updateState = (obj,fun) => {
    if(!fun) {
      this.setState({
        ...obj
      });
    } else {
      this.setState({
        ...obj
      },fun);
    }
  };

  handleClinicalNoteCancel = (isPastEncounter) => {
    let { originCurrentNoteInfo, originPastNoteInfo } = this.state;
    if (isPastEncounter) {
      this.setState({
        pastNoteInfo: _.cloneDeep(originPastNoteInfo)
      });
    } else {
      this.setState({
        currentNoteInfo: _.cloneDeep(originCurrentNoteInfo)
      });
    }
  };

  handleTagANoteSave = (tagANote) => {
    const { dispatch } = this.props;
    const { originPastNoteInfo,tagNoteCheckedFlag,currentNoteInfo,noteTypeOptions } = this.state;
    if (tagANote) {
      //中间项Save
      if (tagANote.version) {
        if (tagANote.taganoteText !== originPastNoteInfo.taganoteText || tagANote.taganoteTitle !== originPastNoteInfo.taganoteTitle || tagANote.taganoteType !== originPastNoteInfo.taganoteType) {
          dispatch({
            type: tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
            params: tagANote,
            callback: (data) => {
              let params = {
                showChecked: tagNoteCheckedFlag ? 'Y' : 'N',
                patientKey: this.state.params.patientKey
              };
              // Start
              dispatch({
                type: tagsActionTypes.GET_TAG_A_NOTE_HISTORY_LIST,
                params,
                callback: (dataList, errMsg) => {
                  let selectedRecord = dataList.taganoteHistoryDtos.filter((item) =>
                    item.taganoteId === tagANote.taganoteId
                  );
                  let noteTypeServices = dataList.noteTypes.map((item) => {
                    return { value: item.codeTaganoteTypeCd, title: item.typeDesc };
                  });
                  let resultRecords = [];
                  let optionValue = [];
                  let noteTypeArr = [];
                  let tagANoteTypesListResult = [];
                  let dataResult = dataList.taganoteHistoryDtos;
                  let serviceCd = this.state.params.serviceCd;
                  let clinicCd = this.state.params.clinicCd;
                  let theClinicCd = clinicCd ? clinicCd : (serviceCd === params.currentServiceCd ? params.currentClinicCd : 'ALL');
                  dataResult.forEach(item => {
                    if (theClinicCd !== 'ALL') {
                      if (item.serviceCd === serviceCd && item.clinicCd === clinicCd) {
                        let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                        if (total !== -1) {
                          optionValue = noteTypeOptions;
                          resultRecords.push(item);
                        }
                        noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                      }
                    } else {
                      if (item.serviceCd === serviceCd || serviceCd === theClinicCd) {
                        let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                        if (total !== -1) {
                          optionValue = noteTypeOptions;
                          resultRecords.push(item);
                        }
                        noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                      }
                    }
                  });
                  for (let arrIndex = 0; arrIndex < noteTypeArr.length; arrIndex++) {
                    let noteTypeObj = _.find(noteTypeServices, { 'value': noteTypeArr[arrIndex] });
                    noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
                  }
                  if (tagANoteTypesListResult.length > 1) {
                    tagANoteTypesListResult.sort(function (first, second) {
                      if (first.value < second.value) {
                        return -1;
                      }
                      if (first.value > second.value) {
                        return 1;
                      }
                      return 0;
                    });
                  }
                  this.setState({
                    noteHistorys: dataResult,
                    medicalRecords: resultRecords,
                    historySelected: selectedRecord,
                    tagANoteTypesList: tagANoteTypesListResult,
                    tagANoteTypesLoadData: noteTypeServices,
                    noteTypeOptions: optionValue,
                    pastNoteChange: false,
                    historyErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
                  });
                  if (optionValue.length === 0) {
                    this.initServiceListAndClinicList('/clinical-note/taganotes');
                  }
                }
              });
              // End
              this.setState({
                pastNoteInfo: data.data,
                originPastNoteInfo: tagANote,
                currentNoteInfo: _.cloneDeep(currentNoteInfo),
                isContentEdit: false
              });
              const payload = {
                msgCode: data.msgCode,
                showSnackbar: true
              };
              dispatch(openCommonMessage(payload));
              this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past record`, 'clinical-note/taganotes/');
            }
          });
        } else {
          this.setState({
            pastNoteInfo: _.cloneDeep(originPastNoteInfo)
          });
        }
      } else {
        //右侧项Save
        dispatch({
          type: tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
          params: tagANote,
          callback: (data) => {
            let { params } = this.state;
            this.getNoteHistoryListResult(params.serviceCd,params.clinicCd,noteTypeOptions,tagNoteCheckedFlag,false);
            currentNoteInfo.taganoteTitle = '';
            currentNoteInfo.taganoteText = '';
            this.setState({
                isContentRightEdit:false,
                currentNoteInfo : _.cloneDeep(currentNoteInfo)
              });
            const payload = {
              msgCode: data.msgCode,
              showSnackbar: true
            };
            dispatch(openCommonMessage(payload));
            this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past record`,'clinical-note/taganotes/');
          }
        });
      }
    }
  };

  handleCancleBtnSave = (saveCallback) => {
    const { dispatch, mainFrame } = this.props;
    const { subTabsActiveKey, tabsActiveKey } = mainFrame;
    let { noteCardTypeFlag,pastNoteInfo, pastNoteChange, currentNoteInfo, isContentRightEdit, taganoteTextTmp, taganoteTitleTmp, taganoteTypeTmp, taganoteTypeDescTmp, typeFlag, tagANoteDefaultType } = this.state;
    let isError = false;
    if (_.trim(currentNoteInfo.taganoteTitle) === '' && _.trim(currentNoteInfo.taganoteText) === '' && currentNoteInfo.taganoteType === '') {
      typeFlag = false;
    } else if (_.trim(currentNoteInfo.taganoteTitle) !== '' || _.trim(currentNoteInfo.taganoteText) !== '') {
      if (currentNoteInfo.taganoteType === '') {
        typeFlag = true;
      }
    }
    if (_.trim(currentNoteInfo.taganoteTitle) !== '' || _.trim(currentNoteInfo.taganoteText) !== '' || currentNoteInfo.taganoteType !== tagANoteDefaultType) {
      isError = true;
    }
    //中间项编辑状态下,没有相应选中的项,给出提示
    if (pastNoteInfo != null && pastNoteInfo.taganoteType === '') {
      noteCardTypeFlag = true;
    }
    if (pastNoteChange) {
      if (typeFlag) {
        this.setState({ typeFlag });
        dispatch(closeCommonMessage());
        saveCallback && saveCallback(false);
      } else if (noteCardTypeFlag) {
        this.setState({ noteCardTypeFlag });
        dispatch(closeCommonMessage());
        saveCallback && saveCallback(false);
      }
      else {
        //中间项保存
        if(taganoteTextTmp != null){
          pastNoteInfo.taganoteText=taganoteTextTmp;
        }
        if(taganoteTitleTmp != null){
          pastNoteInfo.taganoteTitle=taganoteTitleTmp;
        }
        if(taganoteTypeTmp != null){
          pastNoteInfo.taganoteType=taganoteTypeTmp;
          pastNoteInfo.taganoteTypeDesc = taganoteTypeDescTmp;
        }
        dispatch(openCommonCircularDialog());
        dispatch({
          type:tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
          params:pastNoteInfo,
          callback:(dataNote)=>{
            let dataMsgCode = dataNote.msgCode;
            //右侧是否填入值保存
            if (isError) {
              //---start---
              dispatch({
                type: tagsActionTypes.SAVE_A_TAG_NOTE_AGAIN,
                params: currentNoteInfo,
                callback: (currentData) => {
                  this.setState({
                    pastNoteChange: false,
                    currentNoteChange: false,
                    isContentEdit: false,
                    isContentRightEdit:false
                  });
                  dataMsgCode = currentData.msgCode;
                }
              });
              //---end---
            }
            let payload = {
              msgCode: dataMsgCode,
              showSnackbar: true
            };
            dispatch(closeCommonCircularDialog());
            dispatch(openCommonMessage(payload));
          }
        });
        if (tabsActiveKey == accessRightEnum.patientSpec) {
          dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: subTabsActiveKey });
        } else {
          dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
        }
        //执行关闭窗体
        if (typeof saveCallback != 'function' || saveCallback == undefined) {
          this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past record`,'clinical-note/taganotes/');
          return false;
        } else {
          saveCallback && saveCallback(true);
        }
      }
    } else {
      if (typeFlag) {
        this.setState({ typeFlag });
        dispatch(closeCommonMessage());
        saveCallback && saveCallback(false);
      } else {
        if (isContentRightEdit || isError) {
          dispatch(openCommonCircularDialog());
          dispatch({
            type: tagsActionTypes.SAVE_A_NEW_TAG_NOTE,
            params: currentNoteInfo,
            callback: (data) => {
              dispatch(closeCommonCircularDialog());
              let payload = {
                msgCode: data.msgCode,
                showSnackbar: true
              };
              dispatch(openCommonMessage(payload));
              if (tabsActiveKey == accessRightEnum.patientSpec) {
                dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: subTabsActiveKey });
              } else {
                dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
              }
              if (typeof saveCallback != 'function' || saveCallback == undefined) {
                this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button in past record`, 'clinical-note/taganotes/');
                return false;
              } else {
                saveCallback && saveCallback(true);
              }
            }
          });
        }
      }
    }
  }

  handleTagaNoteSaveAndPrint = (tagANote) => {
    const { dispatch } = this.props;
    let { currentNoteInfo,tagNoteCheckedFlag,noteTypeOptions, originPastNoteInfo } = this.state;
    if (tagANote) {
        tagANote.patientDto= commonUtils.reportGeneratePatientDto();
      if (tagANote.version) {
        //中间项Save & Print
        dispatch(openCommonCircularDialog());
        dispatch({
          type: tagsActionTypes.SAVE_AND_PRINT_TAG_A_NOTE,
          params: tagANote,
          callback: (data) => {
            const payload = {
              msgCode: '100418',
              showSnackbar: true
            };
            dispatch(openCommonMessage(payload));

            if (data.reportData) {
              let params = {
                base64: data.reportData,
                callback: this.handlePrintCallback
              };
              dispatch({ type: commonActionType.JOS_PRINT_START, params });
            }
            if (originPastNoteInfo) {
              //Start
              let params = {
                showChecked: tagNoteCheckedFlag ? 'Y' : 'N',
                patientKey: this.state.params.patientKey
              };
              dispatch({
                type: tagsActionTypes.GET_TAG_A_NOTE_HISTORY_LIST,
                params,
                callback: (dataList, errMsg) => {
                  let optionValue = [];
                  let noteTypeArr = [];
                  let resultRecords = [];
                  let tagANoteTypesListResult = [];
                  let selectedRecord = dataList.taganoteHistoryDtos.filter(
                    (item) => item.taganoteId === originPastNoteInfo.taganoteId
                  );
                  let noteTypeServices = dataList.noteTypes.map((item) => {
                    return { value: item.codeTaganoteTypeCd, title: item.typeDesc };
                  });
                  let dataResult = dataList.taganoteHistoryDtos;
                  let clinicCd = this.state.params.clinicCd;
                  let serviceCd = this.state.params.serviceCd;
                  dataResult.forEach(item => {
                    if (clinicCd !== 'ALL') {
                      if (item.serviceCd === serviceCd && item.clinicCd === clinicCd) {
                        let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                        if (total !== -1) {
                          optionValue = noteTypeOptions;
                          resultRecords.push(item);
                        }
                        noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                      }
                    } else {
                      if (item.serviceCd === serviceCd || serviceCd === clinicCd) {
                        let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                        if (total !== -1) {
                          optionValue = noteTypeOptions;
                          resultRecords.push(item);
                        }
                        noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                      }
                    }
                  });
                  for (let index = 0; index < noteTypeArr.length; index++) {
                    const element = noteTypeArr[index];
                    let noteTypeObj = _.find(noteTypeServices, { 'value': element });
                    noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
                  }
                  if (tagANoteTypesListResult.length > 1) {
                    tagANoteTypesListResult.sort(function (first, second) {
                      if (first.value < second.value) {
                        return -1;
                      }
                      if (first.value > second.value) {
                        return 1;
                      }
                      return 0;
                    });
                  }
                  dispatch(closeCommonCircularDialog());
                  this.setState({
                    noteHistorys: dataResult,
                    medicalRecords: resultRecords,
                    historySelected: selectedRecord,
                    tagANoteTypesList: tagANoteTypesListResult,
                    tagANoteTypesLoadData: noteTypeServices,
                    noteTypeOptions: optionValue,
                    historyErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
                  });
                  if (optionValue.length === 0) {
                    this.initServiceListAndClinicList('/clinical-note/taganotes');
                  }
                }
              });
              //End
            } else {
              dispatch(closeCommonCircularDialog());
              this.getNoteHistoryListResult(this.state.params.serviceCd, this.state.params.clinicCd, noteTypeOptions, tagNoteCheckedFlag, true);
            }
            this.setState({
              originPastNoteInfo: _.cloneDeep(tagANote),
              pastNoteInfo: data.taganoteDto,
              pastNoteChange: false,
              isContentEdit: false,
              currentNoteInfo: _.cloneDeep(currentNoteInfo)
            });
            this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Print' button in past record`,'clinical-note/reportTaganote');
          }
        });
      } else {
        //右侧Save & Print
        dispatch(openCommonCircularDialog());
        dispatch({
          type: tagsActionTypes.SAVE_AND_PRINT_TAG_A_NOTE,
          params: tagANote,
          callback: (data) => {
            //Start
            dispatch({
              type: tagsActionTypes.GET_TAG_A_NOTE_HISTORY_LIST,
              params: {
                showChecked: tagNoteCheckedFlag ? 'Y' : 'N',
                patientKey: this.state.params.patientKey
              },
              callback: (dataList, errMsg) => {
                let tagANoteTypesListResult = [];
                let resultRecords = [];
                let noteTypeArr = [];
                let selectedRecord = dataList.taganoteHistoryDtos.filter((item) =>
                  item.taganoteId === tagANote.taganoteId
                );
                let noteTypeServices = dataList.noteTypes === undefined ? [] : dataList.noteTypes.map((item) => {
                  return { value: item.codeTaganoteTypeCd, title: item.typeDesc };
                });
                let serviceCd = this.state.params.serviceCd;
                let clinicCd = this.state.params.clinicCd;
                let dataResult = dataList.taganoteHistoryDtos;
                dataResult.forEach(item => {
                  if (clinicCd !== 'ALL') {
                    if (item.serviceCd === serviceCd && item.clinicCd === clinicCd) {
                      let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                      if (total !== -1) {
                        resultRecords.push(item);
                      }
                      noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                    }
                  } else {
                    if (item.serviceCd === serviceCd || serviceCd === clinicCd) {
                      let total = noteTypeOptions.length > 0 ? _.indexOf(noteTypeOptions, item.taganoteType) : 0;
                      if (total !== -1) {
                        resultRecords.push(item);
                      }
                      noteTypeArr.indexOf(item.taganoteType) === -1 && item.taganoteType !== null ? noteTypeArr.push(item.taganoteType) : null;
                    }
                  }
                });
                for (let index = 0; index < noteTypeArr.length; index++) {
                  const element = noteTypeArr[index];
                  let noteTypeObj = _.find(noteTypeServices, { 'value': element });
                  noteTypeObj && tagANoteTypesListResult.push(noteTypeObj);
                }
                if (tagANoteTypesListResult.length > 1) {
                  tagANoteTypesListResult.sort(function (first, second) {
                    if (first.value < second.value) {
                      return -1;
                    }
                    if (first.value > second.value) {
                      return 1;
                    }
                    return 0;
                  });
                }
                this.initServiceListAndClinicList('/clinical-note/taganotes',true);
                currentNoteInfo.taganoteTitle = '';
                currentNoteInfo.taganoteText = '';
                this.setState({
                  noteHistorys: dataResult,
                  medicalRecords: resultRecords,
                  historySelected: selectedRecord,
                  tagANoteTypesList: tagANoteTypesListResult,
                  tagANoteTypesLoadData: noteTypeServices,
                  isContentRightEdit: false,
                  currentNoteInfo: _.cloneDeep(currentNoteInfo),
                  historyErrMsg: errMsg === CLINICAL_NOTE_FAIL_CONNECT.VACCINATION
                });
                dispatch(closeCommonCircularDialog());
                // this.initServiceListAndClinicList('/clinical-note/taganotes');
              }
            });
            const payload = {
              msgCode: '100418',
              showSnackbar: true
            };
            dispatch(openCommonMessage(payload));
            //End
            if (data.reportData) {
              let params = {
                base64: data.reportData,
                callback: this.handlePrintCallback
              };
              dispatch({ type: commonActionType.JOS_PRINT_START, params });
            }
          }
        });
        this.insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Print' button in past record`,'clinical-note/reportTaganote');
      }
    }
  };

  handleTagaNotePrint = (tagANote) => {
    const { dispatch } = this.props;
    if (tagANote) {
      tagANote.patientDto = commonUtils.reportGeneratePatientDto();
      if (tagANote.version) {
        // Print
        dispatch(openCommonCircularDialog());
        dispatch({
          type: tagsActionTypes.PRINT_TAG_A_NOTE,
          params: tagANote,
          callback: (data) => {
            if (data.reportData) {
              let params = {
                base64: data.reportData,
                callback: this.handlePrintCallback
              };
              dispatch({ type: commonActionType.JOS_PRINT_START, params });
            }
            dispatch(closeCommonCircularDialog());
          }
        });
      }
    }
  };

  handlePrintCallback = (flag) => {
    const { dispatch } = this.props;
    if (flag) {
      let payload = {
        msgCode: '101317',
        showSnackbar: true,
        params: [
          { name: 'reportType', value: 'report' }
        ]
      };
      dispatch(openCommonMessage(payload));
    } else {
      let payload = {
        msgCode: '101318',
        showSnackbar: true,
        params: [
          { name: 'reportType', value: 'report' }
        ]
      };
      dispatch(openCommonMessage(payload));
    }
  };

  insertEINLog=(desc, apiName='', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F100', 'Encounter Independent Note', desc, 'clinical-note', content);
  };

  render() {
    const { dispatch,loginInfo={} } = this.props;
    const {
      historySelected,
      serviceOptions,
      clinicOptions,
      noteTypeOptions,
      medicalRecords = [],
      tagANoteTypes = [],
      tagNoteCheckedFlag,
      displayPastEncounterFlag,
      falg,
      showNoteType,
      typeFlag,
      titleFlag,
      currentServiceAndClinic,
      noteTypes,
      tagANoteTypesList,

      pastNoteInfo,
      originPastNoteInfo,
      taganoteTypeTmp,
      taganoteTypeDescTmp,
      taganoteTitleTmp,
      taganoteTextTmp,
      currentNoteInfo,
      isContentRightEdit,
      noteCardTypeFlag,
      historyErrMsg,
      clinicErrMsg
    } = this.state;
    const medicalRecordProps = {
      falg,
      historySelected,
      tagNoteCheckedFlag,
      serviceOptions,
      clinicOptions,
      noteTypeOptions,
      medicalRecords,
      disabledClinic:this.state.params.serviceCd==='ALL'?true:false,
      currentService: this.state.params.serviceCd,
      currentClinicCd:this.state.params.clinicCd,
      handleServiceChange: this.handleSwitchSelectedChange,
      handleClinicChange:this.handleSwitchSelectedChange,
      handleNoteTypeChange: this.handleNoteTypeChange,
      handleShowTagNoteChange: this.handleShowTagNoteChange,
      onSelectionChange: this.onSelectionChange,
      noteTypes,
      tagANoteTypesList,
      errorFlag: historyErrMsg
    };

    const commonEncounterProps = {
      loginInfo,
      dispatch,
      displayPastEncounterFlag,
      params: this.state.params,
      latestCursor: this.state.latestCursor,
      updateState: this.updateState,
      handleTagANoteSave: this.handleTagANoteSave,
      handleTagaNoteSaveAndPrint: this.handleTagaNoteSaveAndPrint,
      handleTagaNotePrint: this.handleTagaNotePrint,
      handleClinicalNoteCancel: this.handleClinicalNoteCancel,
      isContentEdit:this.state.isContentEdit,
      // isRecordEdit: this.state.isRecordEdit,
      handleCancleBtnSave:this.handleCancleBtnSave,
      insertEINLog: this.insertEINLog,
      EINCancel: 'EINCancel'
    };

    const pastEncounterProps = {
      ...commonEncounterProps,
      pastNoteInfo: pastNoteInfo,
      originPastNoteInfo: originPastNoteInfo,
      isPastEncounter: true,
      tagANoteTypes: tagANoteTypes,
      taganoteTypeTmp:taganoteTypeTmp,
      taganoteTypeDescTmp: taganoteTypeDescTmp,
      taganoteTitleTmp:taganoteTitleTmp,
      taganoteTextTmp:taganoteTextTmp,
      handleBackClosePastEncounter: this.handleBackClosePastEncounter,
      currentServiceAndClinic,
      noteCardTypeFlag
    };

    const currentEncounterProps = {
      ...commonEncounterProps,
      isPastEncounter: false,
      tagANoteTypes: tagANoteTypes,
      currentNoteInfo: currentNoteInfo,
      isContentRightEdit: isContentRightEdit,
      typeFlag,
      titleFlag
    };

    const topbarProps={
      dispatch,
      patientKey: this.state.params.patientKey,
      currentServiceCd: this.state.params.currentServiceCd,
      userLogName: this.state.userLogName,
      loginInfo
    };

    const pastEncounterPropsInfo = {
      topbarProps,
      dispatch,
      params: this.state.params,
      isShowClinicalType:true,
      isPastEncounter: true,
      pastNoteInfo: pastNoteInfo,
      displayPastEncounterFlag,
      handlePastClinicalNoteCancel: this.handleClinicalNoteCancelResultEIN,
      handleClosePastEncounter: this.handleClosePastEncounter,
      insertEINLog: this.insertEINLog,
      EINCancel: 'EINCancel',
      errorFlag: clinicErrMsg
    };

    return (
      <Grid container spacing={0} style={{ height: '100%' }}>
        <Grid item xs style={{ flex:'0 0 auto',width:400,background: '#ccc', height: '100%', border:'1px solid rgba(0, 0, 0, 0.5)' }}>
          <MuiThemeProvider theme={customTheme}>
            <MedicalRecord {...medicalRecordProps} height={'100%'} />
          </MuiThemeProvider>
        </Grid>
        <Grid
            item
            xs
            // md={8}
            container
            direction="column"
            justify="space-between"
            alignItems="stretch"
            style={{ overflow: 'auto', height: '100%' }}
        >
          <Grid
              item
              container
              style={{
              flex: 'auto',
              padding: '0 12px',
              paddingLeft: 0,
              boxSizing: 'border-box',
              overflow: 'hidden',
              minWidth: 1000
            }}
          >
            {/* Special */}
            <Grid
                item
                xs={12}
                md={6}
                style={{
                paddingBottom: 0,
                paddingRight: 10,
                height: '100%',
                display: displayPastEncounterFlag ? 'block' : 'none'
              }}
            >
            {showNoteType?
              <EncounterNoteContainer {...pastEncounterProps} />:
              <EncounterClinicalContainer {...pastEncounterPropsInfo} />
            }
            </Grid>
            {/* current */}
            <Grid
                item
                xs={12}
                md={displayPastEncounterFlag ? 6 : 12}
                style={{ paddingBottom: 0, height: '100%' }}
            >
              {/* TestReuslt */}
              <TagContainer {...currentEncounterProps} />
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
      service: state.login.service,
      clinic: state.login.clinic
    },
    common: state.common,
    mainFrame: state.mainFrame,
    patientInfo: state.patient.patientInfo,
    appointmentInfo: state.patient.appointmentInfo,
    medicalRecords: state.clinicalNote.medicalListData,
    todayNotes: state.clinicalNote.todayClinicalNoteListData,
    subTabsActiveKey: state.mainFrame.subTabsActiveKey
  };
}

export default connect(mapStateToProps)(TagANote);
