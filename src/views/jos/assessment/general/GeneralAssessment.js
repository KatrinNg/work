/*
 * Front-end UI for load&save assessment readings
 * Load Field Dropdown List Action: [GeneralAssessment.js] componentDidMount
 * -> [assessmentAction.js] getFieldDropList
 * -> [assessmentSaga.js] getfielddroplist
 * -> Backend API = assessment/listCodeAssessmentDrop
 * Load Assessment Field Normal Range Action: [GeneralAssessment.js] componentDidMount -> loadData
 * -> [assessmentAction.js] getFieldNormalRangeList
 * -> [assessmentSaga.js] getFieldNormalRangeList
 * -> Backend API = assessment/listAssessmentNormalRange
 * Load Assessment Data Action: [GeneralAssessment.js] componentDidMount -> loadData
 * -> [assessmentAction.js] getPatientAssessmentList
 * -> [assessmentSaga.js] getPatientAssessmentListByServiceCd
 * -> Backend API = assessment/listCodeAssessmentAndFieldByServiceCd
 * Save Action: [GeneralAssessment.js] Save -> handleSave
 * -> [assessmentAction.js] updatePatientAssessment
 * -> [assessmentSaga.js] updatePatientAssessment
 * -> Backend API = assessment/saveAssessment
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MuiThemeProvider,createMuiTheme,Typography, withStyles, Card, CardContent } from '@material-ui/core';
import AssessmentGrid from '../components/AssessmentGrid';
import { cloneDeep, findIndex, find, isUndefined, isNull, toNumber, isEqual } from 'lodash';
import { updatePatientAssessment, getPatientAssessmentList, getFieldDropList, getFieldNormalRangeList, getAssessmentFieldMappingList } from '../../../../store/actions/assessment/assessmentAction';
import { openErrorMessage, openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { styles } from './GeneralAssessmentStyle';
import { OBJ_TYPE,DATA_TYPE } from '../../../../constants/assessment/assessmentConstants';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { deleteSubTabs, updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import Container from 'components/JContainer';
import { openCommonMessage,closeCommonMessage } from '../../../../store/actions/message/messageAction';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import _ from 'lodash';

class GeneralAssessment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      assessmentItems: [],
      originAssessmentItems: [],
      fieldValMap: new Map(),
      resultMap: new Map(),
      versionMap: new Map(),
      createdByMap: new Map(),
      createdDtmMap: new Map(),
      fieldDefaultMap: new Map(),
      deleteItemMap: [],
      saveFlag: true,
      saveBpFlag: true,
      contentHeight: undefined
    };
  }

  componentDidMount() {
    const { loginInfo,patientInfo } = this.props;
    this.props.ensureDidMount();
    this.resetHeight();
    window.addEventListener('resize', this.resetHeight);
    this.props.getAssessmentFieldMappingList({
      params: {serviceCd: loginInfo.service.code},
      callback: data => {
        this.setState({fieldDefaultMap: data});
      }
    });
    this.props.getFieldDropList({
      params: {},
      callback: () => {
        this.loadData();
      }
    });
    if (this.props.saveParams !== undefined) {
      this.props.onRef('assessment', this);
    }
    this.insertGeneralAssessmentLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} General Assessment PMI: ${patientInfo.patientKey}`,'assessment/assessment/');
    this.props.updateCurTab(accessRightEnum.generalAssessment,this.doClose);
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { resultIdMap, versionMap, createdByMap, createdDtmMap } = this.props;
    if (!isEqual(nextProps.versionMap, versionMap)) {
      this.setState({
        versionMap: nextProps.versionMap
      });
    }
    if (!isEqual(nextProps.resultIdMap, resultIdMap)) {
      this.setState({
        resultIdMap: nextProps.resultIdMap
      });
    }
    if (!isEqual(nextProps.createdByMap, createdByMap)) {
      this.setState({
        createdByMap: nextProps.createdByMap
      });
    }
    if (!isEqual(nextProps.createdDtmMap, createdDtmMap)) {
      this.setState({
        createdDtmMap: nextProps.createdDtmMap
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetHeight);
  }

  resetHeight = _.debounce(() => {
    let screenHeight = document.documentElement.clientHeight;
    if (screenHeight > 0) {
      // Patient data height 327
      let contentHeight = screenHeight - 327;
      this.setState({ contentHeight });
    }
  });

  customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
      MuiCheckbox:{
        root:{
          margin:0,
          padding:'5px 14px'
        }
      },
      MuiOutlinedInput:{
        input:{
          padding:'0px 14px'
        }
      },
      MuiInputBase:{
        input:{
          height:'39px'
        }
      }
    }
  });

  loadData = () => {
    let { loginInfo, patientPanelInfo, encounterData } = this.props;
    //console.log(encounterData.encounterId);
    let month = this.caculateMonth(patientPanelInfo.dob);
    let age = this.caculateYear(patientPanelInfo.dob);
    this.props.getFieldNormalRangeList({
      params: {
        serviceCd: loginInfo.service.code,
        genderCd: patientPanelInfo.genderCd || 'U', // U: Unknown
        age: age,
        month:month
      }
    });
    this.props.getPatientAssessmentList({
      params: {
        encounterId: encounterData.encounterId || 0,
        clinicCd: loginInfo.clinic.code,
        serviceCd: loginInfo.service.code,
        genderCd: patientPanelInfo.genderCd || 'U' // U: Unknown
      },
      callback: () => {
        this.initAssessmentState();
      }
    });
  }

  caculateMonth = (dob) =>{
    let birthdayMonth = parseInt(dob.split('-')[0])+'/'+parseInt(dob.split('-')[1])+'/'+parseInt(dob.split('-')[2]);
    let birthdayDate = new Date(birthdayMonth);
    let currentDate = new Date();
    let currentMonth = (currentDate.getTime()- birthdayDate.getTime())/(24*60*60*30*1000);
    return  parseInt(currentMonth);
  }

  caculateYear = (dob) =>{
    let birthdayMonth = parseInt(dob.split('-')[0])+'/'+parseInt(dob.split('-')[1])+'/'+parseInt(dob.split('-')[2]);
    let birthdayDate = new Date(birthdayMonth);
    let currentDate = new Date();
    let currentYear = (currentDate.getTime()- birthdayDate.getTime())/(24*60*60*30*12*1000);
    return  parseInt(currentYear);
  }

  doClose = (callback, doCloseParams) => {
    let editFlag = this.state.isEdit;
    const { encounterData,patientInfo } = this.props;
    switch (doCloseParams.src) {
      case doCloseFuncSrc.CLOSE_BY_LOGOUT:
      case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
        if (editFlag) {
          this.props.openCommonMessage({
            msgCode: COMMON_CODE.SAVE_WARING,
            btn1AutoClose: false,
            btnActions: {
              btn1Click: () => {
                this.handleSave(callback);
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'General Assessment');
                this.insertGeneralAssessmentLog(`${name} PMI:${patientInfo.patientKey},EncounterId:${encounterData.encounterId}`,'assessment/assessment/');
              }, btn2Click: () => {
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'General Assessment');
                this.insertGeneralAssessmentLog(`${name} PMI:${patientInfo.patientKey},EncounterId:${encounterData.encounterId}`,'');
                callback(true);
                this.props.closeCommonMessage();
              }, btn3Click: () => {
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'General Assessment');
                this.insertGeneralAssessmentLog(`${name} PMI:${patientInfo.patientKey},EncounterId:${encounterData.encounterId}`, '');
              }
            }, params: [{ name: 'title', value: 'General Assessment' }]
          });
        } else {
          this.insertGeneralAssessmentLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close General Assessment`, '');
          callback(true);
        }
        break;
      case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
        editFlag ? this.handleSave(callback) : callback(true);
        break;
    }
  }

  initAssessmentState = () => {
    const { patientAssessmentList, patientAssessmentValMap, fieldDropList, resultIdMap, versionMap, createdByMap, createdDtmMap } = this.props;
    let originAssessmentItems = cloneDeep(patientAssessmentList);
    originAssessmentItems.forEach(element => {
      if (element.fields instanceof Array) {
        let fieldsArray = element.fields;
        fieldsArray.forEach((subFieldArray, rowId) => {
          subFieldArray.forEach(field => {
            //handle DL options
            if (field.codeObjectTypeCd === OBJ_TYPE.DROP_DOWN_LIST) {
              let dropOptionObj = find(fieldDropList, item => {
                return item.fieldId === field.codeAssessmentFieldId;
              });
              if (!isUndefined(dropOptionObj)) {
                field.dropDisabled = false;
                field.subSet = 0;  //default
                field.subSetOptions = dropOptionObj.subSet;
                for (let i = 0; i < dropOptionObj.subSet.length; i++) {
                  let optionObj = dropOptionObj.subSet[i];
                  if (!isNull(optionObj.dependedFieldId) && patientAssessmentValMap.has(element.codeAssessmentCd)) {
                    field.dropDisabled = true;
                    field.defaultDropDisabled = true; // default disabled flag
                    let vals = patientAssessmentValMap.get(element.codeAssessmentCd).get(optionObj.dependedFieldId);
                    if (toNumber(vals[rowId].val) === optionObj.dependedDropId) {
                      field.subSet = i;
                      field.dropDisabled = false;
                      break;
                    }
                  }
                }
              }
            }
          });
          //handle union unit
          let index = findIndex(subFieldArray, item => {
            return item.objUnit === '/';
          });
          if (index !== -1) {
            let tempField = subFieldArray[index + 1];
            subFieldArray.splice(index + 1, 1);
            subFieldArray[index].codeAssessmentFieldId2 = tempField.codeAssessmentFieldId;
            subFieldArray[index].codeObjectTypeCd2 = tempField.codeObjectTypeCd;
            subFieldArray[index].objUnit2 = tempField.objUnit;
          }
        });
      }
    });
    this.setState({
      assessmentItems: cloneDeep(originAssessmentItems),
      fieldValMap: cloneDeep(patientAssessmentValMap),
      resultMap: cloneDeep(resultIdMap),
      versionMap: cloneDeep(versionMap),
      createdByMap: cloneDeep(createdByMap),
      createdDtmMap: cloneDeep(createdDtmMap)
    });
  }

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  }

  errorValidation = () => {
    let { fieldValMap } = this.state;
    for (let fieldValues of fieldValMap.values()) {
      for (let values of fieldValues.values()) {
        values.forEach(valObj => {
          if (valObj.isError) {
            return false;
          }
        });
      }
    }
  }

  handleDeletItemsArray = (assessmentCd, fieldIds, fieldVersions) => {
    let { deleteItemMap } = this.state;
    let deleteItemsArray = {
      assessmentCd: assessmentCd,
      fieldIds: fieldIds,
      fieldVersions: fieldVersions
    };
    deleteItemMap.push(deleteItemsArray);
    this.setState({ deleteItemMap });
  }

  handleSave = (saveCallback) => {
    const { loginInfo, encounterData,patientPanelInfo } = this.props;
    let { fieldValMap, resultMap, versionMap, createdByMap, createdDtmMap, deleteItemMap, assessmentItems } = this.state;
    let resultObj = {
        encounterId: encounterData.encounterId || 0,
        encounterDate:encounterData.encounterDate,
        serviceCd: loginInfo.service.code,
        clinicCd: loginInfo.clinic.code,
        assessmentValueDtos: [],
        patientKey:patientPanelInfo.patientKey,
        deleteItems: deleteItemMap
    };

    for (let [codeAssessmentCd, fieldValues] of fieldValMap) {
      let assessmentResultObj = {
        codeAssessmentCd,
        fieldValueDtos: []
      };
      let tempAssessmentResultIdMap = resultMap.get(codeAssessmentCd);
      let tempVersionMap = versionMap.get(codeAssessmentCd);
      let tempCreatedByMap = createdByMap.get(codeAssessmentCd);
      let tempCreatedDtmMap = createdDtmMap.get(codeAssessmentCd);

      for (let [fieldId, values] of fieldValues) {
        //check error
        let indexError = findIndex(values, valObj => {
          return valObj.isError === true;
        });

        let isRequiredVal = 1;
        let assessmentDataTypeName = '';
        let isRequiredFlagId = 0;
        outer:
        for (let index = 0; index < assessmentItems.length; index++) {
          let element = assessmentItems[index];
          if (element.codeAssessmentCd === codeAssessmentCd) {
            for (let indexRow = 0; indexRow < element.fields[0].length; indexRow++) {
              let e = element.fields[0][indexRow];
              isRequiredFlagId =  e.codeAssessmentFieldId;
              if (e.dataType === DATA_TYPE.DOUBLE) {
                assessmentDataTypeName = 'assessment_field_double';
              } else if (e.dataType === DATA_TYPE.INTEGER) {
                assessmentDataTypeName = 'assessment_field_integer';
              } else if (e.dataType === DATA_TYPE.STRING) {
                assessmentDataTypeName = 'assessment_field_string';
              } else if (e.dataType === DATA_TYPE.TIME) {
                assessmentDataTypeName = 'assessment_field_time';
              }
              if (fieldId === e.codeAssessmentFieldId || fieldId === e.codeAssessmentFieldId2) {
                isRequiredVal = element.fields[0][indexRow].nullable;
                break outer;
              }
            }
          }
        }
        //check nullable field.
        let isRequired = findIndex(values, valObj => {
          return isRequiredVal === commonConstants.NULLABLE_STATUS.NOT_ALLOW_NULL && valObj.val === '';
        });
        if (indexError === -1) {
          if (isRequired !== -1) {
            let payload = {
              msgCode: '101814',
              btnActions: { btn1Click: () => { } }
            };
            document.getElementById(`${assessmentDataTypeName}_${isRequiredFlagId}_${isRequired}`).focus();
            this.props.dispatch(openCommonMessage(payload));
            this.setState({ saveFlag: false });
            return;
          }
          let resultArray = [];
          values.forEach(valObj => {
            resultArray.push(valObj.val);
          });
          assessmentResultObj.fieldValueDtos.push({
            codeAssessmentFieldId: fieldId,
            assessmentResults: resultArray,
            resultIds: tempAssessmentResultIdMap.get(fieldId),
            version: tempVersionMap.get(fieldId),
            createdBys: tempCreatedByMap.get(fieldId),
            createdDtms: tempCreatedDtmMap.get(fieldId)
          });
        } else {
          let payload = {
            msgCode: '101814',
            btnActions: { btn1Click: () => { } }
          };
          document.getElementById(`${assessmentDataTypeName}_${isRequiredFlagId}_${indexError}`).focus();
          this.props.dispatch(openCommonMessage(payload));
          this.setState({ saveFlag: false });
          return;
        }
      }
      //filter
      if (assessmentResultObj.fieldValueDtos.length > 0) {
        let index = findIndex(assessmentResultObj.fieldValueDtos, fieldValDto => {
          let resultIndex = findIndex(fieldValDto.assessmentResults, valResult => valResult !== '');
          let versionIndex = findIndex(fieldValDto.version, tempVersion => tempVersion !== null);
          if (resultIndex !== -1) {
            return true;
          } else {
            return versionIndex !== -1;
          }
        });
        if (index !== -1) {
          resultObj.assessmentValueDtos.push(assessmentResultObj);
        }
      }
    }

    let isRequiredFlagId = 0;
    let isRequiredVal = 0;
    let saveBoolApi = true;
    outer:
    for (let [codeAssessmentCd, fieldValues] of fieldValMap) {
      if (codeAssessmentCd === 'BP') {
        for (let [fieldId, values] of fieldValues) {
          for (let index = 0; index < assessmentItems.length; index++) {
            let element = assessmentItems[index];
            if (element.codeAssessmentCd === codeAssessmentCd) {
              for (let indexRow = 0; indexRow < element.fields[0].length; indexRow++) {
                let elementType = element.fields[0][indexRow];
                for (let indexNum = 0; indexNum < values.length; indexNum++) {
                  let elementNum = values[indexNum];
                  if (elementType.dataType === DATA_TYPE.INTEGER && elementNum.bpError) {
                    isRequiredFlagId = fieldId;
                    isRequiredVal = indexNum;
                    saveBoolApi = false;
                    break outer;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (saveBoolApi) {
      // console.log('params', resultObj);
      this.props.openCommonCircularDialog();
      this.props.updatePatientAssessment({
        params: resultObj,
        callback: (msgCode) => {
          if (msgCode) {
            let payload = {
              msgCode: msgCode,
              btnActions:
              {
                btn1Click: () => {
                  this.refreshPageData(resultObj, saveCallback, false);
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.dispatch(openCommonMessage(payload));
          } else {
            this.refreshPageData(resultObj, saveCallback, true);
          }
          this.props.closeCommonCircularDialog();
        }
      });
    } else {
      document.getElementById(`assessment_field_integer_${isRequiredFlagId}_${isRequiredVal}`).focus();
      let payload = { msgCode: '101814', btnActions: { btn1Click: () => { } } };
      this.props.dispatch(openCommonMessage(payload));
    }
  }

  refreshPageData = (resultObj,saveCallback,isErrorInfo) => {
    let boolClose = this.doCloseVerifyBool(isErrorInfo);
    this.setState({ isEdit: false, deleteItemMap: [] });
    this.props.closeCommonCircularDialog();
    this.loadData();
    if (typeof saveCallback != 'function' || saveCallback == undefined) {
      this.insertGeneralAssessmentLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button PMI:${resultObj.patientKey},EncounterId:${resultObj.encounterId}`, 'assessment/assessment/');
      return false;
    } else {
      if(boolClose){
        saveCallback && saveCallback(boolClose);
      }
    }
  }

  getSaveProps = () => {
    const { loginInfo, encounterData } = this.props;
    let { fieldValMap, resultMap, versionMap, createdByMap, createdDtmMap } = this.state;

    let resultObj = {
      encounterId: encounterData.encounterId || 0,
      serviceCd: loginInfo.service.code,
      clinicCd: loginInfo.clinic.code,
      assessmentValueDtos: []
    };

    for (let [codeAssessmentCd, fieldValues] of fieldValMap) {
      let assessmentResultObj = {
        codeAssessmentCd,
        fieldValueDtos: []
      };
      let tempAssessmentResultIdMap = resultMap.get(codeAssessmentCd);
      let tempVersionMap = versionMap.get(codeAssessmentCd);
      let tempCreatedByMap = createdByMap.get(codeAssessmentCd);
      let tempCreatedDtmMap = createdDtmMap.get(codeAssessmentCd);
      for (let [fieldId, values] of fieldValues) {
        //check error
        let index = findIndex(values, valObj => {
          return valObj.isError === true;
        });
        if (index === -1) {
          let resultArray = [];
          values.forEach(valObj => {
            resultArray.push(valObj.val);
          });
          assessmentResultObj.fieldValueDtos.push({
            codeAssessmentFieldId: fieldId,
            assessmentResults: resultArray,
            resultIds: tempAssessmentResultIdMap.get(fieldId),
            version: tempVersionMap.get(fieldId),
            createdBys: tempCreatedByMap.get(fieldId),
            createdDtms: tempCreatedDtmMap.get(fieldId)
          });
        } else {
          return;
        }
      }
      resultObj.assessmentValueDtos.push(assessmentResultObj);
    }
    return resultObj;
  }

  handleFunctionClose = () => {
    this.props.deleteSubTabs(accessRightEnum.generalAssessment);
  }

  insertGeneralAssessmentLog = (desc, apiName = '',content='') => {
    commonUtils.commonInsertLog(apiName, 'F104', 'GeneralAssessment', desc, 'assessment',content);
  };

  handleCancelLog = (name, apiName = '') => {
    const { encounterData,patientInfo } = this.props;
    this.insertGeneralAssessmentLog(`${name} PMI:${patientInfo.patientKey},EncounterId:${encounterData.encounterId}`, apiName);
  };
  handleButtonFieIdLog=()=>{
    const { encounterData,patientInfo } = this.props;
    this.setState({isEdit:true});
    this.insertGeneralAssessmentLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add default value to Urinel' button PMI:${patientInfo.patientKey},EncounterId:${encounterData.encounterId}`,'assessment/assessment/');
  }

  doCloseVerifyBool = (isErrorInfo) => {
    let booFlag = true;
    let { fieldValMap, assessmentItems, saveBpFlag } = this.state;
    for (let [codeAssessmentCd, fieldValues] of fieldValMap) {
      for (let [fieldId, values] of fieldValues) {
        let indexError = findIndex(values, valObj => {
          return valObj.isError === true;
        });
        let isRequiredVal = 1;
        outer:
        for (let index = 0; index < assessmentItems.length; index++) {
          let element = assessmentItems[index];
          if (element.codeAssessmentCd === codeAssessmentCd) {
            for (let indexRow = 0; indexRow < element.fields[0].length; indexRow++) {
              let e = element.fields[0][indexRow];
              if (fieldId === e.codeAssessmentFieldId || fieldId === e.codeAssessmentFieldId2) {
                isRequiredVal = element.fields[0][indexRow].nullable;
                break outer;
              }
            }
          }
        }
        let isRequired = findIndex(values, valObj => {
          return isRequiredVal === commonConstants.NULLABLE_STATUS.NOT_ALLOW_NULL && valObj.val === '';
        });
        if (indexError === -1) {
           //必填项验证
          if (isRequired !== -1) {
            booFlag = false;
            return booFlag;
          }
        } else {
          //文本框double,int验证,error例如@,text等
          booFlag = false;
          return booFlag;
        }
      }
    }
    //BP一个值输入另一个值不输入弹出错误，两个user更改数据，刷新弹出提示
    if (!saveBpFlag || !isErrorInfo) { booFlag = false; }
    return booFlag;
  }
  render() {
    const {
      classes,
      outputAssesmentFieldMap,
      cascadeDropMap,
      emptyCascadeFieldMap,
      fieldNormalRangeMap,
      encounterData,
      patientInfo
    } = this.props;
    let {
      assessmentItems,
      fieldValMap,
      resultMap,
      versionMap,
      createdByMap,
      createdDtmMap,
      fieldDefaultMap,
      saveFlag,
      saveBpFlag,
      contentHeight
    } = this.state;

    let gridProps = {
      patientInfo,
      assessmentItems,
      fieldDefaultMap,
      fieldValMap,
      outputAssesmentFieldMap,
      cascadeDropMap,
      emptyCascadeFieldMap,
      fieldNormalRangeMap,
      resultMap,
      versionMap,
      createdByMap,
      createdDtmMap,
      updateState: this.updateState,
      encounterId: encounterData.encounterId || 0,
      saveFlag,
      saveBpFlag,
      insertGeneralAssessmentLog:this.insertGeneralAssessmentLog,
      handleButtonFieIdLog:this.handleButtonFieIdLog,
      handleDeletItemsArray:this.handleDeletItemsArray
    };

    const buttonBar = {
      isEdit: this.state.isEdit,
      saveFuntion:this.handleSave,
      handleCancelLog: this.handleCancelLog,
      title:'General Assessment',
      logSaveApi:'assessment/assessment/',
      position: 'fixed',
      autoCloseBtn1:false,
      buttons: [{
        title: 'Save',
        onClick: this.handleSave,
        id: 'default_save_button'
      }]
    };

    let encounterDesc = commonUtils.getCurrentEncounterDesc();
    return (
      <MuiThemeProvider theme={this.customTheme}>
        <Container buttonBar={buttonBar}>
          <Card className={classes.card} style={{ height: '99%', boxSizing: 'border-box',margin:'5px 5px 0px 5px'}}>
            <CardContent className={classes.cardContent}>
              {/* title */}
              <Typography component="div">
                <div className={classes.fontTitle}>
                  <p className={classes.title}>{encounterDesc}</p>
                </div>
              </Typography>
              {/* assessment grid */}
              <div className={'nephele_content_body ' + classes.gridWrapper}>
                <Typography component="div" style={{ height: contentHeight }}>
                  <AssessmentGrid {...gridProps} />
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Container>
      </MuiThemeProvider>
    );
  }
}

const mapStatesToProps = state => {
  return {
    loginInfo: {
      // ...state.login.loginInfo,
      service: {
        code: state.login.service.serviceCd
      },
      clinic: {
        code: state.login.clinic.clinicCd
      }
    },
    encounterData: state.patient.encounterInfo,
    patientPanelInfo: state.patient.patientInfo,
    patientAssessmentList: state.assessment.patientAssessmentList,
    assessmentDrop: state.assessment.assessmentDrop,
    patientAssessmentValMap: state.assessment.patientAssessmentValMap,
    outputAssesmentFieldMap: state.assessment.outputAssesmentFieldMap,
    fieldDropList: state.assessment.fieldDropList,
    cascadeDropMap: state.assessment.cascadeDropMap,
    emptyCascadeFieldMap: state.assessment.emptyCascadeFieldMap,
    fieldNormalRangeMap: state.assessment.fieldNormalRangeMap,
    resultIdMap: state.assessment.resultIdMap,
    versionMap: state.assessment.versionMap,
    createdByMap: state.assessment.createdByMap,
    createdDtmMap: state.assessment.createdDtmMap,
    patientInfo: state.patient.patientInfo,
    common: state.common
  };
};

const mapDispatchToProps = {
  getPatientAssessmentList,
  updatePatientAssessment,
  getFieldDropList,
  getFieldNormalRangeList,
  openErrorMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  deleteSubTabs,
  updateCurTab,
  openCommonMessage,
  closeCommonMessage,
  getAssessmentFieldMappingList
};

export default connect(mapStatesToProps, mapDispatchToProps)(withStyles(styles)(GeneralAssessment));
